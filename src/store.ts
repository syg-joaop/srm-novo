import { computed, reactive, ref, watch } from 'vue'
import { CORES_MED, PERFIS } from './data/medicamentos'
import { chaveDia, deChave, DIA, HORA, inicioDoDia, minutosDe, somarDias } from './lib/datas'
import { faseEm, janelasEfeito, mediana, nivelEm, type Fase, type JanelasEfeito } from './lib/farmaco'
import type { Dose, Medicacao, PerfilFarmaco, Preferencias, RegistroEfeito } from './types'

const CHAVE = 'medtempo:v1'

interface Estado {
  medicacoes: Medicacao[]
  doses: Dose[]
  efeitos: RegistroEfeito[]
  perfisPersonalizados: PerfilFarmaco[]
  preferencias: Preferencias
  /** Doses cuja pergunta "já sentiu?" já foi respondida/dispensada. */
  perguntasRespondidas: string[]
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function estadoInicial(): Estado {
  const hoje = chaveDia(new Date())
  return {
    medicacoes: [
      {
        id: uid(),
        perfilId: 'lisdexanfetamina',
        nome: 'Lyberdia',
        doseMg: 30,
        horarios: ['07:00'],
        cor: '#7c5cff',
        ativa: true,
        inicioTratamento: hoje,
      },
      {
        id: uid(),
        perfilId: 'bupropiona-xl',
        nome: 'Bupropiona',
        doseMg: 150,
        horarios: ['07:00'],
        cor: '#10b981',
        ativa: true,
        inicioTratamento: hoje,
      },
    ],
    doses: [],
    efeitos: [],
    perfisPersonalizados: [],
    preferencias: { acordar: '06:30', dormir: '23:00', notificacoes: false, nome: '' },
    perguntasRespondidas: [],
  }
}

function carregar(): Estado {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (bruto) return { ...estadoInicial(), ...JSON.parse(bruto) }
  } catch {
    /* sem storage disponível: segue com o estado inicial */
  }
  return estadoInicial()
}

export const estado = reactive<Estado>(carregar())

watch(
  estado,
  (v) => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(v))
    } catch {
      /* ignora */
    }
  },
  { deep: true },
)

/* ---------- relógio ---------- */

export const agora = ref(Date.now())
setInterval(() => (agora.value = Date.now()), 20_000)

/* ---------- toasts ---------- */

export interface Toast {
  id: string
  texto: string
  emoji: string
}
export const toasts = ref<Toast[]>([])
export function avisar(texto: string, emoji = '✨') {
  const t = { id: uid(), texto, emoji }
  toasts.value.push(t)
  setTimeout(() => (toasts.value = toasts.value.filter((x) => x.id !== t.id)), 3200)
}

/* ---------- consultas ---------- */

export function todosPerfis(): PerfilFarmaco[] {
  return [...PERFIS, ...estado.perfisPersonalizados]
}

export function perfilDe(med: Medicacao | undefined): PerfilFarmaco {
  const p = med && todosPerfis().find((x) => x.id === med.perfilId)
  return p ?? PERFIS[0]
}

export function medPorId(id: string | null | undefined) {
  return estado.medicacoes.find((m) => m.id === id)
}

export const medsAtivas = computed(() => estado.medicacoes.filter((m) => m.ativa))

export function dosesDaMed(medId: string) {
  return estado.doses.filter((d) => d.medId === medId).sort((a, b) => +new Date(a.em) - +new Date(b.em))
}

export function dosesDoDia(chave: string) {
  return estado.doses.filter((d) => chaveDia(d.em) === chave).sort((a, b) => +new Date(a.em) - +new Date(b.em))
}

export function efeitosDoDia(chave: string) {
  return estado.efeitos.filter((e) => chaveDia(e.em) === chave).sort((a, b) => +new Date(a.em) - +new Date(b.em))
}

