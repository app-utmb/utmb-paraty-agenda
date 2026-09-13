import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { DetalheBeneficio } from '../components/DetalheBeneficio'
import {
  normalizarBeneficios,
  normalizarCategoria,
  normalizarOnde,
  ordenarBeneficios,
  paraBusca,
} from '../data/normalize'
import { lerCsv } from '../data/sheets'
import type { Beneficio } from '../data/types'
import { dadosDeTeste } from './fixtures'
import { renderizar, screen, within } from './utilitarios'

const CABECALHO =
  'id,onde,categoria,nome,desconto_pt,desconto_es,desconto_en,descricao_pt,descricao_es,descricao_en,local_pt,local_es,local_en,condicoes_pt,condicoes_es,condicoes_en,validade,logo_url,link,mapa_url,destaque'

function linha(campos: Partial<Record<string, string>>): string {
  const colunas = CABECALHO.split(',')
  const padrao: Record<string, string> = {
    id: 'b1',
    onde: 'expo',
    categoria: 'equipamentos',
    nome: 'Loja Exemplo',
    desconto_pt: '10% de desconto',
  }
  return colunas.map((c) => `"${(campos[c] ?? padrao[c] ?? '').replace(/"/g, '""')}"`).join(',')
}

function importar(...linhas: Partial<Record<string, string>>[]) {
  return normalizarBeneficios(lerCsv([CABECALHO, ...linhas.map(linha)].join('\n')))
}

const dados = dadosDeTeste()
const ben = (id: string) => dados.beneficios.find((b) => b.id === id) as Beneficio

describe('leitura dos beneficios', () => {
  it('importa uma linha completa nos tres idiomas', () => {
    const { dados: lidos, problemas } = importar({
      id: 'b9',
      nome: 'Marca X',
      desconto_pt: '20% de desconto',
      desconto_es: '20% de descuento',
      desconto_en: '20% off',
      local_pt: 'Estande 4',
      condicoes_pt: 'Mostre o peito',
      validade: '17 a 20 de setembro',
      link: 'https://exemplo.com',
      mapa_url: 'https://maps.app.goo.gl/x',
      destaque: 'sim',
    })
    expect(problemas).toHaveLength(0)
    const b = lidos[0] as Beneficio
    expect(b.desconto).toEqual({ pt: '20% de desconto', es: '20% de descuento', en: '20% off' })
    expect(b.validade).toBe('17 a 20 de setembro')
    expect(b.destaque).toBe(true)
  })

  it('usa o portugues quando o outro idioma esta vazio', () => {
    const { dados: lidos } = importar({ desconto_pt: 'Meia entrada', desconto_en: '' })
    expect((lidos[0] as Beneficio).desconto.en).toBe('Meia entrada')
  })

  it('descarta linha sem id, sem nome ou sem desconto', () => {
    expect(importar({ id: '' }).dados).toHaveLength(0)
    expect(importar({ nome: '' }).dados).toHaveLength(0)
    expect(importar({ desconto_pt: '' }).dados).toHaveLength(0)
  })

  it('descarta id repetido e mantem o primeiro', () => {
    const { dados: lidos } = importar({ id: 'r', nome: 'Primeiro' }, { id: 'r', nome: 'Segundo' })
    expect(lidos).toHaveLength(1)
    expect((lidos[0] as Beneficio).nome).toBe('Primeiro')
  })

  it('corrige lugar invalido para cidade', () => {
    const { dados: lidos, problemas } = importar({ onde: 'lua' })
    expect((lidos[0] as Beneficio).onde).toBe('cidade')
    expect(problemas[0]).toMatchObject({ campo: 'onde', gravidade: 'corrigida' })
  })

  it('corrige categoria invalida para servicos', () => {
    const { dados: lidos, problemas } = importar({ categoria: 'outra coisa' })
    expect((lidos[0] as Beneficio).categoria).toBe('servicos')
    expect(problemas[0]).toMatchObject({ campo: 'categoria', gravidade: 'corrigida' })
  })

  it('reconhece apelidos de lugar e de categoria', () => {
    expect(normalizarOnde('Na Expo')).toBe('expo')
    expect(normalizarOnde('PARATY')).toBe('cidade')
    expect(normalizarCategoria('Restaurantes')).toBe('alimentacao')
    expect(normalizarCategoria('pousada')).toBe('hospedagem')
    expect(normalizarCategoria('massagem')).toBe('servicos')
    expect(normalizarCategoria('inventada')).toBeNull()
  })

  it('reconhece apelidos escritos com espaco ou hifen', () => {
    expect(normalizarOnde('na expo')).toBe('expo')
    expect(normalizarOnde('Na Cidade')).toBe('cidade')
    expect(normalizarCategoria('Alimentação')).toBe('alimentacao')
  })

  it('ignora link, logo e mapa invalidos sem perder a linha', () => {
    const { dados: lidos, problemas } = importar({
      link: 'javascript:alert(1)',
      logo_url: 'nao-e-url',
      mapa_url: 'tambem-nao',
    })
    const b = lidos[0] as Beneficio
    expect(b.link).toBeNull()
    expect(b.logoUrl).toBeNull()
    expect(b.mapaUrl).toBeNull()
    expect(lidos).toHaveLength(1)
    expect(problemas).toHaveLength(3)
  })

  it('ordena destaques primeiro e depois alfabeticamente', () => {
    const { dados: lidos } = importar(
      { id: 'z', nome: 'Zebra' },
      { id: 'a', nome: 'Abacaxi' },
      { id: 'd', nome: 'Melancia', destaque: 'sim' },
    )
    expect(lidos.map((b) => b.nome)).toEqual(['Melancia', 'Abacaxi', 'Zebra'])
  })

  it('ordena ignorando acento', () => {
    const { dados: lidos } = importar({ id: '1', nome: 'Ácai' }, { id: '2', nome: 'Bar' })
    expect(lidos.map((b) => b.nome)).toEqual(['Ácai', 'Bar'])
  })

  it('nao modifica o array original ao ordenar', () => {
    const { dados: lidos } = importar({ id: '1', nome: 'B' }, { id: '2', nome: 'A' })
    const copia = [...lidos]
    ordenarBeneficios(lidos)
    expect(lidos).toEqual(copia)
  })

  it('aceita CSV so com cabecalho', () => {
    expect(normalizarBeneficios(lerCsv(`${CABECALHO}\n`)).dados).toEqual([])
  })

  it('normaliza o termo de busca sem acento e sem caixa', () => {
    expect(paraBusca('  Açaí  DA   Praça ')).toBe('acai da praca')
  })
})

