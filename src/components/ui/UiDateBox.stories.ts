import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiDateBox from "./UiDateBox.vue";

const meta = {
  title: "UI/UiDateBox",
  component: UiDateBox,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "danger", "warning"],
    },
  },
  args: {
    label: "DIA",
    variant: "default",
  },
} satisfies Meta<typeof UiDateBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiDateBox },
    setup() {
      return { args };
    },
    template: `<UiDateBox v-bind="args">15</UiDateBox>`,
  }),
};

export const WithLabel: Story = {
  args: {
    label: "DEZ",
  },
  render: (args) => ({
    components: { UiDateBox },
    setup() {
      return { args };
    },
    template: `<UiDateBox v-bind="args">25</UiDateBox>`,
  }),
};

export const Danger: Story = {
  args: {
    label: "ATRASO",
    variant: "danger",
  },
  render: (args) => ({
    components: { UiDateBox },
    setup() {
      return { args };
    },
    template: `<UiDateBox v-bind="args">3</UiDateBox>`,
  }),
};

export const Warning: Story = {
  args: {
    label: "HOJE",
    variant: "warning",
  },
  render: (args) => ({
    components: { UiDateBox },
    setup() {
      return { args };
    },
    template: `<UiDateBox v-bind="args">23</UiDateBox>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { UiDateBox },
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <UiDateBox label="DEZ" variant="default">15</UiDateBox>
        <UiDateBox label="ATRASO" variant="danger">3</UiDateBox>
        <UiDateBox label="HOJE" variant="warning">23</UiDateBox>
      </div>
    `,
  }),
};

export const NoLabel: Story = {
  args: {
    label: undefined,
    variant: "default",
  },
  render: (args) => ({
    components: { UiDateBox },
    setup() {
      return { args };
    },
    template: `<UiDateBox v-bind="args">42</UiDateBox>`,
  }),
};
