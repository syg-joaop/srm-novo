import type { GetOfflineCacheOptions, OfflineCacheEntry, OfflinePendingOperation } from "~/types/offline";
import {
  OFFLINE_CACHE_STORE,
  OFFLINE_PENDING_STORE,
  coerceStoreRecord,
  getOfflineDb,
  isIndexedDbAvailable,
  openStore,
  requestToPromise,
  transactionToPromise,
} from "~/utils/offline/database";

type CacheLookup<T> = { data: T; isExpired: boolean };

const safeNoop = () => {};

const readCacheEntry = async <T>(
  key: string,
  options?: GetOfflineCacheOptions,
): Promise<CacheLookup<T> | null> => {
  if (!isIndexedDbAvailable()) return null;

  const { store, tx } = await openStore(OFFLINE_CACHE_STORE, "readwrite");

  const raw = await requestToPromise(store.get(key) as IDBRequest<unknown>);
  const entry = coerceStoreRecord(raw, OFFLINE_CACHE_STORE) as OfflineCacheEntry<T> | null;

  if (!entry) {
    await transactionToPromise(tx);
    return null;
  }

  const expiresAt = entry.expiresAt;
  const isExpired = typeof expiresAt === "number" && expiresAt <= Date.now();

  if (isExpired && !options?.allowExpired) {
    store.delete(key);
    await transactionToPromise(tx);
    return null;
  }

  await transactionToPromise(tx);
  return { data: entry.data, isExpired };
};

export const useOfflineStorage = () => {
  const ready = async (): Promise<void> => {
    if (!isIndexedDbAvailable()) return;
    await getOfflineDb();
  };

  const getCacheEntry = async <T>(
    key: string,
    options?: GetOfflineCacheOptions,
  ): Promise<CacheLookup<T> | null> => {
    try {
      return await readCacheEntry<T>(key, options);
    } catch (error) {
      console.warn("[offline] Falha ao ler cache:", error);
      return null;
    }
  };

  const getCache = async <T>(key: string, options?: GetOfflineCacheOptions): Promise<T | null> => {
    const entry = await getCacheEntry<T>(key, options);
    return entry?.data ?? null;
  };

  const setCache = async <T>(key: string, data: T, ttl?: number): Promise<void> => {
    if (!isIndexedDbAvailable()) return;

    const expiresAt = typeof ttl === "number" ? Date.now() + ttl : null;
    const entry: OfflineCacheEntry<T> = { key, data, updatedAt: Date.now(), expiresAt };

    try {
      const { store, tx } = await openStore(OFFLINE_CACHE_STORE, "readwrite");
      await requestToPromise(store.put(entry) as IDBRequest<IDBValidKey>);
      await transactionToPromise(tx);
    } catch (error) {
      console.warn("[offline] Falha ao salvar cache:", error);
    }
  };

  const invalidateCache = async (pattern: string): Promise<void> => {
    if (!isIndexedDbAvailable()) return;

    try {
      const { store, tx } = await openStore(OFFLINE_CACHE_STORE, "readwrite");

      await new Promise<void>((resolve, reject) => {
        const request = store.openCursor();
        request.onerror = () => reject(request.error ?? new Error("Falha ao iterar cache."));
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve();
            return;
          }

          const key = String(cursor.key);
          if (key.startsWith(pattern)) {
            cursor.delete();
          }
          cursor.continue();
        };
      });

      await transactionToPromise(tx);
    } catch (error) {
      console.warn("[offline] Falha ao invalidar cache:", error);
    }
  };

  const addPending = async <Payload>(operation: OfflinePendingOperation<Payload>): Promise<string> => {
    if (!isIndexedDbAvailable()) return operation.id;

    try {
      const { store, tx } = await openStore(OFFLINE_PENDING_STORE, "readwrite");
      await requestToPromise(store.put(operation) as IDBRequest<IDBValidKey>);
      await transactionToPromise(tx);
      return operation.id;
    } catch (error) {
      console.warn("[offline] Falha ao adicionar operação pendente:", error);
      return operation.id;
    }
  };

  const updatePending = async <Payload>(operation: OfflinePendingOperation<Payload>): Promise<void> => {
    if (!isIndexedDbAvailable()) return;

    try {
      const { store, tx } = await openStore(OFFLINE_PENDING_STORE, "readwrite");
      await requestToPromise(store.put(operation) as IDBRequest<IDBValidKey>);
      await transactionToPromise(tx);
    } catch (error) {
      console.warn("[offline] Falha ao atualizar operação pendente:", error);
    }
  };

  const getPending = async (): Promise<OfflinePendingOperation<unknown>[]> => {
    if (!isIndexedDbAvailable()) return [];

    try {
      const { store, tx } = await openStore(OFFLINE_PENDING_STORE, "readonly");
      const index = store.index("createdAt");

      const items = await new Promise<OfflinePendingOperation<unknown>[]>((resolve, reject) => {
        const result: OfflinePendingOperation<unknown>[] = [];
        const request = index.openCursor();

        request.onerror = () => reject(request.error ?? new Error("Falha ao iterar fila offline."));
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve(result);
            return;
          }

          const op = coerceStoreRecord(cursor.value as unknown, OFFLINE_PENDING_STORE);
          if (op) result.push(op);

          cursor.continue();
        };
      });

      await transactionToPromise(tx);
      return items;
    } catch (error) {
      console.warn("[offline] Falha ao buscar fila offline:", error);
      return [];
    }
  };

  const removePending = async (id: string): Promise<void> => {
    if (!isIndexedDbAvailable()) return;

    try {
      const { store, tx } = await openStore(OFFLINE_PENDING_STORE, "readwrite");
      await requestToPromise(store.delete(id) as IDBRequest<unknown>);
      await transactionToPromise(tx);
    } catch (error) {
      console.warn("[offline] Falha ao remover operação pendente:", error);
    }
  };

  const countPending = async (): Promise<number> => {
    if (!isIndexedDbAvailable()) return 0;

    try {
      const { store, tx } = await openStore(OFFLINE_PENDING_STORE, "readonly");
      const count = await requestToPromise(store.count() as IDBRequest<number>);
      await transactionToPromise(tx);
      return count;
    } catch (error) {
      console.warn("[offline] Falha ao contar pendências:", error);
      return 0;
    }
  };

  return {
    ready,
    getCache,
    getCacheEntry,
    setCache,
    invalidateCache,
    addPending,
    updatePending,
    getPending,
    removePending,
    countPending,
    onUnavailable: safeNoop,
  };
};
