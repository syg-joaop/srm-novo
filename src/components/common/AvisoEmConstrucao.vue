<template>
  <div class="h-full w-full flex items-center justify-center min-h-[400px]">
    <UiEmptyState
      :icon="Construction"
      title="Em Construção"
      description="Esta página ainda está sendo implementada."
    />
  </div>
</template>

<script setup lang="ts">
import { Construction } from "lucide-vue-next";
import UiEmptyState from "~/components/ui/UiEmptyState.vue";
</script>
