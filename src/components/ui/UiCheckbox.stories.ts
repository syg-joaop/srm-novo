import type { Meta, StoryObj } from "@storybook/vue3";
import UiCheckbox from "./UiCheckbox.vue";
import { ref } from "vue";

const meta = {
  title: "UI/UiCheckbox",
  component: UiCheckbox,
  tags: ["autodocs"],
  argTypes: {
    modelValue: { control: "boolean" },
    label: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    variant: {
      control: "select",
      options: ["default", "terms"],
    },
    size: {
      control: "select",
      options: ["small", "medium"],
    },
  },
  args: {
    modelValue: false,
    label: "Accept terms and conditions",
    disabled: false,
    required: false,
    variant: "default",
    size: "medium",
  },
} satisfies Meta<typeof UiCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiCheckbox },
    setup() {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: '<UiCheckbox v-bind="args" v-model="checked" />',
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { UiCheckbox },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <UiCheckbox label="Disabled Unchecked" disabled />
        <UiCheckbox label="Disabled Checked" :model-value="true" disabled />
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { UiCheckbox },
    setup() {
      const val1 = ref(true);
      const val2 = ref(true);
      return { val1, val2 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <UiCheckbox v-model="val1" label="Default Variant" />
        <UiCheckbox v-model="val2" label="Terms Variant" variant="terms" />
      </div>
    `,
  }),
};
