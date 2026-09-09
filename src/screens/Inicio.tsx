import { CartaoItem } from '../components/CartaoItem'
import { IconeSeta } from '../components/Icones'
import type { DadosApp, ItemProgramacao } from '../data/types'
import { useIdioma } from '../i18n'
import { acontecendoAgora, proximosItens } from '../utils/tempo'
import type { Aba } from '../abas'

interface Props {
  dados: DadosApp
  aoAbrirItem: (item: ItemProgramacao) => void
  aoIrPara: (aba: Aba) => void
  /** Injetavel para os testes fixarem o "agora". */
  referencia?: Date
}

export function Inicio({ dados, aoAbrirItem, aoIrPara, referencia }: Props) {
  const { t } = useIdioma()
  const agora = acontecendoAgora(dados.itens, referencia ?? new Date())
  const proximos = proximosItens(dados.itens, referencia ?? new Date(), 3)

  return (
    <div>
      <h1 className="visualmente-oculto">{dados.config.eventoNome}</h1>

      <section aria-labelledby="titulo-agora">
        <h2 className="secao-titulo" id="titulo-agora">
          {t.inicio.agora}
        </h2>
        {agora.length > 0 ? (
          agora.map((item) => <CartaoItem key={item.id} item={item} aoAbrir={aoAbrirItem} />)
        ) : (
          <div className="vazio">
            <p className="vazio__titulo">{t.inicio.nadaAgora}</p>
            <p className="vazio__dica">{t.inicio.boasVindas}</p>
          </div>
        )}
      </section>

      <section aria-labelledby="titulo-seguir" style={{ marginTop: 24 }}>
        <h2 className="secao-titulo" id="titulo-seguir">
          {t.inicio.aSeguir}
        </h2>
        {proximos.length > 0 ? (
          proximos.map((item) => (
            <CartaoItem key={item.id} item={item} aoAbrir={aoAbrirItem} mostrarData />
          ))
        ) : (
          <div className="vazio">
            <p className="vazio__titulo">{t.inicio.nadaSeguir}</p>
          </div>
        )}
      </section>

      <div className="atalhos">
        <button type="button" className="botao" onClick={() => aoIrPara('programacao')}>
          {t.inicio.verProgramacao}
          <IconeSeta />
        </button>
        <button
          type="button"
          className="botao botao--secundario"
          onClick={() => aoIrPara('guia')}
        >
          {t.inicio.abrirGuia}
          <IconeSeta />
        </button>
        <button
          type="button"
          className="botao botao--secundario"
          onClick={() => aoIrPara('mapa')}
        >
          {t.inicio.abrirMapa}
          <IconeSeta />
        </button>
      </div>
    </div>
  )
}
