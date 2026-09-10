import { escolherIdioma, paraBusca } from '../data/normalize'
import type { PontoMapa } from '../data/mapa'
import type { Beneficio, Idioma, ItemProgramacao, Pilar } from '../data/types'

/** Uma ativacao que acontece em varios dias vira uma linha so. */
export interface AtividadeResumida {
  chave: string
  titulo: string
  descricao: string
  /** Datas ISO em que acontece, em ordem. */
  dias: string[]
  /** "10:00 - 20:00" quando o horario e igual em todos os dias, senao null. */
  horario: string | null
  pilar: Pilar
  /** Onde acontece. Nem toda acao da marca e no estande dela. */
  local: string
  inscricao: ItemProgramacao['inscricao']
  linkInscricao: string | null
}

const casa = (ponto: PontoMapa, valor: string | null): boolean => {
  if (!valor) return false
  const alvo = paraBusca(valor)
  return ponto.marcas.some((m) => paraBusca(m) === alvo)
}

export function beneficiosDaMarca(
  ponto: PontoMapa,
  beneficios: readonly Beneficio[],
): Beneficio[] {
  return beneficios.filter((b) => casa(ponto, b.nome))
}

/**
 * Agrupa as ativacoes da marca pelo titulo, porque a mesma ativacao aparece
 * uma vez por dia na programacao e repetir isso no mapa polui a tela.
 */
export function atividadesDaMarca(
  ponto: PontoMapa,
  itens: readonly ItemProgramacao[],
  idioma: Idioma,
): AtividadeResumida[] {
  const daMarca = itens.filter((i) => casa(ponto, i.marca))
  const grupos = new Map<string, ItemProgramacao[]>()
  for (const item of daMarca) {
    const chave = item.titulo.pt
    const atual = grupos.get(chave)
    if (atual) atual.push(item)
    else grupos.set(chave, [item])
  }

  return [...grupos.entries()].map(([chave, lista]) => {
    const ordenada = [...lista].sort((a, b) =>
      a.data === b.data ? a.minutoInicio - b.minutoInicio : a.data < b.data ? -1 : 1,
    )
    const primeiro = ordenada[0] as ItemProgramacao
    const mesmoHorario = ordenada.every(
      (i) => i.horaInicio === primeiro.horaInicio && i.horaFim === primeiro.horaFim,
    )
    return {
      chave,
      titulo: escolherIdioma(primeiro.titulo, idioma),
      descricao: escolherIdioma(primeiro.descricao, idioma),
      dias: [...new Set(ordenada.map((i) => i.data))],
      horario: mesmoHorario
        ? primeiro.horaFim
          ? `${primeiro.horaInicio} - ${primeiro.horaFim}`
          : primeiro.horaInicio
        : null,
      pilar: primeiro.pilar,
      local: escolherIdioma(primeiro.local, idioma),
      inscricao: primeiro.inscricao,
      linkInscricao: primeiro.linkInscricao,
    }
  })
}

/** "17, 18 e 19" a partir das datas ISO, no formato curto do dia do mes. */
export function listarDias(dias: readonly string[], conector: string): string {
  const numeros = dias.map((d) => String(Number(d.slice(8, 10))))
  if (numeros.length <= 1) return numeros[0] ?? ''
  return `${numeros.slice(0, -1).join(', ')} ${conector} ${numeros[numeros.length - 1]}`
}

/**
 * O estande da marca. Ativacao e, por definicao, o que a marca faz no
 * proprio estande, entao o local delas e a referencia. Palestra e filme
 * acontecem no palco e ficam de fora da conta, senao uma marca com uma
 * ativacao e uma palestra daria empate e a escolha sairia arbitraria.
 * Sem nenhuma ativacao, vale o local mais repetido.
 */
export function localPrincipal(atividades: readonly AtividadeResumida[]): string | null {
  const maisRepetido = (lista: readonly AtividadeResumida[]): string | null => {
    const conta = new Map<string, number>()
    for (const a of lista) {
      if (!a.local) continue
      conta.set(a.local, (conta.get(a.local) ?? 0) + 1)
    }
    let melhor: string | null = null
    let maior = 0
    for (const [local, n] of conta) {
      if (n > maior) {
        melhor = local
        maior = n
      }
    }
    return melhor
  }
  return maisRepetido(atividades.filter((a) => a.pilar === 'ativacao')) ?? maisRepetido(atividades)
}
