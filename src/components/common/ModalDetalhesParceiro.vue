<template>
  <UiModal
    :model-value="modelValue"
    size="large"
    :show-close="true"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
  >
    <template #title>
      <div class="flex pt-2 flex-col md:flex-row md:items-center gap-3 w-full overflow-hidden pb-1">
        <div class="flex items-center gap-3 w-full md:w-auto min-w-0 flex-1">
          <div
            class="h-6 w-1 md:h-8 rounded-full shrink-0"
            :class="isInactive ? 'bg-red-600' : 'bg-primary'"
          ></div>
          <h2
            class="text-lg md:text-2xl font-bold dark:text-gray-100 text-gray-900 truncate flex-1 min-w-0"
          >
            {{ parceiro?.name || "Detalhes do Parceiro" }}
          </h2>
        </div>

        <div
          v-if="variant != 'time'"
          class="flex items-center justify-start md:justify-end gap-2 w-full md:w-auto md:ml-auto md:mr-8 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-3 md:pt-0 pl-1 md:pl-0"
        >
          <UiButton
            variant="ghost"
            class="!px-2 !py-1 text-primary hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          >
            <template #default>
              <div class="flex items-center gap-2">
                <MessageSquare class="w-5 h-5 shrink-0" />
                <span class="text-sm font-medium">Atender</span>
              </div>
            </template>
          </UiButton>

          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <div class="flex items-center gap-1">
            <button
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Presentation class="w-5 h-5" />
            </button>
            <button
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <UserPlus class="w-5 h-5" />
            </button>
            <button
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Edit class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <div class="mt-4 -mx-6">
      <div class="relative w-full">
        <div
          class="tabs-scroll-container flex items-center gap-5 px-6 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar scroll-smooth"
        >
          <button
            v-for="(tab, index) in tabs"
            :key="tab.id"
            :ref="
              (el) => {
                if (el) tabButtonRefs[index] = el as HTMLElement;
              }
            "
            class="pb-3 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0"
            :class="[
              activeTab === tab.id
                ? 'text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
            ]"
            @click="selectTab(tab.id, index)"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"
            ></div>
          </button>
          <div class="w-6 shrink-0 h-1"></div>
        </div>
      </div>

            <div class="px-6 min-h-[400px]">
        <Transition name="fade" mode="out-in">
          <div v-if="activeTab === 'cadastro'" key="cadastro" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Fornecedor
                </p>
                <p class="text-sm font-medium text-[var(--color-text)] truncate">
                  {{ parceiro?.fornecedor || parceiro?.name || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Fantasia
                </p>
                <p class="text-sm font-medium text-[var(--color-text)] truncate">
                  {{ parceiro?.fanta || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Codigo
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ fornecedorId || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Status
                </p>
                <div>
                  <UiBadge v-if="parceiro?.status" size="small">
                    {{ parceiro.status }}
                  </UiBadge>
                  <p v-else class="text-sm font-medium text-[var(--color-text)]">-</p>
                </div>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Localidade
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ parceiroLocal || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Endereco
                </p>
                <p class="text-sm font-medium text-[var(--color-text)] truncate">
                  {{ parceiro?.ende || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Contato
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ parceiroTelefone || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Email
                </p>
                <p class="text-sm font-medium text-[var(--color-text)] truncate">
                  {{ parceiro?.email || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Categoria
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ parceiro?.categoria || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Ultima carga
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ parceiro?.ultima_carga || "-" }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'contatos'" key="contatos" class="space-y-4">
            <div v-if="!hasFornecedorData" class="flex items-center justify-center h-64 text-gray-500">
              Conteudo da aba {{ activeTabLabel }} (Em construcao)
            </div>
            <div v-else-if="isTabLoading('contatos')" class="flex items-center justify-center h-64">
              <UiSpinner size="large" text="Carregando dados..." />
            </div>
            <UiEmptyState
              v-else-if="hasTabError('contatos')"
              :icon="Phone"
              title="Erro ao carregar contatos"
              :description="tabState.contatos.error || 'Erro inesperado'"
            >
              <template #action>
                <UiButton size="small" variant="secondary" @click="loadTab('contatos')">
                  Tentar novamente
                </UiButton>
              </template>
            </UiEmptyState>
            <UiEmptyState
              v-else-if="!tabState.contatos.items.length"
              :icon="Phone"
              title="Nenhum contato"
              description="Nao ha contatos cadastrados para este fornecedor."
            />
            <div v-else class="space-y-2">
              <div
                v-for="(contato, index) in tabState.contatos.items"
                :key="contato.id || `${contato.nome}-${index}`"
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-sm text-[var(--color-text)] truncate">
                      {{ contato.nome }}
                    </p>
                    <p class="text-xs text-[var(--color-text-muted)]">
                      {{ formatContatoDescricao(contato) || "-" }}
                    </p>
                  </div>
                  <div class="text-right text-xs text-[var(--color-text-muted)]">
                    <p v-if="contato.telefone">{{ contato.telefone }}</p>
                    <p v-if="contato.celular">{{ contato.celular }}</p>
                    <p v-if="contato.email" class="truncate max-w-[200px]">{{ contato.email }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'cargas'" key="cargas" class="space-y-4">
            <div v-if="!hasFornecedorData" class="flex items-center justify-center h-64 text-gray-500">
              Conteudo da aba {{ activeTabLabel }} (Em construcao)
            </div>
            <div v-else-if="isTabLoading('cargas')" class="flex items-center justify-center h-64">
              <UiSpinner size="large" text="Carregando dados..." />
            </div>
            <UiEmptyState
              v-else-if="hasTabError('cargas')"
              :icon="Truck"
              title="Erro ao carregar cargas"
              :description="tabState.cargas.error || 'Erro inesperado'"
            >
              <template #action>
                <UiButton size="small" variant="secondary" @click="loadTab('cargas')">
                  Tentar novamente
                </UiButton>
              </template>
            </UiEmptyState>
            <UiEmptyState
              v-else-if="!tabState.cargas.items.length"
              :icon="Truck"
              title="Nenhuma carga"
              description="Nao ha cargas registradas para este fornecedor."
            />
            <div v-else class="space-y-3">
              <div
                v-for="(carga, index) in tabState.cargas.items"
                :key="carga.id || carga.boleto || `carga-${index}`"
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-sm text-[var(--color-text)]">
                      Boleto {{ carga.boleto || carga.id || "-" }}
                    </p>
                    <p class="text-xs text-[var(--color-text-muted)]">
                      {{ formatarData(carga.data) || "-" }}
                      <span v-if="carga.hora"> - {{ carga.hora }}</span>
                    </p>
                  </div>
                  <div class="text-right text-xs text-[var(--color-text-muted)]">
                    <p v-if="carga.liquidoTotal">
                      {{ formatarKg(carga.liquidoTotal) }}
                    </p>
                    <p v-if="carga.valorTotal">
                      {{ formatarMoeda(carga.valorTotal) }}
                    </p>
                  </div>
                </div>
                <p v-if="carga.produtos" class="mt-2 text-xs text-[var(--color-text-muted)]">
                  Produtos: {{ carga.produtos }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'atendimentos'" key="atendimentos" class="space-y-4">
            <div v-if="!hasFornecedorData" class="flex items-center justify-center h-64 text-gray-500">
              Conteudo da aba {{ activeTabLabel }} (Em construcao)
            </div>
            <div v-else-if="isTabLoading('atendimentos')" class="flex items-center justify-center h-64">
              <UiSpinner size="large" text="Carregando dados..." />
            </div>
            <UiEmptyState
              v-else-if="hasTabError('atendimentos')"
              :icon="MessageSquare"
              title="Erro ao carregar atendimentos"
              :description="tabState.atendimentos.error || 'Erro inesperado'"
            >
              <template #action>
                <UiButton size="small" variant="secondary" @click="loadTab('atendimentos')">
                  Tentar novamente
                </UiButton>
              </template>
            </UiEmptyState>
            <UiEmptyState
              v-else-if="!tabState.atendimentos.items.length"
              :icon="MessageSquare"
              title="Nenhum atendimento"
              description="Nao ha atendimentos registrados para este fornecedor."
            />
            <div v-else class="space-y-3">
              <div
                v-for="(atendimento, index) in tabState.atendimentos.items"
                :key="atendimento.id || `${atendimento.assunto}-${index}`"
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-sm text-[var(--color-text)] truncate">
                      {{ atendimento.assunto }}
                    </p>
                    <p class="text-xs text-[var(--color-text-muted)]">
                      {{ formatarData(atendimento.data) || "-" }}
                      <span v-if="atendimento.proximo">
                        - Proximo: {{ formatarData(atendimento.proximo) }}
                      </span>
                    </p>
                    <p v-if="atendimento.atendente" class="text-xs text-[var(--color-text-muted)]">
                      Atendente: {{ atendimento.atendente }}
                    </p>
                  </div>
                  <UiBadge
                    v-if="atendimento.status"
                    :variant="getAtendimentoStatusVariant(atendimento.status)"
                    size="small"
                  >
                    {{ atendimento.status }}
                  </UiBadge>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'coletas'" key="coletas" class="space-y-4">
            <div v-if="!hasFornecedorData" class="flex items-center justify-center h-64 text-gray-500">
              Conteudo da aba {{ activeTabLabel }} (Em construcao)
            </div>
            <div v-else-if="isTabLoading('coletas')" class="flex items-center justify-center h-64">
              <UiSpinner size="large" text="Carregando dados..." />
            </div>
            <UiEmptyState
              v-else-if="hasTabError('coletas')"
              :icon="ClipboardList"
              title="Erro ao carregar coletas"
              :description="tabState.coletas.error || 'Erro inesperado'"
            >
              <template #action>
                <UiButton size="small" variant="secondary" @click="loadTab('coletas')">
                  Tentar novamente
                </UiButton>
              </template>
            </UiEmptyState>
            <UiEmptyState
              v-else-if="!tabState.coletas.items.length"
              :icon="ClipboardList"
              title="Nenhuma coleta"
              description="Nao ha coletas registradas para este fornecedor."
            />
            <div v-else class="space-y-3">
              <div
                v-for="(coleta, index) in tabState.coletas.items"
                :key="coleta.id || coleta.ordem || `coleta-${index}`"
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-sm text-[var(--color-text)]">
                      Ordem {{ coleta.ordem || coleta.id || "-" }}
                    </p>
                    <p class="text-xs text-[var(--color-text-muted)]">
                      {{ formatarData(coleta.data) || "-" }}
                      <span v-if="coleta.dataSaida">
                        - Saida: {{ formatarData(coleta.dataSaida) }}
                      </span>
                      <span v-if="coleta.dataChegada">
                        - Chegada: {{ formatarData(coleta.dataChegada) }}
                      </span>
                    </p>
                  </div>
                  <div class="text-right text-xs text-[var(--color-text-muted)]">
                    <p v-if="coleta.totalCacamba">
                      Total: {{ formatarNumero(coleta.totalCacamba) }}
                    </p>
                    <p v-if="coleta.motorista">Motorista: {{ coleta.motorista }}</p>
                  </div>
                </div>
                <p v-if="formatColetaLocal(coleta)" class="mt-2 text-xs text-[var(--color-text-muted)]">
                  {{ formatColetaLocal(coleta) }}
                </p>
                <p v-if="coleta.obs" class="mt-2 text-xs text-[var(--color-text-muted)]">
                  Obs: {{ coleta.obs }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'precos'" key="precos" class="space-y-4">
            <div v-if="!hasFornecedorData" class="flex items-center justify-center h-64 text-gray-500">
              Conteudo da aba {{ activeTabLabel }} (Em construcao)
            </div>
            <div v-else-if="isTabLoading('precos')" class="flex items-center justify-center h-64">
              <UiSpinner size="large" text="Carregando dados..." />
            </div>
            <UiEmptyState
              v-else-if="hasTabError('precos')"
              :icon="Tag"
              title="Erro ao carregar precos"
              :description="tabState.precos.error || 'Erro inesperado'"
            >
              <template #action>
                <UiButton size="small" variant="secondary" @click="loadTab('precos')">
                  Tentar novamente
                </UiButton>
              </template>
            </UiEmptyState>
            <UiEmptyState
              v-else-if="!tabState.precos.items.length"
              :icon="Tag"
              title="Nenhum preco"
              description="Nao ha precos cadastrados para este fornecedor."
            />
            <div v-else class="space-y-3">
              <div
                v-for="(preco, index) in tabState.precos.items"
                :key="preco.id || preco.codigo || `${preco.produto}-${index}`"
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-sm text-[var(--color-text)] truncate">
                      {{ preco.produto }}
                    </p>
                    <p class="text-xs text-[var(--color-text-muted)]">
                      {{ preco.codigo ? `Codigo: ${preco.codigo}` : "Sem codigo" }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-[var(--color-primary)]">
                      {{ formatarMoeda(preco.preco) }}
                    </p>
                    <UiBadge
                      v-if="preco.status"
                      :variant="getPrecoStatusVariant(preco.status)"
                      size="small"
                    >
                      {{ preco.status }}
                    </UiBadge>
                  </div>
                </div>
                <div
                  v-if="preco.tipo || preco.unidade"
                  class="mt-2 flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]"
                >
                  <span v-if="preco.tipo">Tipo: {{ preco.tipo }}</span>
                  <span v-if="preco.unidade">Unidade: {{ preco.unidade }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'checkins'" key="checkins" class="space-y-4">
            <div v-if="!hasFornecedorData" class="flex items-center justify-center h-64 text-gray-500">
              Conteudo da aba {{ activeTabLabel }} (Em construcao)
            </div>
            <div v-else-if="isTabLoading('checkins')" class="flex items-center justify-center h-64">
              <UiSpinner size="large" text="Carregando dados..." />
            </div>
            <UiEmptyState
              v-else-if="hasTabError('checkins')"
              :icon="MapPin"
              title="Erro ao carregar checkins"
              :description="tabState.checkins.error || 'Erro inesperado'"
            >
              <template #action>
                <UiButton size="small" variant="secondary" @click="loadTab('checkins')">
                  Tentar novamente
                </UiButton>
              </template>
            </UiEmptyState>
            <UiEmptyState
              v-else-if="!tabState.checkins.items.length"
              :icon="MapPin"
              title="Nenhum check-in"
              description="Nao ha check-ins registrados para este fornecedor."
            />
            <div v-else class="space-y-3">
              <div
                v-for="(checkin, index) in tabState.checkins.items"
                :key="checkin.id || `${checkin.data}-${index}`"
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-sm text-[var(--color-text)] truncate">
                      {{ checkin.fornecedor || parceiro?.fornecedor || parceiro?.name || "-" }}
                    </p>
                    <p class="text-xs text-[var(--color-text-muted)]">
                      {{ formatarData(checkin.data) || "-" }}
                      <span v-if="formatCheckinLocation(checkin)">
                        - {{ formatCheckinLocation(checkin) }}
                      </span>
                    </p>
                    <p v-if="checkin.responsavel" class="text-xs text-[var(--color-text-muted)]">
                      Responsavel: {{ checkin.responsavel }}
                    </p>
                    <p v-if="checkin.observacao" class="text-xs text-[var(--color-text-muted)]">
                      Obs: {{ checkin.observacao }}
                    </p>
                  </div>
                  <UiBadge
                    v-if="checkin.status"
                    :variant="getCheckinStatusVariant(checkin.status)"
                    size="small"
                  >
                    {{ checkin.status }}
                  </UiBadge>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center justify-center h-64 text-gray-500" key="fallback">
            Conteudo da aba {{ activeTabLabel }} (Em construcao)
          </div>
        </Transition>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import {
  ClipboardList,
  Edit,
  MapPin,
  MessageSquare,
  Phone,
  Presentation,
  Tag,
  Truck,
  UserPlus,
} from "lucide-vue-next";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiModal from "~/components/ui/UiModal.vue";
import UiButton from "~/components/ui/UiButton.vue";
import UiEmptyState from "~/components/ui/UiEmptyState.vue";
import UiSpinner from "~/components/ui/UiSpinner.vue";
import { useParceiroDetalhes } from "~/composables/useParceiroDetalhes";
import type { ParceiroData } from "~/types/parceiro-detalhes";
import {
  formatCheckinLocation,
  getAtendimentoStatusVariant,
  getCheckinStatusVariant,
  getPrecoStatusVariant,
} from "~/utils/parceiro/statusVariants";
import { formatarKg, formatarMoeda, formatarNumero } from "~/utils/formatters/formatadores";
import { formatLocation } from "~/utils/formatters/location";
import { formatarData } from "~/utils/utils";
import { firstString } from "~/utils/coerce";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    parceiro?: ParceiroData | null;
    variant?: "parceiro" | "atendente" | "time";
  }>(),
  {
    parceiro: null,
    variant: "parceiro",
  },
);

defineEmits(["update:modelValue", "close"]);

const activeTab = ref(
  ["atendente", "time"].includes(props.variant) ? "agendamentos" : "atendimentos",
);
const tabButtonRefs = ref<HTMLElement[]>([]);

const allTabs = [
  { id: "cadastro", label: "Dados de Cadastro" },
  { id: "contatos", label: "Contatos" },
  { id: "cargas", label: "Cargas" },
  { id: "agendamentos", label: "Agendamentos" },
  { id: "atendimentos", label: "Atendimentos" },
  { id: "coletas", label: "Coletas" },
  { id: "precos", label: "Precos" },
  { id: "checkins", label: "Check-in's" },
  { id: "favorecidos", label: "Favorecidos" },
];

const tabs = computed(() => {
  if (["atendente", "time"].includes(props.variant)) {
    return allTabs.filter((t) => ["agendamentos", "atendimentos", "checkins"].includes(t.id));
  }
  return allTabs.filter((t) => t.id !== "agendamentos");
});

watch(
  () => props.variant,
  (newVariant) => {
    if (["atendente", "time"].includes(newVariant)) {
      activeTab.value = "agendamentos";
    } else {
      activeTab.value = "atendimentos";
    }
  },
);

const fornecedorId = computed(() =>
  firstString(props.parceiro?.codfor, props.parceiro?.codfornecedor),
);
const fornecedorCodcom = computed(() => firstString(props.parceiro?.codcom, props.parceiro?.comp));
const hasFornecedorData = computed(() => Boolean(fornecedorId.value));

const { tabState, resetTabState, isTabLoading, hasTabError, isFornecedorTab, loadTab } =
  useParceiroDetalhes(fornecedorId, fornecedorCodcom);

const activeTabLabel = computed(() => tabs.value.find((t) => t.id === activeTab.value)?.label || "");

const parceiroLocal = computed(() =>
  formatLocation({ cidade: props.parceiro?.cidade, estado: props.parceiro?.uf }),
);
const parceiroTelefone = computed(
  () => props.parceiro?.fone || props.parceiro?.celular || "-",
);

const formatContatoDescricao = (contato: { cargo?: string; setor?: string }) => {
  return [contato.cargo, contato.setor].filter(Boolean).join(" - ");
};

const formatColetaLocal = (coleta: {
  local?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}) => {
  const parts = [coleta.local, coleta.bairro].filter(Boolean) as string[];
  if (coleta.cidade || coleta.uf) {
    parts.push(formatLocation({ cidade: coleta.cidade, estado: coleta.uf }));
  }
  return parts.join(" - ");
};

const loadTabIfNeeded = (tabId: string) => {
  if (!props.modelValue) return;
  if (!hasFornecedorData.value) return;
  if (!isFornecedorTab(tabId)) return;
  loadTab(tabId);
};

const isInactive = computed(() => {
  return (props.parceiro?.status || "").toLowerCase().trim() === "inativo";
});

watch(activeTab, (tabId) => {
  loadTabIfNeeded(tabId);
});

watch(
  () => [props.modelValue, fornecedorId.value],
  ([isOpen, id], [wasOpen, prevId]) => {
    if (!isOpen || !id) return;
    if (!wasOpen || id !== prevId) {
      resetTabState();
      loadTabIfNeeded(activeTab.value);
    }
  },
);

const selectTab = (tabId: string, index: number) => {
  activeTab.value = tabId;
  const tabEl = tabButtonRefs.value[index];
  if (tabEl) {
    tabEl.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tabs-scroll-container {
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}
</style>
