<template>
  <div
    class="flex flex-col gap-0.5 md:gap-1 px-2.5 md:px-3 py-2 md:py-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border-subtle)]"
  >
    <span
      class="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider"
      >{{ label }}</span
    >
    <span
      class="text-xs md:text-sm text-[var(--color-text)] font-semibold truncate"
      :title="valor"
      >{{ valor }}</span
    >
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  valor: string;
}>();
</script>
