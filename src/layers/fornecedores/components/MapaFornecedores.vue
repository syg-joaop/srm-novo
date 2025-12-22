<template>
  <div
    class="h-[600px] w-full rounded-xl overflow-hidden border"
    style="border-color: var(--color-border)"
  >
    <UiMapaPontos :pontos="pontos" :status-config="statusConfig" />
  </div>
</template>

<script setup lang="ts">
import UiMapaPontos from "~/components/ui/UiMapaPontos.vue";
import type { UiMapaPonto, UiMapaStatusConfig } from "~/components/ui/maps.types";
import type { FornecedorMapItem } from "../fornecedores.types";

const statusConfig: UiMapaStatusConfig = { ...COMMON_MAP_STATUS_CONFIG };

const props = defineProps<{
  fornecedores?: FornecedorMapItem[];
}>();

const pontos = computed<UiMapaPonto[]>(() => {
  const fornecedores = props.fornecedores ?? [];

  return fornecedores
    .filter((f) => f.latlong)
    .map((f) => ({
      id: f.fornecedor,
      titulo: f.fornecedor,
      subtitulo: f.fanta,
      status: f.status,
      latitude: f.latitude,
      longitude: f.longitude,
      linhas: [
        { rotulo: "Cidade", valor: f.cidade },
        { rotulo: "Última carga", valor: f.ultima_carga },
      ],
    }));
});
</script>
