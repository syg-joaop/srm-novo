import { defineStore } from "pinia";
import {
  emptyChartData,
  formatarLabel,
  formatarResumoCompras,
  mapIcon,
  transformDescData,
  transformLineData,
  transformMetaData,
  transformPieData,
  transformProdutosData,
} from "../dashboard.helpers";
import type {
  AniversarianteItem,
  Atendente,
  AtendenteItem,
  ChartData,
  DashboardApiResponse,
  DashboardCount,
  StatItem,
  SummaryItem,
  TableItem,
} from "../dashboard.types";

export const useDashboardStore = defineStore("dashboard", () => {
  const rawData = ref<DashboardApiResponse | null>(null);

  const defaultStats: StatItem[] = [
    { label: "Fornecedores", value: 0, icon: "Building2", color: "bg-primary" },
    { label: "Prospectos", value: 0, icon: "UserPlus", color: "bg-primary" },
    { label: "Ativos", value: 0, icon: "CheckCircle", color: "bg-primary" },
    { label: "Inativos", value: 0, icon: "XCircle", color: "bg-primary" },
    { label: "Atendimentos", value: 0, icon: "MessageSquare", color: "bg-primary" },
    { label: "Vencidos", value: 0, icon: "AlertTriangle", color: "bg-primary" },
    { label: "Agendados", value: 0, icon: "Calendar", color: "bg-primary" },
  ];

  const stats = computed<StatItem[]>(() => {
    const items = rawData.value?.indicadoresDashboard?.data ?? [];
    if (items.length === 0) return defaultStats;

    return items.map((item: DashboardCount) => ({
      label: formatarLabel(item.tipo),
      value: item.count ?? 0,
      icon: mapIcon(item.tipo),
      color: "bg-primary",
    }));
  });

  const chartData = computed<ChartData>(() => {
    const apiData = rawData.value;
    if (!apiData) return emptyChartData();

    return {
      ocorrenciasPie: transformPieData(apiData),
      ocorrenciasLine: transformLineData(apiData),
      metaDiaria: transformMetaData(apiData),
      descontos: transformDescData(apiData),
      produtosBar: transformProdutosData(apiData),
    };
  });

  const comprasMes = computed<SummaryItem[]>(() => {
    const data = rawData.value?.comprasMes?.data?.[0];
    return formatarResumoCompras(data);
  });

  const comprasMesAnterior = computed<SummaryItem[]>(() => {
    const data = rawData.value?.comprasMes?.data?.[0];
    return formatarResumoCompras(data);
  });

  const compradorItems = computed<TableItem[]>(() => {
    const data = rawData.value?.comprasComprador?.data ?? [];
    return data.map((c) => ({
      name: c.nome ?? "Não identificado",
      current: formatarMoeda(c.atual),
      previous: formatarMoeda(c.ant),
    }));
  });

  const produtosItems = computed<TableItem[]>(() => {
    const data = rawData.value?.prodsMaisCompradosMes?.data ?? [];
    return data.map((p) => ({
      name: p.produto ?? "Produto desc.",
      current: formatarMoeda(p.mes_atual),
      previous: formatarMoeda(p.mes_anterior),
    }));
  });

  const aniversariantesItems = computed<AniversarianteItem[]>(() => {
    const data = rawData.value?.aniversariantesFornecedores?.data ?? [];
    return data.map((a) => ({
      name: a.fornecedor,
      location: a.uf ? `${a.cidade}/${a.uf}` : a.cidade,
      status: a.status,
      date: a.dat_nasc,
    }));
  });

  const atendentesItems = computed<AtendenteItem[]>(() => {
    const data = rawData.value?.atendentes?.data ?? [];
    return data.map((a) => ({
      role: a.setor || "Geral",
      s1: Number(a.atendimento_geral),
      s2: Number(a.atendimento_periodo),
      s3: Number(a.atendimento_ok),
      s4: Number(a.atendimento_pendente),
      statuses: [
        {
          value: Number(a.atendimento_periodo),
          label: "Período",
          color: "gray",
          icon: "calendar",
        },
        {
          value: Number(a.atendimento_ok),
          label: "OK",
          color: "green",
          icon: "check",
        },
        {
          value: Number(a.atendimento_pendente),
          label: "Pendente",
          color: "yellow",
          icon: "clock",
        },
        {
          value: Number(a.atendimento_geral),
          label: "Geral",
          color: "red",
          icon: "x",
        },
      ],
    }));
  });

  const atendimentosVencidos = computed<Atendente[]>(() => {
    return rawData.value?.atendimentosVencidos?.data ?? [];
  });

  const isOcorrenciasPieEmpty = computed(() => {
    const list = chartData.value.ocorrenciasPie;
    return list.length === 0 || list.every((item) => item.value === 0);
  });

  const isOcorrenciasLineEmpty = computed(() => {
    const values = chartData.value.ocorrenciasLine.values;
    return values.length === 0 || values.every((v) => v === 0);
  });

  const isMetaDiariaEmpty = computed(() => {
    const values = chartData.value.metaDiaria.values;
    return values.length === 0 || values.every((v) => v === 0);
  });

  const isDescontosEmpty = computed(() => {
    const values = chartData.value.descontos.values;
    return values.length === 0 || values.every((v) => v === 0);
  });

  const isProdutosBarEmpty = computed(() => {
    const data = chartData.value.produtosBar;
    return (
      data.names.length === 0 ||
      (data.current.every((v) => v === 0) && data.previous.every((v) => v === 0))
    );
  });

  function setDashboardData(data: DashboardApiResponse | null) {
    rawData.value = data;
  }

  return {
    rawData,
    setDashboardData,
    stats,
    chartData,
    comprasMes,
    comprasMesAnterior,
    compradorItems,
    produtosItems,
    aniversariantesItems,
    atendentesItems,
    atendimentosVencidos,
    isOcorrenciasPieEmpty,
    isOcorrenciasLineEmpty,
    isMetaDiariaEmpty,
    isDescontosEmpty,
    isProdutosBarEmpty,
  };
});
