import type { ZodTypeAny } from "zod";
import { useAuthStore } from "~/stores/auth";

export type OfflinePagedBodyBuilder<Filters> = (
  page: number,
  size: number,
  filters: Filters,
) => unknown;

export interface UseOfflineAsyncDataConfig<Filters> {
  key: string;
  endpoint: string;
  buildBody: OfflinePagedBodyBuilder<Filters>;
  cacheTtl?: number;
  homol?: boolean;
  schema?: ZodTypeAny;
}

const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

const getHttpStatus = (error: unknown): number | null => {
  if (!error || typeof error !== "object") return null;

  const status = (error as { status?: unknown; statusCode?: unknown }).status;
  if (typeof status === "number") return status;

  const statusCode = (error as { statusCode?: unknown }).statusCode;
  if (typeof statusCode === "number") return statusCode;

  const responseStatus = (error as { response?: { status?: unknown } }).response?.status;
  if (typeof responseStatus === "number") return responseStatus;

  return null;
};

const buildCacheKey = (userKey: string, baseKey: string, page: number, size: number, filters: unknown) => {
  const suffix = stableStringify(filters);
  return `${userKey}:${baseKey}:${page}:${size}:${suffix}`;
};

export const useOfflineAsyncData = <Response, Filters>(config: UseOfflineAsyncDataConfig<Filters>) => {
  const api = useMainApi(config.homol);
  const authStore = useAuthStore();
  const storage = useOfflineStorage();
  const { isOnline } = useNetworkStatus();

  const cacheTtl = getOfflineCacheTtl(config.key, config.cacheTtl) ?? DEFAULT_CACHE_TTL;
  const parseResponse = (data: Response, source: "network" | "cache"): Response => {
    if (!config.schema) return data;
    const parsed = config.schema.safeParse(data);
    if (!parsed.success) {
      console.error(
        `[useOfflineAsyncData] Invalid ${source} response for ${config.key}`,
        parsed.error,
      );
      throw parsed.error;
    }
    return parsed.data as Response;
  };

  return (page: Ref<number>, size: Ref<number>, filters: Ref<Filters>) => {
    const isFromCache = ref(false);
    const isCacheStale = ref(false);
    const lastCacheError = ref<string | null>(null);

    const execute = async (): Promise<Response | null> => {
      const userKey = authStore.userEmail ? `user:${authStore.userEmail}` : "user:anon";
      const cacheKey = buildCacheKey(userKey, config.key, page.value, size.value, filters.value);

      lastCacheError.value = null;

      if (isOnline.value) {
        try {
          const body = config.buildBody(page.value, size.value, filters.value) as BodyInit;
          const response = await api<Response>(config.endpoint, { method: "POST", body });
          const parsedResponse = parseResponse(response, "network");

          isFromCache.value = false;
          isCacheStale.value = false;
          await storage.setCache(cacheKey, parsedResponse, cacheTtl);
          return parsedResponse;
        } catch (error) {
          const status = getHttpStatus(error);
          if (status === 401 || status === 403) throw error;
          lastCacheError.value = toErrorMessage(error);
        }
      }

      const cached = await storage.getCacheEntry<Response>(cacheKey, { allowExpired: true });
      if (!cached) {
        isFromCache.value = false;
        isCacheStale.value = false;
        return null;
      }

      isFromCache.value = true;
      isCacheStale.value = cached.isExpired;
      if (!config.schema) return cached.data;

      try {
        return parseResponse(cached.data, "cache");
      } catch (error) {
        lastCacheError.value = toErrorMessage(error);
        return null;
      }
    };

    const asyncData = useAsyncData<Response | null>(config.key, execute, {
      immediate: authStore.isAuthenticated,
      lazy: true,
      watch: [page, size, filters],
    });

    return Object.assign(asyncData, { isFromCache, isCacheStale, lastCacheError });
  };
};

