<template>
  <UiModal v-model="isOpen" size="medium" :show-close="true">
    <template #title>
      <div class="flex items-center gap-2 text-[var(--font-size-md)] font-[var(--font-weight-semibold)] text-[var(--color-text)]">
        <Route class="w-5 h-5 text-[var(--color-primary)]" />
        <span>Adicionar à Rota</span>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <div
        v-if="fornecedor"
        class="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-primary-soft)] border border-[var(--color-primary-border)]"
      >
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-text)]"
        >
          <Building2 class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-[var(--font-weight-semibold)] text-[var(--color-text)] text-[var(--font-size-sm)] truncate">
            {{ fornecedor.fanta || fornecedor.fornecedor }}
          </div>
          <div class="text-[var(--font-size-xs)] text-[var(--color-text-muted)] truncate">
            {{ fornecedor.cidade }} - {{ fornecedor.uf }} | {{ fornecedor.ende }}
          </div>
        </div>
        <div class="flex-shrink-0">
          <span
            v-if="hasValidCoordinates"
            class="text-[var(--font-size-xs)] px-2 py-1 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]"
          >
            Com GPS
          </span>
          <span
            v-else
            class="text-[var(--font-size-xs)] px-2 py-1 rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
          >
            Sem GPS
          </span>
        </div>
      </div>

      <div v-if="isLoadingRotas" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border)] border-t-[var(--color-primary)]"></div>
      </div>

      <div v-else-if="rotas.length > 0" class="flex flex-col gap-2">
        <label class="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-[var(--color-text)]">
          Selecione uma rota:
        </label>
        <div class="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          <div
            v-for="rota in rotas"
            :key="rota.id"
            class="flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer"
            :class="
              selectedRota?.id === rota.id
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary-border)] hover:bg-[var(--color-hover)]'
            "
            @click="selectedRota = rota"
          >
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text)]"
              :class="getStatusBgClass(rota.status)"
            >
              <Route class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-[var(--font-weight-medium)] text-[var(--color-text)] text-[var(--font-size-sm)] truncate">
                Rota #{{ rota.codigo || rota.id }}
              </div>
              <div class="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                {{ formatDateRange(rota.data_inicio, rota.data_fim) }}
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span
                class="text-[var(--font-size-xs)] px-2 py-0.5 rounded-full"
                :class="getStatusBadgeClass(rota.status)"
              >
                {{ getStatusLabel(rota.status) }}
              </span>
              <span v-if="rota.progresso" class="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                {{ rota.progresso.total }} pontos
              </span>
            </div>

            <div class="flex-shrink-0">
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="
                  selectedRota?.id === rota.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                    : 'border-[var(--color-border)]'
                "
              >
                <Check v-if="selectedRota?.id === rota.id" class="w-3 h-3 text-[var(--color-text)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-8 text-[var(--color-text-muted)]"
      >
        <Route class="w-12 h-12 opacity-50 mb-2" />
        <p class="text-[var(--font-size-sm)]">Nenhuma rota disponível</p>
        <p class="text-[var(--font-size-xs)]">Crie uma rota primeiro para adicionar fornecedores</p>
      </div>

      <div v-if="selectedRota" class="flex flex-col gap-1.5">
        <label class="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-[var(--color-text)]">
          Observação (opcional)
        </label>
        <textarea
          v-model="observacao"
          placeholder="Adicione uma observação para este ponto..."
          rows="2"
          class="w-full px-3 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--font-size-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
        />
      </div>
    </div>

    <template #footer>
      <UiButton variant="secondary" @click="handleCancel"> Cancelar </UiButton>
      <UiButton
        variant="primary"
        :disabled="!selectedRota"
        :loading="isAdding"
        @click="handleAdd"
      >
        <Plus class="w-4 h-4" />
        Adicionar
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { Route, Building2, Plus, Check } from "lucide-vue-next";
import UiModal from "~/components/ui/UiModal.vue";
import UiButton from "~/components/ui/UiButton.vue";
import type { Fornecedor } from "../fornecedores.types";
import type { Rota } from "~/layers/rotas/rotas.types";

