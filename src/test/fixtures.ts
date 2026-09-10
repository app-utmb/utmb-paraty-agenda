import { normalizarBeneficios, normalizarConfig, normalizarProgramacao } from '../data/normalize'
import { lerCsv } from '../data/sheets'
import type { DadosApp } from '../data/types'

const CSV_PROG = `id,data,dia_semana,hora_inicio,hora_fim,pilar,titulo_pt,titulo_es,titulo_en,descricao_pt,descricao_es,descricao_en,local_pt,local_es,local_en,palestrante,marca,logo_url,inscricao,link_inscricao,destaque
a1,2026-09-17,quinta-feira,10:00,11:00,oficial,Retirada de kits,Retiro de kits,Bib pickup,Leve documento com foto,Lleva documento con foto,Bring photo ID,Expo,Expo,Expo,,Paraty Brazil by UTMB,,livre,,sim
a2,2026-09-17,quinta-feira,14:00,14:45,talks,Nutricao no ultra,Nutricion en el ultra,Nutrition in ultra,Estrategia de calorias,Estrategia de calorias,Calorie strategy,Palco Expo,Escenario Expo,Expo Stage,Ana Souza,,,livre,,
a3,2026-09-17,quinta-feira,16:00,17:00,ativacao,Teste de calcados,Prueba de calzado,Shoe demo,Experimente na trilha,Prueba en el sendero,Try on the trail,Estande,Stand,Booth,,The North Face,https://exemplo.com/logo.png,previa,https://exemplo.com/inscricao,
a4,2026-09-18,sexta-feira,08:00,,oficial,Largada 100K,Salida 100K,100K start,Concentracao 40 min antes,Concentracion 40 min antes,Gather 40 min before,Arco,Arco,Arch,,Paraty Brazil by UTMB,,livre,,sim
a5,2026-09-18,sexta-feira,15:00,16:00,ativacao,Oficina de bastoes,Taller de bastones,Poles workshop,,,,Estande Leki,Stand Leki,Leki booth,,Leki,,invite,,
`

const CSV_BEN = `id,onde,categoria,nome,desconto_pt,desconto_es,desconto_en,descricao_pt,descricao_es,descricao_en,local_pt,local_es,local_en,condicoes_pt,condicoes_es,condicoes_en,validade,logo_url,link,mapa_url,destaque
t1,expo,equipamentos,The North Face,20% de desconto,20% de descuento,20% off,Linha de trail,Linea de trail,Trail line,Estande TNF,Stand TNF,TNF booth,Mostre o numero de peito,Muestra el dorsal,Show your bib,17 a 20 de setembro,https://exemplo.com/tnf.png,https://exemplo.com/tnf,https://maps.app.goo.gl/tnf,sim
t2,cidade,alimentacao,Banana da Terra,15% de desconto,15% de descuento,15% off,,,,Rua Samuel Costa 198,Rua Samuel Costa 198,Rua Samuel Costa 198,,,,17 a 20 de setembro,,,,
t3,cidade,hospedagem,Pousada do Ouro,10% de desconto,,,,,,Rua Doutor Pereira 145,,,,,,,,,,
t4,expo,alimentacao,Cafe da Trilha,Segundo cafe por 1 real,,,,,,Praca de alimentacao,,,,,,,,,,
`

const CSV_CONF = `chave,valor
evento_nome,Paraty Brazil by UTMB
evento_datas,17 a 20 de setembro de 2026
guia_atleta_url_pt,https://drive.google.com/guia-pt
guia_atleta_url_en,https://drive.google.com/guia-en
mapa_expo_url,https://exemplo.com/mapa.png
contato_whatsapp,https://wa.me/5511999999999
contato_email,paraty@service.utmb.world
site_oficial,https://paraty.utmb.world/pt
faq_url,https://paraty.utmb.world/pt/races-runners/other-information/faq
ao_vivo_url,https://live.utmb.world/pt/paraty/2026
local_maps,https://maps.app.goo.gl/exemplo
regua_patrocinadores_url,https://exemplo.com/regua.png
`

export function dadosDeTeste(sobrescrever: Partial<DadosApp> = {}): DadosApp {
  return {
    itens: normalizarProgramacao(lerCsv(CSV_PROG)).dados,
    beneficios: normalizarBeneficios(lerCsv(CSV_BEN)).dados,
    config: normalizarConfig(lerCsv(CSV_CONF)).dados,
    atualizadoEm: '2026-09-17T13:05:00.000Z',
    origem: 'rede',
    ...sobrescrever,
  }
}

/** 17 de setembro de 2026 as 10h30 em Sao Paulo, durante a retirada de kits. */
export const DURANTE_KIT = new Date('2026-09-17T10:30:00-03:00')
export const CSV_PROGRAMACAO_TESTE = CSV_PROG
export const CSV_CONFIG_TESTE = CSV_CONF
export const CSV_BENEFICIOS_TESTE = CSV_BEN
