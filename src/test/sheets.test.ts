import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_CACHE, gravarCache, lerCache, lerCsv } from '../data/sheets'
import type { DadosApp } from '../data/types'
import { CONFIG_PADRAO } from '../data/normalize'

const CSV_PROG = `id,data,hora_inicio,pilar,titulo_pt
n1,2026-09-17,10:00,talks,Da rede
`
const CSV_CONF = 'chave,valor\nevento_nome,Vindo da rede\n'

/** Recarrega o modulo com URLs de planilha definidas, para testar a rede. */
async function comPlanilhaConectada() {
  vi.resetModules()
  vi.doMock('../config', async () => {
    const real = await vi.importActual<typeof import('../config')>('../config')
    return {
      ...real,
      URL_CSV_PROGRAMACAO: 'https://docs.google.com/prog.csv',
      URL_CSV_CONFIG: 'https://docs.google.com/conf.csv',
    }
  })
  return import('../data/sheets')
}

const respostaOk = (texto: string) =>
  ({ ok: true, status: 200, text: async () => texto }) as Response

beforeEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('lerCsv', () => {
  it('usa a primeira linha como cabecalho', () => {
    expect(lerCsv('a,b\n1,2\n')).toEqual([{ a: '1', b: '2' }])
  })

  it('remove espaco em volta do nome da coluna', () => {
    expect(lerCsv(' a , b \n1,2\n')[0]).toEqual({ a: '1', b: '2' })
  })

  it('ignora linhas em branco', () => {
    expect(lerCsv('a\n1\n\n\n2\n')).toHaveLength(2)
  })

  it('devolve lista vazia para texto vazio', () => {
    expect(lerCsv('')).toEqual([])
  })
})

describe('cache local', () => {
  const exemplo: DadosApp = {
    itens: [],
    config: CONFIG_PADRAO,
    atualizadoEm: '2026-09-17T13:00:00.000Z',
    origem: 'rede',
  }

  it('grava e le marcando a origem como cache', () => {
    gravarCache(exemplo)
    expect(lerCache()?.origem).toBe('cache')
    expect(lerCache()?.atualizadoEm).toBe(exemplo.atualizadoEm)
  })

  it('devolve nulo quando nao ha nada salvo', () => {
    expect(lerCache()).toBeNull()
  })

  it('devolve nulo para conteudo corrompido em vez de estourar', () => {
    localStorage.setItem(CHAVE_CACHE, '{ isto nao e json')
    expect(lerCache()).toBeNull()
  })

  it('devolve nulo para JSON valido com formato errado', () => {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify({ qualquer: 'coisa' }))
    expect(lerCache()).toBeNull()
  })

  it('nao estoura quando o armazenamento recusa a gravacao', () => {
    const erro = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cheio')
    })
    expect(() => gravarCache(exemplo)).not.toThrow()
    erro.mockRestore()
  })
})

describe('carregarDados sem planilha conectada', () => {
  it('usa os dados de exemplo e marca a origem', async () => {
    const { carregarDados } = await import('../data/sheets')
    const r = await carregarDados()
    expect(r.dados.origem).toBe('exemplo')
    expect(r.dados.itens.length).toBeGreaterThan(0)
    expect(r.erroRede).toBeNull()
  })

  it('nao busca nada na rede', async () => {
    const fetchFalso = vi.fn()
    vi.stubGlobal('fetch', fetchFalso)
    const { carregarDados } = await import('../data/sheets')
    await carregarDados()
    expect(fetchFalso).not.toHaveBeenCalled()
  })
})

describe('carregarDados com planilha conectada', () => {
  it('busca as duas abas e monta os dados', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        respostaOk(url.includes('prog') ? CSV_PROG : CSV_CONF),
      ),
    )
    const { carregarDados } = await comPlanilhaConectada()
    const r = await carregarDados()
    expect(r.dados.origem).toBe('rede')
    expect(r.dados.itens[0]?.titulo.pt).toBe('Da rede')
    expect(r.dados.config.eventoNome).toBe('Vindo da rede')
    expect(r.erroRede).toBeNull()
  })

  it('salva no cache o que veio da rede', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => respostaOk(url.includes('prog') ? CSV_PROG : CSV_CONF)),
    )
    const { carregarDados } = await comPlanilhaConectada()
    await carregarDados()
    expect(localStorage.getItem(CHAVE_CACHE)).toContain('Da rede')
  })

  it('cai no cache quando a rede falha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => respostaOk(url.includes('prog') ? CSV_PROG : CSV_CONF)),
    )
    const primeiro = await comPlanilhaConectada()
    await primeiro.carregarDados()

    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    const segundo = await comPlanilhaConectada()
    const r = await segundo.carregarDados()
    expect(r.dados.origem).toBe('cache')
    expect(r.dados.itens[0]?.titulo.pt).toBe('Da rede')
    expect(r.erroRede).toBe('offline')
  })

  it('cai nos dados de exemplo quando falha a rede e nao ha cache', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('sem conexao')
    }))
    const { carregarDados } = await comPlanilhaConectada()
    const r = await carregarDados()
    expect(r.dados.origem).toBe('exemplo')
    expect(r.erroRede).toBe('sem conexao')
  })

  it('trata resposta HTTP de erro como falha de rede', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404, text: async () => '' }) as Response),
    )
    const { carregarDados } = await comPlanilhaConectada()
    const r = await carregarDados()
    expect(r.erroRede).toContain('404')
    expect(r.dados.origem).toBe('exemplo')
  })

  it('trata planilha sem itens validos como falha, para nao esvaziar a tela', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        respostaOk(url.includes('prog') ? 'id,data,hora_inicio,titulo_pt\n' : CSV_CONF),
      ),
    )
    const { carregarDados } = await comPlanilhaConectada()
    const r = await carregarDados()
    expect(r.erroRede).toContain('sem itens validos')
    expect(r.dados.itens.length).toBeGreaterThan(0)
  })
})
