const NETWORK_ERROR_HINTS = [
  "Failed to fetch",
  "NetworkError",
  "Load failed",
  "The Internet connection appears to be offline",
  "fetch failed",
  "ECONNRESET",
  "ENOTFOUND",
  "ETIMEDOUT",
];

const readString = (value: unknown): string | null => (typeof value === "string" ? value : null);

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  const message = readString((error as { message?: unknown } | null)?.message);
  if (message) return message;
  if (typeof error === "string") return error;
  return "Erro inesperado";
};

export const isNetworkError = (error: unknown): boolean => {
  if (import.meta.client && typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }

  if (error instanceof TypeError) {
    return NETWORK_ERROR_HINTS.some((hint) => error.message.includes(hint));
  }

  if (typeof error !== "object" || !error) return false;

  const name = readString((error as { name?: unknown }).name) ?? "";
  const message = readString((error as { message?: unknown }).message) ?? "";
  const status = (error as { status?: unknown }).status;

  const hasHttpStatus = typeof status === "number";
  if (name === "FetchError" && !hasHttpStatus) return true;

  if (NETWORK_ERROR_HINTS.some((hint) => message.includes(hint))) return true;

  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof TypeError) {
    return NETWORK_ERROR_HINTS.some((hint) => cause.message.includes(hint));
  }

  return false;
};

export const generateId = (prefix = "op"): string => {
  if (import.meta.client && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    const uuid = (crypto as Crypto).randomUUID();
    return `${prefix}_${uuid}`;
  }

  const random = Math.random().toString(36).slice(2);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
};

const normalizeForJson = (value: unknown): unknown => {
  if (value === null) return null;
  if (value === undefined) return undefined;

  const primitive = typeof value;
  if (primitive === "string" || primitive === "number" || primitive === "boolean") return value;

  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeForJson);

  if (typeof value !== "object") return String(value);

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  const normalized: Record<string, unknown> = {};
  for (const key of keys) {
    const nextValue = normalizeForJson(record[key]);
    if (nextValue === undefined) continue;
    normalized[key] = nextValue;
  }

  return normalized;
};

export const stableStringify = (value: unknown): string => {
  try {
    return JSON.stringify(normalizeForJson(value)) ?? "";
  } catch {
    return "";
  }
};

