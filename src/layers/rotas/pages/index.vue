<template>
  <div class="min-h-screen p-4 sm:p-6 bg-[var(--color-background)]">
    <div class="flex flex-col gap-4 mb-6 sm:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Rotas cadastradas</h1>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <UiButton
          variant="primary"
          size="medium"
          class="whitespace-nowrap w-full sm:w-auto"
          @click="showNovaRotaModal = true"
        >
          <Plus class="w-4 h-4" />
          Nova Rota
        </UiButton>

        <UiCalendario
          :range="true"
          :start-date="filtroDataInicio"
          :end-date="filtroDataFim"
          placeholder="Filtrar período"
          class="w-full sm:w-auto"
          @change="(value) => handleDateChange(value as { start: Date | null; end: Date | null })"
        />

        <UiButton
          v-if="filtroDataInicio || filtroDataFim"
          variant="ghost"
          size="small"
          @click="limparFiltros"
        >
          <X class="w-4 h-4" />
          Limpar
        </UiButton>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]"
    >
      <UiSpinner size="large" text="Carregando rotas..." />
    </div>

    <!-- Error state -->
    <UiEmptyState
      v-else-if="error"
      class="py-16"
      title="Erro ao carregar rotas"
      :description="error"
    >
      <template #icon>
        <Icon icon="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
      </template>
      <template #action>
        <UiButton variant="primary" size="small" @click="recarregarRotas">
          Tentar novamente
        </UiButton>
      </template>
    </UiEmptyState>

    <!-- Content -->
    <template v-else>
      <!-- Header da tabela -->
      <div
        v-if="rotas.length > 0"
        class="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--color-background)] rounded-t-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
      >
        <div class="col-span-5">Descrição</div>
        <div class="col-span-2 text-center">Progresso</div>
        <div class="col-span-2 text-center">Status</div>
        <div class="col-span-3 text-end">Ações</div>
      </div>

      <!-- Lista de rotas -->
      <div class="flex flex-col gap-1.5 md:gap-0">
        <RotaCardItem
          v-for="rota in rotasPaginadas"
          :key="rota.id"
          :rota="rota"
          @click="abrirDetalhes"
          @adicao-rapida="adicionarRapido"
        />
      </div>

      <!-- Paginação -->
      <UiPaginacao
        v-if="rotas.length > 0"
        :page="currentPage"
        :total-pages="totalPages"
        class="mt-6"
        @update:page="(p) => (currentPage = p)"
      />

      <!-- Empty state -->
      <UiEmptyState
        v-if="rotas.length === 0"
        title="Nenhuma rota encontrada"
        description="Crie sua primeira rota para começar a organizar seus fornecedores."
      >
        <template #icon>
          <RouteIcon class="w-12 h-12" />
        </template>
        <template #action>
          <UiButton variant="primary" @click="showNovaRotaModal = true">
            <Plus class="w-4 h-4" />
            Nova Rota
          </UiButton>
        </template>
      </UiEmptyState>
    </template>

    <!-- Modais -->
    <ModalNovaRota v-model="showNovaRotaModal" @save="handleRouteCreated" />
    <ModalDetalhesRota v-model="showDetalhesModal" :rota="rotaSelecionada" />
  </div>
</template>

<script setup lang="ts">
import { Icon, Plus, Route as RouteIcon, X } from "lucide-vue-next";
import UiButton from "~/components/ui/UiButton.vue";
import UiCalendario from "~/components/ui/UiCalendario.vue";
import UiEmptyState from "~/components/ui/UiEmptyState.vue";
import UiPaginacao from "~/components/ui/UiPaginacao.vue";
import UiSpinner from "~/components/ui/UiSpinner.vue";
import ModalDetalhesRota from "../components/ModalDetalhesRota.vue";
import ModalNovaRota from "../components/ModalNovaRota.vue";
import RotaCardItem from "../components/RotaCardItem.vue";
import type { Rota, RotaFilters } from "../rotas.types";

definePageMeta({
  layout: "default",
});

// Estado
const showNovaRotaModal = ref(false);
const showDetalhesModal = ref(false);
const rotaSelecionada = ref<Rota | null>(null);
const filtroDataInicio = ref<Date | null>(null);
const filtroDataFim = ref<Date | null>(null);
const currentPage = ref(1);
const itemsPerPage = 10;

// Dados
const rotas = ref<Rota[]>([]);
const totalItems = ref(0);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Service
const rotaService = useRotaService();

// Computed
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage) || 1);

const rotasPaginadas = computed(() => {
  // Se os dados já vêm paginados do backend, retorna direto
  return rotas.value;
});

const filtros = computed<RotaFilters>(() => {
  const filters: RotaFilters = {
    page: currentPage.value,
    itens: itemsPerPage,
  };

  if (filtroDataInicio.value) {
    filters.data_inicio = filtroDataInicio.value.toISOString().split("T")[0];
  }
  if (filtroDataFim.value) {
    filters.data_fim = filtroDataFim.value.toISOString().split("T")[0];
  }

  return filters;
});

/**
 * Carrega rotas do backend
 */
const carregarRotas = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await rotaService.fetchRotas(filtros.value);

    if (response) {
      rotas.value = response.data || [];
      totalItems.value = response.total || response.data?.length || 0;
    } else {
      rotas.value = [];
      totalItems.value = 0;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erro ao carregar rotas";
    console.error("[RotasPage] Erro ao carregar rotas:", err);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Recarrega rotas
 */
const recarregarRotas = () => {
  carregarRotas();
};

/**
 * Abre modal de detalhes
 */
const abrirDetalhes = (rota: Rota) => {
  rotaSelecionada.value = rota;
  showDetalhesModal.value = true;
};

/**
 * Ação de adição rápida
 */
const adicionarRapido = (rota: Rota) => {
  console.log("Adição rápida para rota:", rota.id);
  // TODO: Implementar adição rápida de roteiros
};

/**
 * Handler de filtro de data
 */
const handleDateChange = (value: { start: Date | null; end: Date | null }) => {
  filtroDataInicio.value = value.start;
  filtroDataFim.value = value.end;
  currentPage.value = 1; // Reset para primeira página
};

/**
 * Limpa filtros
 */
const limparFiltros = () => {
  filtroDataInicio.value = null;
  filtroDataFim.value = null;
  currentPage.value = 1;
};

/**
 * Handler de rota criada
 */
const handleRouteCreated = () => {
  console.log("Rota criada com sucesso!");
  carregarRotas();
};

// Watch para recarregar quando filtros mudam
watch([() => currentPage.value, () => filtroDataInicio.value, () => filtroDataFim.value], () => {
  carregarRotas();
});

// Carrega dados iniciais
onMounted(() => {
  carregarRotas();
});
</script>
