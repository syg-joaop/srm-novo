<template>
  <div>
    <div
      class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--color-background)] rounded-t-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
    >
      <div class="col-span-4">Prospecto</div>
      <div class="col-span-2">Cidade</div>
      <div class="col-span-2">Última Interação</div>
      <div class="col-span-2 text-center">Status</div>
      <div class="col-span-2 text-end">Ações</div>
    </div>

    <div class="flex flex-col gap-1.5 md:gap-0">
      <div
        v-for="prospecto in prospectos"
        :key="prospecto.codpros"
        class="group/item relative bg-[var(--color-surface)] md:rounded-none first:md:rounded-t-none last:md:rounded-b-lg rounded-lg border border-[var(--color-border-subtle)] md:border-[var(--color-border)] md:border-t-0 first:md:border-t hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-soft)] transition-all duration-300 ease-out hover:shadow-sm px-3 py-3 md:px-5 md:py-2.5 cursor-pointer"
        @click="$emit('select', prospecto)"
      >
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[var(--color-primary)] rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
        ></div>

        <div class="hidden md:grid md:grid-cols-12 gap-4 items-center">
          <div class="col-span-4 flex items-center gap-3">
            <div
              class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center group-hover/item:scale-105 transition-transform duration-200"
              :class="getIconClass(prospecto.status)"
            >
              <Building2 class="w-4 h-4" />
            </div>
            <div class="flex flex-col min-w-0">
              <span
                class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
              >
                {{ prospecto.prospecto }}
              </span>
              <span class="text-xs text-[var(--color-text-muted)] truncate">
                {{ prospecto.fanta }}
              </span>
            </div>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ prospecto.cidade }}
            </span>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ prospecto.ultima_interacao }}
            </span>
          </div>

          <div class="col-span-2 flex justify-center">
            <UiBadge
              v-if="prospecto.status"
              :variant="getStatusVariant(prospecto.status) as Variant"
              :dot="true"
              size="small"
            >
              {{ prospecto.status }}
            </UiBadge>
          </div>

          <div class="col-span-2 flex items-center justify-end gap-2">
            <UiButton variant="primary" size="small" @click.stop="$emit('add-route', prospecto)">
              <MapPin class="w-3 h-3" />
              Rota
            </UiButton>

            <UiButton variant="ghost" size="small" class="!px-2" @click.stop>
              <MessageSquareText class="w-4 h-4" />
            </UiButton>
          </div>
        </div>

        <div class="flex md:hidden flex-col gap-1.5">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="getIconClass(prospecto.status)"
              >
                <Building2 class="w-3.5 h-3.5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
                >
                  {{ prospecto.prospecto }}
                </span>
                <span class="text-[11px] text-[var(--color-text-muted)] truncate">
                  {{ prospecto.fanta }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <UiBadge
                v-if="prospecto.status"
                :variant="getStatusVariant(prospecto.status) as Variant"
                size="small"
              >
                {{ prospecto.status }}
              </UiBadge>
              <span class="text-[10px] text-[var(--color-text-muted)]">
                {{ prospecto.ultima_interacao }}
              </span>
            </div>
          </div>
          <div
            class="flex items-center justify-between pl-[42px] text-[11px] text-[var(--color-text-muted)]"
          >
            <span class="truncate">{{ prospecto.cidade }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2, MapPin, MessageSquareText } from "lucide-vue-next";
import type { Variant } from "~/components/ui/UiBadge.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiButton from "~/components/ui/UiButton.vue";
import {
  COMMON_STATUS_ICON_CLASSES,
  COMMON_STATUS_VARIANTS,
  resolveStatusIconClass,
  resolveStatusVariant,
} from "~/utils/status";
import type { Prospecto } from "../prospecto.types";

defineProps<{
  prospectos: Prospecto[];
}>();

defineEmits<{
  (e: "select", prospecto: Prospecto): void;
  (e: "add-route", prospecto: Prospecto): void;
}>();

const STATUS_VARIANTS: Record<string, string> = {
  ...COMMON_STATUS_VARIANTS,
  novo: "info",
};

const STATUS_ICON_CLASSES: Record<string, string> = {
  ...COMMON_STATUS_ICON_CLASSES,
  novo: "bg-blue-500/10 text-blue-500",
};

const getStatusVariant = (status: string): Variant =>
  resolveStatusVariant(status, STATUS_VARIANTS) as Variant;

const getIconClass = (status: string): string =>
  resolveStatusIconClass(status, STATUS_ICON_CLASSES);
</script>
