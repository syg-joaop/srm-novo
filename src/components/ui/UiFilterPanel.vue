<template>
  <div>
    <button
      v-if="showButton"
      class="p-2.5 rounded-lg border transition-colors relative"
      :style="[
        isOpen
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
      @click="isOpen = !isOpen"
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

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="p-3 sm:p-4 rounded-lg border"
        :class="[panelSpacingClass, panelClass]"
        style="border-color: var(--color-border); background-color: var(--color-surface)"
      >
        <div
          v-if="selectFilters.length > 0"
          class="grid gap-3 sm:gap-4 mb-4"
          :class="gridColsClass"
        >
          <UiSelect
            v-for="filter in selectFilters"
            :key="filter.key"
            :model-value="modelValue[filter.key]"
            :label="filter.label"
            :options="filter.options ?? []"
            :placeholder="filter.placeholder"
            @update:model-value="updateFilter(filter.key, $event as string)"
          />
        </div>

        <div
          v-if="gridFilters.length > 0"
          class="grid gap-3 sm:gap-4 mb-4"
          :class="inputGridColsClass"
        >
          <div v-for="filter in gridFilters" :key="filter.key">
            <label
              v-if="filter.label"
              class="mb-1.5"
              :class="
                filter.type === 'segmented'
                  ? 'block text-xs font-semibold uppercase tracking-wide'
                  : 'block text-xs font-medium'
              "
              style="color: var(--color-text-muted)"
            >
              {{ filter.label }}
            </label>

            <input
              v-if="filter.type === 'input'"
              :value="modelValue[filter.key]"
              :type="filter.inputType || 'text'"
              :placeholder="filter.placeholder"
              class="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all border"
              style="
                background-color: var(--color-background);
                border-color: var(--color-border);
                color: var(--color-text);
              "
              @input="updateFilter(filter.key, ($event.target as HTMLInputElement).value)"
            />

            <UiSegmentedControl
              v-else-if="filter.type === 'segmented'"
              :model-value="modelValue[filter.key]"
              :options="filter.options ?? []"
              :size="filter.segmentedSize"
              :mobile-size="filter.segmentedMobileSize"
              :full-width="filter.segmentedFullWidth ?? true"
              @update:model-value="updateFilter(filter.key, $event)"
            />
          </div>
        </div>

        <div v-if="buttonGroupFilters.length > 0" class="flex flex-col md:flex-row gap-4 mb-4">
          <div v-for="filter in buttonGroupFilters" :key="filter.key" class="space-y-2">
            <label
              v-if="filter.label"
              class="block text-sm font-semibold"
              style="color: var(--color-text)"
            >
              {{ filter.label }}
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in filter.options"
                :key="option.value"
                class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
                :style="[
                  modelValue[filter.key] === option.value
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
                @click="updateFilter(filter.key, option.value as string)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { Filter, X } from "lucide-vue-next";
import UiSegmentedControl from "~/components/ui/UiSegmentedControl.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import { getActiveFiltersCount, type UiFilterConfig } from "~/utils/filterPanel";

interface Props {
  modelValue: Record<string, string>;
  filters: UiFilterConfig[];
  columns?: number;
  inputColumns?: number;
  open?: boolean;
  showButton?: boolean;
  panelClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 5,
  inputColumns: 2,
  showButton: true,
  panelClass: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, string>];
  "update:open": [value: boolean];
}>();

const internalOpen = ref(false);

const isOpen = computed({
  get: () => (typeof props.open === "boolean" ? props.open : internalOpen.value),
  set: (value) => {
    if (typeof props.open === "boolean") {
      emit("update:open", value);
      return;
    }
    internalOpen.value = value;
  },
});

const selectFilters = computed(() => props.filters.filter((f) => f.type === "select"));
const gridFilters = computed(() =>
  props.filters.filter((f) => f.type === "input" || f.type === "segmented"),
);
const buttonGroupFilters = computed(() => props.filters.filter((f) => f.type === "button-group"));

const gridColsClass = computed(() => {
  const cols = props.columns;
  return `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`;
});

const inputGridColsClass = computed(() => {
  const cols = props.inputColumns;
  return `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`;
});

const panelSpacingClass = computed(() => (props.showButton ? "mt-4" : ""));

const activeFiltersCount = computed(() => getActiveFiltersCount(props.filters, props.modelValue));

const updateFilter = (key: string, value: string) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [key]: value,
  });
};

const clearFilters = () => {
  const cleared: Record<string, string | number> = {};
  props.filters.forEach((filter) => {
    cleared[filter.key] = filter.defaultValue ?? "";
  });
  emit("update:modelValue", cleared as Record<string, string>);
};
</script>