/** Última dose da medicação antes do instante, dentro de `limiteH` horas. */
export function doseAnterior(medId: string, instante: number, limiteH = 30): Dose | undefined {
  let melhor: Dose | undefined
  for (const d of estado.doses) {
    if (d.medId !== medId) continue
    const t = +new Date(d.em)
    if (t > instante || instante - t > limiteH * HORA) continue
    if (!melhor || t > +new Date(melhor.em)) melhor = d
  }
  return melhor
}

export interface Medicao {
  horas: number
  em: string
  doseId: string
}

/** Tempos pessoais (horas desde a dose) para um tipo de registro. */
export function temposPessoais(medId: string, tipo: 'inicio' | 'pico' | 'fim'): Medicao[] {
  const med = medPorId(medId)
  const perfil = perfilDe(med)
  const limite = perfil.efeito.duracaoH[1] + 4
  const res: Medicao[] = []
  for (const e of estado.efeitos) {
    if (e.medId !== medId || e.tipo !== tipo) continue
    const d = doseAnterior(medId, +new Date(e.em), limite)
    if (!d) continue
    res.push({ horas: (+new Date(e.em) - +new Date(d.em)) / HORA, em: e.em, doseId: d.id })
  }
  return res.sort((a, b) => +new Date(a.em) - +new Date(b.em))
}

export function inicioPessoal(medId: string): number | null {
  return mediana(temposPessoais(medId, 'inicio').map((m) => m.horas))
}

export function paraCurva(medId: string, doseMgBase: number) {
  return estado.doses
    .filter((d) => d.medId === medId)
    .map((d) => ({ em: +new Date(d.em), comAlimento: d.comAlimento, fatorDose: doseMgBase ? d.doseMg / doseMgBase : 1 }))
}

export interface StatusMed {
  med: Medicacao
  perfil: PerfilFarmaco
  dose?: Dose
  horasDesde: number
  janelas?: JanelasEfeito
  fase: Fase | 'sem-dose'
  nivel: number
  /** 0–1 ao longo da duração do efeito. */
  progresso: number
  proximoHorario: string | null
  sentiuInicio: boolean
}

export function statusDe(med: Medicacao, instante = agora.value): StatusMed {
  const perfil = perfilDe(med)
  const limite = perfil.efeito.duracaoH[1] + 2
  const dose = doseAnterior(med.id, instante, limite)
  const nivel = nivelEm(perfil, paraCurva(med.id, med.doseMg), instante)
  const proximoHorario = proximoHorarioDe(med, instante)
  if (!dose) {
    return { med, perfil, horasDesde: 0, fase: 'sem-dose', nivel, progresso: 0, proximoHorario, sentiuInicio: false }
  }
  const horasDesde = (instante - +new Date(dose.em)) / HORA
  const janelas = janelasEfeito(perfil, dose.comAlimento, inicioPessoal(med.id))
  const sentiuInicio = estado.efeitos.some(
    (e) => e.medId === med.id && e.tipo === 'inicio' && +new Date(e.em) >= +new Date(dose.em) && +new Date(e.em) <= instante,
  )
  return {
    med,
    perfil,
    dose,
    horasDesde,
    janelas,
    fase: faseEm(janelas, horasDesde),
    nivel,
    progresso: Math.min(1, horasDesde / janelas.duracao[1]),
    proximoHorario,
    sentiuInicio,
  }
}

export function proximoHorarioDe(med: Medicacao, instante = agora.value): string | null {
  if (!med.horarios.length) return null
  const hoje = chaveDia(instante)
  const tomadasHoje = dosesDoDia(hoje).filter((d) => d.medId === med.id).length
  const ordenados = [...med.horarios].sort()
  return ordenados[tomadasHoje] ?? null
}

