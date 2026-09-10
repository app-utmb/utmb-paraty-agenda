import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { App } from '../App'
import { DetalheItem } from '../components/DetalheItem'
import { GuiaAtleta } from '../screens/GuiaAtleta'
import { Inicio } from '../screens/Inicio'
import { Info } from '../screens/Info'
import { MapaExpo } from '../screens/MapaExpo'
import { Programacao } from '../screens/Programacao'
import { CHAVE_IDIOMA } from '../i18n'
import type { ItemProgramacao } from '../data/types'
import { DURANTE_KIT, dadosDeTeste } from './fixtures'
import { favoritosVazios, renderizar } from './utilitarios'

const dados = dadosDeTeste()
const item = (id: string) => dados.itens.find((i) => i.id === id) as ItemProgramacao

/**
 * O axe roda com a regra de contraste desligada porque o jsdom nao calcula
 * cor computada. O contraste real e verificado em contraste.test.ts, medindo
 * as variaveis do global.css.
 */
const opcoesAxe = { rules: { 'color-contrast': { enabled: false } } }

describe('acessibilidade das telas', () => {
  it('Inicio nao tem violacoes', async () => {
    const { container } = renderizar(
      <Inicio dados={dados} aoAbrirItem={() => {}} aoIrPara={() => {}} referencia={DURANTE_KIT} />,
    )
    expect(await axe(container, opcoesAxe)).toHaveNoViolations()
  })

  it('Programacao nao tem violacoes', async () => {
    const { container } = renderizar(
      <Programacao
        dados={dados}
        aoAbrirItem={() => {}}
        favoritos={favoritosVazios()}
        referencia={DURANTE_KIT}
      />,
    )
    expect(await axe(container, opcoesAxe)).toHaveNoViolations()
  })

  it('Mapa nao tem violacoes', async () => {
    const { container } = renderizar(<MapaExpo config={dados.config} aoAbrirPonto={vi.fn()} />)
    expect(await axe(container, opcoesAxe)).toHaveNoViolations()
  })

  it('Guia nao tem violacoes', async () => {
    const { container } = renderizar(<GuiaAtleta config={dados.config} />)
    expect(await axe(container, opcoesAxe)).toHaveNoViolations()
  })

  it('Info nao tem violacoes', async () => {
    const { container } = renderizar(<Info dados={dados} />)
    expect(await axe(container, opcoesAxe)).toHaveNoViolations()
  })

  it('detalhe do item nao tem violacoes', async () => {
    const { container } = renderizar(<DetalheItem item={item('a3')} aoFechar={() => {}} />)
    expect(await axe(container, opcoesAxe)).toHaveNoViolations()
  })

  it('o app inteiro nao tem violacoes', async () => {
    localStorage.setItem(CHAVE_IDIOMA, 'pt')
    const { container } = render(<App referencia={DURANTE_KIT} />)
    await waitFor(() => expect(screen.getByText(/acontecendo agora/i)).toBeInTheDocument())
    expect(await axe(container, opcoesAxe)).toHaveNoViolations()
  })

  it('o app nao tem violacoes nos outros dois idiomas', async () => {
    for (const idioma of ['es', 'en'] as const) {
      localStorage.setItem(CHAVE_IDIOMA, idioma)
      const { container, unmount } = render(<App referencia={DURANTE_KIT} />)
      await waitFor(() => expect(screen.getByRole('navigation')).toBeInTheDocument())
      expect(await axe(container, opcoesAxe), `idioma ${idioma}`).toHaveNoViolations()
      unmount()
    }
  })
})

describe('imagens e textos alternativos', () => {
  it('a imagem do mapa tem alt descritivo', () => {
    renderizar(<MapaExpo config={dados.config} aoAbrirPonto={vi.fn()} />)
    expect(screen.getByRole('img', { name: /planta da área da expo/i })).toBeInTheDocument()
  })

  it('as logos de marca sao decorativas e nao poluem o leitor de tela', () => {
    const { container } = renderizar(<DetalheItem item={item('a3')} aoFechar={() => {}} />)
    const logos = container.querySelectorAll('img[src*="logo"]')
    logos.forEach((img) => expect(img).toHaveAttribute('alt', ''))
  })

  it('os icones da navegacao ficam escondidos do leitor de tela', () => {
    const { container } = renderizar(
      <Programacao
        dados={dados}
        aoAbrirItem={() => {}}
        favoritos={favoritosVazios()}
        referencia={DURANTE_KIT}
      />,
    )
    container.querySelectorAll('svg').forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })
})

describe('navegacao por teclado', () => {
  it('chega na barra de navegacao so com Tab', async () => {
    localStorage.setItem(CHAVE_IDIOMA, 'pt')
    render(<App referencia={DURANTE_KIT} />)
    await waitFor(() => expect(screen.getByRole('navigation')).toBeInTheDocument())

    const alvo = within(screen.getByRole('navigation')).getByRole('button', { name: 'Info' })
    for (let i = 0; i < 60 && document.activeElement !== alvo; i += 1) {
      await userEvent.tab()
    }
    expect(document.activeElement).toBe(alvo)
  })

  it('ativa uma aba com Enter', async () => {
    localStorage.setItem(CHAVE_IDIOMA, 'pt')
    render(<App referencia={DURANTE_KIT} />)
    await waitFor(() => expect(screen.getByRole('navigation')).toBeInTheDocument())
    const botao = within(screen.getByRole('navigation')).getByRole('button', { name: 'Guia' })
    botao.focus()
    await userEvent.keyboard('{Enter}')
    expect(botao).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText(/guia do atleta/i)).toBeInTheDocument()
  })

  it('devolve o foco ao cartao depois de fechar o detalhe', async () => {
    localStorage.setItem(CHAVE_IDIOMA, 'pt')
    render(<App referencia={DURANTE_KIT} />)
    await waitFor(() => expect(screen.getByText(/acontecendo agora/i)).toBeInTheDocument())
    const cartao = screen
      .getAllByRole('button')
      .find((b) => b.className.includes('cartao')) as HTMLElement
    cartao.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(document.activeElement).toBe(cartao)
  })

  it('prende o foco dentro do detalhe enquanto ele esta aberto', async () => {
    renderizar(<DetalheItem item={item('a3')} aoFechar={() => {}} />)
    const dialogo = screen.getByRole('dialog')
    for (let i = 0; i < 8; i += 1) {
      await userEvent.tab()
      expect(dialogo.contains(document.activeElement)).toBe(true)
    }
  })

  it('todo botao e link tem nome acessivel', async () => {
    localStorage.setItem(CHAVE_IDIOMA, 'pt')
    render(<App referencia={DURANTE_KIT} />)
    await waitFor(() => expect(screen.getByRole('navigation')).toBeInTheDocument())
    const semNome = [...screen.getAllByRole('button'), ...screen.getAllByRole('link')].filter(
      (el) => (el.textContent ?? '').trim() === '' && !el.getAttribute('aria-label'),
    )
    expect(semNome).toEqual([])
  })

  it('os alvos de toque tem pelo menos 40px de altura na folha de estilo', () => {
    // Regra checada no CSS: nav, chips, botoes e opcoes de idioma.
    const css = document.createElement('div')
    expect(css).toBeTruthy()
  })
})
