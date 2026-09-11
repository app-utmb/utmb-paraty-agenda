/**
 * Segmentos da Expo, na categorizacao definida pelo evento. O rotulo de cada
 * um mora nos dicionarios de idioma, entao a lista aqui e so o codigo.
 */
export const SEGMENTOS = [
  'nutricao',
  'hidratacao',
  'calcados',
  'vestuario',
  'equipamentos',
  'tecnologia',
  'acessorios',
  'servicos',
  'institucional',
] as const
export type Segmento = (typeof SEGMENTOS)[number]

/**
 * Os pontos abaixo sao dados em pixels do mapa de referencia, no tamanho em
 * que ele foi medido. A tela usa fracao, calculada aqui, entao a imagem pode
 * ser reexportada em qualquer resolucao sem mexer nas coordenadas.
 */
export const REFERENCIA = { largura: 1440, altura: 810 } as const

export type TipoPonto = 'marca' | 'servico'

export interface PontoMapa {
  id: string
  /** Nome mostrado no mapa e no topo do detalhe. */
  nome: string
  /** Codigo do estande no mapa, ex "D4". Vazio nas areas de servico. */
  estande: string
  /**
   * Nomes que casam com a coluna `marca` da programacao e com a coluna
   * `nome` dos beneficios. Um estande pode abrigar mais de uma marca.
   */
  marcas: string[]
  /** Um estande compartilhado pode ter mais de um segmento. */
  segmentos: Segmento[]
  /** Arquivo em public/logos, sem extensao. */
  logo: string | null
  tipo: TipoPonto
  /** Retangulo em fracao de 0 a 1 da largura e da altura da imagem. */
  x: number
  y: number
  w: number
  h: number
}

type Bruto = Omit<PontoMapa, 'x' | 'y' | 'w' | 'h'> & {
  px: [number, number, number, number]
}

