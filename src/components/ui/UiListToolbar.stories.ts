import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiListToolbar from "./UiListToolbar.vue";
import UiButton from "./UiButton.vue";

const meta = {
  title: "UI/UiListToolbar",
  component: UiListToolbar,
  tags: ["autodocs"],
  argTypes: {
    search: { control: "text" },
    searchPlaceholder: { control: "text" },
  },
  args: {
    search: "",
    searchPlaceholder: "Pesquisar...",
    filters: {},
    filterItems: [],
  },
} satisfies Meta<typeof UiListToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiListToolbar },
    setup() {
      const search = ref("");
      const filters = ref({});
      return { args, search, filters };
    },
    template: `
      <UiListToolbar
        v-bind="args"
        v-model:search="search"
        v-model:filters="filters"
      />
    `,
  }),
};

export const WithFilters: Story = {
  args: {
    filterItems: [
      {
        key: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All", value: "" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
      {
        key: "category",
        label: "Category",
        type: "select" as const,
        options: [
          { label: "All", value: "" },
          { label: "Electronics", value: "electronics" },
          { label: "Clothing", value: "clothing" },
          { label: "Food", value: "food" },
        ],
      },
    ],
  },
  render: (args) => ({
    components: { UiListToolbar },
    setup() {
      const search = ref("");
      const filters = ref({ status: "", category: "" });
      return { args, search, filters };
    },
    template: `
      <UiListToolbar
        v-bind="args"
        v-model:search="search"
        v-model:filters="filters"
      />
    `,
  }),
};

export const WithActions: Story = {
  render: (args) => ({
    components: { UiListToolbar, UiButton },
    setup() {
      const search = ref("");
      const filters = ref({});
      return { args, search, filters };
    },
    template: `
      <UiListToolbar
        v-bind="args"
        v-model:search="search"
        v-model:filters="filters"
      >
        <template #actions>
          <UiButton variant="primary">Add New</UiButton>
        </template>
      </UiListToolbar>
    `,
  }),
};

export const WithLeadingSlot: Story = {
  render: (args) => ({
    components: { UiListToolbar, UiButton },
    setup() {
      const search = ref("");
      const filters = ref({});
      return { args, search, filters };
    },
    template: `
      <UiListToolbar
        v-bind="args"
        v-model:search="search"
        v-model:filters="filters"
      >
        <template #leading>
          <UiButton variant="secondary" size="small">Back</UiButton>
        </template>
        <template #actions>
          <UiButton variant="primary">Create</UiButton>
        </template>
      </UiListToolbar>
    `,
  }),
};

export const CustomPlaceholder: Story = {
  args: {
    searchPlaceholder: "Search by name or email...",
  },
  render: (args) => ({
    components: { UiListToolbar },
    setup() {
      const search = ref("");
      const filters = ref({});
      return { args, search, filters };
    },
    template: `
      <UiListToolbar
        v-bind="args"
        v-model:search="search"
        v-model:filters="filters"
      />
    `,
  }),
};

export const CompleteExample: Story = {
  args: {
    searchPlaceholder: "Search products...",
    filterItems: [
      {
        key: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "" },
          { label: "Available", value: "available" },
          { label: "Out of Stock", value: "out-of-stock" },
          { label: "Discontinued", value: "discontinued" },
        ],
      },
      {
        key: "category",
        label: "Category",
        type: "select" as const,
        options: [
          { label: "All Categories", value: "" },
          { label: "Electronics", value: "electronics" },
          { label: "Clothing", value: "clothing" },
          { label: "Home & Garden", value: "home" },
        ],
      },
      {
        key: "price",
        label: "Price Range",
        type: "select" as const,
        options: [
          { label: "All Prices", value: "" },
          { label: "Under $50", value: "under-50" },
          { label: "$50 - $100", value: "50-100" },
          { label: "Over $100", value: "over-100" },
        ],
      },
    ],
  },
  render: (args) => ({
    components: { UiListToolbar, UiButton },
    setup() {
      const search = ref("");
      const filters = ref({ status: "", category: "", price: "" });
      return { args, search, filters };
    },
    template: `
      <UiListToolbar
        v-bind="args"
        v-model:search="search"
        v-model:filters="filters"
      >
        <template #actions>
          <UiButton variant="secondary">Export</UiButton>
          <UiButton variant="primary">Add Product</UiButton>
        </template>
      </UiListToolbar>
    `,
  }),
};
