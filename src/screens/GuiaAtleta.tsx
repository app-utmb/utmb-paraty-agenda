import { IconeSeta } from '../components/Icones'
import type { ConfigEvento } from '../data/types'
import { useIdioma } from '../i18n'

interface Props {
  config: ConfigEvento
}

export function GuiaAtleta({ config }: Props) {
  const { idioma, t } = useIdioma()
  const url = config.guiaAtletaUrl[idioma] || config.guiaAtletaUrl.pt

  return (
    <div>
      <h1 className="secao-titulo">{t.guia.titulo}</h1>

      <div className="bloco">
        <p>{t.guia.descricao}</p>
      </div>

      {url ? (
        <>
          <a className="botao" href={url} target="_blank" rel="noopener noreferrer">
            {t.guia.botao}
            <IconeSeta />
          </a>
          <p className="vazio__dica" style={{ marginTop: 12, textAlign: 'center' }}>
            {t.guia.aviso}
          </p>
        </>
      ) : (
        <div className="vazio">
          <p className="vazio__titulo">{t.guia.semLink}</p>
          <p className="vazio__dica">{t.guia.semLinkDica}</p>
        </div>
      )}
    </div>
  )
}
