import type { ItemProgramacao, Pilar } from '../data/types'

/** Ordem na lista da Programacao: oficial no topo, depois o palco, depois as ativacoes. */
const PRIORIDADE: Record<Pilar, number> = { oficial: 0, talks: 1, filmes: 2, ativacao: 3 }

export function ordenarPorPrioridade(itens: ItemProgramacao[]): ItemProgramacao[] {
  return [...itens].sort(
    (a, b) =>
      PRIORIDADE[a.pilar] - PRIORIDADE[b.pilar] ||
      a.minutoInicio - b.minutoInicio ||
      a.titulo.pt.localeCompare(b.titulo.pt, 'pt-BR'),
  )
}
