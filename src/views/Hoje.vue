<script setup lang="ts">
import { computed } from 'vue'
import AnelFase from '../components/AnelFase.vue'
import CurvaDia from '../components/CurvaDia.vue'
import { adesaoDoDia, agora, avisar, efeitosDoDia, estado, medPorId, medsAtivas, registrarEfeito, removerDose, dosesDoDia, sequencia, statusDe, type StatusMed } from '../store'
import { chaveDia, dataLonga, duracao, hhmm, HORA, saudacao } from '../lib/datas'
import { ROTULO_FASE } from '../lib/farmaco'
import { ui } from '../ui'

const hoje = computed(() => chaveDia(agora.value))
const status = computed(() => medsAtivas.value.map((m) => statusDe(m, agora.value)))
const adesao = computed(() => adesaoDoDia(hoje.value))
const dosesHoje = computed(() => dosesDoDia(hoje.value))
const efeitosHoje = computed(() => efeitosDoDia(hoje.value))

/** Medicações na janela de início que ainda não tiveram o início registrado. */
const perguntas = computed(() =>
  status.value.filter(
    (s) =>
      s.dose &&
      (s.fase === 'janela' || s.fase === 'subindo') &&
      !s.sentiuInicio &&
      !estado.perguntasRespondidas.includes(s.dose.id),
  ),
)

function sentiAgora(s: StatusMed) {
  registrarEfeito({ em: new Date().toISOString(), medId: s.med.id, tipo: 'inicio', foco: 3, humor: 3, energia: 3, ansiedade: 2, sintomas: [], nota: '' })
  avisar(`${s.med.nome}: início registrado ${duracao(s.horasDesde)} após a dose`, '✨')
}

function aindaNao(s: StatusMed) {
  if (s.dose) estado.perguntasRespondidas.push(s.dose.id)
}

function descricao(s: StatusMed): string {
  if (s.fase === 'sem-dose') {
    if (s.nivel > 0.05) return `Ainda há ${Math.round(s.nivel * 100)}% no organismo das doses anteriores`
    return s.proximoHorario ? `Próxima dose às ${s.proximoHorario}` : 'Sem doses planejadas'
  }
  const j = s.janelas!
  const t = s.horasDesde
  const base = +new Date(s.dose!.em)
  switch (s.fase) {
    case 'aguardando':
      return `Início previsto em ${duracao(j.inicio[0] - t)} (≈ ${hhmm(base + j.inicio[0] * HORA)})`
    case 'janela':
      return s.sentiuInicio ? 'Você já sentiu o início ✨' : 'Deve começar a qualquer momento'
    case 'subindo':
      return `Pico em ~${duracao(Math.max(0, j.pico[0] - t))}`
    case 'pico':
      return `Pico até ≈ ${hhmm(base + j.pico[1] * HORA)}`
    case 'ativo':
      return `Começa a cair por volta das ${hhmm(base + j.duracao[0] * HORA)}`
    case 'diminuindo':
      return 'Efeito indo embora, então é normal cansaço ou irritabilidade (rebote)'
    default:
      return s.proximoHorario ? `Dose de hoje pendente (${s.proximoHorario})` : 'Efeito da última dose já passou'
  }
}

function diaTratamento(s: StatusMed) {
  const t = s.perfil.efeitoTerapeutico
  if (!t) return null
  const dias = Math.floor((agora.value - new Date(s.med.inicioTratamento + 'T00:00').getTime()) / (24 * HORA)) + 1
  const pleno = t.plenoSemanas[1] * 7
  return { dias, pct: Math.min(1, dias / pleno), inicio: t.inicioSemanas, pleno: t.plenoSemanas, equilibrio: s.perfil.equilibrioDias }
}

function quandoTomou(em: string) {
  return chaveDia(em) === hoje.value ? `às ${hhmm(em)}` : `ontem às ${hhmm(em)}`
}

const emojiTipo = { inicio: '✨', pico: '🔥', fim: '🌅', check: '📝' } as const

const linhaDoTempo = computed(() => {
  const itens = [
    ...dosesHoje.value.map((d) => ({ id: d.id, em: d.em, tipo: 'dose' as const, med: medPorId(d.medId), texto: `${d.doseMg} mg${d.comAlimento ? ' · com refeição' : ''}` })),
    ...efeitosHoje.value.map((e) => ({
      id: e.id,
      em: e.em,
      tipo: e.tipo,
      med: medPorId(e.medId),
      texto: `Foco ${e.foco} · Humor ${e.humor} · Energia ${e.energia}${e.sintomas.length ? ' · ' + e.sintomas.join(', ') : ''}`,
    })),
  ]
  return itens.sort((a, b) => +new Date(b.em) - +new Date(a.em))
})
</script>

