export const ABAS = ['inicio', 'programacao', 'ativacoes', 'guia', 'info'] as const
export type Aba = (typeof ABAS)[number]

export const CHAVE_ABA = 'paraty.aba.v1'

export function ehAba(v: string | null | undefined): v is Aba {
  return typeof v === 'string' && (ABAS as readonly string[]).includes(v)
}

/**
 * Le a aba guardada no aparelho. Beneficios e Mapa viraram a aba Ativacoes,
 * entao quem tinha uma delas salva abre direto na nova.
 */
export function abaSalva(v: string | null | undefined): Aba | null {
  const atual = v === 'beneficios' || v === 'mapa' ? 'ativacoes' : v
  return ehAba(atual) ? atual : null
}
