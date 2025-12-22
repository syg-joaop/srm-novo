<template>
  <button
    :class="[
      'base-button',
      `variant-${variant}`,
      `size-${size}`,
      { 'is-loading': loading, 'is-disabled': disabled, 'full-width': fullWidth },
    ]"
    :disabled="disabled || loading"
    :type="type"
    :aria-busy="loading"
    :aria-disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
type Variant = "primary" | "secondary" | "danger" | "success" | "ghost" | "link";
type Size = "small" | "medium" | "large";
type ButtonType = "button" | "submit" | "reset";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    type?: ButtonType;
  }>(),
  {
    variant: "primary",
    size: "medium",
    loading: false,
    disabled: false,
    fullWidth: false,
    type: "button",
  },
);

defineOptions({ name: "UiButton" });

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return;
  emit("click", event);
};
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
}

.base-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.2);
}

.size-small {
  padding: 6px 12px;
  font-size: 0.875rem;
  min-height: 32px;
}

.size-medium {
  padding: 10px 20px;
  font-size: 0.95rem;
  min-height: 40px;
}

.size-large {
  padding: 14px 28px;
  font-size: 1.05rem;
  min-height: 48px;
}

.variant-primary {
  background-color: var(--color-primary);
  color: white;
}

.variant-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
}

.variant-secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.variant-secondary:hover:not(:disabled) {
  background-color: var(--color-hover);
  border-color: var(--color-primary);
}

.variant-danger {
  background-color: #ef4444;
  color: white;
}

.variant-danger:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.variant-success {
  background-color: #10b981;
  color: white;
}

.variant-success:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.variant-ghost {
  background-color: transparent;
  color: var(--color-text);
}

.variant-ghost:hover:not(:disabled) {
  background-color: var(--color-hover);
}

.variant-link {
  background-color: transparent;
  color: var(--color-primary);
  padding: 4px 8px;
}

.variant-link:hover:not(:disabled) {
  text-decoration: underline;
  background-color: transparent;
}

.is-disabled,
.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.is-loading {
  cursor: wait;
  opacity: 0.7;
}

.full-width {
  width: 100%;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
