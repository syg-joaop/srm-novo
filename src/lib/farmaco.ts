import type { Faixa, PerfilFarmaco, PulsoLiberacao } from '../types'

const HORA = 3_600_000
const cacheKa = new Map<string, number>()
const cacheNorm = new Map<string, number>()

/**
 * Para o modelo de 1 compartimento com absorção de 1ª ordem (função de Bateman),
 * tmax = ln(ka/ke)/(ka-ke). Resolve ka por bisseção a partir do tmax desejado.
 */
export function kaParaTmax(tmaxH: number, ke: number): number {
  const chave = `${tmaxH}|${ke}`
  const salvo = cacheKa.get(chave)
  if (salvo) return salvo
  const tmaxDe = (ka: number) => Math.log(ka / ke) / (ka - ke)
  let lo = ke * 1.0001
  let hi = 200
  // tmax máximo possível é 1/ke (quando ka -> ke). Se pedirem mais, usamos o limite.
  if (tmaxH >= tmaxDe(lo)) {
    cacheKa.set(chave, lo)
    return lo
  }
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (tmaxDe(mid) > tmaxH) lo = mid
    else hi = mid
  }
  const ka = (lo + hi) / 2
  cacheKa.set(chave, ka)
  return ka
}

function bateman(tH: number, ka: number, ke: number): number {
  if (tH <= 0) return 0
  return (ka / (ka - ke)) * (Math.exp(-ke * tH) - Math.exp(-ka * tH))
}

function curvaBruta(perfil: PerfilFarmaco, tH: number, atrasoH: number): number {
  const ke = Math.LN2 / perfil.pk.meiaVidaH
  let soma = 0
  for (const p of perfil.pk.pulsos) {
    soma += p.fracao * bateman(tH - p.latenciaH - atrasoH, kaParaTmax(p.tmaxH, ke), ke)
  }
  return soma
}

function normalizador(perfil: PerfilFarmaco): number {
  const chave = perfil.id + JSON.stringify(perfil.pk)
  const salvo = cacheNorm.get(chave)
  if (salvo) return salvo
  let max = 0
  for (let t = 0; t <= 48; t += 0.02) max = Math.max(max, curvaBruta(perfil, t, 0))
  const n = max || 1
  cacheNorm.set(chave, n)
  return n
}

/**
 * Nível relativo de uma dose única no tempo `tH` (horas após tomar).
 * 1 = pico de uma dose isolada. Doses repetidas podem somar acima de 1 (acúmulo).
 */
export function nivelDose(perfil: PerfilFarmaco, tH: number, comAlimento = false, fatorDose = 1): number {
  const atraso = comAlimento ? perfil.atrasoComAlimentoH : 0
  return (curvaBruta(perfil, tH, atraso) / normalizador(perfil)) * fatorDose
}

/** Horário (em horas após a dose) do pico estimado de uma dose. */
export function tmaxEstimado(perfil: PerfilFarmaco, comAlimento = false): number {
  let melhor = 0
  let tMelhor = 0
  for (let t = 0; t <= 24; t += 0.05) {
    const v = nivelDose(perfil, t, comAlimento)
    if (v > melhor) {
      melhor = v
      tMelhor = t
    }
  }
  return tMelhor
}

export interface DoseParaCurva {
  em: number
  comAlimento: boolean
  fatorDose: number
}

/** Soma (superposição) das contribuições de várias doses num instante. */
export function nivelEm(perfil: PerfilFarmaco, doses: DoseParaCurva[], instante: number): number {
  let total = 0
  const limiteH = perfil.pk.meiaVidaH * 6 + 12
  for (const d of doses) {
    const tH = (instante - d.em) / HORA
    if (tH <= 0 || tH > limiteH) continue
    total += nivelDose(perfil, tH, d.comAlimento, d.fatorDose)
  }
  return total
}

/** Fator de acúmulo teórico em equilíbrio para dose a cada `intervaloH`. */
export function fatorAcumulo(meiaVidaH: number, intervaloH = 24): number {
  const ke = Math.LN2 / meiaVidaH
  return 1 / (1 - Math.exp(-ke * intervaloH))
}

export type Fase = 'aguardando' | 'janela' | 'subindo' | 'pico' | 'ativo' | 'diminuindo' | 'encerrado'

