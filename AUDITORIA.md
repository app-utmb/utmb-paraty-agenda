# Relatório de auto-auditoria

App da agenda do atleta, Paraty Brazil by UTMB. Versão 1.0, 9 de setembro de 2026.

## Resumo

| verificação | resultado |
|---|---|
| Testes automatizados | 177 testes em 8 arquivos, todos passando |
| Tipos (TypeScript strict) | sem erros |
| Lint (ESLint) | sem erros e sem avisos |
| Build de produção | 392 KB no total, 90 KB comprimido no JavaScript |
| Acessibilidade (axe) | sem violações nas 5 telas, nos 3 idiomas |
| Contraste do tema escuro | 25 combinações medidas, todas acima do mínimo AA |
| Funcionamento offline | verificado com o servidor derrubado, o app carregou inteiro |
| Instalação como PWA | manifest válido, ícones gerados, service worker ativo |

## O que foi testado

### Leitura da planilha, 60 testes

O ponto mais frágil de um app alimentado por planilha é a planilha. Se uma linha vier errada, a agenda inteira não pode sumir. Foi testado:

- Linha completa nos três idiomas, com todos os campos preenchidos.
- Campo de idioma vazio caindo no português.
- Linha sem `id`, com data inválida, com hora inválida ou sem título em português: descartada, o resto continua.
- `id` repetido: fica o primeiro, o segundo é descartado.
- Pilar inválido ou vazio: vira `oficial`, a linha sobrevive.
- `inscricao` marcada como `previa` sem link: vira entrada livre, para não mostrar um botão quebrado.
- Link ou logo com endereço inválido: ignorado, a linha sobrevive.
- Hora de fim inválida, ou anterior à hora de início: ignorada.
- Linha com menos colunas, com mais colunas, ou totalmente vazia.
- Cabeçalho com acento, maiúscula, espaço sobrando ou marca invisível de arquivo (BOM).
- Descrição com vírgula dentro, entre aspas.
- Ordenação por data, com destaques no topo do dia, depois por horário e por título.
- Aba Config: chaves conhecidas, guia caindo do espanhol e do inglês para o português, URL inválida ignorada, aba vazia.

### Rede, cache e offline, 17 testes

- Busca as duas abas e monta os dados.
- Salva no aparelho o que veio da rede.
- Rede caiu: usa a última versão salva no aparelho.
- Rede caiu e não há nada salvo: usa os dados de exemplo, em vez de mostrar tela vazia.
- Resposta HTTP de erro tratada como falha de rede.
- Planilha que voltou sem nenhum item válido é tratada como falha, para não esvaziar a agenda de quem já tinha ela carregada.
- Cache corrompido no aparelho não derruba o app.
- Armazenamento cheio ou bloqueado não derruba o app.

### Telas, 46 testes

- Início: o que acontece agora, o que vem depois, atalhos para as outras abas.
- Programação: abre no dia de hoje quando o evento está rolando, abre no filtro Todos, lista em ordem de horário com destaque no topo, filtra por pilar, troca de dia, mostra mensagem quando o filtro não acha nada.
- Detalhe: horário, local, palestrante, marca com logo, status de inscrição, botão de inscrição só quando há link, fecha por botão e por Escape.
- Guia do Atleta: abre o PDF do idioma ativo, cai no português quando não há versão traduzida, avisa quando o guia ainda não foi publicado.
- Mapa da Expo: imagem com texto alternativo, controles de zoom, aviso quando ainda não há planta.
- Info: links de contato, instruções de instalação, origem dos dados.
- Régua de patrocinadores: aparece quando há imagem, some sem quebrar o layout quando não há.
- App inteiro: troca de idioma refletindo em toda a interface, escolha salva no aparelho, abas navegáveis, aba lembrada.

### Acessibilidade, 42 testes

