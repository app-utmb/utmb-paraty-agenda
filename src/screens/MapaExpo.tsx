import { useCallback, useRef, useState } from 'react'
import { IconeMais, IconeMenos } from '../components/Icones'
import type { ConfigEvento } from '../data/types'
import { useIdioma } from '../i18n'

const ZOOM_MIN = 1
const ZOOM_MAX = 5
const PASSO = 0.5

interface Props {
  config: ConfigEvento
}

/** Mapa da Expo com pinca para zoom, arraste e botoes equivalentes para teclado. */
export function MapaExpo({ config }: Props) {
  const { t } = useIdioma()
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [falhou, setFalhou] = useState(false)
  const arraste = useRef<{ x: number; y: number } | null>(null)
  const pinca = useRef<{ distancia: number; zoom: number } | null>(null)

  const limitar = useCallback((v: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v)), [])

  const ajustarZoom = (novo: number) => {
    const z = limitar(novo)
    setZoom(z)
    if (z === 1) setPos({ x: 0, y: 0 })
  }

  const distancia = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)

  const aoTocar = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]]
      if (a && b) pinca.current = { distancia: distancia(a, b), zoom }
      arraste.current = null
    } else if (e.touches.length === 1) {
      const toque = e.touches[0]
      if (toque) arraste.current = { x: toque.clientX - pos.x, y: toque.clientY - pos.y }
    }
  }

  const aoMover = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinca.current) {
      const [a, b] = [e.touches[0], e.touches[1]]
      if (!a || !b) return
      const fator = distancia(a, b) / pinca.current.distancia
      ajustarZoom(pinca.current.zoom * fator)
      return
    }
    const toque = e.touches[0]
    if (e.touches.length === 1 && arraste.current && toque && zoom > 1) {
      setPos({ x: toque.clientX - arraste.current.x, y: toque.clientY - arraste.current.y })
    }
  }

  const aoSoltar = () => {
    arraste.current = null
    pinca.current = null
  }

  if (!config.mapaExpoUrl || falhou) {
    return (
      <div>
        <h1 className="secao-titulo">{t.mapa.titulo}</h1>
        <div className="vazio">
          <p className="vazio__titulo">{t.mapa.semImagem}</p>
          <p className="vazio__dica">{t.mapa.semImagemDica}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="secao-titulo">{t.mapa.titulo}</h1>
      <p className="vazio__dica" style={{ marginBottom: 10 }}>
        {t.mapa.ajuda}
      </p>

      <div
        className="mapa-caixa"
        onTouchStart={aoTocar}
        onTouchMove={aoMover}
        onTouchEnd={aoSoltar}
        onTouchCancel={aoSoltar}
      >
        <img
          className="mapa-img"
          src={config.mapaExpoUrl}
          alt={t.mapa.alt}
          decoding="async"
          onError={() => setFalhou(true)}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            width: '100%',
          }}
        />
      </div>

      <div className="mapa-controles">
        <button
          type="button"
          className="botao botao--secundario botao--pequeno"
          onClick={() => ajustarZoom(zoom - PASSO)}
          disabled={zoom <= ZOOM_MIN}
        >
          <IconeMenos />
          <span className="visualmente-oculto">{t.mapa.reduzir}</span>
        </button>
        <button
          type="button"
          className="botao botao--secundario botao--pequeno"
          onClick={() => ajustarZoom(zoom + PASSO)}
          disabled={zoom >= ZOOM_MAX}
        >
          <IconeMais />
          <span className="visualmente-oculto">{t.mapa.ampliar}</span>
        </button>
        <button
          type="button"
          className="botao botao--secundario botao--pequeno"
          onClick={() => {
            setZoom(1)
            setPos({ x: 0, y: 0 })
          }}
        >
          {t.mapa.reset}
        </button>
      </div>
    </div>
  )
}
