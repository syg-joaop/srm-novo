<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { agora, dosesDoDia, efeitosDoDia, estado, inicioPessoal, paraCurva, perfilDe } from '../store'
import { chaveDia, deChave, deMinutos, HORA, minutosDe } from '../lib/datas'
import { faseEm, janelasEfeito, nivelEm, ROTULO_FASE } from '../lib/farmaco'
import type { Medicacao } from '../types'

const props = withDefaults(defineProps<{ dia: string; altura?: number; mostrarPlanejado?: boolean }>(), {
  altura: 250,
  mostrarPlanejado: true,
})

const caixa = ref<HTMLElement | null>(null)
const uidSvg = Math.random().toString(36).slice(2, 8)
const largura = ref(640)
let obs: ResizeObserver | undefined

onMounted(() => {
  if (!caixa.value) return
  largura.value = caixa.value.clientWidth || 640
  obs = new ResizeObserver((e) => (largura.value = Math.max(280, e[0].contentRect.width)))
  obs.observe(caixa.value)
})
onBeforeUnmount(() => obs?.disconnect())

const M = { top: 16, right: 12, bottom: 30, left: 12 }
const PASSO_MIN = 10

const inicioDia = computed(() => deChave(props.dia).getTime())
const ehHoje = computed(() => props.dia === chaveDia(agora.value))

const medsVisiveis = computed<Medicacao[]>(() => {
  const ids = new Set(dosesDoDia(props.dia).map((d) => d.medId))
  return estado.medicacoes.filter((m) => m.ativa || ids.has(m.id))
})

const faixasLinha = computed(() => medsVisiveis.value.length * 14 + 6)
const alturaGrafico = computed(() => props.altura - M.top - M.bottom - faixasLinha.value)

function x(horas: number) {
  return M.left + (horas / 24) * (largura.value - M.left - M.right)
}

interface Serie {
  med: Medicacao
  pontos: number[]
  planejado: number[] | null
}

const series = computed<Serie[]>(() => {
  const n = (24 * 60) / PASSO_MIN
  return medsVisiveis.value.map((med) => {
    const perfil = perfilDe(med)
    const doses = paraCurva(med.id, med.doseMg)
    const pontos: number[] = []
    for (let i = 0; i <= n; i++) pontos.push(nivelEm(perfil, doses, inicioDia.value + i * PASSO_MIN * 60_000))

    // Curva fantasma: doses planejadas ainda não tomadas hoje.
    let planejado: number[] | null = null
    if (props.mostrarPlanejado && ehHoje.value && med.ativa) {
      const tomadas = dosesDoDia(props.dia).filter((d) => d.medId === med.id).length
      const faltam = [...med.horarios].sort().slice(tomadas)
      if (faltam.length) {
        const extras = faltam.map((h) => ({
          em: Math.max(inicioDia.value + minutosDe(h) * 60_000, agora.value),
          comAlimento: false,
          fatorDose: 1,
        }))
        const todas = [...doses, ...extras]
        planejado = []
        for (let i = 0; i <= n; i++) planejado.push(nivelEm(perfil, todas, inicioDia.value + i * PASSO_MIN * 60_000))
      }
    }
    return { med, pontos, planejado }
  })
})

const maxY = computed(() => {
  let m = 1
  for (const s of series.value) for (const v of s.planejado ?? s.pontos) m = Math.max(m, v)
  return m * 1.08
})

function y(v: number) {
  return M.top + alturaGrafico.value - (v / maxY.value) * alturaGrafico.value
}

function caminho(pontos: number[]) {
  return pontos.map((v, i) => `${i ? 'L' : 'M'}${x((i * PASSO_MIN) / 60).toFixed(1)},${y(v).toFixed(1)}`).join('')
}

function area(pontos: number[]) {
  const base = y(0).toFixed(1)
  return `${caminho(pontos)}L${x(24).toFixed(1)},${base}L${x(0).toFixed(1)},${base}Z`
}

const horaAgora = computed(() => (ehHoje.value ? (agora.value - inicioDia.value) / HORA : null))

const sono = computed(() => {
  const dormir = minutosDe(estado.preferencias.dormir) / 60
  const acordar = minutosDe(estado.preferencias.acordar) / 60
  if (dormir > acordar)
    return [
      [0, acordar],
      [dormir, 24],
    ]
  return [[dormir, acordar]]
})

