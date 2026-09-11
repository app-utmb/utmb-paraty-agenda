import { describe, expect, it } from 'vitest'
import {
  chaveColuna,
  dataValida,
  ehVerdadeiro,
  escolherIdioma,
  normalizarConfig,
  normalizarHora,
  normalizarInscricao,
  normalizarPilar,
  normalizarProgramacao,
  ordenarItens,
  paraMinutos,
  urlSegura,
} from '../data/normalize'
import { lerCsv } from '../data/sheets'
import type { ItemProgramacao } from '../data/types'

const CABECALHO =
  'id,data,dia_semana,hora_inicio,hora_fim,data_fim,pilar,titulo_pt,titulo_es,titulo_en,descricao_pt,descricao_es,descricao_en,local_pt,local_es,local_en,palestrante,marca,logo_url,inscricao,link_inscricao,destaque'

/** Monta uma linha CSV completa a partir de campos parciais. */
function linha(campos: Partial<Record<string, string>>): string {
  const colunas = CABECALHO.split(',')
  const padrao: Record<string, string> = {
    id: 'x1',
    data: '2026-09-17',
    dia_semana: 'quinta-feira',
    hora_inicio: '10:00',
    pilar: 'talks',
    titulo_pt: 'Titulo',
    inscricao: 'livre',
  }
  return colunas.map((c) => `"${(campos[c] ?? padrao[c] ?? '').replace(/"/g, '""')}"`).join(',')
}

function importar(...linhas: Partial<Record<string, string>>[]) {
  const csv = [CABECALHO, ...linhas.map(linha)].join('\n')
  return normalizarProgramacao(lerCsv(csv))
}

describe('auxiliares de texto', () => {
  it('normaliza nome de coluna ignorando acento, caixa, espaco e BOM', () => {
    expect(chaveColuna('Título PT ')).toBe('titulopt')
    expect(chaveColuna('﻿id')).toBe('id')
    expect(chaveColuna('hora_inicio')).toBe('horainicio')
    expect(chaveColuna('DESCRIÇÃO_ES')).toBe('descricaoes')
  })

  it('aceita variacoes de "sim" no campo destaque', () => {
    for (const v of ['sim', 'SIM', 'Sim', 's', 'x', 'TRUE', '1', 'yes']) {
      expect(ehVerdadeiro(v)).toBe(true)
    }
    for (const v of ['', 'nao', 'no', '0', 'talvez']) {
      expect(ehVerdadeiro(v)).toBe(false)
    }
  })
})

describe('horas', () => {
  it('converte HH:MM em minutos', () => {
    expect(paraMinutos('00:00')).toBe(0)
    expect(paraMinutos('10:30')).toBe(630)
    expect(paraMinutos('23:59')).toBe(1439)
  })

  it('aceita separadores alternativos e uma casa na hora', () => {
    expect(normalizarHora('9:05')).toBe('09:05')
    expect(normalizarHora('10h30')).toBe('10:30')
    expect(normalizarHora('08.15')).toBe('08:15')
  })

  it('recusa horas invalidas', () => {
    for (const v of ['', '25:00', '10:60', 'meio-dia', '1030', '--']) {
      expect(normalizarHora(v)).toBeNull()
    }
  })
})

describe('datas', () => {
  it('aceita apenas datas ISO que existem de verdade', () => {
    expect(dataValida('2026-09-17')).toBe(true)
    expect(dataValida('2026-02-31')).toBe(false)
    expect(dataValida('17/09/2026')).toBe(false)
    expect(dataValida('')).toBe(false)
  })
})

describe('pilar', () => {
  it('reconhece os tres pilares e apelidos comuns', () => {
    expect(normalizarPilar('oficial')).toBe('oficial')
    expect(normalizarPilar('OFICIAL')).toBe('oficial')
    expect(normalizarPilar('Talks')).toBe('talks')
    expect(normalizarPilar('palestra')).toBe('talks')
    expect(normalizarPilar('ativação')).toBe('ativacao')
    expect(normalizarPilar('ativacoes')).toBe('ativacao')
  })

  it('reconhece os pilares novos e apelidos com espaco', () => {
    expect(normalizarPilar('Filmes')).toBe('filmes')
    expect(normalizarPilar('documentário')).toBe('filmes')
    expect(normalizarPilar('roda de conversa')).toBe('talks')
    expect(normalizarPilar('Rodas de Conversa')).toBe('talks')
    expect(normalizarPilar('painel')).toBe('talks')
  })

  it('recusa pilar desconhecido ou vazio', () => {
    expect(normalizarPilar('workshop')).toBeNull()
    expect(normalizarPilar('')).toBeNull()
  })
})

