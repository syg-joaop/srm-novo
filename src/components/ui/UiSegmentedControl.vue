<template>
  <div
    ref="containerRef"
    class="relative inline-flex gap-1 p-1 rounded-xl bg-[var(--color-hover)] font-medium max-w-full"
    :class="[sizeClasses.container, { 'w-full': fullWidth }]"
  >
    <div
      v-if="indicatorStyle.width"
      class="absolute rounded-lg bg-[var(--color-primary)] shadow-sm transition-all duration-300 ease-out"
      :style="indicatorStyle"
    />

    <button
      v-for="(option, index) in options"
      :key="option.value"
      :ref="(el) => setButtonRef(el, index)"
      type="button"
      class="relative z-10 rounded-lg transition-colors duration-200 text-center"
      :class="[
        sizeClasses.button,
        modelValue === option.value
          ? 'text-white'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
        { 'flex-1': fullWidth },
      ]"
      @click="selectOption(option.value)"
    >
      <span class="inline-flex items-center justify-center gap-1.5">
        <component v-if="option.icon" :is="option.icon" :class="[sizeClasses.icon, 'shrink-0']" />
        <span
          class="whitespace-nowrap"
          :class="{ 'hidden sm:inline': option.icon && hideLabelsOnMobile }"
        >
          {{ option.label }}
        </span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">

export interface SegmentedOption {
  label: string;
  value: string;
  icon?: Component;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: SegmentedOption[];
    size?: "xs" | "sm" | "md" | "lg";
    mobileSize?: "xs" | "sm" | "md" | "lg";
    fullWidth?: boolean;
    hideLabelsOnMobile?: boolean;
  }>(),
  {
    size: "md",
    mobileSize: undefined,
    fullWidth: false,
    hideLabelsOnMobile: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const buttonRefs = ref<(HTMLElement | null)[]>([]);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const setButtonRef = (el: unknown, index: number) => {
  buttonRefs.value[index] = el as HTMLElement | null;
};

const indicatorStyle = ref<{
  width: string;
  height: string;
  left: string;
  top: string;
}>({
  width: "",
  height: "",
  left: "",
  top: "",
});

const updateIndicator = () => {
  const selectedIndex = props.options.findIndex((opt) => opt.value === props.modelValue);
  const button = buttonRefs.value[selectedIndex];

  if (button && containerRef.value) {
    const containerRect = containerRef.value.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    indicatorStyle.value = {
      width: `${buttonRect.width}px`,
      height: `${buttonRect.height}px`,
      left: `${buttonRect.left - containerRect.left}px`,
      top: `${buttonRect.top - containerRect.top}px`,
    };
  }
};

const currentSize = computed(() => {
  if (isMobile.value && props.mobileSize) {
    return props.mobileSize;
  }
  return props.size;
});

const sizeClasses = computed(() => {
  switch (currentSize.value) {
    case "xs":
      return {
        container: "text-[10px]",
        button: "px-2 py-1",
        icon: "w-3 h-3",
      };
    case "sm":
      return {
        container: "text-xs",
        button: "px-3 py-1.5",
        icon: "w-3.5 h-3.5",
      };
    case "lg":
      return {
        container: "text-sm",
        button: "px-5 py-3",
        icon: "w-5 h-5",
      };
    default:
      return {
        container: "text-[13px]",
        button: "px-4 py-2",
        icon: "w-4 h-4",
      };
  }
});

const selectOption = (value: string) => {
  if (value !== props.modelValue) {
    emit("update:modelValue", value);
  }
};

watch(
  () => props.modelValue,
  () => {
    nextTick(updateIndicator);
  },
);

watch(
  () => props.options,
  () => {
    nextTick(updateIndicator);
  },
  { deep: true },
);

watch(currentSize, () => {
  nextTick(updateIndicator);
});

const handleResize = () => {
  checkMobile();
  updateIndicator();
};

onMounted(() => {
  checkMobile();
  nextTick(updateIndicator);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