/** Faixas de efeito previstas por dose, desenhadas abaixo do gráfico. */
const faixas = computed(() => {
  const lista: { cor: string; linha: number; inicio: [number, number]; pico: [number, number]; fim: number; dose: number; id: string }[] = []
  const doses = dosesDoDia(props.dia)
  medsVisiveis.value.forEach((med, linha) => {
    const perfil = perfilDe(med)
    for (const d of doses.filter((d) => d.medId === med.id)) {
      const h0 = (+new Date(d.em) - inicioDia.value) / HORA
      const j = janelasEfeito(perfil, d.comAlimento, inicioPessoal(med.id))
      lista.push({
        id: d.id,
        cor: med.cor,
        linha,
        dose: h0,
        inicio: [h0 + j.inicio[0], h0 + j.inicio[1]],
        pico: [h0 + j.pico[0], h0 + j.pico[1]],
        fim: Math.min(24, h0 + j.duracao[1]),
      })
    }
  })
  return lista
})

const yFaixa = (linha: number) => M.top + alturaGrafico.value + 10 + linha * 14

const marcadores = computed(() =>
  efeitosDoDia(props.dia)
    .filter((e) => e.medId)
    .map((e) => {
      const h = (+new Date(e.em) - inicioDia.value) / HORA
      const serie = series.value.find((s) => s.med.id === e.medId)
      const idx = Math.round((h * 60) / PASSO_MIN)
      const v = serie ? serie.pontos[Math.min(serie.pontos.length - 1, Math.max(0, idx))] : 0
      return { id: e.id, h, v, cor: serie?.med.cor ?? 'var(--primary)', tipo: e.tipo }
    }),
)

const marcasHora = [0, 3, 6, 9, 12, 15, 18, 21, 24]

/* ---------- interação ---------- */

const hover = ref<number | null>(null)

function mover(ev: PointerEvent) {
  const svg = ev.currentTarget as SVGSVGElement
  const r = svg.getBoundingClientRect()
  const px = ev.clientX - r.left
  const h = ((px - M.left) / (largura.value - M.left - M.right)) * 24
  hover.value = Math.max(0, Math.min(24, h))
}

const dica = computed(() => {
  if (hover.value == null) return null
  const h = hover.value
  const idx = Math.round((h * 60) / PASSO_MIN)
  const instante = inicioDia.value + h * HORA
  const linhas = series.value.map((s) => {
    const med = s.med
    const perfil = perfilDe(med)
    const v = (s.planejado && horaAgora.value != null && h > horaAgora.value ? s.planejado : s.pontos)[idx] ?? 0
    const ultima = estado.doses
      .filter((d) => d.medId === med.id && +new Date(d.em) <= instante)
      .sort((a, b) => +new Date(b.em) - +new Date(a.em))[0]
    let fase = ''
    if (ultima) {
      const t = (instante - +new Date(ultima.em)) / HORA
      if (t < perfil.efeito.duracaoH[1] + 2) fase = ROTULO_FASE[faseEm(janelasEfeito(perfil, ultima.comAlimento, inicioPessoal(med.id)), t)]
    }
    return { nome: med.nome, cor: med.cor, pct: Math.round(v * 100), fase }
  })
  return { hora: deMinutos(h * 60), linhas, esquerda: x(h) > largura.value * 0.6 }
})

const semDados = computed(() => series.value.every((s) => s.pontos.every((v) => v < 0.005)) && !series.value.some((s) => s.planejado))

</script>