/** Adesão do dia: quantas doses planejadas vs. tomadas, por medicação. */
export function adesaoDoDia(chave: string) {
  const dia = deChave(chave)
  const doses = dosesDoDia(chave)
  const itens = estado.medicacoes
    .filter((m) => m.ativa && deChave(m.inicioTratamento) <= dia)
    .map((m) => ({ med: m, planejadas: m.horarios.length, tomadas: doses.filter((d) => d.medId === m.id).length }))
  const planejadas = itens.reduce((s, i) => s + i.planejadas, 0)
  const tomadas = itens.reduce((s, i) => s + Math.min(i.tomadas, i.planejadas), 0)
  return { itens, planejadas, tomadas, taxa: planejadas ? tomadas / planejadas : 0 }
}

export function mediaDoDia(chave: string, campo: 'foco' | 'humor' | 'energia' | 'ansiedade'): number | null {
  const lista = efeitosDoDia(chave)
  if (!lista.length) return null
  return lista.reduce((s, e) => s + e[campo], 0) / lista.length
}

/** Sequência de dias seguidos com todas as doses tomadas (até hoje ou ontem). */
export const sequencia = computed(() => {
  let d = inicioDoDia(agora.value)
  if (adesaoDoDia(chaveDia(d)).taxa < 1) d = somarDias(d, -1)
  let n = 0
  for (let i = 0; i < 400; i++) {
    const a = adesaoDoDia(chaveDia(d))
    if (!a.planejadas || a.taxa < 1) break
    n++
    d = somarDias(d, -1)
  }
  return n
})

/* ---------- ações ---------- */

/** Ouvintes chamados a cada dose registrada (usado pelas animações). */
export const ouvintesDose = new Set<(dose: Dose) => void>()

export function registrarDose(med: Medicacao, em = new Date(), comAlimento = false, doseMg = med.doseMg) {
  const dose: Dose = { id: uid(), medId: med.id, em: em.toISOString(), doseMg, comAlimento }
  estado.doses.push(dose)
  agendarPergunta(med, dose)
  for (const f of ouvintesDose) f(dose)
  return dose
}

export function removerDose(id: string) {
  estado.doses = estado.doses.filter((d) => d.id !== id)
}

export function registrarEfeito(e: Omit<RegistroEfeito, 'id'>) {
  const r = { ...e, id: uid() }
  estado.efeitos.push(r)
  return r
}

export function removerEfeito(id: string) {
  estado.efeitos = estado.efeitos.filter((e) => e.id !== id)
}

export function salvarMedicacao(m: Medicacao) {
  const i = estado.medicacoes.findIndex((x) => x.id === m.id)
  if (i >= 0) estado.medicacoes[i] = m
  else estado.medicacoes.push(m)
}

export function removerMedicacao(id: string) {
  estado.medicacoes = estado.medicacoes.filter((m) => m.id !== id)
  estado.doses = estado.doses.filter((d) => d.medId !== id)
  estado.efeitos = estado.efeitos.filter((e) => e.medId !== id)
}

export function proximaCor() {
  const usadas = new Set(estado.medicacoes.map((m) => m.cor))
  return CORES_MED.find((c) => !usadas.has(c)) ?? CORES_MED[estado.medicacoes.length % CORES_MED.length]
}

/* ---------- notificações ---------- */

const timers = new Map<string, number>()

export async function pedirNotificacoes() {
  if (!('Notification' in window)) {
    avisar('Seu navegador não suporta notificações', '🔕')
    return false
  }
  const r = await Notification.requestPermission()
  estado.preferencias.notificacoes = r === 'granted'
  return r === 'granted'
}

