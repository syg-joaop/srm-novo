// Rota (do backend /srm/rotas)
export interface Rota {
  id: number;
  codigo?: number;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  usuario: string;
  usuario_created: string;
  id_usuario: number;
  id_usuario_created: number;
  status: string;
  observacao?: string;
  progresso: RotaProgresso;
}

export interface RotaProgresso {
  total: number;
  concluidos: number;
  em_andamento: number;
  reagendados: number;
  pendentes: number;
  percentual_conclusao: number;
}

export interface RotaResponse {
  message: string;
  total?: number;
  page?: number;
  itens?: number;
  total_pages?: number;
  data: Rota[];
}

export interface RotaFilters {
  page?: number;
  itens?: number;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
}

// Roteiro/Ponto da rota (do backend /srm/roteiro)
export interface Roteiro {
  id: number;
  id_rota: number;
  id_checkin: number;
  nome: string;
  codigo: number;
  sequencia: number;
  status: string;
  observacao?: string;
  endereco: RoteiroEndereco;
  srm_status_roteiro?: RoteiroStatus[];
  created_at?: string;
  updated_at?: string;
}

export interface RoteiroEndereco {
  latitude: number;
  longitude: number;
  rua?: string;
  numero?: string;
  cidade?: string;
  bairro?: string;
  uf?: string;
  cep?: string;
}

export interface RoteiroStatus {
  id: number;
  id_roteiro: number;
  status: string;
  id_usuario: number;
  usuario: string;
  observacao?: string;
  created_at: string;
}

export interface RoteiroResponse {
  message: string;
  total?: number;
  page?: number;
  itens?: number;
  total_pages?: number;
  data: Roteiro[];
}

export interface RoteiroFilters {
  id_rota?: number;
  id_usuario?: number;
  page?: number;
  itens?: number;
}

// API VRP - Request
export interface VrpVehicle {
  id: number;
  description: string;
  maxVolumes?: number;
  maxSpeed?: number;
  avgSpeed?: number;
  maxJobs?: number;
  skills?: string[];
  location: {
    start: { latitude: number; longitude: number } | { fullAddress: string };
    end: { latitude: number; longitude: number } | { fullAddress: string };
  };
  work: {
    start: string; // "HH:mm"
    end: string; // "HH:mm"
  };
  break?: {
    duration: string;
    window: { start: string; end: string };
  };
}

export interface VrpTask {
  id: number;
  type: "catch-only" | "delivery-only" | "pickup-delivery";
  description?: string;
  preparation?: string; // "HH:mm"
  duration?: string; // "HH:mm"
  window?: {
    start: string; // "HH:mm"
    end: string; // "HH:mm"
  };
  skills?: string[];
  loadVolumes?: number;
  priority?: number;
  location: { latitude: number; longitude: number } | { fullAddress: string };
}

export interface VrpRouteRequest {
  timezone: string;
  maxDaysWorking: number;
  estimateTollsCosts?: boolean;
  estimateFuelCosts?: boolean;
  estimateKmCosts?: boolean;
  vehicles: VrpVehicle[];
  tasks: VrpTask[];
}

// API VRP - Response
export interface VrpRouteResponse {
  response: {
    workDays: VrpWorkDay[];
    unassignedTasks: number[];
    summary: VrpSummary;
  };
}

export interface VrpWorkDay {
  day: number;
  plans: VrpPlan[];
}

export interface VrpPlan {
  vehicle: number;
  route: {
    polyline: string; // Encoded polyline
    sequence: VrpSequenceItem[];
  };
  summary: VrpSummary;
}

export interface VrpSequenceItem {
  type: "start" | "job" | "end";
  id: number;
  location: { latitude: number; longitude: number };
  time: {
    arrival: number; // Unix timestamp
    departure: number;
    traveling: number;
    complete: number;
  };
  distance: {
    meters: number;
  };
}

export interface VrpSummary {
  distance: { meters: number };
  time: { duration: number; traveling: number };
}

// Cache de polyline
export interface PolylineCache {
  polyline: string;
  summary: VrpSummary;
  timestamp: number;
  ttl: number;
}

// Status da rota para o mapa
export type RotaStatusType =
  | "aguardando"
  | "em_andamento"
  | "concluida"
  | "cancelada"
  | "pendente";

// Payload para criar roteiro
export interface CreateRoteiroPayload {
  nome: string;
  id_rota: number;
  codigo: number;
  id_checkin?: number;
  endereco: {
    latitude: number;
    longitude: number;
    rua?: string;
    numero?: string;
    cidade?: string;
    bairro?: string;
    uf?: string;
  };
  observacao?: string;
  sequencia?: number;
  status?: string;
}

// Fornecedor para seleção no modal
export interface FornecedorParaRoteiro {
  codfor: string;
  fornecedor: string;
  fanta: string;
  cidade: string;
  uf: string;
  ende: string;
  latitude: string;
  longitude: string;
  latlong: boolean;
}

// Interface simplificada para fornecedores na criação de rota (Frontend only)
export interface FornecedorRotaSimples {
  name: string;
  lat: number;
  lng: number;
}
