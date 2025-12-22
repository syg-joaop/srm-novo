import type { OfflinePendingOperation } from "~/types/offline";

const MAX_RETRIES = 5;

const isForCurrentUser = (op: OfflinePendingOperation<unknown>, userKey: string) => {
  if (!op.userKey) return userKey === "user:anon";
  return op.userKey === userKey;
};

const getUserKey = (authStore: ReturnType<typeof useAuthStore>): string => {
  return authStore.userEmail ? `user:${authStore.userEmail}` : "user:anon";
};

export const useSyncManager = () => {
  const storage = useOfflineStorage();
  const { isOnline, onOnline } = useNetworkStatus();
  const authStore = useAuthStore();

  const isSyncing = useState<boolean>("offline:isSyncing", () => false);
  const pendingCount = useState<number>("offline:pendingCount", () => 0);
  const initialized = useState<boolean>("offline:syncInitialized", () => false);

  const refreshPendingCount = async (): Promise<void> => {
    const userKey = getUserKey(authStore);
    const pending = await storage.getPending();
    pendingCount.value = pending.filter((op) => isForCurrentUser(op, userKey)).length;
  };

  const syncPending = async (): Promise<void> => {
    if (!import.meta.client) return;
    if (!isOnline.value) return;
    if (isSyncing.value) return;
    if (!authStore.initialized) return;

    const userKey = getUserKey(authStore);
    const mainApi = useMainApi(false);
    const homolApi = useMainApi(true);

    isSyncing.value = true;
    try {
      const pending = await storage.getPending();
      const queue = pending.filter((op) => isForCurrentUser(op, userKey));

      for (const op of queue) {
        if (op.retryCount >= MAX_RETRIES) continue;

        try {
          const api = op.homol ? homolApi : mainApi;
          await api(op.endpoint, { method: op.method, body: op.payload as BodyInit });

          await storage.removePending(op.id);
          if (op.cacheKeyPrefix) {
            await storage.invalidateCache(op.cacheKeyPrefix);
          }
        } catch (error) {
          if (isNetworkError(error)) return;

          const next: OfflinePendingOperation<unknown> = {
            ...op,
            retryCount: op.retryCount + 1,
            lastAttemptAt: Date.now(),
            lastError: toErrorMessage(error),
          };

          await storage.updatePending(next);
        }
      }
    } finally {
      isSyncing.value = false;
      await refreshPendingCount();
    }
  };

  const init = () => {
    if (!import.meta.client) return;
    if (initialized.value) return;

    initialized.value = true;
    void refreshPendingCount();

    onOnline(() => {
      void syncPending();
    });

    if (isOnline.value) {
      void syncPending();
    }
  };

  init();

  return {
    syncPending,
    refreshPendingCount,
    isSyncing: readonly(isSyncing),
    pendingCount: readonly(pendingCount),
  };
};

