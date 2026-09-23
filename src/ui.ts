import { reactive } from 'vue'
import type { TipoEfeito } from './types'

export type Aba = 'hoje' | 'calendario' | 'medicacoes' | 'interacoes' | 'padroes'

export const ui = reactive({
  aba: 'hoje' as Aba,
  /** Direção da transição entre abas (1 = para a direita). */
  direcao: 1,
  modalDose: null as null | { medId?: string; dia?: string },
  modalEfeito: null as null | { medId?: string | null; tipo?: TipoEfeito; dia?: string },
  modalAjustes: false,
  /** Dia selecionado no calendário. */
  diaCalendario: null as string | null,
})

const ORDEM: Aba[] = ['hoje', 'calendario', 'medicacoes', 'interacoes', 'padroes']

export function irPara(aba: Aba) {
  ui.direcao = ORDEM.indexOf(aba) >= ORDEM.indexOf(ui.aba) ? 1 : -1
  ui.aba = aba
}
