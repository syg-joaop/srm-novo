<script setup lang="ts">
import { computed, ref } from 'vue'
import { encontrarInteracoes, ROTULO_GRAVIDADE, SUBSTANCIAS, type Participante } from '../data/interacoes'
import { estado, inicioPessoal, medsAtivas, perfilDe, todosPerfis } from '../store'
import { deMinutos, minutosDe } from '../lib/datas'
import { janelasEfeito, ultimoHorarioSeguro } from '../lib/farmaco'

const substancias = ref<string[]>(['cafe'])
const simular = ref<string>('')
const aberta = ref<string | null>(null)

const participantes = computed<Participante[]>(() => {
  const meds = medsAtivas.value.map((m) => {
    const p = perfilDe(m)
    return { id: m.id, nome: m.nome, emoji: p.emoji, etiquetas: [...p.etiquetas, p.id] }
  })
  const subs = SUBSTANCIAS.filter((s) => substancias.value.includes(s.id)).map((s) => ({ id: s.id, nome: s.nome, emoji: s.emoji, etiquetas: s.etiquetas }))
  const sim = todosPerfis().find((p) => p.id === simular.value)
  const extra = sim ? [{ id: 'sim-' + sim.id, nome: `${sim.nome} (simulação)`, emoji: sim.emoji, etiquetas: [...sim.etiquetas, sim.id] }] : []
  return [...meds, ...extra, ...subs]
})

const interacoes = computed(() => encontrarInteracoes(participantes.value))

const contagem = computed(() => {
  const c: Record<string, number> = {}
  for (const i of interacoes.value) c[i.regra.gravidade] = (c[i.regra.gravidade] ?? 0) + 1
  return c
})

function alternar(id: string) {
  substancias.value = substancias.value.includes(id) ? substancias.value.filter((s) => s !== id) : [...substancias.value, id]
}

/* ---------- mapa de horários ---------- */

const barras = computed(() => {
  const lista: { chave: string; nome: string; cor: string; emoji: string; hora: string; inicio: [number, number]; pico: [number, number]; fim: [number, number]; dose: number }[] = []
  for (const m of medsAtivas.value) {
    const p = perfilDe(m)
    const j = janelasEfeito(p, false, inicioPessoal(m.id))
    for (const h of m.horarios) {
      const d = minutosDe(h) / 60
      lista.push({
        chave: m.id + h,
        nome: m.nome,
        cor: m.cor,
        emoji: p.emoji,
        hora: h,
        dose: d,
        inicio: [d + j.inicio[0], d + j.inicio[1]],
        pico: [d + j.pico[0], d + j.pico[1]],
        fim: [d + j.duracao[0], d + j.duracao[1]],
      })
    }
  }
  return lista
})

const dormir = computed(() => minutosDe(estado.preferencias.dormir) / 60)
const acordar = computed(() => minutosDe(estado.preferencias.acordar) / 60)
const pct = (h: number) => `${(Math.min(30, Math.max(0, h)) / 30) * 100}%`

const alertasHorario = computed(() => {
  const r: { texto: string; emoji: string }[] = []
  for (const m of medsAtivas.value) {
    const p = perfilDe(m)
    const lim = ultimoHorarioSeguro(p, minutosDe(estado.preferencias.dormir))
    if (lim == null) continue
    for (const h of m.horarios) {
      if (minutosDe(h) > lim) r.push({ emoji: '🌙', texto: `${m.nome} às ${h} pode atrapalhar o sono. O ideal é tomar até as ${deMinutos(lim)}.` })
    }
    if (!m.horarios.some((h) => minutosDe(h) > lim)) r.push({ emoji: '✅', texto: `${m.nome}: horário compatível com dormir às ${estado.preferencias.dormir} (limite ${deMinutos(lim)}).` })
  }
  const estim = barras.value.filter((b) => b.pico[1] - b.pico[0] > 0)
  if (estim.length > 1) {
    const picos = estim.map((b) => `${b.emoji} ${b.nome} ${deMinutos(b.pico[0] * 60)}–${deMinutos(Math.min(b.pico[1], 24) * 60)}`)
    r.push({ emoji: '🔥', texto: `Picos previstos: ${picos.join(' · ')}. Se os picos coincidirem e surgir ansiedade ou taquicardia, vale conversar com o médico sobre espaçar as doses.` })
  }
  return r
})
</script>

