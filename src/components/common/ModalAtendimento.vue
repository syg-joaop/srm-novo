<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    size="medium"
    :show-close="false"
  >
    <template #title>
      <div class="flex items-center gap-3 w-full">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style="background-color: var(--color-primary)"
        >
          <MessageSquare class="w-5 h-5 text-white" />
        </div>
        <div class="flex flex-col">
          <span class="text-base font-semibold leading-tight" style="color: var(--color-text)">
            {{ atendimento?.apelido || "19 Servico Notarial" }}
          </span>
          <span class="text-xs font-medium" style="color: var(--color-text-muted)">
            #{{ atendimento?.sr_recno || "224" }}
          </span>
        </div>
        <button
          class="ml-auto p-1 transition-colors rounded-full btn-close"
          @click="$emit('update:modelValue', false)"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </template>

    <div class="flex flex-col -mx-6 -mt-6 mb-6">
      <div
        class="px-6 py-3 flex items-center gap-2 mt-[1px]"
        style="background-color: var(--color-primary-dark); color: white"
      >
        <Calendar class="w-4 h-4" style="color: rgba(255, 255, 255, 0.7)" />
        <span class="text-sm font-medium">Próximo atendimento marcado para 31/10/2025</span>
      </div>

      <div class="flex px-6 mt-4" style="border-bottom: 1px solid var(--color-border)">
        <button
          @click="activeTab = 'dados'"
          class="px-4 py-2 text-sm font-medium transition-colors border-b-2"
          :style="
            activeTab === 'dados'
              ? 'border-color: var(--color-primary); color: var(--color-primary)'
              : 'border-color: transparent; color: var(--color-text-muted)'
          "
        >
          Dados
        </button>
        <button
          @click="activeTab = 'historico'"
          class="px-4 py-2 text-sm font-medium transition-colors border-b-2"
          :style="
            activeTab === 'historico'
              ? 'border-color: var(--color-primary); color: var(--color-primary)'
              : 'border-color: transparent; color: var(--color-text-muted)'
          "
        >
          Histórico
        </button>
      </div>
    </div>

    <div style="min-height: 400px; display: flex; flex-direction: column">
      <div v-if="activeTab === 'dados'" class="space-y-6">
        <div>
          <h4 class="text-sm font-semibold mb-3" style="color: var(--color-text)">Status</h4>
          <div class="flex flex-wrap gap-2">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full status-pill">
              <span
                class="w-2 h-2 rounded-full"
                style="background-color: var(--color-status-vencido)"
              ></span>
              <span class="text-xs font-medium" style="color: var(--color-text)">Pendente</span>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full status-pill opacity-50">
              <span
                class="w-2 h-2 rounded-full"
                style="background-color: var(--color-text-muted)"
              ></span>
              <span class="text-xs font-medium" style="color: var(--color-text)"
                >Em acompanhamento</span
              >
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full status-pill opacity-50">
              <span
                class="w-2 h-2 rounded-full"
                style="background-color: var(--color-text-muted)"
              ></span>
              <span class="text-xs font-medium" style="color: var(--color-text)">Concluída</span>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-3" style="color: var(--color-text)">Dados</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center text-sm pb-2 last:pb-0 data-row">
              <span style="color: var(--color-text-muted)">Data</span>
              <span class="font-medium" style="color: var(--color-text)">{{
                atendimento?.data_oco_formatada || "19/11/2025 - 12:00"
              }}</span>
            </div>
            <div class="flex justify-between items-center text-sm pb-2 last:pb-0 data-row">
              <span style="color: var(--color-text-muted)">Atendente</span>
              <span class="font-medium" style="color: var(--color-text)">Alexnlv</span>
            </div>
            <div class="flex justify-between items-center text-sm pb-2 last:pb-0 data-row">
              <span style="color: var(--color-text-muted)">Encaminhado para</span>
              <span class="font-medium" style="color: var(--color-text)">-</span>
            </div>
            <div class="flex justify-between items-center text-sm pb-2 last:pb-0 data-row">
              <span style="color: var(--color-text-muted)">Diagnosticado por</span>
              <span class="font-medium" style="color: var(--color-text)">-</span>
            </div>
            <div class="flex justify-between items-center text-sm pb-2 last:pb-0 data-row">
              <span style="color: var(--color-text-muted)">Forma de atendimento</span>
              <span class="font-medium" style="color: var(--color-text)">Via Web</span>
            </div>
            <div class="flex justify-between items-center text-sm pb-2 last:pb-0 data-row">
              <span style="color: var(--color-text-muted)">Status</span>
              <span class="font-medium" style="color: var(--color-text)">Aberta</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'historico'" class="h-full flex flex-col flex-1">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-sm font-semibold" style="color: var(--color-text)">Histórico</h4>
          <UiButton
            variant="ghost"
            class="!p-1.5 h-auto btn-action"
            @click="handleOpenNovoComentario"
          >
            <MessageSquarePlus class="w-4 h-4" />
            <span class="text-sm">Novo comentário</span>
          </UiButton>
        </div>

        <div class="space-y-4 overflow-y-auto flex-1 pr-2">
          <div class="flex gap-4 p-4 rounded-lg history-card">
            <div class="shrink-0">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                style="background-color: var(--color-border)"
              >
                <User class="w-5 h-5" style="color: var(--color-text-muted)" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-1">
                <span class="text-sm font-medium" style="color: var(--color-text-muted)"
                  >Alexnlv</span
                >
                <div class="text-right">
                  <span class="block text-xs font-medium" style="color: var(--color-text)"
                    >19/11/2025</span
                  >
                  <span
                    class="block text-[10px] uppercase mt-0.5"
                    style="color: var(--color-text-muted)"
                    >Ocorrência</span
                  >
                </div>
              </div>

              <p class="text-sm mb-3" style="color: var(--color-text)">
                Uma informação de atendimento
              </p>

              <div
                class="flex justify-end gap-2 pt-2 mt-2"
                style="border-top: 1px solid var(--color-border-subtle)"
              >
                <button class="p-1.5 transition-colors rounded btn-icon-danger" title="Excluir">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
                <button
                  class="flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-colors rounded btn-icon-action"
                >
                  <Edit2 class="w-3.5 h-3.5" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="activeTab === 'dados'" class="flex w-full justify-between sm:justify-end gap-3">
        <UiButton variant="ghost" class="btn-action">
          <Send class="w-4 h-4" />
          Encaminhar
        </UiButton>
        <UiButton variant="ghost" class="btn-action">
          <Edit2 class="w-4 h-4" />
          Editar
        </UiButton>
      </div>
    </template>
  </UiModal>

  <ModalNovoComentario
    v-model="showNovoComentarioModal"
    v-model:descricao="novoComentarioDescricao"
    v-model:is-problema="novoComentarioIsProblema"
    @confirm="handleConfirmNovoComentario"
  />
