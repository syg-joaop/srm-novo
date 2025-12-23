import type { Meta, StoryObj } from "@storybook/vue3";
import UiBadge from "./UiBadge.vue";

const meta = {
  title: "UI/UiBadge",
  component: UiBadge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "success", "warning", "danger", "info"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    dot: { control: "boolean" },
  },
  args: {
    variant: "default",
    size: "medium",
    dot: false,
    default: "Badge Text",
  },
} satisfies Meta<typeof UiBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiBadge },
    setup() {
      return { args };
    },
    template: '<UiBadge v-bind="args">{{ args.default }}</UiBadge>',
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { UiBadge },
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <UiBadge variant="default">Default</UiBadge>
        <UiBadge variant="primary">Primary</UiBadge>
        <UiBadge variant="success">Success</UiBadge>
        <UiBadge variant="warning">Warning</UiBadge>
        <UiBadge variant="danger">Danger</UiBadge>
        <UiBadge variant="info">Info</UiBadge>
      </div>
    `,
  }),
};

export const WithDot: Story = {
  render: () => ({
    components: { UiBadge },
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <UiBadge variant="default" dot>Default</UiBadge>
        <UiBadge variant="success" dot>Online</UiBadge>
        <UiBadge variant="danger" dot>Offline</UiBadge>
        <UiBadge variant="warning" dot>Away</UiBadge>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { UiBadge },
    template: `
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <UiBadge size="small">Small</UiBadge>
        <UiBadge size="medium">Medium</UiBadge>
        <UiBadge size="large">Large</UiBadge>
      </div>
    `,
  }),
};
