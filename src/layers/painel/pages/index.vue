<template>
  <div
    class="dashboard-page min-h-screen text-gray-900 dark:text-white p-4 sm:p-6"
    style="
      background-color: var(--color-background);
      transition:
        background-color 0.3s ease,
        color 0.3s ease;
    "
  >
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <MobileStatsWidget :stats="stats" class="lg:hidden mb-6" />

      <div class="hidden lg:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          v-for="stat in stats"
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :icon="stat.icon"
          :color="stat.color"
        />
      </div>

      <div>
        <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Compras</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ComprasCard
            title="Compras do mês"
            subtitle="Período atual"
            :main-value="comprasMes[0]?.value || 'R$ 0,00'"
            main-label="Total"
            :metrics="comprasMetricsMes"
            variant="current"
          />

          <ComprasCard
            title="Mês anterior"
            subtitle="Período comparativo"
            :main-value="comprasMesAnterior[0]?.value || 'R$ 0,00'"
            main-label="Total"
            :metrics="comprasMetricsMesAnterior"
            variant="previous"
          />
        </div>
      </div>

      <div>
        <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Atendimentos</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardWidget
            class="!h-[470px]"
            title="Próximos atendimentos"
            subtitle="Ocorrências com data de próximo atendimento"
          >
            <UiEmptyState
              :icon="Search"
              title="Sem agendamentos"
              description="Não existem atendimentos agendados"
            />
          </DashboardWidget>

          <DashboardWidget
            class="!h-[470px]"
            title="Atendimentos vencidos"
            subtitle="Ocorrências abertas com data vencida"
            :items="atendimentosVencidos"
            :paginated="true"
            :page-size="6"
            :empty-icon="AlertCircle"
            empty-title="Nenhum atendimento vencido"
            empty-description="Não existem atendimentos com data vencida"
          >
            <template #default="{ paginatedItems }">
              <div class="space-y-2">
                <UiListItem
                  v-for="item in paginatedItems"
                  :key="item.sr_recno"
                  class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  @click="handleOpenAtendimentoModal(item)"
                >
                  <template #leading>
                    <UiDateBox label="VENC" variant="danger">{{
                      item.data_oco.substring(0, 2)
                    }}</UiDateBox>
                  </template>

                  <div class="flex justify-between items-start">
                    <p
                      class="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate pr-2 group-hover/item:text-red-600 dark:group-hover/item:text-red-400 transition-colors"
                    >
                      {{ item.apelido }}
                    </p>
                  </div>

                  <div class="flex items-center gap-2 mt-0.5">
                    <span
                      class="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]"
                      >{{ item.empresa }}</span
                    >
                  </div>

                  <template #action>
                    <div class="flex gap-1">
                      <button
                        class="p-1.5 hover:bg-white dark:hover:bg-gray-800 text-primary rounded-full shadow-sm transition-colors"
                        title="Ver detalhes"
                      >
                        <List class="w-3.5 h-3.5" />
                      </button>
                      <button
                        class="p-1.5 hover:bg-white dark:hover:bg-gray-800 text-green-500 rounded-full shadow-sm transition-colors"
                        title="Resolver"
                      >
                        <CheckSquare class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </template>
                </UiListItem>
              </div>
            </template>
          </DashboardWidget>
        </div>
      </div>

      <div>
        <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Relatórios</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div
            class="rounded-xl sm:rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:shadow-lg"
            style="background-color: var(--color-surface); border-color: var(--color-border-subtle)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-1 h-8 rounded-full bg-primary"
                  style="box-shadow: 0 0 8px rgba(0, 153, 255, 0.5)"
                ></div>
                <div>
                  <h3 class="text-sm sm:text-base font-bold" style="color: var(--color-text)">
                    Ocorrências
                  </h3>
                  <p class="text-[10px] sm:text-xs mt-0.5" style="color: var(--color-text-muted)">
                    Últimos 12 meses por status
                  </p>
                </div>
              </div>
            </div>

            <div v-if="!isOcorrenciasPieEmpty" class="h-[320px] sm:h-[350px]">
              <OcorrenciasChart :data="chartData.ocorrenciasPie" />
            </div>

            <div v-else class="h-[320px] sm:h-[350px] flex items-center justify-center">
              <UiEmptyState
                :icon="PieChart"
                title="Sem ocorrências"
                description="Não há ocorrências no período"
              />
            </div>
          </div>

          <DashboardWidget
            class="!h-[450px]"
            title="Ocorrências"
            subtitle="Quantidade por mês nos últimos 6 meses"
            :is-empty="isOcorrenciasLineEmpty"
            :empty-icon="LineChart"
            empty-title="Sem ocorrências"
            empty-description="Não há ocorrências nos últimos 6 meses"
          >
            <div ref="lineChartRef" class="w-full h-full min-h-[250px]"></div>
          </DashboardWidget>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DashboardWidget
            class="h-[450px]"
            title="Meta diária"
            subtitle="Por KG"
            :is-empty="isMetaDiariaEmpty"
            :empty-icon="Target"
            empty-title="Sem dados de meta"
            empty-description="Não há dados de meta diária disponíveis"
          >
            <div ref="barChartRef" class="w-full h-full min-h-[250px]"></div>
          </DashboardWidget>

          <DashboardWidget
            class="!h-[450px]"
            title="Compras X Comprador"
            subtitle="Quantidade por mês nos últimos 6 meses"
            :items="compradorItems"
            :paginated="true"
            :page-size="6"
            :empty-icon="ShoppingCart"
            empty-title="Nenhuma compra registrada"
            empty-description="Não existem compras no período selecionado"
          >
            <template #default="{ paginatedItems }">
              <div class="-mx-6">
                <table class="w-full table-fixed text-sm text-left">
                  <thead
                    class="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
                  >
                    <tr>
                      <th class="px-6 py-3 font-semibold tracking-wider">Comprador</th>
                      <th class="px-6 py-3 font-semibold text-center tracking-wider">Mês atual</th>
                      <th class="px-6 py-3 font-semibold text-center tracking-wider">
                        Mês anterior
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in paginatedItems"
                      :key="item.name"
                      class="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group/row"
                    >
                      <td
                        class="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 truncate group-hover/row:text-primary transition-colors"
                      >
                        {{ item.name }}
                      </td>
                      <td class="px-6 py-3 text-center">
                        <span class="font-bold text-xs text-green-600 dark:text-green-400">
                          {{ item.current }}
                        </span>
                      </td>
                      <td
                        class="px-6 py-3 text-center text-gray-500 dark:text-gray-400 font-medium text-xs"
                      >
                        {{ item.previous }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </DashboardWidget>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DashboardWidget
            class="!h-[520px]"
            title="Produtos mais comprados"
            subtitle="Comparativo Mensal"
            :is-empty="isProdutosBarEmpty"
            :empty-icon="Package"
            empty-title="Sem produtos"
            empty-description="Não há dados de produtos comprados"
          >
            <template #subheader v-if="!isProdutosBarEmpty">
              <div
                class="sm:hidden grid grid-cols-[minmax(0,1fr)_1fr] gap-4 px-2 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]"
              >
                <span>Produto</span>
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>
                    <span>Atual</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span
                      class="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] opacity-50"
                    ></span>
                    <span>Anterior</span>
                  </div>
                </div>
              </div>
              <div
                class="hidden sm:grid grid-cols-[minmax(0,1fr)_120px_120px_90px] gap-8 px-2 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]"
              >
                <span class="justify-self-start">Produto</span>
                <div class="flex items-center gap-1.5 justify-self-start">
                  <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>
                  <span>Atual</span>
                </div>
                <div class="flex items-center gap-1.5 justify-self-start">
                  <span
                    class="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] opacity-50"
                  ></span>
                  <span>Anterior</span>
                </div>
                <span class="justify-self-start">Variacao</span>
              </div>
            </template>
            <ProdutosRankingList :data="chartData.produtosBar" />
          </DashboardWidget>

          <DashboardWidget
            class="h-[520px]"
            title="Total de descontos"
            subtitle="Por KG"
            :is-empty="isDescontosEmpty"
            :empty-icon="Percent"
            empty-title="Sem descontos"
            empty-description="Não há dados de descontos disponíveis"
          >
            <div ref="discountChartRef" class="w-full h-full min-h-[250px]"></div>
          </DashboardWidget>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardWidget
            class="!h-[505px]"
            title="Aniversariantes"
            subtitle="Contatos com aniversário próximo"
            :items="aniversariantesItems"
            :paginated="true"
            :page-size="6"
            :show-tabs="true"
            :empty-icon="Cake"
            empty-title="Nenhum aniversariante"
            empty-description="Não há aniversariantes próximos"
          >
            <template #default="{ paginatedItems }">
              <div class="space-y-2">
                <UiListItem
                  v-for="item in paginatedItems"
                  :key="item.name"
                  @click="handleOpenParceiroModal(item)"
                >
                  <template #leading>
                    <UiDateBox label="DIA">{{ item.date.split("/")[0] }}</UiDateBox>
                  </template>

                  <div class="flex justify-between items-start">
                    <p
                      class="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate pr-2 group-hover/item:text-primary-dark dark:group-hover/item:text-primary transition-colors"
                    >
                      {{ item.name }}
                    </p>
                  </div>

                  <div class="flex items-center gap-2 mt-0.5">
                    <span
                      class="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]"
                      >{{ item.location }}</span
                    >
                    <span
                      class="hidden sm:block w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600"
                    ></span>
                    <span
                      class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border"
                      :style="{
                        color:
                          item.status === 'Ativo'
                            ? 'var(--color-status-finalizado)'
                            : 'var(--color-status-vencido)',
                        borderColor:
                          item.status === 'Ativo'
                            ? 'var(--color-status-finalizado)'
                            : 'var(--color-status-vencido)',
                      }"
                    >
                      {{ item.status }}
                    </span>
                  </div>

                  <template #action>
                    <button
                      class="p-1.5 rounded-full shadow-sm transition-colors text-[var(--color-text-muted)] group-hover/item:text-[var(--color-primary)] hover:bg-[var(--color-hover)]"
                      title="Enviar felicitações"
                    >
                      <Gift class="w-3.5 h-3.5" />
                    </button>
                  </template>
                </UiListItem>
              </div>
            </template>
          </DashboardWidget>

          <DashboardWidget
            class="!h-[505px]"
            title="Atendentes"
            subtitle="Atendimentos por usuários"
            :items="atendentesItems"
            :paginated="true"
            :page-size="6"
            :empty-icon="Users"
            empty-title="Nenhum atendente"
            empty-description="Não há dados de atendentes disponíveis"
          >
            <template #default="{ paginatedItems }">
              <div class="space-y-3">
                <UiListItem
                  v-for="(item, idx) in paginatedItems"
                  :key="idx"
                  class="min-h-[60px]"
                  @click="handleOpenAtendenteModal(item)"
                >
                  <template #leading>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {{ item.role }}
                      </span>
                    </div>
                  </template>
                  <UiStatusBadgeGroup :items="item.statuses" />
                </UiListItem>
              </div>
            </template>
          </DashboardWidget>
        </div>
      </div>
    </div>

    <CommonModalDetalhesParceiro
      v-model="showParceiroModal"
      :parceiro="parceiroSelecionado"
      :variant="modalVariant"
    />

    <CommonModalAtendimento v-model="showAtendimentoModal" :atendimento="atendimentoSelecionado" />
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  Cake,
  CheckSquare,
  Gift,
  LineChart,
  List,
  Package,
  Percent,
  PieChart,
  Search,
  ShoppingCart,
  Target,
  Users,
} from "lucide-vue-next";
import type { AniversarianteItem, Atendente, AtendenteItem } from "../dashboard.types";
import { useDashboardCharts } from "../composables/useDashboardCharts";
import { useDashboardStore } from "../stores/dashboard";
definePageMeta({
  layout: "default",
});

