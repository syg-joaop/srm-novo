<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <UiCard>
        <div
          class="text-xs uppercase font-medium mb-1 text-[var(--color-text-muted)]"
        >
          Código
        </div>
        <div
          class="text-lg font-mono font-medium text-[var(--color-text)]"
        >
          {{ rota?.codigo || rota?.id || "—" }}
        </div>
      </UiCard>

      <UiCard>
        <div
          class="text-xs uppercase font-medium mb-1 text-[var(--color-text-muted)]"
        >
          Status
        </div>
        <div
          class="text-lg font-medium"
          :style="{ color: getRotaStatusColor(rota?.status) }"
        >
          {{ getRotaStatusLabel(rota?.status) }}
        </div>
      </UiCard>

      <UiCard>
        <div
          class="text-xs uppercase font-medium mb-1 text-[var(--color-text-muted)]"
        >
          Responsável
        </div>
        <div class="flex items-center gap-2 text-[var(--color-text)]">
          <User class="w-4 h-4 text-[var(--color-primary)]" />
          <span class="font-medium truncate">{{ rota?.usuario || "—" }}</span>
        </div>
      </UiCard>

      <UiCard>
        <div
          class="text-xs uppercase font-medium mb-1 text-[var(--color-text-muted)]"
        >
          Criado por
        </div>
        <div class="flex items-center gap-2 text-[var(--color-text)]">
          <User class="w-4 h-4 text-[var(--color-text-muted)]" />
          <span class="font-medium truncate">{{
            rota?.usuario_created || "—"
          }}</span>
        </div>
      </UiCard>

      <UiCard class="sm:col-span-2">
        <div
          class="text-xs uppercase font-medium mb-1 text-[var(--color-text-muted)]"
        >
          Período de Execução
        </div>
        <div class="flex items-center gap-2 text-[var(--color-text)]">
          <Calendar class="w-4 h-4 text-[var(--color-primary)]" />
          <span class="font-medium">{{
            formatarIntervaloDatas(rota?.data_inicio, rota?.data_fim)
          }}</span>
        </div>
      </UiCard>

      <UiCard v-if="rota?.observacao" class="sm:col-span-2">
        <div
          class="text-xs uppercase font-medium mb-1 text-[var(--color-text-muted)]"
        >
          Observações
        </div>
        <p class="text-sm leading-relaxed text-[var(--color-text)]">
          {{ rota.observacao }}
        </p>
      </UiCard>
    </div>

    <!-- Resumo logístico -->
    <UiCard v-if="summary">
      <template #header>
        <div class="flex items-center gap-2 text-[var(--color-primary)]">
          <TrendingUp class="w-4 h-4" />
          <span class="font-semibold">Resumo Logístico</span>
        </div>
      </template>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-xl font-bold text-[var(--color-text)]">
            {{ roteirosCount }}
          </div>
          <div class="text-xs uppercase text-[var(--color-text-muted)]">
            Pontos
          </div>
        </div>
        <div>
          <div class="text-xl font-bold text-[var(--color-text)]">
            {{ formatarDistancia(summary.distance.meters) }}
          </div>
          <div class="text-xs uppercase text-[var(--color-text-muted)]">
            Distância
          </div>
        </div>
        <div>
          <div class="text-xl font-bold text-[var(--color-text)]">
            {{
              formatarDuracao(summary.time.duration + summary.time.traveling)
            }}
          </div>
          <div class="text-xs uppercase text-[var(--color-text-muted)]">
            Tempo Est.
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { User, Calendar, TrendingUp } from "lucide-vue-next";
import UiCard from "~/components/ui/UiCard.vue";
import type { Rota, VrpSummary } from "../../rotas.types";

defineProps<{
  rota: Rota | null;
  summary: VrpSummary | null;
  roteirosCount: number;
}>();
</script>
