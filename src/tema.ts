export const TEMAS = ['sistema', 'claro', 'escuro'] as const
export type Tema = (typeof TEMAS)[number]

export const CHAVE_TEMA = 'paraty.tema.v1'

export function ehTema(v: string | null | undefined): v is Tema {
  return typeof v === 'string' && (TEMAS as readonly string[]).includes(v)
}

/** Tema salvo no aparelho, ou "sistema" enquanto o atleta nao escolheu. */
export function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA)
    if (ehTema(salvo)) return salvo
  } catch {
    // Sem armazenamento a escolha vale so nesta sessao.
  }
  return 'sistema'
}

export function salvarTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE_TEMA, tema)
  } catch {
    // Idem.
  }
}

/** Resolve "sistema" para o que o aparelho esta pedindo agora. */
export function temaEfetivo(tema: Tema): 'claro' | 'escuro' {
  if (tema !== 'sistema') return tema
  try {
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro'
  } catch {
    return 'escuro'
  }
}

/**
 * Aplica o tema no documento. O atributo data-tema e o que o CSS observa, e
 * a meta theme-color acompanha para a barra do navegador combinar.
 */
export function aplicarTema(tema: Tema): 'claro' | 'escuro' {
  const efetivo = temaEfetivo(tema)
  const raiz = document.documentElement
  raiz.setAttribute('data-tema', efetivo)
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', efetivo === 'claro' ? '#eef1f7' : '#070d1c')
  return efetivo
}

/** Proximo tema do ciclo do botao: sistema, claro, escuro. */
export function proximoTema(atual: Tema): Tema {
  const i = TEMAS.indexOf(atual)
  return TEMAS[(i + 1) % TEMAS.length] as Tema
}
