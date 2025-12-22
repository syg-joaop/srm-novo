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
          <div v-if="activeTab === 'atendimentos'" class="space-y-4">
            <div
              class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3 w-fit mb-4"
            >
              <div
                class="flex items-center gap-2 text-primary dark:text-blue-400 text-sm font-semibold"
              >
                <MessageSquare class="w-4 h-4" />
                0 resultados
              </div>
            </div>

            <UiEmptyState
              v-if="!mockAtendimentos.length"
              :icon="MessageSquare"
              title="Nenhum atendimento"
              description="Não há atendimentos registrados para este parceiro."
            />
          </div>

          <div v-else class="flex items-center justify-center h-64 text-gray-500">
            Conteúdo da aba
            {{ tabs.find((t) => t.id === activeTab)?.label }} (Em construção)
          </div>
        </Transition>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { MessageSquare, Presentation, UserPlus, Edit } from "lucide-vue-next";
import UiModal from "~/components/ui/UiModal.vue";
import UiButton from "~/components/ui/UiButton.vue";
import UiEmptyState from "~/components/ui/UiEmptyState.vue";

interface ParceiroData {
  name?: string;
  status?: string;
  location?: string;
  date?: string;
  role?: string;
  [key: string]: unknown;
}

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
  { id: "precos", label: "Preços" },
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

const mockAtendimentos = ref([]);

const isInactive = computed(() => {
  return (props.parceiro?.status || "").toLowerCase().trim() === "inativo";
});

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
