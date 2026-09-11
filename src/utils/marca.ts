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
  /**
   * Horarios por dia, preenchido so quando a acao tem sessoes em horarios
   * marcados que variam de um dia para o outro, como "17 as 15:00". Para
   * quem segue o horario da Expo o resumo por dias ja basta.
   */
  sessoes: { data: string; horas: string[] }[] | null
  inscricao: ItemProgramacao['inscricao']
  linkInscricao: string | null
}

const casa = (ponto: PontoMapa, valor: string | null): boolean => {
  if (!valor) return false
  const alvo = paraBusca(valor)
  return ponto.marcas.some((m) => paraBusca(m) === alvo)
}

const casaAlguma = (ponto: PontoMapa, valores: readonly string[]): boolean =>
  valores.some((v) => casa(ponto, v))

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
  const daMarca = itens.filter((i) => casaAlguma(ponto, i.marcas))
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
    // Sessao pontual e a que tem so hora de inicio, como um horario marcado
    // no estande. Quando essas sessoes variam de dia para dia, o horario e a
    // informacao principal e nao pode sumir do resumo.
    const pontuais = ordenada.every((i) => !i.horaFim)
    const sessoes =
      !mesmoHorario && pontuais
        ? [...new Set(ordenada.map((i) => i.data))].map((d) => ({
            data: d,
            horas: ordenada.filter((i) => i.data === d).map((i) => i.horaInicio),
          }))
        : null

    return {
      chave,
      sessoes,
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
 * O estande da marca, deduzido do local das ativacoes dela, ja que ativacao e
 * por definicao o que a marca faz no proprio estande. Sem nenhuma ativacao
 * nao ha referencia, e o app mostra o local de tudo.
 */
export function localPrincipal(atividades: readonly AtividadeResumida[]): string | null {
  const conta = new Map<string, number>()
  for (const a of atividades) {
    if (a.pilar !== 'ativacao' || !a.local) continue
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

/** Codigos de estande do ponto, ex "F8 e F9" vira ["F8", "F9"]. */
export function codigosDoEstande(estande: string): string[] {
  return estande.match(/[A-Z]\d+/g) ?? []
}

/**
 * Deve dizer onde acontece? Palestra e filme sao sempre no palco, entao
 * sempre dizem. Ativacao so diz quando foge do estande. A prova e o codigo
 * do estande no local, como "Estande Liquidz, C5"; sem codigo no ponto, vale
 * o local das outras ativacoes da marca.
 */
export function aconteceForaDoEstande(
  a: AtividadeResumida,
  codigos: readonly string[],
  estandeDeduzido: string | null,
): boolean {
  if (!a.local) return false
  if (a.pilar !== 'ativacao') return true
  if (codigos.length > 0) return !codigos.some((c) => new RegExp(`\\b${c}\\b`).test(a.local))
  return estandeDeduzido !== null && a.local !== estandeDeduzido
}
