import { chaveDia, deChave, duracao, hhmm, HORA, minutosDe } from './lib/datas'
import { faseEm, janelasEfeito, nivelEm, ROTULO_FASE, type Fase } from './lib/farmaco'
import { dosesDoDia, efeitosDoDia, estado, inicioPessoal, medPorId, paraCurva, perfilDe } from './store'
import type { Medicacao, PerfilFarmaco } from './types'

/** Resolução das curvas do dia, em minutos. */
export const PASSO_MIN = 10
export const PONTOS = (24 * 60) / PASSO_MIN + 1

export interface SerieDia {
  med: Medicacao
  perfil: PerfilFarmaco
  pontos: number[]
  /** Máximo da série no dia (mínimo 1), para normalizar. */
  max: number
}

/** Medicações que aparecem num dia: ativas ou com dose registrada nele. */
export function medsDoDia(dia: string): Medicacao[] {
  const ids = new Set(dosesDoDia(dia).map((d) => d.medId))
  return estado.medicacoes.filter((m) => m.ativa || ids.has(m.id))
}

export function seriesDoDia(dia: string): SerieDia[] {
  const inicio = deChave(dia).getTime()
  return medsDoDia(dia).map((med) => {
    const perfil = perfilDe(med)
    const doses = paraCurva(med.id, med.doseMg)
    const pontos: number[] = []
    let max = 1
    for (let i = 0; i < PONTOS; i++) {
      const v = nivelEm(perfil, doses, inicio + i * PASSO_MIN * 60_000)
      pontos.push(v)
      if (v > max) max = v
    }
    return { med, perfil, pontos, max }
  })
}

/** Valor interpolado de uma série numa hora fracionária. */
export function valorEm(pontos: number[], h: number): number {
  const idx = (h * 60) / PASSO_MIN
  const i = Math.max(0, Math.min(pontos.length - 2, Math.floor(idx)))
  const f = Math.min(1, Math.max(0, idx - i))
  return pontos[i] * (1 - f) + pontos[i + 1] * f
}

export interface FaseNoInstante {
  fase: Fase | null
  rotulo: string
  horasDesde: number | null
}

/** Fase de uma medicação num instante absoluto, considerando a última dose antes dele. */
export function faseNoInstante(med: Medicacao, instante: number): FaseNoInstante {
  const perfil = perfilDe(med)
  const limite = perfil.efeito.duracaoH[1] + 2
  let ultima: { em: number; comAlimento: boolean } | null = null
  for (const d of estado.doses) {
    if (d.medId !== med.id) continue
    const t = +new Date(d.em)
    if (t > instante || instante - t > limite * HORA) continue
    if (!ultima || t > ultima.em) ultima = { em: t, comAlimento: d.comAlimento }
  }
  if (!ultima) return { fase: null, rotulo: 'Sem dose ativa', horasDesde: null }
  const h = (instante - ultima.em) / HORA
  const fase = faseEm(janelasEfeito(perfil, ultima.comAlimento, inicioPessoal(med.id)), h)
  return { fase, rotulo: ROTULO_FASE[fase], horasDesde: h }
}

export type TipoEvento = 'acordar' | 'dose' | 'residual' | 'inicio' | 'pico' | 'pico-fim' | 'queda' | 'fim' | 'registro' | 'dormir' | 'planejado'

export interface EventoDia {
  id: string
  h: number
  tipo: TipoEvento
  medId: string | null
  cor: string
  titulo: string
  detalhe: string
}

/**
 * Roteiro narrado do dia: doses, fases previstas, registros e sono,
 * em ordem cronológica. É o que a reprodução "hora a hora" conta.
 */
