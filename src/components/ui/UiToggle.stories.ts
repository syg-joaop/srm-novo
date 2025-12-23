import type { Meta, StoryObj } from "@storybook/vue3";
import UiToggle from "./UiToggle.vue";
import { ref } from "vue";

const meta = {
  title: "UI/UiToggle",
  component: UiToggle,
  tags: ["autodocs"],
  argTypes: {
    modelValue: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    modelValue: false,
    disabled: false,
  },
} satisfies Meta<typeof UiToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiToggle },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<UiToggle v-bind="args" v-model="value" />',
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { UiToggle },
    template: `
      <div style="display: flex; gap: 1rem;">
        <UiToggle disabled />
        <UiToggle :model-value="true" disabled />
      </div>
    `,
  }),
};
