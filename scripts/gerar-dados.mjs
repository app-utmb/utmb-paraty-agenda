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
/** Mesmo link de resultados ao vivo da aba Info, usado nas largadas. */
const AO_VIVO = 'https://live.utmb.world/pt/paraty/2026'
const AO_VIVO_DESC = ['Acompanhe os atletas ao vivo pelo link abaixo.', 'Sigue a los atletas en vivo con el enlace de abajo.', 'Follow the runners live with the link below.']

// ---------------------------------------------------------------- oficial
function oficial(id, data, ini, fim, tit, loc, desc = ['', '', ''], destaque = '', link = '') {
  return {
    id, data, dia_semana: DIAS[data].semana, hora_inicio: ini, hora_fim: fim, data_fim: '',
    pilar: 'oficial',
    titulo_pt: tit[0], titulo_es: tit[1], titulo_en: tit[2],
    descricao_pt: desc[0], descricao_es: desc[1], descricao_en: desc[2],
    local_pt: loc[0], local_es: loc[1], local_en: loc[2],
    palestrante: '', marca: MARCA_EVENTO, logo_url: '',
    inscricao: 'livre', link_inscricao: link, destaque,
  }
}

const KITS = ['Retirada de kits', 'Retiro de kits', 'Bib pickup']
const DROP = ['Drop bag e guarda-volume', 'Drop bag y guardarropa', 'Drop bag and bag storage']
const DROP_RET = ['Drop bag e guarda-volume, retirada', 'Drop bag y guardarropa, retiro', 'Drop bag and bag storage, collection']

