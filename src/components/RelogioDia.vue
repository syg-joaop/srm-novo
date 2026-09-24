<script setup lang="ts">
import { computed, ref } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'
import { nivelHabitual } from '../lib/farmaco'
import { faseNoInstante, mistura, PASSO_MIN, valorEm, type EventoDia, type SerieDia } from '../dia'
import { estado } from '../store'
import { deMinutos, HORA, minutosDe } from '../lib/datas'

const props = defineProps<{
  series: SerieDia[]
  eventos: EventoDia[]
  inicioDia: number
  /** Hora atual (fracionária) se o dia exibido for hoje. */
  horaAgora: number | null
}>()

const hora = defineModel<number>('hora', { required: true })
const emit = defineEmits<{ arrastando: [boolean] }>()

/* ---------- geometria ---------- */

const S = 440
const C = S / 2
const R_ROTULO = 214
const R_TICK = 204
const R_CEU = 192
const R_MAX = 176
const R_MIN = 100

const aneis = computed(() => {
  const n = Math.max(1, props.series.length)
  const gap = n > 2 ? 4 : 7
  const esp = Math.min(32, (R_MAX - R_MIN - gap * (n - 1)) / n)
  return props.series.map((s, i) => {
    const rOut = R_MAX - i * (esp + gap)
    return { s, rOut, rIn: rOut - esp, esp, mid: rOut - esp / 2 }
  })
})

const raioCentro = computed(() => (aneis.value.length ? aneis.value[aneis.value.length - 1].rIn - 10 : R_MIN - 10))

