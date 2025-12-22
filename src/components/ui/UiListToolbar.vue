<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div class="flex items-center gap-2 w-full md:max-w-xl">
        <slot name="leading" />
        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style="color: var(--color-text-muted)"
          />
          <input
            v-model="searchProxy"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all border"
            style="
              background-color: var(--color-surface);
              border-color: var(--color-border);
              color: var(--color-text);
            "
          />
        </div>

        <button
          v-if="hasFilters"
          class="p-2.5 rounded-lg border transition-colors relative"
          :style="[
            filtersOpen
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
          @click="filtersOpen = !filtersOpen"
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

      <slot name="actions" />
    </div>

    <UiFilterPanel
      v-if="hasFilters"
      v-model="filtersProxy"
      :filters="filterItems"
      :columns="filterColumns"
      :input-columns="inputColumns"
      :open="filtersOpen"
      :show-button="false"
      panel-class="mb-6"
      @update:open="filtersOpen = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { Filter, Search } from "lucide-vue-next";
import UiFilterPanel from "~/components/ui/UiFilterPanel.vue";
import { getActiveFiltersCount, type FilterConfig } from "~/utils/filterPanel";

interface Props {
  search: string;
  searchPlaceholder?: string;
  filters: Record<string, any>;
  filterItems: FilterConfig[];
  filterColumns?: number;
  inputColumns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: "Pesquisar...",
  filterColumns: undefined,
  inputColumns: undefined,
});

const emit = defineEmits<{
  "update:search": [value: string];
  "update:filters": [value: Record<string, any>];
}>();

const filtersOpen = ref(false);

const searchProxy = computed({
  get: () => props.search,
  set: (value: string) => emit("update:search", value),
});

const filtersProxy = computed({
  get: () => props.filters,
  set: (value: Record<string, any>) => emit("update:filters", value),
});

const hasFilters = computed(() => props.filterItems.length > 0);

const activeFiltersCount = computed(() =>
  getActiveFiltersCount(props.filterItems, props.filters),
);
</script>
