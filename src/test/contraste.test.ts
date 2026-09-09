import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Contraste do tema escuro medido direto no global.css, para o teste
 * quebrar se alguem mexer numa cor e derrubar a legibilidade.
 */
const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8')

function variavel(nome: string): string {
  const m = new RegExp(`--${nome}:\\s*(#[0-9a-fA-F]{3,8});`).exec(css)
  if (!m?.[1]) throw new Error(`variavel --${nome} nao encontrada no global.css`)
  return m[1]
}

function paraRgb(hex: string): [number, number, number] {
  const limpo = hex.replace('#', '')
  const cheio =
    limpo.length === 3
      ? limpo
          .split('')
          .map((c) => c + c)
          .join('')
      : limpo
  return [
    parseInt(cheio.slice(0, 2), 16),
    parseInt(cheio.slice(2, 4), 16),
    parseInt(cheio.slice(4, 6), 16),
  ]
}

/** Luminancia relativa conforme a WCAG 2.1. */
function luminancia(hex: string): number {
  const canais = paraRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2]
}

export function contraste(frente: string, fundo: string): number {
  const a = luminancia(frente)
  const b = luminancia(fundo)
  const [claro, escuro] = a > b ? [a, b] : [b, a]
  return (claro + 0.05) / (escuro + 0.05)
}

const AA_TEXTO = 4.5
const AA_GRANDE = 3

describe('contraste do tema escuro', () => {
  const fundos = ['fundo', 'fundo-elevado', 'fundo-cartao', 'fundo-cartao-ativo']

  it.each(fundos)('texto principal sobre --%s passa em AA', (fundo) => {
    expect(contraste(variavel('texto'), variavel(fundo))).toBeGreaterThanOrEqual(AA_TEXTO)
  })

  it.each(fundos)('texto suave sobre --%s passa em AA', (fundo) => {
    expect(contraste(variavel('texto-suave'), variavel(fundo))).toBeGreaterThanOrEqual(AA_TEXTO)
  })

  it.each(fundos)('texto fraco sobre --%s passa em AA', (fundo) => {
    expect(contraste(variavel('texto-fraco'), variavel(fundo))).toBeGreaterThanOrEqual(AA_TEXTO)
  })

  it.each(['oficial', 'talks', 'ativacao'])(
    'a cor do pilar %s passa em AA sobre o fundo do app',
    (pilar) => {
      expect(contraste(variavel(pilar), variavel('fundo'))).toBeGreaterThanOrEqual(AA_TEXTO)
    },
  )

  it.each(['oficial', 'talks', 'ativacao'])(
    'a etiqueta do pilar %s passa em AA sobre o proprio fundo',
    (pilar) => {
      expect(contraste(variavel(pilar), variavel(`${pilar}-fundo`))).toBeGreaterThanOrEqual(
        AA_TEXTO,
      )
    },
  )

  it.each(['oficial', 'talks', 'ativacao'])(
    'a cor do pilar %s passa em AA sobre o fundo do cartao',
    (pilar) => {
      expect(contraste(variavel(pilar), variavel('fundo-cartao'))).toBeGreaterThanOrEqual(
        AA_TEXTO,
      )
    },
  )

  it('o texto do botao principal passa em AA sobre o acento', () => {
    expect(contraste(variavel('acento-texto'), variavel('acento'))).toBeGreaterThanOrEqual(
      AA_TEXTO,
    )
  })

  it('o anel de foco se destaca do fundo', () => {
    expect(contraste(variavel('acento'), variavel('fundo'))).toBeGreaterThanOrEqual(AA_GRANDE)
  })

  it('a borda dos cartoes se distingue do fundo', () => {
    expect(contraste(variavel('borda-forte'), variavel('fundo'))).toBeGreaterThanOrEqual(1.4)
  })

  it('o texto de erro passa em AA', () => {
    expect(contraste(variavel('perigo'), variavel('fundo-cartao'))).toBeGreaterThanOrEqual(
      AA_TEXTO,
    )
  })
})
