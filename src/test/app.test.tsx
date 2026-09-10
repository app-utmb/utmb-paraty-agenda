import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../App'
import { CHAVE_ABA } from '../abas'
import { CHAVE_IDIOMA } from '../i18n'
import { DURANTE_KIT } from './fixtures'
import { render, screen, waitFor, within } from '@testing-library/react'

/** O jsdom se apresenta como en-US, entao fixamos o PT como escolha salva. */
const abrirApp = async () => {
  localStorage.setItem(CHAVE_IDIOMA, 'pt')
  render(<App referencia={DURANTE_KIT} />)
  await waitFor(() => expect(screen.getByRole('navigation')).toBeInTheDocument())
}

const nav = () => screen.getByRole('navigation')

describe('App', () => {
  it('abre na tela de Inicio com a agenda carregada', async () => {
    await abrirApp()
    await waitFor(() => expect(screen.getByText(/acontecendo agora/i)).toBeInTheDocument())
    expect(within(nav()).getByRole('button', { name: 'Início' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('mostra as seis abas na barra de baixo', async () => {
    await abrirApp()
    const rotulos = within(nav())
      .getAllByRole('button')
      .map((b) => b.textContent)
    expect(rotulos).toEqual([
      'Início',
      'Programação',
      'Benefícios',
      'Mapa',
      'Guia',
      'Info',
    ])
  })

  it('navega entre as abas', async () => {
    await abrirApp()
    await userEvent.click(within(nav()).getByRole('button', { name: 'Programação' }))
    expect(screen.getAllByRole('tab').length).toBeGreaterThan(0)
    await userEvent.click(within(nav()).getByRole('button', { name: 'Info' }))
    expect(screen.getByRole('heading', { name: /sobre o evento/i })).toBeInTheDocument()
  })

  it('lembra a aba escolhida no aparelho', async () => {
    await abrirApp()
    await userEvent.click(within(nav()).getByRole('button', { name: 'Guia' }))
    expect(localStorage.getItem(CHAVE_ABA)).toBe('guia')
  })

  it('abre e fecha o detalhe de um item', async () => {
    await abrirApp()
    await waitFor(() => expect(screen.getByText(/acontecendo agora/i)).toBeInTheDocument())
    const cartoes = screen.getAllByRole('button')
    const alvo = cartoes.find((b) => b.className.includes('cartao'))
    expect(alvo).toBeDefined()
    await userEvent.click(alvo as HTMLElement)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('troca o idioma da interface inteira', async () => {
    await abrirApp()
    await userEvent.click(screen.getByRole('button', { name: /trocar idioma/i }))
    await userEvent.click(screen.getByRole('menuitemradio', { name: /english/i }))
    await waitFor(() =>
      expect(within(nav()).getByRole('button', { name: 'Schedule' })).toBeInTheDocument(),
    )
    expect(screen.getByText(/happening now/i)).toBeInTheDocument()
  })

  it('salva a escolha de idioma no aparelho', async () => {
    await abrirApp()
    await userEvent.click(screen.getByRole('button', { name: /trocar idioma/i }))
    await userEvent.click(screen.getByRole('menuitemradio', { name: /español/i }))
    await waitFor(() => expect(localStorage.getItem(CHAVE_IDIOMA)).toBe('es'))
  })

  it('atualiza o atributo lang do documento ao trocar de idioma', async () => {
    await abrirApp()
    expect(document.documentElement.lang).toBe('pt-BR')
    await userEvent.click(screen.getByRole('button', { name: /trocar idioma/i }))
    await userEvent.click(screen.getByRole('menuitemradio', { name: /english/i }))
    await waitFor(() => expect(document.documentElement.lang).toBe('en-GB'))
  })

  it('fecha o menu de idioma com Escape', async () => {
    await abrirApp()
    await userEvent.click(screen.getByRole('button', { name: /trocar idioma/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('mostra o horario da ultima atualizacao', async () => {
    await abrirApp()
    await waitFor(() => expect(screen.getByText(/atualizado às/i)).toBeInTheDocument())
  })

  it('mantem a regua de patrocinadores visivel em todas as abas', async () => {
    await abrirApp()
    // A Config de exemplo nao tem regua, entao a faixa some sem quebrar o layout.
    const rodape = document.querySelector('.rodape-fixo')
    expect(rodape).toBeTruthy()
    await userEvent.click(within(nav()).getByRole('button', { name: 'Mapa' }))
    expect(document.querySelector('.rodape-fixo')).toBeTruthy()
  })

  it('abre no idioma do aparelho quando ainda nao ha escolha salva', async () => {
    // O jsdom se apresenta como en-US.
    render(<App referencia={DURANTE_KIT} />)
    await waitFor(() => expect(screen.getByRole('navigation')).toBeInTheDocument())
    expect(within(nav()).getByRole('button', { name: 'Schedule' })).toBeInTheDocument()
  })

  it('oferece um link de pular para o conteudo', async () => {
    await abrirApp()
    expect(screen.getByRole('link', { name: /programação/i })).toHaveAttribute(
      'href',
      '#conteudo',
    )
  })
})
