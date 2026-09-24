<script setup lang="ts">
import { Pill, Smile, Sparkles, Target, Utensils, Zap } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import CurvaDia from '../components/CurvaDia.vue'
import { adesaoDoDia, agora, doseAnterior, dosesDoDia, efeitosDoDia, estado, medPorId, mediaDoDia, perfilDe, removerDose, removerEfeito } from '../store'
import { chaveDia, DIAS_SEMANA_CURTO, dataLonga, deChave, duracao, hhmm, HORA, NOMES_MES } from '../lib/datas'
import { ui } from '../ui'

type Modo = 'doses' | 'humor' | 'foco' | 'energia'

const hoje = computed(() => chaveDia(agora.value))
const base = new Date()
const ano = ref(base.getFullYear())
const mes = ref(base.getMonth())
const direcao = ref(1)
const modo = ref<Modo>('doses')
const selecionado = ref<string>(ui.diaCalendario ?? chaveDia(new Date()))

function mudarMes(delta: number) {
  direcao.value = delta
  const d = new Date(ano.value, mes.value + delta, 1)
  ano.value = d.getFullYear()
  mes.value = d.getMonth()
}

function irHoje() {
  const d = new Date()
  direcao.value = d.getFullYear() * 12 + d.getMonth() >= ano.value * 12 + mes.value ? 1 : -1
  ano.value = d.getFullYear()
  mes.value = d.getMonth()
  selecionar(chaveDia(d))
}

function selecionar(chave: string) {
  selecionado.value = chave
  ui.diaCalendario = chave
}

interface Celula {
  chave: string
  dia: number
  foraDoMes: boolean
  futuro: boolean
  pontos: { cor: string; estado: 'tomada' | 'perdida' | 'futura' }[]
  temEfeito: boolean
  valor: number | null
  taxa: number
}

const celulas = computed<Celula[]>(() => {
  const primeiro = new Date(ano.value, mes.value, 1)
  const inicio = new Date(primeiro)
  inicio.setDate(1 - primeiro.getDay())
  const lista: Celula[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    const chave = chaveDia(d)
    const futuro = chave > hoje.value
    const a = adesaoDoDia(chave)
    const pontos: Celula['pontos'] = []
    for (const item of a.itens) {
      for (let k = 0; k < item.planejadas; k++) {
        pontos.push({ cor: item.med.cor, estado: k < item.tomadas ? 'tomada' : futuro || chave === hoje.value ? 'futura' : 'perdida' })
      }
    }
    const campo = modo.value === 'doses' ? null : modo.value
    lista.push({
      chave,
      dia: d.getDate(),
      foraDoMes: d.getMonth() !== mes.value,
      futuro,
      pontos,
      temEfeito: efeitosDoDia(chave).some((e) => e.tipo === 'inicio'),
      valor: campo ? mediaDoDia(chave, campo) : null,
      taxa: a.taxa,
    })
  }
  return lista
})

const resumoMes = computed(() => {
  const doMes = celulas.value.filter((c) => !c.foraDoMes && !c.futuro)
  let planejadas = 0
  let tomadas = 0
  let completos = 0
  for (const c of doMes) {
    const a = adesaoDoDia(c.chave)
    planejadas += a.planejadas
    tomadas += a.tomadas
    if (a.planejadas && a.taxa >= 1) completos++
  }
  const humores = doMes.map((c) => mediaDoDia(c.chave, 'humor')).filter((v): v is number => v != null)
  return {
    adesao: planejadas ? Math.round((tomadas / planejadas) * 100) : 0,
    completos,
    humor: humores.length ? humores.reduce((s, v) => s + v, 0) / humores.length : null,
    registros: doMes.filter((c) => c.temEfeito).length,
  }
})

function corCalor(v: number | null) {
  if (v == null) return 'transparent'
  const t = (v - 1) / 4
  const hue = modo.value === 'humor' ? 330 : modo.value === 'foco' ? 255 : 160
  return `hsla(${hue}, 80%, 60%, ${0.12 + t * 0.55})`
}

/* ---------- dia selecionado ---------- */

