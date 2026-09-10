// Gera os arquivos de dados a partir das listas abaixo.
// Rode com: node scripts/gerar-dados.mjs
// A saida vai para planilha/ (fonte versionada) e public/dados/ (para colar
// no Google Sheets sem digitar nada, ver README secao "Recarregar a planilha").
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BASE_APP = 'https://app-utmb.github.io/utmb-paraty-agenda'
/** Marca dos itens tocados pela organizacao, para o filtro por marca cobrir tudo. */
const MARCA_EVENTO = 'Paraty Brazil by UTMB'

const COL_PROG = 'id,data,dia_semana,hora_inicio,hora_fim,data_fim,pilar,titulo_pt,titulo_es,titulo_en,descricao_pt,descricao_es,descricao_en,local_pt,local_es,local_en,palestrante,marca,logo_url,inscricao,link_inscricao,destaque'.split(',')
const COL_BEN = 'id,onde,categoria,nome,desconto_pt,desconto_es,desconto_en,descricao_pt,descricao_es,descricao_en,local_pt,local_es,local_en,condicoes_pt,condicoes_es,condicoes_en,validade,logo_url,link,mapa_url,destaque'.split(',')

const DIAS = {
  '2026-09-17': { semana: 'quinta-feira', expo: ['10:00', '20:00'] },
  '2026-09-18': { semana: 'sexta-feira', expo: ['10:00', '21:00'] },
  '2026-09-19': { semana: 'sabado', expo: ['10:00', '18:00'] },
  '2026-09-20': { semana: 'domingo', expo: ['10:00', '13:00'] },
}
const TODOS = Object.keys(DIAS)
const logo = (n) => (n ? `${BASE_APP}/logos/${n}.png` : '')

const EXPO = ['Expo', 'Expo', 'Expo']
const ARENA = ['Arena de largada e chegada', 'Arena de salida y llegada', 'Start and finish arena']
const AMBOS = ['Arena e Expo', 'Arena y Expo', 'Arena and Expo']
const FAZENDA = ['Fazenda Bananal', 'Fazenda Bananal', 'Fazenda Bananal']
/**
 * Codigo do estande no Mapa Village UTMB 2026. Entra junto com o nome da
 * marca para o atleta achar o lugar sem precisar abrir o mapa.
 */
const estande = (marca, codigo = '') => {
  const suf = codigo ? `, ${codigo}` : ''
  return [`Estande ${marca}${suf}`, `Stand ${marca}${suf}`, `${marca} booth${suf}`]
}
const aConfirmar = ['A confirmar', 'Por confirmar', 'To be confirmed']
const PALCO = ['Palco Expo', 'Escenario Expo', 'Expo Stage']

// ---------------------------------------------------------------- oficial
function oficial(id, data, ini, fim, tit, loc, desc = ['', '', ''], destaque = '') {
  return {
    id, data, dia_semana: DIAS[data].semana, hora_inicio: ini, hora_fim: fim, data_fim: '',
    pilar: 'oficial',
    titulo_pt: tit[0], titulo_es: tit[1], titulo_en: tit[2],
    descricao_pt: desc[0], descricao_es: desc[1], descricao_en: desc[2],
    local_pt: loc[0], local_es: loc[1], local_en: loc[2],
    palestrante: '', marca: MARCA_EVENTO, logo_url: '',
    inscricao: 'livre', link_inscricao: '', destaque,
  }
}

const EXPO_T = ['UTMB Expo', 'UTMB Expo', 'UTMB Expo']
const KITS = ['Retirada de kits', 'Retiro de kits', 'Bib pickup']
const DROP = ['Drop bag e guarda volume', 'Drop bag y guarda equipaje', 'Drop bag and bag storage']
const DROP_RET = ['Drop bag e guarda volume, retirada', 'Drop bag y guarda equipaje, retiro', 'Drop bag and bag storage, collection']

