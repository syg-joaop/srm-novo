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
) => {
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

  // Debug: verificar headers antes de criar o client
  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.log("[createApiClient] Headers:", {
      baseURL,
      hasToken: !!options?.token,
      hasSecret: !!options?.secret,
      secretLength: options?.secret?.length ?? 0,
      headers: Object.keys(headers),
    });
  }

  return $fetch.create({
    baseURL,
    headers,
    onRequest({ request, options: fetchOptions }) {
      // Garantir que o header x-secret seja sempre passado se existir
      if (headers["x-secret"] && fetchOptions.headers) {
        if (fetchOptions.headers instanceof Headers) {
          fetchOptions.headers.set("x-secret", headers["x-secret"]);
        } else if (typeof fetchOptions.headers === "object") {
          (fetchOptions.headers as Record<string, string>)["x-secret"] = headers["x-secret"];
        }
      }

      // Debug: verificar headers na requisição
      if (import.meta.dev) {
        let xSecret = "ausente";
        if (fetchOptions.headers instanceof Headers) {
          xSecret = fetchOptions.headers.get("x-secret") ? "presente" : "ausente";
        } else if (fetchOptions.headers && typeof fetchOptions.headers === "object") {
          const requestHeaders = fetchOptions.headers as Record<string, string>;
          xSecret = requestHeaders["x-secret"] ? "presente" : "ausente";
        }
        // eslint-disable-next-line no-console
        console.log("[createApiClient] Request:", {
          url: request,
          xSecret,
          hasSecretInConfig: !!headers["x-secret"],
        });
      }
    },
    onResponseError({ response }) {
      // eslint-disable-next-line no-console
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
  const secret = config.public.apiSecret?.trim();

  return createApiClient(baseURL, {
    token: token ?? undefined,
    secret: secret && secret.length > 0 ? secret : undefined,
  });
};

export const useAuthApi = () => {
  const config = useRuntimeConfig();
  // TODO: Remover hardcode após corrigir variáveis de ambiente
  const secret = "ZThiMGYzZjhkNGNjNjhmMmViY2Q1NjgwY2FlMGM0ZTU="; // Hardcoded temporariamente
  // const secret = config.public.apiSecret?.trim();

  // Debug: verificar se o secret está disponível
  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.log("[useAuthApi] Config:", {
      apiBaseUrl: config.public.apiBaseUrl,
      apiSecret: secret ? `${secret.substring(0, 4)}...` : "vazio/undefined",
      apiSecretLength: secret?.length ?? 0,
      usingHardcoded: true,
    });
  }

  return createApiClient(config.public.apiBaseUrl, {
    secret: secret && secret.length > 0 ? secret : undefined,
  });
};
