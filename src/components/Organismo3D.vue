<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { Cena, MedCena } from '../lib/cena3d'
import { ouvintesDose } from '../store'
import { temaEscuro } from '../lib/tema'
import type { Dose } from '../types'

const props = defineProps<{ meds: MedCena[] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const cena = shallowRef<Cena | null>(null)
const pronto = ref(false)
const semWebGL = ref(false)

let observador: MutationObserver | null = null
let consulta: MediaQueryList | null = null
const aoMudarSistema = () => cena.value?.definirTema(!temaEscuro())

function aoDose(d: Dose) {
  cena.value?.explodir(d.medId)
}

onMounted(async () => {
  // three.js é carregado sob demanda para não pesar o primeiro carregamento
  const { criarCena, temWebGL } = await import('../lib/cena3d')
  if (!canvas.value) return
  if (!temWebGL()) {
    semWebGL.value = true
    return
  }
  const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  cena.value = criarCena(canvas.value, { reduzido })
  cena.value.atualizar(props.meds)
  cena.value.definirTema(!temaEscuro())
  observador = new MutationObserver(() => cena.value?.definirTema(!temaEscuro()))
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  consulta = window.matchMedia('(prefers-color-scheme: light)')
  consulta.addEventListener('change', aoMudarSistema)
  ouvintesDose.add(aoDose)
  requestAnimationFrame(() => (pronto.value = true))
})

watch(
  () => props.meds,
  (m) => cena.value?.atualizar(m),
  { deep: true },
)

onBeforeUnmount(() => {
  ouvintesDose.delete(aoDose)
  observador?.disconnect()
  consulta?.removeEventListener('change', aoMudarSistema)
  cena.value?.destruir()
})

defineExpose({ explodir: (id: string) => cena.value?.explodir(id) })
</script>

<template>
  <div class="organismo" :class="{ pronto, semWebGL }">
    <canvas ref="canvas" aria-label="Visualização 3D do nível das medicações no organismo" role="img" />
    <div v-if="semWebGL" class="reserva" aria-hidden="true" />
    <slot />
  </div>
</template>

<style scoped>
.organismo {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
}
canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  transform: scale(0.94);
  filter: blur(10px);
  transition: opacity 1.6s var(--ease-out), transform 2s var(--ease-out), filter 1.6s var(--ease-out);
  cursor: grab;
  touch-action: pan-y;
}
canvas:active {
  cursor: grabbing;
}
.pronto canvas {
  opacity: 1;
  transform: none;
  filter: none;
}
.reserva {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--primary) 45%, transparent), transparent 65%);
  filter: blur(20px);
  animation: respirar 5s ease-in-out infinite;
}
</style>
