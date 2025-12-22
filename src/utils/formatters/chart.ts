export interface TooltipParam {
  name?: string;
  value?: number | string;
  seriesName?: string;
  percent?: number;
  color?: string | { colorStops?: { color: string }[]; type?: string };
}

export const premiumTooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  borderColor: "rgba(255, 255, 255, 0.1)",
  borderWidth: 1,
  padding: [10, 14],
  confine: true,
  appendToBody: true,
  textStyle: {
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    fontSize: 12,
  },
  extraCssText:
    "backdrop-filter: blur(8px); border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); z-index: 100 !important; max-width: 280px;",
};

export const getPremiumTooltip = (
  params: TooltipParam | TooltipParam[],
  title?: string,
  valueFormatter?: (value: number) => string,
) => {
  const items = Array.isArray(params) ? params : [params];
  const headerTitle = title || (Array.isArray(params) ? params[0].name : "Status");

  let content = `
    <div class="flex flex-col gap-1">
      <div class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">${headerTitle}</div>
  `;

  items.forEach((item: TooltipParam) => {
    const rawValue = typeof item.value === "number" ? item.value : Number(item.value) || 0;
    const value = valueFormatter ? valueFormatter(rawValue) : item.value;
    const name = item.percent !== undefined ? item.name : item.seriesName || item.name;
    let color = item.color;
    if (typeof color === "object" && color.colorStops && color.colorStops.length > 0) {
      color = color.colorStops[0].color;
    } else if (typeof color === "object" && color.type === "linear") {
      color = color.colorStops?.[0]?.color || "var(--color-primary)";
    }
    const percent = item.percent;

    const percentHtml =
      percent !== undefined
        ? `<div class="text-xs text-gray-500 mt-1">${percent}% do total</div>`
        : "";

    content += `
      <div class="flex items-center gap-3 mt-1">
        <span class="w-3 h-3 rounded-full shadow-sm" style="background-color: ${color}; box-shadow: 0 0 10px ${color}40;"></span>
        <span class="font-semibold text-sm text-white">${name}</span>
        <span class="font-bold text-lg text-white ml-auto">${value}</span>
      </div>
      ${percentHtml}
    `;
  });

  content += `</div>`;
  return content;
};
