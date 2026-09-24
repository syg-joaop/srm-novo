<script setup lang="ts">
import { computed } from 'vue'
import { Pill, Sparkles, NotebookPen, Utensils } from 'lucide-vue-next'
import MedIcone from './MedIcone.vue'
import Numero from './Numero.vue'
import { agora, type StatusMed } from '../store'
import { chaveDia, duracao, hhmm, HORA } from '../lib/datas'
import { nivelHabitual, ROTULO_FASE, type Fase } from '../lib/farmaco'
import { ui } from '../ui'

const props = defineProps<{ status: StatusMed }>()

const ETAPAS: { fase: Fase; rotulo: string }[] = [
  { fase: 'aguardando', rotulo: 'Absorção' },
  { fase: 'janela', rotulo: 'Início' },
  { fase: 'subindo', rotulo: 'Subida' },
  { fase: 'pico', rotulo: 'Pico' },
  { fase: 'ativo', rotulo: 'Ativo' },
  { fase: 'diminuindo', rotulo: 'Queda' },
]

const s = computed(() => props.status)
const temDose = computed(() => s.value.fase !== 'sem-dose' && s.value.fase !== 'encerrado')

const segmentos = computed(() => {
  const j = s.value.janelas ?? {
    inicio: s.value.perfil.efeito.inicioH,
    pico: s.value.perfil.efeito.picoH,
    duracao: s.value.perfil.efeito.duracaoH,
  }
  const limites = [0, j.inicio[0], j.inicio[1], j.pico[0], j.pico[1], j.duracao[0], j.duracao[1]]
  const total = limites[6] || 1
  return ETAPAS.map((e, i) => ({ ...e, largura: Math.max(0.02, (limites[i + 1] - limites[i]) / total) }))
})

const progresso = computed(() => (temDose.value ? Math.min(1, s.value.progresso) : 0))

/** Próximo marco e quanto falta. */
const marco = computed(() => {
  const st = s.value
  if (!st.dose || !st.janelas) return null
  const base = +new Date(st.dose.em)
  const t = st.horasDesde
  const j = st.janelas
  const alvos: [number, string][] = [
    [j.inicio[0], 'Início previsto'],
    [j.pico[0], 'Pico'],
    [j.pico[1], 'Fim do pico'],
    [j.duracao[0], 'Começa a cair'],
    [j.duracao[1], 'Encerra'],
  ]
  const prox = alvos.find(([h]) => h > t)
  if (!prox) return null
  return { rotulo: prox[1], em: duracao(prox[0] - t), hora: hhmm(base + prox[0] * HORA) }
})

const titulo = computed(() => {
  const st = s.value
  if (st.fase === 'sem-dose' || st.fase === 'encerrado') {
    if (st.proximoHorario) return { grande: st.proximoHorario, legenda: 'próxima dose' }
    return { grande: '—', legenda: 'sem dose ativa' }
  }
  if (st.fase === 'janela') return { grande: st.sentiuInicio ? 'Começou' : 'A qualquer momento', legenda: st.sentiuInicio ? 'você registrou o início' : 'janela de início' }
  if (st.fase === 'pico') return { grande: 'No pico', legenda: marco.value ? `até ${marco.value.hora}` : '' }
  return { grande: marco.value?.em ?? '—', legenda: marco.value ? `${marco.value.rotulo.toLowerCase()} · ${marco.value.hora}` : '' }
})

const quando = computed(() => {
  const d = s.value.dose
  if (!d) return null
  return `${chaveDia(d.em) === chaveDia(agora.value) ? 'Hoje' : 'Ontem'} às ${hhmm(d.em)}${d.comAlimento ? ' · com refeição' : ''}`
})

const tratamento = computed(() => {
  const t = s.value.perfil.efeitoTerapeutico
  if (!t) return null
  const dias = Math.floor((agora.value - new Date(s.value.med.inicioTratamento + 'T00:00').getTime()) / (24 * HORA)) + 1
  const plenoDias = t.plenoSemanas[1] * 7
  const inicioDias = t.inicioSemanas[0] * 7
  return { dias, pct: Math.min(1, dias / plenoDias), marcaInicio: inicioDias / plenoDias, pleno: t.plenoSemanas, inicio: t.inicioSemanas }
})

const pctHabitual = computed(() => Math.round((s.value.nivel / nivelHabitual(s.value.perfil)) * 100))

const faseRotulo = computed(() => (s.value.fase === 'sem-dose' ? 'Não tomado' : ROTULO_FASE[s.value.fase]))
const vivo = computed(() => s.value.fase === 'janela' || s.value.fase === 'pico' || s.value.fase === 'subindo')
</script>

