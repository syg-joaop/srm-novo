<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ valor: number; casas?: number; duracaoMs?: number }>(), { casas: 0, duracaoMs: 900 })
const exibido = ref(0)

function animar(de: number, ate: number) {
  const inicio = performance.now()
  const passo = (t: number) => {
    const p = Math.min(1, (t - inicio) / props.duracaoMs)
    const e = 1 - Math.pow(1 - p, 3)
    exibido.value = de + (ate - de) * e
    if (p < 1) requestAnimationFrame(passo)
  }
  requestAnimationFrame(passo)
}

onMounted(() => animar(0, props.valor))
watch(
  () => props.valor,
  (novo, antigo) => animar(antigo ?? 0, novo),
)
</script>

<template>
  <span class="tabular">{{ exibido.toFixed(casas).replace('.', ',') }}</span>
</template>
