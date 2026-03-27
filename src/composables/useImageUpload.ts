import { ref } from 'vue';
import {
  useCreateImageUploadUrl,
  useCompleteImageUpload,
} from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';

export interface UploadedImage {
  imageId: string;
  filename: string;
  byteSize: number;
}

/**
 * Composable for uploading a single image to an existing entry.
 *
 * Flow:
 *   1. POST /v1/paths/:pathCode/entries/:entrySlug/images/upload-url
 *   2. PUT upload_url (direct to storage)
 *   3. POST /v1/images/:imageId/complete
 *
 * Returns the uploaded image metadata so the caller can insert
 * `![caption](filename)` into the entry content.
 */
export function useImageUpload() {
  const uploading = ref(false);
  const uploadError = ref('');

  const { mutateAsync: requestUploadUrl } = useCreateImageUploadUrl();
  const { mutateAsync: completeUpload } = useCompleteImageUpload();

  async function uploadImage(
    pathCode: string,
    entrySlug: string,
    file: File,
  ): Promise<UploadedImage | null> {
    uploading.value = true;
    uploadError.value = '';

    try {
      // 1. Request a signed upload URL from the backend.
      const urlResponse = await requestUploadUrl({
        pathCode,
        entrySlug,
        data: {
          filename: file.name,
          content_type: file.type || undefined,
          strip_metadata: true,
        },
      });

      const { image_id: imageId, upload_url: uploadUrl } =
        urlResponse.status === 200
          ? urlResponse.data
          : (() => {
              throw new Error('Failed to get upload URL.');
            })();

      // 2. Upload the file bytes directly to storage.
      const putResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: file.type ? { 'Content-Type': file.type } : {},
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed: HTTP ${putResponse.status}`);
      }

      // 3. Notify the backend that the upload is complete.
      await completeUpload({
        imageId,
        data: { byte_size: file.size },
      });

      return { imageId, filename: file.name, byteSize: file.size };
    } catch (err: unknown) {
      uploadError.value =
        extractErrorMessage(err) ?? 'Image upload failed. Please try again.';
      return null;
    } finally {
      uploading.value = false;
    }
  }

  return { uploading, uploadError, uploadImage };
}