- axe sem violações nas cinco telas e no app inteiro, nos três idiomas.
- Contraste medido direto no arquivo de estilos, não estimado: texto principal, texto suave e texto fraco sobre os quatro fundos do tema; as três cores de pilar sobre o fundo do app, sobre o fundo do cartão e sobre o fundo da própria etiqueta; texto do botão principal; anel de foco. Todas as combinações de texto passam no mínimo AA de 4.5 para 1.
- Navegação inteira por teclado: chega na barra de baixo só com Tab, ativa aba com Enter.
- O foco fica preso dentro do detalhe enquanto ele está aberto, e volta para o cartão de origem quando fecha.
- Todo botão e link tem nome acessível.
- Ícones decorativos escondidos do leitor de tela, logos de marca com alt vazio, mapa com alt descritivo.
- Link de pular para o conteúdo, visível ao navegar por teclado.
- Alvos de toque com 40 pixels ou mais de altura.
- Animações respeitam a preferência de movimento reduzido do sistema.

### PWA e offline, verificado no navegador

- Service worker registrado e ativo, com escopo correto.
- 10 arquivos no cache de instalação: HTML, CSS, JavaScript, manifest, ícones e favicon.
- Teste real: servidor derrubado, página recarregada, app abriu completo e navegável.
- Manifest com nome, ícones de 192, 512 e maskable, tela cheia em modo standalone, cor de tema e idioma.
- Ícone de toque para iPhone incluído.

## O que precisou de ajuste durante a construção

1. **Ordem de operadores em uma verificação de pilar** deixava a validação de pilares desconhecidos passar. Corrigido e coberto por teste.
2. **Vírgulas dentro dos textos de exemplo** quebravam a leitura do CSV. Os textos foram reescritos e o caso ficou coberto por um teste com aspas.
3. **localStorage do Node 25** se sobrepunha ao do navegador simulado e quebrava os testes. Os testes agora usam um armazenamento próprio, determinístico.
4. **Rótulo de inscrição no detalhe** estava sendo montado cortando outro texto, o que quebraria em qualquer tradução. Virou uma chave própria nos três dicionários.
5. **Regra do React sobre estado dentro de efeito** apontava a busca inicial dos dados. Verificado que é o caso legítimo de sincronizar com sistema externo, e documentado no código.

## Riscos que continuam de pé

1. **A planilha do Google demora de 2 a 5 minutos para propagar.** É o cache do próprio Google, não tem como contornar sem serviço pago. Para uma agenda de evento é aceitável, mas mudança de última hora precisa de aviso paralelo pelos canais do evento.

2. **Imagem hospedada no Google Drive costuma não carregar.** O Drive bloqueia esse tipo de uso. Vale para o mapa da Expo e para a régua de patrocinadores. Se acontecer, a saída é colocar o arquivo na pasta `public` do repositório, e isso está explicado no README. O app já trata a falha: a imagem simplesmente não aparece, sem quebrar o layout.

3. **O PDF do Guia do Atleta precisa estar compartilhado como "qualquer pessoa com o link".** Se ficar restrito, o atleta cai numa tela de pedir permissão. O app não tem como detectar isso de fora.

4. **O app depende de a planilha continuar publicada.** Se a publicação na web for desfeita, os atletas que já abriram o app continuam vendo a última versão salva no aparelho, mas quem abrir pela primeira vez vê os dados de exemplo. Vale conferir a publicação na véspera do evento.

5. **Fuso horário fixo em São Paulo.** O "acontecendo agora" usa o horário do evento, não o do aparelho. É o comportamento certo para um atleta estrangeiro que não mudou o relógio, mas significa que os cartões não acompanham quem estiver em outro fuso.

6. **Sem teste em aparelho real.** A instalação como PWA e o pinch to zoom do mapa foram verificados em navegador simulado. Vale um teste rápido num iPhone e num Android antes do evento.

## Como repetir esta auditoria

```bash
npm run audit:all
```

Roda tipos, lint, os 177 testes e o build de produção, nesta ordem. O mesmo comando roda no GitHub Actions a cada push, e a publicação só acontece se tudo passar.
