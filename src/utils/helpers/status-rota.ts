export type RotaStatusVariant = "default" | "primary" | "success" | "warning" | "danger";

interface StatusConfig {
  label: string;
  color: string;
  variant: RotaStatusVariant;
}

const ROTA_STATUS_MAP: Record<string, StatusConfig> = {
  aguardando: { label: "Aguardando", color: "var(--color-text-muted)", variant: "default" },
  pendente: { label: "Pendente", color: "var(--color-warning)", variant: "warning" },
  em_andamento: { label: "Em Andamento", color: "var(--color-primary)", variant: "primary" },
  concluida: { label: "Concluída", color: "var(--color-success)", variant: "success" },
  cancelada: { label: "Cancelada", color: "var(--color-danger)", variant: "danger" },
};

export const getRotaStatusConfig = (status?: string): StatusConfig => {
  return ROTA_STATUS_MAP[status?.toLowerCase() || ""] || ROTA_STATUS_MAP["aguardando"];
};

export const getRotaStatusLabel = (status?: string): string => getRotaStatusConfig(status).label;
export const getRotaStatusColor = (status?: string): string => getRotaStatusConfig(status).color;
export const getRotaStatusVariant = (status?: string): RotaStatusVariant =>
  getRotaStatusConfig(status).variant;
