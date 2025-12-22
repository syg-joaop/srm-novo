<template>
    <div
      class="min-h-screen p-4 sm:p-6 pb-20 transition-colors"
      style="background-color: var(--color-background); color: var(--color-text)"
    >
      <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Check-in</h1>

    <UiListToolbar
      v-model:search="search"
      v-model:filters="filters"
      :filter-items="filterItems"
      :input-columns="3"
      search-placeholder="Pesquise o Check-in"
    />

    <div>
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <UiSpinner size="large" text="Carregando dados..." />
      </div>

      <div v-else>
        <div class="mb-4 font-semibold text-sm" style="color: var(--color-primary)">
          {{ fallbackTotalItems }} resultados
        </div>

        <ListaCheckins
          v-if="paginatedCheckins.length > 0"
          :checkins="paginatedCheckins"
          @select="handleSelectCheckin"
        />

        <UiEmptyState
          v-else
          title="Nenhum check-in encontrado"
          description="Nao ha registros de check-in para os filtros selecionados."
        >
          <template #icon>
            <MapPin class="w-12 h-12" />
          </template>
        </UiEmptyState>

        <UiPaginacao
          v-if="paginatedCheckins.length > 0"
          v-model:page="currentPage"
          :total-items="fallbackTotalItems"
          :total-pages="totalPages"
          class="mt-6"
        />
      </div>
    </div>

    <ModalDetalhesCheckin v-model="showModal" :checkin="selectedCheckin" />
  </div>
</template>

<script setup lang="ts">
import { MapPin } from "lucide-vue-next";
import UiEmptyState from "~/components/ui/UiEmptyState.vue";
import UiListToolbar from "~/components/ui/UiListToolbar.vue";
import UiPaginacao from "~/components/ui/UiPaginacao.vue";
import UiSpinner from "~/components/ui/UiSpinner.vue";
import ListaCheckins from "../components/ListaCheckins.vue";
import ModalDetalhesCheckin from "../components/ModalDetalhesCheckin.vue";
import type { Checkin, CheckinFilters } from "../checkin.types";

definePageMeta({ layout: "default" });

const currentPage = ref(1);
const itemsPerPage = ref(50);

const filters = ref({
  fornecedor: "",
  responsavel: "",
  cidade: "",
});

const filterItems = [
  {
    key: "fornecedor",
    label: "Fornecedor",
    type: "input" as const,
    placeholder: "Filtrar por fornecedor",
    defaultValue: "",
  },
  {
    key: "responsavel",
    label: "Responsavel",
    type: "input" as const,
    placeholder: "Filtrar por responsavel",
    defaultValue: "",
  },
  {
    key: "cidade",
    label: "Cidade",
    type: "input" as const,
    placeholder: "Filtrar por cidade",
    defaultValue: "",
  },
];

const { fetchCheckins } = useCheckinService();

const checkins = computed(() => (checkinsResponse.value?.data?.items ?? []).map(normalizeCheckin));

const { search, filteredItems: filteredCheckins } = useListFilter(checkins, {
  searchFields: ["fornecedor", "responsavel"],
  customFilters: (item) => {
    const fornecedor = filters.value.fornecedor.trim().toLowerCase();
    const responsavel = filters.value.responsavel.trim().toLowerCase();
    const cidade = filters.value.cidade.trim().toLowerCase();

    if (fornecedor && !item.fornecedor.toLowerCase().includes(fornecedor)) return false;
    if (responsavel && !(item.responsavel ?? "").toLowerCase().includes(responsavel)) return false;
    if (cidade && !(item.cidade ?? "").toLowerCase().includes(cidade)) return false;

    return true;
  },
});

const checkinFilters = computed<CheckinFilters>(() => ({
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

const { data: checkinsResponse, status } = fetchCheckins(currentPage, itemsPerPage, checkinFilters);

const isLoading = computed(() => status.value === "pending");

const normalizeCheckin = (raw: Record<string, unknown>): Checkin => ({
  id:
    toNumber(raw.id) ??
    toNumber(raw.sr_recno) ??
    toNumber(raw.codigo) ??
    toNumber(raw.cod_checkin) ??
    Date.now(),
  fornecedor:
    toStringValue(raw.fornecedor) ??
    toStringValue(raw.empresa) ??
    toStringValue(raw.apelido) ??
    toStringValue(raw.nome) ??
    "â€”",
  cidade: toStringValue(raw.cidade) ?? toStringValue(raw.municipio),
  estado: toStringValue(raw.estado) ?? toStringValue(raw.uf),
  dataCheckin:
    toStringValue(raw.dataCheckin) ??
    toStringValue(raw.data_checkin) ??
    toStringValue(raw.data) ??
    toStringValue(raw.dataCadastro),
  responsavel:
    toStringValue(raw.responsavel) ??
    toStringValue(raw.usuario) ??
    toStringValue(raw.colaborador),
  observacao: toStringValue(raw.observacao) ?? toStringValue(raw.obs),
  status: toStringValue(raw.status) ?? toStringValue(raw.situacao),
  latitude: toNumber(raw.latitude) ?? toNumber(raw.lat),
  longitude: toNumber(raw.longitude) ?? toNumber(raw.lng),
});

const fallbackTotalItems = computed(
  () => checkinsResponse.value?.data?.totalItems ?? filteredCheckins.value.length,
);

const totalPages = computed(
  () =>
    checkinsResponse.value?.data?.totalPages ??
    Math.max(1, Math.ceil((fallbackTotalItems.value || 0) / itemsPerPage.value)),
);

const paginatedCheckins = computed(() => {
  const items = filteredCheckins.value;

  if (checkinsResponse.value?.data?.totalPages) return items;

  const start = (currentPage.value - 1) * itemsPerPage.value;
  return items.slice(start, start + itemsPerPage.value);
});

const showModal = ref(false);
const selectedCheckin = ref<Checkin | null>(null);

const handleSelectCheckin = (checkin: Checkin) => {
  selectedCheckin.value = checkin;
  showModal.value = true;
};
</script>
