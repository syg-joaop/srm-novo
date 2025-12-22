<template>
  <div class="grid grid-cols-2 gap-x-8 gap-y-6">
    <div v-for="(item, i) in items" :key="i" class="group">
      <div
        class="flex flex-col border-l-2 pl-4 transition-colors"
        style="border-color: var(--color-border)"
      >
        <span
          class="text-[10px] font-bold uppercase tracking-wide mb-1 transition-colors"
          style="color: var(--color-text-muted)"
        >
          {{ item.label }}
        </span>
        <span class="text-sm font-medium transition-colors" style="color: var(--color-text)">
          {{ item.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MetricItem {
  label: string;
  value: string | number;
}

defineProps<{
  items: MetricItem[];
}>();
</script>
