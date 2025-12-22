export interface Fornecedor {
  codfor: string;
  fornecedor: string;
  fanta: string;
  status: string;
  cidade: string;
  uf: string;
  celular: string;
  tel3: string;
  data: string;
  fone: string;
  email: string;
  ende: string;
  categoria: string;
  oco2: string;
  tf: string;
  comp: string;
  ultima_carga: string;
  latitude: string;
  longitude: string;
  latlong: boolean;
}

export type FornecedorMapItem = Pick<
  Fornecedor,
  | "fornecedor"
  | "cidade"
  | "ultima_carga"
  | "status"
  | "latitude"
  | "longitude"
  | "latlong"
  | "fanta"
>;

export interface FornecedorResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Fornecedor[];
  };
}

export interface FornecedorFilters {
  search?: string;
  fantasia?: string;
  cidade?: string;
  status?: string;
  sortBy?: string;
}