const doses = computed(() => dosesDoDia(selecionado.value))
const efeitos = computed(() => efeitosDoDia(selecionado.value))
const adesaoSel = computed(() => adesaoDoDia(selecionado.value))

const inicios = computed(() =>
  efeitos.value
    .filter((e) => e.tipo === 'inicio' && e.medId)
    .map((e) => {
      const med = medPorId(e.medId)
      const d = doseAnterior(e.medId!, +new Date(e.em), perfilDe(med).efeito.duracaoH[1] + 4)
      return { id: e.id, med, h: d ? (+new Date(e.em) - +new Date(d.em)) / HORA : null }
    }),
)

const emojiTipo = { inicio: '✨', pico: '🔥', fim: '🌅', check: '📝' } as const

/* ---------- gesto de arrastar ---------- */

let toqueX: number | null = null
function toqueInicio(e: TouchEvent) {
  toqueX = e.touches[0].clientX
}
function toqueFim(e: TouchEvent) {
  if (toqueX == null) return
  const dx = e.changedTouches[0].clientX - toqueX
  if (Math.abs(dx) > 60) mudarMes(dx < 0 ? 1 : -1)
  toqueX = null
}

function tecla(e: KeyboardEvent, c: Celula) {
  const idx = celulas.value.indexOf(c)
  const mapa: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  if (!(e.key in mapa)) return
  e.preventDefault()
  const alvo = celulas.value[idx + mapa[e.key]]
  if (alvo) {
    selecionar(alvo.chave)
    if (alvo.foraDoMes) mudarMes(alvo.chave < c.chave ? -1 : 1)
  }
}
</script>

