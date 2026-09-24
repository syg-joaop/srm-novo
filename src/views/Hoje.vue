<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue'
import { BellRing, ChevronRight, Crosshair, Pause, Pill, Play, RotateCcw, Sparkles, Trash2 } from 'lucide-vue-next'
import CartaoMed from '../components/CartaoMed.vue'
import FaixaHoras from '../components/FaixaHoras.vue'
import RelogioDia from '../components/RelogioDia.vue'
import { roteiroDoDia, seriesDoDia, type EventoDia } from '../dia'
import { adesaoDoDia, agora, avisar, dosesDoDia, estado, medsAtivas, registrarEfeito, removerDose, removerEfeito, sequencia, statusDe, type StatusMed } from '../store'
import { chaveDia, dataLonga, deChave, deMinutos, DIAS_SEMANA_CURTO, duracao, HORA, saudacao, somarDias } from '../lib/datas'
import { ceu, ui } from '../ui'

/* ---------- agora ---------- */

const hoje = computed(() => chaveDia(agora.value))
const status = computed(() => medsAtivas.value.map((m) => statusDe(m, agora.value)))
const adesao = computed(() => adesaoDoDia(hoje.value))

const perguntas = computed(() =>
  status.value.filter((s) => s.dose && (s.fase === 'janela' || s.fase === 'subindo') && !s.sentiuInicio && !estado.perguntasRespondidas.includes(s.dose.id)),
)

function sentiAgora(s: StatusMed) {
  registrarEfeito({ em: new Date().toISOString(), medId: s.med.id, tipo: 'inicio', foco: 3, humor: 3, energia: 3, ansiedade: 2, sintomas: [], nota: '' })
  avisar(`${s.med.nome}: início registrado ${duracao(s.horasDesde)} após a dose`, '✨')
}
function aindaNao(s: StatusMed) {
  if (s.dose) estado.perguntasRespondidas.push(s.dose.id)
}

/** Frase-resumo do momento. */
const resumo = computed(() => {
  const vivos = status.value.filter((s) => s.dose && s.fase !== 'encerrado')
  const pendentes = status.value.filter((s) => (s.fase === 'sem-dose' || s.fase === 'encerrado') && s.proximoHorario)
  const partes: string[] = []
  for (const s of vivos) {
    const j = s.janelas!
    if (s.fase === 'aguardando') partes.push(`${s.med.nome} deve começar a agir em ${duracao(j.inicio[0] - s.horasDesde)}`)
    else if (s.fase === 'janela') partes.push(`${s.med.nome} está na janela de início`)
    else if (s.fase === 'subindo') partes.push(`${s.med.nome} está subindo para o pico`)
    else if (s.fase === 'pico') partes.push(`${s.med.nome} está no pico`)
    else if (s.fase === 'ativo') partes.push(`${s.med.nome} segue ativo`)
    else if (s.fase === 'diminuindo') partes.push(`${s.med.nome} está perdendo força`)
  }
  if (pendentes.length) partes.push(`${pendentes.map((p) => p.med.nome).join(' e ')} ${pendentes.length > 1 ? 'aguardam' : 'aguarda'} a dose de hoje`)
  return partes.length ? partes.join('. ') + '.' : 'Nenhuma dose registrada hoje ainda.'
})

/* ---------- dia exibido ---------- */

const dia = ref(hoje.value)
const ehHoje = computed(() => dia.value === hoje.value)
const inicioDia = computed(() => deChave(dia.value).getTime())
const horaAgora = computed(() => (ehHoje.value ? (agora.value - inicioDia.value) / HORA : null))

const series = computed(() => seriesDoDia(dia.value))
const eventos = computed(() => roteiroDoDia(dia.value, series.value))

const semana = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = somarDias(deChave(hoje.value), i - 6)
    const chave = chaveDia(d)
    const a = adesaoDoDia(chave)
    return { chave, num: d.getDate(), sem: DIAS_SEMANA_CURTO[d.getDay()], taxa: a.taxa, doses: dosesDoDia(chave).length }
  }),
)

