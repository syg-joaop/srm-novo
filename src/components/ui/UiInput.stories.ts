import type { Meta, StoryObj } from "@storybook/vue3";
import UiInput from "./UiInput.vue";
import { User, Mail, Search } from "lucide-vue-next";
import { ref } from "vue";

const meta = {
  title: "UI/UiInput",
  component: UiInput,
  tags: ["autodocs"],
  argTypes: {
    modelValue: { control: "text" },
    type: { control: "text" },
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    hint: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    required: { control: "boolean" },
  },
  args: {
    modelValue: "",
    type: "text",
    label: "Username",
    placeholder: "Enter your username",
    disabled: false,
    readonly: false,
    required: false,
  },
} satisfies Meta<typeof UiInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<UiInput v-bind="args" v-model="value" />',
  }),
};

export const WithIcons: Story = {
  render: (args) => ({
    components: { UiInput, User, Mail, Search },
    setup() {
      const val1 = ref("");
      const val2 = ref("");
      const val3 = ref("");
      return { val1, val2, val3 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
        <UiInput v-model="val1" label="With Prefix" placeholder="Search...">
          <template #prefix><Search size="16" /></template>
        </UiInput>
        
        <UiInput v-model="val2" label="With Suffix" placeholder="Your email">
          <template #suffix><Mail size="16" /></template>
        </UiInput>

        <UiInput v-model="val3" label="Both Icons" placeholder="Username">
          <template #prefix><User size="16" /></template>
          <template #suffix><div style="font-size: 10px; font-weight: bold;">TXT</div></template>
        </UiInput>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { UiInput },
    setup() {
      return { };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
        <UiInput label="Error State" error="This field is required" placeholder="Error..." />
        <UiInput label="Hint Text" hint="This is a helpful hint" placeholder="With hint..." />
        <UiInput label="Disabled" disabled placeholder="Cannot type here" />
        <UiInput label="Readonly" readonly model-value="Read only content" />
      </div>
    `,
  }),
};