const OFICIAL = [
  oficial('of-17-01', '2026-09-17', '10:00', '20:00', EXPO_T, EXPO),
  oficial('of-17-02', '2026-09-17', '10:00', '20:00', KITS, EXPO, ['', '', ''], 'sim'),
  oficial('of-17-03', '2026-09-17', '12:00', '20:00', ['Drop bag', 'Drop bag', 'Drop bag'], EXPO),
  oficial('of-17-04', '2026-09-17', '16:00', '', ['Abertura oficial', 'Apertura oficial', 'Official opening'], EXPO, ['', '', ''], 'sim'),
  oficial('of-17-05', '2026-09-17', '17:30', '', ['Briefing tecnico PTR 108', 'Briefing tecnico PTR 108', 'PTR 108 technical briefing'], EXPO),

  oficial('of-18-01', '2026-09-18', '10:00', '21:00', EXPO_T, EXPO),
  oficial('of-18-02', '2026-09-18', '10:00', '21:00', KITS, EXPO),
  oficial('of-18-03', '2026-09-18', '10:00', '17:00', DROP, EXPO, [
    'Limite para os atletas da PTR 108 deixarem as bags antes da largada das 19h.',
    'Limite para que los atletas de la PTR 108 dejen las bags antes de la salida de las 19h.',
    'Deadline for PTR 108 athletes to leave their bags before the 19h start.']),
  oficial('of-18-04', '2026-09-18', '12:00', '', ['Apresentacao de atletas de elite', 'Presentacion de atletas de elite', 'Elite athlete presentation'], EXPO),
  oficial('of-18-05', '2026-09-18', '13:00', '', ['Briefing tecnico PTR 58', 'Briefing tecnico PTR 58', 'PTR 58 technical briefing'], EXPO),
  oficial('of-18-06', '2026-09-18', '13:30', '', ['Briefing tecnico PTR 34', 'Briefing tecnico PTR 34', 'PTR 34 technical briefing'], EXPO),
  oficial('of-18-07', '2026-09-18', '14:00', '', ['Briefing tecnico PTR 25', 'Briefing tecnico PTR 25', 'PTR 25 technical briefing'], EXPO),
  oficial('of-18-08', '2026-09-18', '14:30', '', ['Briefing tecnico PTR 17', 'Briefing tecnico PTR 17', 'PTR 17 technical briefing'], EXPO),
  oficial('of-18-09', '2026-09-18', '19:00', '', ['Largada PTR 108', 'Salida PTR 108', 'PTR 108 start'], ARENA, ['', '', ''], 'sim'),

  oficial('of-19-01', '2026-09-19', '04:00', '08:00', ['Guarda volume, deposito para as largadas matinais', 'Guarda equipaje, deposito para las salidas matinales', 'Bag storage, drop off for the morning starts'], AMBOS),
  oficial('of-19-02', '2026-09-19', '05:00', '', ['Largada PTR 58', 'Salida PTR 58', 'PTR 58 start'], ARENA, ['', '', ''], 'sim'),
  oficial('of-19-03', '2026-09-19', '06:00', '', ['Largada PTR 34', 'Salida PTR 34', 'PTR 34 start'], ARENA, ['', '', ''], 'sim'),
  oficial('of-19-04', '2026-09-19', '08:00', '', ['Largada PTR 25', 'Salida PTR 25', 'PTR 25 start'], ARENA, ['', '', ''], 'sim'),
  oficial('of-19-05', '2026-09-19', '08:00', '16:00', ['Retirada de kits, ultimo dia', 'Retiro de kits, ultimo dia', 'Bib pickup, last day'], EXPO, ['', '', ''], 'sim'),
  oficial('of-19-06', '2026-09-19', '10:00', '18:00', EXPO_T, EXPO),
  oficial('of-19-07', '2026-09-19', '10:00', '19:00', DROP_RET, EXPO, [
    'Chegada prevista das bags a arena as 16h.',
    'Llegada prevista de las bags a la arena a las 16h.',
    'Bags are expected to arrive at the arena at 16h.']),
  oficial('of-19-08', '2026-09-19', '14:00', '', ['Largada PTR 17', 'Salida PTR 17', 'PTR 17 start'], FAZENDA, ['', '', ''], 'sim'),
  oficial('of-19-09', '2026-09-19', '15:00', '', ['Guarda volume PTR 17', 'Guarda equipaje PTR 17', 'PTR 17 bag storage'], AMBOS, [
    'Os itens retornam da Fazenda Bananal e ficam disponiveis para retirada em Paraty.',
    'Los items vuelven de la Fazenda Bananal y quedan disponibles para retiro en Paraty.',
    'Items return from Fazenda Bananal and can be collected in Paraty.']),
  oficial('of-19-10', '2026-09-19', '15:00', '', ['Limite PTR 25', 'Limite PTR 25', 'PTR 25 cut-off'], ARENA),
  oficial('of-19-11', '2026-09-19', '16:00', '', ['Limite PTR 34', 'Limite PTR 34', 'PTR 34 cut-off'], ARENA),
  oficial('of-19-12', '2026-09-19', '18:30', '', ['Limite PTR 17', 'Limite PTR 17', 'PTR 17 cut-off'], ARENA),
  oficial('of-19-13', '2026-09-19', '21:00', '', ['Limite PTR 58', 'Limite PTR 58', 'PTR 58 cut-off'], ARENA),

  oficial('of-20-01', '2026-09-20', '01:00', '', ['Limite PTR 108', 'Limite PTR 108', 'PTR 108 cut-off'], ARENA),
  oficial('of-20-02', '2026-09-20', '07:00', '', ['Largada RUN 7', 'Salida RUN 7', 'RUN 7 start'], ARENA, ['', '', ''], 'sim'),
  oficial('of-20-03', '2026-09-20', '09:00', '', ['Kids', 'Kids', 'Kids'], ARENA, ['', '', ''], 'sim'),
  oficial('of-20-04', '2026-09-20', '10:00', '13:00', EXPO_T, EXPO),
  oficial('of-20-05', '2026-09-20', '10:00', '12:00', DROP_RET, EXPO),
  oficial('of-20-06', '2026-09-20', '10:30', '', ['Premiacao', 'Premiacion', 'Awards ceremony'], EXPO, ['', '', ''], 'sim'),
  oficial('of-20-07', '2026-09-20', '12:00', '', ['Encerramento do evento', 'Cierre del evento', 'Event closing'], EXPO, ['', '', ''], 'sim'),
]

