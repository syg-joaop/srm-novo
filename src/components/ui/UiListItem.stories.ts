import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import { User, ChevronRight } from "lucide-vue-next";
import UiListItem from "./UiListItem.vue";
import UiButton from "./UiButton.vue";

const meta = {
  title: "UI/UiListItem",
  component: UiListItem,
  tags: ["autodocs"],
} satisfies Meta<typeof UiListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { UiListItem },
    template: `
      <UiListItem>
        <span class="font-medium">Simple list item</span>
      </UiListItem>
    `,
  }),
};

export const WithLeadingIcon: Story = {
  render: () => ({
    components: { UiListItem, User },
    template: `
      <UiListItem>
        <template #leading>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User class="w-5 h-5 text-primary" />
          </div>
        </template>
        <span class="font-medium">John Doe</span>
        <span class="text-sm text-gray-500">john@example.com</span>
      </UiListItem>
    `,
  }),
};

export const WithAction: Story = {
  render: () => ({
    components: { UiListItem, User, ChevronRight },
    template: `
      <UiListItem>
        <template #leading>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User class="w-5 h-5 text-primary" />
          </div>
        </template>
        <span class="font-medium">Jane Smith</span>
        <span class="text-sm text-gray-500">Click to view profile</span>
        <template #action>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </template>
      </UiListItem>
    `,
  }),
};

export const WithButton: Story = {
  render: () => ({
    components: { UiListItem, UiButton },
    template: `
      <UiListItem>
        <div>
          <span class="font-medium">Pending Request</span>
          <span class="text-sm text-gray-500 block">Awaiting your approval</span>
        </div>
        <template #action>
          <UiButton size="small" variant="primary">Approve</UiButton>
        </template>
      </UiListItem>
    `,
  }),
};

export const ListExample: Story = {
  render: () => ({
    components: { UiListItem, User },
    template: `
      <div class="space-y-1">
        <UiListItem v-for="i in 5" :key="i">
          <template #leading>
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User class="w-5 h-5 text-primary" />
            </div>
          </template>
          <span class="font-medium">User {{ i }}</span>
          <span class="text-sm text-gray-500">user{{ i }}@example.com</span>
        </UiListItem>
      </div>
    `,
  }),
};