const hora = ref(0)
const velocidade = ref(1)
const tocando = ref(false)
const arrastando = ref(false)

/* ---------- reprodução ---------- */

let raf = 0
let ultimoT = 0
let tween: { de: number; ate: number; t0: number; dur: number } | null = null

function inicioReproducao() {
  const primeira = eventos.value.find((e) => e.tipo === 'dose' || e.tipo === 'planejado')
  const base = primeira ? primeira.h - 0.75 : (eventos.value.find((e) => e.tipo === 'acordar')?.h ?? 6)
  return Math.max(0, Math.floor(base * 4) / 4)
}

function passo(t: number) {
  const dt = Math.min(0.05, (t - ultimoT) / 1000)
  ultimoT = t
  if (tween) {
    const p = Math.min(1, (t - tween.t0) / tween.dur)
    const e = 1 - Math.pow(1 - p, 4)
    hora.value = tween.de + (tween.ate - tween.de) * e
    if (p >= 1) tween = null
  } else if (tocando.value && !arrastando.value) {
    // Desacelera perto dos eventos para dar tempo de ler o narrador.
    const prox = eventos.value.find((e) => e.h > hora.value + 0.001)
    const dist = prox ? prox.h - hora.value : 99
    const fator = dist < 0.35 ? 0.28 : dist < 0.8 ? 0.6 : 1
    hora.value = Math.min(24, hora.value + dt * 1.25 * velocidade.value * fator)
    if (hora.value >= 24) tocando.value = false
  }
  if (tocando.value || tween) raf = requestAnimationFrame(passo)
  else raf = 0
}

function iniciarLoop() {
  if (raf) return
  ultimoT = performance.now()
  raf = requestAnimationFrame(passo)
}

function irPara(h: number, dur = 900) {
  tween = { de: hora.value, ate: Math.max(0, Math.min(24, h)), t0: performance.now(), dur }
  iniciarLoop()
}

function alternarReproducao() {
  if (tocando.value) {
    tocando.value = false
    return
  }
  tween = null
  if (hora.value >= 23.9 || (ehHoje.value && horaAgora.value != null && Math.abs(hora.value - horaAgora.value) < 0.1)) hora.value = inicioReproducao()
  tocando.value = true
  iniciarLoop()
}

function reiniciar() {
  tween = null
  hora.value = inicioReproducao()
  tocando.value = true
  iniciarLoop()
}

function voltarAgora() {
  tocando.value = false
  if (!ehHoje.value) {
    dia.value = hoje.value
    return
  }
  irPara(horaAgora.value ?? 12)
}

function escolherDia(chave: string) {
  if (chave === dia.value) return
  tocando.value = false
  dia.value = chave
}

watch(dia, () => {
  tween = null
  if (ehHoje.value) {
    hora.value = 0
    irPara(horaAgora.value ?? 12, 1600)
  } else {
    // Ao abrir um dia passado, reproduz a partir da primeira dose.
    hora.value = inicioReproducao()
    tocando.value = true
    iniciarLoop()
  }
})

onMounted(() => {
  hora.value = 0
  irPara(horaAgora.value ?? 12, 1800)
})
onActivated(() => {
  if (ehHoje.value && horaAgora.value != null && !tocando.value && Math.abs(hora.value - horaAgora.value) > 0.2) irPara(horaAgora.value)
})
onDeactivated(() => (tocando.value = false))
onBeforeUnmount(() => cancelAnimationFrame(raf))

// Mantém o cursor acompanhando o relógio quando parado em "agora".
watch(agora, (_, antigo) => {
  if (!ehHoje.value || tocando.value || arrastando.value || tween) return
  const antes = (antigo - inicioDia.value) / HORA
  if (Math.abs(hora.value - antes) < 0.1) hora.value = horaAgora.value!
})

watch(hora, (h) => (ceu.hora = h), { immediate: true })

/* ---------- narrador ---------- */

