/**
 * Dados de demonstracao usados enquanto a planilha nao esta conectada.
 * Nao edite isto para publicar conteudo real: use a planilha.
 */
export const CSV_PROGRAMACAO_EXEMPLO = `id,data,dia_semana,hora_inicio,hora_fim,pilar,titulo_pt,titulo_es,titulo_en,descricao_pt,descricao_es,descricao_en,local_pt,local_es,local_en,palestrante,marca,logo_url,inscricao,link_inscricao,destaque
q17-001,2026-09-17,quinta-feira,10:00,20:00,oficial,Abertura da Expo e retirada de kits,Apertura de la Expo y retiro de kits,Expo opening and bib pickup,Retirada de kit mediante documento com foto e assinatura do termo de responsabilidade.,Retiro de kit con documento con foto y firma del termino de responsabilidad.,Bib pickup requires photo ID and a signed waiver.,Expo Paraty,Expo Paraty,Paraty Expo,,,,livre,,sim
q17-002,2026-09-17,quinta-feira,14:00,14:45,talks,Nutricao no ultra trail,Nutricion en el ultra trail,Nutrition in ultra trail,Como montar a estrategia de calorias e sais para provas longas na Mata Atlantica.,Como armar la estrategia de calorias y sales para pruebas largas.,How to build a calorie and salt strategy for long races.,Palco Expo,Escenario Expo,Expo Stage,Ana Souza,,,livre,,
q17-003,2026-09-17,quinta-feira,16:00,17:00,ativacao,Teste de calcados na trilha curta,Prueba de calzado en el sendero corto,Shoe demo on the short trail,Experimente modelos de trail na trilha demonstrativa ao lado da Expo.,Prueba modelos de trail en el sendero demostrativo.,Try trail models on the demo trail next to the Expo.,Estande The North Face,Stand The North Face,The North Face booth,,The North Face,,previa,https://exemplo.com/inscricao,
q17-004,2026-09-17,quinta-feira,19:00,20:00,oficial,Cerimonia de abertura,Ceremonia de apertura,Opening ceremony,Abertura oficial com a organizacao e as autoridades locais.,Apertura oficial con la organizacion.,Official opening with the organisation.,Praca da Matriz,Plaza de la Matriz,Matriz Square,,,,livre,,
q18-001,2026-09-18,sexta-feira,08:00,,oficial,Largada PTR 100K,Salida PTR 100K,PTR 100K start,Concentracao 40 minutos antes da largada com kit completo e material obrigatorio.,Concentracion 40 minutos antes de la salida.,Gather 40 minutes before the start with mandatory gear.,Arco de largada,Arco de salida,Start arch,,,,livre,,sim
q18-002,2026-09-18,sexta-feira,11:00,11:45,talks,Treino de descida tecnica,Entrenamiento de bajada tecnica,Technical descent training,Tecnica de pes e cadencia para descidas de raiz e pedra.,Tecnica de pies y cadencia para bajadas.,Footwork and cadence for root and rock descents.,Palco Expo,Escenario Expo,Expo Stage,Bruno Lima,,,livre,,
q18-003,2026-09-18,sexta-feira,15:00,16:00,ativacao,Oficina de bastoes,Taller de bastones,Poles workshop,Ajuste de altura e uso eficiente em subida e descida.,Ajuste de altura y uso eficiente.,Height adjustment and efficient use.,Estande Leki,Stand Leki,Leki booth,,Leki,,invite,,
q18-004,2026-09-18,sexta-feira,18:00,19:00,oficial,Briefing tecnico PTR 50K,Briefing tecnico PTR 50K,PTR 50K technical briefing,Percurso e cortes horarios com pontos de apoio e seguranca.,Recorrido y cortes horarios con seguridad.,Course and cut-offs with aid stations and safety.,Palco Expo,Escenario Expo,Expo Stage,,,,livre,,
q19-001,2026-09-19,sabado,05:00,,oficial,Largada PTR 50K,Salida PTR 50K,PTR 50K start,Largada em ondas por numero de peito.,Salida en oleadas por numero de dorsal.,Wave start by bib number.,Arco de largada,Arco de salida,Start arch,,,,livre,,sim
q19-002,2026-09-19,sabado,10:00,10:45,talks,Mata Atlantica e corrida responsavel,Mata Atlantica y carrera responsable,Atlantic Forest and responsible running,Boas praticas de baixo impacto na trilha e no mar.,Buenas practicas de bajo impacto.,Low impact good practice on trail and sea.,Palco Expo,Escenario Expo,Expo Stage,Carla Nunes,,,livre,,
q19-003,2026-09-19,sabado,14:00,18:00,ativacao,Recuperacao pos prova,Recuperacion post carrera,Post race recovery,Massagem e compressao para quem ja cruzou a linha de chegada.,Masaje y compresion para finishers.,Massage and compression for finishers.,Area de chegada,Area de llegada,Finish area,,Compressport,,livre,,
q20-001,2026-09-20,domingo,08:00,,oficial,Largada PTR 20K,Salida PTR 20K,PTR 20K start,Prova mais curta do fim de semana e aberta a estreantes.,Prueba mas corta del fin de semana.,Shortest race of the weekend.,Arco de largada,Arco de salida,Start arch,,,,livre,,sim
q20-002,2026-09-20,domingo,16:00,17:30,oficial,Premiacao e encerramento,Premiacion y cierre,Awards and closing,Premiacao geral e por categoria de todas as distancias.,Premiacion general y por categoria.,Overall and category awards for all distances.,Praca da Matriz,Plaza de la Matriz,Matriz Square,,,,livre,,sim
`

