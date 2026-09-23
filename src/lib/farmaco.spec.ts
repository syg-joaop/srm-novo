import { describe, expect, it } from 'vitest'
import { perfilPorId } from '../data/medicamentos'
import { encontrarInteracoes } from '../data/interacoes'
import { fatorAcumulo, faseEm, janelasEfeito, kaParaTmax, nivelDose, nivelEm, tmaxEstimado, ultimoHorarioSeguro } from './farmaco'

const lisdex = perfilPorId('lisdexanfetamina')!
const bup = perfilPorId('bupropiona-xl')!
const HORA = 3_600_000

describe('modelo farmacocinético', () => {
  it('kaParaTmax reproduz o tmax pedido', () => {
    const ke = Math.LN2 / 11
    const ka = kaParaTmax(3.3, ke)
    expect(Math.log(ka / ke) / (ka - ke)).toBeCloseTo(3.3, 3)
  })

  it('pico de uma dose única vale 1 e ocorre no tmax esperado', () => {
    const t = tmaxEstimado(lisdex)
    expect(t).toBeGreaterThan(3.3)
    expect(t).toBeLessThan(4.3)
    expect(nivelDose(lisdex, t)).toBeCloseTo(1, 2)
  })

  it('refeição atrasa o pico da lisdexanfetamina em ~1h', () => {
    expect(tmaxEstimado(lisdex, true) - tmaxEstimado(lisdex, false)).toBeCloseTo(1, 1)
  })

  it('nível é zero antes da dose', () => {
    expect(nivelEm(lisdex, [{ em: 10 * HORA, comAlimento: false, fatorDose: 1 }], 9 * HORA)).toBe(0)
  })

  it('bupropiona acumula com doses diárias (meia-vida longa)', () => {
    const doses = Array.from({ length: 10 }, (_, i) => ({ em: i * 24 * HORA, comAlimento: false, fatorDose: 1 }))
    const noDia10 = nivelEm(bup, doses, 9 * 24 * HORA + 5.5 * HORA)
    expect(noDia10).toBeGreaterThan(1.5)
    expect(fatorAcumulo(21)).toBeGreaterThan(1.8)
  })
})

describe('fases do efeito', () => {
  it('segue a sequência esperada para Lyberdia', () => {
    const j = janelasEfeito(lisdex, false)
    expect(faseEm(j, 0.3)).toBe('aguardando')
    expect(faseEm(j, 1.5)).toBe('janela')
    expect(faseEm(j, 4)).toBe('pico')
    expect(faseEm(j, 8)).toBe('ativo')
    expect(faseEm(j, 12)).toBe('diminuindo')
    expect(faseEm(j, 15)).toBe('encerrado')
  })

  it('usa o início pessoal para deslocar as janelas', () => {
    const j = janelasEfeito(lisdex, false, 2.5)
    expect(j.inicio[0]).toBeCloseTo(2, 5)
  })

  it('calcula o último horário seguro antes de dormir', () => {
    expect(ultimoHorarioSeguro(lisdex, 23 * 60)).toBe(9 * 60)
    expect(ultimoHorarioSeguro(perfilPorId('sertralina')!, 23 * 60)).toBeNull()
  })
})

describe('interações', () => {
  it('detecta Lyberdia + bupropiona (CYP2D6 e efeito ativador)', () => {
    const achadas = encontrarInteracoes([
      { id: 'a', nome: 'Lyberdia', emoji: '', etiquetas: lisdex.etiquetas },
      { id: 'b', nome: 'Bupropiona', emoji: '', etiquetas: bup.etiquetas },
    ])
    const ids = achadas.map((a) => a.regra.id)
    expect(ids).toContain('cyp2d6-anfetamina')
    expect(ids).toContain('noradrenergicos')
  })

  it('marca IMAO como contraindicado e ordena por gravidade', () => {
    const achadas = encontrarInteracoes([
      { id: 'a', nome: 'Lyberdia', emoji: '', etiquetas: lisdex.etiquetas },
      { id: 'c', nome: 'Café', emoji: '', etiquetas: ['xantina'] },
      { id: 'i', nome: 'IMAO', emoji: '', etiquetas: ['imao'] },
    ])
    expect(achadas[0].regra.gravidade).toBe('contraindicada')
  })
})
