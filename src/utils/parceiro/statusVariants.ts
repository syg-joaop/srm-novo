import type { Variant } from "~/components/ui/UiBadge.vue";
import { formatLocation } from "~/utils/formatters/location";
import type { CheckinItem } from "~/types/parceiro-detalhes";

export const getPrecoStatusVariant = (status?: string): Variant => {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("aguard")) return "warning";
  if (normalized.includes("aprov")) return "success";
  if (normalized.includes("bloque")) return "danger";
  return "default";
};

export const getAtendimentoStatusVariant = (status?: string): Variant => {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("pend")) return "warning";
  if (normalized.includes("acompan")) return "warning";
  if (normalized.includes("concl")) return "success";
  if (normalized.includes("venc")) return "danger";
  return "default";
};

export const getCheckinStatusVariant = (status?: string): Variant => {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("pend")) return "warning";
  if (normalized.includes("concl") || normalized.includes("ativo") || normalized.includes("ok")) {
    return "success";
  }
  if (normalized.includes("inativ") || normalized.includes("cancel")) return "danger";
  return "default";
};

export const formatCheckinLocation = (checkin: CheckinItem): string => {
  return formatLocation({ cidade: checkin.cidade, estado: checkin.estado });
};
