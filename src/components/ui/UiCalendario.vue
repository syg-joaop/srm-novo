<template>
  <div class="relative inline-block" ref="wrapperRef">
    <div class="cursor-pointer" @click="toggleCalendario">
      <slot name="trigger">
        <div
          class="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] text-sm transition-all duration-200 hover:border-[var(--color-primary)]"
        >
          <Calendar class="w-4 h-4 text-[var(--color-text-muted)]" />
          <span>{{ displayValue }}</span>
          <ChevronDown
            class="w-4 h-4 text-[var(--color-text-muted)] ml-auto transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </div>
      </slot>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 -translate-y-2"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isOpen"
          class="w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden"
          :style="dropdownStyle"
          ref="dropdownRef"
        >
          <div class="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <button
              type="button"
              class="flex items-center justify-center w-8 h-8 bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-text)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-hover)] hover:border-[var(--color-primary)]"
              @click="previousMonth"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <span class="text-base font-semibold text-[var(--color-text)]">
              {{ currentMonthName }} {{ currentYear }}
            </span>

            <button
              type="button"
              class="flex items-center justify-center w-8 h-8 bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-text)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-hover)] hover:border-[var(--color-primary)]"
              @click="nextMonth"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <div class="grid grid-cols-7 px-4 pt-3 pb-2 border-b border-[var(--color-border-subtle)]">
            <span
              v-for="day in weekDays"
              :key="day"
              class="text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase"
            >
              {{ day }}
            </span>
          </div>

          <div class="grid grid-cols-7 p-4">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="relative flex items-center justify-center"
            >
              <div
                v-if="isInRange(day.date)"
                class="absolute inset-0 bg-[var(--color-primary-soft)]"
              />
              <div
                v-if="isRangeStart(day.date) && internalEndDate"
                class="absolute inset-y-0 right-0 w-1/2 bg-[var(--color-primary-soft)]"
              />
              <div
                v-if="isRangeEnd(day.date) && internalStartDate"
                class="absolute inset-y-0 left-0 w-1/2 bg-[var(--color-primary-soft)]"
              />
              <button
                type="button"
                class="relative z-10 flex items-center justify-center w-9 h-9 bg-transparent border-none rounded-full text-[var(--color-text)] text-sm transition-all duration-150"
                :class="{
                  'text-[var(--color-text-muted)] opacity-40': !day.isCurrentMonth,
                  'ring-2 ring-[var(--color-primary)] font-semibold':
                    day.isToday && !isSelected(day.date) && !isDisabled(day.date),
                  '!bg-[var(--color-primary)] !text-white font-semibold hover:!bg-[var(--color-primary-dark)]':
                    isSelected(day.date),
                  'opacity-30 cursor-not-allowed': isDisabled(day.date),
                  'cursor-pointer hover:bg-[var(--color-hover)]': !isDisabled(day.date),
                }"
                :disabled="isDisabled(day.date)"
                @click="selectDate(day.date)"
              >
                {{ day.dayNumber }}
              </button>
            </div>
          </div>

          <div
            v-if="range"
            class="p-3 border-t border-[var(--color-border)] bg-[var(--color-background)]"
          >
            <div class="flex items-center justify-center gap-3 mb-3">
              <span class="text-sm text-[var(--color-text)] font-medium">
                {{ internalStartDate ? formatDate(internalStartDate) : "Início" }}
              </span>
              <span class="text-[var(--color-text-muted)]">â†’</span>
              <span class="text-sm text-[var(--color-text)] font-medium">
                {{ internalEndDate ? formatDate(internalEndDate) : "Fim" }}
              </span>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 py-2 px-4 bg-transparent border border-[var(--color-border)] rounded-md text-sm font-semibold text-[var(--color-text)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-hover)]"
                @click="clearSelection"
              >
                Limpar
              </button>
              <button
                type="button"
                class="flex-1 py-2 px-4 bg-[var(--color-primary)] border-none rounded-md text-sm font-semibold text-white cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                @click="confirmSelection"
                :disabled="!internalStartDate || !internalEndDate"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-vue-next";

interface Props {
  modelValue?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  range?: boolean;
  placeholder?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  disablePast?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  startDate: null,
  endDate: null,
  range: false,
  placeholder: "Selecione uma data",
  minDate: null,
  maxDate: null,
  disablePast: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: Date | null];
  "update:startDate": [value: Date | null];
  "update:endDate": [value: Date | null];
  change: [value: { start: Date | null; end: Date | null } | Date | null];
}>();

