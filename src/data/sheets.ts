import Papa from 'papaparse'
import {
  INTERVALO_REVALIDACAO_MS,
  TIMEOUT_REDE_MS,
  URL_CSV_BENEFICIOS,
  URL_CSV_CONFIG,
  URL_CSV_PROGRAMACAO,
} from '../config'
import {
  CSV_BENEFICIOS_EXEMPLO,
  CSV_CONFIG_EXEMPLO,
  CSV_PROGRAMACAO_EXEMPLO,
} from './exemplo'
import { normalizarBeneficios, normalizarConfig, normalizarProgramacao } from './normalize'
import type { DadosApp, ProblemaImportacao } from './types'

export const CHAVE_CACHE = 'paraty.dados.v1'

export interface ResultadoCarga {
  dados: DadosApp
  problemas: ProblemaImportacao[]
  /** Preenchido quando a rede falhou e o app seguiu com cache ou exemplo. */
  erroRede: string | null
}

/** Le um CSV em texto e devolve as linhas como objetos com cabecalho. */
export function lerCsv(texto: string): Record<string, string | undefined>[] {
  const r = Papa.parse<Record<string, string | undefined>>(texto, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  })
  return r.data ?? []
}

async function baixarTexto(url: string, sinal?: AbortSignal): Promise<string> {
  const controlador = new AbortController()
  const timeout = setTimeout(() => controlador.abort(), TIMEOUT_REDE_MS)
  const encerrar = () => controlador.abort()
  sinal?.addEventListener('abort', encerrar)
  try {
    // cache "no-store" evita o cache do navegador. O cache do proprio Google
    // (poucos minutos) continua valendo e esta documentado no README.
    const resp = await fetch(url, { cache: 'no-store', signal: controlador.signal })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    return await resp.text()
  } finally {
    clearTimeout(timeout)
    sinal?.removeEventListener('abort', encerrar)
  }
}

function montar(
  csvProgramacao: string,
  csvConfig: string,
  csvBeneficios: string,
  origem: DadosApp['origem'],
  atualizadoEm: string,
): { dados: DadosApp; problemas: ProblemaImportacao[] } {
  const prog = normalizarProgramacao(lerCsv(csvProgramacao))
  const conf = normalizarConfig(lerCsv(csvConfig))
  const ben = normalizarBeneficios(lerCsv(csvBeneficios))
  return {
    dados: {
      itens: prog.dados,
      beneficios: ben.dados,
      config: conf.dados,
      atualizadoEm,
      origem,
    },
    problemas: [...prog.problemas, ...conf.problemas, ...ben.problemas],
  }
}

export function lerCache(): DadosApp | null {
  try {
    const cru = localStorage.getItem(CHAVE_CACHE)
    if (!cru) return null
    const salvo = JSON.parse(cru) as DadosApp
    if (!Array.isArray(salvo.itens) || !salvo.config) return null
    // Cache gravado por uma versao anterior pode nao ter beneficios.
    return { ...salvo, beneficios: salvo.beneficios ?? [], origem: 'cache' }
  } catch {
    return null
  }
}

export function gravarCache(dados: DadosApp): void {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify(dados))
  } catch {
    // Armazenamento cheio ou bloqueado: o app segue funcionando sem cache.
  }
}

export const planilhaConectada = (): boolean =>
  Boolean(URL_CSV_PROGRAMACAO && URL_CSV_CONFIG)

/**
 * Busca os dados: tenta a rede, cai no cache local, e por ultimo nos dados
 * de exemplo. Nunca lanca excecao para a interface.
 */
export async function carregarDados(sinal?: AbortSignal): Promise<ResultadoCarga> {
  if (!planilhaConectada()) {
    const { dados, problemas } = montar(
      CSV_PROGRAMACAO_EXEMPLO,
      CSV_CONFIG_EXEMPLO,
      CSV_BENEFICIOS_EXEMPLO,
      'exemplo',
      new Date().toISOString(),
    )
    return { dados, problemas, erroRede: null }
  }

  try {
    // A planilha de beneficios so e opcional quando nem foi configurada. Com
    // a URL preenchida, uma falha dela conta como falha da carga inteira, para
    // o app cair no cache em vez de mostrar a lista de descontos vazia.
    const [csvProgramacao, csvConfig, csvBeneficios] = await Promise.all([
      baixarTexto(URL_CSV_PROGRAMACAO, sinal),
      baixarTexto(URL_CSV_CONFIG, sinal),
      URL_CSV_BENEFICIOS ? baixarTexto(URL_CSV_BENEFICIOS, sinal) : Promise.resolve(''),
    ])
    const { dados, problemas } = montar(
      csvProgramacao,
      csvConfig,
      csvBeneficios,
      'rede',
      new Date().toISOString(),
    )
    if (dados.itens.length === 0) throw new Error('planilha sem itens validos')
    if (URL_CSV_BENEFICIOS && dados.beneficios.length === 0) {
      // Melhor manter a lista anterior do que publicar "sem beneficios" por
      // causa de uma resposta truncada do Google.
      const cache = lerCache()
      if (cache && cache.beneficios.length > 0) dados.beneficios = cache.beneficios
    }
    gravarCache(dados)
    return { dados, problemas, erroRede: null }
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.message : 'falha desconhecida'
    const cache = lerCache()
    if (cache) return { dados: cache, problemas: [], erroRede: motivo }
    const { dados, problemas } = montar(
      CSV_PROGRAMACAO_EXEMPLO,
      CSV_CONFIG_EXEMPLO,
      CSV_BENEFICIOS_EXEMPLO,
      'exemplo',
      new Date().toISOString(),
    )
    return { dados, problemas, erroRede: motivo }
  }
}

export { INTERVALO_REVALIDACAO_MS }