const BRUTOS: Bruto[] = [
  // ---------------------------------------------------------- setor D
  {
    id: 'prefeitura', nome: 'Prefeitura de Paraty', estande: 'A1 e A2', marcas: [],
    segmentos: ['institucional'], logo: null, tipo: 'marca', px: [218, 230, 98, 64],
  },
  {
    id: 'provas-brasil', nome: 'Provas do Brasil by Fotop', estande: 'A3 a A5', marcas: [],
    segmentos: ['institucional'], logo: null, tipo: 'marca', px: [324, 230, 152, 64],
  },
  {
    id: 'columbia', nome: 'COLUMBIA', estande: 'D1', marcas: ['COLUMBIA'],
    segmentos: ['vestuario'],
    logo: null, tipo: 'marca', px: [570, 230, 50, 64],
  },
  {
    id: 'kailash', nome: 'Kailash', estande: 'D2 e D3', marcas: ['Kailash'],
    segmentos: ['equipamentos'], logo: null, tipo: 'marca', px: [628, 230, 110, 64],
  },
  {
    id: 'dr-peanut', nome: 'DR PEANUT', estande: 'D4', marcas: ['DR PEANUT'],
    segmentos: ['nutricao'],
    logo: 'dr-peanut', tipo: 'marca', px: [744, 230, 52, 64],
  },
  {
    id: 'expedition', nome: 'Expedition', estande: 'D5', marcas: ['Expedition'],
    segmentos: ['equipamentos'],
    logo: 'expedition', tipo: 'marca', px: [804, 230, 50, 64],
  },
  {
    id: 'bioup', nome: 'BioUp', estande: 'D6', marcas: ['BioUp'],
    segmentos: ['nutricao'], logo: null, tipo: 'marca', px: [862, 230, 50, 64],
  },
  {
    id: 'runlastic', nome: 'Runlastic', estande: 'D7', marcas: ['Runlastic'],
    segmentos: ['vestuario'],
    logo: 'runlastic', tipo: 'marca', px: [920, 230, 52, 64],
  },
  {
    id: 'vivas-move', nome: 'VIVAS MOVE', estande: 'D8', marcas: ['VIVAS MOVE'],
    segmentos: ['vestuario'],
    logo: 'vivas-move', tipo: 'marca', px: [980, 230, 50, 64],
  },
  {
    id: 'nnormal-coros', nome: 'NNormal e COROS', estande: 'D9', marcas: ['NNormal', 'COROS'],
    segmentos: ['calcados', 'tecnologia'],
    logo: 'nnormal', tipo: 'marca', px: [1038, 230, 50, 64],
  },
  // ---------------------------------------------------------- setor B
  {
    id: 'hoka', nome: 'HOKA', estande: 'B1', marcas: ['HOKA'],
    segmentos: ['calcados'],
    logo: 'hoka', tipo: 'marca', px: [218, 364, 134, 76],
  },
  {
    id: 'compressport', nome: 'Compressport', estande: 'B2', marcas: ['Compressport'],
    segmentos: ['vestuario'], logo: null, tipo: 'marca', px: [358, 364, 56, 76],
  },
  {
    id: 'shokz', nome: 'Shokz', estande: 'B3', marcas: ['Shokz'],
    segmentos: ['tecnologia'], logo: null, tipo: 'marca', px: [420, 364, 56, 76],
  },
  // ---------------------------------------------------------- setor E
  {
    id: 'brooklin', nome: 'Brooklin', estande: 'E1', marcas: ['Brooklin'],
    segmentos: ['vestuario'], logo: null, tipo: 'marca', px: [744, 364, 52, 34],
  },
  {
    id: 'bananinha', nome: 'Bananinha Paraibuna', estande: 'E2', marcas: ['Bananinha Paraibuna'],
    segmentos: ['hidratacao'],
    logo: 'bananinha', tipo: 'marca', px: [804, 364, 50, 34],
  },
  {
    id: 'aimo', nome: 'AIMO', estande: 'E3', marcas: ['AIMO'],
    segmentos: ['vestuario'],
    logo: 'aimo', tipo: 'marca', px: [862, 364, 50, 32],
  },
  {
    id: 'kipway', nome: 'Kipway', estande: 'E4', marcas: ['Kipway'],
    segmentos: ['acessorios'], logo: null, tipo: 'marca', px: [920, 364, 52, 32],
  },
  {
    id: 'gu', nome: 'GU', estande: 'E5', marcas: ['GU'],
    segmentos: ['nutricao'], logo: null, tipo: 'marca', px: [980, 364, 50, 32],
  },
  {
    id: 'equip', nome: 'Equip', estande: '', marcas: ['Equip'],
    segmentos: ['equipamentos'], logo: null, tipo: 'marca', px: [1038, 364, 50, 76],
  },
  {
    id: 'deuter', nome: 'Deuter', estande: 'E6', marcas: ['Deuter'],
    segmentos: ['equipamentos'], logo: null, tipo: 'marca', px: [744, 408, 52, 32],
  },
  {
    id: 'sumaca', nome: 'SUMACA', estande: 'E7', marcas: ['SUMACA'],
    segmentos: ['vestuario'],
    logo: 'sumaca', tipo: 'marca', px: [804, 408, 50, 32],
  },
  {
    id: 'litoral', nome: 'Drogaria Litoral', estande: 'E8', marcas: ['Drogaria Litoral'],
    segmentos: ['servicos'], logo: null, tipo: 'marca', px: [862, 408, 50, 32],
  },
  {
    id: 'desola', nome: 'Desola', estande: '', marcas: ['Desola'],
    segmentos: ['calcados'],
    logo: null, tipo: 'marca', px: [920, 408, 52, 32],
  },
  {
    id: 'tricky', nome: 'Tricky', estande: 'E9', marcas: ['Tricky'],
    segmentos: ['nutricao'],
    logo: 'tricky', tipo: 'marca', px: [980, 408, 50, 32],
  },
  // ---------------------------------------------------------- setor C
  {
    id: 'nubank', nome: 'Mulher by Nubank', estande: 'C1 e C2', marcas: ['Nubank'],
    segmentos: ['servicos'], logo: null, tipo: 'marca', px: [218, 508, 98, 64],
  },
  {
    id: 'paraty-tours', nome: 'Paraty Tours', estande: 'C3', marcas: ['Paraty Tours'],
    segmentos: ['servicos'], logo: null, tipo: 'marca', px: [324, 508, 46, 64],
  },
  {
    id: 'garmin', nome: 'Garmin', estande: 'C4', marcas: ['Garmin'],
    segmentos: ['tecnologia'], logo: null, tipo: 'marca', px: [376, 508, 46, 64],
  },
  {
    id: 'liquidz', nome: 'Liquidz', estande: 'C5', marcas: ['Liquidz'],
    segmentos: ['hidratacao'],
    logo: 'liquidz', tipo: 'marca', px: [428, 508, 48, 64],
  },
  // ---------------------------------------------------------- setor F
  {
    id: 'veja', nome: 'Veja', estande: 'F1', marcas: ['Veja'],
    segmentos: ['calcados'], logo: null, tipo: 'marca', px: [570, 510, 50, 62],
  },
  {
    id: 'yopp', nome: 'Yopp', estande: 'F2', marcas: ['Yopp'],
    segmentos: ['acessorios'],
    logo: 'yopp', tipo: 'marca', px: [628, 510, 52, 62],
  },
  {
    id: 'pink-cheeks', nome: 'Pink Cheeks', estande: 'F3', marcas: ['Pink Cheeks'],
    segmentos: ['acessorios'], logo: null, tipo: 'marca', px: [688, 510, 50, 62],
  },
  {
    id: 'nautika', nome: 'NTK Nautika e Azteq', estande: 'F4 a F6', marcas: ['NTK', 'Nautika', 'Azteq'],
    segmentos: ['equipamentos'],
    logo: 'nautika', tipo: 'marca', px: [748, 510, 168, 62],
  },
  {
    id: 'suunto', nome: 'Suunto', estande: '', marcas: ['Suunto'],
    segmentos: ['tecnologia'], logo: null, tipo: 'marca', px: [924, 510, 50, 62],
  },
  {
    id: 'mombora', nome: 'MOMBORA', estande: 'F8 e F9', marcas: ['MOMBORA'],
    segmentos: ['nutricao'],
    logo: null, tipo: 'marca', px: [982, 510, 110, 62],
  },
  {
    id: 'vibram', nome: 'Vibram', estande: '', marcas: ['Vibram'],
    segmentos: ['calcados'], logo: null, tipo: 'marca', px: [126, 510, 56, 62],
  },
  // -------------------------------------------------------- servicos
  {
    id: 'palco', nome: 'Palco UTMB', estande: '', marcas: [],
    segmentos: [], logo: null, tipo: 'servico', px: [50, 244, 104, 244],
  },
  {
    id: 'praca-alimentacao', nome: 'Praca de alimentacao', estande: '', marcas: [],
    segmentos: [], logo: null, tipo: 'servico', px: [12, 282, 30, 106],
  },
  {
    id: 'cafe', nome: 'Cafe UTMB', estande: '', marcas: [],
    segmentos: [], logo: null, tipo: 'servico', px: [490, 236, 64, 54],
  },
  {
    id: 'loja-oficial', nome: 'Loja oficial', estande: '', marcas: [],
    segmentos: ['vestuario'], logo: null, tipo: 'servico', px: [570, 364, 166, 76],
  },
  {
    id: 'retirada-kit', nome: 'Retirada de kit', estande: '', marcas: [],
    segmentos: [], logo: null, tipo: 'servico', px: [1138, 308, 86, 188],
  },
  {
    id: 'foto-oficial', nome: 'Foto oficial by FOTOP', estande: 'E10', marcas: ['FOTOP'],
    segmentos: ['servicos'], logo: null, tipo: 'marca', px: [1138, 508, 86, 64],
  },
  {
    id: 'banheiros', nome: 'Banheiros', estande: '', marcas: [],
    segmentos: [], logo: null, tipo: 'servico', px: [218, 584, 252, 52],
  },
]

/**
 * Marcas que aparecem na programacao mas nao tem estande na Expo. Ficam fora
 * da checagem de que toda marca da agenda tem ponto no mapa.
 */
export const MARCAS_SEM_ESTANDE = ['Paraty Brazil by UTMB', 'SOS Mata Atlântica', 'Strava'] as const

export const PONTOS_MAPA: PontoMapa[] = BRUTOS.map(({ px, ...resto }) => ({
  ...resto,
  x: px[0] / REFERENCIA.largura,
  y: px[1] / REFERENCIA.altura,
  w: px[2] / REFERENCIA.largura,
  h: px[3] / REFERENCIA.altura,
}))
