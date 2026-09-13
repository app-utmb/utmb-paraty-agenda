import { useDeferredValue, useId, useMemo, useState } from 'react'
import { IconeBusca, IconeEtiqueta, IconeFechar } from '../components/Icones'
import { PONTOS_MAPA, type PontoMapa } from '../data/mapa'
import { escolherIdioma, paraBusca } from '../data/normalize'
import type { Beneficio, DadosApp } from '../data/types'
import { useIdioma } from '../i18n'
import { beneficiosDaMarca } from '../utils/marca'

interface Props {
  dados: DadosApp
  aoAbrirPonto: (p: PontoMapa) => void
  aoAbrirBeneficio: (b: Beneficio) => void
}

/** Estandes de marca em ordem alfabetica. Areas de servico ficam de fora. */
export const MARCAS_DA_EXPO = PONTOS_MAPA.filter((p) => p.tipo === 'marca').sort((a, b) =>
  a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }),
)

function CartaoMarca({
  ponto,
  temBeneficio,
  rotuloBeneficio,
  aoAbrir,
}: {
  ponto: PontoMapa
  temBeneficio: boolean
  rotuloBeneficio: string
  aoAbrir: (p: PontoMapa) => void
}) {
  const [logoFalhou, setLogoFalhou] = useState(false)
  const temLogo = ponto.logo && !logoFalhou

  return (
    <button type="button" className="marca-tile" onClick={() => aoAbrir(ponto)}>
      <span className="marca-tile__logo">
        {temLogo ? (
          <img
            src={`${import.meta.env.BASE_URL}logos/${ponto.logo}.png`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setLogoFalhou(true)}
          />
        ) : (
          <IconeEtiqueta />
        )}
      </span>
      <span className="marca-tile__nome">{ponto.nome}</span>
      {temBeneficio && <span className="marca-tile__tag">{rotuloBeneficio}</span>}
    </button>
  )
}

/**
 * Aba Ativacoes: junta os beneficios e as marcas da Expo numa grade com o
 * logo de cada marca, porque o atleta reconhece a marca antes de ler o nome.
 * Cada logo abre o detalhe do estande.
 */
export function Ativacoes({ dados, aoAbrirPonto, aoAbrirBeneficio }: Props) {
  const { idioma, t } = useIdioma()
  const [busca, setBusca] = useState('')
  const buscaLenta = useDeferredValue(busca)
  const idBusca = useId()

  const comBeneficio = useMemo(
    () =>
      new Set(
        MARCAS_DA_EXPO.filter((p) => beneficiosDaMarca(p, dados.beneficios).length > 0).map(
          (p) => p.id,
        ),
      ),
    [dados.beneficios],
  )

  // Beneficio de quem nao tem estande, como um restaurante da cidade, nao
  // tem logo na grade e precisa continuar acessivel.
  const semEstande = useMemo(() => {
    const ligados = new Set(
      PONTOS_MAPA.flatMap((p) => beneficiosDaMarca(p, dados.beneficios).map((b) => b.id)),
    )
    return dados.beneficios.filter((b) => !ligados.has(b.id))
  }, [dados.beneficios])

  const lista = useMemo(() => {
    const termo = paraBusca(buscaLenta)
    if (!termo) return MARCAS_DA_EXPO
    return MARCAS_DA_EXPO.filter((p) =>
      paraBusca(`${p.nome} ${p.marcas.join(' ')}`).includes(termo),
    )
  }, [buscaLenta])

  return (
    <div>
      <h1 className="secao-titulo">{t.ativacoes.titulo}</h1>
      <p className="vazio__dica" style={{ marginBottom: 12 }}>
        {t.ativacoes.dica}
      </p>

      <div className="busca">
        <IconeBusca className="busca__icone" />
        <label className="visualmente-oculto" htmlFor={idBusca}>
          {t.ativacoes.busca}
        </label>
        <input
          id={idBusca}
          className="busca__campo"
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder={t.ativacoes.busca}
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

      <p className="secao-titulo" aria-live="polite">
        {t.ativacoes.contagem(lista.length)}
      </p>

      {lista.length > 0 ? (
        <ul className="marcas-grade">
          {lista.map((p) => (
            <li key={p.id}>
              <CartaoMarca
                ponto={p}
                temBeneficio={comBeneficio.has(p.id)}
                rotuloBeneficio={t.ativacoes.beneficio}
                aoAbrir={aoAbrirPonto}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="vazio">
          <p className="vazio__titulo">{t.ativacoes.buscaVazia}</p>
          <p className="vazio__dica">{t.beneficios.buscaDica}</p>
        </div>
      )}

      {semEstande.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <h2 className="secao-titulo">{t.ativacoes.outrosBeneficios}</h2>
          <ul className="outros-beneficios">
            {semEstande.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className="outros-beneficios__item"
                  onClick={() => aoAbrirBeneficio(b)}
                >
                  <span className="outros-beneficios__nome">{b.nome}</span>
                  <span className="outros-beneficios__desconto">
                    {escolherIdioma(b.desconto, idioma)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
