<template>
  <div
    class="relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 group hover:shadow-lg"
    style="background-color: var(--color-surface); border-color: var(--color-border-subtle)"
  >
    <div
      class="absolute top-0 left-0 w-full h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
      :class="
        variant === 'current'
          ? 'bg-gradient-to-r from-primary via-primary/80 to-primary/40'
          : 'bg-gradient-to-r from-gray-400 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-400'
      "
    />

    <div class="px-4 sm:px-5 pt-4 pb-3 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
          :class="
            variant === 'current'
              ? 'bg-primary/10 text-primary'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          "
        >
          <component :is="icon" class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold leading-tight" style="color: var(--color-text)">
            {{ title }}
          </h3>
          <p
            v-if="subtitle"
            class="text-[10px] sm:text-xs mt-0.5"
            style="color: var(--color-text-muted)"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div
        v-if="trend"
        class="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold"
        :class="
          trend > 0
            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
            : 'bg-red-500/10 text-red-600 dark:text-red-400'
        "
      >
        <TrendingUp v-if="trend > 0" class="w-3 h-3" />
        <TrendingDown v-else class="w-3 h-3" />
        {{ Math.abs(trend) }}%
      </div>
    </div>

    <div class="px-4 sm:px-5 pb-3">
      <div class="flex items-baseline gap-2">
        <span
          class="text-2xl sm:text-3xl font-black tracking-tight"
          :class="variant === 'current' ? 'text-primary' : ''"
          :style="variant !== 'current' ? 'color: var(--color-text)' : ''"
        >
          {{ mainValue }}
        </span>
        <span
          v-if="mainLabel"
          class="text-[10px] sm:text-xs font-medium uppercase tracking-wide"
          style="color: var(--color-text-muted)"
        >
          {{ mainLabel }}
        </span>
      </div>
    </div>

    <div
      class="grid grid-cols-3 gap-px border-t"
      style="background-color: var(--color-border-subtle); border-color: var(--color-border-subtle)"
    >
      <div
        v-for="(metric, index) in metrics"
        :key="index"
        class="px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:opacity-80"
        style="background-color: var(--color-surface)"
      >
        <p
          class="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 truncate"
          style="color: var(--color-text-muted)"
        >
          {{ metric.label }}
        </p>
        <p class="text-xs sm:text-sm font-bold truncate" style="color: var(--color-text)">
          {{ metric.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DollarSign, CalendarClock, TrendingUp, TrendingDown } from "lucide-vue-next";

interface Metric {
  label: string;
  value: string | number;
}

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    mainValue: string;
    mainLabel?: string;
    metrics: Metric[];
    variant?: "current" | "previous";
    trend?: number;
    icon?: Component;
  }>(),
  {
    variant: "current",
    mainLabel: "Total",
  },
);

const icon = computed(() => {
  return props.icon || (props.variant === "current" ? DollarSign : CalendarClock);
});
</script>
