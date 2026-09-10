# O que sobrou para você

Tudo o que dependia de código está feito. Estes são os únicos pontos que precisam de você, e nenhum deles é urgente hoje.

## Antes do evento

**1. Preencher a agenda de verdade.**
Abra a planilha da programação e troque os itens de exemplo pelos reais. Uma linha por item. As colunas já estão nomeadas.
https://docs.google.com/spreadsheets/d/13KL1g2goztgvLgSz6x0e6_Kpo32le02QOtSi557Epfg/edit

**2. Colocar o link do Guia do Atleta.**
Suba o PDF no Google Drive. Clique nele com o botão direito, escolha Compartilhar, e em "Acesso geral" troque para "Qualquer pessoa com o link". Copie o link e cole na planilha de config, na linha `guia_atleta_url_pt`. Se tiver versões em espanhol e inglês, use as outras duas linhas. Se deixar vazias, o app usa a versão em português.
https://docs.google.com/spreadsheets/d/1BWONpCDI5QWtjXo9ZkS4XcLZlyrnBRSGKVkkPZOWUDU/edit

**3. Colocar a imagem do mapa da Expo.**
Mesma planilha de config, linha `mapa_expo_url`. Se a imagem não aparecer no app, o motivo quase certo é que o Google Drive bloqueia esse tipo de link. Nesse caso me chame, ou siga a seção "Alternativa à prova de falhas" do README.

**4. Colocar a régua de patrocinadores.**
Mesma planilha, linha `regua_patrocinadores_url`. Uma imagem larga e baixa, tipo 1600 por 200 pixels, fica bem. Vale o mesmo aviso sobre o Google Drive.

**5. Preencher WhatsApp e mapa do local.**
Linhas `contato_whatsapp` (formato `https://wa.me/5511999999999`) e `local_maps` (link do Google Maps). Enquanto estiverem vazias, esses botões simplesmente não aparecem na tela de Info.

## Perto do evento

**6. Testar num iPhone e num Android.**
Abra https://app-utmb.github.io/utmb-paraty-agenda/ no celular, instale na tela inicial, ative o modo avião e confira se o app ainda abre. Foi testado em navegador, mas aparelho de verdade é outra coisa.

**7. Conferir na véspera se as planilhas continuam publicadas.**
Nas duas planilhas: Arquivo > Compartilhar > Publicar na web. Deve estar escrito que o documento está publicado.

## Bom saber

- **Mudou algo na planilha e não apareceu no app?** O Google leva de 2 a 5 minutos para propagar. Depois disso, puxe a tela para baixo no app para forçar a atualização.
- **Quer mudar o visual ou adicionar uma tela?** Aí é código, me chame.
- **O app se atualiza sozinho.** Não existe versão nova para o atleta baixar. Ele abre, pega o conteúdo mais recente da planilha, e pronto.
