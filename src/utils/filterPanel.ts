import type { Component } from "vue";

export interface FilterOption {
  label: string;
  value: string | number;
  icon?: Component;
}

export type FilterType = "select" | "input" | "button-group" | "segmented";

export interface FilterConfig {
  key: string;
  label?: string;
  type: FilterType;
  inputType?: string;
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: string | number;
  segmentedSize?: "xs" | "sm" | "md" | "lg";
  segmentedMobileSize?: "xs" | "sm" | "md" | "lg";
  segmentedFullWidth?: boolean;
}

export const getActiveFiltersCount = (
  filters: FilterConfig[] | undefined,
  modelValue: Record<string, any> | undefined,
): number => {
  if (!filters || filters.length === 0) return 0;

  const values = modelValue ?? {};

  return filters.reduce((count, filter) => {
    const value = values[filter.key];
    const defaultValue = filter.defaultValue;

    if (defaultValue !== undefined) {
      return value !== defaultValue ? count + 1 : count;
    }

    if (value && value !== "" && value !== "todos") {
      return count + 1;
    }

    return count;
  }, 0);
};
