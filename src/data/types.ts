export const IDIOMAS = ['pt', 'es', 'en'] as const
export type Idioma = (typeof IDIOMAS)[number]

export const PILARES = ['oficial', 'talks', 'ativacao'] as const
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
  config: ConfigEvento
  /** Timestamp ISO de quando os dados foram buscados com sucesso. */
  atualizadoEm: string
  /** "rede" quando veio do CSV agora, "cache" quando veio do armazenamento local,
   *  "exemplo" quando caiu nos dados de demonstracao embutidos. */
  origem: 'rede' | 'cache' | 'exemplo'
}
