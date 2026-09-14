import { POSTHOG_HOST, POSTHOG_TOKEN } from './config'

type Propriedades = Record<string, string | number | boolean | null>
type Cliente = { capture: (evento: string, propriedades?: Propriedades) => void }

/**
 * Metricas anonimas de uso. So liga no site publicado: em desenvolvimento e
 * nos testes nada sai do aparelho. A biblioteca carrega depois da tela, para
 * nao atrasar a abertura do app, e os eventos ate la ficam numa fila.
 */
let cliente: Cliente | null = null
let ligado = false
const fila: [string, Propriedades | undefined][] = []

export function iniciarMetricas(): void {
  if (ligado || !POSTHOG_TOKEN || !import.meta.env.PROD) return
  ligado = true
  document.addEventListener('click', aoClicar, true)

  void import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_TOKEN, {
        api_host: POSTHOG_HOST,
        cookieless_mode: 'always',
        person_profiles: 'never',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_external_dependency_loading: true,
      })
      cliente = posthog
      for (const [evento, propriedades] of fila.splice(0)) posthog.capture(evento, propriedades)
    })
    .catch(() => {
      // Sem a biblioteca (offline, bloqueador de anuncios) o app segue normal.
      ligado = false
    })
}

export function registrar(evento: string, propriedades?: Propriedades): void {
  if (!ligado) return
  try {
    if (cliente) cliente.capture(evento, propriedades)
    else if (fila.length < 200) fila.push([evento, propriedades])
  } catch {
    // Metrica nunca derruba a tela.
  }
}

/** Cada aba conta como uma pagina, para o painel de Web analytics listar as abas. */
export function registrarAba(aba: string): void {
  registrar('$pageview', {
    $current_url: `${location.origin}${import.meta.env.BASE_URL}${aba}`,
    $pathname: `/${aba}`,
    aba,
  })
}

/** Nome legivel do link: o texto dele, ou o endereco quando so tem icone. */
export function rotuloDoLink(link: HTMLAnchorElement): string {
  const texto = (link.textContent ?? '').replace(/\s+/g, ' ').trim()
  return texto || link.getAttribute('href') || ''
}

/** Links externos, e-mail e WhatsApp contam em um evento so, com o destino. */
function aoClicar(evento: MouseEvent): void {
  const alvo = evento.target instanceof Element ? evento.target.closest('a[href]') : null
  if (!(alvo instanceof HTMLAnchorElement)) return
  const href = alvo.href
  const externo = !href.startsWith(location.origin) || alvo.target === '_blank'
  if (!externo) return
  const dominio = /^[a-z]+:\/\/([^/?#]+)/i.exec(href)?.[1] ?? href.split(':')[0] ?? ''
  registrar('link_clicado', { rotulo: rotuloDoLink(alvo).slice(0, 120), url: href.slice(0, 300), dominio })
}
