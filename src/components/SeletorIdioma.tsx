import { useEffect, useId, useRef, useState } from 'react'
import { DICIONARIOS, useIdioma } from '../i18n'
import { IDIOMAS } from '../data/types'
import type { Idioma } from '../data/types'
import { IconeCheck, IconeGlobo } from './Icones'

/** Trocador de idioma no cabecalho, sempre acessivel. */
export function SeletorIdioma() {
  const { idioma, definirIdioma, t } = useIdioma()
  const [aberto, setAberto] = useState(false)
  const caixa = useRef<HTMLDivElement>(null)
  const idMenu = useId()

  useEffect(() => {
    if (!aberto) return
    const foraDoMenu = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false)
    }
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', foraDoMenu)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', foraDoMenu)
      document.removeEventListener('keydown', escape)
    }
  }, [aberto])

  const escolher = (i: Idioma) => {
    definirIdioma(i)
    setAberto(false)
  }

  return (
    <div className="idioma" ref={caixa}>
      <button
        type="button"
        className="idioma__botao"
        aria-expanded={aberto}
        aria-haspopup="true"
        aria-controls={idMenu}
        onClick={() => setAberto((v) => !v)}
      >
        <IconeGlobo />
        <span aria-hidden="true">{idioma.toUpperCase()}</span>
        <span className="visualmente-oculto">{t.trocarIdioma}</span>
      </button>

      {aberto && (
        <ul className="idioma__menu" id={idMenu} role="menu" aria-label={t.trocarIdioma}>
          {IDIOMAS.map((i) => (
            <li key={i} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={i === idioma}
                className="idioma__opcao"
                onClick={() => escolher(i)}
              >
                <span>{DICIONARIOS[i].idiomaNome}</span>
                {i === idioma ? <IconeCheck /> : <span className="idioma__sigla">{i.toUpperCase()}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
