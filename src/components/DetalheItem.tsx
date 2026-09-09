import { useEffect, useId, useRef, useState } from 'react'
import { escolherIdioma } from '../data/normalize'
import type { ItemProgramacao } from '../data/types'
import { useIdioma } from '../i18n'
import { faixaHoraria, nomeDiaSemana } from '../utils/tempo'
import { LOCALES } from '../i18n'
import { IconeFechar, IconeSeta } from './Icones'

interface Props {
  item: ItemProgramacao
  aoFechar: () => void
}

/** Detalhe do item em folha inferior, com foco preso e fechamento por Escape. */
export function DetalheItem({ item, aoFechar }: Props) {
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

  const titulo = escolherIdioma(item.titulo, idioma)
  const descricao = escolherIdioma(item.descricao, idioma)
  const local = escolherIdioma(item.local, idioma)
  const diaSemana = nomeDiaSemana(item.data, LOCALES[idioma])

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
        style={{ ['--pilar-cor' as string]: `var(--${item.pilar})` }}
      >
        <div className="folha__puxador" />

        <button type="button" className="folha__fechar" onClick={aoFechar}>
          <IconeFechar />
          <span className="visualmente-oculto">{t.detalhe.fechar}</span>
        </button>

        <span className={`etiqueta etiqueta--${item.pilar}`}>{t.pilares[item.pilar]}</span>
        <h2 className="folha__titulo" id={idTitulo}>
          {titulo}
        </h2>

        <div className="folha__linha">
          <span className="folha__rotulo">{t.detalhe.horario}</span>
          <span className="folha__valor">
            {diaSemana}, {faixaHoraria(item)}
          </span>
        </div>

        {local && (
          <div className="folha__linha">
            <span className="folha__rotulo">{t.detalhe.local}</span>
            <span className="folha__valor">{local}</span>
          </div>
        )}

        {item.palestrante && (
          <div className="folha__linha">
            <span className="folha__rotulo">{t.detalhe.palestrante}</span>
            <span className="folha__valor">{item.palestrante}</span>
          </div>
        )}

        {item.marca && (
          <div className="folha__linha">
            <span className="folha__rotulo">{t.detalhe.marca}</span>
            <span className="folha__valor folha__marca">
              {item.logoUrl && !logoFalhou && (
                <img
                  src={item.logoUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => setLogoFalhou(true)}
                />
              )}
              <span>{item.marca}</span>
            </span>
          </div>
        )}

        <div className="folha__linha">
          <span className="folha__rotulo">{t.detalhe.entrada}</span>
          <span className="folha__valor">{t.inscricao[item.inscricao]}</span>
        </div>

        <p className="folha__descricao">{descricao || t.detalhe.semDescricao}</p>

        {item.inscricao === 'previa' && item.linkInscricao && (
          <div style={{ marginTop: 18 }}>
            <a
              className="botao"
              href={item.linkInscricao}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.inscricao.botaoInscrever}
              <IconeSeta />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
