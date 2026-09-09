import { useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { useIdioma } from '../i18n'
import { IconeAtualizar } from './Icones'

const LIMITE_PX = 70
const MAXIMO_PX = 96

interface Props {
  aoAtualizar: () => void | Promise<void>
  atualizando: boolean
  children: ReactNode
}

/**
 * Puxar para atualizar. So arma quando a pagina esta no topo, para nao
 * disputar com a rolagem normal da lista.
 */
export function PuxarParaAtualizar({ aoAtualizar, atualizando, children }: Props) {
  const { t } = useIdioma()
  const [puxada, setPuxada] = useState(0)
  const inicio = useRef<number | null>(null)

  const comecar = (e: TouchEvent) => {
    if (atualizando) return
    const topo = window.scrollY <= 0
    inicio.current = topo ? (e.touches[0]?.clientY ?? null) : null
  }

  const mover = (e: TouchEvent) => {
    if (inicio.current === null) return
    const y = e.touches[0]?.clientY ?? 0
    const delta = y - inicio.current
    if (delta <= 0) {
      setPuxada(0)
      return
    }
    // Resistencia: quanto mais puxa, menos anda.
    setPuxada(Math.min(MAXIMO_PX, delta * 0.5))
  }

  const soltar = () => {
    if (puxada >= LIMITE_PX) void aoAtualizar()
    inicio.current = null
    setPuxada(0)
  }

  const armado = puxada >= LIMITE_PX
  const altura = atualizando ? 34 : Math.round(puxada)

  return (
    <div onTouchStart={comecar} onTouchMove={mover} onTouchEnd={soltar} onTouchCancel={soltar}>
      <div className="puxar" style={{ height: altura }} aria-hidden={altura === 0}>
        {altura > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IconeAtualizar className={atualizando ? 'girando' : undefined} />
            {atualizando
              ? t.status.atualizando
              : armado
                ? t.status.solteParaAtualizar
                : t.status.puxarParaAtualizar}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
