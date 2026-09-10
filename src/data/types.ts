export const IDIOMAS = ['pt', 'es', 'en'] as const
export type Idioma = (typeof IDIOMAS)[number]

/**
 * Pilares da programacao. "talks" cobre palestras, paineis e rodas de conversa,
 * porque para o atleta e tudo conteudo de palco no mesmo lugar.
 */
export const PILARES = ['oficial', 'talks', 'ativacao', 'filmes'] as const
export type Pilar = (typeof PILARES)[number]

export const INSCRICOES = ['livre', 'previa', 'invite'] as const
export type Inscricao = (typeof INSCRICOES)[number]

/** Texto vindo da planilha nos tres idiomas. O PT e sempre a reserva. */
export interface TextoMultilingue {
  pt: string
  es: string
  en: string
}

export interface ItemProgramacao {
  id: string
  /** Data ISO YYYY-MM-DD, usada para agrupar e ordenar. */
  data: string
  diaSemana: string
  horaInicio: string
  horaFim: string | null
  /**
   * Data ISO do fim, quando o item atravessa a meia-noite. Vazia significa
   * que comeca e termina no mesmo dia.
   */
  dataFim: string | null
  pilar: Pilar
  titulo: TextoMultilingue
  descricao: TextoMultilingue
  local: TextoMultilingue
  palestrante: string | null
  marca: string | null
  logoUrl: string | null
  inscricao: Inscricao
  linkInscricao: string | null
  destaque: boolean
  /** Minutos desde a meia-noite, derivado de horaInicio. Usado para ordenar. */
  minutoInicio: number
  /** Minutos desde a meia-noite do fim, ou null quando nao ha hora_fim. */
  minutoFim: number | null
}

export interface ConfigEvento {
  eventoNome: string
  eventoDatas: string
  guiaAtletaUrl: Record<Idioma, string>
  mapaExpoUrl: string
  contatoWhatsapp: string
  contatoEmail: string
  siteOficial: string
  faqUrl: string
  aoVivoUrl: string
  localMaps: string
  reguaPatrocinadoresUrl: string
}

export interface ProblemaImportacao {
  linha: number
  campo: string
  motivo: string
  /** "descartada" quando a linha inteira foi ignorada, "corrigida" quando houve fallback. */
  gravidade: 'descartada' | 'corrigida'
}

export interface ResultadoImportacao<T> {
  dados: T
  problemas: ProblemaImportacao[]
}

export interface DadosApp {
  itens: ItemProgramacao[]
  beneficios: Beneficio[]
  config: ConfigEvento
  /** Timestamp ISO de quando os dados foram buscados com sucesso. */
  atualizadoEm: string
  /** "rede" quando veio do CSV agora, "cache" quando veio do armazenamento local,
   *  "exemplo" quando caiu nos dados de demonstracao embutidos. */
  origem: 'rede' | 'cache' | 'exemplo'
}

export const LOCAIS_BENEFICIO = ['expo', 'cidade'] as const
export type LocalBeneficio = (typeof LOCAIS_BENEFICIO)[number]

export const CATEGORIAS_BENEFICIO = [
  'alimentacao',
  'equipamentos',
  'hospedagem',
  'servicos',
  'experiencias',
] as const
export type CategoriaBeneficio = (typeof CATEGORIAS_BENEFICIO)[number]

/** Um desconto ou vantagem oferecida ao atleta, na Expo ou na cidade. */
export interface Beneficio {
  id: string
  onde: LocalBeneficio
  categoria: CategoriaBeneficio
  /** Nome do estabelecimento ou da marca. Nao traduz. */
  nome: string
  /** O desconto em si, ex "20% de desconto". E o dado que o atleta procura. */
  desconto: TextoMultilingue
  descricao: TextoMultilingue
  /** Onde encontrar, ex "Estande A12" ou "Rua da Matriz 120". */
  local: TextoMultilingue
  /** Regras de uso, ex "mediante apresentacao do numero de peito". */
  condicoes: TextoMultilingue
  validade: string | null
  logoUrl: string | null
  link: string | null
  mapaUrl: string | null
  destaque: boolean
}