const eventoAtual = computed<EventoDia | null>(() => {
  let atual: EventoDia | null = null
  for (const e of eventos.value) if (e.h <= hora.value + 0.001) atual = e
  return atual
})
const proximoEvento = computed(() => eventos.value.find((e) => e.h > hora.value + 0.001) ?? null)

const lista = ref<HTMLElement | null>(null)
watch(eventoAtual, (e) => {
  const caixa = lista.value
  if (!e || !caixa) return
  const el = caixa.querySelector<HTMLElement>(`[data-id="${e.id}"]`)
  if (!el) return
  // Rola só a lista, sem mexer na página.
  const alvo = el.offsetTop - caixa.clientHeight / 2 + el.clientHeight / 2
  caixa.scrollTo({ top: alvo, behavior: 'smooth' })
})

function apagarEvento(e: EventoDia) {
  if (e.id.endsWith('-dose')) removerDose(e.id.replace(/-dose$/, ''))
  else if (e.id.startsWith('r-')) removerEfeito(e.id.slice(2))
}

const ROTULO_TIPO: Record<string, string> = {
  acordar: 'Rotina',
  dose: 'Dose',
  residual: 'Organismo',
  inicio: 'Previsão',
  pico: 'Previsão',
  'pico-fim': 'Previsão',
  queda: 'Previsão',
  fim: 'Previsão',
  registro: 'Seu registro',
  dormir: 'Rotina',
  planejado: 'Planejado',
}
</script>

