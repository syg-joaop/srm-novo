export const normalizeStatus = (status?: string | null): string =>
  (status ?? "").toString().toLowerCase().trim();

export const resolveStatusVariant = (
  status: string | undefined | null,
  map: Record<string, string>,
  fallback = "default",
): string => map[normalizeStatus(status)] || fallback;

export const resolveStatusIconClass = (
  status: string | undefined | null,
  map: Record<string, string>,
  fallback = "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
): string => map[normalizeStatus(status)] || fallback;

export const COMMON_STATUS_VARIANTS = {
  ativo: "success",
  alerta: "warning",
  inativo: "danger",
} as const;

export const COMMON_STATUS_ICON_CLASSES = {
  ativo: "bg-green-500/10 text-green-500",
  alerta: "bg-yellow-500/10 text-yellow-500",
  inativo: "bg-red-500/10 text-red-500",
} as const;

export const COMMON_MAP_STATUS_CONFIG = {
  ativo: { color: "#10b981", label: "Ativo" },
  alerta: { color: "#f59e0b", label: "Alerta" },
  inativo: { color: "#ef4444", label: "Inativo" },
} as const;
