<template>
  <div class="flex justify-center gap-4 mt-4 flex-wrap">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="text-center px-3 py-2 rounded bg-gray-100 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800"
    >
      <p class="text-lg font-bold text-gray-900 dark:text-white">
        {{ item.value }}
      </p>
      <div class="flex items-center gap-1 mt-1">
        <span class="w-2 h-2 rounded-full" :class="getColorClass(item.color)"></span>
        <span class="text-[10px] text-gray-600 dark:text-gray-400 uppercase">
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChartLegendItem {
  value: string | number;
  label: string;
  color: "green" | "yellow" | "red" | "blue" | "purple" | "gray";
}

defineProps<{
  items: ChartLegendItem[];
}>();

const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    blue: "bg-primary",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
  };
  return colorMap[color] || "bg-gray-500";
};
</script>
