import type { Meta, StoryObj } from "@storybook/vue3";
import UiCard from "./UiCard.vue";
import UiButton from "./UiButton.vue";

const meta = {
  title: "UI/UiCard",
  component: UiCard,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    hoverable: { control: "boolean" },
    clickable: { control: "boolean" },
    noPadding: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    title: "Card Title",
    hoverable: false,
    clickable: false,
    noPadding: false,
  },
} satisfies Meta<typeof UiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiCard },
    setup() {
      return { args };
    },
    template: `
      <UiCard v-bind="args">
        <p>This is the content of the card.</p>
        <p style="color: var(--color-text-muted);">It can contain any HTML or components.</p>
      </UiCard>
    `,
  }),
};

export const WithActions: Story = {
  render: (args) => ({
    components: { UiCard, UiButton },
    setup() {
      return { args };
    },
    template: `
      <UiCard title="Card with Actions" style="width: 400px;">
        <template #actions>
          <UiButton size="small" variant="ghost">Edit</UiButton>
        </template>
        <p>Content goes here...</p>
      </UiCard>
    `,
  }),
};

export const WithFooter: Story = {
  render: (args) => ({
    components: { UiCard, UiButton },
    setup() {
      return { args };
    },
    template: `
      <UiCard title="Card with Footer" style="width: 400px;">
        <p class="mb-4">Some content...</p>
        <template #footer>
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <UiButton variant="ghost">Cancel</UiButton>
            <UiButton>Save</UiButton>
          </div>
        </template>
      </UiCard>
    `,
  }),
};

export const Hoverable: Story = {
  args: {
    title: "Hover Me",
    hoverable: true,
  },
  render: (args) => ({
    components: { UiCard },
    setup() {
      return { args };
    },
    template: `
      <UiCard v-bind="args" style="width: 300px;">
        <p>This card has a hover effect.</p>
      </UiCard>
    `,
  }),
};
