import { clearSession } from './authSession';

export interface CustomFetchOptions extends RequestInit {
  // Only fires for FormData bodies — fetch has no upload-progress hook, so this
  // path drops down to XMLHttpRequest instead.
  onUploadProgress?: (loaded: number, total: number) => void;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number) {
    super(`Request failed: ${status}`);
    this.name = 'ApiError';
    this.status = status;
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

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...authHeader,
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.onUploadProgress && isFormData) {
    return uploadWithProgress<T>(`${baseUrl}${url}`, options, headers);
  }

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new ApiError(response.status);
  }
  const data = response.status === 204 ? undefined : await response.json();
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
    xhr.onerror = () => reject(new Error('Request failed: network error'));
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        if (xhr.status === 401) clearSession();
        reject(new ApiError(xhr.status));
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
