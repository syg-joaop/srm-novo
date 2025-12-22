<template>
  <div class="hidden sm:flex gap-2 text-xs justify-end">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="group/badge relative flex items-center justify-center gap-2 min-w-[56px] px-2 py-1.5 rounded border transition-all duration-200 ease-out cursor-pointer hover:scale-105 hover:z-20 hover:shadow-md"
      :style="getBadgeStyle(item.color)"
      @mouseenter="(e) => showTooltip(index, e)"
      @mouseleave="hideTooltip"
    >
      <component :is="getIcon(item.icon)" class="w-3.5 h-3.5 shrink-0" />
      <span class="font-semibold">{{ item.value }}</span>

      <Teleport to="body">
        <div
          v-if="hoveredIndex === index"
          class="fixed px-2 py-1 text-[10px] font-medium text-white rounded shadow-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999]"
          style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
          :style="tooltipStyle"
        >
          {{ item.label }}
        </div>
      </Teleport>
    </div>
  </div>

  <div class="sm:hidden grid grid-cols-4 gap-1 text-[10px]">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="flex items-center justify-center gap-1 py-1 px-1.5 rounded border"
      :style="getBadgeStyle(item.color)"
    >
      <component :is="getIcon(item.icon)" class="w-3 h-3 shrink-0" />
      <span class="font-semibold">{{ item.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, CheckCircle, Clock, XCircle, Circle } from "lucide-vue-next";

interface StatusBadgeItem {
  value: string | number;
  label?: string;
  color: "red" | "green" | "yellow" | "blue" | "purple" | "gray" | "dark-red";
  icon?: string;
}

defineProps<{
  items: StatusBadgeItem[];
}>();

const hoveredIndex = ref<number | null>(null);
const tooltipStyle = ref<Record<string, string>>({});

const showTooltip = (index: number, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  tooltipStyle.value = {
    top: `${rect.top - 8}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: "translate(-50%, -100%)",
  };

  hoveredIndex.value = index;
};

const hideTooltip = () => {
  hoveredIndex.value = null;
};

const getIcon = (iconName?: string) => {
  const icons: Record<string, any> = {
    calendar: Calendar,
    check: CheckCircle,
    clock: Clock,
    x: XCircle,
    default: Circle,
  };
  return icons[iconName || "default"] || Circle;
};

const getBadgeStyle = (color: string) => {
  const colorMap: Record<string, Record<string, string>> = {
    red: {
      backgroundColor: "var(--color-danger-soft)",
      color: "var(--color-danger)",
      borderColor: "var(--color-border-subtle)",
    },
    green: {
      backgroundColor: "var(--color-success-soft)",
      color: "var(--color-success)",
      borderColor: "var(--color-border-subtle)",
    },
    yellow: {
      backgroundColor: "var(--color-warning-soft)",
      color: "var(--color-warning)",
      borderColor: "var(--color-border-subtle)",
    },
    blue: {
      backgroundColor: "var(--color-primary-soft)",
      color: "var(--color-primary)",
      borderColor: "var(--color-border-subtle)",
    },
    gray: {
      backgroundColor: "var(--color-hover)",
      color: "var(--color-text-muted)",
      borderColor: "var(--color-border-subtle)",
    },
    "dark-red": {
      backgroundColor: "var(--color-danger-soft)",
      color: "var(--color-danger)",
      borderColor: "var(--color-border-subtle)",
    },
    purple: {
      backgroundColor: "var(--color-primary-soft)",
      color: "var(--color-primary)",
      borderColor: "var(--color-border-subtle)",
    },
  };
  return colorMap[color] || colorMap.gray;
};
</script>
