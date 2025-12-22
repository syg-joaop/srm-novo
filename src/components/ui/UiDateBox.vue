<template>
  <div
    class="flex flex-col items-center justify-center w-auto min-w-[2.5rem] px-1.5 h-10 rounded-lg border shrink-0 transition-transform duration-300 group-hover/item:scale-105"
    :class="variantClasses"
  >
    <span v-if="label" class="text-[9px] font-bold uppercase leading-none opacity-70">{{
      label
    }}</span>
    <span class="text-sm font-bold leading-none mt-0.5">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    label?: string;
    variant?: "default" | "danger" | "warning";
  }>(),
  {
    variant: "default",
  },
);

const variantClasses = computed(() => {
  switch (props.variant) {
    case "danger":
      return "bg-red-100/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/30";
    case "warning":
      return "bg-amber-100/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30";
    default:
      return "bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary border-primary/20 dark:border-primary/30";
  }
});

defineOptions({ name: "UiDateBox" });
</script>
