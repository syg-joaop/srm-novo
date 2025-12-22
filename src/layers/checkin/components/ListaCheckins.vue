<template>
  <div>
    <div
      class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--color-background)] rounded-t-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
    >
      <div class="col-span-4">Fornecedor</div>
      <div class="col-span-2">Cidade</div>
      <div class="col-span-2">Data Check-in</div>
      <div class="col-span-2">Responsável</div>
      <div class="col-span-2 text-center">Status</div>
    </div>

    <div class="flex flex-col gap-1.5 md:gap-0">
      <div
        v-for="checkin in checkins"
        :key="checkin.id"
        class="group/item relative bg-[var(--color-surface)] md:rounded-none first:md:rounded-t-none last:md:rounded-b-lg rounded-lg border border-[var(--color-border-subtle)] md:border-[var(--color-border)] md:border-t-0 first:md:border-t hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-soft)] transition-all duration-300 ease-out hover:shadow-sm px-3 py-3 md:px-5 md:py-2.5 cursor-pointer"
        @click="$emit('select', checkin)"
      >
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[var(--color-primary)] rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
        ></div>

        <div class="hidden md:grid md:grid-cols-12 gap-4 items-center">
          <div class="col-span-4 flex items-center gap-3">
            <div
              class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center group-hover/item:scale-105 transition-transform duration-200"
              :class="getIconClass(checkin.status)"
            >
              <MapPin class="w-4 h-4" />
            </div>
            <div class="flex flex-col min-w-0">
              <span
                class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
              >
                {{ checkin.fornecedor }}
              </span>
              <span v-if="checkin.observacao" class="text-xs text-[var(--color-text-muted)] truncate">
                {{ checkin.observacao }}
              </span>
            </div>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ formatLocation(checkin) }}
            </span>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ formatarData(checkin.dataCheckin) || '-' }}
            </span>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ checkin.responsavel || '-' }}
            </span>
          </div>

          <div class="col-span-2 flex justify-center">
            <UiBadge
              v-if="checkin.status"
              :variant="getStatusVariant(checkin.status)"
              :dot="true"
              size="small"
            >
              {{ checkin.status }}
            </UiBadge>
          </div>
        </div>

        <div class="flex md:hidden flex-col gap-1.5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="getIconClass(checkin.status)"
              >
                <MapPin class="w-3.5 h-3.5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
                >
                  {{ checkin.fornecedor }}
                </span>
                <span class="text-[11px] text-[var(--color-text-muted)] truncate">
                  {{ formatLocation(checkin) }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <UiBadge
                v-if="checkin.status"
                :variant="getStatusVariant(checkin.status)"
                size="small"
              >
                {{ checkin.status }}
              </UiBadge>
              <span class="text-[10px] text-[var(--color-text-muted)]">
                {{ formatarData(checkin.dataCheckin) }}
              </span>
            </div>
          </div>
          <div v-if="checkin.responsavel" class="pl-[42px] text-[11px] text-[var(--color-text-muted)]">
            Responsavel: {{ checkin.responsavel }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapPin } from "lucide-vue-next";
import UiBadge from "~/components/ui/UiBadge.vue";
import type { Checkin } from "../checkin.types";

defineProps<{
  checkins: Checkin[];
}>();

defineEmits<{
  (e: "select", checkin: Checkin): void;
}>();

const STATUS_VARIANTS: Record<string, string> = {
  ativo: "success",
  concluido: "success",
  pendente: "warning",
  inativo: "danger",
};

const STATUS_ICON_CLASSES: Record<string, string> = {
  ativo: "bg-green-500/10 text-green-500",
  concluido: "bg-green-500/10 text-green-500",
  pendente: "bg-yellow-500/10 text-yellow-500",
  inativo: "bg-red-500/10 text-red-500",
};

const getStatusVariant = (status: string): string => resolveStatusVariant(status, STATUS_VARIANTS);

const getIconClass = (status?: string): string =>
  resolveStatusIconClass(status, STATUS_ICON_CLASSES);
</script>
