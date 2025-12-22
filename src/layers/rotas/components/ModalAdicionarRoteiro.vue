<template>
  <UiModal v-model="isOpen" size="large" :show-close="true">
    <template #title>
      <div class="flex items-center gap-2">
        <Plus class="w-5 h-5 text-[var(--color-primary)]" />
        <span>Adicionar Fornecedor ao Roteiro</span>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <!-- Busca -->
      <div class="flex gap-2">
        <UiInput
          v-model="searchTerm"
          placeholder="Buscar fornecedor por nome, código ou cidade..."
          class="flex-1"
          @keyup.enter="buscarFornecedores"
        />
        <UiButton variant="primary" :loading="isSearching" @click="buscarFornecedores">
          <Search class="w-4 h-4" />
          Buscar
        </UiButton>
      </div>

      <!-- Loading -->
      <div v-if="isSearching" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Resultados -->
      <div v-else-if="fornecedores.length > 0" class="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        <div
          v-for="fornecedor in fornecedores"
          :key="fornecedor.codfor"
          class="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-soft)] transition-colors cursor-pointer"
          :class="{
            'border-[var(--color-primary)] bg-[var(--color-primary-soft)]':
              selectedFornecedor?.codfor === fornecedor.codfor,
          }"
          @click="selectFornecedor(fornecedor)"
        >
          <!-- Ícone de localização -->
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            :class="
              hasValidCoordinates(fornecedor)
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
            "
          >
            <MapPin v-if="hasValidCoordinates(fornecedor)" class="w-5 h-5" />
            <MapPinOff v-else class="w-5 h-5" />
          </div>

          <!-- Info do fornecedor -->
          <div class="flex-1 min-w-0">
            <div class="font-medium text-[var(--color-text)] truncate">
              {{ fornecedor.fanta || fornecedor.fornecedor }}
            </div>
            <div class="text-xs text-[var(--color-text-muted)] truncate">
              Código: {{ fornecedor.codfor }} | {{ fornecedor.cidade }} - {{ fornecedor.uf }}
            </div>
            <div class="text-xs text-[var(--color-text-muted)] truncate">
              {{ fornecedor.ende }}
            </div>
          </div>

          <!-- Status de coordenadas -->
          <div class="flex-shrink-0">
            <span
              v-if="hasValidCoordinates(fornecedor)"
              class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >
              Com GPS
            </span>
            <span
              v-else
              class="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
            >
              Sem GPS
            </span>
          </div>

          <!-- Checkbox de seleção -->
          <div class="flex-shrink-0">
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
              :class="
                selectedFornecedor?.codfor === fornecedor.codfor
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                  : 'border-[var(--color-border)]'
              "
            >
              <Check
                v-if="selectedFornecedor?.codfor === fornecedor.codfor"
                class="w-3 h-3 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="hasSearched && !isSearching"
        class="flex flex-col items-center justify-center py-8 text-[var(--color-text-muted)]"
      >
        <Search class="w-12 h-12 opacity-50 mb-2" />
        <p class="text-sm">Nenhum fornecedor encontrado</p>
        <p class="text-xs">Tente buscar por outro termo</p>
      </div>

      <!-- Initial state -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-8 text-[var(--color-text-muted)]"
      >
        <Building2 class="w-12 h-12 opacity-50 mb-2" />
        <p class="text-sm">Busque um fornecedor para adicionar ao roteiro</p>
      </div>

      <!-- Observação -->
      <div v-if="selectedFornecedor" class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-[var(--color-text)]">
          Observação (opcional)
        </label>
        <textarea
          v-model="observacao"
          placeholder="Adicione uma observação para este ponto..."
          rows="2"
          class="w-full px-3 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
        />
      </div>
    </div>

    <template #footer>
      <UiButton variant="secondary" @click="handleCancel"> Cancelar </UiButton>
      <UiButton
        variant="primary"
        :disabled="!selectedFornecedor"
        :loading="isAdding"
        @click="handleAdd"
      >
        <Plus class="w-4 h-4" />
        Adicionar ao Roteiro
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { Plus, Search, MapPin, MapPinOff, Building2, Check } from "lucide-vue-next";
import UiModal from "~/components/ui/UiModal.vue";
import UiButton from "~/components/ui/UiButton.vue";
import UiInput from "~/components/ui/UiInput.vue";
import type { Rota, FornecedorParaRoteiro } from "../rotas.types";
import type { Fornecedor } from "~/layers/fornecedores/fornecedores.types";