function ang(h: number) {
  return ((h - 12) / 24) * Math.PI * 2 - Math.PI / 2
}
function polar(r: number, h: number): [number, number] {
  const a = ang(h)
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
const f = (n: number) => n.toFixed(1)

function arco(r: number, h0: number, h1: number) {
  const [x0, y0] = polar(r, h0)
  const [x1, y1] = polar(r, h1)
  const grande = h1 - h0 > 12 ? 1 : 0
  return `M${f(x0)},${f(y0)}A${r},${r} 0 ${grande} 1 ${f(x1)},${f(y1)}`
}

/** Área radial da série entre h0 e h1: raio externo varia com o nível. */
function area(a: (typeof aneis.value)[number], h0: number, h1: number) {
  if (h1 - h0 < 0.02) return ''
  const pts = a.s.pontos
  const max = a.s.max
  const passo = PASSO_MIN / 60
  const fora: string[] = []
  const dentro: string[] = []
  const amostra = (h: number) => {
    const v = Math.min(1, valorEm(pts, h) / max)
    const r = a.rIn + 2 + (a.esp - 2) * v
    const [x, y] = polar(r, h)
    const [xi, yi] = polar(a.rIn, h)
    fora.push(`${f(x)},${f(y)}`)
    dentro.push(`${f(xi)},${f(yi)}`)
  }
  amostra(h0)
  for (let h = Math.ceil(h0 / passo) * passo; h < h1; h += passo) amostra(h)
  amostra(h1)
  return `M${fora.join('L')}L${dentro.reverse().join('L')}Z`
}

function contorno(a: (typeof aneis.value)[number], h0: number, h1: number) {
  if (h1 - h0 < 0.02) return ''
  const pts = a.s.pontos
  const passo = PASSO_MIN / 60
  const out: string[] = []
  const amostra = (h: number) => {
    const v = Math.min(1, valorEm(pts, h) / a.s.max)
    const [x, y] = polar(a.rIn + 2 + (a.esp - 2) * v, h)
    out.push(`${f(x)},${f(y)}`)
  }
  amostra(h0)
  for (let h = Math.ceil(h0 / passo) * passo; h < h1; h += passo) amostra(h)
  amostra(h1)
  return 'M' + out.join('L')
}

/* ---------- anel do céu ---------- */

const PARADAS_CEU: [number, string][] = [
  [0, '#27235e'],
  [4.5, '#3730a3'],
  [6, '#c2410c'],
  [7, '#fb923c'],
  [9, '#fcd34d'],
  [13, '#fef3c7'],
  [16.5, '#fcd34d'],
  [18.5, '#f472b6'],
  [20, '#7c3aed'],
  [22, '#312e81'],
  [24, '#27235e'],
]
function corCeu(h: number) {
  let i = 0
  while (i < PARADAS_CEU.length - 2 && PARADAS_CEU[i + 1][0] <= h) i++
  const [h0, a] = PARADAS_CEU[i]
  const [h1, b] = PARADAS_CEU[i + 1]
  return mistura(a, b, (h - h0) / (h1 - h0))
}
const segmentosCeu = Array.from({ length: 96 }, (_, i) => ({ d: arco(R_CEU, i / 4, (i + 1) / 4 + 0.02), cor: corCeu(i / 4 + 0.125) }))

const sono = computed(() => {
  const dormir = minutosDe(estado.preferencias.dormir) / 60
  const acordar = minutosDe(estado.preferencias.acordar) / 60
  return dormir > acordar ? [arco(R_MAX + 3, dormir, 24), arco(R_MAX + 3, 0, acordar)] : [arco(R_MAX + 3, dormir, acordar)]
})

const ticks = Array.from({ length: 96 }, (_, i) => {
  const h = i / 4
  const maior = i % 4 === 0
  const destaque = i % 24 === 0
  const [x0, y0] = polar(R_TICK - (destaque ? 7 : maior ? 5 : 2), h)
  const [x1, y1] = polar(R_TICK + (destaque ? 3 : 0), h)
  return { x0, y0, x1, y1, maior, destaque }
})

const rotulos = [3, 6, 9, 15, 18, 21].map((h) => {
  const [x, y] = polar(R_ROTULO, h)
  return { h, x, y, forte: h % 6 === 0 }
})
const posSol = polar(R_ROTULO, 12)
const posLua = polar(R_ROTULO, 0)

/* ---------- marcadores ---------- */

const marcadores = computed(() =>
  props.eventos
    .filter((e) => e.medId && ['dose', 'registro', 'inicio', 'pico', 'planejado'].includes(e.tipo))
    .map((e) => {
      const anel = aneis.value.find((a) => a.s.med.id === e.medId)
      if (!anel) return null
      const r = e.tipo === 'dose' || e.tipo === 'planejado' ? anel.mid : e.tipo === 'registro' ? anel.rOut + 1 : anel.rOut + 2
      const [x, y] = polar(r, e.h)
      const [xi, yi] = polar(anel.rIn - 1, e.h)
      const [xo, yo] = polar(anel.rOut + 1, e.h)
      return { e, x, y, xi, yi, xo, yo, passou: e.h <= hora.value + 0.001 }
    })
    .filter((m): m is NonNullable<typeof m> => !!m),
)

/* ---------- cursor ---------- */

const cursor = computed(() => {
  const [x0, y0] = polar(raioCentro.value + 6, hora.value)
  const [x1, y1] = polar(R_CEU + 8, hora.value)
  const [kx, ky] = polar(R_CEU, hora.value)
  return { x0, y0, x1, y1, kx, ky }
})
const agoraPos = computed(() => (props.horaAgora == null ? null : polar(R_CEU, props.horaAgora)))

/* ---------- partículas ---------- */

const particulas = computed(() =>
  aneis.value.map((a, i) => {
    const v = Math.min(1, valorEm(a.s.pontos, hora.value) / a.s.max)
    const n = 7
    return {
      id: a.s.med.id,
      cor: a.s.med.cor,
      dur: 26 + i * 9,
      reverso: i % 2 === 1,
      pontos: Array.from({ length: n }, (_, k) => {
        const [x, y] = polar(a.mid + Math.sin(k * 2.1) * (a.esp * 0.28), (k / n) * 24 + i * 1.7)
        return { x, y, r: 1.2 + ((k * 7) % 3) * 0.5, visivel: v > (k + 0.5) / n }
      }),
    }
  }),
)

/* ---------- leitura central ---------- */

const leitura = computed(() => {
  const instante = props.inicioDia + hora.value * HORA
  return props.series.map((s) => {
    const v = valorEm(s.pontos, hora.value)
    return { med: s.med, pct: Math.round((v / nivelHabitual(s.perfil)) * 100), rel: Math.min(1, v / s.max), fase: faseNoInstante(s.med, instante) }
  })
})

const rotuloTempo = computed(() => {
  if (props.horaAgora == null) return new Date(props.inicioDia).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }).replace('.', '')
  const d = hora.value - props.horaAgora
  if (Math.abs(d) < 0.09) return 'agora'
  return d > 0 ? 'previsão' : 'mais cedo'
})

