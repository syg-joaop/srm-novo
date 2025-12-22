<template>
    <div
      class="min-h-screen p-4 sm:p-6 pb-20 transition-colors"
      style="background-color: var(--color-background); color: var(--color-text)"
    >
      <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Prospectos</h1>
    <UiListToolbar
      v-model:search="search"
      v-model:filters="filters"
      :filter-items="filterItems"
      :input-columns="4"
      search-placeholder="Pesquise o Prospecto"
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
            {{ prospectos?.data?.totalItems ?? 0 }} resultados
          </div>
          <ListaProspectos :prospectos="paginatedProspectos" @select="handleSelectProspecto" />

          <UiPaginacao
            v-model:page="currentPage"
            :total-items="prospectos?.data?.totalItems ?? 0"
            :total-pages="prospectos?.data?.totalPages ?? 0"
            class="mt-6"
          />
        </div>

        <div v-else>
          <MapaProspectos :prospectos="prospectos?.data?.items ?? []" />
        </div>
      </div>
    </div>

    <ModalDetalhesParceiro v-model="showModal" :parceiro="selectedProspecto" />
  </div>
</template>

<script setup lang="ts">
import { List, Map } from "lucide-vue-next";
import ModalDetalhesParceiro from "~/components/common/ModalDetalhesParceiro.vue";
import UiListToolbar from "~/components/ui/UiListToolbar.vue";
import UiPaginacao from "~/components/ui/UiPaginacao.vue";
import UiSegmentedControl from "~/components/ui/UiSegmentedControl.vue";
import UiSpinner from "~/components/ui/UiSpinner.vue";
import ListaProspectos from "../components/ListaProspectos.vue";
import MapaProspectos from "../components/MapaProspectos.vue";
import type { Prospecto } from "../prospecto.types";

const viewMode = ref<"list" | "map">("list");
const currentPage = ref(1);
const itemsPerPage = ref(50);
const search = ref("");

const filters = ref({
  fantasia: "",
  cidade: "",
  status: "todos",
  sortBy: "prospecto",
});

const viewModeOptions = [
  { label: "Lista", value: "list", icon: List },
  { label: "Mapa", value: "map", icon: Map },
];

const statusOptions = [
  { label: "Todos", value: "todos" },
  { label: "Ativo", value: "ativo" },
  { label: "Novo", value: "novo" },
  { label: "Inativo", value: "inativo" },
];

const sortOptions = [
  { label: "Prospecto", value: "prospecto" },
  { label: "Cidade", value: "cidade" },
  { label: "Status", value: "status" },
  { label: "Interação +60 dias", value: "sem_interacao" },
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
    defaultValue: "prospecto",
    segmentedFullWidth: true,
    segmentedMobileSize: "xs",
  },
];

const { fetchProspectos } = useProspectoService();

const prospectoFilters = computed(() => ({
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

const { data: prospectos, status } = fetchProspectos(currentPage, itemsPerPage, prospectoFilters);

const isLoading = computed(() => status.value === "pending");

const paginatedProspectos = computed(() => prospectos.value?.data?.items ?? []);

const showModal = ref(false);
const selectedProspecto = ref<Prospecto | null>(null);

const handleSelectProspecto = (prospecto: Prospecto) => {
  selectedProspecto.value = {
    ...prospecto,
  };
  showModal.value = true;
};
</script>
