export const ABAS = ['inicio', 'programacao', 'beneficios', 'mapa', 'guia', 'info'] as const
export type Aba = (typeof ABAS)[number]

export const CHAVE_ABA = 'paraty.aba.v1'

export function ehAba(v: string | null | undefined): v is Aba {
  return typeof v === 'string' && (ABAS as readonly string[]).includes(v)
}
