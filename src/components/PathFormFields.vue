<template>
  <div class="path-form-fields">
    <ion-item class="path-form-field">
      <ion-label position="stacked">Title *</ion-label>
      <ion-input
        :value="title"
        placeholder="Path title"
        :maxlength="120"
        autocapitalize="words"
        @ionInput="emit('update:title', String($event.detail?.value ?? ''))"
      />
    </ion-item>

    <ion-item class="path-form-field">
      <ion-label position="stacked">Description</ion-label>
      <ion-input
        :value="description"
        placeholder="Optional description"
        :maxlength="1024"
        @ionInput="emit('update:description', String($event.detail?.value ?? ''))"
      />
    </ion-item>

    <ion-item class="path-form-field">
      <ion-label :for="colorInputId" position="stacked">Colour</ion-label>
      <div class="path-colour-row">
        <input
          :id="colorInputId"
          :value="color"
          type="color"
          class="path-colour-input"
          @input="emit('update:color', ($event.target as HTMLInputElement).value)"
        />
        <span class="path-colour-hex">{{ color }}</span>
      </div>
    </ion-item>

    <p v-if="errorMessage" class="path-form-error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonInput, IonItem, IonLabel } from '@ionic/vue';

defineProps<{
  title: string;
  description: string;
  color: string;
  colorInputId: string;
  errorMessage: string;
}>();

const emit = defineEmits<{
  'update:title': [value: string];
  'update:description': [value: string];
  'update:color': [value: string];
}>();
</script>

<style scoped>
.path-form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.path-form-field {
  --border-radius: 14px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  --min-height: 68px;
  border: 1px solid var(--ion-border-color);
  border-radius: 14px;
  overflow: hidden;
}

.path-colour-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.path-colour-input {
  width: 40px;
  height: 32px;
  border: 1px solid var(--ion-border-color);
  border-radius: 6px;
  padding: 2px;
  cursor: pointer;
  background: none;
}

.path-colour-hex {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  font-family: monospace;
}

.path-form-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin: 0;
}
</style>
