<template>
  <div class="base-input-wrapper" :class="{ 'has-error': error, 'is-disabled': disabled }">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="input-container">
      <span v-if="$slots.prefix" class="input-prefix">
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="['base-input', { 'has-prefix': $slots.prefix, 'has-suffix': $slots.suffix }]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <span v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix" />
      </span>
    </div>

    <span v-if="error" class="error-message">{{ error }}</span>
    <span v-else-if="hint" class="hint-message">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number;
    type?: string;
    label?: string;
    placeholder?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
  }>(),
  {
    modelValue: "",
    type: "text",
    label: "",
    placeholder: "",
    error: "",
    hint: "",
    disabled: false,
    readonly: false,
    required: false,
  },
);

defineOptions({ name: "UiInput" });

const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const inputId = `input-${Math.random().toString(36).slice(2, 11)}`;

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  emit("update:modelValue", target?.value ?? "");
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.base-input-wrapper:first-child {
  margin-bottom: 12px;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ef4444;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.base-input {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.base-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.1);
}

.base-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.base-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-hover);
}

.base-input.has-prefix {
  padding-left: 40px;
}

.base-input.has-suffix {
  padding-right: 40px;
}

.input-prefix,
.input-suffix {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  pointer-events: none;
}

.input-prefix {
  left: 12px;
}

.input-suffix {
  right: 12px;
}

.error-message {
  font-size: 0.85rem;
  color: #ef4444;
  margin-top: -2px;
}

.hint-message {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: -2px;
}

.has-error .base-input {
  border-color: #ef4444;
}

.has-error .base-input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.is-disabled .input-label {
  opacity: 0.5;
}
</style>
