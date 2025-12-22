export type OcorrenciaStatus = "pendente" | "acompanhamento" | "concluida";

export interface OcorrenciaFilters {
  search?: string;
  atendente?: string;
  situacao?: string;
  formaAtendimento?: string;
  status?: string;
  ordenarPor?: string;
}

export interface Ocorrencia {
  id: number;
  titulo?: string;
  fornecedor: string;
  dataCadastro?: string;
  atendente: string;
  status: OcorrenciaStatus;
  proximoAtendimento?: string;
  encaminhadoPara?: string;
  diagnosticadoPor?: string;
  formaAtendimento?: string;
  situacao?: string;
}

export interface PaginatedOcorrenciaResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    page: number;
    size: number;
    totalItems?: number;
    totalPages?: number;
    items: unknown[];
  };
}