// -------------------------------------------------------------- ativacoes
/**
 * Uma ativacao vira uma linha por dia em que acontece, para o atleta que
 * abre o app no sabado ver o que tem no sabado.
 * `horas` null significa que segue o horario da Expo daquele dia.
 */
function ativacao({ slug, marca, tit, desc, dias, horas = null, local, inscricao = 'livre', link = '', logoArquivo = null, destaque = '' }) {
  return dias.map((data, i) => {
    const [ini, fim] = horas?.[data] ?? DIAS[data].expo
    return {
      id: `at-${slug}-${i + 1}`, data, dia_semana: DIAS[data].semana,
      hora_inicio: ini, hora_fim: fim, data_fim: '', pilar: 'ativacao',
      titulo_pt: tit[0], titulo_es: tit[1], titulo_en: tit[2],
      descricao_pt: desc[0], descricao_es: desc[1], descricao_en: desc[2],
      local_pt: local[0], local_es: local[1], local_en: local[2],
      palestrante: '', marca, logo_url: logo(logoArquivo),
      inscricao, link_inscricao: link, destaque,
    }
  })
}

const ATIVACOES = [
  ...ativacao({
    slug: 'mombora-treinao', marca: 'MOMBORA', logoArquivo: null,
    tit: ['Treinao MOMBORA', 'Entrenamiento MOMBORA', 'MOMBORA group run'],
    desc: ['Treinao em conjunto com a COLUMBIA. Ponto de encontro a confirmar.',
           'Entrenamiento en conjunto con COLUMBIA. Punto de encuentro por confirmar.',
           'Group run together with COLUMBIA. Meeting point to be confirmed.'],
    dias: ['2026-09-18'], horas: { '2026-09-18': ['08:30', '10:00'] },
    local: aConfirmar, inscricao: 'invite', destaque: 'sim',
  }),
  ...ativacao({
    slug: 'hoka-medalha', marca: 'HOKA', logoArquivo: 'hoka',
    tit: ['Gravacao de medalhas', 'Grabado de medallas', 'Medal engraving'],
    desc: ['Personalize a sua medalha no estande da HOKA.', 'Personaliza tu medalla en el stand de HOKA.', 'Personalise your medal at the HOKA booth.'],
    dias: ['2026-09-19', '2026-09-20'],
    horas: { '2026-09-19': ['14:00', '20:00'], '2026-09-20': ['10:00', '14:00'] },
    local: estande('HOKA', 'B1'), destaque: 'sim',
  }),
  ...ativacao({
    slug: 'nnormal-tenis', marca: 'NNormal', logoArquivo: 'nnormal',
    tit: ['Experimentacao de tenis', 'Prueba de zapatillas', 'Shoe try-on'],
    desc: ['Experimente os modelos NNormal no estande.', 'Prueba los modelos NNormal en el stand.', 'Try the NNormal models at the booth.'],
    dias: ['2026-09-17', '2026-09-18', '2026-09-19'], local: estande('NNormal', 'D9'),
  }),
  ...ativacao({
    slug: 'coros-cacada', marca: 'COROS', logoArquivo: 'coros',
    tit: ['Caca ao tesouro COROS', 'Busqueda del tesoro COROS', 'COROS treasure hunt'],
    desc: ['Vagas limitadas, inscricao no estande.', 'Cupos limitados, inscripcion en el stand.', 'Limited places, sign up at the booth.'],
    dias: ['2026-09-17', '2026-09-18', '2026-09-19'], local: estande('COROS', 'D9'),
    inscricao: 'previa', link: 'https://paraty.utmb.world/pt',
  }),
  ...ativacao({
    slug: 'vivas-roleta', marca: 'VIVAS MOVE', logoArquivo: 'vivas-move',
    tit: ['Roleta de descontos', 'Ruleta de descuentos', 'Discount wheel'],
    desc: ['Gire a roleta e leve o desconto que sair.', 'Gira la ruleta y llevate el descuento.', 'Spin the wheel and take the discount.'],
    dias: ['2026-09-17', '2026-09-18'],
    horas: { '2026-09-17': ['14:00', '18:00'], '2026-09-18': ['14:00', '18:00'] },
    local: estande('VIVAS MOVE', 'D8'),
  }),
  ...ativacao({
    slug: 'drpeanut-degustacao', marca: 'DR PEANUT', logoArquivo: 'dr-peanut',
    tit: ['Degustacao DR PEANUT', 'Degustacion DR PEANUT', 'DR PEANUT tasting'],
    desc: ['Proteina, pasta de amendoim e barra proteica na airfryer.', 'Proteina, pasta de mani y barra proteica en la airfryer.', 'Protein, peanut butter and protein bar from the airfryer.'],
    dias: TODOS, local: estande('DR PEANUT', 'D4'),
  }),
  ...ativacao({
    slug: 'mombora-gel', marca: 'MOMBORA', logoArquivo: null,
    tit: ['Degustacao de geis e carbo', 'Degustacion de geles y carbo', 'Gel and carb tasting'],
    desc: ['Geis e carboidrato em po para provar antes da prova.', 'Geles y carbohidrato en polvo para probar.', 'Gels and carb powder to try before the race.'],
    dias: TODOS, local: estande('MOMBORA', 'F8'),
  }),
  ...ativacao({
    slug: 'liquidz-sabor', marca: 'Liquidz', logoArquivo: 'liquidz',
    tit: ['Degustacao do novo sabor', 'Degustacion del nuevo sabor', 'New flavour tasting'],
    desc: ['O sabor so e lancado em 22 de setembro. Aqui da para provar e comprar antes de todo mundo.',
           'El sabor se lanza el 22 de septiembre. Aqui puedes probarlo y comprarlo antes que todos.',
           'The flavour launches on 22 September. Here you can taste and buy it before anyone else.'],
    dias: TODOS, local: estande('Liquidz', 'C5'), destaque: 'sim',
  }),
  ...ativacao({
    slug: 'liquidz-hidratacao', marca: 'Liquidz', logoArquivo: 'liquidz',
    tit: ['Teste de hidratacao', 'Test de hidratacion', 'Hydration test'],
    desc: ['Nutricionista no estande testando a hidratacao dos atletas e falando sobre eletrolitos no endurance.',
           'Nutricionista en el stand midiendo la hidratacion y hablando de electrolitos en el endurance.',
           'A nutritionist at the booth testing hydration and explaining electrolytes in endurance.'],
    dias: ['2026-09-17'], horas: { '2026-09-17': ['14:00', '18:00'] },
    local: estande('Liquidz', 'C5'), destaque: 'sim',
  }),
  ...ativacao({
    slug: 'liquidz-samples', marca: 'Liquidz', logoArquivo: 'liquidz',
    tit: ['Cadastro e samples', 'Registro y muestras', 'Sign up and samples'],
    desc: ['Cadastre-se no estande e leve amostras da marca, incluindo o sabor novo.',
           'Registrate en el stand y llevate muestras, incluido el sabor nuevo.',
           'Sign up at the booth and take samples, including the new flavour.'],
    dias: TODOS, local: estande('Liquidz', 'C5'),
  }),
  ...ativacao({
    slug: 'aimo-qrcode', marca: 'AIMO', logoArquivo: 'aimo',
    tit: ['QR code de 10% e sorteio de bones', 'QR de 10% y sorteo de gorras', '10% QR code and cap giveaway'],
    desc: ['Leia o QR code no estande para 10% de desconto. Dois bones sao sorteados entre os cadastrados.',
           'Escanea el QR en el stand para 10% de descuento. Se sortean dos gorras entre los registrados.',
           'Scan the QR code at the booth for 10% off. Two caps are raffled among those who sign up.'],
    dias: TODOS, local: estande('AIMO', 'E3'), destaque: 'sim',
  }),
  ...ativacao({
    slug: 'aimo-camiseta', marca: 'AIMO', logoArquivo: 'aimo',
    tit: ['Camiseta de edicao limitada', 'Camiseta de edicion limitada', 'Limited edition tee'],
    desc: ['Souvenir Aimo do Paraty Brazil by UTMB, com customizacao feita na hora no estande.',
           'Souvenir Aimo del Paraty Brazil by UTMB, personalizada en el momento.',
           'Aimo souvenir of Paraty Brazil by UTMB, customised on the spot.'],
    dias: TODOS, local: estande('AIMO', 'E3'),
  }),
  ...ativacao({
    slug: 'runlastic-brindes', marca: 'Runlastic', logoArquivo: 'runlastic',
    tit: ['Brindes Runlastic', 'Regalos Runlastic', 'Runlastic giveaways'],
    desc: ['Brindes no estande durante o horario da Expo.', 'Regalos en el stand durante el horario de la Expo.', 'Giveaways at the booth during Expo hours.'],
    dias: TODOS, local: estande('Runlastic', 'D7'),
  }),
  ...ativacao({
    slug: 'tricky-barrinhas', marca: 'Tricky', logoArquivo: 'tricky',
    tit: ['Degustacao de barrinhas de carbo', 'Degustacion de barras de carbo', 'Carb bar tasting'],
    desc: ['Prove as barrinhas no estande da Tricky.', 'Prueba las barras en el stand de Tricky.', 'Try the bars at the Tricky booth.'],
    dias: TODOS, local: estande('Tricky', 'E9'),
  }),
]

