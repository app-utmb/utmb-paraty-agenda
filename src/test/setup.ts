import '@testing-library/jest-dom/vitest'
import { afterEach, expect, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'

/**
 * Os testes nunca falam com a planilha de producao. Com as URLs vazias,
 * carregarDados usa os dados de exemplo embutidos, que sao deterministicos.
 * Quem precisa testar a rede sobrescreve este mock com vi.doMock.
 */
vi.mock('../config', async () => {
  const real = await vi.importActual<typeof import('../config')>('../config')
  return { ...real, URL_CSV_PROGRAMACAO: '', URL_CSV_CONFIG: '' }
})

expect.extend(toHaveNoViolations)

/**
 * O Node 25 injeta um localStorage global incompleto que se sobrepoe ao do
 * jsdom. Instalamos um Storage de memoria para os testes serem deterministicos.
 */
function storageDeMemoria(): Storage {
  let mapa = new Map<string, string>()
  return {
    get length() {
      return mapa.size
    },
    clear: () => {
      mapa = new Map()
    },
    getItem: (k: string) => mapa.get(k) ?? null,
    key: (i: number) => [...mapa.keys()][i] ?? null,
    removeItem: (k: string) => {
      mapa.delete(k)
    },
    setItem: (k: string, v: string) => {
      mapa.set(k, String(v))
    },
  }
}

const memoria = storageDeMemoria()
Object.defineProperty(window, 'localStorage', { value: memoria, configurable: true })
Object.defineProperty(globalThis, 'localStorage', { value: memoria, configurable: true })

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.restoreAllMocks()
})

// jsdom nao implementa scrollTo nem matchMedia.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}
