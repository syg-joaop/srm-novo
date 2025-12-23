import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiModal from "./UiModal.vue";
import UiButton from "./UiButton.vue";

const meta = {
  title: "UI/UiModal",
  component: UiModal,
  tags: ["autodocs"],
  argTypes: {
    modelValue: { control: "boolean" },
    title: { control: "text" },
    size: {
      control: "select",
      options: ["small", "medium", "large", "full"],
    },
    showClose: { control: "boolean" },
    closeOnOverlay: { control: "boolean" },
  },
  args: {
    modelValue: true,
    title: "Modal Title",
    size: "medium",
    showClose: true,
    closeOnOverlay: true,
  },
} satisfies Meta<typeof UiModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiModal, UiButton },
    setup() {
      const isOpen = ref(args.modelValue);
      return { args, isOpen };
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Open Modal</UiButton>
        <UiModal v-bind="args" v-model="isOpen">
          <p>This is the modal content. You can put any content here.</p>
        </UiModal>
      </div>
    `,
  }),
};

export const Small: Story = {
  args: {
    size: "small",
    title: "Small Modal",
  },
  render: (args) => ({
    components: { UiModal, UiButton },
    setup() {
      const isOpen = ref(args.modelValue);
      return { args, isOpen };
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Open Small Modal</UiButton>
        <UiModal v-bind="args" v-model="isOpen">
          <p>This is a small modal with less content.</p>
        </UiModal>
      </div>
    `,
  }),
};

export const Large: Story = {
  args: {
    size: "large",
    title: "Large Modal",
  },
  render: (args) => ({
    components: { UiModal, UiButton },
    setup() {
      const isOpen = ref(args.modelValue);
      return { args, isOpen };
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Open Large Modal</UiButton>
        <UiModal v-bind="args" v-model="isOpen">
          <p>This is a large modal that can contain more content.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </UiModal>
      </div>
    `,
  }),
};

export const WithFooter: Story = {
  args: {
    title: "Confirm Action",
  },
  render: (args) => ({
    components: { UiModal, UiButton },
    setup() {
      const isOpen = ref(args.modelValue);
      return { args, isOpen };
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Open Modal with Footer</UiButton>
        <UiModal v-bind="args" v-model="isOpen">
          <p>Are you sure you want to proceed with this action?</p>
          <template #footer>
            <UiButton variant="secondary" @click="isOpen = false">Cancel</UiButton>
            <UiButton variant="primary" @click="isOpen = false">Confirm</UiButton>
          </template>
        </UiModal>
      </div>
    `,
  }),
};

export const NoCloseButton: Story = {
  args: {
    title: "Important Notice",
    showClose: false,
    closeOnOverlay: false,
  },
  render: (args) => ({
    components: { UiModal, UiButton },
    setup() {
      const isOpen = ref(args.modelValue);
      return { args, isOpen };
    },
    template: `
      <div>
        <UiButton @click="isOpen = true">Open Modal</UiButton>
        <UiModal v-bind="args" v-model="isOpen">
          <p>This modal can only be closed using the button below.</p>
          <template #footer>
            <UiButton variant="primary" @click="isOpen = false">I Understand</UiButton>
          </template>
        </UiModal>
      </div>
    `,
  }),
};
