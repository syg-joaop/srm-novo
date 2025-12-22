export interface CheckinFilters {
  search?: string;
}

export interface Checkin {
  id: number;
  fornecedor: string;
  cidade?: string;
  estado?: string;
  dataCheckin?: string;
  responsavel?: string;
  observacao?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
}

export interface PaginatedCheckinResponse {
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
