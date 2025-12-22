export type OfflineHttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export type OfflineCacheKey = string;

export interface OfflineCacheEntry<Data = unknown> {
  key: OfflineCacheKey;
  data: Data;
  updatedAt: number;
  expiresAt: number | null;
}

export interface OfflinePendingOperation<Payload = unknown> {
  id: string;
  userKey?: string;
  entity: string;
  endpoint: string;
  method: OfflineHttpMethod;
  payload: Payload;
  createdAt: number;
  retryCount: number;
  lastAttemptAt?: number;
  lastError?: string;
  homol?: boolean;
  cacheKeyPrefix?: string;
}

export interface GetOfflineCacheOptions {
  allowExpired?: boolean;
}

export type OfflineMutationSuccess = {
  success: true;
  offline: boolean;
  operationId?: string;
};

export type OfflineMutationFailure = {
  success: false;
  offline: false;
  error: string;
};

export type OfflineMutationResult = OfflineMutationSuccess | OfflineMutationFailure;
