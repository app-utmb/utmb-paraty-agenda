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

/**
 * Abas mostradas na barra. O Guia so aparece quando a Config tem o link do
 * PDF, para o atleta nao abrir uma aba vazia; preenchido o link, ela volta.
 */
export function abasVisiveis(temGuia: boolean): Aba[] {
  return ABAS.filter((a) => a !== 'guia' || temGuia)
}
