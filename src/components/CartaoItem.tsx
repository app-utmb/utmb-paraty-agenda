import { useState } from 'react'
import { escolherIdioma } from '../data/normalize'
import type { ItemProgramacao } from '../data/types'
import { useIdioma } from '../i18n'
import { faixaHoraria } from '../utils/tempo'

interface Props {
  item: ItemProgramacao
  aoAbrir: (item: ItemProgramacao) => void
  /** Mostra a data alem do horario, util na tela de Inicio. */
  mostrarData?: boolean
}

export function CartaoItem({ item, aoAbrir, mostrarData = false }: Props) {
  const { idioma, t } = useIdioma()
  const [logoFalhou, setLogoFalhou] = useState(false)

  const titulo = escolherIdioma(item.titulo, idioma)
  const local = escolherIdioma(item.local, idioma)
  const pilarRotulo = t.pilares[item.pilar]

  return (
    <button
      type="button"
      className="cartao"
      style={{ ['--pilar-cor' as string]: `var(--${item.pilar})` }}
      onClick={() => aoAbrir(item)}
    >
      <span className="cartao__topo">
        <span className="cartao__hora">
          {mostrarData ? `${item.data.slice(8, 10)}/${item.data.slice(5, 7)} ` : ''}
          {faixaHoraria(item)}
        </span>
        <span className={`etiqueta etiqueta--${item.pilar}`}>{pilarRotulo}</span>
      </span>

      <span className="cartao__titulo">{titulo}</span>

      <span className="cartao__meta">
        {item.logoUrl && !logoFalhou && (
          <img
            className="cartao__logo"
            src={item.logoUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setLogoFalhou(true)}
          />
        )}
        {local && <span>{local}</span>}
        {item.palestrante && <span>{item.palestrante}</span>}
        {item.marca && <span>{item.marca}</span>}
        {item.inscricao !== 'livre' && (
          <span className="etiqueta etiqueta--inscricao">{t.inscricao[item.inscricao]}</span>
        )}
      </span>
    </button>
  )
}
