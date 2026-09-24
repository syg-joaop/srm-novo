<script setup lang="ts">
import { CalendarDays, Minus, Sunset, TrendingDown, TrendingUp, Utensils } from 'lucide-vue-next'
import MedIcone from '../components/MedIcone.vue'
import { computed } from 'vue'
import Numero from '../components/Numero.vue'
import { estado, perfilDe, sequencia, temposPessoais } from '../store'
import { chaveDia, deChave, duracao, faixaHoras, inicioDoDia, somarDias } from '../lib/datas'
import { mediana } from '../lib/farmaco'
import { ui } from '../ui'

const porMed = computed(() =>
  estado.medicacoes.map((med) => {
    const perfil = perfilDe(med)
    const inicios = temposPessoais(med.id, 'inicio')
    const fins = temposPessoais(med.id, 'fim')
    const comida = (v: boolean) =>
      mediana(inicios.filter((i) => estado.doses.find((d) => d.id === i.doseId)?.comAlimento === v).map((i) => i.horas))
    const horas = inicios.map((i) => i.horas)
    const escala = Math.max(perfil.efeito.inicioH[1] + perfil.atrasoComAlimentoH + 1, ...horas, 2)
    return {
      med,
      perfil,
      inicios,
      mediana: mediana(horas),
      min: horas.length ? Math.min(...horas) : null,
      max: horas.length ? Math.max(...horas) : null,
      duracao: mediana(fins.map((f) => f.horas)),
      comComida: comida(true),
      semComida: comida(false),
      escala,
      tendencia: tendencia(inicios.map((i) => i.horas)),
    }
  }),
)

function tendencia(v: number[]) {
  if (v.length < 4) return null
  const meio = Math.floor(v.length / 2)
  const a = mediana(v.slice(0, meio))!
  const b = mediana(v.slice(meio))!
  return b - a
}

function linhaTempo(pontos: { horas: number }[], w = 280, h = 70) {
  if (pontos.length < 2) return ''
  const max = Math.max(...pontos.map((p) => p.horas)) * 1.15
  const min = Math.min(...pontos.map((p) => p.horas)) * 0.85
  return pontos
    .map((p, i) => `${i ? 'L' : 'M'}${((i / (pontos.length - 1)) * w).toFixed(1)},${(h - ((p.horas - min) / (max - min || 1)) * h).toFixed(1)}`)
    .join('')
}

/* ---------- humor por semana ---------- */

const semanas = computed(() => {
  const hoje = inicioDoDia(Date.now())
  const lista: { rotulo: string; humor: number | null; foco: number | null; energia: number | null }[] = []
  for (let s = 7; s >= 0; s--) {
    const fim = somarDias(hoje, -s * 7)
    const ini = somarDias(fim, -6)
    const regs = estado.efeitos.filter((e) => {
      const k = chaveDia(e.em)
      return k >= chaveDia(ini) && k <= chaveDia(fim)
    })
    const media = (c: 'humor' | 'foco' | 'energia') => (regs.length ? regs.reduce((t, e) => t + e[c], 0) / regs.length : null)
    lista.push({ rotulo: `${ini.getDate()}/${ini.getMonth() + 1}`, humor: media('humor'), foco: media('foco'), energia: media('energia') })
  }
  return lista
})

/* ---------- ao longo do dia ---------- */

const porHora = computed(() => {
  const buckets = Array.from({ length: 24 }, () => ({ foco: 0, energia: 0, n: 0 }))
  for (const e of estado.efeitos) {
    const h = new Date(e.em).getHours()
    buckets[h].foco += e.foco
    buckets[h].energia += e.energia
    buckets[h].n++
  }
  return buckets.map((b, h) => ({ h, foco: b.n ? b.foco / b.n : 0, energia: b.n ? b.energia / b.n : 0, n: b.n })).filter((b) => b.h >= 5)
})

const melhorHora = computed(() => {
  const com = porHora.value.filter((b) => b.n >= 2)
  if (!com.length) return null
  return com.reduce((a, b) => (b.foco > a.foco ? b : a))
})

const sintomas = computed(() => {
  const c = new Map<string, number>()
  for (const e of estado.efeitos) for (const s of e.sintomas) c.set(s, (c.get(s) ?? 0) + 1)
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
})

