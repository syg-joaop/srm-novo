<template>
  <div class="base-list">
    <div
      v-for="(item, index) in items"
      :key="getKey(item, index)"
      :class="['list-item', { 'is-hoverable': hoverable, 'is-clickable': clickable }]"
      @click="handleItemClick(item, index)"
    >
      <div v-if="$slots.item" class="list-item-content">
        <slot name="item" :item="item" :index="index" />
      </div>
      <div v-else class="list-item-content">
        {{ item }}
      </div>

      <div v-if="$slots.actions" class="list-item-actions">
        <slot name="actions" :item="item" :index="index" />
      </div>
    </div>

    <div v-if="items.length === 0" class="list-empty">
      <slot name="empty">
        <p>Nenhum item encontrado</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
type ListItem = unknown;

const props = withDefaults(
  defineProps<{
    items: ListItem[];
    itemKey?: string;
    hoverable?: boolean;
    clickable?: boolean;
  }>(),
  {
    itemKey: "id",
    hoverable: true,
    clickable: false,
  },
);

defineOptions({ name: "UiList" });

const emit = defineEmits<{
  "item-click": [item: ListItem, index: number];
}>();

const getKey = (item: ListItem, index: number) => {
  if (!item || typeof item !== "object") return index;
  const record = item as Record<string, unknown>;
  const value = record[props.itemKey];
  return value ?? index;
};

const handleItemClick = (item: ListItem, index: number) => {
  if (!props.clickable) return;
  emit("item-click", item, index);
};
</script>

<style scoped>
.base-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: var(--color-surface);
  transition: background-color 0.2s ease;
}

.is-hoverable:hover {
  background-color: var(--color-hover);
}

.is-clickable {
  cursor: pointer;
}

.is-clickable:hover {
  background-color: rgba(0, 153, 255, 0.05);
}

.list-item-content {
  flex: 1;
  color: var(--color-text);
}

.list-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.list-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
}

.list-empty p {
  margin: 0;
}
</style>
