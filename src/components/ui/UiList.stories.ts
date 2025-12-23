import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiList from "./UiList.vue";
import UiButton from "./UiButton.vue";

const meta = {
  title: "UI/UiList",
  component: UiList,
  tags: ["autodocs"],
  argTypes: {
    items: { control: "object" },
    itemKey: { control: "text" },
    hoverable: { control: "boolean" },
    clickable: { control: "boolean" },
  },
  args: {
    hoverable: true,
    clickable: false,
    itemKey: "id",
  },
} satisfies Meta<typeof UiList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  { id: 1, name: "Item 1", description: "Description for item 1" },
  { id: 2, name: "Item 2", description: "Description for item 2" },
  { id: 3, name: "Item 3", description: "Description for item 3" },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
  render: (args) => ({
    components: { UiList },
    setup() {
      return { args };
    },
    template: `
      <UiList v-bind="args">
        <template #item="{ item }">
          <div>
            <strong>{{ item.name }}</strong>
            <p style="margin: 0; font-size: 0.875rem; opacity: 0.7;">{{ item.description }}</p>
          </div>
        </template>
      </UiList>
    `,
  }),
};

export const Clickable: Story = {
  args: {
    items: sampleItems,
    clickable: true,
  },
  render: (args) => ({
    components: { UiList },
    setup() {
      const handleClick = (item: unknown) => {
        alert(`Clicked: ${(item as { name: string }).name}`);
      };
      return { args, handleClick };
    },
    template: `
      <UiList v-bind="args" @item-click="handleClick">
        <template #item="{ item }">
          <div>
            <strong>{{ item.name }}</strong>
            <p style="margin: 0; font-size: 0.875rem; opacity: 0.7;">{{ item.description }}</p>
          </div>
        </template>
      </UiList>
    `,
  }),
};

export const WithActions: Story = {
  args: {
    items: sampleItems,
  },
  render: (args) => ({
    components: { UiList, UiButton },
    setup() {
      return { args };
    },
    template: `
      <UiList v-bind="args">
        <template #item="{ item }">
          <div>
            <strong>{{ item.name }}</strong>
            <p style="margin: 0; font-size: 0.875rem; opacity: 0.7;">{{ item.description }}</p>
          </div>
        </template>
        <template #actions="{ item }">
          <UiButton size="small" variant="ghost">Edit</UiButton>
          <UiButton size="small" variant="danger">Delete</UiButton>
        </template>
      </UiList>
    `,
  }),
};

export const Empty: Story = {
  args: {
    items: [],
  },
  render: (args) => ({
    components: { UiList },
    setup() {
      return { args };
    },
    template: `
      <UiList v-bind="args">
        <template #item="{ item }">
          {{ item }}
        </template>
      </UiList>
    `,
  }),
};

export const SimpleStrings: Story = {
  args: {
    items: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
  },
  render: (args) => ({
    components: { UiList },
    setup() {
      return { args };
    },
    template: `<UiList v-bind="args" />`,
  }),
};