const totalRegistros = computed(() => estado.efeitos.length)
const diasComDose = computed(() => new Set(estado.doses.map((d) => chaveDia(d.em))).size)
const primeiroDia = computed(() => {
  const d = [...estado.doses].sort((a, b) => +new Date(a.em) - +new Date(b.em))[0]
  return d ? deChave(chaveDia(d.em)) : null
})

function pctEscala(h: number, escala: number) {
  return `${Math.min(100, (h / escala) * 100)}%`
}
</script>

<template>
  <div class="stack">
    <section class="entrar">
      <h2>Seus padrões</h2>
      <p class="small muted">Quanto mais você registra “senti o efeito”, mais preciso fica o seu perfil.</p>
    </section>

    <div class="kpis stagger">
      <div class="card kpi">
        <span class="tiny faint">Dias acompanhados</span>
        <strong><Numero :valor="diasComDose" /></strong>
        <span v-if="primeiroDia" class="tiny faint">desde {{ primeiroDia.toLocaleDateString('pt-BR') }}</span>
      </div>
      <div class="card kpi">
        <span class="tiny faint">Registros de efeito</span>
        <strong><Numero :valor="totalRegistros" /></strong>
      </div>
      <div class="card kpi">
        <span class="tiny faint">Sequência atual</span>
        <strong><Numero :valor="sequencia" /> <span class="small">dias</span></strong>
      </div>
      <div class="card kpi">
        <span class="tiny faint">Melhor horário de foco</span>
        <strong>{{ melhorHora ? String(melhorHora.h).padStart(2, '0') + 'h' : '—' }}</strong>
        <span v-if="melhorHora" class="tiny faint">foco médio {{ melhorHora.foco.toFixed(1) }}</span>
      </div>
    </div>

    <p v-if="!totalRegistros" class="card small muted vazio">
      Ainda não há registros. Depois de tomar a dose, toque em <strong>Senti o efeito</strong> quando perceber que começou. Para ver um exemplo agora, gere dados de
      exemplo em <button class="link" @click="ui.modalAjustes = true">Ajustes</button>.
    </p>

    <article v-for="(m, idx) in porMed" :key="m.med.id" class="card med entrar" :style="{ '--cor': m.med.cor, animationDelay: 0.1 + idx * 0.08 + 's' }">
      <header class="row between wrap">
        <div class="row">
          <MedIcone :perfil="m.perfil" :cor="m.med.cor" :tamanho="44" />
          <div>
            <h3>{{ m.med.nome }}</h3>
            <p class="tiny faint">{{ m.inicios.length }} registro(s) de início</p>
          </div>
        </div>
        <div class="destaque">
          <span class="tiny faint">Seu início típico</span>
          <strong>{{ m.mediana != null ? duracao(m.mediana) : '—' }}</strong>
          <span class="tiny faint">referência {{ faixaHoras(m.perfil.efeito.inicioH) }}</span>
        </div>
      </header>

      <div class="regua">
        <div class="ref" :style="{ left: pctEscala(m.perfil.efeito.inicioH[0], m.escala), width: `calc(${pctEscala(m.perfil.efeito.inicioH[1], m.escala)} - ${pctEscala(m.perfil.efeito.inicioH[0], m.escala)})` }">
          <span class="tiny">bula</span>
        </div>
        <div v-if="m.min != null && m.max != null" class="faixa-pessoal" :style="{ left: pctEscala(m.min, m.escala), width: `calc(${pctEscala(m.max, m.escala)} - ${pctEscala(m.min, m.escala)})` }" />
        <span v-for="(p, i) in m.inicios" :key="i" class="ponto" :style="{ left: pctEscala(p.horas, m.escala), '--i': i }" :title="duracao(p.horas)" />
        <span v-if="m.mediana != null" class="mediana" :style="{ left: pctEscala(m.mediana, m.escala) }"><span class="tiny">você</span></span>
        <div class="eixo tiny faint">
          <span>dose</span>
          <span>{{ duracao(m.escala / 2) }}</span>
          <span>{{ duracao(m.escala) }}</span>
        </div>
      </div>

      <div class="fatos">
        <div v-if="m.semComida != null || m.comComida != null" class="fato">
          <Utensils :size="16" class="ic" />
          <span class="small">
            Em jejum: <strong>{{ m.semComida != null ? duracao(m.semComida) : '—' }}</strong> · com refeição: <strong>{{ m.comComida != null ? duracao(m.comComida) : '—' }}</strong>
          </span>
        </div>
        <div v-if="m.duracao != null" class="fato">
          <Sunset :size="16" class="ic" />
          <span class="small">Efeito costuma passar <strong>{{ duracao(m.duracao) }}</strong> após a dose (referência {{ faixaHoras(m.perfil.efeito.duracaoH) }})</span>
        </div>
        <div v-if="m.tendencia != null" class="fato">
          <component :is="Math.abs(m.tendencia) < 0.15 ? Minus : m.tendencia < 0 ? TrendingDown : TrendingUp" :size="16" class="ic" />
          <span class="small">
            {{ Math.abs(m.tendencia) < 0.15 ? 'Seu tempo de início está estável' : m.tendencia < 0 ? `Começando ${duracao(-m.tendencia)} mais cedo que antes` : `Começando ${duracao(m.tendencia)} mais tarde que antes` }}
          </span>
        </div>
        <div v-if="m.perfil.efeitoTerapeutico && !m.inicios.length" class="fato">
          <CalendarDays :size="16" class="ic" />
          <span class="small">No caso de {{ m.perfil.nome }}, o mais importante é acompanhar o humor semana a semana, no gráfico abaixo.</span>
        </div>
      </div>

      <svg v-if="m.inicios.length > 1" viewBox="0 0 280 70" class="spark" preserveAspectRatio="none">
        <path :d="linhaTempo(m.inicios)" fill="none" :stroke="m.med.cor" stroke-width="2" pathLength="1" />
      </svg>
      <p v-if="m.inicios.length > 1" class="tiny faint">Tempo até o início em cada registro (mais baixo = mais rápido)</p>
    </article>

    <section class="card entrar" style="animation-delay: 0.3s">
      <h3>Humor, foco e energia por semana</h3>
      <p class="small muted" style="margin-bottom: 14px">É aqui que o efeito de antidepressivos como a bupropiona aparece, ao longo de semanas.</p>
      <div class="semanas">
        <div v-for="(s, i) in semanas" :key="i" class="coluna" :style="{ '--i': i }">
          <div class="barras">
            <span class="b humor" :style="{ height: s.humor ? (s.humor / 5) * 100 + '%' : '0' }" :title="`Humor ${s.humor?.toFixed(1) ?? '—'}`" />
            <span class="b foco" :style="{ height: s.foco ? (s.foco / 5) * 100 + '%' : '0' }" :title="`Foco ${s.foco?.toFixed(1) ?? '—'}`" />
            <span class="b energia" :style="{ height: s.energia ? (s.energia / 5) * 100 + '%' : '0' }" :title="`Energia ${s.energia?.toFixed(1) ?? '—'}`" />
          </div>
          <span class="tiny faint">{{ s.rotulo }}</span>
        </div>
      </div>
      <div class="legenda tiny muted"><span><i class="humor" /> humor</span><span><i class="foco" /> foco</span><span><i class="energia" /> energia</span></div>
    </section>

    <div class="grid-2">
      <section class="card entrar" style="animation-delay: 0.35s">
        <h3 style="margin-bottom: 12px">Foco ao longo do dia</h3>
        <div class="horas">
          <div v-for="b in porHora" :key="b.h" class="hora" :style="{ '--i': b.h }">
            <span class="b" :style="{ height: b.n ? (b.foco / 5) * 100 + '%' : '2px', opacity: b.n ? 1 : 0.25 }" :title="`${b.h}h: foco ${b.foco.toFixed(1)} (${b.n})`" />
            <span v-if="b.h % 3 === 0" class="tiny faint">{{ b.h }}h</span>
          </div>
        </div>
      </section>
      <section class="card entrar" style="animation-delay: 0.4s">
        <h3 style="margin-bottom: 12px">Sintomas mais frequentes</h3>
        <p v-if="!sintomas.length" class="small faint">Nenhum sintoma registrado.</p>
        <div class="stack" style="gap: 8px">
          <div v-for="([s, n], i) in sintomas" :key="s" class="sintoma" :style="{ '--i': i }">
            <span class="small" style="width: 130px">{{ s }}</span>
            <span class="trilho"><span :style="{ width: (n / sintomas[0][1]) * 100 + '%' }" /></span>
            <span class="tiny tabular faint">{{ n }}</span>
          </div>
        </div>
      </section>
    </div>

    <p class="tiny faint" style="text-align: center">
      Referências aproximadas de bula e literatura de farmacocinética. Leve estes padrões para a consulta: eles ajudam o médico a ajustar dose e horário.
    </p>
  </div>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}
