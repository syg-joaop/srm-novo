<template>
  <UiModal v-model="isOpen" size="medium" :show-close="true">
    <template #title>
      <div class="flex items-center gap-2.5 md:gap-3">
        <div
          class="h-6 md:h-8 w-1 rounded-full flex-shrink-0"
          :class="getStatusBarColor(ocorrencia?.status)"
        />
        <div class="flex-1 min-w-0">
          <h2 class="text-base md:text-lg font-bold text-[var(--color-text)] truncate">
            {{ ocorrencia?.titulo || "Sem descrição" }}
          </h2>
          <div class="flex items-center gap-1.5 md:gap-2 mt-0.5">
            <span class="text-[10px] md:text-xs text-[var(--color-text-muted)]"
              >#{{ ocorrencia?.id }}</span
            >
            <span class="w-1 h-1 rounded-full bg-[var(--color-text-muted)] opacity-50" />
            <span class="text-[10px] md:text-xs text-[var(--color-text-muted)] truncate">{{
              ocorrencia?.fornecedor
            }}</span>
          </div>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-4 md:gap-5 -mx-4 md:-mx-6">
      <div
        v-if="ocorrencia?.proximoAtendimento"
        class="mx-4 md:mx-6 flex items-center gap-2 px-2.5 md:px-3 py-2 md:py-2.5 rounded-lg bg-[var(--color-primary-soft)] border border-[var(--color-primary-border)]"
      >
        <Calendar class="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--color-primary)] flex-shrink-0" />
        <span class="text-xs md:text-sm font-medium text-[var(--color-primary)]"
          >Proximo: {{ formatarData(ocorrencia.proximoAtendimento) }}</span
        >
      </div>

      <div
        class="flex items-center gap-4 md:gap-6 px-4 md:px-6 border-b border-[var(--color-border)]"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="relative pb-2.5 md:pb-3 text-xs md:text-sm font-medium transition-colors"
          :class="
            abaAtiva === tab.id
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          "
          @click="abaAtiva = tab.id"
        >
          <component :is="tab.icon" class="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1 md:mr-1.5" />
          {{ tab.label }}
          <div
            v-if="abaAtiva === tab.id"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)] rounded-t-full"
          />
        </button>
      </div>

      <div class="px-4 md:px-6">
        <Transition name="fade" mode="out-in">
          <div v-if="abaAtiva === 'dados'" key="dados" class="flex flex-col gap-4 md:gap-5">
            <div class="flex flex-col gap-2.5 md:gap-3">
              <h3
                class="text-[10px] md:text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
              >
                Status
              </h3>
              <div class="flex flex-wrap gap-1.5 md:gap-2">
                <button
                  v-for="status in statusOptions"
                  :key="status.value"
                  class="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium transition-all duration-200"
                  :class="getStatusBadgeClass(status.value)"
                  @click="changeStatus(status.value)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(status.value)" />
                  {{ status.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2.5 md:gap-3">
              <h3
                class="text-[10px] md:text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
              >
                Informações
              </h3>
              <div class="grid grid-cols-2 gap-1.5 md:gap-2">
                <DadoItem
                  v-for="item in detalhesItems"
                  :key="item.label"
                  :label="item.label"
                  :valor="item.valor"
                />
              </div>
            </div>
          </div>

          <div
            v-else
            key="historico"
            class="flex flex-col items-center justify-center py-8 md:py-10 text-[var(--color-text-muted)]"
          >
            <div
              class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-hover)] flex items-center justify-center mb-2.5 md:mb-3"
            >
              <History class="w-5 h-5 md:w-6 md:h-6 opacity-50" />
            </div>
            <p class="text-xs md:text-sm font-medium">Nenhum histórico registrado</p>
            <p class="text-[10px] md:text-xs mt-1 opacity-70">As interações aparecerão aqui</p>
          </div>
        </Transition>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
        <UiButton variant="secondary" class="w-full sm:w-auto" @click="isOpen = false">
          Fechar
        </UiButton>
        <UiButton variant="ghost" class="w-full sm:w-auto">
          <Send class="w-4 h-4" />
          Encaminhar
        </UiButton>
        <UiButton variant="primary" class="w-full sm:w-auto">
          <Edit class="w-4 h-4" />
          Editar
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { Calendar, CircleAlert, Edit, History, Send } from "lucide-vue-next";
import UiButton from "~/components/ui/UiButton.vue";
import UiModal from "~/components/ui/UiModal.vue";
import type { Ocorrencia, OcorrenciaStatus } from "../ocorrencias.types";
import DadoItem from "./DadoItem.vue";

const props = defineProps<{
  modelValue: boolean;
  ocorrencia: Ocorrencia | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:status": [value: OcorrenciaStatus];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const abaAtiva = ref<"dados" | "historico">("dados");

const tabs = [
  { id: "dados" as const, label: "Dados", icon: CircleAlert },
  { id: "historico" as const, label: "Histórico", icon: History },
];

const statusOptions = [
  { value: "pendente" as const, label: "Pendente" },
  { value: "acompanhamento" as const, label: "Em acompanhamento" },
  { value: "concluida" as const, label: "Concluída" },
];

const getStatusBarColor = (status?: string): string => {
  const map: Record<string, string> = {
    pendente: "bg-[var(--color-danger)]",
    acompanhamento: "bg-[var(--color-warning)]",
    concluida: "bg-[var(--color-success)]",
  };
  return map[status || ""] || "bg-[var(--color-primary)]";
};

const detalhesItems = computed(() => [
  { label: "Data", valor: formatarData(props.ocorrencia?.dataCadastro) || "-" },
  { label: "Atendente", valor: props.ocorrencia?.atendente || "-" },
  {
    label: "Encaminhado para",
    valor: props.ocorrencia?.encaminhadoPara || "-",
  },
  {
    label: "Diagnosticado por",
    valor: props.ocorrencia?.diagnosticadoPor || "-",
  },
  {
    label: "Forma de atendimento",
    valor: props.ocorrencia?.formaAtendimento || "-",
  },
  {
    label: "Situação",
    valor: getSituacaoLabel(props.ocorrencia?.situacao || ""),
  },
]);

const getStatusBadgeClass = (statusValue: OcorrenciaStatus): string => {
  const isActive = props.ocorrencia?.status === statusValue;

  if (!isActive) {
    return "bg-[var(--color-hover)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]";
  }

  const map: Record<OcorrenciaStatus, string> = {
    pendente:
      "bg-[var(--color-danger-soft)] text-[var(--color-danger)] ring-1 ring-[var(--color-danger)]",
    acompanhamento:
      "bg-[var(--color-warning-soft)] text-[var(--color-warning)] ring-1 ring-[var(--color-warning)]",
    concluida:
      "bg-[var(--color-success-soft)] text-[var(--color-success)] ring-1 ring-[var(--color-success)]",
  };
  return map[statusValue];
};

const getStatusDotClass = (statusValue: OcorrenciaStatus): string => {
  const isActive = props.ocorrencia?.status === statusValue;

  if (!isActive) {
    return "bg-[var(--color-text-muted)]";
  }

  const map: Record<OcorrenciaStatus, string> = {
    pendente: "bg-[var(--color-danger)]",
    acompanhamento: "bg-[var(--color-warning)]",
    concluida: "bg-[var(--color-success)]",
  };
  return map[statusValue];
};

const getSituacaoLabel = (situacao: string): string => {
  const map: Record<string, string> = {
    aberta: "Aberta",
    fechada: "Fechada",
  };
  return map[situacao.toLowerCase()] || situacao || "-";
};

const changeStatus = (status: OcorrenciaStatus) => {
  emit("update:status", status);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
