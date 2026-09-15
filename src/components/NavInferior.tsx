import { useIdioma } from '../i18n'
import type { Aba } from '../abas'
import {
  IconeCalendario,
  IconeEtiqueta,
  IconeInfo,
  IconeInicio,
  IconeLivro,
} from './Icones'

const ICONES = {
  inicio: IconeInicio,
  programacao: IconeCalendario,
  ativacoes: IconeEtiqueta,
  guia: IconeLivro,
  info: IconeInfo,
} as const

interface Props {
  abas: readonly Aba[]
  ativa: Aba
  aoTrocar: (aba: Aba) => void
}

export function NavInferior({ abas, ativa, aoTrocar }: Props) {
  const { t } = useIdioma()
  return (
    <nav className="nav" aria-label={t.abas.programacao}>
      {abas.map((aba) => {
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
            <span className="nav__rotulo">{t.abas[aba]}</span>
          </button>
        )
      })}
    </nav>
  )
}