describe('inscricao', () => {
  it('reconhece os tres valores e apelidos', () => {
    expect(normalizarInscricao('livre')).toBe('livre')
    expect(normalizarInscricao('prévia')).toBe('previa')
    expect(normalizarInscricao('INVITE')).toBe('invite')
    expect(normalizarInscricao('convite')).toBe('invite')
    expect(normalizarInscricao('qualquer')).toBeNull()
  })
})

describe('urlSegura', () => {
  it('aceita http, https e mailto', () => {
    expect(urlSegura('https://exemplo.com/a')).toBe('https://exemplo.com/a')
    expect(urlSegura('mailto:a@b.com')).toBe('mailto:a@b.com')
  })

  it('bloqueia esquemas perigosos e texto solto', () => {
    expect(urlSegura('javascript:alert(1)')).toBeNull()
    expect(urlSegura('data:text/html,<script>')).toBeNull()
    expect(urlSegura('so um texto')).toBeNull()
    expect(urlSegura('')).toBeNull()
  })
})

describe('normalizarProgramacao', () => {
  it('importa uma linha completa com os tres idiomas', () => {
    const { dados, problemas } = importar({
      id: 'q1',
      titulo_pt: 'Nutricao',
      titulo_es: 'Nutricion',
      titulo_en: 'Nutrition',
      local_pt: 'Palco',
      local_es: 'Escenario',
      local_en: 'Stage',
      hora_fim: '10:45',
      palestrante: 'Ana Souza',
      destaque: 'sim',
    })
    expect(problemas).toHaveLength(0)
    expect(dados).toHaveLength(1)
    const item = dados[0] as ItemProgramacao
    expect(item.titulo).toEqual({ pt: 'Nutricao', es: 'Nutricion', en: 'Nutrition' })
    expect(item.local.en).toBe('Stage')
    expect(item.horaFim).toBe('10:45')
    expect(item.minutoFim).toBe(645)
    expect(item.palestrante).toBe('Ana Souza')
    expect(item.destaque).toBe(true)
  })

  it('usa o portugues quando o campo de outro idioma esta vazio', () => {
    const { dados } = importar({ titulo_pt: 'So em PT', titulo_es: '', titulo_en: '  ' })
    const item = dados[0] as ItemProgramacao
    expect(item.titulo.es).toBe('So em PT')
    expect(item.titulo.en).toBe('So em PT')
    expect(escolherIdioma(item.titulo, 'en')).toBe('So em PT')
  })

  it('descarta linha sem id', () => {
    const { dados, problemas } = importar({ id: '' })
    expect(dados).toHaveLength(0)
    expect(problemas[0]).toMatchObject({ campo: 'id', gravidade: 'descartada', linha: 2 })
  })

  it('descarta linha com data invalida', () => {
    const { dados, problemas } = importar({ data: '17/09/2026' })
    expect(dados).toHaveLength(0)
    expect(problemas[0]).toMatchObject({ campo: 'data', gravidade: 'descartada' })
  })

  it('descarta linha com hora de inicio invalida', () => {
    const { dados, problemas } = importar({ hora_inicio: 'manha' })
    expect(dados).toHaveLength(0)
    expect(problemas[0]).toMatchObject({ campo: 'hora_inicio', gravidade: 'descartada' })
  })

  it('descarta linha sem titulo em portugues', () => {
    const { dados, problemas } = importar({ titulo_pt: '', titulo_en: 'Only english' })
    expect(dados).toHaveLength(0)
    expect(problemas[0]).toMatchObject({ campo: 'titulo_pt', gravidade: 'descartada' })
  })

  it('descarta id repetido e mantem o primeiro', () => {
    const { dados, problemas } = importar(
      { id: 'dup', titulo_pt: 'Primeiro' },
      { id: 'dup', titulo_pt: 'Segundo' },
    )
    expect(dados).toHaveLength(1)
    expect((dados[0] as ItemProgramacao).titulo.pt).toBe('Primeiro')
    expect(problemas[0]?.motivo).toContain('id repetido')
  })

  it('corrige pilar invalido para oficial sem perder a linha', () => {
    const { dados, problemas } = importar({ pilar: 'workshop' })
    expect(dados).toHaveLength(1)
    expect((dados[0] as ItemProgramacao).pilar).toBe('oficial')
    expect(problemas[0]).toMatchObject({ campo: 'pilar', gravidade: 'corrigida' })
  })

  it('corrige pilar vazio para oficial', () => {
    const { dados, problemas } = importar({ pilar: '' })
    expect((dados[0] as ItemProgramacao).pilar).toBe('oficial')
    expect(problemas[0]?.campo).toBe('pilar')
  })

  it('mantem inscricao previa sem link, feita no estande', () => {
    const { dados, problemas } = importar({ inscricao: 'previa', link_inscricao: '' })
    const item = dados[0] as ItemProgramacao
    expect(item.inscricao).toBe('previa')
    expect(item.linkInscricao).toBeNull()
    expect(problemas).toHaveLength(0)
  })

  it('separa as marcas escritas na mesma celula com ponto e virgula', () => {
    const { dados } = importar({ marca: 'Paraty Brazil by UTMB; SOS Mata Atlântica' })
    const item = dados[0] as ItemProgramacao
    expect(item.marcas).toEqual(['Paraty Brazil by UTMB', 'SOS Mata Atlântica'])
    expect(item.marca).toBe('Paraty Brazil by UTMB · SOS Mata Atlântica')
  })

  it('ignora marcas vazias entre separadores', () => {
    const { dados } = importar({ marca: ' HOKA ;; ' })
    expect((dados[0] as ItemProgramacao).marcas).toEqual(['HOKA'])
  })

  it('sem marca, a lista fica vazia', () => {
    const { dados } = importar({ marca: '' })
    expect((dados[0] as ItemProgramacao).marcas).toEqual([])
    expect((dados[0] as ItemProgramacao).marca).toBeNull()
  })

  it('mantem inscricao previa quando o link e valido', () => {
    const { dados, problemas } = importar({
      inscricao: 'previa',
      link_inscricao: 'https://exemplo.com/x',
    })
    const item = dados[0] as ItemProgramacao
    expect(item.inscricao).toBe('previa')
    expect(item.linkInscricao).toBe('https://exemplo.com/x')
    expect(problemas).toHaveLength(0)
  })

  it('ignora link de inscricao com esquema perigoso', () => {
    const { dados, problemas } = importar({
      inscricao: 'previa',
      link_inscricao: 'javascript:alert(1)',
    })
    expect((dados[0] as ItemProgramacao).linkInscricao).toBeNull()
    // A inscricao continua previa, so perde o botao de link.
    expect((dados[0] as ItemProgramacao).inscricao).toBe('previa')
    expect(problemas.length).toBeGreaterThan(0)
  })

  it('ignora logo com URL invalida mas mantem o item', () => {
    const { dados, problemas } = importar({ logo_url: 'nao-e-url', marca: 'Marca X' })
    const item = dados[0] as ItemProgramacao
    expect(item.logoUrl).toBeNull()
    expect(item.marca).toBe('Marca X')
    expect(problemas[0]).toMatchObject({ campo: 'logo_url', gravidade: 'corrigida' })
  })

  it('ignora hora de fim invalida sem descartar a linha', () => {
    const { dados, problemas } = importar({ hora_fim: '99:99' })
    expect(dados).toHaveLength(1)
    expect((dados[0] as ItemProgramacao).horaFim).toBeNull()
    expect(problemas[0]).toMatchObject({ campo: 'hora_fim', gravidade: 'corrigida' })
  })

  it('aceita data de fim no dia seguinte', () => {
    const { dados, problemas } = importar({
      data: '2026-09-17',
      hora_inicio: '17:00',
      hora_fim: '17:00',
      data_fim: '2026-09-18',
    })
    const item = dados[0] as ItemProgramacao
    expect(item.dataFim).toBe('2026-09-18')
    expect(item.horaFim).toBe('17:00')
    expect(problemas).toHaveLength(0)
  })

  it('assume o fim do dia quando ha data de fim sem hora de fim', () => {
    const { dados, problemas } = importar({ data_fim: '2026-09-18', hora_fim: '' })
    expect((dados[0] as ItemProgramacao).horaFim).toBe('23:59')
    expect(problemas[0]).toMatchObject({ campo: 'hora_fim', gravidade: 'corrigida' })
  })

  it('ignora data de fim invalida ou anterior a de inicio', () => {
    expect((importar({ data_fim: 'ontem' }).dados[0] as ItemProgramacao).dataFim).toBeNull()
    expect(
      (importar({ data: '2026-09-18', data_fim: '2026-09-17' }).dados[0] as ItemProgramacao).dataFim,
    ).toBeNull()
  })

  it('ignora data de fim igual a de inicio, que nao muda nada', () => {
    const { dados } = importar({ data: '2026-09-17', data_fim: '2026-09-17' })
    expect((dados[0] as ItemProgramacao).dataFim).toBeNull()
  })

  it('ignora hora de fim anterior a de inicio', () => {
    const { dados, problemas } = importar({ hora_inicio: '18:00', hora_fim: '09:00' })
    const item = dados[0] as ItemProgramacao
    expect(item.horaFim).toBeNull()
    expect(item.minutoFim).toBeNull()
    expect(problemas[0]?.motivo).toContain('antes da hora de inicio')
  })

  it('ignora linhas totalmente vazias sem registrar problema', () => {
    const csv = `${CABECALHO}\n${linha({ id: 'ok' })}\n${',,,,,,,,,,,,,,,,,,,,'}\n`
    const { dados, problemas } = normalizarProgramacao(lerCsv(csv))
    expect(dados).toHaveLength(1)
    expect(problemas).toHaveLength(0)
  })

  it('aguenta linha com menos colunas que o cabecalho', () => {
    const csv = `${CABECALHO}\nq9,2026-09-18,sexta-feira,08:00\n`
    const { dados } = normalizarProgramacao(lerCsv(csv))
    // Sem titulo_pt a linha e descartada, mas nada estoura.
    expect(dados).toHaveLength(0)
  })

  it('aguenta linha com mais colunas que o cabecalho', () => {
    const csv = `${CABECALHO}\n${linha({ id: 'q10' })},extra1,extra2\n`
    const { dados } = normalizarProgramacao(lerCsv(csv))
    expect(dados).toHaveLength(1)
  })

  it('aceita cabecalho com acento, maiuscula e espaco', () => {
    const csv = 'ID, Data ,Hora_Início,Pilar,Título_PT\nq11,2026-09-19,07:30,Talks,Com acento\n'
    const { dados } = normalizarProgramacao(lerCsv(csv))
    const item = dados[0] as ItemProgramacao
    expect(item.id).toBe('q11')
    expect(item.horaInicio).toBe('07:30')
    expect(item.pilar).toBe('talks')
    expect(item.titulo.pt).toBe('Com acento')
  })

  it('aceita descricao com virgula quando esta entre aspas', () => {
    const { dados } = importar({ descricao_pt: 'Percurso, cortes e seguranca' })
    expect((dados[0] as ItemProgramacao).descricao.pt).toBe('Percurso, cortes e seguranca')
  })

  it('numera a linha do problema como na planilha, contando o cabecalho', () => {
    const { problemas } = importar({ id: 'ok1' }, { id: '' })
    expect(problemas[0]?.linha).toBe(3)
  })

  it('devolve lista vazia para CSV so com cabecalho', () => {
    const { dados, problemas } = normalizarProgramacao(lerCsv(`${CABECALHO}\n`))
    expect(dados).toEqual([])
    expect(problemas).toEqual([])
  })
})

