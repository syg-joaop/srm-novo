<template>
  <div class="flex items-center gap-4 mb-8 pb-6 border-b" style="border-color: var(--color-border)">
    <div
      class="p-3 rounded-2xl border"
      :style="{
        backgroundColor: 'var(--color-hover)',
        color: `var(--color-${variant})`,
        borderColor: `var(--color-${variant})`,
      }"
    >
      <component :is="icon" :size="iconSize" />
    </div>
    <div>
      <p
        class="text-xs font-bold uppercase tracking-wider mb-1"
        :style="{
          color: `var(--color-${variant})`,
          opacity: 0.8,
        }"
      >
        {{ label }}
      </p>
      <h3 class="text-4xl font-bold tracking-tight" style="color: var(--color-text)">
        {{ displayValue }}
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    icon: Component;
    label: string;
    value?: string | number;
    variant?: string;
    iconSize?: number;
  }>(),
  {
    variant: "primary",
    iconSize: 32,
    value: "R$ 0,00",
  },
);

const displayValue = computed(() => {
  return props.value ?? "R$ 0,00";
});
</script>
