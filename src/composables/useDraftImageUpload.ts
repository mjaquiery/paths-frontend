import { ref } from 'vue';
import {
  useCreateDraftImageSlot,
  useCompleteDraftImageUpload,
} from '../generated/apiClient';
import type { DraftImageResponse } from '../generated/types';
import { extractErrorMessage } from '../lib/errors';

/**
 * Composable for uploading a single image to an open draft.
 *
 * Flow:
 *   1. POST /v1/entry-drafts/:draftId/images  → get upload_url + draft_image_id
 *   2. PUT upload_url (direct to storage)
 *   3. POST /v1/entry-drafts/:draftId/images/:draftImageId/complete
 *
 * The image moves through states: awaiting_upload → uploading → ready (via background task).
 * The caller should poll GET /v1/entry-drafts/:draftId to observe the final ready state.
 */
export function useDraftImageUpload() {
  const uploading = ref(false);
  const uploadError = ref('');

  const { mutateAsync: createSlot } = useCreateDraftImageSlot();
  const { mutateAsync: completeUpload } = useCompleteDraftImageUpload();

  /**
   * Upload a file to a draft. Returns the DraftImageResponse (in "uploading" state)
   * after completing the three-step flow. The caller polls the draft to check when
   * the image reaches "ready".
   *
   * Returns null on failure; uploadError will be set.
   */
  async function uploadDraftImage(
    draftId: string,
    file: File,
    clientImageId?: string,
  ): Promise<DraftImageResponse | null> {
    uploading.value = true;
    uploadError.value = '';

    try {
      // 1. Request a draft image slot and presigned upload URL.
      const slotResponse = await createSlot({
        draftId,
        data: {
          filename: file.name,
          content_type: file.type || 'image/jpeg',
          strip_metadata: true,
          client_image_id: clientImageId ?? null,
        },
      });

      if (slotResponse.status !== 201) {
        throw new Error('Failed to create draft image slot.');
      }

      const slot = slotResponse.data;
      const draftImageId = slot.id;
      const uploadUrl = slot.upload_url;

      // 2. PUT the file bytes directly to storage.
      const putResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: file.type ? { 'Content-Type': file.type } : {},
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed: HTTP ${putResponse.status}`);
      }

      // 3. Notify the backend that the upload is complete.
      const completeResponse = await completeUpload({
        draftId,
        draftImageId: String(draftImageId),
        data: { byte_size: file.size },
      });

      if (completeResponse.status !== 200) {
        throw new Error('Failed to finalize draft image upload.');
      }

      return completeResponse.data;
    } catch (err: unknown) {
      uploadError.value =
        extractErrorMessage(err) ?? 'Image upload failed. Please try again.';
      return null;
    } finally {
      uploading.value = false;
    }
  }

  return { uploading, uploadError, uploadDraftImage };
}