<template>
  <div class="hoje">
    <!-- cabeçalho -->
    <section class="hero">
      <div class="hero-texto">
        <p class="eyebrow entrar">{{ dataLonga(agora) }}</p>
        <h1 class="display entrar" style="animation-delay: 0.05s">
          {{ saudacao(new Date(agora)) }}<template v-if="estado.preferencias.nome">, {{ estado.preferencias.nome }}</template>.
        </h1>
        <Transition name="troca" mode="out-in">
          <p :key="resumo" class="resumo muted">{{ resumo }}</p>
        </Transition>
        <div class="row wrap metas entrar" style="animation-delay: 0.15s">
          <span class="chip"><Pill :size="13" /> {{ adesao.tomadas }} de {{ adesao.planejadas }} doses hoje</span>
          <span v-if="sequencia" class="chip sequencia">{{ sequencia }} {{ sequencia === 1 ? 'dia' : 'dias' }} em sequência</span>
        </div>
      </div>
      <div class="acoes entrar" style="animation-delay: 0.2s">
        <button class="btn btn-primary grande" @click="ui.modalDose = {}"><Pill :size="18" /> Registrar dose</button>
        <button class="btn grande" @click="ui.modalEfeito = {}"><Sparkles :size="18" /> Senti o efeito</button>
      </div>
    </section>

    <!-- pergunta -->
    <TransitionGroup name="lista" tag="div" class="perguntas">
      <div v-for="s in perguntas" :key="'q' + s.dose!.id" class="pergunta" :style="{ '--c': s.med.cor }">
        <span class="sino"><BellRing :size="18" /><i /><i /></span>
        <div class="pergunta-texto">
          <strong>{{ s.med.nome }} entrou na janela de início</strong>
          <p class="small muted">Tomado há {{ duracao(s.horasDesde) }}. Já sentiu o efeito?<span class="extra"> Cada resposta deixa suas previsões mais precisas.</span></p>
        </div>
        <div class="row wrap" style="gap: 6px">
          <button class="btn btn-sm btn-accent" @click="sentiAgora(s)">Sim, agora</button>
          <button class="btn btn-sm" @click="ui.modalEfeito = { medId: s.med.id, tipo: 'inicio' }">Em outro horário</button>
          <button class="btn btn-sm btn-ghost" @click="aindaNao(s)">Ainda não</button>
        </div>
      </div>
    </TransitionGroup>

    <!-- status atual -->
    <div class="cartoes stagger">
      <CartaoMed v-for="s in status" :key="s.med.id" :status="s" />
    </div>

    <!-- dia interativo -->
    <section class="card dia">
      <header class="dia-cab">
        <div>
          <p class="eyebrow">Seu dia, hora a hora</p>
          <h2>Arraste o relógio ou aperte o play</h2>
        </div>
        <div class="semana" role="tablist" aria-label="Escolher dia">
          <button
            v-for="d in semana"
            :key="d.chave"
            role="tab"
            :aria-selected="d.chave === dia"
            class="dia-btn"
            :class="{ ativo: d.chave === dia }"
            @click="escolherDia(d.chave)"
          >
            <span class="tiny">{{ d.chave === hoje ? 'Hoje' : d.sem }}</span>
            <strong class="tabular">{{ d.num }}</strong>
            <i :style="{ opacity: d.doses ? 0.35 + d.taxa * 0.65 : 0.12 }" />
          </button>
        </div>
      </header>

      <div class="dia-corpo">
        <div class="relogio-col">
          <RelogioDia v-model:hora="hora" :series="series" :eventos="eventos" :inicio-dia="inicioDia" :hora-agora="horaAgora" @arrastando="(v) => (arrastando = v)" />
          <div class="controles">
            <button class="btn btn-icon btn-ghost" aria-label="Reiniciar" @click="reiniciar"><RotateCcw :size="17" /></button>
            <button class="btn play" :class="{ tocando }" :aria-label="tocando ? 'Pausar' : 'Reproduzir o dia'" @click="alternarReproducao">
              <Transition name="troca" mode="out-in">
                <Pause v-if="tocando" :size="20" />
                <Play v-else :size="20" style="margin-left: 2px" />
              </Transition>
            </button>
            <button class="btn btn-sm velocidade mono" aria-label="Velocidade" @click="velocidade = velocidade === 1 ? 2 : velocidade === 2 ? 4 : 1">{{ velocidade }}×</button>
            <button class="btn btn-sm" :disabled="ehHoje && horaAgora != null && Math.abs(hora - horaAgora) < 0.1" @click="voltarAgora"><Crosshair :size="14" /> Agora</button>
          </div>
          <div class="progresso-dia"><span :style="{ transform: `scaleX(${hora / 24})` }" /></div>
        </div>

        <div class="narrador">
          <div class="atual">
            <Transition name="troca">
              <div v-if="eventoAtual" :key="eventoAtual.id" class="evento-destaque" :style="{ '--c': eventoAtual.cor }">
                <span class="eyebrow">{{ deMinutos(eventoAtual.h * 60) }} · {{ ROTULO_TIPO[eventoAtual.tipo] }}</span>
                <strong>{{ eventoAtual.titulo }}</strong>
                <p class="small muted">{{ eventoAtual.detalhe }}</p>
              </div>
              <div v-else key="vazio" class="evento-destaque">
                <span class="eyebrow">{{ deMinutos(hora * 60) }}</span>
                <strong>Madrugada</strong>
                <p class="small muted">Aperte o play para ver o dia se desenrolar.</p>
              </div>
            </Transition>
            <Transition name="fade" mode="out-in">
              <button v-if="proximoEvento" :key="proximoEvento.id" class="proximo tiny" @click="irPara(proximoEvento.h)">
                <span class="faint">Em {{ duracao(proximoEvento.h - hora) }}</span>
                <span>{{ proximoEvento.titulo }}</span>
                <ChevronRight :size="14" />
              </button>
            </Transition>
          </div>

          <ol ref="lista" class="roteiro">
            <li
              v-for="e in eventos"
              :key="e.id"
              :data-id="e.id"
              :class="[e.tipo, { passou: e.h <= hora + 0.001, atual: eventoAtual?.id === e.id }]"
              :style="{ '--c': e.cor }"
            >
              <button class="ev" @click="irPara(e.h)">
                <span class="hora mono tabular">{{ deMinutos(e.h * 60) }}</span>
                <span class="no" />
                <span class="ev-texto">
                  <span class="ev-titulo">{{ e.titulo }}</span>
                  <span class="tiny faint">{{ ROTULO_TIPO[e.tipo] }}</span>
                </span>
              </button>
              <button v-if="e.tipo === 'dose' || e.tipo === 'registro'" class="btn btn-icon btn-sm btn-ghost apagar" aria-label="Apagar" @click="apagarEvento(e)">
                <Trash2 :size="14" />
              </button>
            </li>
          </ol>
        </div>
      </div>

      <FaixaHoras v-model:hora="hora" :series="series" :eventos="eventos" :hora-agora="horaAgora" class="faixa" />
    </section>
  </div>
