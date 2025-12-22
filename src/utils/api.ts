import type { $Fetch } from "ofetch";

const AUTH_STORAGE_KEY = "srm_auth_user";

const readTokenFromStorage = (): string | null => {
  if (!import.meta.client) return null;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as { token?: unknown } | null;
    return typeof parsed?.token === "string" ? parsed.token : null;
  } catch {
    return null;
  }
};

const createApiClient = (
  baseURL: string,
  options?: { token?: string; secret?: string },
): $Fetch => {
  if (!baseURL) {
    throw new Error("API baseURL nao configurada.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options?.secret) {
    headers["x-secret"] = options.secret;
  }

  return $fetch.create({
    baseURL,
    headers,
    onResponseError({ response }) {
      console.error(`[API Error] ${response.status}`, {
        url: response.url,
        data: response._data,
      });
    },
  });
};

export const useMainApi = (homol?: boolean) => {
  const config = useRuntimeConfig();
  const token = readTokenFromStorage();
  const baseURL = homol ? config.public.apiV2UrlHomol : config.public.apiV2Url;

  return createApiClient(baseURL, {
    token: token ?? undefined,
    secret: config.public.apiSecret || undefined,
  });
};

export const useAuthApi = () => {
  const config = useRuntimeConfig();
  return createApiClient(config.public.apiBaseUrl, {
    secret: config.public.apiSecret || undefined,
  });
};