// ---------------------------------------------------------- palco da Expo
/** Item unico de palco, com pilar proprio e duracao fechada. */
function palco({ id, data, ini, fim, pilar, tit, desc, palestrante = '', marca = '', logoArquivo = null }) {
  return {
    id, data, dia_semana: DIAS[data].semana, hora_inicio: ini, hora_fim: fim, data_fim: '', pilar,
    titulo_pt: tit[0], titulo_es: tit[1], titulo_en: tit[2],
    descricao_pt: desc[0], descricao_es: desc[1], descricao_en: desc[2],
    local_pt: PALCO[0], local_es: PALCO[1], local_en: PALCO[2],
    palestrante, marca, logo_url: logo(logoArquivo),
    inscricao: 'livre', link_inscricao: '', destaque: '',
  }
}

const PALCO_ITENS = [
  palco({
    id: 'talk-liquidz-hidratacao', data: '2026-09-18', ini: '14:00', fim: '14:15', pilar: 'talks',
    tit: ['Hidratacao funcional', 'Hidratacion funcional', 'Functional hydration'],
    desc: ['Estrategias praticas de hidratacao para o Paraty Brazil by UTMB.',
           'Estrategias practicas de hidratacion para el Paraty Brazil by UTMB.',
           'Practical hydration strategies for Paraty Brazil by UTMB.'],
    palestrante: 'Talita Cristina', marca: 'Liquidz', logoArquivo: 'liquidz',
  }),
  palco({
    id: 'filme-tala', data: '2026-09-18', ini: '13:00', fim: '13:15', pilar: 'filmes',
    tit: ['Tala', 'Tala', 'Tala'],
    desc: ['Exibicao do filme com Fernanda Maciel.',
           'Proyeccion de la pelicula con Fernanda Maciel.',
           'Screening of the film with Fernanda Maciel.'],
    palestrante: 'Fernanda Maciel',
  }),
]

