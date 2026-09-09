import { useCallback, useEffect, useRef, useState } from 'react'
import { INTERVALO_REVALIDACAO_MS } from './config'
import { carregarDados, lerCache } from './data/sheets'
import type { DadosApp, ProblemaImportacao } from './data/types'

export interface EstadoDados {
  dados: DadosApp | null
  problemas: ProblemaImportacao[]
  carregando: boolean
  atualizando: boolean
  erroRede: string | null
  atualizar: () => Promise<void>
}

/**
 * Carrega a agenda ao abrir, revalida em intervalo enquanto o app esta em
 * primeiro plano, e revalida quando o app volta do segundo plano ou a
 * conexao retorna. Enquanto atualiza, a tela segue com os dados anteriores.
 */
export function useDados(): EstadoDados {
  const [dados, setDados] = useState<DadosApp | null>(() => lerCache())
  const [problemas, setProblemas] = useState<ProblemaImportacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erroRede, setErroRede] = useState<string | null>(null)
  const emVoo = useRef<AbortController | null>(null)
  const montado = useRef(true)

  const buscar = useCallback(async () => {
    emVoo.current?.abort()
    const controlador = new AbortController()
    emVoo.current = controlador
    setAtualizando(true)
    const resultado = await carregarDados(controlador.signal)
    if (!montado.current || controlador.signal.aborted) return
    setDados(resultado.dados)
    setProblemas(resultado.problemas)
    setErroRede(resultado.erroRede)
    setAtualizando(false)
    setCarregando(false)
  }, [])

  useEffect(() => {
    montado.current = true
    // Buscar a agenda ao montar e exatamente o caso previsto pelo useEffect:
    // sincronizar com um sistema externo. A regra abaixo mira em cascatas de
    // render vindas de estado derivado, que nao e o caso aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void buscar()

    const revalidarSeVisivel = () => {
      if (document.visibilityState === 'visible') void buscar()
    }
    const intervalo = window.setInterval(revalidarSeVisivel, INTERVALO_REVALIDACAO_MS)
    document.addEventListener('visibilitychange', revalidarSeVisivel)
    window.addEventListener('online', revalidarSeVisivel)

    return () => {
      montado.current = false
      emVoo.current?.abort()
      window.clearInterval(intervalo)
      document.removeEventListener('visibilitychange', revalidarSeVisivel)
      window.removeEventListener('online', revalidarSeVisivel)
    }
  }, [buscar])

  return { dados, problemas, carregando, atualizando, erroRede, atualizar: buscar }
}
