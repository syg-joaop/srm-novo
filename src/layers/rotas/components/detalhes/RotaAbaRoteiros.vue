<template>
  <div>
    <!-- Actions -->
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span class="text-sm text-[var(--color-text-muted)]">
          {{ roteiros.length }} pontos
        </span>
        <UiBadge v-if="hasChanges" variant="warning" size="small" :dot="true">
          Alterações não salvas
        </UiBadge>
      </div>
      <div class="flex gap-2">
        <UiButton
          v-if="hasChanges"
          variant="primary"
          size="small"
          :loading="isSaving"
          @click="$emit('save')"
        >
          <Check class="w-4 h-4" />
          Salvar
        </UiButton>
        <UiButton variant="secondary" size="small" @click="$emit('adicionar')">
          <Plus class="w-4 h-4" />
          Adicionar
        </UiButton>
      </div>
    </div>

    <!-- Lista -->
    <div class="max-h-[400px] overflow-y-auto space-y-2">
      <UiEmptyState
        v-if="roteiros.length === 0"
        :icon="MapPin"
        title="Nenhum ponto na rota"
        description="Adicione pontos para criar seu roteiro"
      >
        <template #action>
          <UiButton variant="primary" size="small" @click="$emit('adicionar')">
            <Plus class="w-4 h-4" />
            Adicionar Ponto
          </UiButton>
        </template>
      </UiEmptyState>

      <div
        v-for="(roteiro, index) in roteiros"
        v-else
        :key="roteiro.id"
        class="flex items-center gap-3 p-3 rounded-lg border transition-all select-none"
        style="
          background-color: var(--color-surface);
          border-color: var(--color-border);
        "
        :class="{
          'opacity-50': draggedIndex === index,
          'border-t-2': dropTargetIndex === index && draggedIndex !== index,
        }"
        :style="
          dropTargetIndex === index && draggedIndex !== index
            ? { borderTopColor: 'var(--color-primary)' }
            : {}
        "
        draggable="true"
        @dragstart="handleDragStart($event, index)"
        @dragend="handleDragEnd"
        @dragover="handleDragOver($event, index)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, index)"
      >
        <!-- Drag handle -->
        <div
          class="cursor-grab active:cursor-grabbing text-[var(--color-text-muted)]"
        >
          <GripVertical class="w-4 h-4" />
        </div>

        <!-- Número -->
        <div
          class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          :style="{ backgroundColor: getRotaStatusColor(getUltimoStatus(roteiro)) }"
        >
          {{ index + 1 }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div
            class="font-semibold text-sm truncate text-[var(--color-text)]"
          >
            {{ roteiro.nome || `Ponto ${roteiro.sequencia}` }}
          </div>
          <div
            class="text-xs truncate flex items-center gap-1 text-[var(--color-text-muted)]"
          >
            <MapPin class="w-3 h-3" />
            {{ formatEndereco(roteiro.endereco) }}
          </div>
        </div>

        <!-- Badge status (desktop) -->
        <UiBadge
          class="hidden sm:flex"
          :variant="getRotaStatusVariant(getUltimoStatus(roteiro))"
          size="small"
        >
          {{ getRotaStatusLabel(getUltimoStatus(roteiro)) }}
        </UiBadge>

        <!-- Remover -->
        <button
          class="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-[var(--color-danger)]"
          @click.stop="$emit('remover', roteiro)"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  Plus,
  MapPin,
  GripVertical,
  Trash2,
} from "lucide-vue-next";
import UiButton from "~/components/ui/UiButton.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiEmptyState from "~/components/ui/UiEmptyState.vue";
import type { Roteiro } from "../../rotas.types";

const props = defineProps<{
  roteiros: Roteiro[];
  hasChanges: boolean;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  (e: "save"): void;
  (e: "adicionar"): void;
  (e: "remover", roteiro: Roteiro): void;
  (e: "reordenar", fromIndex: number, toIndex: number): void;
}>();

// Drag and drop local state
const draggedIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);

const handleDragStart = (event: DragEvent, index: number) => {
  if (!event.dataTransfer) return;
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", index.toString());
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dropTargetIndex.value = null;
};

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  dropTargetIndex.value = index;
};

const handleDragLeave = () => {
  dropTargetIndex.value = null;
};

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();

  if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
    handleDragEnd();
    return;
  }

  emit("reordenar", draggedIndex.value, targetIndex);
  handleDragEnd();
};

// Utils (duplicados do pai por enquanto, idealmente em composable ou utils compartilhado)
// Para evitar duplicação, vou apenas usar funções locais simples ou props se fosse complexo.
// Mas aqui é formatação simples.

const getUltimoStatus = (roteiro: Roteiro): string => {
  return roteiro.srm_status_roteiro?.[0]?.status?.toLowerCase() || "aguardando";
};

const formatEndereco = (endereco?: Roteiro["endereco"]): string => {
  if (!endereco) return "Endereço não disponível";
  const parts = [
    endereco.rua,
    endereco.numero,
    endereco.bairro,
    endereco.cidade,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Endereço não disponível";
};
</script>
