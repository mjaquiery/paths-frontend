import { clearSession } from './authSession';
import { getEtag, setEtag } from './etagStore';

export interface CustomFetchOptions extends RequestInit {
  // Only fires for FormData bodies — fetch has no upload-progress hook, so this
  // path drops down to XMLHttpRequest instead.
  onUploadProgress?: (loaded: number, total: number) => void;
}

const NETWORK_ERROR_MESSAGE = 'network error';

// Sensible copy for known failure classes when the backend response carries
// no usable detail (e.g. an unhandled exception returning a bare 500) — this
// is what shows up after "Unable to <action>: " on a mobile-first UI, so it
// must never be a raw status code.
function fallbackReason(status: number): string {
  if (status === 401) return 'not signed in';
  if (status === 403) return 'access denied';
  if (status === 404) return 'not found';
  if (status === 409) return 'conflicting change';
  if (status >= 500) return 'internal server error';
  return `request failed (${status})`;
}

/** Pull a `detail`/`message`/`error` string out of a parsed JSON error body, if there is one. */
function detailFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const b = body as Record<string, unknown>;
  if (typeof b.detail === 'string') return b.detail;
  if (Array.isArray(b.detail)) {
    // FastAPI 422 validation errors: detail is a list of {loc, msg, type}.
    const msgs = b.detail
      .map((d) =>
        d && typeof d === 'object'
          ? (d as Record<string, unknown>).msg
          : undefined,
      )
      .filter((m): m is string => typeof m === 'string');
    if (msgs.length > 0) return msgs.join('; ');
  }
  if (typeof b.message === 'string') return b.message;
  if (typeof b.error === 'string') return b.error;
  return undefined;
}

async function detailFromResponse(
  response: Response,
): Promise<string | undefined> {
  if (typeof response.json !== 'function') return undefined;
  try {
    return detailFromBody(await response.json());
  } catch {
    // Not JSON (or empty body) — e.g. a plain-text 500 from an unhandled
    // exception with no custom error handler.
    return undefined;
  }
}

export class ApiError extends Error {
  status: number;
  /** Backend-provided detail text, when the response body had one. */
  detail?: string;

  constructor(status: number, detail?: string) {
    super(detail ?? fallbackReason(status));
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export const customFetch = async <T>(
  url: string,
  options?: CustomFetchOptions,
): Promise<T> => {
  const baseUrl = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  ).replace(/\/$/, '');

  const storedToken =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('session_token')
      : null;
  const authHeader: Record<string, string> = storedToken
    ? { Authorization: `Bearer ${storedToken}` }
    : {};

  // FormData bodies (multipart entry create/update) must NOT get an explicit Content-Type:
  // fetch/XHR set one themselves, including the required multipart boundary. Setting it
  // manually here would produce a malformed multipart request the server can't parse.
  const isFormData = options?.body instanceof FormData;

  const method = (options?.method ?? 'GET').toUpperCase();
  const isConditionalGet = method === 'GET';
  const fullUrl = `${baseUrl}${url}`;
  const cached = isConditionalGet ? await getEtag(fullUrl) : undefined;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...authHeader,
    ...(cached ? { 'If-None-Match': cached.etag } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.onUploadProgress && isFormData) {
    return uploadWithProgress<T>(fullUrl, options, headers);
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
  if (response.status === 304 && cached) {
    // Server confirmed our cached body is still current — resolve as a normal
    // 200 rather than surfacing 304 to callers, who never asked to see it.
    return { data: cached.body, status: 200, headers: response.headers } as T;
  }
  if (!response.ok) {
    const detail = await detailFromResponse(response);
    if (response.status === 401) clearSession();
    throw new ApiError(response.status, detail);
  }
  const data = response.status === 204 ? undefined : await response.json();
  const etag = response.headers.get('ETag');
  if (isConditionalGet && etag) await setEtag(fullUrl, etag, data);
  return { data, status: response.status, headers: response.headers } as T;
};

function uploadWithProgress<T>(
  url: string,
  options: CustomFetchOptions,
  headers: Record<string, string>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method ?? 'POST', url, true);
    xhr.withCredentials = true;
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) options.onUploadProgress?.(e.loaded, e.total);
    };
    xhr.onerror = () => reject(new Error(NETWORK_ERROR_MESSAGE));
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        if (xhr.status === 401) clearSession();
        let detail: string | undefined;
        try {
          detail = detailFromBody(JSON.parse(xhr.responseText));
        } catch {
          detail = undefined;
        }
        reject(new ApiError(xhr.status, detail));
        return;
      }
      const data =
        xhr.status === 204 || !xhr.responseText
          ? undefined
          : JSON.parse(xhr.responseText);
      resolve({ data, status: xhr.status, headers: new Headers() } as T);
    };
    xhr.send(options.body as FormData);
  });
}
