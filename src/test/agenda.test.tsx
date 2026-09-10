import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Programacao } from '../screens/Programacao'
import { CHAVE_FAVORITOS, useFavoritos } from '../useFavoritos'
import { DURANTE_KIT, dadosDeTeste } from './fixtures'
import { renderizar, screen, within } from './utilitarios'

const dados = dadosDeTeste()

describe('guarda dos favoritos', () => {
  it('comeca vazia', () => {
    const { result } = renderHook(() => useFavoritos())
    expect(result.current.total).toBe(0)
  })

  it('guarda e tira um item', () => {
    const { result } = renderHook(() => useFavoritos())
    act(() => result.current.alternar('a1'))
    expect(result.current.ehFavorito('a1')).toBe(true)
    expect(result.current.total).toBe(1)
    act(() => result.current.alternar('a1'))
    expect(result.current.ehFavorito('a1')).toBe(false)
  })

  it('salva no aparelho', () => {
    const { result } = renderHook(() => useFavoritos())
    act(() => result.current.alternar('a3'))
    expect(JSON.parse(localStorage.getItem(CHAVE_FAVORITOS) ?? '[]')).toEqual(['a3'])
  })

  it('recupera o que estava salvo', () => {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(['a1', 'a4']))
    const { result } = renderHook(() => useFavoritos())
    expect(result.current.total).toBe(2)
    expect(result.current.ehFavorito('a4')).toBe(true)
  })

  it('ignora conteudo corrompido em vez de estourar', () => {
    localStorage.setItem(CHAVE_FAVORITOS, '{ nao e json')
    expect(renderHook(() => useFavoritos()).result.current.total).toBe(0)
  })

  it('ignora entradas que nao sao texto', () => {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(['a1', 42, null]))
    expect(renderHook(() => useFavoritos()).result.current.total).toBe(1)
  })
})

/** Renderiza a programacao com uma guarda de favoritos de verdade. */
function TelaComAgenda() {
  const favoritos = useFavoritos()
  return (
    <Programacao
      dados={dados}
      aoAbrirItem={vi.fn()}
      favoritos={favoritos}
      referencia={DURANTE_KIT}
    />
  )
}

describe('agenda do atleta na programacao', () => {
  const estrelas = () =>
    screen.getAllByRole('button').filter((b) => b.className.includes('cartao__estrela'))

  it('mostra uma estrela em cada item', () => {
    renderizar(<TelaComAgenda />)
    expect(estrelas().length).toBe(3)
  })

  it('a estrela convida a montar a agenda antes do primeiro item', () => {
    renderizar(<TelaComAgenda />)
    expect(screen.getByText(/monte a sua agenda/i)).toBeInTheDocument()
  })

  it('guardar um item marca a estrela e atualiza a contagem', async () => {
    renderizar(<TelaComAgenda />)
    const estrela = estrelas()[0] as HTMLElement
    expect(estrela).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(estrela)
    expect(estrelas()[0]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Minha agenda' })).toHaveTextContent('1')
  })

  it('tocar na estrela nao abre o detalhe do item', async () => {
    const abrir = vi.fn()
    const Tela = () => {
      const favoritos = useFavoritos()
      return (
        <Programacao
          dados={dados}
          aoAbrirItem={abrir}
          favoritos={favoritos}
          referencia={DURANTE_KIT}
        />
      )
    }
    renderizar(<Tela />)
    await userEvent.click(estrelas()[0] as HTMLElement)
    expect(abrir).not.toHaveBeenCalled()
  })

  it('mostra so os itens guardados quando a agenda esta ligada', async () => {
    renderizar(<TelaComAgenda />)
    await userEvent.click(estrelas()[0] as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: 'Minha agenda' }))
    expect(screen.getByText('Retirada de kits')).toBeInTheDocument()
    expect(screen.queryByText('Nutricao no ultra')).not.toBeInTheDocument()
  })

  it('junta os quatro dias na agenda, com um titulo por dia', async () => {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(['a1', 'a4']))
    renderizar(<TelaComAgenda />)
    await userEvent.click(screen.getByRole('button', { name: 'Minha agenda' }))
    expect(screen.getByText('Retirada de kits')).toBeInTheDocument()
    // O a4 e do dia 18, fora do dia selecionado nos chips.
    expect(screen.getByText('Largada 100K')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
  })

  it('esconde os filtros de dia e pilar dentro da agenda', async () => {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(['a1']))
    renderizar(<TelaComAgenda />)
    await userEvent.click(screen.getByRole('button', { name: 'Minha agenda' }))
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Oficial' })).not.toBeInTheDocument()
  })

  it('avisa e oferece a volta quando a agenda esta vazia', async () => {
    renderizar(<TelaComAgenda />)
    await userEvent.click(screen.getByRole('button', { name: 'Minha agenda' }))
    expect(screen.getByText(/sua agenda está vazia/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /ver a programação toda/i }))
    expect(screen.getAllByRole('tab').length).toBeGreaterThan(0)
  })

  it('tirar o item da agenda o remove da lista na hora', async () => {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(['a1']))
    renderizar(<TelaComAgenda />)
    await userEvent.click(screen.getByRole('button', { name: 'Minha agenda' }))
    expect(screen.getByText('Retirada de kits')).toBeInTheDocument()
    await userEvent.click(estrelas()[0] as HTMLElement)
    expect(screen.getByText(/sua agenda está vazia/i)).toBeInTheDocument()
  })

  it('a estrela diz o que faz e para qual item', () => {
    renderizar(<TelaComAgenda />)
    expect(
      screen.getByRole('button', { name: /guardar na minha agenda: retirada de kits/i }),
    ).toBeInTheDocument()
  })

  it('nao tem violacoes de acessibilidade', async () => {
    const { container } = renderizar(<TelaComAgenda />)
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations()
  })

  it('traduz a agenda', async () => {
    renderizar(<TelaComAgenda />, { idioma: 'en' })
    expect(screen.getByText(/build your own schedule/i)).toBeInTheDocument()
    const lista = screen.getByRole('tabpanel')
    expect(within(lista).getAllByRole('button').length).toBeGreaterThan(0)
  })
})
