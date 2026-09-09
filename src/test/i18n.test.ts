import { describe, expect, it } from 'vitest'
import { CHAVE_IDIOMA, DICIONARIOS, detectarIdioma, ehIdioma, idiomaInicial, salvarIdioma } from '../i18n'
import { IDIOMAS } from '../data/types'

/** Percorre o dicionario juntando todos os caminhos de chave. */
function caminhos(obj: unknown, prefixo = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefixo]
  return Object.entries(obj).flatMap(([k, v]) => caminhos(v, prefixo ? `${prefixo}.${k}` : k))
}

describe('dicionarios', () => {
  it('tem exatamente as mesmas chaves nos tres idiomas', () => {
    const referencia = caminhos(DICIONARIOS.pt).sort()
    for (const idioma of IDIOMAS) {
      expect(caminhos(DICIONARIOS[idioma]).sort(), `idioma ${idioma}`).toEqual(referencia)
    }
  })

  it('nao tem texto vazio', () => {
    for (const idioma of IDIOMAS) {
      const vazios: string[] = []
      const visitar = (obj: unknown, prefixo: string) => {
        if (typeof obj === 'string' && obj.trim() === '') vazios.push(prefixo)
        else if (typeof obj === 'object' && obj !== null) {
          for (const [k, v] of Object.entries(obj)) visitar(v, `${prefixo}.${k}`)
        }
      }
      visitar(DICIONARIOS[idioma], idioma)
      expect(vazios).toEqual([])
    }
  })

  it('nao usa travessao no texto da interface', () => {
    for (const idioma of IDIOMAS) {
      const comTravessao: string[] = []
      const visitar = (obj: unknown, prefixo: string) => {
        if (typeof obj === 'string' && /[—–]/.test(obj)) comTravessao.push(prefixo)
        else if (typeof obj === 'object' && obj !== null) {
          for (const [k, v] of Object.entries(obj)) visitar(v, `${prefixo}.${k}`)
        }
      }
      visitar(DICIONARIOS[idioma], idioma)
      expect(comTravessao).toEqual([])
    }
  })

  it('faz plural certo na contagem de itens', () => {
    expect(DICIONARIOS.pt.programacao.itensContagem(1)).toBe('1 item')
    expect(DICIONARIOS.pt.programacao.itensContagem(4)).toBe('4 itens')
    expect(DICIONARIOS.en.programacao.itensContagem(1)).toBe('1 item')
    expect(DICIONARIOS.es.programacao.itensContagem(2)).toBe('2 elementos')
  })
})

describe('deteccao de idioma', () => {
  it('reconhece os tres idiomas suportados', () => {
    expect(detectarIdioma(['pt-BR'])).toBe('pt')
    expect(detectarIdioma(['es-AR', 'en'])).toBe('es')
    expect(detectarIdioma(['en-US'])).toBe('en')
  })

  it('cai no portugues para idiomas nao suportados', () => {
    expect(detectarIdioma(['de-DE', 'fr'])).toBe('pt')
    expect(detectarIdioma([])).toBe('pt')
  })

  it('usa o primeiro idioma da lista que reconhece', () => {
    expect(detectarIdioma(['ja', 'en-GB', 'pt-BR'])).toBe('en')
  })

  it('aproxima o galego do portugues e o catalao do espanhol', () => {
    expect(detectarIdioma(['gl-ES'])).toBe('pt')
    expect(detectarIdioma(['ca-ES'])).toBe('es')
  })
})

describe('persistencia do idioma', () => {
  it('salva e recupera a escolha no aparelho', () => {
    salvarIdioma('en')
    expect(localStorage.getItem(CHAVE_IDIOMA)).toBe('en')
    expect(idiomaInicial()).toBe('en')
  })

  it('ignora valor invalido salvo e volta a detectar', () => {
    localStorage.setItem(CHAVE_IDIOMA, 'klingon')
    expect(IDIOMAS).toContain(idiomaInicial())
  })

  it('valida o formato do idioma', () => {
    expect(ehIdioma('pt')).toBe(true)
    expect(ehIdioma('fr')).toBe(false)
    expect(ehIdioma(null)).toBe(false)
  })
})
