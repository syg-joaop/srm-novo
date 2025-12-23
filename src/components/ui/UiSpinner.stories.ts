import type { Meta, StoryObj } from "@storybook/vue3";
import UiSpinner from "./UiSpinner.vue";

const meta = {
  title: "UI/UiSpinner",
  component: UiSpinner,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    variant: {
      control: "select",
      options: ["primary", "white", "dark"],
    },
    text: { control: "text" },
  },
  args: {
    size: "medium",
    variant: "primary",
    text: "Loading...",
  },
} satisfies Meta<typeof UiSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiSpinner },
    setup() {
      return { args };
    },
    template: '<UiSpinner v-bind="args" />',
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { UiSpinner },
    template: `
      <div style="display: flex; align-items: flex-end; gap: 2rem;">
        <UiSpinner size="small" text="Small" />
        <UiSpinner size="medium" text="Medium" />
        <UiSpinner size="large" text="Large" />
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { UiSpinner },
    template: `
      <div style="display: flex; gap: 2rem; padding: 1rem; background-color: #f0f0f0;">
        <UiSpinner variant="primary" text="Primary" />
        <UiSpinner variant="dark" text="Dark" />
        <div style="background-color: #333; padding: 1rem; border-radius: 8px;">
          <UiSpinner variant="white" text="White" />
        </div>
      </div>
    `,
  }),
};
