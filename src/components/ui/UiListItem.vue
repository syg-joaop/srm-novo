<template>
  <div
    class="group/item relative flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-primary/30 dark:hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 ease-out hover:shadow-sm cursor-pointer"
  >
    <div v-if="$slots.leading" class="shrink-0">
      <slot name="leading" />
    </div>

    <div class="flex-1 min-w-0 flex flex-col justify-center">
      <slot />
    </div>

    <div v-if="$slots.action">
      <slot name="action" />
    </div>

    <div
      class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-primary rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "UiListItem" });
</script>