<template>
  <div class="stack">
    <section class="card entrar">
      <header class="row between wrap cab">
        <div class="row">
          <button class="btn btn-sm nav" aria-label="Mês anterior" @click="mudarMes(-1)">‹</button>
          <Transition :name="direcao > 0 ? 'mes-prox' : 'mes-ant'" mode="out-in">
            <h2 :key="`${ano}-${mes}`" class="titulo-mes">
              {{ NOMES_MES[mes] }} <span class="faint">{{ ano }}</span>
            </h2>
          </Transition>
          <button class="btn btn-sm nav" aria-label="Próximo mês" @click="mudarMes(1)">›</button>
        </div>
        <div class="row wrap">
          <div class="seg">
            <button v-for="m in (['doses', 'humor', 'foco', 'energia'] as Modo[])" :key="m" :class="{ ativo: modo === m }" @click="modo = m">
              <component :is="m === 'doses' ? Pill : m === 'humor' ? Smile : m === 'foco' ? Target : Zap" :size="13" /> {{ m === 'doses' ? 'Doses' : m === 'humor' ? 'Humor' : m === 'foco' ? 'Foco' : 'Energia' }}
            </button>
          </div>
          <button class="btn btn-sm" @click="irHoje">Hoje</button>
        </div>
      </header>

      <div class="semana tiny faint">
        <span v-for="d in DIAS_SEMANA_CURTO" :key="d">{{ d }}</span>
      </div>

      <div class="viewport" @touchstart.passive="toqueInicio" @touchend="toqueFim">
        <Transition :name="direcao > 0 ? 'grade-prox' : 'grade-ant'" mode="out-in">
          <div :key="`${ano}-${mes}-${modo}`" class="grade">
            <button
              v-for="(c, i) in celulas"
              :key="c.chave"
              class="celula"
              :class="{ fora: c.foraDoMes, hoje: c.chave === hoje, sel: c.chave === selecionado, futuro: c.futuro, completo: modo === 'doses' && c.taxa >= 1 }"
              :style="{ '--i': i, '--calor': corCalor(c.valor) }"
              :aria-label="`${c.dia}, ${c.pontos.filter((p) => p.estado === 'tomada').length} de ${c.pontos.length} doses`"
              :aria-pressed="c.chave === selecionado"
              @click="selecionar(c.chave)"
              @keydown="tecla($event, c)"
            >
              <span class="num tabular">{{ c.dia }}</span>
              <Sparkles v-if="c.temEfeito" :size="11" class="brilho" />
              <span v-if="modo !== 'doses' && c.valor != null" class="valor tabular">{{ c.valor.toFixed(1) }}</span>
              <span class="pontos">
                <i v-for="(p, k) in c.pontos" :key="k" :class="p.estado" :style="{ '--c': p.cor }" />
              </span>
            </button>
          </div>
        </Transition>
      </div>

      <div class="resumo">
        <div>
          <strong class="tabular">{{ resumoMes.adesao }}%</strong>
          <span class="tiny faint">adesão no mês</span>
        </div>
        <div>
          <strong class="tabular">{{ resumoMes.completos }}</strong>
          <span class="tiny faint">dias completos</span>
        </div>
        <div>
          <strong class="tabular">{{ resumoMes.registros }}</strong>
          <span class="tiny faint">dias com início registrado</span>
        </div>
        <div>
          <strong class="tabular">{{ resumoMes.humor ? resumoMes.humor.toFixed(1) : '—' }}</strong>
          <span class="tiny faint">humor médio</span>
        </div>
      </div>
    </section>

    <Transition name="fade" mode="out-in">
      <section :key="selecionado" class="card detalhe">
        <header class="row between wrap">
          <div>
            <h3>{{ dataLonga(deChave(selecionado)) }}</h3>
            <p class="small muted">
              {{ adesaoSel.tomadas }}/{{ adesaoSel.planejadas }} doses
              <template v-for="i in adesaoSel.itens" :key="i.med.id"> · {{ i.med.nome }} {{ i.tomadas }}/{{ i.planejadas }}</template>
            </p>
          </div>
          <div class="row">
            <button class="btn btn-sm" @click="ui.modalDose = { dia: selecionado }">+ Dose</button>
            <button class="btn btn-sm" @click="ui.modalEfeito = { dia: selecionado }">+ Efeito</button>
          </div>
        </header>

        <CurvaDia :dia="selecionado" :altura="230" />

        <div v-if="inicios.length" class="inicios stagger">
          <div v-for="i in inicios" :key="i.id" class="inicio" :style="{ '--cor': i.med?.cor }">
            <span>✨</span>
            <span class="small"><strong>{{ i.med?.nome }}</strong> começou</span>
            <strong class="tabular">{{ i.h != null ? duracao(i.h) : '?' }}</strong>
            <span class="tiny faint">após a dose</span>
          </div>
        </div>

        <div class="listas">
          <div>
            <p class="section-title">Doses</p>
            <p v-if="!doses.length" class="small faint">Nenhuma dose registrada.</p>
            <TransitionGroup name="lista" tag="ul" class="itens">
              <li v-for="d in doses" :key="d.id" :style="{ '--cor': medPorId(d.medId)?.cor }">
                <span class="marca" />
                <span class="tabular small" style="font-weight: 700">{{ hhmm(d.em) }}</span>
                <span class="small">{{ medPorId(d.medId)?.nome }} · {{ d.doseMg }} mg</span>
                <Utensils v-if="d.comAlimento" :size="13" class="faint" />
                <button class="btn btn-ghost btn-sm x" aria-label="Remover" @click="removerDose(d.id)">✕</button>
              </li>
            </TransitionGroup>
          </div>
          <div>
            <p class="section-title">Registros</p>
            <p v-if="!efeitos.length" class="small faint">Nenhum registro de efeito.</p>
            <TransitionGroup name="lista" tag="ul" class="itens">
              <li v-for="e in efeitos" :key="e.id" :style="{ '--cor': medPorId(e.medId)?.cor ?? 'var(--primary)' }">
                <span>{{ emojiTipo[e.tipo] }}</span>
                <span class="tabular small" style="font-weight: 700">{{ hhmm(e.em) }}</span>
                <span class="small">
                  {{ medPorId(e.medId)?.nome ?? 'Geral' }}
                  <span class="tiny faint">· F{{ e.foco }} H{{ e.humor }} E{{ e.energia }} A{{ e.ansiedade }}</span>
                  <span v-if="e.nota" class="tiny faint" style="display: block">“{{ e.nota }}”</span>
                </span>
                <button class="btn btn-ghost btn-sm x" aria-label="Remover" @click="removerEfeito(e.id)">✕</button>
              </li>
            </TransitionGroup>
          </div>
        </div>
      </section>
    </Transition>

    <p v-if="!estado.doses.length" class="small faint" style="text-align: center">
      Dica: em Ajustes (⚙️) você pode gerar 21 dias de dados de exemplo para explorar o calendário.
    </p>
  </div>