export const ROTULO_FASE: Record<Fase, string> = {
  aguardando: 'Absorvendo',
  janela: 'Janela de início',
  subindo: 'Efeito subindo',
  pico: 'No pico',
  ativo: 'Efeito ativo',
  diminuindo: 'Efeito diminuindo',
  encerrado: 'Efeito encerrado',
}

export interface JanelasEfeito {
  inicio: Faixa
  pico: Faixa
  duracao: Faixa
}

/**
 * Janelas de efeito (em horas após a dose) considerando comida e, se houver,
 * o seu início pessoal medido (mediana dos registros "senti o efeito").
 */
export function janelasEfeito(perfil: PerfilFarmaco, comAlimento: boolean, inicioPessoalH?: number | null): JanelasEfeito {
  const atraso = comAlimento ? perfil.atrasoComAlimentoH : 0
  let desloc = atraso
  if (inicioPessoalH != null && Number.isFinite(inicioPessoalH)) {
    const meioRef = (perfil.efeito.inicioH[0] + perfil.efeito.inicioH[1]) / 2 + atraso
    // Desloca as janelas até o seu início medido, com limite para não distorcer demais.
    desloc = atraso + clamp(inicioPessoalH - meioRef, -2, 3)
  }
  const s = (f: Faixa): Faixa => [Math.max(0, f[0] + desloc), Math.max(0, f[1] + desloc)]
  const inicio = s(perfil.efeito.inicioH)
  const pico = s(perfil.efeito.picoH)
  const duracao: Faixa = [perfil.efeito.duracaoH[0] + desloc * 0.5, perfil.efeito.duracaoH[1] + desloc * 0.5]
  return { inicio, pico, duracao }
}

export function faseEm(janelas: JanelasEfeito, tH: number): Fase {
  if (tH < janelas.inicio[0]) return 'aguardando'
  if (tH < janelas.inicio[1]) return 'janela'
  if (tH < janelas.pico[0]) return 'subindo'
  if (tH < janelas.pico[1]) return 'pico'
  if (tH < janelas.duracao[0]) return 'ativo'
  if (tH < janelas.duracao[1]) return 'diminuindo'
  return 'encerrado'
}

/** Último horário para tomar sem que o efeito ativo atravesse a hora de dormir. */
export function ultimoHorarioSeguro(perfil: PerfilFarmaco, dormirMin: number): number | null {
  if (perfil.horasAntesDeDormir == null) return null
  let m = dormirMin - Math.round(perfil.horasAntesDeDormir * 60)
  while (m < 0) m += 24 * 60
  return m
}

export function mediana(valores: number[]): number | null {
  if (!valores.length) return null
  const v = [...valores].sort((a, b) => a - b)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/** Gera um perfil a partir de parâmetros simples (medicação personalizada). */
export function perfilPersonalizado(opts: {
  id: string
  nome: string
  classe: string
  inicioH: Faixa
  picoH: Faixa
  duracaoH: Faixa
  meiaVidaH: number
  cor: string
  emoji: string
  etiquetas: PerfilFarmaco['etiquetas']
  semanasTerapeutico?: Faixa | null
}): PerfilFarmaco {
  const tmax = (opts.picoH[0] + opts.picoH[1]) / 2
  const latencia = Math.max(0, Math.min(opts.inicioH[0] * 0.5, tmax * 0.3))
  const pulsos: PulsoLiberacao[] = [{ fracao: 1, latenciaH: latencia, tmaxH: Math.max(0.2, tmax - latencia) }]
  return {
    id: opts.id,
    nome: opts.nome,
    principioAtivo: opts.nome,
    marcas: [],
    classe: opts.classe || 'Personalizada',
    indicacoes: [],
    dosesComunsMg: [],
    vezesAoDia: 1,
    mecanismo: 'Medicação personalizada: a curva usa os tempos que você informou.',
    pk: { meiaVidaH: opts.meiaVidaH, pulsos },
    efeito: { inicioH: opts.inicioH, picoH: opts.picoH, duracaoH: opts.duracaoH },
    atrasoComAlimentoH: 0.5,
    efeitoTerapeutico: opts.semanasTerapeutico
      ? { inicioSemanas: opts.semanasTerapeutico, plenoSemanas: [opts.semanasTerapeutico[1], opts.semanasTerapeutico[1] * 2] }
      : undefined,
    melhorHorario: 'Conforme prescrição.',
    dicas: [],
    efeitosComuns: [],
    alertas: [],
    etiquetas: opts.etiquetas,
    cor: opts.cor,
    emoji: opts.emoji,
  }
}
