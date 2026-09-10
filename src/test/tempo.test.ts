import { describe, expect, it } from 'vitest'
import { normalizarProgramacao } from '../data/normalize'
import { lerCsv } from '../data/sheets'
import type { ItemProgramacao } from '../data/types'
import {
  acontecendoAgora,
  agoraNoEvento,
  diaDoMes,
  diaPadrao,
  faixaHoraria,
  horaCurta,
  nomeDiaSemana,
  proximosItens,
} from '../utils/tempo'

const CSV = `id,data,hora_inicio,hora_fim,data_fim,pilar,titulo_pt
a,2026-09-17,10:00,11:00,,oficial,Manha de quinta
b,2026-09-17,14:00,,,talks,Tarde de quinta sem fim
c,2026-09-18,08:00,09:30,,oficial,Largada sexta
d,2026-09-19,05:00,,,oficial,Largada sabado
e,2026-09-17,17:00,17:00,2026-09-18,oficial,Vira a noite
`
const ITENS: ItemProgramacao[] = normalizarProgramacao(lerCsv(CSV)).dados

/** Constroi um Date real correspondente a um horario de Sao Paulo (UTC-3). */
const emSaoPaulo = (iso: string) => new Date(`${iso}-03:00`)

describe('agoraNoEvento', () => {
  it('usa o fuso do evento e nao o do aparelho', () => {
    // 01:00 UTC do dia 18 ainda e 22:00 do dia 17 em Sao Paulo.
    const r = agoraNoEvento(new Date('2026-09-18T01:00:00Z'))
    expect(r.data).toBe('2026-09-17')
    expect(r.minutos).toBe(22 * 60)
  })

  it('trata a meia-noite como minuto zero', () => {
    const r = agoraNoEvento(emSaoPaulo('2026-09-18T00:00:00'))
    expect(r.data).toBe('2026-09-18')
    expect(r.minutos).toBe(0)
  })
})

describe('acontecendoAgora', () => {
  it('encontra o item em andamento', () => {
    const r = acontecendoAgora(ITENS, emSaoPaulo('2026-09-17T10:30:00'))
    expect(r.map((i) => i.id)).toEqual(['a'])
  })

  it('mantem em andamento o item que atravessa a meia-noite', () => {
    const noite = acontecendoAgora(ITENS, emSaoPaulo('2026-09-17T23:30:00'))
    expect(noite.map((i) => i.id)).toContain('e')
    const madrugada = acontecendoAgora(ITENS, emSaoPaulo('2026-09-18T03:00:00'))
    expect(madrugada.map((i) => i.id)).toContain('e')
    const manhaSeguinte = acontecendoAgora(ITENS, emSaoPaulo('2026-09-18T16:00:00'))
    expect(manhaSeguinte.map((i) => i.id)).toContain('e')
  })

  it('encerra o item que atravessa a meia-noite na hora certa', () => {
    const depois = acontecendoAgora(ITENS, emSaoPaulo('2026-09-18T17:30:00'))
    expect(depois.map((i) => i.id)).not.toContain('e')
  })

  it('nao considera em andamento antes de comecar', () => {
    const antes = acontecendoAgora(ITENS, emSaoPaulo('2026-09-17T16:00:00'))
    expect(antes.map((i) => i.id)).not.toContain('e')
  })

  it('inclui o minuto de inicio e exclui o de fim', () => {
    expect(acontecendoAgora(ITENS, emSaoPaulo('2026-09-17T10:00:00')).map((i) => i.id)).toEqual(['a'])
    expect(acontecendoAgora(ITENS, emSaoPaulo('2026-09-17T11:00:00'))).toEqual([])
  })

  it('assume uma hora de duracao quando nao ha hora de fim', () => {
    expect(acontecendoAgora(ITENS, emSaoPaulo('2026-09-17T14:40:00')).map((i) => i.id)).toEqual(['b'])
    expect(acontecendoAgora(ITENS, emSaoPaulo('2026-09-17T15:10:00'))).toEqual([])
  })

  it('nao mistura itens de outros dias', () => {
    // As 10h30 de sexta o unico em andamento e o que vira a noite; os itens
    // de quinta que terminam no proprio dia ficam de fora.
    const r = acontecendoAgora(ITENS, emSaoPaulo('2026-09-18T10:30:00'))
    expect(r.map((i) => i.id)).toEqual(['e'])
  })
})

describe('proximosItens', () => {
  it('lista os proximos em ordem cronologica atravessando os dias', () => {
    const r = proximosItens(ITENS, emSaoPaulo('2026-09-17T12:00:00'), 4)
    expect(r.map((i) => i.id)).toEqual(['b', 'e', 'c', 'd'])
  })

  it('respeita o limite pedido', () => {
    expect(proximosItens(ITENS, emSaoPaulo('2026-09-17T00:00:00'), 2)).toHaveLength(2)
  })

  it('devolve vazio depois do ultimo item', () => {
    expect(proximosItens(ITENS, emSaoPaulo('2026-09-21T09:00:00'))).toEqual([])
  })

  it('nao inclui o item que ja comecou', () => {
    const r = proximosItens(ITENS, emSaoPaulo('2026-09-17T10:30:00'))
    expect(r.map((i) => i.id)).not.toContain('a')
  })
})

describe('diaPadrao', () => {
  const dias = ['2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20']

  it('abre no dia de hoje quando o evento esta rolando', () => {
    expect(diaPadrao(dias, emSaoPaulo('2026-09-18T09:00:00'))).toBe('2026-09-18')
  })

  it('abre no primeiro dia quando o evento ainda nao comecou', () => {
    expect(diaPadrao(dias, emSaoPaulo('2026-06-01T09:00:00'))).toBe('2026-09-17')
  })

  it('abre no ultimo dia quando o evento ja acabou', () => {
    expect(diaPadrao(dias, emSaoPaulo('2026-10-01T09:00:00'))).toBe('2026-09-20')
  })
})

describe('formatacao', () => {
  it('extrai o dia do mes sem sofrer com fuso', () => {
    expect(diaDoMes('2026-09-07')).toBe('7')
    expect(diaDoMes('2026-09-17')).toBe('17')
  })

  it('nomeia o dia da semana no idioma pedido', () => {
    expect(nomeDiaSemana('2026-09-17', 'pt-BR').toLowerCase()).toContain('quinta')
    expect(nomeDiaSemana('2026-09-17', 'en-GB')).toBe('Thursday')
    expect(nomeDiaSemana('2026-09-17', 'es-ES').toLowerCase()).toContain('jueves')
  })

  it('escreve a hora com h em portugues e com dois pontos nos demais', () => {
    const iso = emSaoPaulo('2026-09-17T14:05:00').toISOString()
    expect(horaCurta(iso, 'pt-BR')).toBe('14h05')
    expect(horaCurta(iso, 'en-GB')).toBe('14:05')
  })

  it('devolve vazio para data invalida', () => {
    expect(horaCurta('nao-e-data', 'pt-BR')).toBe('')
    expect(nomeDiaSemana('xx', 'pt-BR')).toBe('')
  })

  it('mostra a faixa so quando existe hora de fim', () => {
    expect(faixaHoraria(ITENS[0] as ItemProgramacao)).toBe('10:00 - 11:00')
    expect(faixaHoraria(ITENS[1] as ItemProgramacao)).toBe('14:00')
  })
})
