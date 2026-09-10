import { IconeSeta } from '../components/Icones'
import type { DadosApp } from '../data/types'
import { useIdioma } from '../i18n'

interface Props {
  dados: DadosApp
}

export function Info({ dados }: Props) {
  const { t } = useIdioma()
  const { config } = dados

  const links: { rotulo: string; href: string }[] = []
  if (config.localMaps) links.push({ rotulo: t.info.comoChegar, href: config.localMaps })
  if (config.aoVivoUrl) links.push({ rotulo: t.info.aoVivo, href: config.aoVivoUrl })
  if (config.faqUrl) links.push({ rotulo: t.info.faq, href: config.faqUrl })
  if (config.siteOficial) links.push({ rotulo: t.info.site, href: config.siteOficial })
  if (config.contatoWhatsapp) links.push({ rotulo: t.info.whatsapp, href: config.contatoWhatsapp })
  if (config.contatoEmail)
    links.push({ rotulo: t.info.email, href: `mailto:${config.contatoEmail}` })

  return (
    <div>
      <h1 className="secao-titulo">{t.info.titulo}</h1>

      <div className="bloco">
        <h2 style={{ margin: '0 0 6px', fontSize: 18 }}>{config.eventoNome}</h2>
        <p style={{ color: 'var(--texto-fraco)' }}>{config.eventoDatas}</p>
        <p>{t.info.sobreTexto}</p>
      </div>

      {links.length > 0 && (
        <>
          <h2 className="secao-titulo">{t.info.links}</h2>
          <ul className="lista-links">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  className="botao botao--secundario botao--pequeno"
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.rotulo}
                  <IconeSeta />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="secao-titulo">{t.info.instalar}</h2>
      <div className="bloco">
        <p>{t.info.instalarIos}</p>
        <p>{t.info.instalarAndroid}</p>
        <p>{t.info.offline}</p>
      </div>

      <h2 className="secao-titulo">{t.info.versaoDados}</h2>
      <div className="bloco">
        <p>{t.info.origem[dados.origem]}</p>
      </div>
    </div>
  )
}
