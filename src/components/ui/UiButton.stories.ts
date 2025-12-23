import type { Meta, StoryObj } from "@storybook/vue3";
import UiButton from "./UiButton.vue";

const meta = {
  title: "UI/UiButton",
  component: UiButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "success", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    variant: "primary",
    size: "medium",
    loading: false,
    disabled: false,
    fullWidth: false,
  },
} satisfies Meta<typeof UiButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    default: "Primary Button",
  },
  render: (args) => ({
    components: { UiButton },
    setup() {
      return { args };
    },
    template: '<UiButton v-bind="args">{{ args.default }}</UiButton>',
  }),
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    default: "Secondary Button",
  },
  render: (args) => ({
    components: { UiButton },
    setup() {
      return { args };
    },
    template: '<UiButton v-bind="args">{{ args.default }}</UiButton>',
  }),
};

export const Danger: Story = {
  args: {
    variant: "danger",
    default: "Danger Action",
  },
  render: (args) => ({
    components: { UiButton },
    setup() {
      return { args };
    },
    template: '<UiButton v-bind="args">{{ args.default }}</UiButton>',
  }),
};

export const Success: Story = {
  args: {
    variant: "success",
    default: "Success Action",
  },
  render: (args) => ({
    components: { UiButton },
    setup() {
      return { args };
    },
    template: '<UiButton v-bind="args">{{ args.default }}</UiButton>',
  }),
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    default: "Ghost Button",
  },
  render: (args) => ({
    components: { UiButton },
    setup() {
      return { args };
    },
    template: '<UiButton v-bind="args">{{ args.default }}</UiButton>',
  }),
};

export const Link: Story = {
  args: {
    variant: "link",
    default: "Link Button",
  },
  render: (args) => ({
    components: { UiButton },
    setup() {
      return { args };
    },
    template: '<UiButton v-bind="args">{{ args.default }}</UiButton>',
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { UiButton },
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <UiButton size="small">Small</UiButton>
        <UiButton size="medium">Medium</UiButton>
        <UiButton size="large">Large</UiButton>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { UiButton },
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <UiButton>Normal</UiButton>
        <UiButton disabled>Disabled</UiButton>
        <UiButton loading>Loading</UiButton>
      </div>
    `,
  }),
};
