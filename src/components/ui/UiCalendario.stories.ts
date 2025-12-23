import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import UiCalendario from "./UiCalendario.vue";

const meta = {
  title: "UI/UiCalendario",
  component: UiCalendario,
  tags: ["autodocs"],
  argTypes: {
    modelValue: { control: "date" },
    range: { control: "boolean" },
    placeholder: { control: "text" },
    disablePast: { control: "boolean" },
  },
  args: {
    placeholder: "Selecione uma data",
    range: false,
    disablePast: false,
  },
} satisfies Meta<typeof UiCalendario>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { UiCalendario },
    setup() {
      const selectedDate = ref<Date | null>(null);
      return { args, selectedDate };
    },
    template: `
      <div style="min-height: 450px;">
        <UiCalendario
          v-bind="args"
          v-model="selectedDate"
        />
        <p style="margin-top: 1rem; font-size: 0.875rem;">
          Selected: {{ selectedDate?.toLocaleDateString() || 'None' }}
        </p>
      </div>
    `,
  }),
};

export const WithPreselectedDate: Story = {
  render: (args) => ({
    components: { UiCalendario },
    setup() {
      const selectedDate = ref<Date | null>(new Date());
      return { args, selectedDate };
    },
    template: `
      <div style="min-height: 450px;">
        <UiCalendario
          v-bind="args"
          v-model="selectedDate"
        />
        <p style="margin-top: 1rem; font-size: 0.875rem;">
          Selected: {{ selectedDate?.toLocaleDateString() || 'None' }}
        </p>
      </div>
    `,
  }),
};

export const DisablePastDates: Story = {
  args: {
    disablePast: true,
    placeholder: "Select a future date",
  },
  render: (args) => ({
    components: { UiCalendario },
    setup() {
      const selectedDate = ref<Date | null>(null);
      return { args, selectedDate };
    },
    template: `
      <div style="min-height: 450px;">
        <UiCalendario
          v-bind="args"
          v-model="selectedDate"
        />
        <p style="margin-top: 1rem; font-size: 0.875rem;">
          Selected: {{ selectedDate?.toLocaleDateString() || 'None' }}
        </p>
      </div>
    `,
  }),
};

export const DateRange: Story = {
  args: {
    range: true,
    placeholder: "Selecione um período",
  },
  render: (args) => ({
    components: { UiCalendario },
    setup() {
      const startDate = ref<Date | null>(null);
      const endDate = ref<Date | null>(null);
      return { args, startDate, endDate };
    },
    template: `
      <div style="min-height: 500px;">
        <UiCalendario
          v-bind="args"
          v-model:start-date="startDate"
          v-model:end-date="endDate"
        />
        <p style="margin-top: 1rem; font-size: 0.875rem;">
          Start: {{ startDate?.toLocaleDateString() || 'None' }}<br/>
          End: {{ endDate?.toLocaleDateString() || 'None' }}
        </p>
      </div>
    `,
  }),
};

export const WithMinMaxDates: Story = {
  render: () => ({
    components: { UiCalendario },
    setup() {
      const selectedDate = ref<Date | null>(null);
      const today = new Date();
      const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { selectedDate, minDate, maxDate };
    },
    template: `
      <div style="min-height: 450px;">
        <p style="margin-bottom: 1rem; font-size: 0.875rem;">
          Only dates in the current month can be selected.
        </p>
        <UiCalendario
          v-model="selectedDate"
          :min-date="minDate"
          :max-date="maxDate"
          placeholder="Select date in current month"
        />
        <p style="margin-top: 1rem; font-size: 0.875rem;">
          Selected: {{ selectedDate?.toLocaleDateString() || 'None' }}
        </p>
      </div>
    `,
  }),
};
