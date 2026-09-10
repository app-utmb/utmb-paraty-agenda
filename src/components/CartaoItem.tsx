import { useState } from 'react'
import { escolherIdioma } from '../data/normalize'
import type { ItemProgramacao } from '../data/types'
import { useIdioma } from '../i18n'
import { faixaHoraria } from '../utils/tempo'
import { IconeEstrela } from './Icones'

interface Props {
  item: ItemProgramacao
  aoAbrir: (item: ItemProgramacao) => void
  /** Mostra a data alem do horario, util na tela de Inicio. */
  mostrarData?: boolean
  favorito?: boolean
  aoAlternarFavorito?: (id: string) => void
}

export function CartaoItem({
  item,
  aoAbrir,
  mostrarData = false,
  favorito = false,
  aoAlternarFavorito,
}: Props) {
  const { idioma, t } = useIdioma()
  const [logoFalhou, setLogoFalhou] = useState(false)

  const titulo = escolherIdioma(item.titulo, idioma)
  const local = escolherIdioma(item.local, idioma)

  return (
    <div className="cartao" style={{ ['--pilar-cor' as string]: `var(--${item.pilar})` }}>
      {/* A area de toque e um botao proprio, para a estrela nao ficar aninhada
          dentro de outro botao, o que seria HTML invalido. */}
      <button type="button" className="cartao__area" onClick={() => aoAbrir(item)}>
        <span className="cartao__topo">
          <span className="cartao__hora">
            {mostrarData ? `${item.data.slice(8, 10)}/${item.data.slice(5, 7)} ` : ''}
            {faixaHoraria(item)}
          </span>
          <span className={`etiqueta etiqueta--${item.pilar}`}>{t.pilares[item.pilar]}</span>
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

      {aoAlternarFavorito && (
        <button
          type="button"
          className="cartao__estrela"
          aria-pressed={favorito}
          onClick={() => aoAlternarFavorito(item.id)}
        >
          <IconeEstrela cheia={favorito} />
          <span className="visualmente-oculto">
            {favorito ? t.agenda.remover : t.agenda.favoritar}: {titulo}
          </span>
        </button>
      )}
    </div>
  )
}
