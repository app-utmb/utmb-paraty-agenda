import { useEffect, useId, useRef, useState } from 'react'
import { escolherIdioma } from '../data/normalize'
import type { Beneficio } from '../data/types'
import { useIdioma } from '../i18n'
import { IconeFechar, IconeSeta } from './Icones'

interface Props {
  beneficio: Beneficio
  aoFechar: () => void
}

/** Detalhe do beneficio em folha inferior, no mesmo padrao do item da agenda. */
export function DetalheBeneficio({ beneficio, aoFechar }: Props) {
  const { idioma, t } = useIdioma()
  const idTitulo = useId()
  const folha = useRef<HTMLDivElement>(null)
  const [logoFalhou, setLogoFalhou] = useState(false)

  useEffect(() => {
    const antesDoFoco = document.activeElement as HTMLElement | null
    folha.current?.focus()
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        aoFechar()
        return
      }
      if (e.key !== 'Tab' || !folha.current) return
      const focaveis = folha.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focaveis.length === 0) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (!primeiro || !ultimo) return
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = anterior
      antesDoFoco?.focus?.()
    }
  }, [aoFechar])

  const desconto = escolherIdioma(beneficio.desconto, idioma)
  const descricao = escolherIdioma(beneficio.descricao, idioma)
  const local = escolherIdioma(beneficio.local, idioma)
  const condicoes = escolherIdioma(beneficio.condicoes, idioma)

  return (
    <div
      className="folha-fundo"
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar()
      }}
    >
      <div
        className="folha"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        ref={folha}
      >
        <div className="folha__puxador" />

        <button type="button" className="folha__fechar" onClick={aoFechar}>
          <IconeFechar />
          <span className="visualmente-oculto">{t.detalhe.fechar}</span>
        </button>

        <div className="folha__marca" style={{ marginTop: 8 }}>
          {beneficio.logoUrl && !logoFalhou && (
            <img
              src={beneficio.logoUrl}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setLogoFalhou(true)}
            />
          )}
          <h2 className="folha__titulo" id={idTitulo} style={{ margin: 0 }}>
            {beneficio.nome}
          </h2>
        </div>

        <p className="beneficio__desconto beneficio__desconto--grande">{desconto}</p>

        <div className="folha__linha">
          <span className="folha__rotulo">{t.detalhe.local}</span>
          <span className="folha__valor">
            {local}
            <span style={{ display: 'block', color: 'var(--texto-fraco)', fontSize: 13 }}>
              {t.onde[beneficio.onde]} · {t.categorias[beneficio.categoria]}
            </span>
          </span>
        </div>

        {condicoes && (
          <div className="folha__linha">
            <span className="folha__rotulo">{t.beneficios.comoUsar}</span>
            <span className="folha__valor">{condicoes}</span>
          </div>
        )}

        {beneficio.validade && (
          <div className="folha__linha">
            <span className="folha__rotulo">{t.beneficios.validade}</span>
            <span className="folha__valor">{beneficio.validade}</span>
          </div>
        )}

        {descricao && <p className="folha__descricao">{descricao}</p>}

        <div className="atalhos">
          {beneficio.mapaUrl && (
            <a
              className="botao botao--secundario botao--pequeno"
              href={beneficio.mapaUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.beneficios.verNoMapa}
              <IconeSeta />
            </a>
          )}
          {beneficio.link && (
            <a
              className="botao botao--secundario botao--pequeno"
              href={beneficio.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.beneficios.abrirSite}
              <IconeSeta />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
