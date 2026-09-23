<script setup lang="ts">
import { computed } from 'vue'
import type { StatusMed } from '../store'

const props = withDefaults(defineProps<{ status: StatusMed; tamanho?: number }>(), { tamanho: 118 })

const R = 44
const C = 2 * Math.PI * R

const total = computed(() => props.status.janelas?.duracao[1] ?? props.status.perfil.efeito.duracaoH[1])

function arco(de: number, ate: number) {
  const a = Math.max(0, Math.min(1, de / total.value))
  const b = Math.max(0, Math.min(1, ate / total.value))
  return { dasharray: `${(b - a) * C} ${C}`, dashoffset: `${-a * C}` }
}

const janela = computed(() => (props.status.janelas ? arco(...props.status.janelas.inicio) : null))
const pico = computed(() => (props.status.janelas ? arco(...props.status.janelas.pico) : null))
const progresso = computed(() => (props.status.fase === 'sem-dose' ? 0 : props.status.progresso))
const pulsando = computed(() => props.status.fase === 'janela' || props.status.fase === 'pico')
</script>

<template>
  <div class="anel" :class="{ pulsando }" :style="{ width: tamanho + 'px', height: tamanho + 'px', '--cor': status.med.cor }">
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" :r="R" class="trilho" />
      <circle v-if="janela" cx="50" cy="50" :r="R" class="zona" :stroke-dasharray="janela.dasharray" :stroke-dashoffset="janela.dashoffset" />
      <circle v-if="pico" cx="50" cy="50" :r="R" class="zona pico" :stroke-dasharray="pico.dasharray" :stroke-dashoffset="pico.dashoffset" />
      <circle cx="50" cy="50" :r="R" class="progresso" :stroke-dasharray="`${progresso * C} ${C}`" />
      <circle
        v-if="status.fase !== 'sem-dose'"
        :cx="50 + R * Math.cos(progresso * 2 * Math.PI - Math.PI / 2)"
        :cy="50 + R * Math.sin(progresso * 2 * Math.PI - Math.PI / 2)"
        r="5"
        class="cabeca"
      />
    </svg>
    <div class="centro">
      <span class="emoji">{{ status.perfil.emoji }}</span>
      <strong class="tabular">{{ status.fase === 'sem-dose' ? '—' : Math.round(status.nivel * 100) + '%' }}</strong>
    </div>
  </div>
</template>

<style scoped>
.anel {
  position: relative;
  flex: none;
}
svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  overflow: visible;
}
circle {
  fill: none;
  stroke-width: 8;
}
.trilho {
  stroke: var(--surface-2);
}
.zona {
  stroke: var(--cor);
  opacity: 0.18;
  stroke-width: 12;
}
.zona.pico {
  opacity: 0.32;
}
.progresso {
  stroke: var(--cor);
  stroke-linecap: round;
  transition: stroke-dasharray 1.2s var(--ease-out);
  animation: girar-in 1.2s var(--ease-out);
}
.cabeca {
  fill: var(--surface-solid);
  stroke: var(--cor);
  stroke-width: 3;
  transition: cx 1.2s var(--ease-out), cy 1.2s var(--ease-out);
}
.centro {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  line-height: 1.1;
}
.emoji {
  font-size: 1.6rem;
  display: inline-block;
}
.pulsando .emoji {
  animation: balanco 1.6s ease-in-out infinite;
}
.pulsando::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  border: 2px solid var(--cor);
  animation: pulso 2.2s ease-out infinite;
  pointer-events: none;
}
@keyframes girar-in {
  from {
    stroke-dasharray: 0 999;
  }
}
</style>