.kpi {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
}
.kpi strong {
  font-size: 1.7rem;
  letter-spacing: -0.02em;
}
.vazio {
  text-align: center;
  line-height: 1.6;
}
.link {
  color: var(--primary);
  font-weight: 700;
  text-decoration: underline;
}
.med {
  display: grid;
  gap: 16px;
  border-top: 4px solid var(--cor);
}
.icone {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  background: color-mix(in srgb, var(--cor) 16%, transparent);
}
.destaque {
  display: grid;
  text-align: right;
}
.destaque strong {
  font-size: 1.6rem;
  color: var(--cor);
}
.regua {
  position: relative;
  height: 70px;
  margin: 0 8px;
}
.regua::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 30px;
  height: 4px;
  border-radius: 4px;
  background: var(--surface-2);
}
.ref {
  position: absolute;
  top: 18px;
  height: 28px;
  border-radius: 10px;
  border: 1.5px dashed var(--text-3);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: var(--text-3);
  transform-origin: left;
  animation: esticar 0.8s var(--ease-out) both;
}
.ref span {
  margin-top: -18px;
}
.faixa-pessoal {
  position: absolute;
  top: 26px;
  height: 12px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--cor) 30%, transparent);
  transform-origin: left;
  animation: esticar 0.9s var(--ease-out) 0.2s both;
}
.ponto {
  position: absolute;
  top: 26px;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border-radius: 50%;
  background: var(--cor);
  border: 2px solid var(--surface-solid);
  animation: pop-in 0.4s var(--ease-spring) both;
  animation-delay: calc(0.3s + var(--i) * 30ms);
}
.mediana {
  position: absolute;
  top: 12px;
  height: 40px;
  width: 3px;
  margin-left: -1.5px;
  background: var(--text);
  border-radius: 2px;
  animation: pop-in 0.5s var(--ease-spring) 0.6s both;
}
.mediana span {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 700;
}
.eixo {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
}
@keyframes esticar {
  from {
    transform: scaleX(0);
  }
}
.fatos {
  display: grid;
  gap: 8px;
}
.fato .ic {
  color: var(--cor);
  flex: none;
  margin-top: 2px;
}
.fato {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--surface-2);
}
.spark {
  width: 100%;
  height: 70px;
}
.spark path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: desenhar 1.4s var(--ease-out) 0.3s forwards;
}
@keyframes desenhar {
  to {
    stroke-dashoffset: 0;
  }
}
.semanas {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  height: 160px;
}
.coluna {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 6px;
  text-align: center;
}
.barras {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
}
.barras .b {
  width: 30%;
  max-width: 14px;
  border-radius: 6px 6px 2px 2px;
  transform-origin: bottom;
  animation: subir 0.9s var(--ease-spring) both;
  animation-delay: calc(var(--i) * 60ms + 0.3s);
}
.humor {
  background: #ec4899;
}
.foco {
  background: #7c5cff;
}
.energia {
  background: #10b981;
}
@keyframes subir {
  from {
    transform: scaleY(0);
  }
}
.legenda {
  display: flex;
  gap: 14px;
  margin-top: 10px;
}
.legenda i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 4px;
  vertical-align: middle;
}
.horas {
  display: grid;
  grid-template-columns: repeat(19, 1fr);
  gap: 3px;
  height: 130px;
  align-items: end;
}
.hora {
  display: grid;
  grid-template-rows: 1fr 14px;
  height: 100%;
  align-items: end;
  text-align: center;
}
.hora .b {
  display: block;
  width: 100%;
  border-radius: 4px 4px 1px 1px;
  background: linear-gradient(to top, var(--primary), var(--primary-2));
  transform-origin: bottom;
  animation: subir 0.8s var(--ease-spring) both;
  animation-delay: calc(var(--i) * 25ms + 0.2s);
}
.sintoma {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sintoma .trilho {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}
.sintoma .trilho span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--warning), var(--danger));
  transform-origin: left;
  animation: esticar 0.9s var(--ease-out) both;
  animation-delay: calc(var(--i) * 70ms + 0.3s);
}
</style>
