import { useDeferredValue, useId, useMemo, useState } from 'react'
import { IconeBusca, IconeFechar } from '../components/Icones'
import { escolherIdioma, paraBusca } from '../data/normalize'
import type { Beneficio, CategoriaBeneficio, LocalBeneficio } from '../data/types'
import { CATEGORIAS_BENEFICIO, LOCAIS_BENEFICIO } from '../data/types'
import { useIdioma } from '../i18n'

type FiltroOnde = 'todos' | LocalBeneficio
type FiltroCategoria = 'todos' | CategoriaBeneficio

interface Props {
  beneficios: readonly Beneficio[]
  aoAbrir: (b: Beneficio) => void
}

/**
 * Lista de descontos. Pensada para passar de 50 estabelecimentos:
 * busca por nome sempre visivel, filtro de lugar como decisao principal,
 * e a categoria como refino. O desconto e o dado que o atleta procura,
 * entao ele ganha destaque no cartao.
 */
export function Beneficios({ beneficios, aoAbrir }: Props) {
  const { idioma, t } = useIdioma()
  const [onde, setOnde] = useState<FiltroOnde>('todos')
  const [categoria, setCategoria] = useState<FiltroCategoria>('todos')
  const [busca, setBusca] = useState('')
  const idBusca = useId()

  // Deixa a digitacao fluida mesmo com a lista longa.
  const buscaLenta = useDeferredValue(busca)

  // So mostra as categorias que existem no recorte atual, para nao oferecer
  // um filtro que devolve lista vazia.
  const categoriasDisponiveis = useMemo(() => {
    const base = onde === 'todos' ? beneficios : beneficios.filter((b) => b.onde === onde)
    const presentes = new Set(base.map((b) => b.categoria))
    return CATEGORIAS_BENEFICIO.filter((c) => presentes.has(c))
  }, [beneficios, onde])

  const lista = useMemo(() => {
    const termo = paraBusca(buscaLenta)
    return beneficios.filter((b) => {
      if (onde !== 'todos' && b.onde !== onde) return false
      if (categoria !== 'todos' && b.categoria !== categoria) return false
      if (!termo) return true
      const alvo = paraBusca(
        `${b.nome} ${escolherIdioma(b.desconto, idioma)} ${escolherIdioma(b.local, idioma)}`,
      )
      return alvo.includes(termo)
    })
  }, [beneficios, onde, categoria, buscaLenta, idioma])

  const trocarOnde = (novo: FiltroOnde) => {
    setOnde(novo)
    setCategoria('todos')
  }

  const temFiltro = onde !== 'todos' || categoria !== 'todos' || busca !== ''

  if (beneficios.length === 0) {
    return (
      <div>
        <h1 className="secao-titulo">{t.beneficios.titulo}</h1>
        <div className="vazio">
          <p className="vazio__titulo">{t.beneficios.semBeneficios}</p>
          <p className="vazio__dica">{t.beneficios.semBeneficiosDica}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="secao-titulo">{t.beneficios.titulo}</h1>
      <p className="vazio__dica" style={{ marginBottom: 12 }}>
        {t.beneficios.subtitulo}
      </p>

      <div className="busca">
        <IconeBusca className="busca__icone" />
        <label className="visualmente-oculto" htmlFor={idBusca}>
          {t.beneficios.busca}
        </label>
        <input
          id={idBusca}
          className="busca__campo"
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder={t.beneficios.busca}
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

      <div className="chips" role="group" aria-label={t.beneficios.filtroOnde}>
        <button
          type="button"
          className="chip"
          aria-pressed={onde === 'todos'}
          onClick={() => trocarOnde('todos')}
        >
          {t.beneficios.todos}
        </button>
        {LOCAIS_BENEFICIO.map((o) => (
          <button
            key={o}
            type="button"
            className="chip"
            aria-pressed={onde === o}
            onClick={() => trocarOnde(o)}
          >
            {t.onde[o]}
          </button>
        ))}
      </div>

      {categoriasDisponiveis.length > 1 && (
        <div className="chips chips--secundario" role="group" aria-label={t.beneficios.filtroCategoria}>
          <button
            type="button"
            className="chip chip--pequeno"
            aria-pressed={categoria === 'todos'}
            onClick={() => setCategoria('todos')}
          >
            {t.beneficios.todos}
          </button>
          {categoriasDisponiveis.map((c) => (
            <button
              key={c}
              type="button"
              className="chip chip--pequeno"
              aria-pressed={categoria === c}
              onClick={() => setCategoria(c)}
            >
              {t.categorias[c]}
            </button>
          ))}
        </div>
      )}

      <p className="secao-titulo" aria-live="polite">
        {t.beneficios.contagem(lista.length)}
      </p>

      {lista.length > 0 ? (
        lista.map((b) => <CartaoBeneficio key={b.id} beneficio={b} aoAbrir={aoAbrir} />)
      ) : (
        <div className="vazio">
          <p className="vazio__titulo">
            {busca ? t.beneficios.buscaVazia : t.beneficios.vazio}
          </p>
          <p className="vazio__dica">{busca ? t.beneficios.buscaDica : t.beneficios.vazioDica}</p>
          {temFiltro && (
            <button
              type="button"
              className="botao botao--secundario botao--pequeno"
              style={{ marginTop: 14 }}
              onClick={() => {
                setOnde('todos')
                setCategoria('todos')
                setBusca('')
              }}
            >
              {t.beneficios.limpar}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function CartaoBeneficio({
  beneficio,
  aoAbrir,
}: {
  beneficio: Beneficio
  aoAbrir: (b: Beneficio) => void
}) {
  const { idioma, t } = useIdioma()
  const [logoFalhou, setLogoFalhou] = useState(false)

  return (
    <button type="button" className="cartao cartao--beneficio" onClick={() => aoAbrir(beneficio)}>
      <span className="beneficio__logo" aria-hidden="true">
        {beneficio.logoUrl && !logoFalhou ? (
          <img
            src={beneficio.logoUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setLogoFalhou(true)}
          />
        ) : (
          <span className="beneficio__inicial">{beneficio.nome.slice(0, 1).toUpperCase()}</span>
        )}
      </span>

      <span className="beneficio__corpo">
        <span className="cartao__titulo">{beneficio.nome}</span>
        <span className="cartao__meta">
          <span className="etiqueta etiqueta--inscricao">{t.onde[beneficio.onde]}</span>
          <span>{t.categorias[beneficio.categoria]}</span>
        </span>
        <span className="beneficio__local">{escolherIdioma(beneficio.local, idioma)}</span>
      </span>

      <span className="beneficio__desconto">{escolherIdioma(beneficio.desconto, idioma)}</span>
    </button>
  )
}
