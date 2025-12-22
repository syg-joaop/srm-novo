<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    size="small"
    title="Cadastrar comentário"
  >
    <div class="flex flex-col gap-4">
      <div class="form-group">
        <textarea
          class="form-textarea"
          rows="5"
          placeholder="Descrição"
          :value="descricao"
          @input="$emit('update:descricao', ($event.target as HTMLInputElement).value)"
        ></textarea>
      </div>

      <div class="flex items-center justify-between py-2">
        <span class="text-sm font-medium" style="color: var(--color-text)"
          >Marcar como problema</span
        >
        <UiToggle
          :model-value="isProblema"
          @update:model-value="$emit('update:isProblema', $event)"
        />
      </div>

      <div class="flex justify-end pt-4">
        <UiButton variant="primary" @click="$emit('confirm')"> Cadastrar </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import UiModal from "~/components/ui/UiModal.vue";
import UiButton from "~/components/ui/UiButton.vue";
import UiToggle from "~/components/ui/UiToggle.vue";

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  descricao: {
    type: String,
    default: "",
  },
  isProblema: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue", "update:descricao", "update:isProblema", "confirm"]);
</script>

<style scoped>
.form-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.1);
}

.form-textarea::placeholder {
  color: var(--color-text-muted);
}
</style>
