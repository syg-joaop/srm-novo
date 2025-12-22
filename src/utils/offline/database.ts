import type { OfflineCacheEntry, OfflinePendingOperation } from "~/types/offline";

export const OFFLINE_DB_NAME = "srm_offline";
export const OFFLINE_DB_VERSION = 1;

export const OFFLINE_CACHE_STORE = "srm_cache" as const;
export const OFFLINE_PENDING_STORE = "srm_pending" as const;

export type OfflineStoreName = typeof OFFLINE_CACHE_STORE | typeof OFFLINE_PENDING_STORE;

let dbPromise: Promise<IDBDatabase> | null = null;

export const isIndexedDbAvailable = (): boolean => {
  return import.meta.client && typeof indexedDB !== "undefined";
};

export const getOfflineDb = async (): Promise<IDBDatabase> => {
  if (!isIndexedDbAvailable()) {
    throw new Error("IndexedDB não está disponível neste ambiente.");
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(OFFLINE_CACHE_STORE)) {
        db.createObjectStore(OFFLINE_CACHE_STORE, { keyPath: "key" });
      }

      const upgradeTx = request.transaction;

      let pendingStore: IDBObjectStore;
      if (!db.objectStoreNames.contains(OFFLINE_PENDING_STORE)) {
        pendingStore = db.createObjectStore(OFFLINE_PENDING_STORE, { keyPath: "id" });
      } else if (upgradeTx) {
        pendingStore = upgradeTx.objectStore(OFFLINE_PENDING_STORE);
      } else {
        return;
      }

      if (!pendingStore.indexNames.contains("createdAt")) {
        pendingStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!pendingStore.indexNames.contains("entity")) {
        pendingStore.createIndex("entity", "entity", { unique: false });
      }

      if (!pendingStore.indexNames.contains("userKey")) {
        pendingStore.createIndex("userKey", "userKey", { unique: false });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Falha ao abrir IndexedDB."));
    };

    request.onblocked = () => {
      console.warn("[offline] IndexedDB open bloqueado (outra aba pode estar usando a versão antiga).");
    };
  });

  return dbPromise;
};

type StoreRecordByName = {
  [OFFLINE_CACHE_STORE]: OfflineCacheEntry<unknown>;
  [OFFLINE_PENDING_STORE]: OfflinePendingOperation<unknown>;
};

export const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha no IndexedDB request."));
  });

export const transactionToPromise = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Falha no IndexedDB transaction."));
    tx.onabort = () => reject(tx.error ?? new Error("Transação IndexedDB abortada."));
  });

export const openStore = async <StoreName extends OfflineStoreName>(
  storeName: StoreName,
  mode: IDBTransactionMode,
): Promise<{ store: IDBObjectStore; tx: IDBTransaction }> => {
  const db = await getOfflineDb();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  return { store, tx };
};

export const coerceStoreRecord = <StoreName extends OfflineStoreName>(
  value: unknown,
  _store: StoreName,
): StoreRecordByName[StoreName] | null => {
  if (value === null || value === undefined) return null;
  return value as StoreRecordByName[StoreName];
};
