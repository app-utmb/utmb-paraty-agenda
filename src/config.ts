/**
 * UNICO arquivo que voce precisa editar para ligar o app na sua planilha.
 *
 * Como obter as URLs:
 *   1. Abra a planilha no Google Sheets.
 *   2. Arquivo > Compartilhar > Publicar na web.
 *   3. Em "Vincular", escolha a aba (Programacao ou Config) e o formato
 *      "Valores separados por virgula (.csv)".
 *   4. Clique em Publicar e copie o link gerado.
 *   5. Cole abaixo. Repita para a outra aba.
 *
 * Enquanto as URLs estiverem vazias, o app roda com os dados de exemplo
 * embutidos em src/data/exemplo.ts, para voce ver o layout funcionando.
 */
export const URL_CSV_PROGRAMACAO = ''
export const URL_CSV_CONFIG = ''

/** Intervalo de revalidacao automatica enquanto o app esta aberto. */
export const INTERVALO_REVALIDACAO_MS = 5 * 60 * 1000

/** Tempo maximo de espera por uma resposta do Google antes de usar o cache. */
export const TIMEOUT_REDE_MS = 12_000

/** Datas oficiais do evento, usadas como ordem dos dias na Programacao. */
export const DIAS_EVENTO = ['2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'] as const

/** Fuso do evento. Fixo para que "acontecendo agora" nao dependa do relogio do aparelho. */
export const FUSO_EVENTO = 'America/Sao_Paulo'
