import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiFilterPanel from "./UiFilterPanel.vue";

const meta = {
  title: "UI/UiFilterPanel",
  component: UiFilterPanel,
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "number" },
    inputColumns: { control: "number" },
    showButton: { control: "boolean" },
  },
  args: {
    columns: 3,
    inputColumns: 2,
    showButton: true,
  },
} satisfies Meta<typeof UiFilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    filters: [
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
        ],
      },
    ],
  },
  render: (args) => ({
    components: { UiFilterPanel },
    setup() {
      const filters = ref({ status: "", category: "" });
      return { args, filters };
    },
    template: `
      <UiFilterPanel
        v-bind="args"
        v-model="filters"
      />
    `,
  }),
};

export const WithInputFilters: Story = {
  args: {
    filters: [
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
        key: "minPrice",
        label: "Min Price",
        type: "input" as const,
        inputType: "number",
        placeholder: "0.00",
      },
      {
        key: "maxPrice",
        label: "Max Price",
        type: "input" as const,
        inputType: "number",
        placeholder: "1000.00",
      },
    ],
  },
  render: (args) => ({
    components: { UiFilterPanel },
    setup() {
      const filters = ref({ status: "", minPrice: "", maxPrice: "" });
      return { args, filters };
    },
    template: `
      <UiFilterPanel
        v-bind="args"
        v-model="filters"
      />
    `,
  }),
};

export const WithSegmentedControl: Story = {
  args: {
    filters: [
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
        key: "view",
        label: "View Mode",
        type: "segmented" as const,
        options: [
          { label: "List", value: "list" },
          { label: "Grid", value: "grid" },
          { label: "Table", value: "table" },
        ],
        segmentedFullWidth: true,
      },
    ],
  },
  render: (args) => ({
    components: { UiFilterPanel },
    setup() {
      const filters = ref({ status: "", view: "list" });
      return { args, filters };
    },
    template: `
      <UiFilterPanel
        v-bind="args"
        v-model="filters"
      />
    `,
  }),
};

export const WithButtonGroup: Story = {
  args: {
    filters: [
      {
        key: "period",
        label: "Period",
        type: "button-group" as const,
        options: [
          { label: "Today", value: "today" },
          { label: "Week", value: "week" },
          { label: "Month", value: "month" },
          { label: "Year", value: "year" },
        ],
      },
    ],
  },
  render: (args) => ({
    components: { UiFilterPanel },
    setup() {
      const filters = ref({ period: "week" });
      return { args, filters };
    },
    template: `
      <UiFilterPanel
        v-bind="args"
        v-model="filters"
      />
    `,
  }),
};

export const AlwaysOpen: Story = {
  args: {
    showButton: false,
    open: true,
    filters: [
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
        ],
      },
    ],
  },
  render: (args) => ({
    components: { UiFilterPanel },
    setup() {
      const filters = ref({ status: "", category: "" });
      return { args, filters };
    },
    template: `
      <UiFilterPanel
        v-bind="args"
        v-model="filters"
      />
    `,
  }),
};

export const CompleteExample: Story = {
  args: {
    columns: 4,
    inputColumns: 2,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "" },
          { label: "Active", value: "active" },
          { label: "Pending", value: "pending" },
          { label: "Inactive", value: "inactive" },
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
          { label: "Home", value: "home" },
        ],
      },
      {
        key: "brand",
        label: "Brand",
        type: "select" as const,
        options: [
          { label: "All Brands", value: "" },
          { label: "Apple", value: "apple" },
          { label: "Samsung", value: "samsung" },
          { label: "Sony", value: "sony" },
        ],
      },
      {
        key: "availability",
        label: "Availability",
        type: "select" as const,
        options: [
          { label: "All", value: "" },
          { label: "In Stock", value: "in-stock" },
          { label: "Out of Stock", value: "out-of-stock" },
        ],
      },
      {
        key: "search",
        label: "Product Name",
        type: "input" as const,
        placeholder: "Search by name...",
      },
      {
        key: "sku",
        label: "SKU",
        type: "input" as const,
        placeholder: "Enter SKU...",
      },
    ],
  },
  render: (args) => ({
    components: { UiFilterPanel },
    setup() {
      const filters = ref({
        status: "",
        category: "",
        brand: "",
        availability: "",
        search: "",
        sku: "",
      });
      return { args, filters };
    },
    template: `
      <UiFilterPanel
        v-bind="args"
        v-model="filters"
      />
    `,
  }),
};
