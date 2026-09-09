import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { useState } from 'react'
import type { Idioma } from '../data/types'
import { DICIONARIOS, IdiomaContext } from '../i18n'

function Provedor({ children, idioma = 'pt' }: { children: ReactNode; idioma?: Idioma }) {
  const [atual, setAtual] = useState<Idioma>(idioma)
  return (
    <IdiomaContext.Provider
      value={{ idioma: atual, definirIdioma: setAtual, t: DICIONARIOS[atual] }}
    >
      {children}
    </IdiomaContext.Provider>
  )
}

/** Renderiza com o contexto de idioma, no idioma pedido. */
export function renderizar(
  ui: ReactElement,
  { idioma = 'pt' as Idioma, ...opcoes }: RenderOptions & { idioma?: Idioma } = {},
) {
  return render(ui, {
    wrapper: ({ children }) => <Provedor idioma={idioma}>{children}</Provedor>,
    ...opcoes,
  })
}

export * from '@testing-library/react'
