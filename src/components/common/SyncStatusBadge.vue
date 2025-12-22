<template>
  <button
    v-if="isVisible"
    type="button"
    class="flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold transition-colors"
    :style="styles"
    :disabled="!canSync"
    :title="title"
    @click="handleClick"
  >
    <Loader2 v-if="isSyncing" class="w-4 h-4 animate-spin" />
    <CloudUpload v-else class="w-4 h-4" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { CloudUpload, Loader2 } from "lucide-vue-next";

const { isOnline } = useNetworkStatus();
const { pendingCount, isSyncing, syncPending } = useSyncManager();

const isVisible = computed(() => isSyncing.value || pendingCount.value > 0);

const label = computed(() => {
  if (isSyncing.value) return "Sincronizando...";
  const count = pendingCount.value;
  return `${count} pendência${count === 1 ? "" : "s"}`;
});

const canSync = computed(() => isOnline.value && !isSyncing.value && pendingCount.value > 0);

const title = computed(() => {
  if (!isOnline.value) return "Você está offline";
  if (isSyncing.value) return "Sincronizando";
  return canSync.value ? "Sincronizar agora" : "Sem pendências";
});

const styles = computed(() => {
  if (isSyncing.value) {
    return {
      backgroundColor: "var(--color-primary-soft)",
      borderColor: "var(--color-primary-border)",
      color: "var(--color-primary)",
      opacity: 1,
    };
  }

  if (!isOnline.value) {
    return {
      backgroundColor: "var(--color-warning-soft)",
      borderColor: "var(--color-warning)",
      color: "var(--color-warning)",
      opacity: 1,
    };
  }

  return {
    backgroundColor: "var(--color-primary-soft)",
    borderColor: "var(--color-primary-border)",
    color: "var(--color-primary)",
    opacity: canSync.value ? 1 : 0.7,
  };
});

const handleClick = () => {
  if (!canSync.value) return;
  void syncPending();
};
</script>

