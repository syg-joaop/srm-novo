import { firstNumber, firstString, toStringValue } from "~/utils/coerce";
import type {
  AtendimentoItem,
  CargaItem,
  CheckinItem,
  ColetaItem,
  ContatoItem,
  PrecoItem,
} from "~/types/parceiro-detalhes";

const pickNumberOrString = (...values: unknown[]): string | number | undefined => {
  const asNumber = firstNumber(...values);
  if (asNumber !== undefined) return asNumber;
  return firstString(...values);
};

const buildCodigo = (codigo?: string, subcodigo?: string): string | undefined => {
  if (!codigo && !subcodigo) return undefined;
  if (!subcodigo) return codigo;
  if (!codigo) return subcodigo;
  return `${codigo}/${subcodigo}`;
};

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => toStringValue(item)).filter(Boolean) as string[];
  }
  const single = toStringValue(value);
  return single ? [single] : [];
};

export const formatList = (value: unknown, limit = 3): string => {
  const items = Array.from(new Set(toList(value)));
  if (!items.length) return "";
  if (items.length <= limit) return items.join(", ");
  return `${items.slice(0, limit).join(", ")} +${items.length - limit}`;
};

export const normalizePreco = (raw: Record<string, unknown>): PrecoItem => {
  const codigo = buildCodigo(
    firstString(raw.codpro, raw.codigo, raw.cod_produto),
    firstString(raw.subcod, raw.subcodigo, raw.sub_cod),
  );

  return {
    id: firstString(raw.id, raw.codpro, raw.codigo),
    produto: firstString(raw.produto, raw.descricao, raw.nome, raw.item) || "Produto",
    codigo,
    preco: pickNumberOrString(raw.preco, raw.valor, raw.preco_unitario, raw.valor_unitario),
    status: firstString(raw.status),
    tipo: firstString(raw.tipo, raw.tabela),
    unidade: firstString(raw.unidade, raw.un),
  };
};

export const normalizeContato = (raw: Record<string, unknown>): ContatoItem => ({
  id: firstString(raw.id, raw.cod_cfn, raw.seq),
  nome: firstString(raw.nome, raw.contato, raw.nom_cfn, raw.responsavel) || "Contato",
  cargo: firstString(raw.cargo, raw.funcao),
  setor: firstString(raw.setor, raw.departamento),
  telefone: firstString(raw.telefone, raw.fone, raw.tel, raw.tel1, raw.tel2),
  celular: firstString(raw.celular, raw.cel),
  email: firstString(raw.email, raw.e_mail, raw.mail),
});

export const normalizeCarga = (raw: Record<string, unknown>): CargaItem => ({
  id: firstString(raw.boleto, raw.id, raw.sr_recno),
  boleto: firstString(raw.boleto, raw.nr_boleto),
  data: firstString(raw.data_peso, raw.data),
  hora: formatList(raw.hora_peso, 4),
  liquidoTotal: pickNumberOrString(raw.liquido_total, raw.peso_liquido, raw.liquido),
  valorTotal: pickNumberOrString(raw.valor_total, raw.total),
  produtos: formatList(raw.produto, 4),
});

export const normalizeAtendimento = (raw: Record<string, unknown>): AtendimentoItem => ({
  id: firstString(raw.sr_recno, raw.num, raw.id, raw.codigo),
  assunto: firstString(raw.problema, raw.oco, raw.descricao, raw.titulo) || "Atendimento",
  data: firstString(raw.data_oco, raw.data, raw.dataCadastro),
  proximo: firstString(raw.data_pro, raw.data_prox, raw.data_proximo, raw.data_prox_atend),
  status: firstString(raw.status, raw.situacao),
  atendente: firstString(raw.atendente, raw.usuario, raw.responsavel),
});

export const normalizeColeta = (raw: Record<string, unknown>): ColetaItem => ({
  id: firstString(raw.ordem, raw.sr, raw.id),
  ordem: firstString(raw.ordem, raw.sr),
  data: firstString(raw.data, raw.datasai, raw.datache),
  dataSaida: firstString(raw.datasai),
  dataChegada: firstString(raw.datache),
  totalCacamba: firstString(raw.tot_cacamba),
  motorista: firstString(raw.motorista),
  local: firstString(raw.local),
  bairro: firstString(raw.bairro),
  cidade: firstString(raw.cidade),
  uf: firstString(raw.uf),
  obs: firstString(raw.obs),
});

export const normalizeCheckin = (raw: Record<string, unknown>): CheckinItem => ({
  id: firstNumber(raw.id, raw.sr_recno, raw.codigo) ?? firstString(raw.id, raw.sr_recno, raw.codigo),
  fornecedor: firstString(raw.fornecedor, raw.empresa, raw.nome),
  cidade: firstString(raw.cidade, raw.municipio),
  estado: firstString(raw.uf, raw.estado),
  data: firstString(raw.data_checkin, raw.dataCheckin, raw.data, raw.dataCadastro),
  responsavel: firstString(raw.usuario, raw.responsavel, raw.colaborador),
  observacao: firstString(raw.observacao, raw.obs),
  status: firstString(raw.status, raw.situacao),
});