export function roteiroDoDia(dia: string, series: SerieDia[]): EventoDia[] {
  const inicio = deChave(dia).getTime()
  const eventos: EventoDia[] = []
  const hojeChave = chaveDia(Date.now())
  const acordar = minutosDe(estado.preferencias.acordar) / 60
  const dormir = minutosDe(estado.preferencias.dormir) / 60

  eventos.push({ id: 'acordar', h: acordar, tipo: 'acordar', medId: null, cor: 'var(--warning)', titulo: 'Bom dia', detalhe: `Você costuma acordar às ${estado.preferencias.acordar}.` })

  for (const s of series) {
    const v0 = s.pontos[0]
    if (v0 > 0.12) {
      eventos.push({
        id: 'res-' + s.med.id,
        h: 0.01,
        tipo: 'residual',
        medId: s.med.id,
        cor: s.med.cor,
        titulo: `${s.med.nome} ainda circulando`,
        detalhe: `À meia-noite restavam ${Math.round(v0 * 100)}% das doses anteriores${s.perfil.equilibrioDias ? ', o que é esperado para uma medicação de uso contínuo.' : '.'}`,
      })
    }
  }

  const doses = dosesDoDia(dia)
  for (const d of doses) {
    const med = medPorId(d.medId)
    if (!med) continue
    const perfil = perfilDe(med)
    const h0 = (+new Date(d.em) - inicio) / HORA
    const pessoal = inicioPessoal(med.id)
    const j = janelasEfeito(perfil, d.comAlimento, pessoal)
    const add = (id: string, h: number, tipo: TipoEvento, titulo: string, detalhe: string) => {
      if (h >= 0 && h <= 24) eventos.push({ id: d.id + id, h, tipo, medId: med.id, cor: med.cor, titulo, detalhe })
    }
    add(
      '-dose',
      h0,
      'dose',
      `Tomou ${med.nome} ${d.doseMg} mg`,
      d.comAlimento && perfil.atrasoComAlimentoH
        ? `Com refeição: o início deve atrasar cerca de ${duracao(perfil.atrasoComAlimentoH)}.`
        : perfil.id === 'lisdexanfetamina'
          ? 'O pró-fármaco começa a ser convertido em dextroanfetamina no sangue.'
          : 'Absorção em andamento.',
    )
    add(
      '-ini',
      h0 + j.inicio[0],
      'inicio',
      `${med.nome}: janela de início`,
      pessoal != null
        ? `Pelos seus registros, você costuma sentir o efeito ${duracao(pessoal)} depois da dose.`
        : `Pela bula, o efeito começa entre ${hhmm(inicio + (h0 + j.inicio[0]) * HORA)} e ${hhmm(inicio + (h0 + j.inicio[1]) * HORA)}. Registre quando sentir.`,
    )
    add('-pico', h0 + j.pico[0], 'pico', `${med.nome}: entrando no pico`, perfil.efeitoTerapeutico ? 'Nível no sangue no máximo. O efeito no humor, porém, se constrói ao longo de semanas.' : 'Melhor janela para as tarefas que exigem mais foco.')
    add('-picofim', h0 + j.pico[1], 'pico-fim', `${med.nome}: fim do pico`, 'O efeito segue ativo, mas já sem a intensidade máxima.')
    add('-queda', h0 + j.duracao[0], 'queda', `${med.nome}: efeito diminuindo`, perfil.etiquetas.includes('estimulante') ? 'Cansaço, fome ou irritabilidade agora costumam ser o rebote.' : 'O nível cai gradualmente.')
    add('-fim', h0 + j.duracao[1], 'fim', `${med.nome}: efeito encerrado`, 'O que resta no organismo já não deve ser percebido.')
  }

  // Doses planejadas ainda não tomadas (só hoje).
  if (dia === hojeChave) {
    for (const med of estado.medicacoes.filter((m) => m.ativa)) {
      const tomadas = doses.filter((d) => d.medId === med.id).length
      for (const h of [...med.horarios].sort().slice(tomadas)) {
        eventos.push({ id: `plan-${med.id}-${h}`, h: minutosDe(h) / 60, tipo: 'planejado', medId: med.id, cor: med.cor, titulo: `${med.nome} planejado às ${h}`, detalhe: 'Ainda não registrado hoje.' })
      }
    }
  }

  for (const e of efeitosDoDia(dia)) {
    const med = medPorId(e.medId)
    const h = (+new Date(e.em) - inicio) / HORA
    const titulos = { inicio: 'Você sentiu o efeito começar', pico: 'Você registrou o pico', fim: 'Você sentiu o efeito passar', check: 'Check-in' }
    eventos.push({
      id: 'r-' + e.id,
      h,
      tipo: 'registro',
      medId: e.medId,
      cor: med?.cor ?? 'var(--primary)',
      titulo: `${titulos[e.tipo]}${med ? ` · ${med.nome}` : ''}`,
      detalhe: `Foco ${e.foco}/5 · humor ${e.humor}/5 · energia ${e.energia}/5${e.sintomas.length ? ' · ' + e.sintomas.join(', ') : ''}${e.nota ? ` · "${e.nota}"` : ''}`,
    })
  }

  const noDormir = series
    .filter((s) => valorEm(s.pontos, dormir) > 0.05)
    .map((s) => `${s.med.nome} ${Math.round(valorEm(s.pontos, dormir) * 100)}%`)
  eventos.push({
    id: 'dormir',
    h: dormir,
    tipo: 'dormir',
    medId: null,
    cor: 'var(--info)',
    titulo: 'Hora de dormir',
    detalhe: noDormir.length ? `Ainda no organismo: ${noDormir.join(' · ')}.` : 'Nenhuma medicação em nível relevante. Bom para o sono.',
  })

  return eventos.sort((a, b) => a.h - b.h)
}

/** Cor do céu para a hora do dia (usada no fundo ambiente e no mostrador). */
export function corDoCeu(h: number, escuro: boolean): [string, string] {
  // [hora, cor alta, cor baixa]
  const paradas: [number, string, string][] = escuro
    ? [
        [0, '#0b1030', '#05060c'],
        [5, '#1a1640', '#07080e'],
        [6.5, '#5b2a4a', '#120a14'],
        [8, '#2a3a7a', '#0a0d1c'],
        [12, '#1e3a8a', '#0a1022'],
        [17, '#3b2a6b', '#0c0a1a'],
        [19, '#6b2a4a', '#140a14'],
        [21, '#1a1a4a', '#07080e'],
        [24, '#0b1030', '#05060c'],
      ]
    : [
        [0, '#dfe3ff', '#f2f2f7'],
        [5, '#e7e1ff', '#f5f3ee'],
        [6.5, '#ffd9c2', '#f8f1ea'],
        [8, '#fff0cf', '#f7f4ec'],
        [12, '#dff1ff', '#f4f6f5'],
        [17, '#ffe4c4', '#f7f2ea'],
        [19, '#ffd0d8', '#f6efee'],
        [21, '#e3dcff', '#f3f2f5'],
        [24, '#dfe3ff', '#f2f2f7'],
      ]
  let i = 0
  while (i < paradas.length - 2 && paradas[i + 1][0] <= h) i++
  const [h0, a0, b0] = paradas[i]
  const [h1, a1, b1] = paradas[i + 1]
  const t = Math.min(1, Math.max(0, (h - h0) / (h1 - h0)))
  return [mistura(a0, a1, t), mistura(b0, b1, t)]
}

export function mistura(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, k) => Math.round(v + (pb[k] - v) * t).toString(16).padStart(2, '0')).join('')
}
