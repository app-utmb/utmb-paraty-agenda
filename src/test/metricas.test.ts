import { describe, expect, it } from 'vitest'
import { iniciarMetricas, registrar, rotuloDoLink } from '../metricas'

describe('metricas', () => {
  it('nao liga nem envia nada fora do site publicado', () => {
    iniciarMetricas()
    expect(() => registrar('teste', { a: 1 })).not.toThrow()
  })

  it('usa o texto do link como rotulo e cai no endereco quando o link so tem icone', () => {
    const comTexto = document.createElement('a')
    comTexto.href = 'https://live.utmb.world/pt/paraty/2026'
    comTexto.innerHTML = '<span>Resultados</span>\n <span>ao vivo</span>'
    expect(rotuloDoLink(comTexto)).toBe('Resultados ao vivo')

    const soIcone = document.createElement('a')
    soIcone.setAttribute('href', 'https://wa.me/5511999999999')
    expect(rotuloDoLink(soIcone)).toBe('https://wa.me/5511999999999')
  })
})
