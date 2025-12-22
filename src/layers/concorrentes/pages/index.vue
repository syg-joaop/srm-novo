<template>
    <div
      class="min-h-screen p-4 sm:p-6 pb-20 transition-colors"
      style="background-color: var(--color-background); color: var(--color-text)"
    >
      <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Concorrentes</h1>

      <UiListToolbar
        v-model:search="search"
        v-model:filters="filters"
        :filter-items="filterItems"
        :input-columns="3"
        search-placeholder="Pesquise o Concorrente"
      />

    <div>
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <UiSpinner size="large" text="Carregando dados..." />
      </div>

      <div v-else>
        <div class="mb-4 font-semibold text-sm" style="color: var(--color-primary)">
          {{ fallbackTotalItems }} resultados
        </div>

        <ListaConcorrentes
          v-if="paginatedConcorrentes.length > 0"
          :concorrentes="paginatedConcorrentes"
          @select="handleSelectConcorrente"
        />

        <UiEmptyState
          v-else
          title="Nenhum concorrente encontrado"
          description="Ainda nao ha concorrentes cadastrados para mostrar aqui."
        >
          <template #icon>
            <Users class="w-12 h-12" />
          </template>
        </UiEmptyState>

        <UiPaginacao
          v-if="paginatedConcorrentes.length > 0"
          v-model:page="currentPage"
          :total-items="fallbackTotalItems"
          :total-pages="totalPages"
          class="mt-6"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users } from "lucide-vue-next";
import UiEmptyState from "~/components/ui/UiEmptyState.vue";
import UiListToolbar from "~/components/ui/UiListToolbar.vue";
import UiPaginacao from "~/components/ui/UiPaginacao.vue";
import UiSpinner from "~/components/ui/UiSpinner.vue";
import ListaConcorrentes from "../components/ListaConcorrentes.vue";
import type { Concorrente, ConcorrenteFilters } from "../concorrentes.types";

definePageMeta({ layout: "default" });

const currentPage = ref(1);
const itemsPerPage = ref(50);

const filters = ref({
  nome: "",
  cidade: "",
  segmento: "",
});

const filterItems = [
  {
    key: "nome",
    label: "Nome",
    type: "input" as const,
    placeholder: "Filtrar por nome",
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
    key: "segmento",
    label: "Segmento",
    type: "input" as const,
    placeholder: "Filtrar por segmento",
    defaultValue: "",
  },
];

const { fetchConcorrentes } = useConcorrenteService();

const concorrentes = computed(() =>
  (concorrentesResponse.value?.data?.items ?? []).map(normalizeConcorrente),
);

const { search, filteredItems: filteredConcorrentes } = useListFilter(concorrentes, {
  searchFields: ["nome"],
  customFilters: (item) => {
    const nome = filters.value.nome.trim().toLowerCase();
    const cidade = filters.value.cidade.trim().toLowerCase();
    const segmento = filters.value.segmento.trim().toLowerCase();

    if (nome && !item.nome.toLowerCase().includes(nome)) return false;
    if (cidade && !(item.cidade ?? "").toLowerCase().includes(cidade)) return false;
    if (segmento && !(item.segmento ?? "").toLowerCase().includes(segmento)) return false;

    return true;
  },
});

const concorrenteFilters = computed<ConcorrenteFilters>(() => ({
  search: search.value,
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

const { data: concorrentesResponse, status } = fetchConcorrentes(
  currentPage,
  itemsPerPage,
  concorrenteFilters,
);

const isLoading = computed(() => status.value === "pending");

const normalizeConcorrente = (raw: Record<string, unknown>): Concorrente => ({
  id:
    toNumber(raw.id) ??
    toNumber(raw.sr_recno) ??
    toNumber(raw.codigo) ??
    toNumber(raw.cod_concorrente) ??
    Date.now(),
  nome:
    toStringValue(raw.nome) ??
    toStringValue(raw.concorrente) ??
    toStringValue(raw.empresa) ??
    toStringValue(raw.apelido) ??
    "â€”",
  cidade: toStringValue(raw.cidade) ?? toStringValue(raw.municipio),
  estado: toStringValue(raw.estado) ?? toStringValue(raw.uf),
  telefone: toStringValue(raw.telefone) ?? toStringValue(raw.celular) ?? toStringValue(raw.fone),
  segmento: toStringValue(raw.segmento) ?? toStringValue(raw.categoria),
  observacao: toStringValue(raw.observacao) ?? toStringValue(raw.obs),
  status: toStringValue(raw.status) ?? toStringValue(raw.situacao),
});

const fallbackTotalItems = computed(
  () => concorrentesResponse.value?.data?.totalItems ?? filteredConcorrentes.value.length,
);

const totalPages = computed(
  () =>
    concorrentesResponse.value?.data?.totalPages ??
    Math.max(1, Math.ceil((fallbackTotalItems.value || 0) / itemsPerPage.value)),
);

const paginatedConcorrentes = computed(() => {
  const items = filteredConcorrentes.value;

  if (concorrentesResponse.value?.data?.totalPages) return items;

  const start = (currentPage.value - 1) * itemsPerPage.value;
  return items.slice(start, start + itemsPerPage.value);
});

const handleSelectConcorrente = (concorrente: Concorrente) => {
  console.log("Selected concorrente:", concorrente);
};
</script>