const props = defineProps<{
  modelValue: boolean;
  rota: Rota | null;
  currentSequence?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  added: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Estado
const searchTerm = ref("");
const fornecedores = ref<Fornecedor[]>([]);
const selectedFornecedor = ref<Fornecedor | null>(null);
const observacao = ref("");
const isSearching = ref(false);
const isAdding = ref(false);
const hasSearched = ref(false);

// Services
const fornecedorService = useFornecedorService();
const rotaService = useRotaService();

/**
 * Verifica se fornecedor tem coordenadas válidas
 */
const hasValidCoordinates = (fornecedor: Fornecedor): boolean => {
  if (!fornecedor.latitude || !fornecedor.longitude) return false;
  const lat = parseFloat(fornecedor.latitude);
  const lng = parseFloat(fornecedor.longitude);
  return rotaService.isValidCoordinate(lat, lng);
};

/**
 * Busca fornecedores
 */
const buscarFornecedores = async () => {
  if (!searchTerm.value.trim()) return;

  isSearching.value = true;
  hasSearched.value = true;

  try {
    const { data, execute } = fornecedorService.fetchFornecedor;
    await execute({ search: searchTerm.value.trim() });

    if (data.value?.data?.items) {
      fornecedores.value = data.value.data.items;
    } else {
      fornecedores.value = [];
    }
  } catch (error) {
    console.error("[ModalAdicionarRoteiro] Erro ao buscar fornecedores:", error);
    fornecedores.value = [];
  } finally {
    isSearching.value = false;
  }
};

/**
 * Seleciona um fornecedor
 */
const selectFornecedor = (fornecedor: Fornecedor) => {
  if (selectedFornecedor.value?.codfor === fornecedor.codfor) {
    selectedFornecedor.value = null;
  } else {
    selectedFornecedor.value = fornecedor;
  }
};

/**
 * Adiciona fornecedor ao roteiro
 */
const handleAdd = async () => {
  if (!selectedFornecedor.value || !props.rota) return;

  isAdding.value = true;

  try {
    const fornecedor = selectedFornecedor.value;
    const lat = parseFloat(fornecedor.latitude) || 0;
    const lng = parseFloat(fornecedor.longitude) || 0;

    const result = await rotaService.createRoteiro({
      nome: fornecedor.fanta || fornecedor.fornecedor,
      id_rota: props.rota.id,
      codigo: parseInt(fornecedor.codfor) || 0,
      endereco: {
        latitude: lat,
        longitude: lng,
        rua: fornecedor.ende,
        cidade: fornecedor.cidade,
        uf: fornecedor.uf,
      },
      observacao: observacao.value || undefined,
      sequencia: (props.currentSequence || 0) + 1,
      status: "PENDENTE",
    });

    if (result) {
      emit("added");
      resetForm();
      isOpen.value = false;
    }
  } catch (error) {
    console.error("[ModalAdicionarRoteiro] Erro ao adicionar roteiro:", error);
  } finally {
    isAdding.value = false;
  }
};

/**
 * Cancela e fecha o modal
 */
const handleCancel = () => {
  resetForm();
  isOpen.value = false;
};

/**
 * Reseta o formulário
 */
const resetForm = () => {
  searchTerm.value = "";
  fornecedores.value = [];
  selectedFornecedor.value = null;
  observacao.value = "";
  hasSearched.value = false;
};

// Reset quando modal fecha
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  }
);
</script>
