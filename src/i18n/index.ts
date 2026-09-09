import { createContext, useContext } from 'react'
import type { Idioma } from '../data/types'
import { IDIOMAS } from '../data/types'
import { en } from './en'
import { es } from './es'
import { pt, type Dicionario } from './pt'

export const DICIONARIOS: Record<Idioma, Dicionario> = { pt, es, en }

export const CHAVE_IDIOMA = 'paraty.idioma.v1'

export const LOCALES: Record<Idioma, string> = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-GB',
}

export function ehIdioma(v: string | null | undefined): v is Idioma {
  return typeof v === 'string' && (IDIOMAS as readonly string[]).includes(v)
}

/** Detecta o idioma do aparelho e cai no mais proximo, com PT como padrao. */
export function detectarIdioma(idiomasNavegador: readonly string[] = []): Idioma {
  for (const bruto of idiomasNavegador) {
    const base = bruto.toLowerCase().split('-')[0]
    if (ehIdioma(base)) return base
    // Variantes do portugues do Brasil e de Portugal ja caem no "pt" acima.
    if (base === 'gl') return 'pt'
    if (base === 'ca') return 'es'
  }
  return 'pt'
}

/** Idioma salvo no aparelho, ou o detectado quando ainda nao ha escolha. */
export function idiomaInicial(): Idioma {
  try {
    const salvo = localStorage.getItem(CHAVE_IDIOMA)
    if (ehIdioma(salvo)) return salvo
  } catch {
    // localStorage bloqueado: segue com a deteccao.
  }
  const navegador = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language])
  return detectarIdioma(navegador.filter(Boolean))
}

export function salvarIdioma(idioma: Idioma): void {
  try {
    localStorage.setItem(CHAVE_IDIOMA, idioma)
  } catch {
    // Sem armazenamento a escolha vale so nesta sessao.
  }
}

export interface ContextoIdioma {
  idioma: Idioma
  definirIdioma: (i: Idioma) => void
  t: Dicionario
}

export const IdiomaContext = createContext<ContextoIdioma>({
  idioma: 'pt',
  definirIdioma: () => {},
  t: pt,
})

export function useIdioma(): ContextoIdioma {
  return useContext(IdiomaContext)
}

export type { Dicionario }
