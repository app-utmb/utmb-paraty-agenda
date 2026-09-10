import { useEffect, useId, useRef, useState } from 'react'
import { escolherIdioma } from '../data/normalize'
import type { PontoMapa } from '../data/mapa'
import type { Beneficio, ItemProgramacao } from '../data/types'
import { useIdioma } from '../i18n'
import {
  atividadesDaMarca,
  beneficiosDaMarca,
  listarDias,
  localPrincipal,
} from '../utils/marca'
import { IconeFechar, IconeSeta } from './Icones'

interface Props {
  ponto: PontoMapa
  itens: readonly ItemProgramacao[]
  beneficios: readonly Beneficio[]
  aoFechar: () => void
}

/**
 * Detalhe do estande aberto pelo mapa. Mostra a marca, o segmento e o que
 * acontece ali, com as ativacoes agrupadas por titulo para nao repetir a
 * mesma coisa quatro vezes, uma por dia do evento.
 */
export function DetalheMarca({ ponto, itens, beneficios, aoFechar }: Props) {
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

  const atividades = atividadesDaMarca(ponto, itens, idioma)
  // O que acontece fora do estande da marca precisa dizer onde acontece.
  const ondeQuaseTudo = localPrincipal(atividades)
  const vantagens = beneficiosDaMarca(ponto, beneficios)
  const segmento = ponto.segmentos.map((x) => t.segmentos[x]).join(' · ')
  const logoSrc = ponto.logo ? `${import.meta.env.BASE_URL}logos/${ponto.logo}.png` : null

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
          {logoSrc && !logoFalhou && (
            <img
              src={logoSrc}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setLogoFalhou(true)}
            />
          )}
          <div>
            <h2 className="folha__titulo" id={idTitulo} style={{ margin: 0 }}>
              {ponto.nome}
            </h2>
            {ponto.estande && (
              <span className="marca__estande">
                {t.mapa.estande} {ponto.estande}
              </span>
            )}
          </div>
        </div>

        {segmento && (
          <div className="folha__linha">
            <span className="folha__rotulo">{t.mapa.segmento}</span>
            <span className="folha__valor">{segmento}</span>
          </div>
        )}

        {vantagens.map((b) => (
          <div className="folha__linha" key={b.id}>
            <span className="folha__rotulo">{t.mapa.beneficioDaMarca}</span>
            <span className="folha__valor">
              <span className="beneficio__desconto" style={{ maxWidth: 'none', textAlign: 'left' }}>
                {escolherIdioma(b.desconto, idioma)}
              </span>
              <span style={{ display: 'block', color: 'var(--texto-suave)', fontSize: 14 }}>
                {escolherIdioma(b.condicoes, idioma)}
              </span>
            </span>
          </div>
        ))}

        {ponto.tipo === 'marca' && (
          <>
            <h3 className="secao-titulo" style={{ marginTop: 20 }}>
              {t.mapa.ativacoesDaMarca}
            </h3>
            {atividades.length > 0 ? (
              <ul className="atividades">
                {atividades.map((a) => (
                  <li className="atividade" key={a.chave}>
                    <p className="atividade__titulo">{a.titulo}</p>
                    <p className="atividade__quando">
                      {listarDias(a.dias, t.mapa.conectorDias)} {t.mapa.setembro}
                      {a.horario ? ` · ${a.horario}` : ''}
                    </p>
                    {a.local && a.local !== ondeQuaseTudo && (
                      <p className="atividade__fora">
                        <span className={`etiqueta etiqueta--${a.pilar}`}>{t.pilares[a.pilar]}</span>
                        <span>{a.local}</span>
                      </p>
                    )}
                    {a.descricao && <p className="atividade__desc">{a.descricao}</p>}
                    {a.inscricao !== 'livre' && (
                      <span className="etiqueta etiqueta--inscricao">
                        {t.inscricao[a.inscricao]}
                      </span>
                    )}
                    {a.inscricao === 'previa' && a.linkInscricao && (
                      <a
                        className="botao botao--secundario botao--pequeno"
                        style={{ marginTop: 10 }}
                        href={a.linkInscricao}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.inscricao.botaoInscrever}
                        <IconeSeta />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="vazio__dica">{t.mapa.semAtividades}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
