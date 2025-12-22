<template>
  <div>
    <div
      class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--color-background)] rounded-t-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
    >
      <div class="col-span-4">Fornecedor</div>
      <div class="col-span-2">Cidade</div>
      <div class="col-span-2">Última carga</div>
      <div class="col-span-2 text-center">Status</div>
      <div class="col-span-2 text-end">Ações</div>
    </div>

    <div class="flex flex-col gap-1.5 md:gap-0">
      <div
        v-for="fornecedor in fornecedores"
        :key="fornecedor.codfor"
        class="group/item relative bg-[var(--color-surface)] md:rounded-none first:md:rounded-t-none last:md:rounded-b-lg rounded-lg border border-[var(--color-border-subtle)] md:border-[var(--color-border)] md:border-t-0 first:md:border-t hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-soft)] transition-all duration-300 ease-out hover:shadow-sm px-3 py-3 md:px-5 md:py-2.5 cursor-pointer"
        @click="$emit('select', fornecedor)"
      >
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[var(--color-primary)] rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
        ></div>

        <div class="hidden md:grid md:grid-cols-12 gap-4 items-center">
          <div class="col-span-4 flex items-center gap-3">
            <div
              class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center group-hover/item:scale-105 transition-transform duration-200"
              :class="getIconClass(fornecedor.status)"
            >
              <Building2 class="w-4 h-4" />
            </div>
            <div class="flex flex-col min-w-0">
              <span
                class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
              >
                {{ fornecedor.fornecedor }}
              </span>
              <span class="text-xs text-[var(--color-text-muted)] truncate">
                {{ fornecedor.fanta }}
              </span>
            </div>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ fornecedor.cidade }}
            </span>
          </div>

          <div class="col-span-2 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ fornecedor.ultima_carga }}
            </span>
          </div>

          <div class="col-span-2 flex justify-center">
            <UiBadge
              v-if="fornecedor.status"
              :variant="getStatusVariant(fornecedor.status)"
              :dot="true"
              size="small"
            >
              {{ fornecedor.status }}
            </UiBadge>
          </div>

          <div class="col-span-2 flex items-center justify-end gap-2">
            <UiButton variant="primary" size="small" @click.stop="$emit('add-route', fornecedor)">
              <MapPin class="w-3 h-3" />
              Adicionar à rota
            </UiButton>

            <UiButton variant="ghost" size="small" class="!px-2" @click.stop>
              <MessageSquareText class="w-4 h-4" />
            </UiButton>
          </div>
        </div>

        <div class="flex md:hidden flex-col gap-1.5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="getIconClass(fornecedor.status)"
              >
                <Building2 class="w-3.5 h-3.5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
                >
                  {{ fornecedor.fornecedor }}
                </span>
                <span class="text-[11px] text-[var(--color-text-muted)] truncate">
                  {{ fornecedor.fanta }}
                </span>
              </div>
            </div>
            <span
              class="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap flex-shrink-0"
            >
              {{ fornecedor.cidade }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2, MapPin, MessageSquareText } from "lucide-vue-next";
import UiBadge, { type Variant } from "~/components/ui/UiBadge.vue";
import UiButton from "~/components/ui/UiButton.vue";
import {
  COMMON_STATUS_ICON_CLASSES,
  COMMON_STATUS_VARIANTS,
  resolveStatusIconClass,
  resolveStatusVariant,
} from "~/utils/status";
import type { Fornecedor } from "../fornecedores.types";

defineProps<{
  fornecedores: Fornecedor[];
}>();

defineEmits<{
  (e: "select", fornecedor: Fornecedor): void;
  (e: "add-route", fornecedor: Fornecedor): void;
}>();

const getStatusVariant = (status: string): Variant =>
  resolveStatusVariant(status, COMMON_STATUS_VARIANTS) as Variant;

const getIconClass = (status: string): string =>
  resolveStatusIconClass(status, COMMON_STATUS_ICON_CLASSES);
</script>
