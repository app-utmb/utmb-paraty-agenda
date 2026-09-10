import { IconeLua, IconeMonitor, IconeSol } from './Icones'
import { useIdioma } from '../i18n'
import type { Tema } from '../tema'

const ICONES = { sistema: IconeMonitor, claro: IconeSol, escuro: IconeLua } as const

interface Props {
  tema: Tema
  aoTrocar: () => void
}

/** Botao unico que cicla entre seguir o aparelho, tema claro e tema escuro. */
export function SeletorTema({ tema, aoTrocar }: Props) {
  const { t } = useIdioma()
  const Icone = ICONES[tema]
  return (
    <button type="button" className="botao-tema" onClick={aoTrocar} title={t.tema[tema]}>
      <Icone />
      <span className="visualmente-oculto">
        {t.tema.rotulo}: {t.tema[tema]}
      </span>
    </button>
  )
}