<template>
  <div ref="caixa" class="curva">
    <svg
      :key="dia"
      class="svg"
      :viewBox="`0 0 ${largura} ${altura}`"
      role="img"
      :aria-label="`Curva estimada das medicações em ${dia}`"
      @pointermove="mover"
      @pointerdown="mover"
      @pointerleave="hover = null"
    >
      <defs>
        <clipPath :id="`clip-${uidSvg}`">
          <rect :x="x(0)" y="0" :width="x(24) - x(0)" :height="altura" />
        </clipPath>
        <linearGradient v-for="s in series" :id="`g-${uidSvg}-${s.med.id}`" :key="s.med.id" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" :stop-color="s.med.cor" stop-opacity="0.45" />
          <stop offset="100%" :stop-color="s.med.cor" stop-opacity="0" />
        </linearGradient>
        <pattern :id="`listras-${uidSvg}`" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="currentColor" opacity="0.5" />
        </pattern>
      </defs>

      <!-- sono -->
      <rect
        v-for="(f, i) in sono"
        :key="'s' + i"
        :x="x(f[0])"
        :y="M.top"
        :width="x(f[1]) - x(f[0])"
        :height="alturaGrafico"
        class="sono"
      />
      <text v-if="sono.length" :x="x(sono[sono.length - 1][0]) + 6" :y="M.top + 14" class="rotulo-sono">🌙 sono</text>

      <!-- grade -->
      <g class="grade">
        <line v-for="h in marcasHora" :key="h" :x1="x(h)" :x2="x(h)" :y1="M.top" :y2="M.top + alturaGrafico" />
        <line :x1="x(0)" :x2="x(24)" :y1="y(0)" :y2="y(0)" class="base" />
      </g>

      <!-- curvas planejadas (fantasma) -->
      <g v-for="s in series" :key="'p' + s.med.id">
        <path v-if="s.planejado" :d="caminho(s.planejado)" fill="none" :stroke="s.med.cor" class="fantasma" />
      </g>

      <!-- áreas e linhas -->
      <g v-for="(s, i) in series" :key="'c' + s.med.id" :style="{ '--atraso': i * 0.15 + 's' }">
        <path :d="area(s.pontos)" :fill="`url(#g-${uidSvg}-${s.med.id})`" class="area" />
        <path :d="caminho(s.pontos)" fill="none" :stroke="s.med.cor" class="linha" pathLength="1" />
      </g>

      <!-- registros de efeito -->
      <g v-for="(m, i) in marcadores" :key="m.id" class="marcador" :style="{ '--atraso': 0.6 + i * 0.05 + 's' }">
        <circle :cx="x(m.h)" :cy="y(m.v)" r="9" :fill="m.cor" opacity="0.18" />
        <circle :cx="x(m.h)" :cy="y(m.v)" r="5" :fill="m.cor" stroke="var(--surface-solid)" stroke-width="2" />
        <text :x="x(m.h)" :y="y(m.v) - 12" text-anchor="middle" class="emoji-marca">
          {{ m.tipo === 'inicio' ? '✨' : m.tipo === 'pico' ? '🔥' : m.tipo === 'fim' ? '🌅' : '📝' }}
        </text>
      </g>

      <!-- faixas de efeito previstas -->
      <g v-for="f in faixas" :key="'f' + f.id" class="faixa" :style="{ color: f.cor }" :clip-path="`url(#clip-${uidSvg})`">
        <line :x1="x(f.dose)" :x2="x(f.fim)" :y1="yFaixa(f.linha)" :y2="yFaixa(f.linha)" :stroke="f.cor" stroke-width="2" opacity="0.35" stroke-linecap="round" />
        <rect :x="x(f.inicio[0])" :y="yFaixa(f.linha) - 5" :width="Math.max(3, x(f.inicio[1]) - x(f.inicio[0]))" height="10" rx="5" :fill="`url(#listras-${uidSvg})`" />
        <rect :x="x(f.pico[0])" :y="yFaixa(f.linha) - 5" :width="Math.max(3, x(Math.min(24, f.pico[1])) - x(f.pico[0]))" height="10" rx="5" :fill="f.cor" opacity="0.85" />
        <circle :cx="x(f.dose)" :cy="yFaixa(f.linha)" r="5" :fill="f.cor" stroke="var(--surface-solid)" stroke-width="2" />
      </g>

      <!-- eixo -->
      <g class="eixo">
        <text v-for="h in marcasHora" :key="'t' + h" :x="x(h)" :y="altura - 8" :text-anchor="h === 0 ? 'start' : h === 24 ? 'end' : 'middle'">
          {{ String(h).padStart(2, '0') }}h
        </text>
      </g>

      <!-- agora -->
      <g v-if="horaAgora != null" class="agora">
        <line :x1="x(horaAgora)" :x2="x(horaAgora)" :y1="M.top - 4" :y2="M.top + alturaGrafico + faixasLinha" />
        <circle :cx="x(horaAgora)" :cy="M.top - 4" r="4" class="ponto" />
        <circle :cx="x(horaAgora)" :cy="M.top - 4" r="4" class="pulso" />
      </g>

      <!-- hover -->
      <line v-if="hover != null" :x1="x(hover)" :x2="x(hover)" :y1="M.top" :y2="M.top + alturaGrafico" class="cursor" />
      <g v-if="hover != null">
        <circle
          v-for="s in series"
          :key="'h' + s.med.id"
          :cx="x(hover)"
          :cy="y(s.pontos[Math.round((hover * 60) / PASSO_MIN)] ?? 0)"
          r="4"
          :fill="s.med.cor"
          stroke="var(--surface-solid)"
          stroke-width="2"
        />
      </g>
    </svg>

    <Transition name="fade">
      <div v-if="dica" class="dica" :style="{ left: dica.esquerda ? 'auto' : x(hover!) + 14 + 'px', right: dica.esquerda ? largura - x(hover!) + 14 + 'px' : 'auto' }">
        <strong class="tabular">{{ dica.hora }}</strong>
        <div v-for="l in dica.linhas" :key="l.nome" class="row tiny">
          <span class="bolinha" :style="{ background: l.cor }" />
          <span>{{ l.nome }}</span>
          <span class="tabular" style="margin-left: auto; font-weight: 700">{{ l.pct }}%</span>
        </div>
        <div v-for="l in dica.linhas.filter((l) => l.fase)" :key="'f' + l.nome" class="tiny faint">{{ l.nome }}: {{ l.fase }}</div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="semDados" class="vazio small muted">Nenhuma dose registrada nesse dia.</div>
    </Transition>

    <div class="legenda tiny muted">
      <span class="row"><span class="amostra listrada" /> janela de início</span>
      <span class="row"><span class="amostra cheia" /> pico</span>
      <span class="row"><span class="amostra tracejada" /> previsão</span>
      <span class="row">✨ você sentiu</span>
      <span class="faint">% = nível relativo ao pico de uma dose</span>
    </div>
  </div>