<template>
  <article class="card cartao" :class="['fase-' + s.fase, { vivo }]" :style="{ '--c': s.med.cor }">
    <div class="aura" aria-hidden="true" />
    <header class="row between">
      <div class="row" style="min-width: 0">
        <MedIcone :perfil="s.perfil" :cor="s.med.cor" :brilho="vivo" />
        <div style="min-width: 0">
          <h3 class="nome">{{ s.med.nome }}</h3>
          <p class="tiny faint">{{ s.med.doseMg }} mg · {{ s.perfil.nome }}</p>
        </div>
      </div>
      <span class="selo"><i />{{ faseRotulo }}</span>
    </header>

    <div class="principal">
      <Transition name="troca" mode="out-in">
        <div :key="titulo.grande" class="grande">
          <strong class="display">{{ titulo.grande }}</strong>
          <span class="tiny muted">{{ titulo.legenda }}</span>
        </div>
      </Transition>
      <div class="nivel">
        <span class="mono tabular"><Numero :valor="pctHabitual" /><small>%</small></span>
        <span class="tiny faint">do pico habitual</span>
      </div>
    </div>

    <div class="trilha" :class="{ inativa: !temDose }">
      <div class="segmentos">
        <span
          v-for="seg in segmentos"
          :key="seg.fase"
          class="seg"
          :class="{ atual: seg.fase === s.fase }"
          :style="{ flexGrow: seg.largura }"
        />
      </div>
      <div class="preenchimento" :style="{ transform: `scaleX(${progresso})` }" />
      <div v-if="temDose" class="cabeca" :style="{ left: progresso * 100 + '%' }" />
      <div class="rotulos">
        <span v-for="seg in segmentos" :key="seg.fase" :class="{ atual: seg.fase === s.fase }" :style="{ flexGrow: seg.largura }" :title="seg.rotulo">
          <Transition name="troca"><b v-if="seg.fase === s.fase">{{ seg.rotulo }}</b></Transition>
        </span>
        <span v-if="!temDose" class="dica-trilha">Registre a dose para acompanhar as fases</span>
      </div>
    </div>

    <div v-if="tratamento" class="tratamento">
      <div class="row between tiny">
        <span>Dia <strong class="tabular">{{ tratamento.dias }}</strong> de tratamento</span>
        <span class="faint">pleno em {{ tratamento.pleno[0] }}–{{ tratamento.pleno[1] }} sem.</span>
      </div>
      <div class="barra-trat">
        <span class="fill" :style="{ transform: `scaleX(${tratamento.pct})` }" />
        <span class="marca" :style="{ left: tratamento.marcaInicio * 100 + '%' }" />
      </div>
    </div>

    <footer class="row between">
      <span class="tiny faint row" style="gap: 6px">
        <template v-if="quando">
          <Utensils v-if="s.dose?.comAlimento" :size="13" />
          {{ quando }}
        </template>
        <template v-else>Nenhuma dose recente</template>
      </span>
      <div class="row" style="gap: 6px">
        <button v-if="!temDose" class="btn btn-sm" @click="ui.modalDose = { medId: s.med.id }"><Pill :size="14" /> Registrar</button>
        <button v-else class="btn btn-sm" @click="ui.modalEfeito = { medId: s.med.id, tipo: s.sentiuInicio ? 'check' : 'inicio' }">
          <component :is="s.sentiuInicio ? NotebookPen : Sparkles" :size="14" /> {{ s.sentiuInicio ? 'Check-in' : 'Senti' }}
        </button>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.cartao {
  display: grid;
  gap: 18px;
  overflow: hidden;
  transition: transform 0.5s var(--ease-spring), border-color 0.3s, box-shadow 0.4s;
}
.cartao:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--c) 30%, var(--border));
}
.aura {
  position: absolute;
  inset: -40% -20% auto auto;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--c) calc(var(--glow) * 28%), transparent), transparent 65%);
  pointer-events: none;
  transition: opacity 0.6s;
  opacity: 0.5;
}
.vivo .aura {
  opacity: 1;
  animation: respirar 4s ease-in-out infinite;
}
.nome {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.selo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 12%, transparent);
  white-space: nowrap;
  flex: none;
}
.selo i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  position: relative;
}
.vivo .selo i::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: currentColor;
  animation: pulso 1.8s ease-out infinite;
}
.fase-sem-dose .selo,
.fase-encerrado .selo {
  color: var(--text-3);
  background: var(--surface-2);
}
.principal {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.grande {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.grande strong {
  font-size: clamp(1.9rem, 5vw, 2.4rem);
  line-height: 1;
  letter-spacing: -0.02em;
}
.nivel {
  display: grid;
  justify-items: end;
  flex: none;
}
.nivel span:first-child {
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--c);
}
.nivel small {
  font-size: 0.7em;
  opacity: 0.7;
}
.trilha {
  position: relative;
  padding-top: 2px;
}
.segmentos {
  display: flex;
  gap: 3px;
  height: 8px;
}
.seg {
  border-radius: 4px;
  background: color-mix(in srgb, var(--c) 14%, transparent);
  flex-basis: 0;
  transition: background 0.4s;
}
.seg.atual {
  background: color-mix(in srgb, var(--c) 30%, transparent);
}
.preenchimento {
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--c) 60%, transparent), var(--c));
  transform-origin: left;
  transition: transform 1.4s var(--ease-out);
  animation: encher 1.6s var(--ease-out) both;
}
@keyframes encher {
  from {
    transform: scaleX(0);
  }
}
.cabeca {
  position: absolute;
  top: 6px;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  margin-top: -7px;
  border-radius: 50%;
  background: var(--surface-solid);
  border: 3px solid var(--c);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 20%, transparent), 0 0 18px var(--c);
  transition: left 1.4s var(--ease-out);
}
.trilha.inativa .preenchimento {
  opacity: 0;
}
.rotulos {
  display: flex;
  gap: 3px;
  margin-top: 8px;
  height: 16px;
  position: relative;
}
.rotulos > span {
  flex-basis: 0;
  position: relative;
  overflow: visible;
}
.rotulos b {
  position: absolute;
  left: 0;
  white-space: nowrap;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--c);
}
.dica-trilha {
  position: absolute;
  inset: 0;
  font-size: 0.7rem;
  color: var(--text-3);
}
.tratamento {
  display: grid;
  gap: 7px;
  padding: 12px;
  border-radius: 14px;
  background: var(--surface-2);
}
.barra-trat {
  position: relative;
  height: 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c) 14%, transparent);
}
.barra-trat .fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--c);
  transform-origin: left;
  animation: encher 1.8s var(--ease-out) both;
}
.barra-trat .marca {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 11px;
  background: var(--text-2);
  border-radius: 1px;
}
footer {
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
</style>