describe('detalhe do beneficio', () => {
  it('mostra desconto, local, como usar e validade', () => {
    renderizar(<DetalheBeneficio beneficio={ben('t1')} aoFechar={vi.fn()} />)
    const dialogo = screen.getByRole('dialog')
    expect(within(dialogo).getByRole('heading', { name: 'The North Face' })).toBeInTheDocument()
    expect(within(dialogo).getByText('20% de desconto')).toBeInTheDocument()
    expect(within(dialogo).getByText('Estande TNF')).toBeInTheDocument()
    expect(within(dialogo).getByText('Mostre o numero de peito')).toBeInTheDocument()
    expect(within(dialogo).getByText('17 a 20 de setembro')).toBeInTheDocument()
  })

  it('mostra os botoes de mapa e site quando existem', () => {
    renderizar(<DetalheBeneficio beneficio={ben('t1')} aoFechar={vi.fn()} />)
    expect(screen.getByRole('link', { name: /ver no mapa/i })).toHaveAttribute(
      'href',
      'https://maps.app.goo.gl/tnf',
    )
    expect(screen.getByRole('link', { name: /abrir site/i })).toBeInTheDocument()
  })

  it('esconde os botoes quando a planilha nao preencheu', () => {
    renderizar(<DetalheBeneficio beneficio={ben('t2')} aoFechar={vi.fn()} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('fecha com Escape', async () => {
    const fechar = vi.fn()
    renderizar(<DetalheBeneficio beneficio={ben('t1')} aoFechar={fechar} />)
    await userEvent.keyboard('{Escape}')
    expect(fechar).toHaveBeenCalled()
  })

  it('nao tem violacoes de acessibilidade', async () => {
    const { container } = renderizar(
      <DetalheBeneficio beneficio={ben('t1')} aoFechar={vi.fn()} />,
    )
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } }),
    ).toHaveNoViolations()
  })
})