const { fetchDashboard } = useDashboardService();

const filters = ref({
  data_inicial: dataAtualPrimeiroDiaMes(),
  data_final: dataAtualUltimoDiaMes(),
  data_inicial2: dataAtualPrimeiroDiaMes(),
  data_final2: dataAtualUltimoDiaMes(),
  categoriaFornecedor: "12",
  filial: "TODAS",
  mes_grafico: "atual",
});

const { data, status } = await fetchDashboard(filters);
const isLoading = computed(() => status.value === "pending");

const dashboardStore = useDashboardStore();
const {
  stats,
  comprasMes,
  comprasMesAnterior,
  compradorItems,
  aniversariantesItems,
  atendentesItems,
  chartData,
  atendimentosVencidos,
  isOcorrenciasPieEmpty,
  isOcorrenciasLineEmpty,
  isMetaDiariaEmpty,
  isDescontosEmpty,
  isProdutosBarEmpty,
} = storeToRefs(dashboardStore);

const showParceiroModal = ref(false);
const parceiroSelecionado = ref<AniversarianteItem | (AtendenteItem & { name: string }) | null>(
  null,
);
const modalVariant = ref<"parceiro" | "atendente" | "time">("parceiro");

const showAtendimentoModal = ref(false);
const atendimentoSelecionado = ref<Atendente | null>(null);

