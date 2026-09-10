import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { DetalheMarca } from '../components/DetalheMarca'
import { PONTOS_MAPA, REFERENCIA, type PontoMapa } from '../data/mapa'
import { lerCsv } from '../data/sheets'
import { MapaExpo } from '../screens/MapaExpo'
import { atividadesDaMarca, beneficiosDaMarca, listarDias } from '../utils/marca'
import { dadosDeTeste } from './fixtures'
import { renderizar, screen, within } from './utilitarios'

const dados = dadosDeTeste()
const ponto = (id: string) => PONTOS_MAPA.find((p) => p.id === id) as PontoMapa

describe('pontos do mapa', () => {
  it('tem id unico em cada ponto', () => {
    const ids = PONTOS_MAPA.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('mantem todo retangulo dentro da imagem', () => {
    for (const p of PONTOS_MAPA) {
      expect(p.x, p.id).toBeGreaterThanOrEqual(0)
      expect(p.y, p.id).toBeGreaterThanOrEqual(0)
      expect(p.x + p.w, p.id).toBeLessThanOrEqual(1)
      expect(p.y + p.h, p.id).toBeLessThanOrEqual(1)
      expect(p.w, p.id).toBeGreaterThan(0)
      expect(p.h, p.id).toBeGreaterThan(0)
    }
  })

  it('nao sobrepoe dois estandes', () => {
    const cruza = (a: PontoMapa, b: PontoMapa) =>
      a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
    const pares: string[] = []
    for (let i = 0; i < PONTOS_MAPA.length; i += 1) {
      for (let j = i + 1; j < PONTOS_MAPA.length; j += 1) {
        const a = PONTOS_MAPA[i] as PontoMapa
        const b = PONTOS_MAPA[j] as PontoMapa
        if (cruza(a, b)) pares.push(`${a.id} x ${b.id}`)
      }
    }
    expect(pares).toEqual([])
  })

  it('converte os pixels de referencia em fracao', () => {
    const hoka = ponto('hoka')
    expect(hoka.x).toBeCloseTo(218 / REFERENCIA.largura, 5)
    expect(hoka.y).toBeCloseTo(364 / REFERENCIA.altura, 5)
  })

  it('nao inclui o CAEX nem o estacionamento, que saem do mapa interativo', () => {
    const ids = PONTOS_MAPA.map((p) => p.id).join(' ')
    expect(ids).not.toMatch(/caex|estacionamento|carga/i)
  })

  /** Le uma coluna do CSV real, com o mesmo parser que o app usa. */
  const coluna = (arquivo: string, nome: string): string[] =>
    lerCsv(readFileSync(resolve(process.cwd(), arquivo), 'utf8'))
      .map((l) => (l[nome] ?? '').trim())

  /** A organizacao nao e expositora, entao nao tem estande no mapa. */
  const MARCA_EVENTO = 'paraty brazil by utmb'

  it('toda marca expositora da programacao real tem um ponto no mapa', () => {
    const noMapa = new Set(PONTOS_MAPA.flatMap((p) => p.marcas.map((m) => m.toLowerCase())))
    const semPonto = [...new Set(coluna('planilha/Programacao.csv', 'marca'))]
      .filter(Boolean)
      .map((m) => m.toLowerCase())
      .filter((m) => m !== MARCA_EVENTO)
      .filter((m) => !noMapa.has(m))
    expect(semPonto).toEqual([])
  })

  it('todo beneficio real tem um ponto no mapa', () => {
    const noMapa = new Set(PONTOS_MAPA.flatMap((p) => p.marcas.map((m) => m.toLowerCase())))
    const semPonto = [...new Set(coluna('planilha/Beneficios.csv', 'nome'))]
      .filter(Boolean)
      .filter((m) => !noMapa.has(m.toLowerCase()))
    expect(semPonto).toEqual([])
  })
})

describe('agrupamento por marca', () => {
  it('junta a mesma ativacao dos varios dias numa linha so', () => {
    const itens = dadosDeTeste().itens
    const r = atividadesDaMarca(ponto('hoka'), itens, 'pt')
    expect(r.length).toBeLessThanOrEqual(itens.filter((i) => i.marca === 'HOKA').length)
  })

  it('mostra o horario quando ele e igual em todos os dias', () => {
    const itens = [
      ...dados.itens.filter((i) => i.marca === 'The North Face'),
    ]
    const p = { ...ponto('hoka'), marcas: ['The North Face'] }
    const r = atividadesDaMarca(p, itens, 'pt')
    expect(r[0]?.horario).toBe('16:00 - 17:00')
  })

  it('acha o beneficio pelo nome da marca, ignorando caixa e acento', () => {
    const p = { ...ponto('hoka'), marcas: ['the north face'] }
    expect(beneficiosDaMarca(p, dados.beneficios).map((b) => b.nome)).toEqual(['The North Face'])
  })

  it('devolve vazio para estande sem marca', () => {
    expect(atividadesDaMarca(ponto('banheiros'), dados.itens, 'pt')).toEqual([])
    expect(beneficiosDaMarca(ponto('banheiros'), dados.beneficios)).toEqual([])
  })

  it('lista os dias em linguagem natural', () => {
    expect(listarDias(['2026-09-17'], 'e')).toBe('17')
    expect(listarDias(['2026-09-17', '2026-09-18'], 'e')).toBe('17 e 18')
    expect(listarDias(['2026-09-17', '2026-09-18', '2026-09-20'], 'e')).toBe('17, 18 e 20')
    expect(listarDias([], 'e')).toBe('')
  })
})

describe('tela do mapa', () => {
  it('desenha um ponto tocavel por estande', () => {
    renderizar(<MapaExpo config={dados.config} aoAbrirPonto={vi.fn()} />)
    const pontos = screen.getAllByRole('button').filter((b) => b.className.includes('mapa-ponto'))
    expect(pontos).toHaveLength(PONTOS_MAPA.length)
  })

  it('cada ponto tem nome acessivel com a marca e o estande', () => {
    renderizar(<MapaExpo config={dados.config} aoAbrirPonto={vi.fn()} />)
    expect(screen.getByRole('button', { name: /HOKA, Estande B1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Liquidz, Estande C5/i })).toBeInTheDocument()
  })

  it('abre o detalhe ao tocar num estande', async () => {
    const abrir = vi.fn()
    renderizar(<MapaExpo config={dados.config} aoAbrirPonto={abrir} />)
    await userEvent.click(screen.getByRole('button', { name: /AIMO, Estande E3/i }))
    expect(abrir).toHaveBeenCalledWith(expect.objectContaining({ id: 'aimo' }))
  })

  it('posiciona o ponto em porcentagem sobre a imagem', () => {
    renderizar(<MapaExpo config={dados.config} aoAbrirPonto={vi.fn()} />)
    const alvo = screen.getByRole('button', { name: /HOKA, Estande B1/i })
    expect(alvo.style.left).toMatch(/^15\.1/)
    expect(alvo.style.top).toMatch(/^44\.9/)
  })

  it('nao mostra pontos quando o mapa ainda nao foi publicado', () => {
    renderizar(
      <MapaExpo config={{ ...dados.config, mapaExpoUrl: '' }} aoAbrirPonto={vi.fn()} />,
    )
    expect(screen.queryByRole('button', { name: /HOKA/i })).not.toBeInTheDocument()
  })

  it('nao tem violacoes de acessibilidade', async () => {
    const { container } = renderizar(
      <MapaExpo config={dados.config} aoAbrirPonto={vi.fn()} />,
    )
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations()
  })
})

describe('detalhe da marca', () => {
  const abrir = (id: string) =>
    renderizar(
      <DetalheMarca
        ponto={ponto(id)}
        itens={dados.itens}
        beneficios={dados.beneficios}
        aoFechar={vi.fn()}
      />,
    )

  it('mostra o nome, o estande e o segmento', () => {
    abrir('liquidz')
    const dialogo = screen.getByRole('dialog')
    expect(within(dialogo).getByRole('heading', { name: 'Liquidz' })).toBeInTheDocument()
    expect(within(dialogo).getByText(/Estande C5/i)).toBeInTheDocument()
    expect(within(dialogo).getByText(/Hidratacao e eletrolitos/i)).toBeInTheDocument()
  })

  it('avisa quando o estande nao tem ativacao cadastrada', () => {
    abrir('garmin')
    expect(screen.getByText(/sem ativações cadastradas/i)).toBeInTheDocument()
  })

  it('nao mostra bloco de ativacoes em area de servico', () => {
    abrir('banheiros')
    expect(screen.queryByText(/o que acontece aqui/i)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Banheiros' })).toBeInTheDocument()
  })

  it('fecha com Escape', async () => {
    const fechar = vi.fn()
    renderizar(
      <DetalheMarca
        ponto={ponto('aimo')}
        itens={dados.itens}
        beneficios={dados.beneficios}
        aoFechar={fechar}
      />,
    )
    await userEvent.keyboard('{Escape}')
    expect(fechar).toHaveBeenCalled()
  })

  it('nao tem violacoes de acessibilidade', async () => {
    const { container } = abrir('liquidz')
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations()
  })
})
