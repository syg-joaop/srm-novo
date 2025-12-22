<template>
  <div
    :class="['base-card', { 'is-hoverable': hoverable, 'is-clickable': clickable }]"
    @click="handleClick"
  >
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions" />
      </div>
    </div>

    <div class="card-body" :style="{ padding: noPadding ? '0' : undefined }">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    hoverable?: boolean;
    clickable?: boolean;
    noPadding?: boolean;
  }>(),
  {
    title: "",
    hoverable: false,
    clickable: false,
    noPadding: false,
  },
);

defineOptions({ name: "UiCard" });

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.clickable) return;
  emit("click", event);
};
</script>

<style scoped>
.base-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.is-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.is-clickable {
  cursor: pointer;
}

.is-clickable:hover {
  border-color: var(--color-primary);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-body {
  padding: 20px;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background);
}
</style>
