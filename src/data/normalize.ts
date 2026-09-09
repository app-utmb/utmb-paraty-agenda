import type {
  ConfigEvento,
  Idioma,
  Inscricao,
  ItemProgramacao,
  Pilar,
  ProblemaImportacao,
  ResultadoImportacao,
  TextoMultilingue,
} from './types'
import { INSCRICOES, PILARES } from './types'

/** Linha crua do papaparse: cabecalho -> valor, tudo string. */
export type LinhaCrua = Record<string, string | undefined>

const texto = (v: string | undefined): string => (v ?? '').trim()

/**
 * Normaliza o nome de uma coluna para comparar sem depender de acento,
 * caixa, espaco ou BOM. "Titulo PT " e "titulo_pt" viram "titulopt".
 */
export function chaveColuna(nome: string): string {
  return nome
    .replace(/^\ufeff/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** Reindexa uma linha crua pelas chaves normalizadas das colunas. */
export function reindexar(linha: LinhaCrua): LinhaCrua {
  const saida: LinhaCrua = {}
  for (const [k, v] of Object.entries(linha)) {
    if (k == null) continue
    saida[chaveColuna(k)] = v
  }
  return saida
}

/** Converte "HH:MM" (ou "H:MM", "HH.MM", "HHhMM") em minutos desde a meia-noite. */
export function paraMinutos(hora: string): number | null {
  const limpo = texto(hora).replace(/[hH.]/g, ':')
  const m = /^(\d{1,2}):(\d{2})/.exec(limpo)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isInteger(h) || !Number.isInteger(min)) return null
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return h * 60 + min
}

/** Reescreve a hora no formato canonico HH:MM. Retorna null se invalida. */
export function normalizarHora(hora: string): string | null {
  const minutos = paraMinutos(hora)
  if (minutos === null) return null
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Aceita apenas datas ISO reais (YYYY-MM-DD). "2026-02-31" e recusada. */
export function dataValida(valor: string): boolean {
  const v = texto(valor)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

function semAcento(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function normalizarPilar(valor: string): Pilar | null {
  const v = semAcento(valor)
  if (!v) return null
  // Aceita sinonimos comuns que eu possa digitar na planilha.
  const apelidos: Record<string, Pilar> = {
    oficial: 'oficial',
    official: 'oficial',
    prova: 'oficial',
    talks: 'talks',
    talk: 'talks',
    palco: 'talks',
    palestra: 'talks',
    palestras: 'talks',
    ativacao: 'ativacao',
    ativacoes: 'ativacao',
    activation: 'ativacao',
    marca: 'ativacao',
    marcas: 'ativacao',
  }
  if (apelidos[v]) return apelidos[v]
  return (PILARES as readonly string[]).includes(v) ? (v as Pilar) : null
}

export function normalizarInscricao(valor: string): Inscricao | null {
  const v = semAcento(valor)
  if (!v) return null
  const apelidos: Record<string, Inscricao> = {
    livre: 'livre',
    free: 'livre',
    aberto: 'livre',
    previa: 'previa',
    previo: 'previa',
    inscricao: 'previa',
    invite: 'invite',
    convite: 'invite',
    inviteonly: 'invite',
  }
  return apelidos[v] ?? ((INSCRICOES as readonly string[]).includes(v) ? (v as Inscricao) : null)
}

/** "sim", "s", "x", "true", "1", "yes" contam como verdadeiro. */
export function ehVerdadeiro(valor: string): boolean {
  const v = semAcento(valor)
  return ['sim', 's', 'x', 'true', '1', 'yes', 'y', 'verdadeiro'].includes(v)
}

/** Aceita apenas http(s) e mailto. Bloqueia javascript:, data: e afins. */
export function urlSegura(valor: string): string | null {
  const v = texto(valor)
  if (!v) return null
  try {
    const u = new URL(v)
    if (['http:', 'https:', 'mailto:'].includes(u.protocol)) return u.toString()
    return null
  } catch {
    return null
  }
}

/** Monta o trio de idiomas com o PT como reserva de es e en. */
function multilingue(l: LinhaCrua, prefixo: string): TextoMultilingue {
  const pt = texto(l[`${prefixo}pt`])
  const es = texto(l[`${prefixo}es`])
  const en = texto(l[`${prefixo}en`])
  return { pt, es: es || pt, en: en || pt }
}

/** Escolhe o texto do idioma ativo, caindo no PT quando vazio. */
export function escolherIdioma(t: TextoMultilingue, idioma: Idioma): string {
  return t[idioma] || t.pt
}

/**
 * Converte as linhas cruas da aba Programacao em itens validados.
 * Nenhuma linha ruim derruba a importacao: ou e corrigida, ou e descartada,
 * e em ambos os casos o motivo entra em `problemas`.
 */
export function normalizarProgramacao(
  linhas: LinhaCrua[],
): ResultadoImportacao<ItemProgramacao[]> {
  const problemas: ProblemaImportacao[] = []
  const itens: ItemProgramacao[] = []
  const idsVistos = new Set<string>()

  linhas.forEach((cru, indice) => {
    // +2 porque a linha 1 e o cabecalho e o indice comeca em zero.
    const linha = indice + 2
    const l = reindexar(cru)

    const todosVazios = Object.values(l).every((v) => texto(v) === '')
    if (todosVazios) return

    const id = texto(l.id)
    if (!id) {
      problemas.push({ linha, campo: 'id', motivo: 'sem id', gravidade: 'descartada' })
      return
    }
    if (idsVistos.has(id)) {
      problemas.push({ linha, campo: 'id', motivo: `id repetido "${id}"`, gravidade: 'descartada' })
      return
    }

    const data = texto(l.data)
    if (!dataValida(data)) {
      problemas.push({
        linha,
        campo: 'data',
        motivo: `data invalida "${data}", esperado YYYY-MM-DD`,
        gravidade: 'descartada',
      })
      return
    }

    const horaInicio = normalizarHora(texto(l.horainicio))
    if (!horaInicio) {
      problemas.push({
        linha,
        campo: 'hora_inicio',
        motivo: `hora invalida "${texto(l.horainicio)}", esperado HH:MM`,
        gravidade: 'descartada',
      })
      return
    }

    const titulo = multilingue(l, 'titulo')
    if (!titulo.pt) {
      problemas.push({
        linha,
        campo: 'titulo_pt',
        motivo: 'titulo em portugues vazio',
        gravidade: 'descartada',
      })
      return
    }

    let horaFim = normalizarHora(texto(l.horafim))
    if (texto(l.horafim) && !horaFim) {
      problemas.push({
        linha,
        campo: 'hora_fim',
        motivo: `hora de fim invalida "${texto(l.horafim)}", ignorada`,
        gravidade: 'corrigida',
      })
    }
    const minutoInicio = paraMinutos(horaInicio) as number
    let minutoFim = horaFim ? paraMinutos(horaFim) : null
    if (minutoFim !== null && minutoFim < minutoInicio) {
      problemas.push({
        linha,
        campo: 'hora_fim',
        motivo: 'hora de fim antes da hora de inicio, ignorada',
        gravidade: 'corrigida',
      })
      horaFim = null
      minutoFim = null
    }

    let pilar = normalizarPilar(texto(l.pilar))
    if (!pilar) {
      problemas.push({
        linha,
        campo: 'pilar',
        motivo: `pilar invalido "${texto(l.pilar)}", assumido "oficial"`,
        gravidade: 'corrigida',
      })
      pilar = 'oficial'
    }

    let inscricao = normalizarInscricao(texto(l.inscricao))
    if (!inscricao) {
      if (texto(l.inscricao)) {
        problemas.push({
          linha,
          campo: 'inscricao',
          motivo: `valor invalido "${texto(l.inscricao)}", assumido "livre"`,
          gravidade: 'corrigida',
        })
      }
      inscricao = 'livre'
    }

    const linkInscricao = urlSegura(texto(l.linkinscricao))
    if (texto(l.linkinscricao) && !linkInscricao) {
      problemas.push({
        linha,
        campo: 'link_inscricao',
        motivo: 'link nao e uma URL http(s) valida, ignorado',
        gravidade: 'corrigida',
      })
    }
    if (inscricao === 'previa' && !linkInscricao) {
      problemas.push({
        linha,
        campo: 'link_inscricao',
        motivo: 'inscricao previa sem link, item mostrado como entrada livre',
        gravidade: 'corrigida',
      })
      inscricao = 'livre'
    }

    const logoUrl = urlSegura(texto(l.logourl))
    if (texto(l.logourl) && !logoUrl) {
      problemas.push({
        linha,
        campo: 'logo_url',
        motivo: 'logo nao e uma URL http(s) valida, ignorada',
        gravidade: 'corrigida',
      })
    }

    idsVistos.add(id)
    itens.push({
      id,
      data,
      diaSemana: texto(l.diasemana),
      horaInicio,
      horaFim,
      pilar,
      titulo,
      descricao: multilingue(l, 'descricao'),
      local: multilingue(l, 'local'),
      palestrante: texto(l.palestrante) || null,
      marca: texto(l.marca) || null,
      logoUrl,
      inscricao,
      linkInscricao,
      destaque: ehVerdadeiro(texto(l.destaque)),
      minutoInicio,
      minutoFim,
    })
  })

  return { dados: ordenarItens(itens), problemas }
}

/** Ordena por data, depois destaque no topo, depois horario, depois titulo. */
export function ordenarItens(itens: ItemProgramacao[]): ItemProgramacao[] {
  return [...itens].sort((a, b) => {
    if (a.data !== b.data) return a.data < b.data ? -1 : 1
    if (a.destaque !== b.destaque) return a.destaque ? -1 : 1
    if (a.minutoInicio !== b.minutoInicio) return a.minutoInicio - b.minutoInicio
    return a.titulo.pt.localeCompare(b.titulo.pt, 'pt-BR')
  })
}

export const CONFIG_PADRAO: ConfigEvento = {
  eventoNome: 'Paraty Brazil by UTMB',
  eventoDatas: '17 a 20 de setembro de 2026',
  guiaAtletaUrl: { pt: '', es: '', en: '' },
  mapaExpoUrl: '',
  contatoWhatsapp: '',
  contatoEmail: '',
  siteOficial: 'https://paraty.utmb.world/pt',
  localMaps: '',
  reguaPatrocinadoresUrl: '',
}

/**
 * Converte a aba Config (pares chave/valor) em objeto tipado.
 * Chaves desconhecidas sao registradas como problema e ignoradas.
 */
export function normalizarConfig(linhas: LinhaCrua[]): ResultadoImportacao<ConfigEvento> {
  const problemas: ProblemaImportacao[] = []
  const bruto = new Map<string, string>()

  linhas.forEach((cru, indice) => {
    const linha = indice + 2
    const l = reindexar(cru)
    const chave = chaveColuna(texto(l.chave))
    const valor = texto(l.valor)
    if (!chave) {
      if (valor) {
        problemas.push({ linha, campo: 'chave', motivo: 'valor sem chave', gravidade: 'descartada' })
      }
      return
    }
    bruto.set(chave, valor)
  })

  const url = (chave: string, obrigatoria = false): string => {
    const v = bruto.get(chave) ?? ''
    if (!v) {
      if (obrigatoria) {
        problemas.push({ linha: 0, campo: chave, motivo: 'nao preenchido', gravidade: 'corrigida' })
      }
      return ''
    }
    const segura = urlSegura(v)
    if (!segura) {
      problemas.push({
        linha: 0,
        campo: chave,
        motivo: `"${v}" nao e uma URL valida, ignorado`,
        gravidade: 'corrigida',
      })
      return ''
    }
    return segura
  }

  const guiaPt = url('guiaatletaurlpt')
  const config: ConfigEvento = {
    eventoNome: bruto.get('eventonome') || CONFIG_PADRAO.eventoNome,
    eventoDatas: bruto.get('eventodatas') || CONFIG_PADRAO.eventoDatas,
    guiaAtletaUrl: {
      pt: guiaPt,
      es: url('guiaatletaurles') || guiaPt,
      en: url('guiaatletaurlen') || guiaPt,
    },
    mapaExpoUrl: url('mapaexpourl'),
    contatoWhatsapp: url('contatowhatsapp'),
    contatoEmail: bruto.get('contatoemail') || '',
    siteOficial: url('siteoficial') || CONFIG_PADRAO.siteOficial,
    localMaps: url('localmaps'),
    reguaPatrocinadoresUrl: url('reguapatrocinadoresurl'),
  }

  return { dados: config, problemas }
}
