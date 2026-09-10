import { IconeLua, IconeSol } from './Icones'
import { useIdioma } from '../i18n'
import type { Tema } from '../tema'

interface Props {
  tema: Tema
  aoTrocar: () => void
}

/** Alterna entre tema claro e escuro. O icone mostra para onde o toque leva. */
export function SeletorTema({ tema, aoTrocar }: Props) {
  const { t } = useIdioma()
  const proximo: Tema = tema === 'claro' ? 'escuro' : 'claro'
  const Icone = proximo === 'escuro' ? IconeLua : IconeSol
  return (
    <button type="button" className="botao-tema" onClick={aoTrocar} title={t.tema[proximo]}>
      <Icone />
      <span className="visualmente-oculto">{t.tema[proximo]}</span>
    </button>
  )
}
