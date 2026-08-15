import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

/**
 * Picks one or more images, using the native camera/photo-library on iOS/Android (via
 * Capacitor) and falling back to a plain file input on web/PWA. Always resolves to real
 * `File` objects so callers don't need to branch on platform themselves — the multipart
 * create/edit endpoints just want File[] regardless of where they came from.
 *
 * Pass `{ multiple: false }` to restrict the picker to a single image (e.g. replacing one
 * photo already queued for upload).
 */
export async function pickImages(options?: {
  multiple?: boolean;
}): Promise<File[]> {
  const multiple = options?.multiple ?? true;
  if (Capacitor.isNativePlatform()) {
    return pickImagesNative(multiple);
  }
  return pickImagesWeb(multiple);
}

async function pickImagesNative(multiple: boolean): Promise<File[]> {
  const { results } = await Camera.chooseFromGallery({
    allowMultipleSelection: multiple,
  });
  const files = await Promise.all(
    results.map(async (result, index) => {
      const path = result.webPath ?? result.uri;
      if (!path) return null;
      const response = await fetch(path);
      const blob = await response.blob();
      const extension =
        result.metadata?.format?.replace('jpg', 'jpeg') || 'jpeg';
      return new File([blob], `photo-${Date.now()}-${index}.${extension}`, {
        type: blob.type || `image/${extension}`,
      });
    }),
  );
  return files.filter((f): f is File => f !== null);
}

function pickImagesWeb(multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = multiple;
    input.style.display = 'none';
    input.addEventListener(
      'change',
      () => {
        resolve(input.files ? Array.from(input.files) : []);
        input.remove();
      },
      { once: true },
    );
    document.body.appendChild(input);
    input.click();
  });
}