export const CSV_CONFIG_EXEMPLO = `chave,valor
evento_nome,Paraty Brazil by UTMB
evento_datas,17 a 20 de setembro de 2026
guia_atleta_url_pt,
guia_atleta_url_es,
guia_atleta_url_en,
mapa_expo_url,
contato_whatsapp,
contato_email,paraty@service.utmb.world
site_oficial,https://paraty.utmb.world/pt
faq_url,
ao_vivo_url,
local_maps,https://maps.app.goo.gl/
regua_patrocinadores_url,
`

export const CSV_BENEFICIOS_EXEMPLO = `id,onde,categoria,nome,desconto_pt,desconto_es,desconto_en,descricao_pt,descricao_es,descricao_en,local_pt,local_es,local_en,condicoes_pt,condicoes_es,condicoes_en,validade,logo_url,link,mapa_url,destaque
b-001,expo,equipamentos,The North Face,20% de desconto,20% de descuento,20% off,Toda a linha de trail running disponivel no estande.,Toda la linea de trail running en el stand.,The full trail running line at the booth.,Estande The North Face,Stand The North Face,The North Face booth,Mediante apresentacao do numero de peito.,Presentando el dorsal.,Show your race bib.,17 a 20 de setembro,,,,sim
b-002,cidade,alimentacao,Restaurante Banana da Terra,15% de desconto,15% de descuento,15% off,Cozinha caicara no centro historico.,Cocina caicara en el centro historico.,Local cuisine in the historic centre.,Rua Doutor Samuel Costa 198,Rua Doutor Samuel Costa 198,Rua Doutor Samuel Costa 198,Nao acumulativo com outras promocoes.,No acumulable con otras promociones.,Not combinable with other offers.,17 a 20 de setembro,,,,
b-003,cidade,hospedagem,Pousada do Ouro,10% de desconto,10% de descuento,10% off,Reservas diretas pelo telefone ou site.,Reservas directas por telefono o sitio.,Direct bookings by phone or website.,Rua Doutor Pereira 145,Rua Doutor Pereira 145,Rua Doutor Pereira 145,Sujeito a disponibilidade.,Sujeto a disponibilidad.,Subject to availability.,15 a 22 de setembro,,,,
b-004,expo,alimentacao,Cafe da Trilha,Segundo cafe por 1 real,Segundo cafe por 1 real,Second coffee for 1 real,Cafe especial e paes na area de convivencia.,Cafe de especialidad y panes.,Speciality coffee and bread.,Praca de alimentacao da Expo,Plaza de comidas de la Expo,Expo food court,Uma vez por dia por atleta.,Una vez al dia por atleta.,Once a day per athlete.,17 a 20 de setembro,,,,
b-005,cidade,experiencias,Paraty Tours,25% no passeio de escuna,25% en el paseo en goleta,25% off the schooner tour,Saidas diarias pelo cais.,Salidas diarias desde el muelle.,Daily departures from the pier.,Cais de Paraty,Muelle de Paraty,Paraty pier,Reserva antecipada obrigatoria.,Reserva previa obligatoria.,Advance booking required.,17 a 21 de setembro,,,,
b-006,cidade,servicos,Espaco Recuperar,30% na sessao de massagem,30% en la sesion de masaje,30% off the massage session,Massagem esportiva pos prova.,Masaje deportivo post carrera.,Post race sports massage.,Avenida Roberto Silveira 90,Avenida Roberto Silveira 90,Avenida Roberto Silveira 90,Agendamento pelo WhatsApp.,Agenda por WhatsApp.,Book by WhatsApp.,19 a 21 de setembro,,,,
`