describe('ordenacao', () => {
  it('ordena por data e depois por horario', () => {
    const { dados } = importar(
      { id: 'a', data: '2026-09-18', hora_inicio: '09:00', titulo_pt: 'A' },
      { id: 'b', data: '2026-09-17', hora_inicio: '18:00', titulo_pt: 'B' },
      { id: 'c', data: '2026-09-17', hora_inicio: '08:00', titulo_pt: 'C' },
    )
    expect(dados.map((i) => i.id)).toEqual(['c', 'b', 'a'])
  })

  it('destaque nao muda mais a ordem da programacao', () => {
    const { dados } = importar(
      { id: 'cedo', data: '2026-09-17', hora_inicio: '08:00', titulo_pt: 'Cedo' },
      { id: 'tarde', data: '2026-09-17', hora_inicio: '20:00', titulo_pt: 'Tarde', destaque: 'sim' },
    )
    expect(dados.map((i) => i.id)).toEqual(['cedo', 'tarde'])
    expect(dados.find((i) => i.id === 'tarde')?.destaque).toBe(true)
  })

  it('desempata pelo titulo quando data, destaque e hora sao iguais', () => {
    const { dados } = importar(
      { id: 'z', hora_inicio: '10:00', titulo_pt: 'Zebra' },
      { id: 'a', hora_inicio: '10:00', titulo_pt: 'Abelha' },
    )
    expect(dados.map((i) => i.id)).toEqual(['a', 'z'])
  })

  it('nao modifica o array original', () => {
    const { dados } = importar({ id: 'a', hora_inicio: '12:00' }, { id: 'b', hora_inicio: '08:00' })
    const copia = [...dados]
    ordenarItens(dados)
    expect(dados).toEqual(copia)
  })
})

