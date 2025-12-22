export const OFFLINE_CACHE_TTL_BY_KEY = {
  fornecedores: 5 * 60 * 1000,
  prospectos: 5 * 60 * 1000,
  concorrentes: 10 * 60 * 1000,
  ocorrencias: 2 * 60 * 1000,
  checkins: 1 * 60 * 1000,
  rotas: 5 * 60 * 1000,
} as const;

export type OfflineCacheKeyName = keyof typeof OFFLINE_CACHE_TTL_BY_KEY;

export const getOfflineCacheTtl = (key: string, override?: number): number | undefined => {
  if (typeof override === "number") return override;
  if (key in OFFLINE_CACHE_TTL_BY_KEY) {
    return OFFLINE_CACHE_TTL_BY_KEY[key as OfflineCacheKeyName];
  }
  return undefined;
};

