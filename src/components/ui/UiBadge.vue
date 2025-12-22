<template>
  <span :class="['base-badge', `variant-${variant}`, `size-${size}`, { 'is-dot': dot }]">
    <span v-if="dot" class="badge-dot" aria-hidden="true"></span>
    <slot />
  </span>
</template>

<script setup lang="ts">
export type Variant = "default" | "primary" | "success" | "warning" | "danger" | "info";
type Size = "small" | "medium" | "large";

withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    dot?: boolean;
  }>(),
  {
    variant: "default",
    size: "medium",
    dot: false,
  },
);

defineOptions({ name: "UiBadge" });
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.size-small {
  padding: 2px 8px;
  font-size: 0.75rem;
}

.size-medium {
  padding: 4px 10px;
  font-size: 0.85rem;
}

.size-large {
  padding: 6px 14px;
  font-size: 0.95rem;
}

.variant-default {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.variant-primary {
  background-color: rgba(0, 153, 255, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(0, 153, 255, 0.2);
}

.variant-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.variant-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.variant-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.variant-info {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.is-dot .badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.variant-default.is-dot .badge-dot {
  background-color: var(--color-text-muted);
}
</style>
