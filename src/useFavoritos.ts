import { useCallback, useEffect, useState } from 'react'

export const CHAVE_FAVORITOS = 'paraty.favoritos.v1'

function ler(): string[] {
  try {
    const cru = localStorage.getItem(CHAVE_FAVORITOS)
    if (!cru) return []
    const salvo: unknown = JSON.parse(cru)
    return Array.isArray(salvo) ? salvo.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export interface EstadoFavoritos {
  favoritos: Set<string>
  ehFavorito: (id: string) => boolean
  alternar: (id: string) => void
  total: number
}

/**
 * A agenda montada pelo atleta. Fica so no aparelho dele, sem conta e sem
 * servidor, entao continua funcionando offline como o resto do app.
 */
export function useFavoritos(): EstadoFavoritos {
  const [favoritos, setFavoritos] = useState<Set<string>>(() => new Set(ler()))

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify([...favoritos]))
    } catch {
      // Sem armazenamento a agenda vale so nesta sessao.
    }
  }, [favoritos])

  const alternar = useCallback((id: string) => {
    setFavoritos((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }, [])

  const ehFavorito = useCallback((id: string) => favoritos.has(id), [favoritos])

  return { favoritos, ehFavorito, alternar, total: favoritos.size }
}
