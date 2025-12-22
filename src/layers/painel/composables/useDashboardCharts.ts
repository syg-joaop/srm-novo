import * as echarts from "echarts";
import {
  getPremiumTooltip,
  premiumTooltipStyle,
  type TooltipParam,
} from "~/utils/formatters/chart";
import type { ChartData } from "../dashboard.types";
import { formatarKg, formatarMoeda } from "~/utils/formatters/formatadores";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const boundedTooltipPosition = (
  point: number[],
  _params: unknown,
  _dom: HTMLElement,
  _rect: unknown,
  size: { viewSize?: number[]; contentSize?: number[] },
) => {
  if (!point || !size?.viewSize || !size?.contentSize) return point;

  const [x, y] = point;
  const [viewW, viewH] = size.viewSize;
  const [contentW, contentH] = size.contentSize;
  const margin = 8;

  const maxLeft = Math.max(margin, viewW - contentW - margin);
  const maxTop = Math.max(margin, viewH - contentH - margin);

  const left = clamp(x - contentW / 2, margin, maxLeft);
  const top = clamp(y - contentH - margin, margin, maxTop);

  return [left, top];
};

const axisTooltip = (formatter: (params: TooltipParam | TooltipParam[]) => string) => ({
  trigger: "axis",
  ...premiumTooltipStyle,
  appendToBody: false,
  position: boundedTooltipPosition,
  formatter,
});

const getStyleVar = (variable: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 3 && clean.length !== 6) {
    return `rgba(0, 153, 255, ${alpha})`;
  }

  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : clean;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return `rgba(0, 153, 255, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getChart = (el: HTMLElement) => echarts.getInstanceByDom(el) || echarts.init(el);

export const useDashboardCharts = (chartData: Ref<ChartData>) => {
  const lineChartRef = ref<HTMLElement | null>(null);
  const barChartRef = ref<HTMLElement | null>(null);
  const discountChartRef = ref<HTMLElement | null>(null);

  const initCharts = () => {
    const primaryColor = getStyleVar("--color-primary") || "#0099ff";
    const textColor = getStyleVar("--color-text") || "#ffffff";
    const areaTop = hexToRgba(primaryColor, 0.3);
    const areaBottom = hexToRgba(primaryColor, 0);

    const commonOptions = {
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        axisLine: { lineStyle: { color: getStyleVar("--color-border") } },
        axisLabel: { color: getStyleVar("--color-text-muted") },
      },
      yAxis: {
        splitLine: {
          lineStyle: {
            color: getStyleVar("--color-border"),
            type: "dashed",
            opacity: 0.3,
          },
        },
        axisLabel: { color: getStyleVar("--color-text-muted") },
      },
    };

    if (lineChartRef.value) {
      const chart = getChart(lineChartRef.value);
      chart.setOption({
        tooltip: axisTooltip((params) => getPremiumTooltip(params)),
        grid: commonOptions.grid,
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartData.value.ocorrenciasLine.months,
          ...commonOptions.xAxis,
        },
        yAxis: {
          type: "value",
          ...commonOptions.yAxis,
        },
        series: [
          {
            name: "Ocorrencias",
            data: chartData.value.ocorrenciasLine.values,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 8,
            itemStyle: { color: primaryColor, borderColor: textColor, borderWidth: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: areaTop },
                { offset: 1, color: areaBottom },
              ]),
            },
          },
        ],
      });
    }

    if (barChartRef.value) {
      const chart = getChart(barChartRef.value);
      chart.setOption({
        tooltip: axisTooltip((params) => getPremiumTooltip(params, undefined, formatarKg)),
        grid: commonOptions.grid,
        xAxis: {
          type: "category",
          data: chartData.value.metaDiaria.days,
          ...commonOptions.xAxis,
        },
        yAxis: {
          type: "value",
          ...commonOptions.yAxis,
        },
        series: [
          {
            name: "Meta Diaria",
            data: chartData.value.metaDiaria.values,
            type: "bar",
            itemStyle: { color: primaryColor },
          },
        ],
      });
    }

    if (discountChartRef.value) {
      const chart = getChart(discountChartRef.value);
      chart.setOption({
        tooltip: axisTooltip((params) => getPremiumTooltip(params, undefined, formatarMoeda)),
        grid: commonOptions.grid,
        xAxis: {
          type: "category",
          data: chartData.value.descontos.months,
          ...commonOptions.xAxis,
        },
        yAxis: {
          type: "value",
          ...commonOptions.yAxis,
        },
        series: [
          {
            name: "Descontos",
            data: chartData.value.descontos.values,
            type: "bar",
            barWidth: "20%",
            itemStyle: { color: primaryColor },
          },
        ],
      });
    }
  };

  const resizeCharts = () => {
    if (lineChartRef.value) {
      echarts.getInstanceByDom(lineChartRef.value)?.resize();
    }
    if (barChartRef.value) {
      echarts.getInstanceByDom(barChartRef.value)?.resize();
    }
    if (discountChartRef.value) {
      echarts.getInstanceByDom(discountChartRef.value)?.resize();
    }
  };

  let themeObserver: MutationObserver | null = null;

  onMounted(() => {
    nextTick(() => {
      resizeCharts();
    });
    window.addEventListener("resize", resizeCharts);

    themeObserver = new MutationObserver(() => {
      initCharts();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  });

  onUnmounted(() => {
    themeObserver?.disconnect();
    themeObserver = null;
    window.removeEventListener("resize", resizeCharts);
  });

  return {
    lineChartRef,
    barChartRef,
    discountChartRef,
    initCharts,
    resizeCharts,
  };
};
