import { useMemo, useState } from 'react'
import { CartaoItem } from '../components/CartaoItem'
import { IconeEstrela } from '../components/Icones'
import { SeletorMarca } from '../components/SeletorMarca'
import { DIAS_EVENTO } from '../config'
import type { DadosApp, ItemProgramacao, Pilar } from '../data/types'
import { PILARES } from '../data/types'
import { LOCALES, useIdioma } from '../i18n'
import { diaDoMes, diaPadrao, mesCurto, nomeDiaSemana } from '../utils/tempo'
import type { EstadoFavoritos } from '../useFavoritos'

type FiltroPilar = 'todos' | Pilar
type FiltroMarca = 'todas' | string

interface Props {
  dados: DadosApp
  aoAbrirItem: (item: ItemProgramacao) => void
  favoritos: EstadoFavoritos
  referencia?: Date
}

export function Programacao({ dados, aoAbrirItem, favoritos, referencia }: Props) {
  const { idioma, t } = useIdioma()
  const locale = LOCALES[idioma]

  // Usa os dias das datas reais da planilha, caindo nos dias oficiais
  // quando a planilha ainda nao tem itens.
  const dias = useMemo(() => {
    const daPlanilha = [...new Set(dados.itens.map((i) => i.data))].sort()
    return daPlanilha.length > 0 ? daPlanilha : [...DIAS_EVENTO]
  }, [dados.itens])

  const [dia, setDia] = useState(() => diaPadrao(dias, referencia ?? new Date()))
  const [pilar, setPilar] = useState<FiltroPilar>('todos')
  const [marca, setMarca] = useState<FiltroMarca>('todas')
  const [soAgenda, setSoAgenda] = useState(false)

  const diaAtivo = dias.includes(dia) ? dia : (dias[0] ?? dia)

  // So oferece marcas que aparecem no recorte de dia e pilar, para o filtro
  // nunca devolver lista vazia.
  const marcas = useMemo(() => {
    const base = dados.itens.filter(
      (i) => i.data === diaAtivo && (pilar === 'todos' || i.pilar === pilar),
    )
    return [...new Set(base.map((i) => i.marca).filter((m): m is string => Boolean(m)))].sort(
      (a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
    )
  }, [dados.itens, diaAtivo, pilar])

  const marcaAtiva = marca !== 'todas' && marcas.includes(marca) ? marca : 'todas'

  const itens = useMemo(
    () =>
      dados.itens.filter(
        (i) =>
          i.data === diaAtivo &&
          (pilar === 'todos' || i.pilar === pilar) &&
          (marcaAtiva === 'todas' || i.marca === marcaAtiva),
      ),
    [dados.itens, diaAtivo, pilar, marcaAtiva],
  )

  // A agenda montada pelo atleta e uma visao propria: mostra os quatro dias
  // de uma vez, porque o valor dela e ver o fim de semana inteiro.
  const daAgenda = useMemo(
    () => dados.itens.filter((i) => favoritos.favoritos.has(i.id)),
    [dados.itens, favoritos.favoritos],
  )

  const porDia = useMemo(() => {
    const grupos = new Map<string, ItemProgramacao[]>()
    for (const item of daAgenda) {
      const atual = grupos.get(item.data)
      if (atual) atual.push(item)
      else grupos.set(item.data, [item])
    }
    return [...grupos.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
  }, [daAgenda])

  const barraAgenda = (
    <button
      type="button"
      className="agenda-barra"
      aria-label={t.agenda.titulo}
      aria-pressed={soAgenda}
      onClick={() => setSoAgenda((v) => !v)}
    >
      <IconeEstrela className="agenda-barra__icone" cheia={soAgenda} />
      <span className="agenda-barra__texto">
        {favoritos.total > 0 ? t.agenda.titulo : t.agenda.chamada}
      </span>
      <span className="agenda-barra__conta">
        {favoritos.total > 0 ? favoritos.total : t.agenda.explicacao}
      </span>
    </button>
  )

  if (soAgenda) {
    return (
      <div>
        <h1 className="visualmente-oculto">{t.agenda.titulo}</h1>
        {barraAgenda}

        {porDia.length > 0 ? (
          porDia.map(([data, lista]) => (
            <section key={data}>
              <h2 className="dia-titulo">
                {nomeDiaSemana(data, locale)}, {diaDoMes(data)} {mesCurto(data, locale)}
              </h2>
              {lista.map((item) => (
                <CartaoItem
                  key={item.id}
                  item={item}
                  aoAbrir={aoAbrirItem}
                  favorito
                  aoAlternarFavorito={favoritos.alternar}
                />
              ))}
            </section>
          ))
        ) : (
          <div className="vazio">
            <p className="vazio__titulo">{t.agenda.vazia}</p>
            <p className="vazio__dica">{t.agenda.vaziaDica}</p>
            <button
              type="button"
              className="botao botao--secundario botao--pequeno"
              style={{ marginTop: 14 }}
              onClick={() => setSoAgenda(false)}
            >
              {t.agenda.verTudo}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h1 className="visualmente-oculto">{t.programacao.titulo}</h1>
      {barraAgenda}

      <div className="chips" role="tablist" aria-label={t.programacao.seletorDia}>
        {dias.map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            id={`aba-dia-${d}`}
            aria-selected={d === diaAtivo}
            aria-controls="lista-programacao"
            tabIndex={d === diaAtivo ? 0 : -1}
            className="chip chip-dia"
            onClick={() => setDia(d)}
          >
            <span className="chip-dia__num">{diaDoMes(d)}</span>
            <span className="chip-dia__dia">{nomeDiaSemana(d, locale).slice(0, 3)}</span>
            <span className="visualmente-oculto">
              {nomeDiaSemana(d, locale)} {diaDoMes(d)} {mesCurto(d, locale)}
            </span>
          </button>
        ))}
      </div>

      <div className="chips" role="group" aria-label={t.programacao.filtroPilar}>
        <button
          type="button"
          className="chip"
          aria-pressed={pilar === 'todos'}
          onClick={() => setPilar('todos')}
        >
          {t.programacao.todos}
        </button>
        {PILARES.map((p) => (
          <button
            key={p}
            type="button"
            className="chip"
            aria-pressed={pilar === p}
            style={{ ['--chip-cor' as string]: `var(--${p})` }}
            onClick={() => setPilar(p)}
          >
            {t.pilares[p]}
          </button>
        ))}
      </div>

      {marcas.length > 1 && (
        <SeletorMarca marcas={marcas} valor={marcaAtiva} aoEscolher={setMarca} />
      )}

      <p className="secao-titulo" aria-live="polite">
        {t.programacao.itensContagem(itens.length)}
      </p>

      <div
        id="lista-programacao"
        role="tabpanel"
        aria-labelledby={`aba-dia-${diaAtivo}`}
        tabIndex={-1}
      >
        {itens.length > 0 ? (
          itens.map((item) => (
            <CartaoItem
              key={item.id}
              item={item}
              aoAbrir={aoAbrirItem}
              favorito={favoritos.ehFavorito(item.id)}
              aoAlternarFavorito={favoritos.alternar}
            />
          ))
        ) : (
          <div className="vazio">
            <p className="vazio__titulo">{t.programacao.vazio}</p>
            <p className="vazio__dica">{t.programacao.vazioDica}</p>
          </div>
        )}
      </div>
    </div>
  )
}
