import type { Meta, StoryObj } from "@storybook/vue3";
import UiEmptyState from "./UiEmptyState.vue";
import UiButton from "./UiButton.vue";
import { Inbox, AlertTriangle, Search } from "lucide-vue-next";

const meta = {
  title: "UI/UiEmptyState",
  component: UiEmptyState,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    title: "No Data Available",
    description: "Try adjusting your filters or search criteria.",
  },
} satisfies Meta<typeof UiEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiEmptyState, Inbox },
    setup() {
      return { args, Inbox };
    },
    template: '<UiEmptyState v-bind="args" :icon="Inbox" />',
  }),
};

export const WithAction: Story = {
  args: {
    title: "No Projects Found",
    description: "Get started by creating a new project.",
  },
  render: (args) => ({
    components: { UiEmptyState, UiButton, Search },
    setup() {
      return { args, Search };
    },
    template: `
      <UiEmptyState v-bind="args" :icon="Search">
        <template #action>
          <UiButton>Create Project</UiButton>
        </template>
      </UiEmptyState>
    `,
  }),
};

export const ErrorState: Story = {
  args: {
    title: "Something went wrong",
    description: "We couldn't load the data. Please try again later.",
  },
  render: (args) => ({
    components: { UiEmptyState, UiButton, AlertTriangle },
    setup() {
      return { args, AlertTriangle };
    },
    template: `
      <UiEmptyState v-bind="args" :icon="AlertTriangle">
        <template #action>
          <UiButton variant="ghost">Retry</UiButton>
        </template>
      </UiEmptyState>
    `,
  }),
};