<template>
  <div class="stack">
    <section class="entrar">
      <h2>Interações e horários</h2>
      <p class="small muted">Como suas medicações conversam entre si, com o que você consome e ao longo do dia.</p>
    </section>

    <section class="card entrar" style="animation-delay: 0.05s">
      <h3 style="margin-bottom: 4px">⏱️ Mapa de funcionamento do dia</h3>
      <p class="small muted" style="margin-bottom: 14px">Baseado nos horários planejados e no seu início pessoal, quando já houver registros.</p>
      <div class="gantt">
        <div class="camada">
          <span v-for="h in [0, 6, 12, 18, 24, 30]" :key="h" class="marca tiny faint" :style="{ left: pct(h) }">{{ String(h % 24).padStart(2, '0') }}h</span>
          <div class="sono" :style="{ left: pct(dormir), width: `calc(${pct(acordar + 24)} - ${pct(dormir)})` }"><span class="tiny">🌙</span></div>
        </div>
        <div v-for="(b, i) in barras" :key="b.chave" class="linha" :style="{ '--cor': b.cor, '--i': i }">
          <span class="rotulo small"><span>{{ b.emoji }}</span> {{ b.nome }} <span class="faint tiny">{{ b.hora }}</span></span>
          <div class="trilho">
            <span class="seg total" :style="{ left: pct(b.dose), width: `calc(${pct(b.fim[1])} - ${pct(b.dose)})` }" />
            <span class="seg forte" :style="{ left: pct(b.inicio[1]), width: `calc(${pct(b.fim[0])} - ${pct(b.inicio[1])})` }" />
            <span class="seg janela" :style="{ left: pct(b.inicio[0]), width: `calc(${pct(b.inicio[1])} - ${pct(b.inicio[0])})` }" />
            <span class="seg pico" :style="{ left: pct(b.pico[0]), width: `calc(${pct(b.pico[1])} - ${pct(b.pico[0])})` }" />
            <span class="pilula" :style="{ left: pct(b.dose) }">💊</span>
          </div>
        </div>
      </div>
      <div class="legenda tiny muted">
        <span><i class="l-janela" /> começa</span><span><i class="l-forte" /> efeito ativo</span><span><i class="l-pico" /> pico</span><span><i class="l-total" /> saindo do corpo</span>
      </div>
      <ul class="alertas stagger">
        <li v-for="(a, i) in alertasHorario" :key="i" class="small"><span>{{ a.emoji }}</span> {{ a.texto }}</li>
      </ul>
    </section>

    <section class="card entrar" style="animation-delay: 0.1s">
      <h3 style="margin-bottom: 8px">🔎 Verificar com</h3>
      <div class="row wrap" style="gap: 6px">
        <span v-for="m in medsAtivas" :key="m.id" class="chip fixo" :style="{ '--cor': m.cor }">{{ perfilDe(m).emoji }} {{ m.nome }}</span>
        <button v-for="s in SUBSTANCIAS" :key="s.id" class="chip sub" :class="{ on: substancias.includes(s.id) }" @click="alternar(s.id)">{{ s.emoji }} {{ s.nome }}</button>
      </div>
      <label style="margin-top: 12px">
        Simular outra medicação
        <select v-model="simular">
          <option value="">— nenhuma —</option>
          <option v-for="p in todosPerfis()" :key="p.id" :value="p.id">{{ p.emoji }} {{ p.nome }}</option>
        </select>
      </label>
    </section>

    <section class="stack">
      <div class="row wrap resumo">
        <Transition name="fade" mode="out-in">
          <span v-if="!interacoes.length" key="ok" class="chip ok">✅ Nenhuma interação conhecida entre os itens selecionados</span>
          <span v-else key="n" class="row wrap" style="gap: 6px">
            <span v-for="(n, g) in contagem" :key="g" class="chip grav" :class="'gravidade-' + g">{{ n }} {{ ROTULO_GRAVIDADE[g as keyof typeof ROTULO_GRAVIDADE] }}</span>
          </span>
        </Transition>
      </div>

      <TransitionGroup name="lista" tag="div" class="stack">
        <article
          v-for="i in interacoes"
          :key="i.regra.id + i.x.id + i.y.id"
          class="card interacao"
          :class="['gravidade-' + i.regra.gravidade, { aberta: aberta === i.regra.id + i.x.id + i.y.id }]"
        >
          <button class="topo" @click="aberta = aberta === i.regra.id + i.x.id + i.y.id ? null : i.regra.id + i.x.id + i.y.id">
            <span class="par">
              <span class="bolha">{{ i.x.emoji }}</span>
              <span class="conector" />
              <span class="bolha">{{ i.y.emoji }}</span>
            </span>
            <span style="flex: 1; text-align: left; min-width: 0">
              <span class="tag">{{ ROTULO_GRAVIDADE[i.regra.gravidade] }}</span>
              <strong style="display: block">{{ i.regra.titulo }}</strong>
              <span class="tiny faint">{{ i.x.nome }} + {{ i.y.nome }}</span>
            </span>
            <span class="seta">⌄</span>
          </button>
          <div class="corpo-wrap">
            <div class="corpo">
              <p class="small">{{ i.regra.descricao }}</p>
              <p class="small conduta">👉 {{ i.regra.conduta }}</p>
            </div>
          </div>
        </article>
      </TransitionGroup>
      <p class="tiny faint" style="text-align: center">Informação educativa. Nunca ajuste doses por conta própria; converse com seu médico ou farmacêutico.</p>
    </section>
  </div>
