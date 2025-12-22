import type {
  ChartData,
  DashboardApiResponse,
  PurchasingStats,
  SummaryItem,
} from "./dashboard.types";

export function emptyChartData(): ChartData {
  return {
    ocorrenciasPie: [],
    ocorrenciasLine: { months: [], values: [] },
    metaDiaria: { days: [], values: [] },
    descontos: { months: [], values: [] },
    produtosBar: { names: [], current: [], previous: [] },
  };
}

export const formatarLabel = (tipo: string) => tipo.charAt(0).toUpperCase() + tipo.slice(1);

export function mapIcon(tipo: string): string {
  const map: Record<string, string> = {
    Fornecedores: "Building2",
    Prospectos: "UserPlus",
    Ativos: "CheckCircle",
    Inativos: "XCircle",
    Atendimentos: "MessageSquare",
    Vencidos: "AlertTriangle",
    Agendados: "Calendar",
  };
  const key = Object.keys(map).find((k) => k.toLowerCase() === tipo.toLowerCase());
  return key ? map[key] : "Info";
}

export function formatarResumoCompras(data?: PurchasingStats): SummaryItem[] {
  if (!data) return [];
  return [
    { label: "Total Mês", value: formatarMoeda(data.total) },
    { label: "Líquido", value: formatarMoeda(data.liquido) },
    { label: "Preço Médio", value: formatarMoeda(data.preco_medio) },
    { label: "Descontos", value: formatarMoeda(data.desconto) },
  ];
}

export function formatarResumoComprasAnterior(data?: DashboardApiResponse): SummaryItem[] {
  if (!data) return [];
  return [
    { label: "Total Mês", value: formatarMoeda(data.comprasMes.data[0].total ?? 0) },
    {
      label: "Preço Médio",
      value: formatarMoeda(data.comprasMes.data[0].preco_medio ?? 0),
    },
    {
      label: "Média Diária",
      value: formatarMoeda(data.comprasMes.data[0].media_diaria ?? 0),
    },
    { label: "Descontos", value: formatarMoeda(data.comprasMes.data[0].desconto ?? 0) },
  ];
}

export function transformPieData(apiData: DashboardApiResponse) {
  const pieRaw = apiData.ocorrencias12Meses?.data?.[0];
  return pieRaw
    ? [
        {
          value: Number(pieRaw.atendimento_ok),
          name: "Finalizado",
        },
        {
          value: Number(pieRaw.atendimento_acompanhamento),
          name: "Em Acompanhamento",
        },
        {
          value: Number(pieRaw.atendimento_pendente),
          name: "Pendente",
        },
        {
          value: Number(pieRaw.atendimento_vencido),
          name: "Vencido",
        },
      ]
    : [];
}

export function transformLineData(apiData: DashboardApiResponse) {
  const lineRaw = apiData.ocorrencias6Meses?.data ?? [];
  return {
    months: lineRaw.map((i: { mes_ano: string }) => i.mes_ano),
    values: lineRaw.map((i: { count: number }) => i.count),
  };
}

export function transformMetaData(apiData: DashboardApiResponse) {
  const metaRaw = apiData.metaDiaria?.data ?? [];
  return {
    days: metaRaw.map((i: { data: string }) => {
      if (!i.data) return "";
      const parts = i.data.split("/");
      return parts.length === 3 ? `${parts[0]}/${parts[1]}` : i.data;
    }),
    values: metaRaw.map((i: { peso: string }) => Number(i.peso)),
  };
}

export function transformDescData(apiData: DashboardApiResponse) {
  const descRaw = apiData.totalDescontos?.data ?? [];
  return {
    months: descRaw.map((i: { mes: string }) => i.mes),
    values: descRaw.map((i: { desconto: number }) => i.desconto),
  };
}

export function transformProdutosData(apiData: DashboardApiResponse) {
  const raw = apiData.prodsMaisCompradosMes?.data ?? [];
  return {
    names: raw.slice(0, 10).map((p: { produto: string | null }) => p.produto ?? "Produto Desc."),
    current: raw.slice(0, 10).map((p: { mes_atual: string }) => Number(p.mes_atual)),
    previous: raw.slice(0, 10).map((p: { mes_anterior: string }) => Number(p.mes_anterior)),
  };
}
