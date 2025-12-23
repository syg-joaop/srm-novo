<template>
  <div
    class="flex flex-col h-full rounded-2xl border shadow-lg transition-all duration-300 group relative hover:shadow-xl bg-[var(--color-surface)] border-[var(--color-border-subtle)]"
  >
    <div
      class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl"
    />

    <div
      class="px-4 md:px-6 pt-4 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[var(--color-border-subtle)] shrink-0"
    >
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div
          class="w-1 h-4 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(0,153,255,0.5)]"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <h3 class="font-bold text-base leading-none tracking-tight text-[var(--color-text)]">
              {{ title }}
            </h3>
            <div
              v-if="$slots.action"
              class="md:hidden text-[var(--color-text-muted)] hover:opacity-80 transition-colors"
            >
              <slot name="action" />
            </div>
          </div>
          <p v-if="subtitle" class="text-[11px] font-medium mt-1.5 text-[var(--color-text-muted)]">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <UiSegmentedControl
          v-if="showTabs && availableTabs.length > 1"
          :model-value="activeTab"
          :options="availableTabs"
          class="w-full md:w-auto"
          :full-width="true"
          @update:model-value="selectTab"
        />

        <div
          v-if="$slots.action"
          class="hidden md:block text-[var(--color-text-muted)] hover:opacity-80 transition-colors"
        >
          <slot name="action" />
        </div>
      </div>
    </div>

    <div v-if="hasSubheader()" class="px-6">
      <slot name="subheader" />
    </div>

    <div
      class="px-6 py-2 relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar"
    >
      <div
        v-if="showEmptyState"
        class="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] py-8"
      >
        <div
          class="w-12 h-12 rounded-full bg-[var(--color-hover)] flex items-center justify-center mb-3"
        >
          <component :is="emptyIcon" class="w-6 h-6 opacity-50" />
        </div>
        <p class="text-sm font-medium">{{ emptyTitle }}</p>
        <p v-if="emptyDescription" class="text-xs mt-1 opacity-70">
          {{ emptyDescription }}
        </p>
      </div>

      <template v-else>
        <slot :paginatedItems="paginatedItems" :activeTab="activeTab" />
      </template>
    </div>

    <div
      v-if="$slots.footer || (paginated && items && totalPages > 1)"
      class="px-6 py-2 text-xs border-t border-[var(--color-border-subtle)] text-[var(--color-text-muted)] shrink-0 mt-auto"
    >
      <div
        v-if="paginated && items && totalPages > 1"
        class="flex items-center justify-center gap-6 sm:gap-4 w-full py-1"
      >
        <button
          :disabled="currentPage === 1"
          class="p-2.5 sm:p-1.5 md:p-1 rounded-lg transition-colors disabled:opacity-30 hover:bg-[var(--color-hover)]"
          @click="prevPage"
        >
          <ChevronLeft class="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4" />
        </button>
        <span class="font-medium text-sm sm:text-xs">
          {{ currentPage }} <span class="opacity-50 mx-1">/</span>
          {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages"
          class="p-2.5 sm:p-1.5 md:p-1 rounded-lg transition-colors disabled:opacity-30 hover:bg-[var(--color-hover)]"
          @click="nextPage"
        >
          <ChevronRight class="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4" />
        </button>
      </div>
      <slot v-else name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
export const DEFAULT_TABS: TabOption[] = [
  { label: "Fornecedores", value: "fornecedores" },
  { label: "Contatos", value: "contatos" },
];
</script>

<script setup lang="ts" generic="T = unknown">
import { ChevronLeft, ChevronRight, Inbox } from "lucide-vue-next";
import UiSegmentedControl from "~/components/ui/UiSegmentedControl.vue";
import type { TabOption } from "~/layers/painel/types/dashboard";

const emit = defineEmits<{
  (e: "update:activeTab", value: string): void;
  (e: "tab-change", value: string): void;
}>();

const slots = useSlots();

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    items?: T[];
    pageSize?: number;
    paginated?: boolean;
    isEmpty?: boolean;
    emptyIcon?: Component;
    emptyTitle?: string;
    emptyDescription?: string;
    showTabs?: boolean;
    tabs?: TabOption[];
    defaultTab?: string;
    activeTab?: string;
  }>(),
  {
    pageSize: 10,
    paginated: false,
    isEmpty: false,
    emptyTitle: "Nenhum resultado",
    emptyDescription: "Não há dados para exibir",
    showTabs: false,
    tabs: () => [...DEFAULT_TABS],
    defaultTab: "fornecedores",
  },
);

const hasSubheader = () => {
  if (!slots.subheader) return false;
  const content = slots.subheader();
  return Array.isArray(content) && content.length > 0;
};

const availableTabs = computed<TabOption[]>(() => {
  if (props.tabs && props.tabs.length > 0) return props.tabs;
  return DEFAULT_TABS;
});

const activeTab = ref(
  props.activeTab ??
    availableTabs.value.find((tab) => tab.value === props.defaultTab)?.value ??
    availableTabs.value[0]?.value ??
    "",
);

watch(
  () => props.defaultTab,
  (newDefault) => {
    if (!newDefault || props.activeTab) return;
    if (!availableTabs.value.some((tab) => tab.value === newDefault)) return;
    activeTab.value = newDefault;
  },
);

watch(
  () => props.activeTab,
  (newValue) => {
    if (!newValue) return;
    if (!availableTabs.value.some((tab) => tab.value === newValue)) return;
    activeTab.value = newValue;
  },
);

watch(availableTabs, (newTabs) => {
  if (newTabs.length === 0) {
    activeTab.value = "";
    return;
  }

  if (!newTabs.some((tab) => tab.value === activeTab.value)) {
    activeTab.value = newTabs[0].value;
  }
});

const selectTab = (tabValue: string) => {
  if (tabValue === activeTab.value) return;
  activeTab.value = tabValue;
  emit("update:activeTab", tabValue);
  emit("tab-change", tabValue);
};

const emptyIcon = computed(() => props.emptyIcon || Inbox);

const showEmptyState = computed(() => {
  if (props.isEmpty) return true;
  if (props.paginated) {
    return !props.items || props.items.length === 0;
  }
  return false;
});

const currentPage = ref(1);

const totalPages = computed(() =>
  props.items ? Math.ceil(props.items.length / props.pageSize) : 0,
);

const paginatedItems = computed<T[]>(() => {
  if (!props.items) return [];
  if (!props.paginated) return props.items;
  const start = (currentPage.value - 1) * props.pageSize;
  return props.items.slice(start, start + props.pageSize);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
</script>