/* ---------- interação ---------- */

const svg = ref<SVGSVGElement | null>(null)
const arrastando = ref(false)
let ultimaHoraInteira = -1

function horaDoPonteiro(ev: PointerEvent): number | null {
  const el = svg.value
  if (!el) return null
  const pt = el.createSVGPoint()
  pt.x = ev.clientX
  pt.y = ev.clientY
  const m = el.getScreenCTM()
  if (!m) return null
  const p = pt.matrixTransform(m.inverse())
  const dx = p.x - C
  const dy = p.y - C
  if (!arrastando.value && Math.hypot(dx, dy) < raioCentro.value - 4) return null
  const a = Math.atan2(dy, dx)
  let h = (((a + Math.PI / 2) / (Math.PI * 2)) * 24 + 12 + 24) % 24
  // evita "pular" de 23:59 para 00:00 durante o arraste
  if (arrastando.value && Math.abs(h - hora.value) > 12) h = hora.value > 12 ? 24 : 0
  return Math.round(h * 12) / 12
}

function aplicar(h: number) {
  hora.value = h
  const inteira = Math.floor(h)
  if (inteira !== ultimaHoraInteira) {
    ultimaHoraInteira = inteira
    navigator.vibrate?.(3)
  }
}

function baixo(ev: PointerEvent) {
  const h = horaDoPonteiro(ev)
  if (h == null) return
  arrastando.value = true
  emit('arrastando', true)
  ;(ev.currentTarget as Element).setPointerCapture(ev.pointerId)
  aplicar(h)
}
function mover(ev: PointerEvent) {
  if (!arrastando.value) return
  const h = horaDoPonteiro(ev)
  if (h != null) aplicar(h)
}
function cima() {
  if (!arrastando.value) return
  arrastando.value = false
  emit('arrastando', false)
}

function tecla(ev: KeyboardEvent) {
  const passo = ev.shiftKey ? 1 : 0.25
  if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') hora.value = Math.min(24, hora.value + passo)
  else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') hora.value = Math.max(0, hora.value - passo)
  else return
  ev.preventDefault()
}
</script>