function notificar(titulo: string, corpo: string) {
  if (!estado.preferencias.notificacoes || !('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(titulo, { body: corpo, icon: './icon.svg' })
  } catch {
    /* alguns navegadores móveis só notificam via service worker */
  }
}

function agendarPergunta(med: Medicacao, dose: Dose) {
  const perfil = perfilDe(med)
  const j = janelasEfeito(perfil, dose.comAlimento, inicioPessoal(med.id))
  const quando = +new Date(dose.em) + j.inicio[0] * HORA - Date.now()
  if (quando <= 0 || quando > DIA) return
  timers.set(
    dose.id,
    window.setTimeout(() => notificar(`${med.nome}: janela de início`, 'Já sentiu o efeito? Toque para registrar.'), quando),
  )
}

/** Lembretes de horário das doses planejadas para hoje (enquanto o app estiver aberto). */
export function agendarLembretesDoDia() {
  for (const [, t] of timers) clearTimeout(t)
  timers.clear()
  const base = inicioDoDia(Date.now()).getTime()
  for (const med of medsAtivas.value) {
    for (const h of med.horarios) {
      const quando = base + minutosDe(h) * 60_000 - Date.now()
      if (quando > 0) timers.set(`${med.id}-${h}`, window.setTimeout(() => notificar(`Hora do ${med.nome}`, `${med.doseMg} mg às ${h}`), quando))
    }
  }
  for (const d of estado.doses) {
    const med = medPorId(d.medId)
    if (med) agendarPergunta(med, d)
  }
}

/* ---------- dados de exemplo ---------- */

function aleatorio(semente: number) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function gerarExemplo(dias = 21) {
  const r = aleatorio(42)
  const hoje = inicioDoDia(Date.now())
  const inicio = chaveDia(somarDias(hoje, -dias))
  estado.doses = []
  estado.efeitos = []
  for (const m of estado.medicacoes) m.inicioTratamento = inicio
  for (let i = dias; i >= 1; i--) {
    const dia = somarDias(hoje, -i)
    const pular = r() < 0.08
    for (const med of estado.medicacoes.filter((m) => m.ativa)) {
      if (pular && r() < 0.6) continue
      for (const h of med.horarios) {
        const em = new Date(dia.getTime() + minutosDe(h) * 60_000 + (r() * 50 - 15) * 60_000)
        const comAlimento = r() < 0.55
        estado.doses.push({ id: uid(), medId: med.id, em: em.toISOString(), doseMg: med.doseMg, comAlimento })
        const perfil = perfilDe(med)
        const progresso = 1 - i / dias
        const base = (perfil.efeito.inicioH[0] + perfil.efeito.inicioH[1]) / 2 + (comAlimento ? perfil.atrasoComAlimentoH : 0)
        const humorBase = perfil.efeitoTerapeutico ? 2.4 + progresso * 1.6 : 3
        if (!perfil.efeitoTerapeutico || r() < 0.35) {
          const inicioH = Math.max(0.3, base + (r() - 0.55) * 0.9)
          estado.efeitos.push({
            id: uid(),
            em: new Date(em.getTime() + inicioH * HORA).toISOString(),
            medId: med.id,
            tipo: 'inicio',
            foco: Math.round(Math.min(5, 3 + r() * 2)),
            humor: Math.round(Math.min(5, humorBase + r())),
            energia: Math.round(Math.min(5, 3 + r() * 2)),
            ansiedade: Math.round(1 + r() * 2),
            sintomas: r() < 0.3 ? ['Boca seca'] : [],
            nota: '',
          })
        }
        if (!perfil.efeitoTerapeutico && r() < 0.7) {
          const fimH = perfil.efeito.duracaoH[0] + r() * (perfil.efeito.duracaoH[1] - perfil.efeito.duracaoH[0])
          estado.efeitos.push({
            id: uid(),
            em: new Date(em.getTime() + fimH * HORA).toISOString(),
            medId: med.id,
            tipo: 'fim',
            foco: Math.round(1 + r() * 2),
            humor: Math.round(Math.min(5, humorBase - 0.5 + r())),
            energia: Math.round(1 + r() * 2),
            ansiedade: Math.round(1 + r() * 3),
            sintomas: r() < 0.4 ? ['Irritabilidade'] : [],
            nota: '',
          })
        }
      }
    }
  }
}

export function apagarTudo() {
  Object.assign(estado, estadoInicial())
}
