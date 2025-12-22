export interface Prospecto {
  codpros: string;
  prospecto: string;
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
  ultima_interacao: string;
  latitude: string;
  longitude: string;
  latlong: boolean;
}

export type ProspectoMapItem = Pick<
  Prospecto,
  | "prospecto"
  | "cidade"
  | "ultima_interacao"
  | "status"
  | "latitude"
  | "longitude"
  | "latlong"
  | "fanta"
>;

export interface ProspectoResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Prospecto[];
  };
}

export interface ProspectoFilters {
  search?: string;
  fantasia?: string;
  cidade?: string;
  status?: string;
  sortBy?: string;
}