<template>
  <div class="relogio" :class="{ arrastando }">
    <svg
      ref="svg"
      :viewBox="`-14 -14 ${S + 28} ${S + 28}`"
      role="slider"
      tabindex="0"
      aria-label="Hora do dia"
      :aria-valuenow="Math.round(hora * 60)"
      aria-valuemin="0"
      aria-valuemax="1440"
      :aria-valuetext="deMinutos(hora * 60)"
      @pointerdown="baixo"
      @pointermove="mover"
      @pointerup="cima"
      @pointercancel="cima"
      @keydown="tecla"
    >
      <defs>
        <radialGradient v-for="a in aneis" :id="`rg-${a.s.med.id}`" :key="a.s.med.id" gradientUnits="userSpaceOnUse" :cx="C" :cy="C" :r="a.rOut">
          <stop :offset="a.rIn / a.rOut" :stop-color="a.s.med.cor" stop-opacity="0.15" />
          <stop offset="1" :stop-color="a.s.med.cor" stop-opacity="0.95" />
        </radialGradient>
        <radialGradient id="rg-centro" gradientUnits="userSpaceOnUse" :cx="C" :cy="C" :r="raioCentro">
          <stop offset="0" stop-color="var(--surface-solid)" stop-opacity="1" />
          <stop offset="1" stop-color="var(--surface-solid)" stop-opacity="0.6" />
        </radialGradient>
      </defs>

      <!-- anel do céu -->
      <g class="ceu">
        <path v-for="(s, i) in segmentosCeu" :key="i" :d="s.d" :stroke="s.cor" />
      </g>

      <!-- sono -->
      <path v-for="(d, i) in sono" :key="'z' + i" :d="d" class="sono" />

      <!-- ticks e rótulos -->
      <g class="ticks">
        <line v-for="(t, i) in ticks" :key="i" :x1="t.x0" :y1="t.y0" :x2="t.x1" :y2="t.y1" :class="{ maior: t.maior, destaque: t.destaque }" />
      </g>
      <g class="rotulos">
        <text v-for="r in rotulos" :key="r.h" :x="r.x" :y="r.y" :class="{ forte: r.forte }" dominant-baseline="central" text-anchor="middle">
          {{ String(r.h).padStart(2, '0') }}
        </text>
      </g>
      <foreignObject :x="posSol[0] - 9" :y="posSol[1] - 9" width="18" height="18"><Sun :size="18" class="icone-sol" /></foreignObject>
      <foreignObject :x="posLua[0] - 8" :y="posLua[1] - 8" width="16" height="16"><Moon :size="16" class="icone-lua" /></foreignObject>

      <!-- anéis das medicações -->
      <g v-for="a in aneis" :key="a.s.med.id" :style="{ '--c': a.s.med.cor }">
        <circle :cx="C" :cy="C" :r="a.mid" class="trilho" :stroke-width="a.esp" />
        <path :d="area(a, 0, 24)" class="fantasma" :fill="a.s.med.cor" />
        <g class="revelado">
          <path :d="area(a, 0, hora)" :fill="`url(#rg-${a.s.med.id})`" />
          <path :d="contorno(a, 0, hora)" class="contorno" :stroke="a.s.med.cor" />
        </g>
      </g>

      <!-- partículas -->
      <g v-for="p in particulas" :key="'p' + p.id" class="orbita" :class="{ reverso: p.reverso }" :style="{ animationDuration: p.dur + 's' }">
        <circle v-for="(pt, k) in p.pontos" :key="k" :cx="pt.x" :cy="pt.y" :r="pt.r" :fill="p.cor" class="particula" :class="{ on: pt.visivel }" />
      </g>

      <!-- marcadores -->
      <g v-for="m in marcadores" :key="m.e.id" class="marcador" :class="[m.e.tipo, { passou: m.passou }]" :style="{ '--c': m.e.cor }">
        <template v-if="m.e.tipo === 'dose' || m.e.tipo === 'planejado'">
          <circle :cx="m.x" :cy="m.y" r="11" class="halo" />
          <circle :cx="m.x" :cy="m.y" r="7.5" class="pilula" />
          <circle :cx="m.x" :cy="m.y" r="2.6" class="nucleo" />
        </template>
        <path
          v-else-if="m.e.tipo === 'registro'"
          :transform="`translate(${m.x} ${m.y})`"
          d="M0,-8 C1,-2 2,-1 8,0 C2,1 1,2 0,8 C-1,2 -2,1 -8,0 C-2,-1 -1,-2 0,-8Z"
          class="estrela"
        />
        <line v-else :x1="m.xi" :y1="m.yi" :x2="m.xo" :y2="m.yo" class="marca-fase" />
      </g>

      <!-- centro -->
      <circle :cx="C" :cy="C" :r="raioCentro" fill="url(#rg-centro)" class="disco" />

      <!-- agora -->
      <g v-if="agoraPos" class="agora">
        <circle :cx="agoraPos[0]" :cy="agoraPos[1]" r="4" class="pulso" />
        <circle :cx="agoraPos[0]" :cy="agoraPos[1]" r="3.5" />
      </g>

      <!-- cursor -->
      <g class="cursor">
        <line :x1="cursor.x0" :y1="cursor.y0" :x2="cursor.x1" :y2="cursor.y1" />
        <circle :cx="cursor.kx" :cy="cursor.ky" r="16" class="alvo" />
        <circle :cx="cursor.kx" :cy="cursor.ky" r="9" class="botao" />
      </g>
    </svg>

    <div class="centro" :style="{ '--rc': (raioCentro / (S + 28)) * 100 + '%' }">
      <span class="eyebrow">{{ rotuloTempo }}</span>
      <span class="tempo display tabular">{{ deMinutos(hora * 60) }}</span>
      <div class="valores">
        <div v-for="l in leitura" :key="l.med.id" class="valor" :style="{ '--c': l.med.cor }">
          <span class="barra"><span :style="{ transform: `scaleX(${l.rel})` }" /></span>
          <span class="nome">{{ l.med.nome }}</span>
          <span class="pct tabular">{{ l.pct }}%</span>
          <span class="fase-med">{{ l.fase.fase ? l.fase.rotulo : 'sem dose ativa' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.relogio {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  aspect-ratio: 1;
  user-select: none;
  -webkit-user-select: none;
}
svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
  touch-action: none;
  cursor: grab;
  outline: none;
}
.arrastando svg {
  cursor: grabbing;
}
svg:focus-visible .botao {
  stroke: var(--primary);
  stroke-width: 4;
}
.ceu path {
  fill: none;
  stroke-width: 6;
  opacity: 0.9;
}
.sono {
  fill: none;
  stroke: #a5b4fc;
  stroke-width: 1.5;
  stroke-dasharray: 1 4;
  stroke-linecap: round;
  opacity: 0.6;
}
.ticks line {
  stroke: var(--text-3);
  stroke-width: 1;
  opacity: 0.35;
}
.ticks .maior {
  opacity: 0.7;
  stroke-width: 1.4;
}
.ticks .destaque {
  stroke: var(--text);
  opacity: 0.9;
  stroke-width: 2;
}
.rotulos text {
  font-family: var(--font-mono);
  font-size: 10px;
  fill: var(--text-3);
}
.rotulos .forte {
  fill: var(--text-2);
  font-size: 11px;
}
.icone-sol {
  color: #fbbf24;
}
.icone-lua {
  color: #a5b4fc;
}
.trilho {
  fill: none;
  stroke: var(--c);
  opacity: 0.06;
}
.fantasma {
  opacity: 0.13;
}
.revelado {
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--c) calc(var(--glow) * 60%), transparent));
}
.contorno {
  fill: none;
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.orbita {
  transform-origin: 220px 220px;
  animation: girar linear infinite;
}
.orbita.reverso {
  animation-direction: reverse;
}
.particula {
  opacity: 0;
  transition: opacity 0.5s ease;
}
.particula.on {
  opacity: 0.9;
}
@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
.marcador {
  transition: opacity 0.4s;
  opacity: 0.35;
}
.marcador.passou {
  opacity: 1;
}
.marcador.planejado {
  opacity: 0.6;
}
.marcador .halo {
  fill: var(--c);
  opacity: 0.18;
}
.marcador .pilula {
  fill: var(--surface-solid);
  stroke: var(--c);
  stroke-width: 2.2;
}
.marcador.planejado .pilula {
  stroke-dasharray: 3 3;
}
.marcador .nucleo {
  fill: var(--c);
}
.marcador.passou.dose .halo {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulso-lento 2.8s ease-out infinite;
}
@keyframes pulso-lento {
  0% {
    transform: scale(0.8);
    opacity: 0.35;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}
.estrela {
  fill: #fff7d6;
  stroke: var(--c);
  stroke-width: 1.2;
  filter: drop-shadow(0 0 6px #fde68a);
}
.marca-fase {
  stroke: var(--text);
  stroke-width: 1.2;
  opacity: 0.35;
}
.disco {
  stroke: var(--border);
}
.agora circle {
  fill: var(--text);
}
.agora .pulso {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulso 2s ease-out infinite;
}
.cursor line {
  stroke: var(--text);
  stroke-width: 1.2;
  stroke-dasharray: 2 4;
  opacity: 0.55;
}
.cursor .alvo {
  fill: var(--text);
  opacity: 0.08;
  transition: r 0.3s var(--ease-spring), opacity 0.3s;
}
.arrastando .cursor .alvo {
  r: 22;
  opacity: 0.14;
}
.cursor .botao {
  fill: var(--text);
  stroke: var(--bg);
  stroke-width: 3;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
}
.centro {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--rc) * 2 * 0.86);
  transform: translate(-50%, -50%);
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 4px;
  pointer-events: none;
}
.tempo {
  font-size: clamp(2.4rem, 9vw, 3.6rem);
  line-height: 0.95;
  letter-spacing: -0.02em;
}
.valores {
  display: grid;
  gap: 5px;
  width: 100%;
  margin-top: 6px;
}
.valor {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  column-gap: 8px;
  align-items: baseline;
  font-size: 0.74rem;
}
.valor .nome {
  text-align: left;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.valor .pct {
  font-weight: 600;
  color: var(--c);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}
.valor .barra {
  grid-column: 1 / -1;
  grid-row: 2;
  height: 3px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--c) 18%, transparent);
  overflow: hidden;
  margin-top: 3px;
}
.valor .barra span {
  display: block;
  height: 100%;
  background: var(--c);
  transform-origin: left;
  transition: transform 0.2s linear;
}
.fase-med {
  grid-column: 1 / -1;
  grid-row: 3;
  text-align: left;
  font-size: 0.66rem;
  color: var(--text-3);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 420px) {
  .valor {
    font-size: 0.68rem;
  }
}
</style>
