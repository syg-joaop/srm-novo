import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiStatusBadgeGroup from "./UiStatusBadgeGroup.vue";

const meta = {
  title: "UI/UiStatusBadgeGroup",
  component: UiStatusBadgeGroup,
  tags: ["autodocs"],
  argTypes: {
    items: { control: "object" },
  },
} satisfies Meta<typeof UiStatusBadgeGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { value: 12, label: "Scheduled", color: "blue" as const, icon: "calendar" },
      { value: 45, label: "Completed", color: "green" as const, icon: "check" },
      { value: 8, label: "Pending", color: "yellow" as const, icon: "clock" },
      { value: 3, label: "Failed", color: "red" as const, icon: "x" },
    ],
  },
  render: (args) => ({
    components: { UiStatusBadgeGroup },
    setup() {
      return { args };
    },
    template: `<UiStatusBadgeGroup v-bind="args" />`,
  }),
};

export const OrderStatus: Story = {
  args: {
    items: [
      { value: 156, label: "New Orders", color: "blue" as const, icon: "calendar" },
      { value: 89, label: "Processing", color: "yellow" as const, icon: "clock" },
      { value: 234, label: "Shipped", color: "green" as const, icon: "check" },
      { value: 12, label: "Cancelled", color: "red" as const, icon: "x" },
    ],
  },
  render: (args) => ({
    components: { UiStatusBadgeGroup },
    setup() {
      return { args };
    },
    template: `<UiStatusBadgeGroup v-bind="args" />`,
  }),
};

export const TaskStatus: Story = {
  args: {
    items: [
      { value: 24, label: "To Do", color: "gray" as const },
      { value: 18, label: "In Progress", color: "blue" as const, icon: "clock" },
      { value: 42, label: "Done", color: "green" as const, icon: "check" },
    ],
  },
  render: (args) => ({
    components: { UiStatusBadgeGroup },
    setup() {
      return { args };
    },
    template: `<UiStatusBadgeGroup v-bind="args" />`,
  }),
};

export const AllColors: Story = {
  args: {
    items: [
      { value: 10, label: "Red", color: "red" as const },
      { value: 20, label: "Green", color: "green" as const },
      { value: 30, label: "Yellow", color: "yellow" as const },
      { value: 40, label: "Blue", color: "blue" as const },
    ],
  },
  render: (args) => ({
    components: { UiStatusBadgeGroup },
    setup() {
      return { args };
    },
    template: `<UiStatusBadgeGroup v-bind="args" />`,
  }),
};

export const WithIcons: Story = {
  args: {
    items: [
      { value: 5, color: "blue" as const, icon: "calendar" },
      { value: 12, color: "green" as const, icon: "check" },
      { value: 3, color: "yellow" as const, icon: "clock" },
      { value: 1, color: "red" as const, icon: "x" },
    ],
  },
  render: (args) => ({
    components: { UiStatusBadgeGroup },
    setup() {
      return { args };
    },
    template: `<UiStatusBadgeGroup v-bind="args" />`,
  }),
};
