export type Faixa = [number, number]

/** Um "pulso" de liberação do comprimido (formulações bifásicas têm mais de um). */
export interface PulsoLiberacao {
  /** Fração da dose liberada neste pulso (0–1). */
  fracao: number
  /** Tempo até começar a absorção, em horas. */
  latenciaH: number
  /** Tempo até a concentração máxima deste pulso, em horas (contado após a latência). */
  tmaxH: number
}

export type Etiqueta =
  | 'estimulante'
  | 'anfetamina'
  | 'metilfenidato'
  | 'noradrenergico'
  | 'dopaminergico'
  | 'serotoninergico'
  | 'isrs'
  | 'irsn'
  | 'inibidor-cyp2d6'
  | 'substrato-cyp2d6'
  | 'indutor-cyp3a4'
  | 'reduz-limiar-convulsivo'
  | 'sedativo'
  | 'benzodiazepinico'
  | 'hipnotico'
  | 'antipsicotico'
  | 'hormonio-sono'
  | 'xantina'

export interface PerfilFarmaco {
  id: string
  nome: string
  principioAtivo: string
  marcas: string[]
  classe: string
  indicacoes: string[]
  dosesComunsMg: number[]
  vezesAoDia: number
  mecanismo: string
  /** Farmacocinética usada na curva estimada. */
  pk: {
    meiaVidaH: number
    pulsos: PulsoLiberacao[]
  }
  /** Janela de efeito percebido após a dose (horas). */
  efeito: {
    inicioH: Faixa
    picoH: Faixa
    duracaoH: Faixa
  }
  /** Atraso típico quando tomado com refeição (horas). */
  atrasoComAlimentoH: number
  /** Para antidepressivos e afins: tempo até efeito terapêutico (semanas). */
  efeitoTerapeutico?: { inicioSemanas: Faixa; plenoSemanas: Faixa }
  /** Dias até o estado de equilíbrio (steady state). */
  equilibrioDias?: number
  melhorHorario: string
  /** Tomar pelo menos estas horas antes de dormir (para não atrapalhar o sono). */
  horasAntesDeDormir?: number
  dicas: string[]
  efeitosComuns: string[]
  alertas: string[]
  etiquetas: Etiqueta[]
  cor: string
  emoji: string
}

export interface Medicacao {
  id: string
  perfilId: string
  /** Nome exibido (ex.: "Lyberdia"). */
  nome: string
  doseMg: number
  /** Horários planejados no formato HH:MM. */
  horarios: string[]
  cor: string
  ativa: boolean
  /** Data de início do tratamento (YYYY-MM-DD) — usada para o efeito terapêutico. */
  inicioTratamento: string
}

export interface Dose {
  id: string
  medId: string
  /** ISO string do momento em que tomou. */
  em: string
  doseMg: number
  comAlimento: boolean
}

export type TipoEfeito = 'inicio' | 'pico' | 'fim' | 'check'

export interface RegistroEfeito {
  id: string
  em: string
  /** Medicação a que o registro se refere (ou null para um check geral). */
  medId: string | null
  tipo: TipoEfeito
  foco: number
  humor: number
  energia: number
  ansiedade: number
  sintomas: string[]
  nota: string
}

export interface Preferencias {
  acordar: string
  dormir: string
  notificacoes: boolean
  nome: string
}

export interface Substancia {
  id: string
  nome: string
  emoji: string
  etiquetas: string[]
}

export type Gravidade = 'contraindicada' | 'grave' | 'moderada' | 'leve' | 'atencao'

export interface RegraInteracao {
  id: string
  /** Etiquetas/ids de um lado da interação. */
  a: string[]
  /** Etiquetas/ids do outro lado. */
  b: string[]
  gravidade: Gravidade
  titulo: string
  descricao: string
  conduta: string
}
