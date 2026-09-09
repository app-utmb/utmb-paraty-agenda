import { useIdioma } from '../i18n'
import type { Aba } from '../abas'
import { ABAS } from '../abas'
import { IconeCalendario, IconeInfo, IconeInicio, IconeLivro, IconeMapa } from './Icones'

const ICONES = {
  inicio: IconeInicio,
  programacao: IconeCalendario,
  mapa: IconeMapa,
  guia: IconeLivro,
  info: IconeInfo,
} as const

interface Props {
  ativa: Aba
  aoTrocar: (aba: Aba) => void
}

export function NavInferior({ ativa, aoTrocar }: Props) {
  const { t } = useIdioma()
  return (
    <nav className="nav" aria-label={t.abas.programacao}>
      {ABAS.map((aba) => {
        const Icone = ICONES[aba]
        const atual = aba === ativa
        return (
          <button
            key={aba}
            type="button"
            className="nav__item"
            aria-current={atual ? 'page' : undefined}
            onClick={() => aoTrocar(aba)}
          >
            <Icone />
            <span>{t.abas[aba]}</span>
          </button>
        )
      })}
    </nav>
  )
}
