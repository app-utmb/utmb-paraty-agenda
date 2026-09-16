import { describe, expect, it } from 'vitest'
import { normalizarProgramacao } from '../data/normalize'
import {
  dataDoDia,
  ehAbaDoPalco,
  faixaDoHorario,
  linhasDoPalco,
  nomesDeQuemApresenta,
} from '../data/palco'
import { lerCsv } from '../data/sheets'

const CABECALHO =
  'Categoria,Marca,O que,Min,Tema do talk,Quem apresenta,Cargo / função,Status,Dia alocado,Horário alocado,Tema ES,Tema EN'

const base = (...linhas: string[]) => lerCsv([CABECALHO, ...linhas].join('\n'))
const itens = (...linhas: string[]) => normalizarProgramacao(linhasDoPalco(base(...linhas))).dados

describe('leitura da aba base do palco', () => {
  it('transforma uma talk confirmada em item do Palco Expo', () => {
    const [item] = itens(
      'Patrocinador,Liquidiz,Talk,15,Hidratação Funcional,Talita Cristina,Nutricionista,confirmado,Sexta,15h45 - 16h00 (15 min),,',
    )
    expect(item).toMatchObject({
      data: '2026-09-18',
      horaInicio: '15:45',
      horaFim: '16:00',
      pilar: 'talks',
      palestrante: 'Talita Cristina',
      marca: 'Liquidz',
    })
    expect(item?.titulo.pt).toBe('Hidratação Funcional')
    expect(item?.descricao.pt).toBe('Nutricionista')
    expect(item?.local).toEqual({ pt: 'Palco Expo', es: 'Escenario Expo', en: 'Expo Stage' })
    expect(item?.logoUrl).toMatch(/logos\/liquidz\.png$/)
  })

  it('so publica o que esta confirmado e tem dia e horario', () => {
    const r = itens(
      'Parceiro,Strava,Talk,15,,Rosana,,pendente,Sexta,15h15 - 15h30 (15 min),,',
      'Atleta,Celinho,Filme,40,Celinho,,,confirmado,,,,',
      'Global,Hoka,Talk,15,,,,confirmado,Sexta,,,',
      'Global,Shokz,Talk,15,Fone oficial,,,Confirmado,Sexta,15h30 - 15h45,,',
    )
    expect(r.map((i) => i.titulo.pt)).toEqual(['Fone oficial'])
  })

  it('reconhece filme e usa as colunas de traducao quando existem', () => {
    const [item] = itens(
      'Atleta,Tala - Maciel,Filme,15,Tala,,,confirmado,Quinta,17h00 - 17h15 (15 min),Tala ES,Tala EN',
    )
    expect(item?.pilar).toBe('filmes')
    expect(item?.titulo).toEqual({ pt: 'Tala', es: 'Tala ES', en: 'Tala EN' })
    expect(item?.marca).toBeNull()
  })

  it('liga nomes da base aos estandes', () => {
    const r = itens(
      'Patrocinador,Probiotica,Talk,15,Treino,,,confirmado,Sexta,16h15 - 16h30,,',
      'Patrocinador,Bananinha,Talk,15,Performance,,,confirmado,Quinta,16h45 - 17h00,,',
      'Parceiro,ESG,Talk,15,Sustentabilidade,,,confirmado,Sexta,16h30 - 16h45,,',
      'Patrocinador,Nautika,Talk,15,Casa de marcas,,,confirmado,Sexta,16h00 - 16h15,,',
      'Parceiro,Fotop,Talk,15,Muito além da foto,,,confirmado,Sexta,11h45 - 12h00,,',
    )
    const marca = (t: string) => r.find((i) => i.titulo.pt === t)?.marca
    expect(marca('Treino')).toBe('DR PEANUT')
    expect(marca('Performance')).toBe('Bananinha Paraibuna')
    expect(marca('Sustentabilidade')).toBe('Paraty Brazil by UTMB')
    expect(marca('Casa de marcas')).toBe('NTK Nautika')
    expect(marca('Muito além da foto')).toBe('FOTOP')
  })

  it('sem tema, o titulo e o tipo com a marca', () => {
    const [item] = itens('Global,Shokz,Talk,15,,,,confirmado,Sexta,15h30 - 15h45,,')
    expect(item?.titulo.pt).toBe('Talk Shokz')
  })

  it('mantem o id quando so o horario muda, para a agenda do atleta nao perder a estrela', () => {
    const antes = linhasDoPalco(base('Global,Shokz,Talk,15,Fone,,,confirmado,Sexta,15h30 - 15h45,,'))
    const depois = linhasDoPalco(base('Global,Shokz,Talk,15,Fone,,,confirmado,Quinta,10h00 - 10h15,,'))
    expect(antes[0]?.id).toBe(depois[0]?.id)
  })

  it('reconhece a aba pelas colunas', () => {
    expect(ehAbaDoPalco(base('Global,Shokz,Talk,15,,,,confirmado,Sexta,15h30,,'))).toBe(true)
    expect(ehAbaDoPalco(lerCsv('outra,coisa\n1,2'))).toBe(false)
  })
})

describe('dia e horario da base', () => {
  it('entende nome do dia e data', () => {
    expect(dataDoDia('Quinta')).toBe('2026-09-17')
    expect(dataDoDia('sexta-feira')).toBe('2026-09-18')
    expect(dataDoDia('Sábado')).toBe('2026-09-19')
    expect(dataDoDia('20/09')).toBe('2026-09-20')
    expect(dataDoDia('segunda')).toBeNull()
  })

  it('entende a faixa e calcula o fim pelos minutos quando falta', () => {
    expect(faixaDoHorario('15h45 - 16h00 (15 min)', '15')).toEqual(['15:45', '16:00'])
    expect(faixaDoHorario('16h', '30')).toEqual(['16:00', '16:30'])
    expect(faixaDoHorario('a definir', '15')).toBeNull()
  })
})

describe('quem apresenta', () => {
  it('separa dois nomes por virgula, venham com barra, quebra de linha ou "e"', () => {
    expect(nomesDeQuemApresenta('Cris Savieto / Vandrei Stephani')).toBe('Cris Savieto, Vandrei Stephani')
    expect(nomesDeQuemApresenta('Cris Savieto e\nVandrei Stephani')).toBe('Cris Savieto, Vandrei Stephani')
    expect(nomesDeQuemApresenta('Sophie Bouquet')).toBe('Sophie Bouquet')
  })

  it('poe o moderador na linha de baixo', () => {
    expect(nomesDeQuemApresenta('Rosalia Camargo e Virginio\nModeradora: Tamis Monteiro')).toBe(
      'Rosalia Camargo, Virginio\nModeradora: Tamis Monteiro',
    )
  })

  it('nao quebra uma frase com "e" no meio', () => {
    const frase = 'Geisa: liga da justiça e caiçara em chamonix'
    expect(nomesDeQuemApresenta(frase)).toBe(frase)
  })
})

describe('item que vale por dois pilares', () => {
  it('entende "Talk e Filme" como filme e talk', () => {
    const [item] = itens(
      'Imprensa,Gi Martins,Talk e Filme,30,A Filha do Vento,Giovana Martins,,confirmado,Quinta,18h00 - 18h30,,',
    )
    expect(item?.pilares).toEqual(['filmes', 'talks'])
    expect(item?.pilar).toBe('filmes')
  })
})
