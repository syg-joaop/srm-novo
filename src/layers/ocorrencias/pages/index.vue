<template>
  <div
    class="min-h-screen p-4 sm:p-6 pb-20 transition-colors"
    style="background-color: var(--color-background); color: var(--color-text)"
  >
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Ocorrencias</h1>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div class="flex items-center gap-2 w-full md:max-w-xl">
        <UiButton variant="primary" size="medium" class="whitespace-nowrap hidden sm:flex">
          <Plus class="w-4 h-4" />
          Nova Ocorrência
        </UiButton>

        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style="color: var(--color-text-muted)"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pesquisar..."
            class="w-full rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all border"
            style="
              background-color: var(--color-surface);
              border-color: var(--color-border);
              color: var(--color-text);
            "
          />
        </div>

        <button
          class="p-2.5 rounded-lg border transition-colors relative"
          :style="[
            showFilters
              ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: '#fff',
                }
              : {
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-muted)',
                },
          ]"
          @click="showFilters = !showFilters"
        >
          <Filter class="w-5 h-5" />
          <span
            v-if="activeFiltersCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded-full"
            style="background-color: var(--color-danger); color: #fff"
          >
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showFilters"
        class="mb-6 p-3 sm:p-4 rounded-lg border"
        style="border-color: var(--color-border); background-color: var(--color-surface)"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
          <UiSelect
            v-model="filters.atendente"
            label="Atendente"
            :options="atendenteOptions"
            placeholder="Selecione o atendente"
          />
          <UiSelect
            v-model="filters.situacao"
            label="Situação"
            :options="situacaoOptions"
            placeholder="Todos"
          />
          <UiSelect
            v-model="filters.formaAtendimento"
            label="Forma de Atendimento"
            :options="formaAtendimentoOptions"
            placeholder="Todos"
          />
          <UiSelect
            v-model="filters.status"
            label="Status"
            :options="statusOptions"
            placeholder="Todos"
          />
          <UiSelect
            v-model="filters.ordenarPor"
            label="Ordenar por"
            :options="ordenarPorOptions"
            placeholder="Data de cadastro"
          />
        </div>

        <button
          v-if="activeFiltersCount > 0"
          class="flex items-center gap-1.5 text-sm font-medium transition-colors px-2 py-1.5 hover:opacity-80"
          style="color: var(--color-danger)"
          @click="clearFilters"
        >
          <X class="w-4 h-4" />
          Limpar filtros
        </button>
      </div>
    </Transition>

    <div>
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <UiSpinner size="large" text="Carregando dados..." />
      </div>

      <div v-else>
        <div class="mb-4 font-semibold text-sm" style="color: var(--color-primary)">
          {{ fallbackTotalItems }} resultados
        </div>

        <div v-if="paginatedOcorrencias.length > 0">
          <div
            class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--color-background)] rounded-t-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
          >
            <div class="col-span-1">Status</div>
            <div class="col-span-3">Fornecedor</div>
            <div class="col-span-2">Data Cadastro</div>
            <div class="col-span-2">Atendente</div>
            <div class="col-span-3">Titulo</div>
            <div class="col-span-1 text-center">Ações</div>
          </div>

          <div class="flex flex-col gap-1.5 md:gap-0">
            <div
              v-for="item in paginatedOcorrencias"
              :key="item.id"
              class="group/item relative bg-[var(--color-surface)] md:rounded-none first:md:rounded-t-none last:md:rounded-b-lg rounded-lg border border-[var(--color-border-subtle)] md:border-[var(--color-border)] md:border-t-0 first:md:border-t hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-soft)] transition-all duration-300 ease-out hover:shadow-sm px-3 py-3 md:px-5 md:py-2.5 cursor-pointer"
              @click="abrirDetalhes(item)"
            >
              <div
                class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[var(--color-primary)] rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
              ></div>

              <div class="hidden md:grid md:grid-cols-12 gap-4 items-center">
                <div class="col-span-1 flex items-center">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center group-hover/item:scale-105 transition-transform duration-200"
                    :class="getStatusIconClass(item.status)"
                  >
                    <Eye class="w-4 h-4" />
                  </div>
                </div>

                <div class="col-span-3 flex items-center">
                  <span
                    class="text-sm font-medium text-[var(--color-text)] group-hover/item:text-[var(--color-primary)] transition-colors truncate"
                  >
                    {{ item.fornecedor }}
                  </span>
                </div>

                <div class="col-span-2 flex items-center">
                  <span class="text-sm text-[var(--color-text-muted)]">
                    {{ formatarData(item.dataCadastro) || "-" }}
                  </span>
                </div>

                <div class="col-span-2 flex items-center">
                  <span class="text-sm text-[var(--color-text-muted)]">
                    {{ item.atendente }}
                  </span>
                </div>

                <div class="col-span-3 flex items-center">
                  <span class="text-sm text-[var(--color-text-muted)] truncate">
                    {{ item.titulo || "Sem descrição" }}
                  </span>
                </div>

                <div class="col-span-1 flex items-center justify-center">
                  <button
                    class="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    @click.stop="abrirDetalhes(item)"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="flex md:hidden flex-col gap-1.5">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                      :class="getStatusIconClass(item.status)"
                    >
                      <Eye class="w-3.5 h-3.5" />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span
                        class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
                      >
                        {{ item.fornecedor }}
                      </span>
                      <span class="text-[11px] text-[var(--color-text-muted)] truncate">
                        {{ item.titulo || "Sem descrição" }}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-1 flex-shrink-0">
                    <span class="text-[10px] text-[var(--color-text-muted)]">
                      {{ formatarData(item.dataCadastro) }}
                    </span>
                    <ChevronRight class="w-4 h-4 text-[var(--color-text-muted)]" />
                  </div>
                </div>
                <div class="pl-[42px] text-[11px] text-[var(--color-text-muted)]">
                  {{ item.atendente }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <UiEmptyState
          v-else
          title="Nenhuma ocorrência encontrada"
          description="Não há ocorrências cadastradas ou que correspondam aos filtros aplicados."
        >
          <template #icon>
            <MessageSquare class="w-12 h-12" />
          </template>
          <template #action>
            <UiButton variant="primary">
              <Plus class="w-4 h-4" />
              Nova Ocorrência
            </UiButton>
          </template>
        </UiEmptyState>

        <UiPaginacao
          v-if="paginatedOcorrencias.length > 0"
          v-model:page="currentPage"
          :total-items="fallbackTotalItems"
          :total-pages="totalPages"
          class="mt-6"
        />
      </div>
    </div>

    <ModalDetalhesOcorrencia
      v-model="showModal"
      :ocorrencia="ocorrenciaSelecionada"
      @update:status="handleStatusChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Eye, Filter, MessageSquare, Plus, Search, X } from "lucide-vue-next";
import UiButton from "~/components/ui/UiButton.vue";
import UiEmptyState from "~/components/ui/UiEmptyState.vue";
import UiPaginacao from "~/components/ui/UiPaginacao.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiSpinner from "~/components/ui/UiSpinner.vue";
import ModalDetalhesOcorrencia from "../components/ModalDetalhesOcorrencia.vue";
import type { Ocorrencia, OcorrenciaFilters, OcorrenciaStatus } from "../ocorrencias.types";

definePageMeta({
  layout: "default",
});

const showFilters = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const ocorrenciaSelecionada = ref<Ocorrencia | null>(null);

const filters = ref<OcorrenciaFilters>({
  atendente: "",
  situacao: "",
  formaAtendimento: "",
  status: "",
  ordenarPor: "data_cadastro",
});

const { fetchOcorrencias } = useOcorrenciaService();

const ocorrenciaFilters = computed<OcorrenciaFilters>(() => ({
  search: searchQuery.value,
  ...filters.value,
}));

watch(
  [searchQuery, filters],
  () => {
    currentPage.value = 1;
  },
  { deep: true },
);

watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const { data: ocorrenciasResponse, status } = fetchOcorrencias(
  currentPage,
  itemsPerPage,
  ocorrenciaFilters,
);

const isLoading = computed(() => status.value === "pending");

const mapStatus = (statusValue: string): OcorrenciaStatus => {
  const normalized = (statusValue ?? "").toString().toLowerCase();

  if (["acompanhamento", "em acompanhamento", "andamento"].includes(normalized)) {
    return "acompanhamento";
  }

  if (["concluida", "concluído", "ok", "finalizada", "concluido"].includes(normalized)) {
    return "concluida";
  }

  return "pendente";
};

const normalizeOcorrencia = (raw: Record<string, unknown>): Ocorrencia => {
  const statusValue =
    toStringValue(raw.status) ??
    toStringValue(raw.situacao) ??
    toStringValue(raw.status_ocorrencia) ??
    "pendente";

  return {
    id:
      toNumber(raw.id) ??
      toNumber(raw.sr_recno) ??
      toNumber(raw.codigo) ??
      toNumber(raw.cod_ocorrencia) ??
      Date.now(),
    titulo:
      toStringValue(raw.titulo) ??
      toStringValue(raw.titulo_ocorrencia) ??
      toStringValue(raw.assunto) ??
      toStringValue(raw.descricao),
    fornecedor:
      toStringValue(raw.fornecedor) ??
      toStringValue(raw.empresa) ??
      toStringValue(raw.apelido) ??
      toStringValue(raw.nome_fornecedor) ??
      "—",
    dataCadastro:
      toStringValue(raw.dataCadastro) ??
      toStringValue(raw.data_cadastro) ??
      toStringValue(raw.data) ??
      toStringValue(raw.data_oco),
    atendente:
      toStringValue(raw.atendente) ??
      toStringValue(raw.usuario) ??
      toStringValue(raw.atendente_nome) ??
      toStringValue(raw.atendenteResponsavel) ??
      toStringValue(raw.responsavel) ??
      "—",
    status: mapStatus(statusValue),
    proximoAtendimento:
      toStringValue(raw.proximoAtendimento) ??
      toStringValue(raw.data_prox_atend) ??
      toStringValue(raw.proximo_atendimento),
    encaminhadoPara: toStringValue(raw.encaminhadoPara) ?? toStringValue(raw.encaminhado_para),
    diagnosticadoPor: toStringValue(raw.diagnosticadoPor) ?? toStringValue(raw.diagnosticado_por),
    formaAtendimento: toStringValue(raw.formaAtendimento) ?? toStringValue(raw.forma_atendimento),
    situacao: toStringValue(raw.situacao) ?? toStringValue(raw.status),
  };
};

const ocorrencias = computed(() =>
  (ocorrenciasResponse.value?.data?.items ?? []).map(normalizeOcorrencia),
);

const fallbackTotalItems = computed(
  () => ocorrenciasResponse.value?.data?.totalItems ?? ocorrencias.value.length,
);

const totalPages = computed(
  () =>
    ocorrenciasResponse.value?.data?.totalPages ??
    Math.max(1, Math.ceil((fallbackTotalItems.value || 0) / itemsPerPage.value)),
);

const paginatedOcorrencias = computed(() => {
  const items = ocorrencias.value;

  if (ocorrenciasResponse.value?.data?.totalPages) return items;

  const start = (currentPage.value - 1) * itemsPerPage.value;
  return items.slice(start, start + itemsPerPage.value);
});

const atendenteOptions = [
  { label: "Todos", value: "" },
  { label: "Sygecom", value: "Sygecom" },
  { label: "Dahm", value: "Dahm" },
  { label: "Alexnlv", value: "Alexnlv" },
  { label: "Alex sygecom", value: "Alex sygecom" },
];

const situacaoOptions = [
  { label: "Todos", value: "" },
  { label: "Aberta", value: "aberta" },
  { label: "Fechada", value: "fechada" },
];

const formaAtendimentoOptions = [
  { label: "Todos", value: "" },
  { label: "Via Web", value: "web" },
  { label: "Telefone", value: "telefone" },
  { label: "Presencial", value: "presencial" },
];

const statusOptions = [
  { label: "Todos", value: "" },
  { label: "Pendente", value: "pendente" },
  { label: "Em Acompanhamento", value: "acompanhamento" },
  { label: "Atendimento Ok", value: "concluida" },
];

const ordenarPorOptions = [
  { label: "Data da Ocorrência", value: "data_ocorrencia" },
  { label: "Data do Próx. Atendimento", value: "data_proximo" },
  { label: "Data de cadastro", value: "data_cadastro" },
];

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.atendente) count++;
  if (filters.value.situacao) count++;
  if (filters.value.formaAtendimento) count++;
  if (filters.value.status) count++;
  if (filters.value.ordenarPor !== "data_cadastro") count++;
  return count;
});

const clearFilters = () => {
  filters.value = {
    atendente: "",
    situacao: "",
    formaAtendimento: "",
    status: "",
    ordenarPor: "data_cadastro",
  };
};

const getStatusIconClass = (status: OcorrenciaStatus): string => {
  const map: Record<OcorrenciaStatus, string> = {
    pendente: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
    acompanhamento: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
    concluida: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  };
  return map[status];
};

const abrirDetalhes = (ocorrencia: Ocorrencia) => {
  ocorrenciaSelecionada.value = ocorrencia;
  showModal.value = true;
};

const handleStatusChange = (status: OcorrenciaStatus) => {
  if (!ocorrenciaSelecionada.value) return;

  ocorrenciaSelecionada.value = {
    ...ocorrenciaSelecionada.value,
    status,
  };
};
</script>