</template>

<style scoped>
.curva {
  position: relative;
  width: 100%;
  min-width: 0;
  user-select: none;
  touch-action: pan-y;
}
.svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.sono {
  fill: var(--sleep);
}
.rotulo-sono {
  font-size: 10px;
  fill: var(--text-3);
}
.grade line {
  stroke: var(--border);
  stroke-dasharray: 2 4;
}
.grade .base {
  stroke-dasharray: none;
}
.eixo text {
  font-size: 10px;
  fill: var(--text-3);
}
.linha {
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: desenhar 1.4s var(--ease-out) forwards;
  animation-delay: var(--atraso);
}
.area {
  opacity: 0;
  animation: aparecer 1s ease forwards;
  animation-delay: calc(var(--atraso) + 0.4s);
}
.fantasma {
  stroke-width: 2;
  stroke-dasharray: 4 5;
  opacity: 0.55;
  animation: correr 1.2s linear infinite;
}
.faixa {
  animation: aparecer 0.6s ease both;
  animation-delay: 0.5s;
}
.marcador {
  transform-box: fill-box;
  transform-origin: center;
  animation: saltar 0.6s var(--ease-spring) both;
  animation-delay: var(--atraso);
}
.emoji-marca {
  font-size: 12px;
}
.agora line {
  stroke: var(--text);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
  opacity: 0.6;
}
.agora .ponto {
  fill: var(--text);
}
.agora .pulso {
  fill: var(--text);
  transform-box: fill-box;
  transform-origin: center;
  animation: pulso 1.8s ease-out infinite;
}
.cursor {
  stroke: var(--primary);
  stroke-width: 1;
  opacity: 0.7;
}
.dica {
  position: absolute;
  top: 8px;
  min-width: 160px;
  background: var(--surface-solid);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 10px 12px;
  display: grid;
  gap: 4px;
  pointer-events: none;
  z-index: 2;
}
.bolinha {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}
.vazio {
  position: absolute;
  inset: 0 0 60px;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 8px;
}
.amostra {
  width: 16px;
  height: 8px;
  border-radius: 4px;
  display: inline-block;
}
.listrada {
  background: repeating-linear-gradient(45deg, var(--text-3) 0 2px, transparent 2px 5px);
}
.cheia {
  background: var(--primary);
}
.tracejada {
  height: 0;
  border-top: 2px dashed var(--text-3);
}
@keyframes desenhar {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes aparecer {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes correr {
  to {
    stroke-dashoffset: -18;
  }
}
@keyframes saltar {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
