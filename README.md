# Agenda do atleta, Paraty Brazil by UTMB

App da programação do evento, feito para o atleta abrir no celular, instalar na tela inicial e consultar mesmo sem internet.

Todo o conteúdo vem de uma planilha do Google que você edita. O app pega as mudanças sozinho, sem precisar republicar nada.

---

## O básico: como eu mudo o conteúdo

**Você edita a planilha. Só isso.**

1. Abra a planilha do Google.
2. Mude o que quiser: horário, título, local, palestrante, o que for.
3. Espere alguns minutos.
4. O atleta puxa a tela para baixo no app, ou fecha e abre de novo, e já vê a versão nova.

Não precisa mexer em código. Não precisa avisar ninguém. Não precisa republicar o app.

> **Sobre a demora de alguns minutos:** o Google guarda uma cópia da planilha publicada e leva de 2 a 5 minutos para atualizar essa cópia. Para uma agenda de evento isso é aceitável, mas vale lembrar disso na hora de uma mudança de última hora. Se precisar de algo instantâneo, avise pelos canais do evento em paralelo.

---

## As planilhas

O conteúdo está em duas planilhas do Google, as duas no seu Drive e já publicadas:

| planilha | o que tem | link para editar |
|---|---|---|
| **Programacao v2** | a agenda, uma linha por item | [abrir](https://docs.google.com/spreadsheets/d/1mWcfP7G4kyBL51pX19amupz3tXwz1X5_P5LrH389Wl0/edit) |
| **Beneficios** | descontos na Expo e na cidade | [abrir](https://docs.google.com/spreadsheets/d/1h4Fkx_bqcXW8pdKJWcPw8SUFlY6s9WTuITqjt0E9wdE/edit) |
| **Config** | links do guia, do mapa, contatos | [abrir](https://docs.google.com/spreadsheets/d/1BWONpCDI5QWtjXo9ZkS4XcLZlyrnBRSGKVkkPZOWUDU/edit) |

São três arquivos separados em vez de abas de um só. Para o app dá no mesmo, e para você fica mais difícil mexer sem querer na Config enquanto edita a agenda.

Existe no Drive uma planilha chamada **ZZ Paraty Agenda 2026 Programacao (antiga)**. Ela não alimenta mais o app e pode ser apagada.

Se um dia precisar recriar do zero, a pasta `planilha/` deste repositório tem o modelo **Paraty-Agenda.xlsx** com os cabeçalhos certos e exemplos preenchidos.

### Planilha Programacao

Uma linha por item da agenda. As colunas de texto existem em três idiomas.

| coluna | o que é | exemplo |
|---|---|---|
| `id` | um código único, qualquer um, só não pode repetir | `q17-001` |
| `data` | a data no formato ano-mês-dia | `2026-09-17` |
| `dia_semana` | o dia por extenso, em português | `quinta-feira` |
| `hora_inicio` | hora e minuto | `10:00` |
| `hora_fim` | opcional, pode deixar vazio | `10:45` |
| `pilar` | `oficial`, `talks`, `ativacao` ou `filmes` | `talks` |
| `titulo_pt` `titulo_es` `titulo_en` | o título nos três idiomas | `Nutrição no ultra` |
| `descricao_pt` `descricao_es` `descricao_en` | opcional | |
| `local_pt` `local_es` `local_en` | onde acontece | `Palco Expo` |
| `palestrante` | opcional, não traduz | `Ana Souza` |
| `marca` | opcional, não traduz | `The North Face` |
| `logo_url` | opcional, link direto da imagem da logo | `https://...` |
| `inscricao` | `livre`, `previa` ou `invite` | `previa` |
| `link_inscricao` | obrigatório só quando `inscricao` é `previa` | `https://...` |
| `destaque` | escreva `sim` para fixar o item no topo do dia | `sim` |

**Regra de idioma:** se você deixar `titulo_es` vazio, o app mostra o `titulo_pt` no lugar. Vale para todos os campos traduzíveis. Então dá para publicar só em português e ir traduzindo aos poucos.

**Se você errar alguma coisa, o app não quebra.** Uma linha sem `id`, sem data válida ou sem título em português é simplesmente ignorada, e o resto da agenda aparece normalmente. Um `pilar` que não existe vira `oficial`. Uma `inscricao` marcada como `previa` sem link vira entrada livre.

### Planilha Config

Duas colunas: `chave` e `valor`. Não mude os nomes das chaves.

| chave | o que é |
|---|---|
| `evento_nome` | aparece no topo do app |
| `evento_datas` | aparece embaixo do nome |
| `guia_atleta_url_pt` | link do PDF do Guia do Atleta em português |
| `guia_atleta_url_es` | link em espanhol. Se deixar vazio, usa o português |
| `guia_atleta_url_en` | link em inglês. Se deixar vazio, usa o português |
| `mapa_expo_url` | link da imagem da planta da Expo |
| `contato_whatsapp` | link do tipo `https://wa.me/55...` |
| `contato_email` | email de contato |
| `site_oficial` | site do evento |
| `faq_url` | página de perguntas frequentes |
| `ao_vivo_url` | acompanhamento ao vivo da prova |
| `local_maps` | link do Google Maps do local |
| `regua_patrocinadores_url` | link da imagem da régua de patrocinadores |

---

### Planilha Beneficios

Uma linha por estabelecimento. É a lista de descontos que aparece na aba Benefícios.

| coluna | o que é | exemplo |
|---|---|---|
| `id` | um código único | `b-001` |
| `onde` | `expo` ou `cidade` | `expo` |
| `categoria` | `alimentacao`, `equipamentos`, `hospedagem`, `servicos` ou `experiencias` | `alimentacao` |
| `nome` | nome do estabelecimento, não traduz | `Banana da Terra` |
| `desconto_pt` `desconto_es` `desconto_en` | o desconto em si, aparece em destaque | `15% de desconto` |
| `descricao_pt` `descricao_es` `descricao_en` | opcional | |
| `local_pt` `local_es` `local_en` | onde encontrar | `Estande A12` |
| `condicoes_pt` `condicoes_es` `condicoes_en` | regras de uso | `Mediante apresentação do número de peito` |
| `validade` | texto livre | `17 a 20 de setembro` |
| `logo_url` | opcional | |
| `link` | site ou rede social, opcional | |
| `mapa_url` | link do Google Maps, opcional | |
| `destaque` | `sim` para fixar no topo | |

Vale a mesma tolerância da agenda: linha sem `id`, sem `nome` ou sem `desconto_pt` é ignorada, e `onde` ou `categoria` inválidos são corrigidos em vez de derrubar a lista.

A lista tem busca por nome, filtro de lugar e filtro de categoria, então aguenta bem passar de 50 estabelecimentos.

### Os quatro pilares da programação

| pilar | o que entra | cor |
|---|---|---|
| `oficial` | largadas, chegadas, briefings, retirada de kit, premiação | verde |
| `talks` | palestras, painéis e rodas de conversa | azul |
| `ativacao` | ativações das marcas nos estandes | âmbar |
| `filmes` | filmes e documentários | lilás |

### Os locais padrão

Para a lista ficar consistente, use sempre estes nomes na coluna de local:

- **Expo**
- **Palco Expo**
- **Estande [nome da marca]**, por exemplo `Estande Salomon`
- **Arena de largada e chegada**
- **Arena e Expo**, quando vale nos dois
- **Fazenda Bananal**

## Logos das marcas

O Google Drive bloqueia hotlink de imagem, então as logos ficam no próprio repositório, em `public/logos/`, e o endereço fica assim:

```
https://app-utmb.github.io/utmb-paraty-agenda/logos/hoka.png
```

Esse endereço é o que vai na coluna `logo_url` da programação ou dos benefícios.

Para adicionar uma logo nova: coloque o arquivo em `public/logos/` com nome em minúsculas e sem acento (`nome-da-marca.png`) e faça o push. O `scripts/baixar-logos.mjs` automatiza isso quando a marca mandou o arquivo pelo Drive: basta acrescentar a marca e o id do arquivo na lista de dentro do script e rodar `node scripts/baixar-logos.mjs`, que ele baixa, converte de PDF para PNG, apara a margem e padroniza em 256 por 256.

## Recarregar a planilha sem digitar

`scripts/gerar-dados.mjs` é a fonte da programação e dos benefícios. Ele gera dois formatos:

- `planilha/*.csv`, que fica versionado no repositório
- `public/dados/*.tsv`, que o app publica e serve para colar no Google Sheets

Para levar uma alteração até a planilha:

1. Edite as listas dentro de `scripts/gerar-dados.mjs`
2. `node scripts/gerar-dados.mjs`
3. Faça o push e espere o deploy
4. Na planilha, clique na célula A1 (na grade, não na caixa de nome) e cole o conteúdo de `https://app-utmb.github.io/utmb-paraty-agenda/dados/programacao.tsv`

**Cuidado:** uma planilha criada a partir de um CSV nasce com o número exato de linhas daquele CSV. Se o conteúdo novo tiver mais linhas, o Google corta a colagem em silêncio. Antes de colar, selecione as linhas existentes e use Inserir, Linhas, Inserir N linhas abaixo.

## Trocar o Guia do Atleta

1. Suba o PDF no Google Drive.
2. Clique com o botão direito no arquivo, escolha **Compartilhar**.
3. Em "Acesso geral", troque para **Qualquer pessoa com o link**, com permissão de **Leitor**. Sem isso o atleta vê uma tela de pedir permissão.
4. Copie o link.
5. Cole na planilha **Config**, na linha `guia_atleta_url_pt` (e nas de espanhol e inglês, se tiver versões traduzidas).

## Trocar a imagem do Mapa da Expo

Mesmo caminho: suba a imagem em algum lugar público e cole o link em `mapa_expo_url`, na planilha Config.

> **Atenção com o Google Drive para imagens.** Link de imagem do Drive costuma não funcionar quando o app tenta exibir a imagem direto (o Drive bloqueia esse tipo de uso). Se o mapa ou a régua não aparecerem, use a alternativa abaixo.

### Alternativa à prova de falhas: colocar a imagem no repositório

1. Coloque o arquivo na pasta `public/` deste repositório, por exemplo `public/mapa-expo.png`.
2. Faça o push.
3. Na planilha Config, use o endereço completo do app mais o nome do arquivo, por exemplo:
   `https://app-utmb.github.io/utmb-paraty-agenda/mapa-expo.png`

Vale o mesmo para a régua de patrocinadores.

## Trocar a régua de patrocinadores

A régua é a faixa fina que fica em cima da barra de navegação, visível em todas as telas. Cole o link da imagem em `regua_patrocinadores_url`, na planilha Config. Se o campo ficar vazio ou a imagem falhar, a faixa some sozinha e nada quebra no layout.

Dica de formato: uma imagem larga e baixa, tipo 1600 por 200 pixels, com fundo transparente ou escuro, fica bem.

---

## Como o app atualiza

- Busca os dados sempre que o atleta abre o app.
- Puxar a tela para baixo força uma atualização na hora.
- Enquanto o app fica aberto, ele revalida a cada 5 minutos e também quando volta do segundo plano ou quando a internet retorna.
- A última versão fica guardada no aparelho, então o app abre e funciona sem internet.
- No canto de baixo aparece "atualizado às HHhMM", para saber de quando são os dados na tela.

---

## Ligar o app numa planilha nova

Isso **já está feito**. Você só precisa disto se um dia trocar de planilha.

1. Na planilha, vá em **Arquivo > Compartilhar > Publicar na web**.
2. Escolha o formato **Valores separados por vírgula (.csv)**.
3. Clique em **Publicar** e copie o link.
4. Repita na outra planilha.
5. Abra o arquivo `src/config.ts` e troque os dois links.
6. Faça o push. O app se publica sozinho.

Se os dois campos ficarem vazios, o app volta a rodar com dados de exemplo em vez de mostrar tela em branco.

---

## Publicação e deploy contínuo

O app é publicado no **GitHub Pages**, de graça, sem cartão e sem servidor.

Toda vez que você faz push na branch `main`, o GitHub Actions roda os testes, constrói o app e publica. Se algum teste falhar, a publicação não acontece, o que evita subir uma versão quebrada.

O arquivo que cuida disso é `.github/workflows/deploy.yml`. Você não precisa mexer nele.

O endereço público é **https://app-utmb.github.io/utmb-paraty-agenda/**

---

## Rodar na sua máquina

```bash
npm install
npm run dev
```

Outros comandos:

| comando | o que faz |
|---|---|
| `npm run build` | constrói a versão de produção |
| `npm test` | roda a suíte de testes |
| `npm run audit:all` | roda tipos, lint, testes e build de uma vez |
| `npm run icons` | regenera os ícones do PWA a partir de `public/favicon.svg` |
| `npm run planilha` | regenera o arquivo `planilha/Paraty-Agenda.xlsx` |

---

## Como o projeto está organizado

```
src/
  config.ts            os dois links da planilha e os ajustes gerais
  App.tsx              a casca do app: cabeçalho, abas, rodapé
  abas.ts              a lista de abas da barra de baixo
  useDados.ts          busca, revalidação e cache dos dados
  data/
    types.ts           os tipos de um item da agenda e da Config
    normalize.ts       leitura e validação do que vem da planilha
    sheets.ts          rede, cache offline e dados de exemplo
    exemplo.ts         a agenda de demonstração
  i18n/                os textos fixos da interface em pt, es e en
  screens/             as cinco telas
  components/          cartões, detalhe, navegação, régua, seletor de idioma
  styles/global.css    o tema escuro e as cores dos pilares
  test/                a suíte de testes
planilha/              o modelo da planilha, em xlsx e csv
scripts/               geradores de ícones e da planilha modelo
```

---

## Preparado para crescer

Duas coisas ficaram encaminhadas para uma versão futura, no mesmo padrão do app oficial:

- **Previsão do tempo de Paraty.** Entra como uma nova aba ou um bloco na tela de Início.
- **Descontos de parceiros.** Entra como mais uma aba, alimentada por uma nova aba na planilha.

Para adicionar uma aba nova, o caminho é: incluir o nome em `src/abas.ts`, criar a tela em `src/screens/`, e acrescentar o rótulo nos três dicionários em `src/i18n/`.
