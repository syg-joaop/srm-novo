<template>
  <div :class="['base-spinner', `size-${size}`, `variant-${variant}`]">
    <div class="spinner" aria-hidden="true"></div>
    <p v-if="text" class="spinner-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
type Size = "small" | "medium" | "large";
type Variant = "primary" | "white" | "dark";

withDefaults(
  defineProps<{
    size?: Size;
    variant?: Variant;
    text?: string;
  }>(),
  {
    size: "medium",
    variant: "primary",
    text: "",
  },
);

defineOptions({ name: "UiSpinner" });
</script>

<style scoped>
.base-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  animation: spin 0.8s linear infinite;
}

.size-small .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.size-medium .spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.size-large .spinner {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

.variant-primary .spinner {
  border-color: rgba(0, 153, 255, 0.2);
  border-top-color: var(--color-primary);
}

.variant-white .spinner {
  border-color: rgba(255, 255, 255, 0.2);
  border-top-color: white;
}

.variant-dark .spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-text);
}

.spinner-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
