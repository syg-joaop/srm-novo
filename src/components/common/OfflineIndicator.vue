<template>
  <Transition name="fade-slide">
    <div
      v-if="!isOnline"
      class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg"
      style="
        background-color: #fee;
        border: 1.5px solid #dc2626;
        color: #dc2626;
      "
      role="status"
      aria-live="polite"
    >
      <div class="relative flex items-center">
        <WifiOff class="w-4 h-4" />
        <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse" style="background-color: #dc2626;"></span>
      </div>
      <span class="font-bold">Offline</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { WifiOff } from "lucide-vue-next";

const { isOnline } = useNetworkStatus();
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