</template>

<style scoped>
.hoje {
  display: grid;
  gap: 20px;
}

/* hero */
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
  padding: 14px 2px 6px;
}
.hero-texto {
  display: grid;
  gap: 10px;
  max-width: 640px;
}
.hero h1 {
  font-size: clamp(2.6rem, 7vw, 4.2rem);
  line-height: 0.95;
}
.resumo {
  font-size: 1.02rem;
  max-width: 56ch;
}
.metas {
  gap: 8px;
}
.sequencia {
  color: var(--text);
  background: linear-gradient(90deg, color-mix(in srgb, var(--warning) 22%, transparent), color-mix(in srgb, var(--danger) 18%, transparent), color-mix(in srgb, var(--warning) 22%, transparent));
  background-size: 200% 100%;
  animation: brilho 5s linear infinite;
  border-color: color-mix(in srgb, var(--warning) 30%, transparent);
}
.acoes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.grande {
  height: 52px;
  padding: 0 24px;
  font-size: 0.98rem;
}

/* pergunta */
.perguntas {
  display: grid;
  gap: 10px;
}
.perguntas:empty {
  display: none;
}
.pergunta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-radius: var(--radius);
  border: 1px solid color-mix(in srgb, var(--c) 35%, var(--border));
  background:
    radial-gradient(120% 200% at 0% 50%, color-mix(in srgb, var(--c) 18%, transparent), transparent 60%),
    var(--surface);
  backdrop-filter: blur(16px);
}
.pergunta-texto {
  flex: 1 1 260px;
  display: grid;
  gap: 2px;
}
.sino {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 16%, transparent);
  flex: none;
}
.sino svg {
  animation: balanco 1.4s ease-in-out infinite;
  transform-origin: 50% 10%;
}
.sino i {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid var(--c);
  animation: pulso 2.4s ease-out infinite;
}
.sino i:last-child {
  animation-delay: 1.2s;
}

/* cartões */
.cartoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

/* dia */
.dia {
  display: grid;
  gap: 22px;
  padding: 24px;
  animation: pop-in 0.8s var(--ease-out) 0.25s both;
}
.dia-cab {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}
.dia-cab h2 {
  margin-top: 4px;
}
.semana {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 16px;
  background: var(--surface-2);
  overflow-x: auto;
  scrollbar-width: none;
  max-width: 100%;
}
.dia-btn {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 1px;
  min-width: 46px;
  padding: 6px 4px 10px;
  border-radius: 12px;
  color: var(--text-2);
  transition: background 0.3s, color 0.3s, transform 0.3s var(--ease-spring);
}
.dia-btn strong {
  font-size: 1rem;
  color: var(--text);
  transition: color 0.3s;
}
.dia-btn i {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--success);
}
.dia-btn:hover {
  background: var(--surface-2);
}
.dia-btn.ativo {
  background: var(--text);
  color: var(--bg);
  transform: translateY(-1px);
}
.dia-btn.ativo strong {
  color: var(--bg);
}
.dia-corpo {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}
.relogio-col {
  display: grid;
  gap: 14px;
}
.controles {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.play {
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
  border: 0;
  box-shadow: 0 12px 30px -12px color-mix(in srgb, var(--text) 60%, transparent);
}
.play:hover {
  background: var(--text);
  transform: scale(1.06);
}
.play.tocando {
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--text) 10%, transparent), 0 12px 30px -12px color-mix(in srgb, var(--text) 60%, transparent);
}
.velocidade {
  width: 46px;
  padding: 0;
}
.progresso-dia {
  height: 2px;
  border-radius: 2px;
  background: var(--surface-2);
  overflow: hidden;
  max-width: 320px;
  width: 100%;
  margin: 0 auto;
}
.progresso-dia span {
  display: block;
  height: 100%;
  background: var(--text-2);
  transform-origin: left;
}

