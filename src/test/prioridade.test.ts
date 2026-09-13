import { describe, expect, it } from 'vitest'
import type { ItemProgramacao } from '../data/types'
import { ordenarPorPrioridade } from '../utils/prioridade'

const novo = (id: string, pilar: ItemProgramacao['pilar'], minutoInicio: number) =>
  ({ id, pilar, minutoInicio, titulo: { pt: id, es: id, en: id } }) as unknown as ItemProgramacao

describe('prioridade da programacao', () => {
  it('mostra oficial, depois palco, depois ativacoes, cada grupo por horario', () => {
    const lista = [
      novo('ativacao-9h', 'ativacao', 540),
      novo('talk-15h', 'talks', 900),
      novo('oficial-19h', 'oficial', 1140),
      novo('filme-13h', 'filmes', 780),
      novo('oficial-10h', 'oficial', 600),
    ]
    expect(ordenarPorPrioridade(lista).map((i) => i.id)).toEqual([
      'oficial-10h',
      'oficial-19h',
      'talk-15h',
      'filme-13h',
      'ativacao-9h',
    ])
  })
})
