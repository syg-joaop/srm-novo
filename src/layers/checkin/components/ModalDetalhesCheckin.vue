<template>
  <UiModal v-model="isOpen" size="medium" :show-close="true">
    <template #title>
      <div class="flex items-center gap-2.5 md:gap-3">
        <div
          class="h-6 md:h-8 w-1 rounded-full flex-shrink-0"
          :class="getStatusBarColor(checkin?.status)"
        />
        <div class="flex-1 min-w-0">
          <h2 class="text-base md:text-lg font-bold text-[var(--color-text)] truncate">
            {{ checkin?.fornecedor || "Detalhes do Check-in" }}
          </h2>
          <div class="flex items-center gap-1.5 md:gap-2 mt-0.5">
            <span class="text-[10px] md:text-xs text-[var(--color-text-muted)]">
              #{{ checkin?.id }}
            </span>
            <span class="w-1 h-1 rounded-full bg-[var(--color-text-muted)] opacity-50" />
            <span class="text-[10px] md:text-xs text-[var(--color-text-muted)] truncate">
              {{ formatLocation(checkin) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-4 md:gap-5 -mx-4 md:-mx-6">
      <div class="px-4 md:px-6">
        <div class="flex flex-col gap-4 md:gap-5">
          <div v-if="checkin?.status" class="flex flex-col gap-2.5 md:gap-3">
            <h3
              class="text-[10px] md:text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
            >
              Status
            </h3>
            <div>
              <UiBadge :variant="getStatusVariant(checkin.status)" :dot="true" size="medium">
                {{ checkin.status }}
              </UiBadge>
            </div>
          </div>
          <div class="flex flex-col gap-2.5 md:gap-3">
            <h3
              class="text-[10px] md:text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
            >
              Informacoes
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Data Check-in
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ formatarData(checkin?.dataCheckin) || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Cidade
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ checkin?.cidade || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Estado
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ checkin?.estado || "-" }}
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <p class="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Responsavel
                </p>
                <p class="text-sm font-medium text-[var(--color-text)]">
                  {{ checkin?.responsavel || "-" }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="checkin?.observacao" class="flex flex-col gap-2.5 md:gap-3">
            <h3
              class="text-[10px] md:text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
            >
              Observação
            </h3>
            <div
              class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <p class="text-sm text-[var(--color-text)]">{{ checkin.observacao }}</p>
            </div>
          </div>

          <div
            v-if="checkin?.latitude && checkin?.longitude"
            class="flex flex-col gap-2.5 md:gap-3"
          >
            <h3
              class="text-[10px] md:text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
            >
              Coordenadas
            </h3>
            <div
              class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <p class="text-sm text-[var(--color-text-muted)]">
                Lat: {{ checkin.latitude }}, Lng: {{ checkin.longitude }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end w-full">
        <UiButton variant="secondary" @click="isOpen = false"> Fechar </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { Variant } from "~/components/ui/UiBadge.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiButton from "~/components/ui/UiButton.vue";
import UiModal from "~/components/ui/UiModal.vue";
import type { Checkin } from "../checkin.types";

const props = defineProps<{
  modelValue: boolean;
  checkin: Checkin | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const STATUS_VARIANTS: Record<string, string> = {
  ativo: "success",
  concluido: "success",
  pendente: "warning",
  inativo: "danger",
};

const STATUS_BAR_CLASSES: Record<string, string> = {
  ativo: "bg-[var(--color-success)]",
  concluido: "bg-[var(--color-success)]",
  pendente: "bg-[var(--color-warning)]",
  inativo: "bg-[var(--color-danger)]",
};

const getStatusBarColor = (status?: string): string => {
  return resolveStatusVariant(status, STATUS_BAR_CLASSES, "bg-[var(--color-primary)]");
};

const getStatusVariant = (status: string): Variant => {
  return resolveStatusVariant(status, STATUS_VARIANTS) as Variant;
};
</script>
