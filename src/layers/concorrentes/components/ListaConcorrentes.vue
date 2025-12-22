<template>
  <div>
    <div
      class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--color-background)] rounded-t-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
    >
      <div class="col-span-4">Concorrente</div>
      <div class="col-span-2">Cidade</div>
      <div class="col-span-2">Segmento</div>
      <div class="col-span-2">Telefone</div>
      <div class="col-span-2 text-center">Status</div>
    </div>

    <div class="flex flex-col gap-1.5 md:gap-0">
      <div
        v-for="concorrente in concorrentes"
        :key="concorrente.id"
        class="group/item relative bg-[var(--color-surface)] md:rounded-none first:md:rounded-t-none last:md:rounded-b-lg rounded-lg border border-[var(--color-border-subtle)] md:border-[var(--color-border)] md:border-t-0 first:md:border-t hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-soft)] transition-all duration-300 ease-out hover:shadow-sm px-3 py-3 md:px-5 md:py-2.5 cursor-pointer"
        @click="$emit('select', concorrente)"
      >
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[var(--color-primary)] rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
        ></div>

        <div class="hidden md:grid md:grid-cols-12 gap-4 items-center">
          <div class="col-span-4 flex items-center gap-3">
            <div
              class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center group-hover/item:scale-105 transition-transform duration-200"
              :class="getIconClass(concorrente.status)"
            >
              <Users class="w-4 h-4" />
            </div>
            <div class="flex flex-col min-w-0">
              <span
                class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
              >
                {{ concorrente.nome }}
              </span>
              <span
                v-if="concorrente.observacao"
                class="text-xs text-[var(--color-text-muted)] truncate"
              >
                {{ concorrente.observacao }}
              </span>
            </div>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ formatLocation(concorrente) }}
            </span>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ concorrente.segmento || "-" }}
            </span>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ concorrente.telefone || "-" }}
            </span>
          </div>

          <div class="col-span-2 flex justify-center">
            <UiBadge
              v-if="concorrente.status"
              :variant="getStatusVariant(concorrente.status) as Variant"
              :dot="true"
              size="small"
            >
              {{ concorrente.status }}
            </UiBadge>
          </div>
        </div>

        <div class="flex md:hidden flex-col gap-1.5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="getIconClass(concorrente.status)"
              >
                <Users class="w-3.5 h-3.5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
                >
                  {{ concorrente.nome }}
                </span>
                <span class="text-[11px] text-[var(--color-text-muted)] truncate">
                  {{ formatLocation(concorrente) }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <UiBadge
                v-if="concorrente.status"
                :variant="getStatusVariant(concorrente.status) as Variant"
                size="small"
              >
                {{ concorrente.status }}
              </UiBadge>
              <span v-if="concorrente.telefone" class="text-[10px] text-[var(--color-text-muted)]">
                {{ concorrente.telefone }}
              </span>
            </div>
          </div>
          <div
            v-if="concorrente.segmento"
            class="pl-[42px] text-[11px] text-[var(--color-text-muted)]"
          >
            Segmento: {{ concorrente.segmento }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users } from "lucide-vue-next";
import UiBadge, { type Variant } from "~/components/ui/UiBadge.vue";
import {
  COMMON_STATUS_ICON_CLASSES,
  COMMON_STATUS_VARIANTS,
  resolveStatusIconClass,
  resolveStatusVariant,
} from "~/utils/status";
import type { Concorrente } from "../concorrentes.types";

defineProps<{
  concorrentes: Concorrente[];
}>();

defineEmits<{
  (e: "select", concorrente: Concorrente): void;
}>();

const getStatusVariant = (status: string): string =>
  resolveStatusVariant(status, COMMON_STATUS_VARIANTS);

const getIconClass = (status?: string): string =>
  resolveStatusIconClass(status, COMMON_STATUS_ICON_CLASSES);
</script>
