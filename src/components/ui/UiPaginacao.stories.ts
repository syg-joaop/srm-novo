import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiPaginacao from "./UiPaginacao.vue";

const meta = {
  title: "UI/UiPaginacao",
  component: UiPaginacao,
  tags: ["autodocs"],
  argTypes: {
    page: { control: "number" },
    totalPages: { control: "number" },
    maxVisible: { control: "number" },
  },
  args: {
    page: 1,
    totalPages: 10,
    maxVisible: 5,
  },
} satisfies Meta<typeof UiPaginacao>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiPaginacao },
    setup() {
      const page = ref(args.page);
      return { args, page };
    },
    template: `
      <UiPaginacao
        v-bind="args"
        v-model:page="page"
      />
    `,
  }),
};

export const FewPages: Story = {
  args: {
    page: 1,
    totalPages: 3,
    maxVisible: 5,
  },
  render: (args) => ({
    components: { UiPaginacao },
    setup() {
      const page = ref(args.page);
      return { args, page };
    },
    template: `
      <UiPaginacao
        v-bind="args"
        v-model:page="page"
      />
    `,
  }),
};

export const ManyPages: Story = {
  args: {
    page: 15,
    totalPages: 50,
    maxVisible: 5,
  },
  render: (args) => ({
    components: { UiPaginacao },
    setup() {
      const page = ref(args.page);
      return { args, page };
    },
    template: `
      <UiPaginacao
        v-bind="args"
        v-model:page="page"
      />
    `,
  }),
};

export const MiddlePage: Story = {
  args: {
    page: 5,
    totalPages: 10,
    maxVisible: 5,
  },
  render: (args) => ({
    components: { UiPaginacao },
    setup() {
      const page = ref(args.page);
      return { args, page };
    },
    template: `
      <UiPaginacao
        v-bind="args"
        v-model:page="page"
      />
    `,
  }),
};

export const LastPage: Story = {
  args: {
    page: 10,
    totalPages: 10,
    maxVisible: 5,
  },
  render: (args) => ({
    components: { UiPaginacao },
    setup() {
      const page = ref(args.page);
      return { args, page };
    },
    template: `
      <UiPaginacao
        v-bind="args"
        v-model:page="page"
      />
    `,
  }),
};

export const LimitedVisible: Story = {
  args: {
    page: 5,
    totalPages: 20,
    maxVisible: 3,
  },
  render: (args) => ({
    components: { UiPaginacao },
    setup() {
      const page = ref(args.page);
      return { args, page };
    },
    template: `
      <UiPaginacao
        v-bind="args"
        v-model:page="page"
      />
    `,
  }),
};
