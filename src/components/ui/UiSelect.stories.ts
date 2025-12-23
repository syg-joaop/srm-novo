import type { Meta, StoryObj } from "@storybook/vue3";
import UiSelect from "./UiSelect.vue";
import { ref } from "vue";

const meta = {
  title: "UI/UiSelect",
  component: UiSelect,
  tags: ["autodocs"],
  argTypes: {
    modelValue: { control: "text" },
    label: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    searchable: { control: "boolean" },
    error: { control: "text" },
    hint: { control: "text" },
  },
  args: {
    modelValue: null,
    label: "Select Option",
    placeholder: "Choose one...",
    options: [
      { label: "Option 1", value: "opt1" },
      { label: "Option 2", value: "opt2" },
      { label: "Option 3", value: "opt3" },
    ],
    disabled: false,
    searchable: false,
  },
} satisfies Meta<typeof UiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiSelect },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<UiSelect v-bind="args" v-model="value" />',
  }),
};

export const Searchable: Story = {
  args: {
    searchable: true,
    label: "Searchable Select",
    options: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Cherry", value: "cherry" },
      { label: "Date", value: "date" },
      { label: "Elderberry", value: "elderberry" },
    ],
  },
  render: (args) => ({
    components: { UiSelect },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: '<UiSelect v-bind="args" v-model="value" />',
  }),
};

export const States: Story = {
  render: () => ({
    components: { UiSelect },
    setup() {
      const opts = [{ label: "Option A", value: "a" }];
      const val = ref(null);
      return { opts, val };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
        <UiSelect label="Error State" error="Required field" :options="opts" v-model="val" />
        <UiSelect label="Disabled" disabled placeholder="Cannot select" :options="opts" :model-value="null" />
      </div>
    `,
  }),
};