<template>
  <div class="stack">
    <section class="hero entrar">
      <div>
        <p class="small muted">{{ dataLonga(agora) }}</p>
        <h1>{{ saudacao(new Date(agora)) }}{{ estado.preferencias.nome ? ', ' + estado.preferencias.nome : '' }} 👋</h1>
        <div class="row wrap" style="margin-top: 10px">
          <span class="chip">💊 {{ adesao.tomadas }}/{{ adesao.planejadas }} doses hoje</span>
          <span v-if="sequencia" class="chip fogo">🔥 {{ sequencia }} {{ sequencia === 1 ? 'dia' : 'dias' }} seguidos</span>
        </div>
      </div>
      <div class="acoes">
        <button class="btn btn-primary grande" @click="ui.modalDose = {}">💊 Tomei agora</button>
        <button class="btn grande" @click="ui.modalEfeito = {}">✨ Senti o efeito</button>
      </div>
    </section>

    <TransitionGroup name="lista" tag="div" class="stack" style="gap: 10px">
      <div v-for="s in perguntas" :key="'q' + s.dose!.id" class="pergunta card" :style="{ '--cor': s.med.cor }">
        <span class="sino">🔔</span>
        <div style="flex: 1">
          <strong>{{ s.med.nome }} está na janela de início</strong>
          <p class="small muted">Tomado há {{ duracao(s.horasDesde) }}. Já sentiu o efeito?</p>
        </div>
        <div class="row">
          <button class="btn btn-sm btn-primary" @click="sentiAgora(s)">Sim, agora</button>
          <button class="btn btn-sm" @click="ui.modalEfeito = { medId: s.med.id, tipo: 'inicio' }">Outra hora</button>
          <button class="btn btn-sm btn-ghost" @click="aindaNao(s)">Ainda não</button>
        </div>
      </div>
    </TransitionGroup>

    <div class="status-grid stagger">
      <article v-for="s in status" :key="s.med.id" class="card status" :style="{ '--cor': s.med.cor }">
        <AnelFase :status="s" />
        <div class="info">
          <div class="row between wrap" style="align-items: flex-start; gap: 6px">
            <div>
              <h3>{{ s.med.nome }}</h3>
              <p class="tiny faint">{{ s.med.doseMg }} mg · {{ s.perfil.nome }}</p>
            </div>
            <span class="fase" :class="s.fase">{{ s.fase === 'sem-dose' ? 'Não tomado' : ROTULO_FASE[s.fase] }}</span>
          </div>
          <p class="small" style="margin-top: 8px">{{ descricao(s) }}</p>
          <p v-if="s.dose" class="tiny faint" style="margin-top: 4px">Tomado {{ quandoTomou(s.dose.em) }} · há {{ duracao(s.horasDesde) }}</p>

          <div v-if="diaTratamento(s)" class="tratamento">
            <div class="row between tiny">
              <span>Dia {{ diaTratamento(s)!.dias }} de tratamento</span>
              <span class="faint">efeito pleno: {{ diaTratamento(s)!.pleno[0] }}–{{ diaTratamento(s)!.pleno[1] }} sem.</span>
            </div>
            <div class="barra"><span :style="{ width: diaTratamento(s)!.pct * 100 + '%' }" /></div>
            <p class="tiny faint">
              {{
                diaTratamento(s)!.dias < (diaTratamento(s)!.equilibrio ?? 0)
                  ? `Nível ainda subindo: estabiliza em ~${diaTratamento(s)!.equilibrio} dias`
                  : diaTratamento(s)!.dias < diaTratamento(s)!.inicio[0] * 7
                    ? `Melhora do humor costuma começar em ${diaTratamento(s)!.inicio[0]}–${diaTratamento(s)!.inicio[1]} semanas`
                    : 'Já na fase em que o efeito terapêutico costuma aparecer'
              }}
            </p>
          </div>

          <div class="row" style="margin-top: 10px">
            <button v-if="s.fase === 'sem-dose' || s.fase === 'encerrado'" class="btn btn-sm" @click="ui.modalDose = { medId: s.med.id }">+ Dose</button>
            <button v-if="s.dose" class="btn btn-sm btn-ghost" @click="ui.modalEfeito = { medId: s.med.id, tipo: s.sentiuInicio ? 'check' : 'inicio' }">
              {{ s.sentiuInicio ? '📝 Check-in' : '✨ Senti' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <section class="card entrar" style="animation-delay: 0.2s">
      <div class="row between wrap" style="margin-bottom: 10px">
        <div>
          <h3>Seu dia em curvas</h3>
          <p class="small muted">Nível estimado de cada medicação e janelas previstas. Toque no gráfico para explorar.</p>
        </div>
        <div class="row wrap tiny">
          <span v-for="m in medsAtivas" :key="m.id" class="row" style="gap: 6px"><span class="bola" :style="{ background: m.cor }" />{{ m.nome }}</span>
        </div>
      </div>
      <CurvaDia :dia="hoje" :altura="270" />
    </section>

    <section class="card entrar" style="animation-delay: 0.3s">
      <h3 style="margin-bottom: 10px">Linha do tempo de hoje</h3>
      <p v-if="!linhaDoTempo.length" class="small muted">Nada registrado ainda. Toque em <strong>Tomei agora</strong> quando tomar a primeira dose.</p>
      <TransitionGroup name="lista" tag="ul" class="timeline">
        <li v-for="i in linhaDoTempo" :key="i.id" :style="{ '--cor': i.med?.cor ?? 'var(--primary)' }">
          <span class="hora tabular">{{ hhmm(i.em) }}</span>
          <span class="no">{{ i.tipo === 'dose' ? '💊' : emojiTipo[i.tipo] }}</span>
          <div style="flex: 1; min-width: 0">
            <strong class="small">{{ i.tipo === 'dose' ? `Tomou ${i.med?.nome ?? ''}` : i.tipo === 'inicio' ? `Sentiu ${i.med?.nome ?? 'o efeito'} começar` : i.tipo === 'pico' ? `Pico ${i.med?.nome ?? ''}` : i.tipo === 'fim' ? `Efeito ${i.med?.nome ?? ''} passando` : 'Check-in' }}</strong>
            <p class="tiny faint">{{ i.texto }}</p>
          </div>
          <button v-if="i.tipo === 'dose'" class="btn btn-ghost btn-sm" aria-label="Remover dose" @click="removerDose(i.id)">✕</button>
        </li>
      </TransitionGroup>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  padding: 6px 2px;
}
.hero h1 {
  font-size: clamp(1.5rem, 4vw, 2.1rem);
  margin-top: 2px;
}
.acoes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.grande {
  padding: 14px 22px;
  font-size: 1rem;
}
.fogo {
  background: linear-gradient(90deg, #fde68a, #fca5a5, #fde68a);
  background-size: 200% 100%;
  animation: brilho 4s linear infinite;
  color: #7c2d12;
  border-color: transparent;
}
.pergunta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  border-left: 4px solid var(--cor);
  background: linear-gradient(90deg, color-mix(in srgb, var(--cor) 14%, transparent), var(--surface));
}
.sino {
  font-size: 1.6rem;
  display: inline-block;
  animation: balanco 1.2s ease-in-out infinite;
  transform-origin: top center;
}
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
}
.status {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
  transition: transform 0.35s var(--ease-spring), box-shadow 0.3s;
}
.status::before {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: var(--cor);
  opacity: 0.1;
  filter: blur(40px);
  top: -60px;
  left: -40px;
  pointer-events: none;
}
.status:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
.info {
  flex: 1;
  min-width: 0;
}
.fase {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cor) 16%, transparent);
  color: var(--cor);
  white-space: nowrap;
}
.fase.janela,
.fase.pico {
  background: var(--cor);
  color: #fff;
  box-shadow: 0 0 0 0 var(--cor);
  animation: brilhar 2s infinite;
}
.fase.sem-dose,
.fase.encerrado {
  background: var(--surface-2);
  color: var(--text-3);
}
@keyframes brilhar {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--cor) 60%, transparent);
  }
  100% {
    box-shadow: 0 0 0 10px transparent;
  }
}
.tratamento {
  margin-top: 10px;
  display: grid;
  gap: 5px;
}
.barra {
  height: 8px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}
.barra span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--cor), color-mix(in srgb, var(--cor) 50%, #fff));
  animation: crescer 1.4s var(--ease-out);
}
@keyframes crescer {
  from {
    width: 0 !important;
  }
}
.bola {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
  position: relative;
}
.timeline li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 4px;
  position: relative;
}
.timeline .hora {
  width: 44px;
  font-size: 0.8rem;
  color: var(--text-3);
  font-weight: 600;
}
.timeline .no {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--cor) 16%, transparent);
  flex: none;
  position: relative;
  z-index: 1;
}
.timeline li:not(:last-child) .no::after {
  content: '';
  position: absolute;
  top: 34px;
  left: 50%;
  width: 2px;
  height: 20px;
  background: var(--border);
  transform: translateX(-50%);
}
</style>
