import { Grupo, LinhaExplicativa, LinhaLink } from '../components/LinhaInfo'
import {
  IconeAoVivo,
  IconeCalendario,
  IconeCelular,
  IconeEnvelope,
  IconeEtiqueta,
  IconeInfo,
  IconeInicio,
  IconeLink,
  IconeLivro,
  IconeMapa,
  IconeNuvemCortada,
  IconePino,
  IconeWhatsapp,
} from '../components/Icones'
import type { DadosApp } from '../data/types'
import { useIdioma } from '../i18n'

interface Props {
  dados: DadosApp
}

/** Extrai "paraty.utmb.world" de uma URL, para mostrar sem o ruido do http. */
function dominio(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Deixa o numero do WhatsApp legivel a partir do link wa.me. */
function telefone(url: string): string {
  const so = url.replace(/\D/g, '')
  if (so.length < 12) return url
  return `+${so.slice(0, 2)} ${so.slice(2, 4)} ${so.slice(4, 9)}-${so.slice(9)}`
}

export function Info({ dados }: Props) {
  const { t } = useIdioma()
  const { config } = dados

  return (
    <div>
      <h1 className="visualmente-oculto">{t.info.titulo}</h1>

      {(config.aoVivoUrl || config.faqUrl || config.siteOficial) && (
        <Grupo titulo={t.secoes.acompanhar}>
          {config.aoVivoUrl && (
            <LinhaLink
              icone={IconeAoVivo}
              rotulo={t.rotulos.aoVivo}
              sub={dominio(config.aoVivoUrl)}
              href={config.aoVivoUrl}
            />
          )}
          {config.faqUrl && (
            <LinhaLink icone={IconeInfo} rotulo={t.rotulos.faq} href={config.faqUrl} />
          )}
          {config.siteOficial && (
            <LinhaLink
              icone={IconeLink}
              rotulo={dominio(config.siteOficial)}
              sub={t.secoes.site}
              href={config.siteOficial}
            />
          )}
        </Grupo>
      )}

      <Grupo titulo={t.ajuda.titulo}>
        <LinhaExplicativa
          icone={IconeInfo}
          rotulo={t.ajuda.comoNavegar}
          texto={t.ajuda.comoNavegarTexto}
        />
        <LinhaExplicativa
          icone={IconeInicio}
          rotulo={t.abas.inicio}
          texto={t.ajuda.inicioTexto}
        />
        <LinhaExplicativa
          icone={IconeCalendario}
          rotulo={t.abas.programacao}
          texto={t.ajuda.programacaoTexto}
        />
        <LinhaExplicativa
          icone={IconeEtiqueta}
          rotulo={t.abas.beneficios}
          texto={t.ajuda.beneficiosTexto}
        />
        <LinhaExplicativa icone={IconeMapa} rotulo={t.abas.mapa} texto={t.ajuda.mapaTexto} />
        <LinhaExplicativa icone={IconeLivro} rotulo={t.guia.titulo} texto={t.ajuda.guiaTexto} />
        <LinhaExplicativa
          icone={IconeNuvemCortada}
          rotulo={t.ajuda.offline}
          texto={t.ajuda.offlineTexto}
        />
        <LinhaExplicativa
          icone={IconeCelular}
          rotulo={t.rotulos.instalarApp}
          texto={t.ajuda.instalarTexto}
        />
      </Grupo>

      {(config.contatoEmail || config.contatoWhatsapp) && (
        <Grupo titulo={t.secoes.contato}>
          {config.contatoEmail && (
            <LinhaLink
              icone={IconeEnvelope}
              rotulo={config.contatoEmail}
              sub={t.rotulos.email}
              href={`mailto:${config.contatoEmail}`}
            />
          )}
          {config.contatoWhatsapp && (
            <LinhaLink
              icone={IconeWhatsapp}
              rotulo={telefone(config.contatoWhatsapp)}
              sub={t.rotulos.whatsapp}
              href={config.contatoWhatsapp}
            />
          )}
        </Grupo>
      )}
      {config.localMaps && (
        <Grupo titulo={t.secoes.local}>
          <LinhaLink
            icone={IconePino}
            rotulo="Paraty, RJ"
            sub={t.rotulos.abrirMaps}
            href={config.localMaps}
          />
        </Grupo>
      )}

      <section className="grupo">
        <h2 className="grupo__titulo">{t.secoes.sobre}</h2>
        <p className="bloco-texto">{t.info.sobreTexto}</p>
      </section>

    </div>
  )
}
