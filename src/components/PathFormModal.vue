<template>
  <ion-modal
    :is-open="isOpen"
    :aria-label="path ? 'Edit Path' : 'New Path'"
    :backdrop-dismiss="!saving"
    @didDismiss="onDismiss"
  >
    <div class="pf-header df-ui">
      <button class="pf-text-btn" @click="onDismiss">Cancel</button>
      <span class="pf-title">{{ path ? 'Edit Path' : 'New Path' }}</span>
      <button
        class="pf-pill-btn"
        :disabled="!form.title.trim() || saving"
        @click="save"
      >
        {{ saving ? 'Saving…' : path ? 'Save' : 'Create' }}
      </button>
    </div>
    <ion-content class="ion-padding df-ui">
      <p class="pf-label">Name</p>
      <input
        v-model="form.title"
        class="pf-name-input df-body"
        placeholder="Path name"
        maxlength="120"
      />

      <p class="pf-label">Colour</p>
      <div class="pf-swatches">
        <button
          v-for="swatch in swatches"
          :key="swatch"
          class="pf-swatch"
          :class="{ 'pf-swatch--selected': form.color === swatch }"
          :style="{ backgroundColor: swatch }"
          :aria-label="`Colour ${swatch}`"
          @click="form.color = swatch"
        />
      </div>

      <p class="pf-label">
        Description <span class="pf-optional">(optional)</span>
      </p>
      <textarea
        v-model="form.description"
        class="pf-description"
        rows="3"
        placeholder="What will you write about here?"
      />

      <div class="pf-shareable-row">
        <div>
          <p class="pf-shareable-title">Publicly visible</p>
          <p class="pf-shareable-desc">
            Anyone with the link can view this path, even if they aren't a
            subscriber
          </p>
        </div>
        <label class="pf-toggle">
          <input
            type="checkbox"
            v-model="form.publiclyVisible"
            aria-label="Publicly visible"
          />
          <span class="pf-toggle-track"><span class="pf-toggle-thumb" /></span>
        </label>
      </div>

      <p v-if="errorMessage" class="pf-error">{{ errorMessage }}</p>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonContent } from '@ionic/vue';
import { ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import type { PathResponse } from '../generated/types';
import {
  useCreatePath,
  useUpdatePath,
  useUpdatePathVisibility,
} from '../generated/apiClient';
import { describeError, isApiErrorWithStatus } from '../lib/errors';

const PATH_SWATCHES = [
  '#5b52f0',
  '#f5a623',
  '#12b6d4',
  '#3ecf5f',
  '#f5443c',
  '#4c3fd7',
  '#b455d9',
  '#1a1a1a',
];

const props = defineProps<{
  isOpen: boolean;
  /** null when creating a new path */
  path: PathResponse | null;
}>();

const emit = defineEmits<{
  dismiss: [];
  saved: [path: PathResponse];
}>();

const swatches = PATH_SWATCHES;

const queryClient = useQueryClient();
const { mutateAsync: doCreatePath } = useCreatePath();
const { mutateAsync: doUpdatePath } = useUpdatePath();
const { mutateAsync: doUpdateVisibility } = useUpdatePathVisibility();

const form = ref({
  title: '',
  description: '',
  color: PATH_SWATCHES[0]!,
  publiclyVisible: false,
});
const saving = ref(false);
const errorMessage = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    form.value = props.path
      ? {
          title: props.path.title,
          description: props.path.description ?? '',
          color: props.path.color,
          publiclyVisible: props.path.is_public,
        }
      : {
          title: '',
          description: '',
          color: PATH_SWATCHES[0]!,
          publiclyVisible: false,
        };
    errorMessage.value = '';
  },
  { immediate: true },
);

async function save() {
  if (!form.value.title.trim()) return;
  saving.value = true;
  errorMessage.value = '';
  try {
    let saved: PathResponse;
    if (props.path) {
      const result = await doUpdatePath({
        pathCode: props.path.path_id,
        data: {
          title: form.value.title.trim(),
          description: form.value.description.trim() || null,
          color: form.value.color,
        },
      });
      saved = result.data as PathResponse;
      if (form.value.publiclyVisible !== props.path.is_public) {
        await doUpdateVisibility({
          pathCode: props.path.path_id,
          data: { is_public: form.value.publiclyVisible },
        });
      }
    } else {
      const result = await doCreatePath({
        data: {
          title: form.value.title.trim(),
          description: form.value.description.trim() || null,
          color: form.value.color,
        },
      });
      saved = result.data as PathResponse;
      if (form.value.publiclyVisible) {
        await doUpdateVisibility({
          pathCode: saved.path_id,
          data: { is_public: true },
        });
      }
    }
    await queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
    emit('saved', saved);
    emit('dismiss');
  } catch (err: unknown) {
    errorMessage.value = isApiErrorWithStatus(err, 409)
      ? 'A path with that name already exists. Please choose a different title.'
      : describeError(props.path ? 'update path' : 'create path', err);
  } finally {
    saving.value = false;
  }
}

function onDismiss() {
  emit('dismiss');
}
</script>

<style scoped>
.pf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-rule);
}

.pf-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-ink);
}

.pf-text-btn {
  background: none;
  border: none;
  color: var(--color-ink-muted);
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.3rem 0;
}

.pf-pill-btn {
  background: var(--color-ink);
  color: var(--color-paper);
  border: none;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.45rem 1.1rem;
  cursor: pointer;
}

.pf-pill-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.pf-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 1.2rem 0 0.5rem;
}

.pf-optional {
  text-transform: none;
  font-weight: 400;
  letter-spacing: normal;
}

.pf-name-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--color-ink);
  background: none;
  font-size: 1.5rem;
  padding: 0.2rem 0 0.4rem;
  color: var(--color-ink);
}

.pf-name-input:focus {
  outline: none;
}

.pf-swatches {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.pf-swatch {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}

.pf-swatch--selected {
  border-color: var(--color-ink);
}

.pf-description {
  width: 100%;
  border: 1px solid var(--color-rule);
  border-radius: 6px;
  background: none;
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  padding: 0.6rem;
  resize: vertical;
}

.pf-shareable-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.4rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-rule);
}

.pf-shareable-title {
  margin: 0;
  font-size: 1rem;
  color: var(--color-ink);
}

.pf-shareable-desc {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: var(--color-ink-muted);
}

.pf-toggle {
  position: relative;
  display: inline-block;
  width: 2.6rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.pf-toggle input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.pf-toggle-track {
  position: absolute;
  inset: 0;
  background: var(--color-rule);
  border-radius: 999px;
  transition: background 0.15s;
}

.pf-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: var(--color-paper);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s;
}

.pf-toggle input:checked + .pf-toggle-track {
  background: var(--color-ink);
}

.pf-toggle input:checked + .pf-toggle-track .pf-toggle-thumb {
  transform: translateX(1.1rem);
}

.pf-error {
  color: var(--ion-color-danger, #d33);
  font-size: 0.85rem;
  margin-top: 1rem;
}
</style>