const isOpen = ref(false);
const currentDate = ref(new Date());
const wrapperRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const internalStartDate = ref<Date | null>(props.startDate);
const internalEndDate = ref<Date | null>(props.endDate);
const selectingEnd = ref(false);

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const currentMonthName = computed(() => monthNames[currentDate.value.getMonth()]);
const currentYear = computed(() => currentDate.value.getFullYear());

const displayValue = computed(() => {
  if (props.range) {
    if (internalStartDate.value && internalEndDate.value) {
      return `${formatDate(internalStartDate.value)} - ${formatDate(internalEndDate.value)}`;
    }
    return props.placeholder;
  }
  return props.modelValue ? formatDate(props.modelValue) : props.placeholder;
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days: Array<{
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();

  for (let i = startDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    days.push({
      date: new Date(year, month - 1, day),
      dayNumber: day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
    });
  }

  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(year, month + 1, day),
      dayNumber: day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
});

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}

function isSelected(date: Date): boolean {
  if (props.range) {
    return (
      (internalStartDate.value && isSameDay(date, internalStartDate.value)) ||
      (internalEndDate.value && isSameDay(date, internalEndDate.value))
    );
  }
  return props.modelValue ? isSameDay(date, props.modelValue) : false;
}

function isInRange(date: Date): boolean {
  if (!props.range || !internalStartDate.value || !internalEndDate.value) return false;
  return date > internalStartDate.value && date < internalEndDate.value;
}

function isRangeStart(date: Date): boolean {
  return props.range && internalStartDate.value ? isSameDay(date, internalStartDate.value) : false;
}

function isRangeEnd(date: Date): boolean {
  return props.range && internalEndDate.value ? isSameDay(date, internalEndDate.value) : false;
}

function isDisabled(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  if (props.disablePast && checkDate < today) {
    return true;
  }

  if (props.minDate) {
    const minDate = new Date(props.minDate);
    minDate.setHours(0, 0, 0, 0);
    if (checkDate < minDate) return true;
  }

  if (props.maxDate) {
    const maxDate = new Date(props.maxDate);
    maxDate.setHours(0, 0, 0, 0);
    if (checkDate > maxDate) return true;
  }

  return false;
}

function selectDate(date: Date) {
  if (isDisabled(date)) return;
  if (props.range) {
    if (!selectingEnd.value || !internalStartDate.value) {
      internalStartDate.value = date;
      internalEndDate.value = null;
      selectingEnd.value = true;
    } else {
      if (date < internalStartDate.value) {
        internalEndDate.value = internalStartDate.value;
        internalStartDate.value = date;
      } else {
        internalEndDate.value = date;
      }
      selectingEnd.value = false;
    }
  } else {
    emit("update:modelValue", date);
    emit("change", date);
    isOpen.value = false;
  }
}

function clearSelection() {
  internalStartDate.value = null;
  internalEndDate.value = null;
  selectingEnd.value = false;
  emit("update:startDate", null);
  emit("update:endDate", null);
  emit("change", { start: null, end: null });
}

function confirmSelection() {
  emit("update:startDate", internalStartDate.value);
  emit("update:endDate", internalEndDate.value);
  emit("change", { start: internalStartDate.value, end: internalEndDate.value });
  isOpen.value = false;
}

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1,
  );
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1,
  );
}

function updateDropdownPosition() {
  if (!wrapperRef.value) return;

  const rect = wrapperRef.value.getBoundingClientRect();
  const dropdownHeight = 380;
  const dropdownWidth = 320;

  let top = rect.bottom + 8;
  let left = rect.left;

  if (top + dropdownHeight > window.innerHeight) {
    top = rect.top - dropdownHeight - 8;
  }

  if (left + dropdownWidth > window.innerWidth) {
    left = window.innerWidth - dropdownWidth - 16;
  }

  dropdownStyle.value = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    zIndex: "9999",
  };
}

function toggleCalendario() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (
    wrapperRef.value &&
    !wrapperRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isOpen.value = false;
  }
}

watch(
  () => props.startDate,
  (newVal) => {
    internalStartDate.value = newVal;
  },
);

watch(
  () => props.endDate,
  (newVal) => {
    internalEndDate.value = newVal;
  },
);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", updateDropdownPosition);
  window.addEventListener("scroll", updateDropdownPosition, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", updateDropdownPosition);
  window.removeEventListener("scroll", updateDropdownPosition, true);
});
</script>