const handleOpenAtendimentoModal = (atendimento: Atendente) => {
  atendimentoSelecionado.value = atendimento;
  showAtendimentoModal.value = true;
};

const handleOpenParceiroModal = (parceiro: AniversarianteItem) => {
  modalVariant.value = "parceiro";
  parceiroSelecionado.value = parceiro;
  showParceiroModal.value = true;
};

const handleOpenAtendenteModal = (atendente: AtendenteItem) => {
  modalVariant.value = "atendente";
  parceiroSelecionado.value = {
    ...atendente,
    name: atendente.role,
  };
  showParceiroModal.value = true;
};

const mapResumoMetrics = (items: { label: string; value: string | number }[]) =>
  items.slice(1).map((item) => ({
    label: item.label,
    value: item.value,
  }));

const comprasMetricsMes = computed(() => mapResumoMetrics(comprasMes.value));
const comprasMetricsMesAnterior = computed(() => mapResumoMetrics(comprasMesAnterior.value));

const { lineChartRef, barChartRef, discountChartRef, initCharts } = useDashboardCharts(
  chartData,
);

watch(
  data,
  (newData) => {
    if (newData) {
      dashboardStore.setDashboardData(newData);
      nextTick(() => {
        initCharts();
      });
    }
  },
  { immediate: true },
);

</script>

<style scoped></style>
