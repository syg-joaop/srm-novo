<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 sm:gap-2">
    <button
      class="hidden sm:flex w-10 h-10 md:w-9 md:h-9 items-center justify-center rounded-md transition-all duration-200"
      :class="page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--color-hover)]'"
      :disabled="page === 1"
      @click="goToPage(1)"
    >
      <ChevronsLeft class="w-5 h-5 sm:w-4 sm:h-4 text-[var(--color-text-muted)]" />
    </button>

    <button
      class="w-11 h-11 sm:w-10 sm:h-10 md:w-9 md:h-9 flex items-center justify-center rounded-md transition-all duration-200"
      :class="page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--color-hover)]'"
      :disabled="page === 1"
      @click="goToPage(page - 1)"
    >
      <ChevronLeft class="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[var(--color-text-muted)]" />
    </button>

    <button
      v-for="pageNumber in visiblePages"
      :key="pageNumber"
      class="w-10 h-10 sm:w-9 sm:h-9 md:w-9 md:h-9 rounded-md text-sm sm:text-xs md:text-sm font-medium transition-all duration-200"
      :class="[
        pageNumber === page
          ? 'bg-[var(--color-primary)] text-white'
          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
      ]"
      @click="goToPage(pageNumber)"
    >
      {{ pageNumber }}
    </button>

    <button
      class="w-11 h-11 sm:w-10 sm:h-10 md:w-9 md:h-9 flex items-center justify-center rounded-md transition-all duration-200"
      :class="
        page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--color-hover)]'
      "
      :disabled="page === totalPages"
      @click="goToPage(page + 1)"
    >
      <ChevronRight class="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 text-[var(--color-text-muted)]" />
    </button>

    <button
      class="hidden sm:flex w-10 h-10 md:w-9 md:h-9 items-center justify-center rounded-md transition-all duration-200"
      :class="
        page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--color-hover)]'
      "
      :disabled="page === totalPages"
      @click="goToPage(totalPages)"
    >
      <ChevronsRight class="w-5 h-5 sm:w-4 sm:h-4 text-[var(--color-text-muted)]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-vue-next";

interface Props {
  page: number;
  totalPages: number;
  maxVisible?: number;
  totalItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 3,
});

const emit = defineEmits<{
  "update:page": [value: number];
}>();

const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1024);

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", updateWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWidth);
});

const effectiveMaxVisible = computed(() => {
  if (windowWidth.value < 400) return 3;
  if (windowWidth.value < 640) return Math.min(props.maxVisible, 5);
  return props.maxVisible;
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVis = effectiveMaxVisible.value;
  const half = Math.floor(maxVis / 2);

  let start = Math.max(1, props.page - half);
  let end = Math.min(props.totalPages, start + maxVis - 1);

  if (end - start + 1 < maxVis) {
    start = Math.max(1, end - maxVis + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit("update:page", page);
  }
};
</script>
