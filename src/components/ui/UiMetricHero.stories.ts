import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import { DollarSign, TrendingUp, Users, ShoppingCart } from "lucide-vue-next";
import UiMetricHero from "./UiMetricHero.vue";

const meta = {
  title: "UI/UiMetricHero",
  component: UiMetricHero,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    variant: { control: "text" },
    iconSize: { control: "number" },
  },
  args: {
    label: "Total Revenue",
    value: "R$ 45.231,89",
    variant: "primary",
    iconSize: 32,
  },
} satisfies Meta<typeof UiMetricHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: DollarSign,
    label: "Total Revenue",
    value: "R$ 45.231,89",
  },
  render: (args) => ({
    components: { UiMetricHero },
    setup() {
      return { args };
    },
    template: `<UiMetricHero v-bind="args" />`,
  }),
};

export const TrendingMetric: Story = {
  args: {
    icon: TrendingUp,
    label: "Growth Rate",
    value: "+23.5%",
    variant: "success",
  },
  render: (args) => ({
    components: { UiMetricHero },
    setup() {
      return { args };
    },
    template: `<UiMetricHero v-bind="args" />`,
  }),
};

export const UsersMetric: Story = {
  args: {
    icon: Users,
    label: "Active Users",
    value: "1,234",
    variant: "info",
  },
  render: (args) => ({
    components: { UiMetricHero },
    setup() {
      return { args };
    },
    template: `<UiMetricHero v-bind="args" />`,
  }),
};

export const OrdersMetric: Story = {
  args: {
    icon: ShoppingCart,
    label: "Total Orders",
    value: "892",
    variant: "warning",
  },
  render: (args) => ({
    components: { UiMetricHero },
    setup() {
      return { args };
    },
    template: `<UiMetricHero v-bind="args" />`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { UiMetricHero },
    setup() {
      return { DollarSign, TrendingUp, Users, ShoppingCart };
    },
    template: `
      <div class="space-y-6">
        <UiMetricHero :icon="DollarSign" label="Revenue" value="R$ 45.231,89" variant="primary" />
        <UiMetricHero :icon="TrendingUp" label="Growth" value="+23.5%" variant="success" />
        <UiMetricHero :icon="Users" label="Users" value="1,234" variant="info" />
        <UiMetricHero :icon="ShoppingCart" label="Orders" value="892" variant="warning" />
      </div>
    `,
  }),
};

export const CustomIconSize: Story = {
  args: {
    icon: DollarSign,
    label: "Large Icon",
    value: "R$ 100.000,00",
    iconSize: 48,
  },
  render: (args) => ({
    components: { UiMetricHero },
    setup() {
      return { args };
    },
    template: `<UiMetricHero v-bind="args" />`,
  }),
};
