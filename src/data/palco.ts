import { PONTOS_MAPA } from './mapa'
import { chaveColuna, reindexar, type LinhaCrua } from './normalize'

/**
 * Converte a aba "base" da planilha de agenda do palco nas colunas da
 * Programacao, para passar pela mesma validacao dos outros itens.
 *
 * Regras, combinadas com a organizacao:
 * - so entra linha com Status "confirmado", Dia alocado e Horario alocado;
 * - "Tema do talk" vira o titulo; "Tema ES" e "Tema EN", se existirem, as
 *   traducoes; sem tema, o titulo e "Talk" ou "Filme" com o nome da marca;
 * - "Quem apresenta" vira o palestrante e "Cargo / funcao" a descricao.
 */

const MARCA_EVENTO = 'Paraty Brazil by UTMB'
const PALCO = { pt: 'Palco Expo', es: 'Escenario Expo', en: 'Expo Stage' }

/** Nome usado na base que nao bate com o nome do estande. */
const APELIDOS: Record<string, string> = {
  liquidiz: 'Liquidz',
  probiotica: 'DR PEANUT',
  probi: 'DR PEANUT',
  nautika: 'NTK Nautika',
  esg: MARCA_EVENTO,
  utmb: MARCA_EVENTO,
  normalcoros: 'NNormal; COROS',
  nnormalcoros: 'NNormal; COROS',
}

/** Quem vem como pessoa, e nao como marca, fica sem marca no item. */
const CATEGORIAS_DE_PESSOA = new Set(['imprensa', 'atleta'])

const DIAS: Record<string, string> = {
  qui: '2026-09-17',
  sex: '2026-09-18',
  sab: '2026-09-19',
  dom: '2026-09-20',
}

const texto = (v: string | undefined): string => (v ?? '').trim()
const doisDigitos = (n: number) => String(n).padStart(2, '0')

/** "Quinta", "sexta-feira", "18/09" ou "18" viram a data ISO do evento. */
export function dataDoDia(valor: string): string | null {
  const v = chaveColuna(valor)
  const porNome = Object.entries(DIAS).find(([inicio]) => v.startsWith(inicio))
  if (porNome) return porNome[1]
  const m = /^(\d{1,2})(?:\/(\d{1,2}))?/.exec(texto(valor))
  if (!m) return null
  const dia = Number(m[1])
  const mes = m[2] ? Number(m[2]) : 9
  const iso = `2026-${doisDigitos(mes)}-${doisDigitos(dia)}`
  return Object.values(DIAS).includes(iso) ? iso : null
}

/** "15h45 - 16h00 (15 min)" vira ["15:45", "16:00"]. Sem fim, soma os minutos. */
export function faixaDoHorario(valor: string, minutos: string): [string, string] | null {
  const horas = [...texto(valor).matchAll(/(\d{1,2})\s*[h:]\s*(\d{2})?/gi)].map(
    (m) => Number(m[1]) * 60 + Number(m[2] ?? 0),
  )
  const inicio = horas[0]
  if (inicio === undefined || inicio >= 24 * 60) return null
  const duracao = Number(texto(minutos).replace(/\D/g, ''))
  const fim = horas[1] ?? (duracao > 0 ? inicio + duracao : null)
  const hhmm = (t: number) => `${doisDigitos(Math.floor(t / 60))}:${doisDigitos(t % 60)}`
  return [hhmm(inicio), fim === null || fim >= 24 * 60 ? '' : hhmm(fim)]
}

/**
 * Acha o estande pelo nome da marca. Nome exato ganha de parcial, para "Fotop"
 * cair no estande da FOTOP e nao em "Provas do Brasil by Fotop"; o parcial
 * aceita "Bananinha" por "Bananinha Paraibuna".
 */
function acharEstande(chave: string) {
  if (chave.length < 3) return undefined
  const chaves = (p: (typeof PONTOS_MAPA)[number]) => [...p.marcas, p.nome].map(chaveColuna)
  return (
    PONTOS_MAPA.find((p) => chaves(p).includes(chave)) ??
    (chave.length >= 4
      ? PONTOS_MAPA.find((p) => chaves(p).some((k) => k.includes(chave) || chave.includes(k)))
      : undefined)
  )
}

function resolverMarca(bruta: string, categoria: string): { marca: string; logo: string | null } {
  const chave = chaveColuna(bruta)
  const apelido = APELIDOS[chave]
  if (apelido !== undefined) {
    const primeira = chaveColuna(apelido.split(';')[0] ?? '')
    const ponto = PONTOS_MAPA.find((p) => p.marcas.some((m) => chaveColuna(m) === primeira))
    return { marca: apelido, logo: ponto?.logo ?? null }
  }
  const ponto = acharEstande(chave)
  if (ponto) {
    const marca = ponto.marcas.find((m) => chaveColuna(m) === chave) ?? ponto.marcas[0] ?? ponto.nome
    return { marca, logo: ponto.logo }
  }
  if (CATEGORIAS_DE_PESSOA.has(chaveColuna(categoria))) return { marca: '', logo: null }
  return { marca: texto(bruta), logo: null }
}

function urlDoLogo(logo: string | null): string {
  if (!logo) return ''
  const origem = typeof location !== 'undefined' ? location.origin : 'https://app-utmb.github.io'
  return new URL(`${import.meta.env.BASE_URL}logos/${logo}.png`, origem).href
}

/** A aba tem as colunas que o app precisa? Serve para distinguir planilha mudada de agenda vazia. */
export function ehAbaDoPalco(linhas: LinhaCrua[]): boolean {
  const primeira = linhas[0]
  if (!primeira) return false
  const colunas = Object.keys(reindexar(primeira))
  return ['diaalocado', 'horarioalocado', 'status'].every((c) => colunas.includes(c))
}

export function linhasDoPalco(linhas: LinhaCrua[]): LinhaCrua[] {
  const ids = new Set<string>()
  const saida: LinhaCrua[] = []

  for (const cru of linhas) {
    const l = reindexar(cru)
    if (chaveColuna(texto(l.status)) !== 'confirmado') continue
    const data = dataDoDia(texto(l.diaalocado))
    const faixa = faixaDoHorario(texto(l.horarioalocado), texto(l.min))
    if (!data || !faixa) continue

    const tipo = texto(l.oque)
    const pilar = chaveColuna(tipo).includes('filme') ? 'filmes' : 'talks'
    const { marca, logo } = resolverMarca(texto(l.marca), texto(l.categoria))
    const tema = texto(l.temadotalk)
    const titulo = tema || [tipo || 'Talk', marca || texto(l.marca)].filter(Boolean).join(' ')

    // Id estavel pelo conteudo, e nao pela linha, para a estrela da agenda
    // continuar marcada quando a organizacao reordena a planilha.
    const base = `palco-${chaveColuna(texto(l.marca)).slice(0, 20)}-${chaveColuna(tema || tipo).slice(0, 30)}`
    let id = base
    for (let n = 2; ids.has(id); n += 1) id = `${base}-${n}`
    ids.add(id)

    saida.push({
      id,
      data,
      hora_inicio: faixa[0],
      hora_fim: faixa[1],
      pilar,
      titulo_pt: titulo,
      titulo_es: texto(l.temaes),
      titulo_en: texto(l.temaen),
      descricao_pt: texto(l.cargofuncao),
      local_pt: PALCO.pt,
      local_es: PALCO.es,
      local_en: PALCO.en,
      palestrante: texto(l.quemapresenta),
      marca,
      logo_url: urlDoLogo(logo),
      inscricao: 'livre',
    })
  }
  return saida
}