/**
 * Item de teste pedido pelo evento, para ver como um item em andamento
 * aparece em "acontecendo agora". Atravessa a meia-noite de proposito.
 * Apague daqui quando nao precisar mais.
 */
const TESTE = [
  {
    id: 'teste-agora', data: '2026-09-10', dia_semana: 'quinta-feira',
    hora_inicio: '17:00', hora_fim: '17:00', data_fim: '2026-09-11', pilar: 'oficial',
    titulo_pt: 'Evento teste', titulo_es: 'Evento de prueba', titulo_en: 'Test event',
    descricao_pt: 'Item de teste para conferir como aparece o que esta acontecendo agora.',
    descricao_es: 'Item de prueba para ver como aparece lo que esta pasando ahora.',
    descricao_en: 'Test item to check how something happening now looks.',
    local_pt: 'Expo', local_es: 'Expo', local_en: 'Expo',
    palestrante: '', marca: MARCA_EVENTO, logo_url: '',
    inscricao: 'livre', link_inscricao: '', destaque: '',
  },
]

// ------------------------------------------------------------- beneficios
function beneficio({ id, onde, categoria, nome, desconto, descricao, local, condicoes, validade, logoArquivo = null, link = '', mapa = '', destaque = '' }) {
  return {
    id, onde, categoria, nome,
    desconto_pt: desconto[0], desconto_es: desconto[1], desconto_en: desconto[2],
    descricao_pt: descricao[0], descricao_es: descricao[1], descricao_en: descricao[2],
    local_pt: local[0], local_es: local[1], local_en: local[2],
    condicoes_pt: condicoes[0], condicoes_es: condicoes[1], condicoes_en: condicoes[2],
    validade, logo_url: logo(logoArquivo), link, mapa_url: mapa, destaque,
  }
}