</template>

<style scoped>
.cab {
  margin-bottom: 14px;
}
.nav {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 1.3rem;
}
.titulo-mes {
  min-width: 170px;
  text-align: center;
  font-size: 1.25rem;
}
.seg {
  display: flex;
  gap: 2px;
  background: var(--surface-2);
  padding: 3px;
  border-radius: 999px;
}
.seg button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  transition: background 0.25s, box-shadow 0.25s, transform 0.25s var(--ease-spring);
}
.seg button.ativo {
  background: var(--surface-solid);
  box-shadow: var(--shadow);
  transform: scale(1.04);
}
.semana,
.grade {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.semana {
  text-align: center;
  margin-bottom: 6px;
  font-weight: 700;
  text-transform: uppercase;
}
.viewport {
  overflow: hidden;
  padding: 4px;
  margin: -4px;
}
.celula {
  height: clamp(54px, 8vw, 80px);
  border-radius: 14px;
  background: var(--calor, transparent);
  border: 1.5px solid var(--border);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 6px 2px;
  animation: pop-in 0.45s var(--ease-out) both;
  animation-delay: calc(var(--i) * 12ms);
  transition: transform 0.3s var(--ease-spring), border-color 0.2s, box-shadow 0.2s, background 0.3s;
  min-height: 48px;
}
.celula:hover {
  transform: scale(1.06);
  z-index: 1;
}
.celula.fora {
  opacity: 0.35;
}
.celula.futuro .num {
  color: var(--text-3);
}
.celula.hoje {
  border-color: var(--primary);
}
.celula.hoje .num {
  background: var(--primary);
  color: #fff;
}
.celula.sel {
  box-shadow: 0 0 0 3px var(--primary-soft), var(--shadow);
  border-color: var(--primary);
  transform: scale(1.04);
}
.celula.completo {
  background: linear-gradient(160deg, color-mix(in srgb, var(--success) 16%, transparent), transparent);
}
.num {
  font-size: 0.82rem;
  font-weight: 700;
  min-width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 999px;
}
.brilho {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #fcd34d;
  font-size: 0.7rem;
  animation: balanco 3s ease-in-out infinite;
}
.valor {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-2);
}
.pontos {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
  min-height: 7px;
}
.pontos i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: block;
}
.pontos .tomada {
  background: var(--c);
}
.pontos .perdida {
  border: 1.5px solid var(--c);
  opacity: 0.8;
}
.pontos .futura {
  background: var(--c);
  opacity: 0.2;
}
.resumo {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  text-align: center;
}
.resumo div {
  display: grid;
  gap: 2px;
}
.resumo strong {
  font-size: 1.3rem;
}
@media (max-width: 520px) {
  .resumo {
    grid-template-columns: repeat(2, 1fr);
  }
  .celula {
    border-radius: 10px;
  }
  .pontos i {
    width: 5px;
    height: 5px;
  }
}
.detalhe {
  display: grid;
  gap: 14px;
}
.inicios {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.inicio {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--cor) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--cor) 30%, transparent);
}
.listas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.itens {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: grid;
  gap: 6px;
}
.itens li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--surface-2);
}
.marca {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cor);
  flex: none;
}
.x {
  margin-left: auto;
  padding: 4px 8px;
}

/* transições de mês */
.mes-prox-enter-active,
.mes-prox-leave-active,
.mes-ant-enter-active,
.mes-ant-leave-active,
.grade-prox-enter-active,
.grade-prox-leave-active,
.grade-ant-enter-active,
.grade-ant-leave-active {
  transition: opacity 0.25s, transform 0.3s var(--ease-out);
}
.mes-prox-enter-from,
.grade-prox-enter-from,
.mes-ant-leave-to,
.grade-ant-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
.mes-prox-leave-to,
.grade-prox-leave-to,
.mes-ant-enter-from,
.grade-ant-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
</style>
