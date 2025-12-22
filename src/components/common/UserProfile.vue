<template>
  <div class="flex items-center gap-3">
    <div class="text-right hidden sm:block" v-if="showInfo">
      <p class="text-sm font-medium text-white">{{ userName }}</p>
      <p class="text-xs text-gray-400">{{ userRole }}</p>
    </div>
    <div
      class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-[#1e293b]"
    >
      <User class="w-5 h-5 text-white" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { User } from "lucide-vue-next";

defineProps({
  showInfo: {
    type: Boolean,
    default: true,
  },
  userName: {
    type: String,
    default: "Sygecom",
  },
  userRole: {
    type: String,
    default: "Diretor",
  },
});
</script>
