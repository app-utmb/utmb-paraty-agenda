import { FUSO_EVENTO } from '../config'
import type { ItemProgramacao } from '../data/types'

/** Data e hora do "agora" no fuso do evento, independente do relogio do aparelho. */
export function agoraNoEvento(referencia: Date = new Date()): {
  data: string
  minutos: number
} {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_EVENTO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const partes = Object.fromEntries(fmt.formatToParts(referencia).map((p) => [p.type, p.value]))
  const data = `${partes.year}-${partes.month}-${partes.day}`
  // "24" aparece em algumas engines para a meia-noite.
  const hora = Number(partes.hour) % 24
  const minutos = hora * 60 + Number(partes.minute)
  return { data, minutos }
}

/** Duracao padrao assumida quando o item nao tem hora_fim, em minutos. */
export const DURACAO_PADRAO_MIN = 60

export function estaAcontecendo(item: ItemProgramacao, data: string, minutos: number): boolean {
  if (item.data !== data) return false
  const fim = item.minutoFim ?? item.minutoInicio + DURACAO_PADRAO_MIN
  return minutos >= item.minutoInicio && minutos < fim
}

/** Itens em andamento agora, em ordem de inicio. */
export function acontecendoAgora(
  itens: readonly ItemProgramacao[],
  referencia: Date = new Date(),
): ItemProgramacao[] {
  const { data, minutos } = agoraNoEvento(referencia)
  return itens
    .filter((i) => estaAcontecendo(i, data, minutos))
    .sort((a, b) => a.minutoInicio - b.minutoInicio)
}

/** Proximos itens que ainda vao comecar, em ordem cronologica. */
export function proximosItens(
  itens: readonly ItemProgramacao[],
  referencia: Date = new Date(),
  limite = 3,
): ItemProgramacao[] {
  const { data, minutos } = agoraNoEvento(referencia)
  return itens
    .filter((i) => i.data > data || (i.data === data && i.minutoInicio > minutos))
    .sort((a, b) =>
      a.data === b.data ? a.minutoInicio - b.minutoInicio : a.data < b.data ? -1 : 1,
    )
    .slice(0, limite)
}

/** Dia do evento que faz sentido abrir por padrao: o de hoje, senao o primeiro. */
export function diaPadrao(dias: readonly string[], referencia: Date = new Date()): string {
  const { data } = agoraNoEvento(referencia)
  if (dias.includes(data)) return data
  const futuro = dias.find((d) => d > data)
  return futuro ?? dias[dias.length - 1] ?? data
}

/** "17" a partir de "2026-09-17", sem depender do fuso do aparelho. */
export function diaDoMes(dataIso: string): string {
  return dataIso.slice(8, 10).replace(/^0/, '')
}

/** Rotulo curto do mes no idioma ativo, ex "set". */
export function mesCurto(dataIso: string, locale: string): string {
  const d = new Date(`${dataIso}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
    .format(d)
    .replace('.', '')
}

/** Nome do dia da semana no idioma ativo, derivado da data ISO. */
export function nomeDiaSemana(dataIso: string, locale: string): string {
  const d = new Date(`${dataIso}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(d)
}

/** Hora do "atualizado às HHhMM" no formato local do idioma ativo. */
export function horaCurta(iso: string, locale: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const texto = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: FUSO_EVENTO,
  }).format(d)
  return locale.startsWith('pt') ? texto.replace(':', 'h') : texto
}

export function faixaHoraria(item: ItemProgramacao): string {
  return item.horaFim ? `${item.horaInicio} - ${item.horaFim}` : item.horaInicio
}