</template>

<style scoped>
.gantt {
  position: relative;
  padding-top: 22px;
  display: grid;
  gap: 10px;
}
.camada {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 160px;
  right: 0;
  pointer-events: none;
}
.marca {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
}
.marca:first-child {
  transform: none;
}
.sono {
  position: absolute;
  top: 18px;
  bottom: 0;
  background: var(--sleep);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  padding-top: 2px;
}
.linha {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 10px;
  align-items: center;
  animation: pop-in 0.5s var(--ease-out) both;
  animation-delay: calc(var(--i) * 80ms + 0.2s);
}
.rotulo {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}
.trilho {
  position: relative;
  height: 26px;
}
.seg {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) scaleX(0);
  transform-origin: left;
  border-radius: 999px;
  animation: esticar 0.9s var(--ease-out) forwards;
  animation-delay: calc(var(--i) * 80ms + 0.35s);
}
.seg.total {
  height: 6px;
  background: color-mix(in srgb, var(--cor) 25%, transparent);
}
.seg.forte {
  height: 14px;
  background: color-mix(in srgb, var(--cor) 45%, transparent);
}
.seg.janela {
  height: 14px;
  background: repeating-linear-gradient(45deg, var(--cor) 0 3px, transparent 3px 6px);
}
.seg.pico {
  height: 20px;
  background: var(--cor);
  box-shadow: 0 4px 14px -4px var(--cor);
}
.pilula {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.9rem;
  animation: pop-in 0.4s var(--ease-spring) both;
  animation-delay: calc(var(--i) * 80ms + 0.3s);
}
@keyframes esticar {
  to {
    transform: translateY(-50%) scaleX(1);
  }
}
@media (max-width: 560px) {
  .linha {
    grid-template-columns: 1fr;
    gap: 2px;
  }
  .camada {
    left: 0;
  }
}
.legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}
.legenda i {
  display: inline-block;
  width: 16px;
  height: 8px;
  border-radius: 4px;
  margin-right: 4px;
  vertical-align: middle;
}
.l-janela {
  background: repeating-linear-gradient(45deg, var(--primary) 0 2px, transparent 2px 4px);
}
.l-forte {
  background: color-mix(in srgb, var(--primary) 45%, transparent);
}
.l-pico {
  background: var(--primary);
}
.l-total {
  background: color-mix(in srgb, var(--primary) 20%, transparent);
}
.alertas {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: grid;
  gap: 8px;
}
.alertas li {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--surface-2);
}
.fixo {
  background: color-mix(in srgb, var(--cor) 16%, transparent);
  color: var(--text);
}
.sub {
  cursor: pointer;
  transition: transform 0.25s var(--ease-spring), background 0.2s;
}
.sub.on {
  background: var(--primary);
  color: #fff;
  border-color: transparent;
  transform: scale(1.04);
}
.ok {
  background: color-mix(in srgb, var(--success) 14%, transparent);
  color: var(--text);
}
.grav {
  background: color-mix(in srgb, var(--g) 16%, transparent);
  color: var(--g);
  border-color: transparent;
}
.interacao {
  padding: 0;
  overflow: hidden;
  border-left: 4px solid var(--g);
}
.topo {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
}
.par {
  display: flex;
  align-items: center;
  flex: none;
}
.bolha {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--surface-2);
  border: 2px solid color-mix(in srgb, var(--g) 50%, transparent);
  font-size: 1.05rem;
  position: relative;
  z-index: 1;
}
.conector {
  width: 14px;
  height: 3px;
  background: var(--g);
  margin: 0 -2px;
  animation: pulsar-linha 1.6s ease-in-out infinite;
}
@keyframes pulsar-linha {
  50% {
    opacity: 0.3;
  }
}
.tag {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--g);
}
.seta {
  color: var(--text-3);
  transition: transform 0.35s var(--ease-out);
}
.aberta .seta {
  transform: rotate(180deg);
}
.corpo-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s var(--ease-out);
}
.aberta .corpo-wrap {
  grid-template-rows: 1fr;
}
.corpo {
  overflow: hidden;
  padding: 0 16px;
  display: grid;
  gap: 8px;
}
.aberta .corpo {
  padding-bottom: 16px;
}
.conduta {
  padding: 10px 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--g) 10%, transparent);
}
</style>
