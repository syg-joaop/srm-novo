<template>
  <label :class="['base-checkbox', { small: size === 'small' }]">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :required="required"
      @change="handleChange"
    />
    <span :class="['checkmark', { terms: variant === 'terms' }]"></span>
    <span v-if="label || $slots.default" class="label-text">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
type Variant = "default" | "terms";
type Size = "small" | "medium";

withDefaults(
  defineProps<{
    modelValue?: boolean;
    label?: string;
    disabled?: boolean;
    required?: boolean;
    variant?: Variant;
    size?: Size;
  }>(),
  {
    modelValue: false,
    label: "",
    disabled: false,
    required: false,
    variant: "default",
    size: "medium",
  },
);

defineOptions({ name: "UiCheckbox" });

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  emit("update:modelValue", Boolean(target?.checked));
};
</script>

<style scoped>
.base-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
  position: relative;
  padding-left: 28px;
  user-select: none;
}

.base-checkbox.small {
  font-size: 0.8rem;
}

.base-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.base-checkbox input:disabled ~ .checkmark {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-checkbox input:disabled {
  cursor: not-allowed;
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 18px;
  width: 18px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.base-checkbox:hover input:not(:disabled) ~ .checkmark {
  border-color: var(--color-text-muted);
}

.base-checkbox input:checked ~ .checkmark {
  background-color: var(--color-surface);
  border-color: var(--color-primary);
}

.base-checkbox input:checked ~ .checkmark:after {
  content: "";
  position: absolute;
  display: block;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 10px;
  border: solid var(--color-text);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.base-checkbox input:checked ~ .checkmark.terms {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.base-checkbox input:checked ~ .checkmark.terms:after {
  border-color: #fff;
}

.label-text {
  display: inline-block;
}
</style>
