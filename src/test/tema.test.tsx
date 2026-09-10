import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { CHAVE_IDIOMA } from '../i18n'
import { CHAVE_TEMA, aplicarTema, ehTema, proximoTema, temaDoAparelho, temaInicial } from '../tema'
import { DURANTE_KIT } from './fixtures'

/** Finge a preferencia do aparelho, que o jsdom nao expoe sozinho. */
function fingirSistema(claro: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((consulta: string) => ({
      matches: consulta.includes('light') ? claro : !claro,
      media: consulta,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  )
}

beforeEach(() => {
  document.documentElement.removeAttribute('data-tema')
  fingirSistema(false)
})

describe('escolha de tema', () => {
  it('sem escolha salva, comeca no tema do aparelho', () => {
    fingirSistema(true)
    expect(temaInicial()).toBe('claro')
    fingirSistema(false)
    expect(temaInicial()).toBe('escuro')
  })

  it('le a preferencia do aparelho', () => {
    fingirSistema(true)
    expect(temaDoAparelho()).toBe('claro')
    fingirSistema(false)
    expect(temaDoAparelho()).toBe('escuro')
  })

  it('alterna entre os dois temas, sem um terceiro estado', () => {
    expect(proximoTema('claro')).toBe('escuro')
    expect(proximoTema('escuro')).toBe('claro')
  })

  it('recupera a escolha salva e ignora valor invalido', () => {
    localStorage.setItem(CHAVE_TEMA, 'claro')
    expect(temaInicial()).toBe('claro')
    localStorage.setItem(CHAVE_TEMA, 'neon')
    fingirSistema(false)
    expect(temaInicial()).toBe('escuro')
  })

  it('valida o formato do tema', () => {
    expect(ehTema('claro')).toBe(true)
    expect(ehTema('neon')).toBe(false)
    expect(ehTema(null)).toBe(false)
  })

  it('marca o documento e a cor da barra do navegador', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)

    aplicarTema('claro')
    expect(document.documentElement.getAttribute('data-tema')).toBe('claro')
    expect(meta.getAttribute('content')).toBe('#eef1f7')

    aplicarTema('escuro')
    expect(document.documentElement.getAttribute('data-tema')).toBe('escuro')
    expect(meta.getAttribute('content')).toBe('#070d1c')
    meta.remove()
  })
})

describe('botao de tema no app', () => {
  const abrir = async () => {
    localStorage.setItem(CHAVE_IDIOMA, 'pt')
    render(<App referencia={DURANTE_KIT} />)
    await waitFor(() => expect(screen.getByRole('navigation')).toBeInTheDocument())
  }

  it('troca o tema do documento ao tocar, e volta no toque seguinte', async () => {
    await abrir()
    expect(document.documentElement.getAttribute('data-tema')).toBe('escuro')
    await userEvent.click(screen.getByRole('button', { name: /tema claro/i }))
    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-tema')).toBe('claro'),
    )
    await userEvent.click(screen.getByRole('button', { name: /tema escuro/i }))
    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-tema')).toBe('escuro'),
    )
  })

  it('salva a escolha no aparelho', async () => {
    await abrir()
    await userEvent.click(screen.getByRole('button', { name: /tema claro/i }))
    await waitFor(() => expect(localStorage.getItem(CHAVE_TEMA)).toBe('claro'))
  })

  it('mostra a logo do evento no cabecalho', async () => {
    await abrir()
    const logo = screen.getByRole('img', { name: /paraty brazil by utmb/i })
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo-evento'))
  })

  it('troca a logo junto com o tema', async () => {
    await abrir()
    const logo = () => screen.getByRole('img', { name: /paraty brazil by utmb/i })
    expect(logo().getAttribute('src')).toContain('logo-evento.png')
    await userEvent.click(screen.getByRole('button', { name: /tema claro/i }))
    await waitFor(() => expect(logo().getAttribute('src')).toContain('logo-evento-escura.png'))
  })

  it('a barra de navegacao continua completa depois de trocar o tema', async () => {
    await abrir()
    await userEvent.click(screen.getByRole('button', { name: /tema claro/i }))
    expect(within(screen.getByRole('navigation')).getAllByRole('button')).toHaveLength(6)
  })
})