</template>

<script setup lang="ts">
import {
  MessageSquare,
  X,
  Calendar,
  Send,
  Edit2,
  MessageSquarePlus,
  User,
  Trash2,
} from "lucide-vue-next";
import UiModal from "~/components/ui/UiModal.vue";
import UiButton from "~/components/ui/UiButton.vue";
import ModalNovoComentario from "~/components/common/ModalNovoComentario.vue";

interface AtendimentoData {
  apelido?: string;
  sr_recno?: string;
  data_oco?: string;
  data_oco_formatada?: string;
  [key: string]: unknown;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    atendimento?: AtendimentoData | null;
  }>(),
  {
    atendimento: null,
  },
);

defineEmits(["update:modelValue"]);

const activeTab = ref("dados");

const showNovoComentarioModal = ref(false);
const novoComentarioDescricao = ref("");
const novoComentarioIsProblema = ref(false);

const handleOpenNovoComentario = () => {
  novoComentarioDescricao.value = "";
  novoComentarioIsProblema.value = false;
  showNovoComentarioModal.value = true;
};

const handleConfirmNovoComentario = () => {
  console.log("Novo comentário:", {
    descricao: novoComentarioDescricao.value,
    isProblema: novoComentarioIsProblema.value,
  });
  showNovoComentarioModal.value = false;
};
</script>

<style scoped>
.btn-close {
  color: var(--color-text-muted);
}
.btn-close:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
}

.status-pill {
  background-color: var(--color-hover);
  border: 1px solid var(--color-border-subtle);
}

.data-row {
  border-bottom: 1px solid var(--color-border-subtle);
}
.data-row:last-child {
  border-bottom: none;
}

.btn-action {
  color: var(--color-primary) !important;
}
.btn-action:hover {
  background-color: var(--color-hover) !important;
  color: var(--color-primary-dark) !important;
}

.history-card {
  background-color: var(--color-hover);
  border: 1px solid var(--color-border-subtle);
}

.btn-icon-action {
  color: var(--color-text-muted);
}
.btn-icon-action:hover {
  color: var(--color-primary);
  background-color: var(--color-hover);
}

.btn-icon-danger {
  color: var(--color-text-muted);
}
.btn-icon-danger:hover {
  color: var(--color-status-vencido);
  background-color: var(--color-hover);
}
</style>
