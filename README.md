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

## A planilha

A planilha tem duas abas, com estes nomes exatos: **Programacao** e **Config**.

Na pasta `planilha/` deste repositório tem o arquivo pronto **Paraty-Agenda.xlsx**, já com as duas abas, os cabeçalhos certos e exemplos preenchidos. Suba ele no Google Drive e abra com o Google Sheets.

### Aba Programacao

Uma linha por item da agenda. As colunas de texto existem em três idiomas.

| coluna | o que é | exemplo |
|---|---|---|
| `id` | um código único, qualquer um, só não pode repetir | `q17-001` |
| `data` | a data no formato ano-mês-dia | `2026-09-17` |
| `dia_semana` | o dia por extenso, em português | `quinta-feira` |
| `hora_inicio` | hora e minuto | `10:00` |
| `hora_fim` | opcional, pode deixar vazio | `10:45` |
| `pilar` | `oficial`, `talks` ou `ativacao` | `talks` |
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

### Aba Config

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
| `local_maps` | link do Google Maps do local |
| `regua_patrocinadores_url` | link da imagem da régua de patrocinadores |

---

## Trocar o Guia do Atleta

1. Suba o PDF no Google Drive.
2. Clique com o botão direito no arquivo, escolha **Compartilhar**.
3. Em "Acesso geral", troque para **Qualquer pessoa com o link**, com permissão de **Leitor**. Sem isso o atleta vê uma tela de pedir permissão.
4. Copie o link.
5. Cole na aba **Config**, na linha `guia_atleta_url_pt` (e nas de espanhol e inglês, se tiver versões traduzidas).

## Trocar a imagem do Mapa da Expo

Mesmo caminho: suba a imagem em algum lugar público e cole o link em `mapa_expo_url`, na aba Config.

> **Atenção com o Google Drive para imagens.** Link de imagem do Drive costuma não funcionar quando o app tenta exibir a imagem direto (o Drive bloqueia esse tipo de uso). Se o mapa ou a régua não aparecerem, use a alternativa abaixo.

### Alternativa à prova de falhas: colocar a imagem no repositório

1. Coloque o arquivo na pasta `public/` deste repositório, por exemplo `public/mapa-expo.png`.
2. Faça o push.
3. Na aba Config, use o endereço completo do app mais o nome do arquivo, por exemplo:
   `https://phi-utmb.github.io/utmb-paraty-agenda/mapa-expo.png`

Vale o mesmo para a régua de patrocinadores.

## Trocar a régua de patrocinadores

A régua é a faixa fina que fica em cima da barra de navegação, visível em todas as telas. Cole o link da imagem em `regua_patrocinadores_url`, na aba Config. Se o campo ficar vazio ou a imagem falhar, a faixa some sozinha e nada quebra no layout.

Dica de formato: uma imagem larga e baixa, tipo 1600 por 200 pixels, com fundo transparente ou escuro, fica bem.

---

## Como o app atualiza

- Busca os dados sempre que o atleta abre o app.
- Puxar a tela para baixo força uma atualização na hora.
- Enquanto o app fica aberto, ele revalida a cada 5 minutos e também quando volta do segundo plano ou quando a internet retorna.
- A última versão fica guardada no aparelho, então o app abre e funciona sem internet.
- No canto de baixo aparece "atualizado às HHhMM", para saber de quando são os dados na tela.

---

## Ligar o app na sua planilha

Feito uma vez só, no setup.

1. Na planilha, vá em **Arquivo > Compartilhar > Publicar na web**.
2. Em "Vincular", escolha a aba **Programacao** e o formato **Valores separados por vírgula (.csv)**.
3. Clique em **Publicar** e copie o link.
4. Repita para a aba **Config**.
5. Abra o arquivo `src/config.ts` e cole os dois links:

```ts
export const URL_CSV_PROGRAMACAO = 'cole aqui o link da aba Programacao'
export const URL_CSV_CONFIG = 'cole aqui o link da aba Config'
```

6. Faça o push. O app se publica sozinho.

Enquanto esses dois campos estiverem vazios, o app roda com dados de exemplo, para você ver como fica.

---

## Publicação e deploy contínuo

O app é publicado no **GitHub Pages**, de graça, sem cartão e sem servidor.

Toda vez que você faz push na branch `main`, o GitHub Actions roda os testes, constrói o app e publica. Se algum teste falhar, a publicação não acontece, o que evita subir uma versão quebrada.

O arquivo que cuida disso é `.github/workflows/deploy.yml`. Você não precisa mexer nele.

O endereço público fica assim: `https://phi-utmb.github.io/utmb-paraty-agenda/`

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
