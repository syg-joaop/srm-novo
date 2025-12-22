<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-semibold text-[var(--color-text)]">
      {{ label }}
      <span v-if="required" class="text-[var(--color-danger)]">*</span>
    </label>

    <div class="relative" ref="wrapperRef">
      <button
        type="button"
        class="select-trigger w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-md text-sm text-left transition-all duration-200"
        :class="[
          disabled ? 'opacity-50 cursor-not-allowed is-disabled' : 'cursor-pointer',
          isOpen ? 'is-open ring-2 ring-[var(--color-primary-soft)]' : '',
        ]"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <span
          :class="
            modelValue ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] opacity-60'
          "
        >
          {{ selectedLabel || placeholder }}
        </span>
        <ChevronDown
          class="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>

      <Teleport to="body">
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="opacity-0 -translate-y-2"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="isOpen"
            ref="dropdownRef"
            class="select-dropdown border rounded-lg shadow-xl overflow-hidden"
            :style="dropdownStyle"
          >
            <div v-if="searchable" class="p-2 border-b select-border">
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  class="select-search-input w-full pl-9 pr-3 py-2 rounded-md border text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                  placeholder="Buscar..."
                  @click.stop
                />
              </div>
            </div>

            <div class="max-h-60 overflow-y-auto py-1">
              <div
                v-if="filteredOptions.length === 0"
                class="px-3 py-4 text-sm text-[var(--color-text-muted)] text-center"
              >
                Nenhuma opção encontrada
              </div>

              <button
                v-for="option in filteredOptions"
                :key="getOptionValue(option)"
                type="button"
                class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors"
                :class="[
                  getOptionValue(option) === modelValue
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-medium'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-hover)]',
                ]"
                @click="selectOption(option)"
              >
                <Check v-if="getOptionValue(option) === modelValue" class="w-4 h-4 flex-shrink-0" />
                <span v-else class="w-4 flex-shrink-0" />
                <span class="truncate">{{ getOptionLabel(option) }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <span v-if="error" class="text-xs text-[var(--color-danger)]">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-[var(--color-text-muted)]">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Check, Search } from "lucide-vue-next";

type OptionValue = string | number;
type OptionObject = { label: string; value: OptionValue };
type Option = OptionValue | OptionObject;

interface Props {
  modelValue: OptionValue | null;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  error?: string;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  placeholder: "Selecione uma opção",
  disabled: false,
  required: false,
  searchable: false,
  error: "",
  hint: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: OptionValue | null];
  change: [value: OptionValue | null];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const wrapperRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const getOptionValue = (option: Option): OptionValue => {
  if (typeof option === "object" && option !== null) {
    return option.value;
  }
  return option;
};

const getOptionLabel = (option: Option): string => {
  if (typeof option === "object" && option !== null) {
    return option.label;
  }
  return String(option);
};

const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === "") return "";
  const selected = props.options.find((opt) => getOptionValue(opt) === props.modelValue);
  return selected ? getOptionLabel(selected) : "";
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(query));
});

const updateDropdownPosition = () => {
  if (!wrapperRef.value) return;

  const rect = wrapperRef.value.getBoundingClientRect();
  const dropdownHeight = 280;

  let top = rect.bottom + 4;
  let left = rect.left;
  let width = rect.width;

  if (top + dropdownHeight > window.innerHeight) {
    top = rect.top - dropdownHeight - 4;
  }

  dropdownStyle.value = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    zIndex: "9999",
  };
};

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = "";
    nextTick(() => {
      updateDropdownPosition();
    });
  }
};

const selectOption = (option: Option) => {
  const value = getOptionValue(option);
  emit("update:modelValue", value);
  emit("change", value);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    wrapperRef.value &&
    !wrapperRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isOpen.value = false;
  }
};

watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", updateDropdownPosition);
  window.addEventListener("scroll", updateDropdownPosition, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", updateDropdownPosition);
  window.removeEventListener("scroll", updateDropdownPosition, true);
});
</script>

<style scoped>
.select-trigger {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.select-trigger:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.select-trigger.is-open {
  border-color: var(--color-primary);
}

.select-trigger.is-disabled {
  background-color: var(--color-hover);
  border-color: var(--color-border);
  opacity: 0.5;
  cursor: not-allowed;
}

.select-dropdown {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.select-search-input {
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
}

.select-search-input:focus {
  border-color: var(--color-primary);
}

.select-border {
  border-color: var(--color-border);
}
</style>
