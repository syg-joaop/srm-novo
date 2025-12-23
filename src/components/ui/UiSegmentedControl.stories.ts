import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import { List, Grid, Calendar } from "lucide-vue-next";
import UiSegmentedControl from "./UiSegmentedControl.vue";

const meta = {
  title: "UI/UiSegmentedControl",
  component: UiSegmentedControl,
  tags: ["autodocs"],
  argTypes: {
    modelValue: { control: "text" },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    fullWidth: { control: "boolean" },
    hideLabelsOnMobile: { control: "boolean" },
  },
  args: {
    modelValue: "option1",
    size: "md",
    fullWidth: false,
    hideLabelsOnMobile: false,
  },
} satisfies Meta<typeof UiSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicOptions = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

export const Default: Story = {
  args: {
    options: basicOptions,
  },
  render: (args) => ({
    components: { UiSegmentedControl },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <UiSegmentedControl
        v-bind="args"
        v-model="value"
      />
    `,
  }),
};

export const WithIcons: Story = {
  args: {
    options: [
      { label: "List", value: "list", icon: List },
      { label: "Grid", value: "grid", icon: Grid },
      { label: "Calendar", value: "calendar", icon: Calendar },
    ],
    modelValue: "list",
  },
  render: (args) => ({
    components: { UiSegmentedControl },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <UiSegmentedControl
        v-bind="args"
        v-model="value"
      />
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { UiSegmentedControl },
    setup() {
      const value = ref("option1");
      const options = basicOptions;
      return { value, options };
    },
    template: `
      <div class="space-y-4">
        <div>
          <p class="text-sm mb-2">Extra Small (xs)</p>
          <UiSegmentedControl v-model="value" :options="options" size="xs" />
        </div>
        <div>
          <p class="text-sm mb-2">Small (sm)</p>
          <UiSegmentedControl v-model="value" :options="options" size="sm" />
        </div>
        <div>
          <p class="text-sm mb-2">Medium (md)</p>
          <UiSegmentedControl v-model="value" :options="options" size="md" />
        </div>
        <div>
          <p class="text-sm mb-2">Large (lg)</p>
          <UiSegmentedControl v-model="value" :options="options" size="lg" />
        </div>
      </div>
    `,
  }),
};

export const FullWidth: Story = {
  args: {
    options: basicOptions,
    fullWidth: true,
  },
  render: (args) => ({
    components: { UiSegmentedControl },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="width: 100%; max-width: 500px;">
        <UiSegmentedControl
          v-bind="args"
          v-model="value"
        />
      </div>
    `,
  }),
};

export const TwoOptions: Story = {
  args: {
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    modelValue: "active",
  },
  render: (args) => ({
    components: { UiSegmentedControl },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <UiSegmentedControl
        v-bind="args"
        v-model="value"
      />
    `,
  }),
};

export const IconsHiddenLabelsOnMobile: Story = {
  args: {
    options: [
      { label: "List View", value: "list", icon: List },
      { label: "Grid View", value: "grid", icon: Grid },
      { label: "Calendar View", value: "calendar", icon: Calendar },
    ],
    modelValue: "list",
    hideLabelsOnMobile: true,
  },
  render: (args) => ({
    components: { UiSegmentedControl },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <UiSegmentedControl
        v-bind="args"
        v-model="value"
      />
    `,
  }),
};
