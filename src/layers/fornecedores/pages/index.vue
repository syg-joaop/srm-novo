<template>
    <div
      class="min-h-screen p-4 sm:p-6 pb-20 transition-colors"
      style="background-color: var(--color-background); color: var(--color-text)"
    >
      <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Fornecedores</h1>
    <UiListToolbar
      v-model:search="search"
      v-model:filters="filters"
      :filter-items="filterItems"
      :input-columns="4"
      search-placeholder="Pesquise o Fornecedor"
    >
      <template #actions>
        <UiSegmentedControl
          v-model="viewMode"
          :options="viewModeOptions"
          class="self-start md:self-auto"
        />
      </template>
    </UiListToolbar>

    <div>
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <UiSpinner size="large" text="Carregando dados..." />
      </div>

      <div v-else>
        <div v-if="viewMode === 'list'">
          <div class="mb-4 font-semibold text-sm" style="color: var(--color-primary)">
            {{ fornecedores?.data.totalItems }} resultados
          </div>
          <ListaFornecedores
            :fornecedores="paginatedFornecedores"
            @select="handleSelectFornecedor"
            @add-route="handleAddToRoute"
          />

          <UiPaginacao
            v-model:page="currentPage"
            :total-items="fornecedores?.data.totalItems"
            :total-pages="fornecedores?.data.totalPages ?? 0"
            class="mt-6"
          />
        </div>

        <div v-else>
          <MapaFornecedores :fornecedores="fornecedores?.data.items" />
        </div>
      </div>
    </div>

    <ModalDetalhesParceiro v-model="showModal" :parceiro="selectedFornecedor" />
    <ModalAdicionarARota
      v-model="showAddRouteModal"
      :fornecedor="fornecedorParaRota"
      @added="handleRouteAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { List, Map } from "lucide-vue-next";
import ModalDetalhesParceiro from "~/components/common/ModalDetalhesParceiro.vue";
import UiListToolbar from "~/components/ui/UiListToolbar.vue";
import UiPaginacao from "~/components/ui/UiPaginacao.vue";
import UiSegmentedControl from "~/components/ui/UiSegmentedControl.vue";
import UiSpinner from "~/components/ui/UiSpinner.vue";
import ListaFornecedores from "../components/ListaFornecedores.vue";
import MapaFornecedores from "../components/MapaFornecedores.vue";
import ModalAdicionarARota from "../components/ModalAdicionarARota.vue";
import type { Fornecedor } from "../fornecedores.types";
import type { Rota } from "~/layers/rotas/rotas.types";

const viewMode = ref<"list" | "map">("list");
const currentPage = ref(1);
const itemsPerPage = ref(50);
const search = ref("");

const filters = ref({
  fantasia: "",
  cidade: "",
  status: "todos",
  sortBy: "fornecedor",
});

const viewModeOptions = [
  { label: "Lista", value: "list", icon: List },
  { label: "Mapa", value: "map", icon: Map },
];

const statusOptions = [
  { label: "Todos", value: "todos" },
  { label: "Ativo", value: "ativo" },
  { label: "Inativo", value: "inativo" },
];

const sortOptions = [
  { label: "Fornecedor", value: "fornecedor" },
  { label: "Cidade", value: "cidade" },
  { label: "Status", value: "status" },
  { label: "Sem carga +60 dias", value: "sem_carga" },
];

const filterItems = [
  {
    key: "fantasia",
    label: "Fantasia",
    type: "input" as const,
    placeholder: "Filtrar por fantasia",
    defaultValue: "",
  },
  {
    key: "cidade",
    label: "Cidade",
    type: "input" as const,
    placeholder: "Filtrar por cidade",
    defaultValue: "",
  },
  {
    key: "status",
    label: "Status",
    type: "segmented" as const,
    options: statusOptions,
    defaultValue: "todos",
    segmentedFullWidth: true,
  },
  {
    key: "sortBy",
    label: "Ordenar por",
    type: "segmented" as const,
    options: sortOptions,
    defaultValue: "fornecedor",
    segmentedFullWidth: true,
    segmentedMobileSize: "xs",
  },
];

const { fetchFornecedor } = useFornecedorService();

const fornecedorFilters = computed(() => ({
  search: search.value,
  fantasia: filters.value.fantasia,
  cidade: filters.value.cidade,
  status: filters.value.status,
  sortBy: filters.value.sortBy,
}));

watch(
  [search, filters],
  () => {
    currentPage.value = 1;
  },
  { deep: true },
);

watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const { data: fornecedores, status } = fetchFornecedor(
  currentPage,
  itemsPerPage,
  fornecedorFilters,
);

const isLoading = computed(() => status.value === "pending");

const paginatedFornecedores = computed(() => fornecedores.value?.data.items ?? []);

const showModal = ref(false);
const selectedFornecedor = ref<Fornecedor | null>(null);

const handleSelectFornecedor = (fornecedor: Fornecedor) => {
  selectedFornecedor.value = {
    ...fornecedor,
    name: fornecedor.fornecedor,
  };
  showModal.value = true;
};

// Modal de adicionar à rota
const showAddRouteModal = ref(false);
const fornecedorParaRota = ref<Fornecedor | null>(null);

const handleAddToRoute = (fornecedor: Fornecedor) => {
  fornecedorParaRota.value = fornecedor;
  showAddRouteModal.value = true;
};

const handleRouteAdded = (rota: Rota) => {
  console.log("Fornecedor adicionado à rota:", rota.id);
  // Pode redirecionar para a rota ou mostrar mensagem de sucesso
};
</script>