describe('normalizarConfig', () => {
  const csvConfig = (corpo: string) => normalizarConfig(lerCsv(`chave,valor\n${corpo}`))

  it('le os pares chave e valor', () => {
    const { dados } = csvConfig(
      [
        'evento_nome,Paraty Brazil by UTMB',
        'evento_datas,17 a 20 de setembro de 2026',
        'contato_email,paraty@service.utmb.world',
        'site_oficial,https://paraty.utmb.world/pt',
      ].join('\n'),
    )
    expect(dados.eventoNome).toBe('Paraty Brazil by UTMB')
    expect(dados.contatoEmail).toBe('paraty@service.utmb.world')
    expect(dados.siteOficial).toBe('https://paraty.utmb.world/pt')
  })

  it('usa o guia em portugues quando es e en estao vazios', () => {
    const { dados } = csvConfig(
      ['guia_atleta_url_pt,https://drive.google.com/guia-pt', 'guia_atleta_url_es,', 'guia_atleta_url_en,'].join('\n'),
    )
    expect(dados.guiaAtletaUrl.es).toBe('https://drive.google.com/guia-pt')
    expect(dados.guiaAtletaUrl.en).toBe('https://drive.google.com/guia-pt')
  })

  it('mantem o guia proprio de cada idioma quando preenchido', () => {
    const { dados } = csvConfig(
      [
        'guia_atleta_url_pt,https://exemplo.com/pt',
        'guia_atleta_url_en,https://exemplo.com/en',
      ].join('\n'),
    )
    expect(dados.guiaAtletaUrl.en).toBe('https://exemplo.com/en')
    expect(dados.guiaAtletaUrl.es).toBe('https://exemplo.com/pt')
  })

  it('ignora URL invalida e registra o problema', () => {
    const { dados, problemas } = csvConfig('mapa_expo_url,foto-do-mapa.png')
    expect(dados.mapaExpoUrl).toBe('')
    expect(problemas[0]).toMatchObject({ campo: 'mapaexpourl', gravidade: 'corrigida' })
  })

  it('cai nos valores padrao quando a aba esta vazia', () => {
    const { dados } = csvConfig('')
    expect(dados.eventoNome).toBe('Paraty Brazil by UTMB')
    expect(dados.reguaPatrocinadoresUrl).toBe('')
  })

  it('aceita chave com acento, espaco e maiuscula', () => {
    const { dados } = csvConfig('  Evento_Nome ,Nome trocado')
    expect(dados.eventoNome).toBe('Nome trocado')
  })

  it('registra valor sem chave', () => {
    const { problemas } = csvConfig(',valor solto')
    expect(problemas[0]).toMatchObject({ campo: 'chave', gravidade: 'descartada' })
  })
})
