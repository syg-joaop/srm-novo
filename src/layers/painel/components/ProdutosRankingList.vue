<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="(produto, index) in produtos"
      :key="`${produto.name}-${index}`"
      class="group/item relative flex flex-col gap-2 p-2 rounded-xl border border-transparent hover:border-primary/30 dark:hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 ease-out hover:shadow-sm cursor-pointer"
    >
      <div
        class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-primary rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
      ></div>
      <div class="hidden sm:grid grid-cols-[minmax(0,1fr)_120px_120px_90px] gap-8 items-center">
        <div class="flex items-center gap-2 min-w-0">
          <span
            class="text-[10px] font-semibold text-[var(--color-text-muted)] rounded-md border px-1.5 py-0.5"
            style="border-color: var(--color-border-subtle)"
          >
            {{ index + 1 }}
          </span>
          <span class="text-xs font-medium text-[var(--color-text)] truncate" :title="produto.name">
            {{ produto.name }}
          </span>
        </div>

        <span
          class="text-xs font-semibold text-[var(--color-primary)] tabular-nums justify-self-start"
        >
          {{ formatValue(produto.current) }}
        </span>

        <span
          class="text-xs text-[var(--color-text-muted)] font-medium tabular-nums justify-self-start"
        >
          {{ formatValue(produto.previous) }}
        </span>

        <div
          class="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold justify-self-start"
          :style="getDeltaStyle(produto.current, produto.previous)"
        >
          <component :is="getDeltaIcon(produto.current, produto.previous)" class="w-3 h-3" />
          <span>{{ getDeltaLabel(produto.current, produto.previous) }}</span>
        </div>
      </div>

      <div class="sm:hidden flex flex-col gap-1.5">
        <div class="flex items-center gap-2 min-w-0">
          <span
            class="text-[10px] font-semibold text-[var(--color-text-muted)] rounded-md border px-1.5 py-0.5"
            style="border-color: var(--color-border-subtle)"
          >
            {{ index + 1 }}
          </span>
          <span class="text-xs font-medium text-[var(--color-text)] truncate" :title="produto.name">
            {{ produto.name }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 text-[11px]">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>
            <span class="font-semibold text-[var(--color-primary)] tabular-nums">
              {{ formatValue(produto.current) }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] opacity-50"></span>
            <span class="font-medium text-[var(--color-text-muted)] tabular-nums">
              {{ formatValue(produto.previous) }}
            </span>
          </div>
        </div>

        <div
          class="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold self-start"
          :style="getDeltaStyle(produto.current, produto.previous)"
        >
          <component :is="getDeltaIcon(produto.current, produto.previous)" class="w-3 h-3" />
          <span>{{ getDeltaLabel(produto.current, produto.previous) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, TrendingDown, TrendingUp } from "lucide-vue-next";

interface Props {
  data: {
    names: string[];
    current: number[];
    previous: number[];
  };
}

const props = defineProps<Props>();

const produtos = computed(() => {
  if (!props.data?.names?.length) return [];

  return props.data.names.map((name, index) => {
    const current = props.data.current[index] || 0;
    const previous = props.data.previous[index] || 0;

    return { name, current, previous };
  });
});

const getDeltaVariant = (current: number, previous: number) => {
  if (current === previous) return "flat";
  return current > previous ? "up" : "down";
};

const getDeltaLabel = (current: number, previous: number): string => {
  if (previous === 0) {
    return current === 0 ? "0%" : "Novo";
  }
  const percent = ((current - previous) / previous) * 100;
  const rounded = Math.round(Math.abs(percent));
  const sign = percent > 0 ? "+" : "-";
  return `${sign}${rounded}%`;
};

const getDeltaIcon = (current: number, previous: number) => {
  const variant = getDeltaVariant(current, previous);
  if (variant === "up") return TrendingUp;
  if (variant === "down") return TrendingDown;
  return Minus;
};

const getDeltaStyle = (current: number, previous: number) => {
  const variant = getDeltaVariant(current, previous);
  if (variant === "up") {
    return {
      color: "var(--color-success)",
      backgroundColor: "var(--color-success-soft)",
      borderColor: "var(--color-success)",
    };
  }
  if (variant === "down") {
    return {
      color: "var(--color-danger)",
      backgroundColor: "var(--color-danger-soft)",
      borderColor: "var(--color-danger)",
    };
  }
  return {
    color: "var(--color-text-muted)",
    backgroundColor: "var(--color-hover)",
    borderColor: "var(--color-border-subtle)",
  };
};

const formatValue = (value: number): string => {
  return formatarKg(value);
};
</script>
