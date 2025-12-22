<template>
  <div
    class="group/item relative bg-[var(--color-surface)] md:rounded-none first:md:rounded-t-none last:md:rounded-b-lg rounded-lg border border-[var(--color-border-subtle)] md:border-[var(--color-border)] md:border-t-0 first:md:border-t hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-soft)] transition-all duration-300 ease-out hover:shadow-sm px-3 py-2.5 md:px-6 md:py-3 cursor-pointer"
    @click="$emit('click', rota)"
  >
    <div
      class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[var(--color-primary)] rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
    ></div>

    <div class="flex md:grid md:grid-cols-12 gap-2.5 md:gap-4 items-center">
      <!-- Descrição -->
      <div class="col-span-5 flex items-center gap-2.5 md:gap-3 flex-1 min-w-0">
        <div
          class="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary)] group-hover/item:scale-105 transition-transform duration-200"
        >
          <RouteIcon class="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
        <div class="flex flex-col min-w-0">
          <span
            class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
          >
            Rota #{{ rota.codigo || rota.id }}
          </span>
          <span class="text-[11px] text-[var(--color-text-muted)] truncate">
            {{ formatarIntervaloDatas(rota.data_inicio, rota.data_fim) }}
          </span>
          <span class="sm:inline hidden text-[11px] text-[var(--color-text-muted)] truncate">
            {{ rota.usuario }}
          </span>
        </div>
      </div>

      <!-- Progresso -->
      <div class="hidden md:flex col-span-2 justify-center">
        <div v-if="rota.progresso" class="flex items-center gap-2">
          <div class="w-16 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              class="h-full bg-[var(--color-primary)] rounded-full"
              :style="{ width: `${rota.progresso.percentual_conclusao}%` }"
            />
          </div>
          <span class="text-xs text-[var(--color-text-muted)]">
            {{ rota.progresso.percentual_conclusao }}%
          </span>
        </div>
        <span v-else class="text-xs text-[var(--color-text-muted)]">—</span>
      </div>

      <!-- Status -->
      <div class="hidden md:flex col-span-2 justify-center">
        <UiBadge :variant="getRotaStatusVariant(rota.status)" :dot="true" size="small">
          {{ getRotaStatusLabel(rota.status) }}
        </UiBadge>
      </div>

      <!-- Ações -->
      <div class="col-span-3 flex items-center justify-end gap-1.5 md:gap-2">
        <UiButton
          variant="primary"
          size="small"
          class="hidden md:flex"
          @click.stop="$emit('adicaoRapida', rota)"
        >
          <Plus class="w-3 h-3" />
          Adição rápida
        </UiButton>

        <UiButton
          variant="ghost"
          size="small"
          class="!px-1.5 !py-1.5 md:!px-2"
          @click.stop="$emit('click', rota)"
        >
          <Eye class="w-4 h-4" />
          <span class="hidden md:inline">Detalhes</span>
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, Plus, Route as RouteIcon } from "lucide-vue-next";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiButton from "~/components/ui/UiButton.vue";
import type { Rota } from "../rotas.types";

defineProps<{
  rota: Rota;
}>();

defineEmits<{
  (e: "click", rota: Rota): void;
  (e: "adicaoRapida", rota: Rota): void;
}>();
</script>
