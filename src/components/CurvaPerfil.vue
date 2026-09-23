<script setup lang="ts">
import { computed } from 'vue'
import { nivelDose, tmaxEstimado } from '../lib/farmaco'
import { duracao } from '../lib/datas'
import type { PerfilFarmaco } from '../types'

const props = withDefaults(defineProps<{ perfil: PerfilFarmaco; cor?: string; comAlimento?: boolean }>(), { comAlimento: false })

const W = 320
const H = 120
const P = { l: 6, r: 6, t: 14, b: 22 }
const horas = computed(() => Math.min(36, Math.max(12, Math.ceil(props.perfil.efeito.duracaoH[1] + 2))))
const cor = computed(() => props.cor ?? props.perfil.cor)

const pontos = computed(() => {
  const n = 120
  const arr: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * horas.value
    arr.push([t, nivelDose(props.perfil, t, props.comAlimento)])
  }
  return arr
})

const x = (t: number) => P.l + (t / horas.value) * (W - P.l - P.r)
const y = (v: number) => P.t + (1 - v / 1.05) * (H - P.t - P.b)

const linha = computed(() => pontos.value.map(([t, v], i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(''))
const area = computed(() => `${linha.value}L${x(horas.value)},${y(0)}L${x(0)},${y(0)}Z`)
const tmax = computed(() => tmaxEstimado(props.perfil, props.comAlimento))
const atraso = computed(() => (props.comAlimento ? props.perfil.atrasoComAlimentoH : 0))
const e = computed(() => props.perfil.efeito)
const marcas = computed(() => {
  const passo = horas.value > 24 ? 6 : horas.value > 12 ? 4 : 2
  const r: number[] = []
  for (let h = 0; h <= horas.value; h += passo) r.push(h)
  return r
})
const id = Math.random().toString(36).slice(2, 8)
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="perfil" role="img" :aria-label="`Curva de uma dose de ${perfil.nome}`">
    <defs>
      <linearGradient :id="'gp' + id" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" :stop-color="cor" stop-opacity="0.4" />
        <stop offset="100%" :stop-color="cor" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect :x="x(e.inicioH[0] + atraso)" :y="P.t" :width="Math.max(2, x(e.inicioH[1]) - x(e.inicioH[0]))" :height="H - P.t - P.b" :fill="cor" opacity="0.1" rx="4" />
    <text :x="x(e.inicioH[0] + atraso) + 2" :y="P.t - 3" class="rot">início</text>
    <line :x1="x(tmax)" :x2="x(tmax)" :y1="P.t" :y2="H - P.b" :stroke="cor" stroke-dasharray="3 3" opacity="0.6" />
    <text :x="x(tmax) + 3" :y="P.t + 8" class="rot">pico {{ duracao(tmax) }}</text>
    <path :d="area" :fill="`url(#gp${id})`" class="area" />
    <path :d="linha" fill="none" :stroke="cor" stroke-width="2.5" stroke-linecap="round" pathLength="1" class="linha" />
    <line :x1="x(0)" :x2="x(horas)" :y1="y(0)" :y2="y(0)" stroke="var(--border)" />
    <text v-for="h in marcas" :key="h" :x="x(h)" :y="H - 6" class="eixo" :text-anchor="h === 0 ? 'start' : 'middle'">{{ h }}h</text>
  </svg>
</template>

<style scoped>
.perfil {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}
.rot,
.eixo {
  font-size: 9px;
  fill: var(--text-3);
}
.linha {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: desenhar 1.2s var(--ease-out) forwards;
}
.area {
  opacity: 0;
  animation: aparecer 0.8s ease 0.4s forwards;
}
@keyframes desenhar {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes aparecer {
  to {
    opacity: 1;
  }
}
</style>
