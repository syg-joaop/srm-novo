import type { OfflineHttpMethod, OfflineMutationResult, OfflinePendingOperation } from "~/types/offline";
import { useAuthStore } from "~/stores/auth";

export interface UseOfflineMutationConfig {
  entity: string;
  endpoint: string;
  method?: OfflineHttpMethod;
  homol?: boolean;
  cacheKeyPrefix?: string;
}

export const useOfflineMutation = <Payload>(config: UseOfflineMutationConfig) => {
  const api = useMainApi(config.homol);
  const authStore = useAuthStore();
  const storage = useOfflineStorage();
  const { isOnline } = useNetworkStatus();
  const sync = useSyncManager();

  const isPending = ref(false);

  const saveOffline = async (payload: Payload): Promise<OfflineMutationResult> => {
    const id = generateId(config.entity);
    const userKey = authStore.userEmail ? `user:${authStore.userEmail}` : "user:anon";

    const operation: OfflinePendingOperation<Payload> = {
      id,
      userKey,
      entity: config.entity,
      endpoint: config.endpoint,
      method: config.method ?? "POST",
      payload,
      createdAt: Date.now(),
      retryCount: 0,
      homol: config.homol,
      cacheKeyPrefix: config.cacheKeyPrefix ? `${userKey}:${config.cacheKeyPrefix}` : undefined,
    };

    await storage.addPending(operation);
    await sync.refreshPendingCount();

    return { success: true, offline: true, operationId: id };
  };

  const mutate = async (payload: Payload): Promise<OfflineMutationResult> => {
    isPending.value = true;
    try {
      if (!isOnline.value) {
        return await saveOffline(payload);
      }

      try {
        await api(config.endpoint, { method: config.method ?? "POST", body: payload as BodyInit });
        if (config.cacheKeyPrefix) {
          const userKey = authStore.userEmail ? `user:${authStore.userEmail}` : "user:anon";
          await storage.invalidateCache(`${userKey}:${config.cacheKeyPrefix}`);
        }
        return { success: true, offline: false };
      } catch (error) {
        if (isNetworkError(error)) {
          return await saveOffline(payload);
        }
        return { success: false, offline: false, error: toErrorMessage(error) };
      }
    } finally {
      isPending.value = false;
    }
  };

  return { mutate, isPending: readonly(isPending) };
};
