import { useMemo, useState } from 'react'
import { CartaoItem } from '../components/CartaoItem'
import { DIAS_EVENTO } from '../config'
import type { DadosApp, ItemProgramacao, Pilar } from '../data/types'
import { PILARES } from '../data/types'
import { LOCALES, useIdioma } from '../i18n'
import { diaDoMes, diaPadrao, mesCurto, nomeDiaSemana } from '../utils/tempo'

type FiltroPilar = 'todos' | Pilar

interface Props {
  dados: DadosApp
  aoAbrirItem: (item: ItemProgramacao) => void
  referencia?: Date
}

export function Programacao({ dados, aoAbrirItem, referencia }: Props) {
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

  const diaAtivo = dias.includes(dia) ? dia : (dias[0] ?? dia)

  const itens = useMemo(
    () =>
      dados.itens.filter((i) => i.data === diaAtivo && (pilar === 'todos' || i.pilar === pilar)),
    [dados.itens, diaAtivo, pilar],
  )

  return (
    <div>
      <h1 className="visualmente-oculto">{t.programacao.titulo}</h1>

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
          itens.map((item) => <CartaoItem key={item.id} item={item} aoAbrir={aoAbrirItem} />)
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
