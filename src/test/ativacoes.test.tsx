import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { abaSalva, abasVisiveis } from '../abas'
import { PONTOS_MAPA } from '../data/mapa'
import { Ativacoes, MARCAS_DA_EXPO } from '../screens/Ativacoes'
import { dadosDeTeste } from './fixtures'
import { renderizar, screen, within } from './utilitarios'

const dados = dadosDeTeste()
const abrir = (aoAbrirPonto = vi.fn(), aoAbrirBeneficio = vi.fn()) =>
  renderizar(
    <Ativacoes dados={dados} aoAbrirPonto={aoAbrirPonto} aoAbrirBeneficio={aoAbrirBeneficio} />,
  )
const cartoes = () => screen.getAllByRole('button').filter((b) => b.className === 'marca-tile')

describe('aba Ativacoes', () => {
  it('abre na grade com um cartao por marca, sem as areas de servico', () => {
    abrir()
    expect(cartoes()).toHaveLength(PONTOS_MAPA.filter((p) => p.tipo === 'marca').length)
    expect(screen.queryByRole('button', { name: /Banheiros/ })).not.toBeInTheDocument()
  })

  it('inclui a Strava, que nao tem estande na planta', () => {
    abrir()
    expect(screen.getByRole('button', { name: 'Strava' })).toBeInTheDocument()
  })

  it('lista as marcas em ordem alfabetica', () => {
    const nomes = MARCAS_DA_EXPO.map((p) => p.nome)
    expect(nomes).toEqual(
      [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })),
    )
  })

  it('abre o detalhe do estande ao tocar na marca', async () => {
    const aoAbrirPonto = vi.fn()
    abrir(aoAbrirPonto)
    await userEvent.click(screen.getByRole('button', { name: 'HOKA' }))
    expect(aoAbrirPonto).toHaveBeenCalledWith(expect.objectContaining({ id: 'hoka' }))
  })

  it('filtra as marcas pela busca, sem acento e sem caixa', async () => {
    abrir()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar marca' }), 'vivas')
    expect(cartoes().map((c) => c.textContent)).toEqual(['VIVÁS MOVE'])
  })

  it('avisa quando a busca nao acha nada', async () => {
    abrir()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar marca' }), 'zzzz')
    expect(screen.getByText('Nenhuma marca com esse nome')).toBeInTheDocument()
  })

  it('nao oferece mais o mapa', () => {
    abrir()
    expect(screen.queryByRole('button', { name: 'Mapa' })).not.toBeInTheDocument()
    expect(document.querySelector('.mapa-img')).toBeNull()
  })

  it('mantem acessiveis os beneficios de quem nao tem estande', async () => {
    const aoAbrirBeneficio = vi.fn()
    abrir(vi.fn(), aoAbrirBeneficio)
    const secao = screen.getByRole('heading', { name: 'Outros benefícios' }).closest('section')
    expect(secao).toBeTruthy()
    await userEvent.click(
      within(secao as HTMLElement).getByRole('button', { name: /The North Face/ }),
    )
    expect(aoAbrirBeneficio).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'The North Face' }),
    )
  })

  it('traduz a aba', () => {
    renderizar(<Ativacoes dados={dados} aoAbrirPonto={vi.fn()} aoAbrirBeneficio={vi.fn()} />, {
      idioma: 'en',
    })
    expect(screen.getByRole('heading', { name: 'Activations' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search brand' })).toBeInTheDocument()
  })

  it('nao tem violacoes de acessibilidade', async () => {
    const { container } = abrir()
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations()
  })
})

describe('aba guardada no aparelho', () => {
  it('leva quem tinha Beneficios ou Mapa salvo para Ativacoes', () => {
    expect(abaSalva('beneficios')).toBe('ativacoes')
    expect(abaSalva('mapa')).toBe('ativacoes')
    expect(abaSalva('guia')).toBe('guia')
    expect(abaSalva('qualquer')).toBeNull()
  })
})

describe('abas visiveis', () => {
  it('mostra o Guia so quando ha link do PDF', () => {
    expect(abasVisiveis(false)).toEqual(['inicio', 'programacao', 'ativacoes', 'info'])
    expect(abasVisiveis(true)).toEqual(['inicio', 'programacao', 'ativacoes', 'guia', 'info'])
  })
})
