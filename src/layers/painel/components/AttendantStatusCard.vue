<template>
  <div
    class="background-bg-50 flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors gap-3 sm:gap-0"
  >
    <div class="flex items-center gap-3">
      <div
        class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary-dark dark:text-primary border border-primary/20"
      >
        <User class="w-4 h-4" />
      </div>
      <span class="font-medium text-sm text-gray-800 dark:text-gray-200">
        {{ role }}
      </span>
    </div>
    <UiStatusBadgeGroup :items="statuses" />
  </div>
</template>

<script setup lang="ts">
import { User } from "lucide-vue-next";
import UiStatusBadgeGroup from "~/components/ui/UiStatusBadgeGroup.vue";

interface StatusItem {
  value: string | number;
  label?: string;
  color: "red" | "green" | "yellow" | "blue" | "purple" | "gray" | "dark-red";
  icon?: string;
}

defineProps<{
  role: string;
  statuses: StatusItem[];
}>();
</script>
