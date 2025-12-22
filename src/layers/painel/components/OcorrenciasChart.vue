<template>
  <div class="flex flex-col h-full">
    <div class="relative flex-1 min-h-0">
      <div ref="chartRef" class="w-full h-full"></div>

      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none"
        style="width: 100px"
      >
        <span
          class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1"
          style="color: var(--color-text-muted)"
        >
          Total
        </span>
        <span
          class="text-2xl sm:text-3xl font-black tracking-tight"
          style="color: var(--color-text)"
        >
          {{ total }}
        </span>
        <span class="text-[10px] font-medium mt-0.5" style="color: var(--color-text-muted)">
          ocorrências
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 px-2">
      <div
        v-for="item in legendItems"
        :key="item.name"
        class="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg transition-all duration-200 cursor-pointer group"
        :class="[hoveredItem === item.name ? 'scale-[1.02]' : '']"
        :style="{
          backgroundColor: hoveredItem === item.name ? `${item.color}15` : 'var(--color-hover)',
          border: `1px solid ${hoveredItem === item.name ? item.color : 'transparent'}`,
        }"
        @mouseenter="handleLegendHover(item.name)"
        @mouseleave="handleLegendHover(null)"
      >
        <div
          class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          :style="{
            backgroundColor: item.color,
            boxShadow: `0 0 8px ${item.color}60`,
          }"
        ></div>
        <div class="flex flex-col min-w-0 flex-1">
          <span
            class="text-[10px] sm:text-xs font-medium truncate"
            style="color: var(--color-text)"
          >
            {{ item.shortName }}
          </span>
          <div class="flex items-baseline gap-1">
            <span class="text-sm sm:text-base font-bold" :style="{ color: item.color }">
              {{ item.value }}
            </span>
            <span class="text-[9px] sm:text-[10px]" style="color: var(--color-text-muted)">
              ({{ item.percent }}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";

interface ChartDataItem {
  name: string;
  value: number;
}

const props = defineProps<{
  data: ChartDataItem[];
}>();

const chartRef = ref<HTMLElement | null>(null);
const hoveredItem = ref<string | null>(null);
let chartInstance: echarts.ECharts | null = null;

const total = computed(() => {
  return props.data.reduce((acc, item) => acc + item.value, 0);
});

const getStatusColor = (name: string): string => {
  const style = getComputedStyle(document.documentElement);
  const colorMap: Record<string, string> = {
    Finalizado: style.getPropertyValue("--color-status-finalizado").trim() || "#4ade80",
    "Em Acompanhamento":
      style.getPropertyValue("--color-status-acompanhamento").trim() || "#fbbf24",
    Pendente: style.getPropertyValue("--color-status-pendente").trim() || "#f87171",
    Vencido: style.getPropertyValue("--color-status-vencido").trim() || "#ef4444",
  };
  return colorMap[name] || "#0099ff";
};

const getShortName = (name: string): string => {
  const shortNames: Record<string, string> = {
    "Em Acompanhamento": "Acompanham.",
  };
  return shortNames[name] || name;
};

const legendItems = computed(() => {
  return props.data.map((item) => ({
    name: item.name,
    shortName: getShortName(item.name),
    value: item.value,
    percent: total.value > 0 ? Math.round((item.value / total.value) * 100) : 0,
    color: getStatusColor(item.name),
  }));
});

const handleLegendHover = (name: string | null) => {
  hoveredItem.value = name;
  if (chartInstance) {
    if (name) {
      chartInstance.dispatchAction({
        type: "highlight",
        name: name,
      });
    } else {
      chartInstance.dispatchAction({
        type: "downplay",
      });
    }
  }
};

const initChart = () => {
  if (!chartRef.value) return;

  const style = getComputedStyle(document.documentElement);
  const surfaceColor = style.getPropertyValue("--color-surface").trim();

  chartInstance = echarts.getInstanceByDom(chartRef.value) || echarts.init(chartRef.value);

  const coloredData = props.data.map((item) => ({
    ...item,
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: getStatusColor(item.name) },
        { offset: 1, color: adjustColorBrightness(getStatusColor(item.name), -20) },
      ]),
    },
  }));

  const option: echarts.EChartsOption = {
    tooltip: {
      show: false,
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "80%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: surfaceColor,
          borderWidth: 3,
        },
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
        data: coloredData,
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: (idx: number) => idx * 100,
      },
    ],
  };

  chartInstance.setOption(option);

  chartInstance.on("mouseover", (params: echarts.TooltipComponentOption) => {
    hoveredItem.value = params.name as string;
  });

  chartInstance.on("mouseout", () => {
    hoveredItem.value = null;
  });
};

const adjustColorBrightness = (color: string, amount: number): string => {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

const handleResize = () => {
  chartInstance?.resize();
};

watch(
  () => props.data,
  () => {
    nextTick(() => {
      initChart();
    });
  },
  { deep: true },
);

let themeObserver: MutationObserver | null = null;

onMounted(() => {
  nextTick(() => {
    initChart();
  });
  window.addEventListener("resize", handleResize);

  themeObserver = new MutationObserver(() => {
    initChart();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
});

onUnmounted(() => {
  themeObserver?.disconnect();
  themeObserver = null;
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
});
</script>
