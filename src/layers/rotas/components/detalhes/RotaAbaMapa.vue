<template>
  <div
    class="h-[350px] sm:h-[400px] rounded-lg overflow-hidden border border-[var(--color-border)]"
  >
    <MapaRota
      ref="mapaRef"
      :roteiros="roteiros"
      :polyline-encoded="polylineEncoded"
      :summary-data="summaryData"
      @ponto-click="$emit('pontoClick', $event)"
      @loaded="$emit('loaded', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import MapaRota from "../MapaRota.vue";
import type { Roteiro, VrpSummary } from "../../rotas.types";

defineProps<{
  roteiros: Roteiro[];
  polylineEncoded: string | null;
  summaryData: VrpSummary | null;
}>();

defineEmits<{
  (e: "pontoClick", roteiro: Roteiro): void;
  (e: "loaded", data: { polyline: string | null; summary: VrpSummary | null }): void;
}>();

const mapaRef = ref<InstanceType<typeof MapaRota> | null>(null);

const invalidateSize = () => {
  mapaRef.value?.invalidateSize();
};

const carregarRota = () => {
  mapaRef.value?.carregarRota();
};

defineExpose({ invalidateSize, carregarRota });
</script>