const props = defineProps<{
  modelValue: boolean;
  fornecedor: Fornecedor | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  added: [rota: Rota];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Estado
const rotas = ref<Rota[]>([]);
const selectedRota = ref<Rota | null>(null);
const observacao = ref("");
const isLoadingRotas = ref(false);
const isAdding = ref(false);

// Services
// eslint-disable-next-line no-undef
const rotaService = useRotaService();

// Verifica se fornecedor tem coordenadas válidas
const hasValidCoordinates = computed(() => {
  if (!props.fornecedor) return false;
  const lat = parseFloat(props.fornecedor.latitude);
  const lng = parseFloat(props.fornecedor.longitude);
  return rotaService.isValidCoordinate(lat, lng);
});

/**
 * Carrega rotas disponíveis
 */
const carregarRotas = async () => {
  isLoadingRotas.value = true;

  try {
    const response = await rotaService.fetchRotas({ itens: 50 });
    if (response?.data) {
      // Filtra apenas rotas não concluídas/canceladas
      rotas.value = response.data.filter(
        (r) => !["concluida", "cancelada"].includes(r.status?.toLowerCase() || ""),
      );
    }
  } catch (error) {
    console.error("[ModalAdicionarARota] Erro ao carregar rotas:", error);
  } finally {
    isLoadingRotas.value = false;
  }
};

/**
 * Adiciona fornecedor à rota
 */
const handleAdd = async () => {
  if (!selectedRota.value || !props.fornecedor) return;

  isAdding.value = true;

  try {
    const fornecedor = props.fornecedor;
    const lat = parseFloat(fornecedor.latitude) || 0;
    const lng = parseFloat(fornecedor.longitude) || 0;

    // Busca quantidade atual de roteiros para definir sequência
    const roteirosResponse = await rotaService.fetchRoteiros(selectedRota.value.id);
    const currentSequence = roteirosResponse?.data?.length || 0;

    const result = await rotaService.createRoteiro({
      nome: fornecedor.fanta || fornecedor.fornecedor,
      id_rota: selectedRota.value.id,
      codigo: parseInt(fornecedor.codfor) || 0,
      endereco: {
        latitude: lat,
        longitude: lng,
        rua: fornecedor.ende,
        cidade: fornecedor.cidade,
        uf: fornecedor.uf,
      },
      observacao: observacao.value || undefined,
      sequencia: currentSequence + 1,
      status: "PENDENTE",
    });

    if (result) {
      emit("added", selectedRota.value);
      resetForm();
      isOpen.value = false;
    }
  } catch (error) {
    console.error("[ModalAdicionarARota] Erro ao adicionar roteiro:", error);
  } finally {
    isAdding.value = false;
  }
};

/**
 * Cancela e fecha
 */
const handleCancel = () => {
  resetForm();
  isOpen.value = false;
};

/**
 * Reseta formulário
 */
const resetForm = () => {
  selectedRota.value = null;
  observacao.value = "";
};

/**
 * Formata range de datas
 */
const formatDateRange = (inicio?: string, fim?: string): string => {
  if (!inicio && !fim) return "—";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const dataInicio = formatDate(inicio);
  const dataFim = formatDate(fim);

  if (dataInicio && dataFim) {
    return `${dataInicio} - ${dataFim}`;
  }

  return dataInicio || dataFim || "—";
};

/**
 * Retorna label do status
 */
const getStatusLabel = (status?: string): string => {
  const map: Record<string, string> = {
    aguardando: "Aguardando",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };
  return map[status?.toLowerCase() || ""] || status || "—";
};

/**
 * Retorna classe de fundo do status
 */
const getStatusBgClass = (status?: string): string => {
  const map: Record<string, string> = {
    aguardando: "bg-[var(--color-warning)]",
    em_andamento: "bg-[var(--color-primary)]",
    concluida: "bg-[var(--color-success)]",
    cancelada: "bg-[var(--color-danger)]",
  };
  return map[status?.toLowerCase() || ""] || "bg-[var(--color-text-muted)]";
};

/**
 * Retorna classes do badge de status
 */
const getStatusBadgeClass = (status?: string): string => {
  const map: Record<string, string> = {
    aguardando: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
    em_andamento: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
    concluida: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
    cancelada: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  };
  return map[status?.toLowerCase() || ""] || "bg-[var(--color-border-subtle)] text-[var(--color-text-muted)]";
};

// Carrega rotas quando modal abre
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      carregarRotas();
    } else {
      resetForm();
    }
  },
);
</script>