const PEITO = ['Mediante apresentacao do numero de peito.', 'Presentando el dorsal.', 'Show your race bib.']
const DATAS_EXPO = '17 a 20 de setembro'

const BENEFICIOS = [
  beneficio({
    id: 'ben-columbia', onde: 'expo', categoria: 'equipamentos', nome: 'COLUMBIA',
    desconto: ['20% a 40% de desconto', '20% a 40% de descuento', '20% to 40% off'],
    descricao: ['Desconto valido nos produtos do estande.', 'Descuento valido en los productos del stand.', 'Discount valid on products at the booth.'],
    local: estande('COLUMBIA', 'D1'), condicoes: PEITO, validade: DATAS_EXPO, destaque: 'sim',
  }),
  beneficio({
    id: 'ben-hoka', onde: 'expo', categoria: 'equipamentos', nome: 'HOKA',
    desconto: ['20% de desconto', '20% de descuento', '20% off'],
    descricao: ['Desconto no estande inteiro.', 'Descuento en todo el stand.', 'Discount across the whole booth.'],
    local: estande('HOKA', 'B1'), condicoes: PEITO, validade: DATAS_EXPO,
    logoArquivo: 'hoka', destaque: 'sim',
  }),
]

// ------------------------------------------------------------------ saida
const escaparCsv = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const paraCsv = (cols, linhas) =>
  [cols.join(','), ...linhas.map((l) => cols.map((c) => escaparCsv(l[c] ?? '')).join(','))].join('\n') + '\n'
const paraTsv = (cols, linhas) =>
  [cols.join('\t'), ...linhas.map((l) => cols.map((c) => (l[c] ?? '').replace(/[\t\n]/g, ' ')).join('\t'))].join('\n')

const programacao = [...OFICIAL, ...ATIVACOES, ...PALCO_ITENS, ...TESTE]

await mkdir(resolve(raiz, 'public/dados'), { recursive: true })
await writeFile(resolve(raiz, 'planilha/Programacao.csv'), paraCsv(COL_PROG, programacao))
await writeFile(resolve(raiz, 'planilha/Beneficios.csv'), paraCsv(COL_BEN, BENEFICIOS))
await writeFile(resolve(raiz, 'public/dados/programacao.tsv'), paraTsv(COL_PROG, programacao))
await writeFile(resolve(raiz, 'public/dados/beneficios.tsv'), paraTsv(COL_BEN, BENEFICIOS))

const ids = programacao.map((l) => l.id)
if (new Set(ids).size !== ids.length) throw new Error('id repetido na programacao')

console.log(
  `programacao: ${programacao.length} linhas (${OFICIAL.length} oficiais, ` +
    `${ATIVACOES.length} ativacoes, ${PALCO_ITENS.length} de palco, ${TESTE.length} de teste)`,
)
console.log(`beneficios:  ${BENEFICIOS.length} linhas`)
