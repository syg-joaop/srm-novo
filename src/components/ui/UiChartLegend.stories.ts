import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiChartLegend from "./UiChartLegend.vue";

const meta = {
  title: "UI/UiChartLegend",
  component: UiChartLegend,
  tags: ["autodocs"],
  argTypes: {
    items: { control: "object" },
  },
} satisfies Meta<typeof UiChartLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { value: "45%", label: "Completed", color: "green" as const },
      { value: "30%", label: "In Progress", color: "yellow" as const },
      { value: "25%", label: "Pending", color: "red" as const },
    ],
  },
  render: (args) => ({
    components: { UiChartLegend },
    setup() {
      return { args };
    },
    template: `<UiChartLegend v-bind="args" />`,
  }),
};

export const SalesData: Story = {
  args: {
    items: [
      { value: "R$ 45K", label: "Online", color: "blue" as const },
      { value: "R$ 32K", label: "In-Store", color: "green" as const },
      { value: "R$ 18K", label: "Partners", color: "purple" as const },
    ],
  },
  render: (args) => ({
    components: { UiChartLegend },
    setup() {
      return { args };
    },
    template: `<UiChartLegend v-bind="args" />`,
  }),
};

export const StatusDistribution: Story = {
  args: {
    items: [
      { value: "156", label: "Active", color: "green" as const },
      { value: "43", label: "Inactive", color: "gray" as const },
      { value: "12", label: "Blocked", color: "red" as const },
    ],
  },
  render: (args) => ({
    components: { UiChartLegend },
    setup() {
      return { args };
    },
    template: `<UiChartLegend v-bind="args" />`,
  }),
};

export const AllColors: Story = {
  args: {
    items: [
      { value: "16%", label: "Green", color: "green" as const },
      { value: "16%", label: "Yellow", color: "yellow" as const },
      { value: "16%", label: "Red", color: "red" as const },
      { value: "16%", label: "Blue", color: "blue" as const },
      { value: "16%", label: "Purple", color: "purple" as const },
      { value: "16%", label: "Gray", color: "gray" as const },
    ],
  },
  render: (args) => ({
    components: { UiChartLegend },
    setup() {
      return { args };
    },
    template: `<UiChartLegend v-bind="args" />`,
  }),
};

export const TwoItems: Story = {
  args: {
    items: [
      { value: "75%", label: "Success", color: "green" as const },
      { value: "25%", label: "Failed", color: "red" as const },
    ],
  },
  render: (args) => ({
    components: { UiChartLegend },
    setup() {
      return { args };
    },
    template: `<UiChartLegend v-bind="args" />`,
  }),
};
