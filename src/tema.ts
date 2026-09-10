export const TEMAS = ['claro', 'escuro'] as const
export type Tema = (typeof TEMAS)[number]

export const CHAVE_TEMA = 'paraty.tema.v1'

export function ehTema(v: string | null | undefined): v is Tema {
  return typeof v === 'string' && (TEMAS as readonly string[]).includes(v)
}

/** O que o aparelho esta pedindo agora. */
export function temaDoAparelho(): Tema {
  try {
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro'
  } catch {
    return 'escuro'
  }
}

/**
 * Tema salvo no aparelho. Sem escolha ainda, segue a preferencia do sistema.
 * O botao alterna so entre claro e escuro: um terceiro estado "seguir o
 * aparelho" parecia nao fazer nada quando o sistema ja estava no mesmo tema.
 */
export function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA)
    if (ehTema(salvo)) return salvo
  } catch {
    // Sem armazenamento, segue a deteccao.
  }
  return temaDoAparelho()
}

export function salvarTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE_TEMA, tema)
  } catch {
    // A escolha vale so nesta sessao.
  }
}

/**
 * Aplica o tema no documento. O atributo data-tema e o que o CSS observa, e
 * a meta theme-color acompanha para a barra do navegador combinar.
 */
export function aplicarTema(tema: Tema): Tema {
  document.documentElement.setAttribute('data-tema', tema)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', tema === 'claro' ? '#eef1f7' : '#070d1c')
  return tema
}

export function proximoTema(atual: Tema): Tema {
  return atual === 'claro' ? 'escuro' : 'claro'
}
