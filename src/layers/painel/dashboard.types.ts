export interface DashboardCount {
  count: string | number;
  tipo: string;
}

export interface DashboardIndicatorResponse {
  access: boolean;
  message: string;
  data: DashboardCount[];
}

export interface Atendente {
  num: string;
  codcli: string;
  codfor: string;
  nome: string;
  data_oco: string;
  atendente: string;
  tipo_ate: string;
  situacao: string;
  status: string;
  data_pro: string;
  oco: string;
  solucao: string;
  usuario: string;
  data: string;
  hora: string;
  empresa: string;
  sr_recno: string;
  hora_oco: string;
  apelido: string;
  atendente_enc: string;
  user_diagnostico: string;
  latitude: string;
  longitude: string;
  problema: string;
}

export interface AtendenteResponse {
  access: boolean;
  message: string;
  data: Atendente[];
}

export interface OccurrenceStat {
  atendimento_geral: number | string;
  atendimento_periodo: number | string;
  atendimento_ok: number | string;
  atendimento_acompanhamento: number | string;
  atendimento_pendente: number | string;
  atendimento_vencido: number | string;
}

export interface OccurrenceHistory {
  count: number;
  data_inicial: string;
  data_final: string;
  mes_ano: string;
  date_part: number;
}

export interface SupplierBirthday {
  fornecedor: string;
  fanta: string;
  oco2: string;
  celular: string;
  tel3: string;
  data: string;
  fone: string;
  email: string;
  status: string;
  ende: string;
  cidade: string;
  uf?: string;
  categoria: string;
  tf: string;
  dat_nasc: string;
  codfor: string;
  dia_nasc: number;
  dia_atual: number;
  ultima_carga: string;
  latitude: string;
  longitude: string;
  latlong: boolean;
}

export interface StaffPerformance {
  setor: string;
  nomefun: string;
  sr_recno: string;
  email: boolean;
  iduser: string;
  codven: string;
  codcom: string;
  codcla: string;
  codcatfor: string;
  atendimento_geral: string;
  atendimento_periodo: string;
  atendimento_ok: string;
  atendimento_acompanhamento: string;
  atendimento_pendente: string;
  atendimento_vencido: string;
}

export interface DailyGoal {
  data: string;
  peso: string;
}

export interface PurchasingStats {
  total: string;
  liquido: string;
  preco_medio: string;
  desconto: string;
  media_diaria: string;
  preco_sem_icms: string;
  icms: string;
  totaldiasuteis: string;
  totalsabados: string;
}

export interface BuyerPerformance {
  nome: string | null;
  atual: string;
  ant: string;
}

export interface TopProduct {
  produto: string | null;
  mes_atual: string;
  mes_anterior: string;
}

export interface DashboardApiResponse {
  indicadoresDashboard: DashboardIndicatorResponse;
  indicadoresDashboardSemComprador: DashboardIndicatorResponse;
  proximosAtendimentos: AtendenteResponse;
  proximosAtendimentosNaoAdmin: AtendenteResponse;
  atendimentosVencidos: AtendenteResponse;
  atendimentosVencidosNaoAdmin: AtendenteResponse;
  ocorrencias12Meses: {
    access: boolean;
    message: string;
    data: OccurrenceStat[];
  };
  ocorrencias12MesesNaoAdmin: {
    access: boolean;
    message: string;
    data: OccurrenceStat[];
  };
  ocorrencias6Meses: {
    access: boolean;
    message: string;
    data: OccurrenceHistory[];
  };
  ocorrencias6MesesNaoAdmin: {
    access: boolean;
    message: string;
    data: OccurrenceHistory[];
  };
  aniversariantesFornecedores: {
    access: boolean;
    message: string;
    data: SupplierBirthday[];
  };
  aniversariantesContatos: { access: boolean; message: string; data: Atendente[] };
  atendentes: { access: boolean; message: string; data: StaffPerformance[] };
  metaDiaria: { access: boolean; message: string; data: DailyGoal[] };
  comprasMes: { access: boolean; message: string; data: PurchasingStats[] };
  comprasMesAnterior: { access: boolean; message: string; data: PurchasingStats[] };
  comprasComprador: {
    access: boolean;
    message: string;
    data: BuyerPerformance[];
  };
  prodsMaisCompradosMes: {
    access: boolean;
    message: string;
    data: TopProduct[];
  };
  totalDescontos: {
    access: boolean;
    message: string;
    data: { mes: string; desconto: number }[];
  };
}

export interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export interface SummaryItem {
  label: string;
  value: string;
}

export interface TableItem {
  name: string;
  current: string;
  previous: string;
}

export interface AniversarianteItem {
  name: string;
  location: string;
  status: string;
  date: string;
}

export interface StatusBadgeItem {
  value: string | number;
  label?: string;
  color: "red" | "green" | "yellow" | "blue" | "purple" | "gray" | "dark-red";
  icon?: string;
}

export interface AtendenteItem {
  role: string;
  s1: number; // Geral
  s2: number; // Periodo
  s3: number; // OK
  s4: number; // Pendente
  statuses: StatusBadgeItem[];
}

export type AtendimentosVencidos = Atendente;

export interface ChartData {
  ocorrenciasPie: {
    value: number;
    name: string;
    itemStyle?: { color: string };
  }[];
  ocorrenciasLine: { months: string[]; values: number[] };
  metaDiaria: { days: string[]; values: number[] };
  descontos: { months: string[]; values: number[] };
  produtosBar: { names: string[]; current: number[]; previous: number[] };
}

export interface DashboardData {
  stats: StatItem[];
  chartData: ChartData;
  comprasMes: SummaryItem[];
  comprasMesAnterior: SummaryItem[];
  compradorItems: TableItem[];
  produtosItems: TableItem[];
  aniversariantesItems: AniversarianteItem[];
  atendentesItems: AtendenteItem[];
}
