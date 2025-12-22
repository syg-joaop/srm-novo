<template>
  <div
    class="h-full flex flex-col items-center justify-center py-6 sm:py-8 px-4"
    style="color: var(--color-text-muted)"
  >
    <div
      class="rounded-full flex items-center justify-center mb-3"
      :class="[icon ? 'w-10 h-10 sm:w-12 sm:h-12' : '']"
      style="background-color: var(--color-hover)"
    >
      <slot name="icon">
        <component :is="icon" class="w-5 h-5 sm:w-6 sm:h-6 opacity-50" v-if="icon" />
      </slot>
    </div>
    <p class="text-sm font-medium text-center" style="color: var(--color-text)">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="text-xs text-center mt-1 max-w-xs"
      style="color: var(--color-text-muted)"
    >
      {{ description }}
    </p>

    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  icon?: Component;
  title: string;
  description?: string;
}>();
</script>
