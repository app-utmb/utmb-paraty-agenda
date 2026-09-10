import { CartaoItem } from '../components/CartaoItem'
import { IconeEstrela } from '../components/Icones'
import type { DadosApp, ItemProgramacao } from '../data/types'
import { useIdioma } from '../i18n'
import { acontecendoAgora, agoraNoEvento, proximosItens } from '../utils/tempo'
import type { EstadoFavoritos } from '../useFavoritos'

interface Props {
  dados: DadosApp
  aoAbrirItem: (item: ItemProgramacao) => void
  favoritos: EstadoFavoritos
  aoAbrirAgenda: () => void
  /** Injetavel para os testes fixarem o "agora". */
  referencia?: Date
}

export function Inicio({
  dados,
  aoAbrirItem,
  favoritos,
  aoAbrirAgenda,
  referencia,
}: Props) {
  const { t } = useIdioma()
  const agora = acontecendoAgora(dados.itens, referencia ?? new Date())
  const proximos = proximosItens(dados.itens, referencia ?? new Date(), 3)

  // Na abertura o atleta quer o proximo compromisso da agenda dele, nao a
  // lista inteira, entao aqui entram so os que ainda vao acontecer.
  const { data, minutos } = agoraNoEvento(referencia ?? new Date())
  const daAgenda = dados.itens
    .filter((i) => favoritos.favoritos.has(i.id))
    .filter((i) => i.data > data || (i.data === data && i.minutoInicio >= minutos))
    .slice(0, 3)

  return (
    <div>
      <header className="abertura">
        <h1 className="abertura__titulo">{t.inicio.boasVindasTitulo}</h1>
        <p className="abertura__texto">{t.inicio.boasVindasTexto}</p>
        {dados.config.eventoDatas && (
          <p className="abertura__datas">{dados.config.eventoDatas}</p>
        )}
      </header>

      <section aria-labelledby="titulo-agenda">
        <h2 className="secao-titulo" id="titulo-agenda">
          {t.agenda.titulo}
        </h2>
        {favoritos.total > 0 ? (
          <>
            {daAgenda.map((item) => (
              <CartaoItem
                key={item.id}
                item={item}
                aoAbrir={aoAbrirItem}
                mostrarData
                favorito
                aoAlternarFavorito={favoritos.alternar}
              />
            ))}
            <button type="button" className="botao botao--secundario" onClick={aoAbrirAgenda}>
              <IconeEstrela cheia />
              {t.agenda.contagem(favoritos.total)}
            </button>
          </>
        ) : (
          <button type="button" className="vazio vazio--acionavel" onClick={aoAbrirAgenda}>
            <span className="vazio__titulo">{t.agenda.chamada}</span>
            <span className="vazio__dica">{t.agenda.explicacao}</span>
          </button>
        )}
      </section>

      <section aria-labelledby="titulo-agora" style={{ marginTop: 24 }}>
        <h2 className="secao-titulo" id="titulo-agora">
          {t.inicio.agora}
        </h2>
        {agora.length > 0 ? (
          agora.map((item) => (
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
            <CartaoItem
              key={item.id}
              item={item}
              aoAbrir={aoAbrirItem}
              mostrarData
              favorito={favoritos.ehFavorito(item.id)}
              aoAlternarFavorito={favoritos.alternar}
            />
          ))
        ) : (
          <div className="vazio">
            <p className="vazio__titulo">{t.inicio.nadaSeguir}</p>
          </div>
        )}
      </section>

    </div>
  )
}