const OFICIAL = [
  oficial('of-17-02', '2026-09-17', '10:00', '20:00', KITS, EXPO, ['', '', ''], 'sim'),
  oficial('of-17-03', '2026-09-17', '12:00', '20:00', ['Drop bag', 'Drop bag', 'Drop bag'], EXPO),
  oficial('of-17-04', '2026-09-17', '16:00', '', ['Abertura oficial', 'Apertura oficial', 'Official opening'], PALCO, ['', '', ''], 'sim'),
  oficial('of-17-05', '2026-09-17', '17:30', '', ['Briefing técnico PTR 108', 'Briefing técnico PTR 108', 'PTR 108 technical briefing'], PALCO),

  oficial('of-18-02', '2026-09-18', '10:00', '21:00', KITS, EXPO),
  oficial('of-18-03', '2026-09-18', '10:00', '17:00', DROP, EXPO, [
    'Limite para os atletas da PTR 108 deixarem as bags antes da largada das 19h.',
    'Límite para que los atletas de la PTR 108 dejen las bags antes de la salida de las 19h.',
    'Deadline for PTR 108 athletes to leave their bags before the 19h start.']),
  oficial('of-18-04', '2026-09-18', '12:00', '', ['Apresentação de atletas de elite', 'Presentación de atletas de élite', 'Elite athlete presentation'], PALCO),
  oficial('of-18-05', '2026-09-18', '13:00', '', ['Briefing técnico PTR 58', 'Briefing técnico PTR 58', 'PTR 58 technical briefing'], PALCO),
  oficial('of-18-06', '2026-09-18', '13:30', '', ['Briefing técnico PTR 34', 'Briefing técnico PTR 34', 'PTR 34 technical briefing'], PALCO),
  oficial('of-18-07', '2026-09-18', '14:00', '', ['Briefing técnico PTR 25', 'Briefing técnico PTR 25', 'PTR 25 technical briefing'], PALCO),
  oficial('of-18-08', '2026-09-18', '14:30', '', ['Briefing técnico PTR 17', 'Briefing técnico PTR 17', 'PTR 17 technical briefing'], PALCO),
  oficial('of-18-09', '2026-09-18', '19:00', '', ['Largada PTR 108', 'Salida PTR 108', 'PTR 108 start'], ARENA, AO_VIVO_DESC, 'sim', AO_VIVO),

  oficial('of-19-01', '2026-09-19', '04:00', '08:00', ['Guarda-volume, depósito para as largadas matinais', 'Guardarropa, depósito para las salidas matinales', 'Bag storage, drop off for the morning starts'], AMBOS),
  oficial('of-19-02', '2026-09-19', '05:00', '', ['Largada PTR 58', 'Salida PTR 58', 'PTR 58 start'], ARENA, AO_VIVO_DESC, 'sim', AO_VIVO),
  oficial('of-19-03', '2026-09-19', '06:00', '', ['Largada PTR 34', 'Salida PTR 34', 'PTR 34 start'], ARENA, AO_VIVO_DESC, 'sim', AO_VIVO),
  oficial('of-19-04', '2026-09-19', '08:00', '', ['Largada PTR 25', 'Salida PTR 25', 'PTR 25 start'], ARENA, AO_VIVO_DESC, 'sim', AO_VIVO),
  oficial('of-19-05', '2026-09-19', '08:00', '16:00', ['Retirada de kits, último dia', 'Retiro de kits, último día', 'Bib pickup, last day'], EXPO, ['', '', ''], 'sim'),
  oficial('of-19-07', '2026-09-19', '10:00', '19:00', DROP_RET, EXPO, [
    'Chegada prevista das bags à arena às 16h.',
    'Llegada prevista de las bags a la arena a las 16h.',
    'Bags are expected to arrive at the arena at 16h.']),
  oficial('of-19-08', '2026-09-19', '14:00', '', ['Largada PTR 17', 'Salida PTR 17', 'PTR 17 start'], FAZENDA, AO_VIVO_DESC, 'sim', AO_VIVO),
  oficial('of-19-09', '2026-09-19', '15:00', '', ['Guarda-volume PTR 17', 'Guardarropa PTR 17', 'PTR 17 bag storage'], AMBOS, [
    'Os itens retornam da Fazenda Bananal e ficam disponíveis para retirada em Paraty.',
    'Los artículos vuelven de la Fazenda Bananal y quedan disponibles para retirar en Paraty.',
    'Items return from Fazenda Bananal and can be collected in Paraty.']),
  oficial('of-19-10', '2026-09-19', '15:00', '', ['Limite PTR 25', 'Limite PTR 25', 'PTR 25 cut-off'], ARENA),
  oficial('of-19-11', '2026-09-19', '16:00', '', ['Limite PTR 34', 'Limite PTR 34', 'PTR 34 cut-off'], ARENA),
  oficial('of-19-12', '2026-09-19', '18:30', '', ['Limite PTR 17', 'Limite PTR 17', 'PTR 17 cut-off'], ARENA),
  oficial('of-19-13', '2026-09-19', '21:00', '', ['Limite PTR 58', 'Limite PTR 58', 'PTR 58 cut-off'], ARENA),

  oficial('of-20-01', '2026-09-20', '01:00', '', ['Limite PTR 108', 'Limite PTR 108', 'PTR 108 cut-off'], ARENA),
  oficial('of-20-02', '2026-09-20', '07:00', '', ['Largada RUN 7', 'Salida RUN 7', 'RUN 7 start'], ARENA, ['', '', ''], 'sim'),
  oficial('of-20-03', '2026-09-20', '09:00', '', ['Kids', 'Kids', 'Kids'], ARENA, ['', '', ''], 'sim'),
  oficial('of-20-05', '2026-09-20', '10:00', '12:00', DROP_RET, EXPO),
  oficial('of-20-06', '2026-09-20', '10:30', '', ['Premiação', 'Premiación', 'Awards ceremony'], PALCO, ['', '', ''], 'sim'),
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

/**
 * Acao em horarios marcados, como "12h, 14h e 16h": uma linha por sessao na
 * programacao, que o detalhe da marca junta de volta num resumo por dia.
 */
function emSessoes({ slug, horarios, ...resto }) {
  return Object.entries(horarios).flatMap(([data, horas]) =>
    horas.map((hora) =>
      ativacao({ ...resto, slug: `${slug}-${data.slice(8)}-${hora.replace(':', '')}`, dias: [data], horas: { [data]: [hora, ''] } })[0],
    ),
  )
}

const ATIVACOES = [
  ...ativacao({
    slug: 'mombora-treinao', marca: 'MOMBORA', logoArquivo: 'mombora',
    tit: ['Treinão MOMBORA', 'Entrenamiento MOMBORA', 'MOMBORA group run'],
    desc: ['Treinão em conjunto com a COLUMBIA. Ponto de encontro a confirmar.',
           'Entrenamiento en conjunto con COLUMBIA. Punto de encuentro por confirmar.',
           'Group run together with COLUMBIA. Meeting point to be confirmed.'],
    dias: ['2026-09-18'], horas: { '2026-09-18': ['08:30', '10:00'] },
    local: aConfirmar, inscricao: 'invite', destaque: 'sim',
  }),
  ...emSessoes({
    slug: 'hoka-apitos', marca: 'HOKA', logoArquivo: 'hoka',
    tit: ['Apitos HOKA', 'Silbatos HOKA', 'HOKA whistles'],
    desc: ['Passe no estande da HOKA nos horários de distribuição e confira as regras para ganhar o seu. Enquanto durar o estoque.',
           'Pasa por el stand de HOKA en los horarios de entrega y mira las reglas para ganar el tuyo. Hasta agotar existencias.',
           'Stop by the HOKA booth at the giveaway times and check the rules to get yours. While supplies last.'],
    horarios: {
      '2026-09-17': ['12:00', '14:00', '16:00', '18:00'],
      '2026-09-18': ['12:00', '14:00', '16:00', '18:00', '20:00'],
      '2026-09-19': ['12:00', '14:00'],
    },
    local: estande('HOKA', 'B1'),
  }),
  ...ativacao({
    slug: 'hoka-test-run', marca: 'HOKA', logoArquivo: 'hoka',
    tit: ['HOKA Test Run', 'HOKA Test Run', 'HOKA Test Run'],
    desc: ['Teste um tênis HOKA por até 2h. Cadastro obrigatório, feito no estande pelo QR code.',
           'Prueba un tenis HOKA por hasta 2h. Registro obligatorio, hecho en el stand por el código QR.',
           'Try HOKA shoes for up to 2h. Registration required, done at the booth via QR code.'],
    dias: ['2026-09-17', '2026-09-18', '2026-09-19'],
    horas: {
      '2026-09-17': ['10:00', '18:00'],
      '2026-09-18': ['10:00', '18:00'],
      '2026-09-19': ['10:00', '16:00'],
    },
    local: estande('HOKA', 'B1'), inscricao: 'previa', destaque: 'sim',
  }),
  ...ativacao({
    slug: 'hoka-bone', marca: 'HOKA', logoArquivo: 'hoka',
    tit: ['Compre e ganhe 1 boné HOKA', 'Compra y gana 1 gorra HOKA', 'Buy and get a HOKA cap'],
    desc: ['Em compras a partir de R$ 1.000, ganhe 1 boné HOKA. Produtos selecionados com 20% de desconto. Enquanto durar o estoque.',
           'En compras desde R$ 1.000, gana 1 gorra HOKA. Productos seleccionados con 20% de descuento. Hasta agotar existencias.',
           'Spend R$ 1,000 or more and get a HOKA cap. Selected products at 20% off. While supplies last.'],
    dias: TODOS, local: estande('HOKA', 'B1'),
  }),
  ...ativacao({
    slug: 'hoka-batecos', marca: 'HOKA', logoArquivo: 'hoka',
    tit: ['Batecos e cartazes HOKA', 'Batecos y carteles HOKA', 'HOKA clappers and signs'],
    desc: ['Procure a equipe da HOKA nas chegadas para fazer barulho e deixar a sua mensagem.',
           'Busca al equipo de HOKA en las llegadas para hacer ruido y dejar tu mensaje.',
           'Find the HOKA team at the finish to cheer and leave your message.'],
    dias: ['2026-09-18', '2026-09-19'],
    horas: { '2026-09-18': ['18:00', '20:00'], '2026-09-19': ['08:00', '18:00'] },
    local: ARENA,
  }),
  ...ativacao({
    slug: 'hoka-medalha', marca: 'HOKA', logoArquivo: 'hoka',
    tit: ['Gravação de medalhas', 'Grabado de medallas', 'Medal engraving'],
    desc: ['Personalize a sua medalha no estande da HOKA. Cadastro obrigatório, feito no estande pelo QR code.',
           'Personaliza tu medalla en el stand de HOKA. Registro obligatorio, hecho en el stand por el código QR.',
           'Personalise your medal at the HOKA booth. Registration required, done at the booth via QR code.'],
    dias: ['2026-09-19', '2026-09-20'],
    horas: { '2026-09-19': ['14:00', '18:00'], '2026-09-20': ['10:00', '13:00'] },
    local: estande('HOKA', 'B1'), inscricao: 'previa', destaque: 'sim',
  }),
  ...ativacao({
    slug: 'hoka-trilhas-limpas', marca: 'HOKA', logoArquivo: 'hoka',
    tit: ['Ação Trilhas Limpas', 'Acción Trilhas Limpas', 'Trilhas Limpas action'],
    desc: ['Participe da ação Trilhas Limpas pelo QR code no estande da HOKA.',
           'Participa de la acción Trilhas Limpas con el código QR en el stand de HOKA.',
           'Join the Trilhas Limpas clean trails action via the QR code at the HOKA booth.'],
    dias: ['2026-09-20'], local: estande('HOKA', 'B1'),
  }),
  ...emSessoes({
    slug: 'nnormal-tenis', marca: 'NNormal', logoArquivo: 'nnormal',
    tit: ['Experimentação de tênis NNormal', 'Prueba de zapatillas NNormal', 'NNormal shoe try-on'],
    desc: ['Experimente os tênis da NNormal durante o Paraty Brazil by UTMB 2026, nos horários disponíveis. Inscrição prévia pelo formulário.',
           'Prueba las zapatillas NNormal durante Paraty Brazil by UTMB 2026, en los horarios disponibles. Inscripción previa por el formulario.',
           'Try NNormal shoes during Paraty Brazil by UTMB 2026 at the available times. Sign up in advance through the form.'],
    horarios: {
      '2026-09-17': ['14:00', '15:30'],
      '2026-09-18': ['10:00', '11:00', '14:00', '15:30'],
      '2026-09-19': ['10:00', '11:00'],
    },
    local: estande('NNormal', 'D9'), inscricao: 'previa',
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSdszm1td7Ho4dEQMmyz-ioMdKBreLnac-avKIeeV8wsSKyVBw/viewform',
  }),
  ...ativacao({
    slug: 'coros-cacada', marca: 'COROS', logoArquivo: 'coros',
    tit: ['Caça ao Tesouro COROS', 'Búsqueda del tesoro COROS', 'COROS treasure hunt'],
    desc: ['Uma caça ao tesouro pela rota liberada no Strava da COROS Brasil. Encontre a caixa do COROS NOMAD escondida pelo percurso e leve até o estande da COROS para receber o prêmio.',
           'Una búsqueda del tesoro por la ruta publicada en el Strava de COROS Brasil. Encuentra la caja del COROS NOMAD escondida en el recorrido y llévala al stand de COROS para recibir el premio.',
           'A treasure hunt along the route shared on the COROS Brasil Strava. Find the COROS NOMAD box hidden on the course and bring it to the COROS booth to claim the prize.'],
    dias: ['2026-09-18'], horas: { '2026-09-18': ['12:00', ''] },
    local: estande('COROS', 'D9'),
  }),
  ...ativacao({
    slug: 'vivas-roleta', marca: 'VIVÁS MOVE', logoArquivo: 'vivas-move',
    tit: ['Roleta de descontos', 'Ruleta de descuentos', 'Discount wheel'],
    desc: ['Gire a roleta e leve o desconto que sair.', 'Gira la ruleta y llévate el descuento.', 'Spin the wheel and take the discount.'],
    dias: ['2026-09-17', '2026-09-18'],
    horas: { '2026-09-17': ['14:00', '18:00'], '2026-09-18': ['14:00', '18:00'] },
    local: estande('VIVÁS MOVE', 'D8'),
  }),
  ...ativacao({
    slug: 'drpeanut-degustacao', marca: 'DR PEANUT', logoArquivo: 'dr-peanut',
    tit: ['Degustação DR PEANUT', 'Degustación DR PEANUT', 'DR PEANUT tasting'],
    desc: ['Proteína, pasta de amendoim e barra proteica na airfryer.', 'Proteína, pasta de maní y barra proteica en la airfryer.', 'Protein, peanut butter and protein bar from the airfryer.'],
    dias: TODOS, local: estande('DR PEANUT', 'D4'),
  }),
  ...ativacao({
    slug: 'mombora-degustacao', marca: 'MOMBORA', logoArquivo: 'mombora',
    tit: ['Degustação da linha completa', 'Degustación de la línea completa', 'Full range tasting'],
    desc: ['Prove a linha completa, com canapé de Ultrabutter e pipoca com caramelo salgado.',
           'Prueba la línea completa, con canapé de Ultrabutter y palomitas con caramelo salado.',
           'Taste the full range, with Ultrabutter canapés and salted caramel popcorn.'],
    dias: TODOS, local: estande('MOMBORA', 'F8'),
  }),
  ...ativacao({
    slug: 'mombora-compre-ganhe', marca: 'MOMBORA', logoArquivo: 'mombora',
    tit: ['Compre e ganhe', 'Compra y gana', 'Buy and get'],
    desc: ['Na compra, ganhe flasks, bonés e mochila. Desconto progressivo no estande.',
           'Con tu compra, gana flasks, gorras y mochila. Descuento progresivo en el stand.',
           'Buy and get flasks, caps and a backpack. Progressive discount at the booth.'],
    dias: TODOS, local: estande('MOMBORA', 'F8'),
  }),
  ...ativacao({
    slug: 'strava-veja-brunch', marca: 'Strava; VEJA', logoArquivo: 'strava',
    tit: ['Brunch e Shake Out Strava + VEJA', 'Brunch y Shake Out Strava + VEJA', 'Strava + VEJA brunch and shake out'],
    desc: ['Corrida leve seguida de brunch. Apenas para convidados, local revelado a quem recebeu o convite.',
           'Trote suave seguido de brunch. Solo para invitados, el lugar se revela a quien recibió la invitación.',
           'Easy shake out run followed by brunch. Invite only, the venue is shared with guests.'],
    dias: ['2026-09-18'], horas: { '2026-09-18': ['07:30', ''] },
    local: ['Local secreto', 'Lugar secreto', 'Secret location'], inscricao: 'invite',
  }),
  ...ativacao({
    slug: 'yopp-oculos', marca: 'Yopp', logoArquivo: 'yopp',
    tit: ['Óculos oficiais Yopp & UTMB', 'Gafas oficiales Yopp & UTMB', 'Official Yopp & UTMB eyewear'],
    desc: ['Venda dos modelos licenciados oficiais exclusivos Yopp & UTMB: um modelo hexagonal e outro Performance fotocromático.',
           'Venta de los modelos licenciados oficiales exclusivos Yopp & UTMB: uno hexagonal y otro Performance fotocromático.',
           'Sale of the exclusive official licensed Yopp & UTMB models: a hexagonal frame and a photochromic Performance model.'],
    dias: TODOS, local: estande('Yopp', 'F2'),
  }),
  ...ativacao({
    slug: 'espaco-mulher', marca: 'Mulher by Nubank',
    tit: ['Espaço Mulher', 'Espacio Mujer', "Women's Space"],
    desc: ['Espaço dedicado ao público feminino, com trancistas, massagem esportiva e estúdio de fotos da FOTOP. Para entrar, responda a uma pesquisa rápida sobre a sua experiência no trail.',
           'Espacio dedicado al público femenino, con trenzas, masaje deportivo y estudio de fotos de FOTOP. Para entrar, responde una encuesta rápida sobre tu experiencia en el trail.',
           'Space for women, with braiding, sports massage and a FOTOP photo studio. To enter, answer a quick survey about your trail running experience.'],
    dias: TODOS, local: estande('Mulher by Nubank', 'C1 e C2'),
  }),
  ...ativacao({
    slug: 'gu-shake-out', marca: 'GU',
    tit: ['Shake Out GU', 'Shake Out GU', 'GU shake out'],
    desc: ['Corrida leve de soltura com os géis GU. Apenas para convidados.',
           'Trote suave de soltura con los geles GU. Solo para invitados.',
           'Easy shake out run with GU gels. Invite only.'],
    dias: ['2026-09-18'], horas: { '2026-09-18': ['08:00', ''] },
    local: aConfirmar, inscricao: 'invite',
  }),
  ...ativacao({
    slug: 'garmin-gpx', marca: 'Garmin', logoArquivo: 'garmin',
    tit: ['Baixe e configure seu GPX', 'Descarga y configura tu GPX', 'Download and set up your GPX'],
    desc: ['Leve o relógio ao estande da Garmin e saia com o percurso da sua prova configurado.',
           'Lleva tu reloj al stand de Garmin y sal con el recorrido de tu carrera configurado.',
           'Bring your watch to the Garmin booth and leave with your race course set up.'],
    dias: ['2026-09-17', '2026-09-18', '2026-09-19'],
    horas: { '2026-09-17': ['15:00', ''], '2026-09-18': ['11:00', ''], '2026-09-19': ['11:00', ''] },
    local: estande('Garmin', 'C4'),
  }),
  ...ativacao({
    slug: 'garmin-gpx-tarde', marca: 'Garmin', logoArquivo: 'garmin',
    tit: ['Baixe e configure seu GPX', 'Descarga y configura tu GPX', 'Download and set up your GPX'],
    desc: ['Leve o relógio ao estande da Garmin e saia com o percurso da sua prova configurado.',
           'Lleva tu reloj al stand de Garmin y sal con el recorrido de tu carrera configurado.',
           'Bring your watch to the Garmin booth and leave with your race course set up.'],
    dias: ['2026-09-18'], horas: { '2026-09-18': ['16:00', ''] },
    local: estande('Garmin', 'C4'),
  }),
  ...ativacao({
    slug: 'shokz-esquenta', marca: 'Shokz', logoArquivo: 'shokz',
    tit: ['Esquenta 5k Shokz', 'Calentamiento 5k Shokz', 'Shokz 5k warm-up'],
    desc: ['Vagas limitadas. As primeiras inscrições correm testando o produto, até acabar o estoque. Inscrições no estande da Shokz, B3.',
           'Cupos limitados. Las primeras inscripciones corren probando el producto, hasta agotar stock. Inscripciones en el stand de Shokz, B3.',
           'Limited places. The first sign-ups run testing the product, while stocks last. Sign up at the Shokz booth, B3.'],
    dias: ['2026-09-18'], horas: { '2026-09-18': ['09:00', '10:00'] },
    local: aConfirmar, inscricao: 'previa', destaque: 'sim',
  }),
  ...ativacao({
    slug: 'bananinha-degustacao', marca: 'Bananinha Paraibuna', logoArquivo: 'bananinha',
    tit: ['Degustação Bananinha Paraibuna', 'Degustación Bananinha Paraibuna', 'Bananinha Paraibuna tasting'],
    desc: ['Degustação dos produtos no estande.', 'Degustación de los productos en el stand.', 'Product tasting at the booth.'],
    dias: TODOS, local: estande('Bananinha Paraibuna', 'E2'),
  }),
  ...ativacao({
    slug: 'drpeanut-canoa', marca: 'DR PEANUT', logoArquivo: 'dr-peanut',
    tit: ['Ativação com canoa havaiana', 'Activación con canoa hawaiana', 'Outrigger canoe activation'],
    desc: ['Ativação da DR PEANUT com canoa havaiana nos dias de evento. Local e horários a confirmar.',
           'Activación de DR PEANUT con canoa hawaiana en los días del evento. Lugar y horarios por confirmar.',
           'DR PEANUT outrigger canoe activation during the event. Venue and times to be confirmed.'],
    dias: TODOS, local: aConfirmar,
  }),
  ...ativacao({
    slug: 'liquidz-sabor', marca: 'Liquidz', logoArquivo: 'liquidz',
    tit: ['Degustação do novo sabor', 'Degustación del nuevo sabor', 'New flavour tasting'],
    desc: ['O sabor só é lançado em 22 de setembro. Aqui dá para provar e comprar antes de todo mundo.',
           'El sabor se lanza el 22 de septiembre. Aquí puedes probarlo y comprarlo antes que todos.',
           'The flavour launches on 22 September. Here you can taste and buy it before anyone else.'],
    dias: TODOS, local: estande('Liquidz', 'C5'), destaque: 'sim',
  }),
  ...ativacao({
    slug: 'liquidz-hidratacao', marca: 'Liquidz', logoArquivo: 'liquidz',
    tit: ['Teste de hidratação', 'Test de hidratación', 'Hydration test'],
    desc: ['Nutricionista no estande testando a hidratação dos atletas e falando sobre eletrólitos no endurance.',
           'Nutricionista en el stand midiendo la hidratación y hablando de electrolitos en el endurance.',
           'A nutritionist at the booth testing hydration and explaining electrolytes in endurance.'],
    dias: ['2026-09-17'], horas: { '2026-09-17': ['14:00', '18:00'] },
    local: estande('Liquidz', 'C5'), destaque: 'sim',
  }),
  ...ativacao({
    slug: 'liquidz-samples', marca: 'Liquidz', logoArquivo: 'liquidz',
    tit: ['Cadastro e samples', 'Registro y muestras', 'Sign up and samples'],
    desc: ['Cadastre-se no estande e leve amostras da marca, incluindo o sabor novo.',
           'Regístrate en el stand y llévate muestras, incluido el sabor nuevo.',
           'Sign up at the booth and take samples, including the new flavour.'],
    dias: TODOS, local: estande('Liquidz', 'C5'),
  }),
  ...ativacao({
    slug: 'aimo-qrcode', marca: 'AIMO', logoArquivo: 'aimo',
    tit: ['QR code de 10% e sorteio de bonés', 'QR de 10% y sorteo de gorras', '10% QR code and cap giveaway'],
    desc: ['Leia o QR code no estande para 10% de desconto. Dois bonés são sorteados entre os cadastrados.',
           'Escanea el QR en el stand para 10% de descuento. Se sortean dos gorras entre los registrados.',
           'Scan the QR code at the booth for 10% off. Two caps are raffled among those who sign up.'],
    dias: TODOS, local: estande('AIMO', 'E3'), destaque: 'sim',
  }),
  ...ativacao({
    slug: 'aimo-camiseta', marca: 'AIMO', logoArquivo: 'aimo',
    tit: ['Camiseta de edição limitada', 'Camiseta de edición limitada', 'Limited edition tee'],
    desc: ['Souvenir AIMO do Paraty Brazil by UTMB, com customização feita na hora no estande.',
           'Souvenir AIMO del Paraty Brazil by UTMB, personalizada en el momento.',
           'AIMO souvenir of Paraty Brazil by UTMB, customised on the spot.'],
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
    tit: ['Degustação de barrinhas de carbo', 'Degustación de barras de carbo', 'Carb bar tasting'],
    desc: ['Prove as barrinhas no estande da Tricky.', 'Prueba las barras en el stand de Tricky.', 'Try the bars at the Tricky booth.'],
    dias: TODOS, local: estande('Tricky', 'E9'),
  }),
]

// ---------------------------------------------------------- palco da Expo
/** Item unico de palco, com pilar proprio e duracao fechada. */
// Palco Expo: vem direto da aba base da planilha de agenda do palco, lida
// pelo app (src/data/palco.ts). Nao entra mais nesta planilha.


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

const PEITO = ['Mediante apresentação do número de peito.', 'Presentando el dorsal.', 'Show your race bib.']
const DATAS_EXPO = '17 a 20 de setembro'

const BENEFICIOS = [
  beneficio({
    id: 'ben-columbia', onde: 'expo', categoria: 'equipamentos', nome: 'COLUMBIA',
    desconto: ['20% a 40% de desconto', '20% a 40% de descuento', '20% to 40% off'],
    descricao: ['Desconto válido nos produtos do estande.', 'Descuento válido en los productos del stand.', 'Discount valid on products at the booth.'],
    local: estande('COLUMBIA', 'D1'), condicoes: PEITO, validade: DATAS_EXPO, destaque: 'sim',
    logoArquivo: 'columbia',
  }),
  beneficio({
    id: 'ben-hoka', onde: 'expo', categoria: 'equipamentos', nome: 'HOKA',
    desconto: ['20% em produtos selecionados', '20% en productos seleccionados', '20% off selected products'],
    descricao: ['Em compras a partir de R$ 1.000, ganhe 1 boné HOKA, enquanto durar o estoque.',
                'En compras desde R$ 1.000, gana 1 gorra HOKA, hasta agotar existencias.',
                'Spend R$ 1,000 or more and get a HOKA cap, while supplies last.'],
    local: estande('HOKA', 'B1'), condicoes: PEITO, validade: DATAS_EXPO,
    logoArquivo: 'hoka', destaque: 'sim',
  }),
  beneficio({
    id: 'ben-nautika', onde: 'expo', categoria: 'equipamentos', nome: 'NTK Nautika',
    desconto: ['Até 40% de desconto', 'Hasta 40% de descuento', 'Up to 40% off'],
    descricao: ['Brindes nas compras acima de R$ 250.', 'Regalos en compras superiores a R$ 250.', 'Free gifts on purchases over R$ 250.'],
    local: estande('NTK Nautika', 'F4'), condicoes: PEITO, validade: DATAS_EXPO,
    logoArquivo: 'nautika',
  }),
  beneficio({
    id: 'ben-deuter', onde: 'expo', categoria: 'equipamentos', nome: 'Deuter',
    desconto: ['Até 40% de desconto', 'Hasta 40% de descuento', 'Up to 40% off'],
    descricao: ['Brindes nas compras acima de R$ 250.', 'Regalos en compras superiores a R$ 250.', 'Free gifts on purchases over R$ 250.'],
    local: estande('Deuter', 'E6'), condicoes: PEITO, validade: DATAS_EXPO,
    logoArquivo: 'deuter',
  }),
]

// ------------------------------------------------------------------ saida
const escaparCsv = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const paraCsv = (cols, linhas) =>
  [cols.join(','), ...linhas.map((l) => cols.map((c) => escaparCsv(l[c] ?? '')).join(','))].join('\n') + '\n'
const paraTsv = (cols, linhas) =>
  [cols.join('\t'), ...linhas.map((l) => cols.map((c) => (l[c] ?? '').replace(/[\t\n]/g, ' ')).join('\t'))].join('\n')

const programacao = [...OFICIAL, ...ATIVACOES]

await mkdir(resolve(raiz, 'public/dados'), { recursive: true })
await writeFile(resolve(raiz, 'planilha/Programacao.csv'), paraCsv(COL_PROG, programacao))
await writeFile(resolve(raiz, 'planilha/Beneficios.csv'), paraCsv(COL_BEN, BENEFICIOS))
await writeFile(resolve(raiz, 'public/dados/programacao.tsv'), paraTsv(COL_PROG, programacao))
await writeFile(resolve(raiz, 'public/dados/beneficios.tsv'), paraTsv(COL_BEN, BENEFICIOS))

const ids = programacao.map((l) => l.id)
if (new Set(ids).size !== ids.length) throw new Error('id repetido na programacao')

console.log(
  `programacao: ${programacao.length} linhas (${OFICIAL.length} oficiais, ` +
    `${ATIVACOES.length} ativacoes)`,
)
console.log(`beneficios:  ${BENEFICIOS.length} linhas`)
