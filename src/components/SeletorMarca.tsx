import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { paraBusca } from '../data/normalize'
import { useIdioma } from '../i18n'
import { IconeBusca, IconeChevron, IconeFechar } from './Icones'

interface Props {
  marcas: readonly string[]
  /** "todas" ou o nome da marca escolhida. */
  valor: string
  aoEscolher: (valor: string) => void
}

/**
 * Filtro de marca em menu suspenso com busca. Vira lista longa assim que as
 * marcas passam de uma dezena, e uma fileira de chips deixaria de caber.
 */
export function SeletorMarca({ marcas, valor, aoEscolher }: Props) {
  const { t } = useIdioma()
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const caixa = useRef<HTMLDivElement>(null)
  const campo = useRef<HTMLInputElement>(null)
  const idMenu = useId()
  const idBusca = useId()

  useEffect(() => {
    if (!aberto) return
    campo.current?.focus()
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

  const filtradas = useMemo(() => {
    const termo = paraBusca(busca)
    if (!termo) return marcas
    return marcas.filter((m) => paraBusca(m).includes(termo))
  }, [marcas, busca])

  const escolher = (novo: string) => {
    aoEscolher(novo)
    setAberto(false)
    setBusca('')
  }

  const rotulo = valor === 'todas' ? t.programacao.todasMarcas : valor

  return (
    <div className="marca-filtro" ref={caixa}>
      <button
        type="button"
        className="marca-filtro__botao"
        aria-expanded={aberto}
        aria-haspopup="listbox"
        aria-controls={idMenu}
        data-escolhida={valor !== 'todas'}
        onClick={() => setAberto((v) => !v)}
      >
        <span className="visualmente-oculto">{t.programacao.filtroMarca}: </span>
        <span className="marca-filtro__rotulo">{rotulo}</span>
        <IconeChevron className="marca-filtro__seta" />
      </button>

      {aberto && (
        <div className="marca-filtro__painel">
          <div className="busca busca--compacta">
            <IconeBusca className="busca__icone" />
            <label className="visualmente-oculto" htmlFor={idBusca}>
              {t.programacao.buscarMarca}
            </label>
            <input
              id={idBusca}
              ref={campo}
              className="busca__campo"
              type="search"
              autoComplete="off"
              placeholder={t.programacao.buscarMarca}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button type="button" className="busca__limpar" onClick={() => setBusca('')}>
                <IconeFechar />
                <span className="visualmente-oculto">{t.beneficios.limparBusca}</span>
              </button>
            )}
          </div>

          <ul className="marca-filtro__lista" id={idMenu} role="listbox" aria-label={t.programacao.filtroMarca}>
            <li>
              <button
                type="button"
                role="option"
                aria-selected={valor === 'todas'}
                className="marca-filtro__opcao"
                onClick={() => escolher('todas')}
              >
                {t.programacao.todasMarcas}
              </button>
            </li>
            {filtradas.map((m) => (
              <li key={m}>
                <button
                  type="button"
                  role="option"
                  aria-selected={valor === m}
                  className="marca-filtro__opcao"
                  onClick={() => escolher(m)}
                >
                  {m}
                </button>
              </li>
            ))}
            {filtradas.length === 0 && (
              <li>
                <p className="marca-filtro__vazio">{t.beneficios.buscaVazia}</p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
