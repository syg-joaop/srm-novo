import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiMetricGrid from "./UiMetricGrid.vue";

const meta = {
  title: "UI/UiMetricGrid",
  component: UiMetricGrid,
  tags: ["autodocs"],
  argTypes: {
    items: { control: "object" },
  },
} satisfies Meta<typeof UiMetricGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Total Sales", value: "R$ 12.450,00" },
      { label: "Orders", value: "234" },
      { label: "Customers", value: "1.5K" },
      { label: "Avg. Order", value: "R$ 53,20" },
    ],
  },
  render: (args) => ({
    components: { UiMetricGrid },
    setup() {
      return { args };
    },
    template: `<UiMetricGrid v-bind="args" />`,
  }),
};

export const TwoItems: Story = {
  args: {
    items: [
      { label: "Revenue", value: "R$ 89.320,00" },
      { label: "Expenses", value: "R$ 45.120,00" },
    ],
  },
  render: (args) => ({
    components: { UiMetricGrid },
    setup() {
      return { args };
    },
    template: `<UiMetricGrid v-bind="args" />`,
  }),
};

export const SixItems: Story = {
  args: {
    items: [
      { label: "Daily Visits", value: "2,345" },
      { label: "Page Views", value: "12,890" },
      { label: "Bounce Rate", value: "32%" },
      { label: "Avg. Duration", value: "4m 23s" },
      { label: "Conversions", value: "156" },
      { label: "Conv. Rate", value: "6.6%" },
    ],
  },
  render: (args) => ({
    components: { UiMetricGrid },
    setup() {
      return { args };
    },
    template: `<UiMetricGrid v-bind="args" />`,
  }),
};

export const FinancialMetrics: Story = {
  args: {
    items: [
      { label: "Gross Revenue", value: "R$ 150.000,00" },
      { label: "Net Profit", value: "R$ 45.000,00" },
      { label: "Operating Costs", value: "R$ 85.000,00" },
      { label: "Tax", value: "R$ 20.000,00" },
    ],
  },
  render: (args) => ({
    components: { UiMetricGrid },
    setup() {
      return { args };
    },
    template: `<UiMetricGrid v-bind="args" />`,
  }),
};

export const PerformanceMetrics: Story = {
  args: {
    items: [
      { label: "Response Time", value: "45ms" },
      { label: "Uptime", value: "99.9%" },
      { label: "Error Rate", value: "0.1%" },
      { label: "Requests/sec", value: "1,234" },
    ],
  },
  render: (args) => ({
    components: { UiMetricGrid },
    setup() {
      return { args };
    },
    template: `<UiMetricGrid v-bind="args" />`,
  }),
};