/* narrador */
.narrador {
  display: grid;
  gap: 14px;
  align-content: start;
  min-height: 0;
}
.atual {
  display: grid;
  gap: 8px;
}
.atual > .evento-destaque {
  grid-area: 1 / 1;
}
.atual > .proximo {
  grid-area: 2 / 1;
}
.evento-destaque {
  display: grid;
  gap: 6px;
  padding: 18px;
  border-radius: 18px;
  min-height: 132px;
  align-content: start;
  background:
    radial-gradient(140% 120% at 0% 0%, color-mix(in srgb, var(--c, var(--primary)) 20%, transparent), transparent 55%),
    var(--surface-2);
  border: 1px solid color-mix(in srgb, var(--c, var(--primary)) 25%, var(--border));
}
.evento-destaque strong {
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}
.proximo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  text-align: left;
  transition: background 0.2s;
}
.proximo:hover {
  background: var(--surface-2);
}
.proximo span:nth-child(2) {
  flex: 1;
  color: var(--text-2);
}
.roteiro {
  list-style: none;
  margin: 0;
  max-height: 360px;
  overflow-y: auto;
  scrollbar-width: thin;
  position: relative;
  mask: linear-gradient(to bottom, transparent, #000 16px, #000 calc(100% - 24px), transparent);
  padding: 8px 0;
}
.roteiro li {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}
.ev {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 46px 18px 1fr;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: 12px;
  text-align: left;
  opacity: 0.45;
  transition: opacity 0.35s, background 0.3s;
}
.roteiro li.passou .ev {
  opacity: 1;
}
.roteiro li.atual .ev {
  background: var(--surface-2);
}
.ev:hover {
  background: var(--surface-2);
  opacity: 1;
}
.hora {
  font-size: 0.75rem;
  color: var(--text-3);
}
.no {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--c);
  justify-self: center;
  position: relative;
  transition: background 0.3s, transform 0.4s var(--ease-spring), box-shadow 0.3s;
}
.roteiro li:not(:last-child) .no::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 10px;
  width: 1px;
  height: 30px;
  background: var(--border-strong);
  transform: translateX(-50%);
}
.roteiro li.passou .no {
  background: var(--c);
}
.roteiro li.atual .no {
  transform: scale(1.35);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 25%, transparent);
}
.roteiro li.registro .no {
  border-color: #fbbf24;
  background: #fde68a;
}
.ev-texto {
  display: grid;
  min-width: 0;
}
.ev-titulo {
  font-size: 0.86rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.apagar {
  opacity: 0;
  transition: opacity 0.2s;
  flex: none;
}
.roteiro li:hover .apagar,
.apagar:focus-visible {
  opacity: 1;
}
.faixa {
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

@media (max-width: 900px) {
  .dia-corpo {
    grid-template-columns: 1fr;
  }
  .roteiro {
    max-height: 280px;
  }
}
@media (max-width: 560px) {
  .dia {
    padding: 18px 14px;
  }
  .grande {
    flex: 1;
    padding: 0 16px;
  }
  .acoes {
    width: 100%;
  }
  .apagar {
    opacity: 0.6;
  }
  .pergunta {
    padding: 14px;
    gap: 12px;
  }
  .pergunta .extra {
    display: none;
  }
  .pergunta-texto {
    flex-basis: calc(100% - 60px);
  }
  .sino {
    width: 36px;
    height: 36px;
  }
}
</style>
