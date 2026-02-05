export type LoadStatus = "idle" | "loading" | "success" | "error";

export type FornecedorTab =
  | "precos"
  | "contatos"
  | "cargas"
  | "atendimentos"
  | "coletas"
  | "checkins";

export const FORNECEDOR_TABS: FornecedorTab[] = [
  "precos",
  "contatos",
  "cargas",
  "atendimentos",
  "coletas",
  "checkins",
];

export interface TabState<T> {
  items: T[];
  status: LoadStatus;
  error: string | null;
}

export interface PrecoItem {
  id?: string;
  produto: string;
  codigo?: string;
  preco?: string | number;
  status?: string;
  tipo?: string;
  unidade?: string;
}

export interface ContatoItem {
  id?: string;
  nome: string;
  cargo?: string;
  setor?: string;
  telefone?: string;
  celular?: string;
  email?: string;
}

export interface CargaItem {
  id?: string;
  boleto?: string;
  data?: string;
  hora?: string;
  liquidoTotal?: string | number;
  valorTotal?: string | number;
  produtos?: string;
}

export interface AtendimentoItem {
  id?: string;
  assunto: string;
  data?: string;
  proximo?: string;
  status?: string;
  atendente?: string;
}

export interface ColetaItem {
  id?: string;
  ordem?: string;
  data?: string;
  dataSaida?: string;
  dataChegada?: string;
  totalCacamba?: string;
  motorista?: string;
  local?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  obs?: string;
}

export interface CheckinItem {
  id?: string | number;
  fornecedor?: string;
  cidade?: string;
  estado?: string;
  data?: string;
  responsavel?: string;
  observacao?: string;
  status?: string;
}

export interface ParceiroData {
  name?: string;
  status?: string;
  codfor?: string | number;
  codfornecedor?: string | number;
  comp?: string | number;
  codcom?: string | number;
  fornecedor?: string;
  fanta?: string;
  cidade?: string;
  uf?: string;
  celular?: string;
  fone?: string;
  email?: string;
  ende?: string;
  categoria?: string;
  ultima_carga?: string;
  [key: string]: unknown;
}

export interface ParceiroTabsState {
  precos: TabState<PrecoItem>;
  contatos: TabState<ContatoItem>;
  cargas: TabState<CargaItem>;
  atendimentos: TabState<AtendimentoItem>;
  coletas: TabState<ColetaItem>;
  checkins: TabState<CheckinItem>;
}
