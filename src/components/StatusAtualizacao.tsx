import type { DadosApp } from '../data/types'
import { LOCALES, useIdioma } from '../i18n'
import { horaCurta } from '../utils/tempo'
import { IconeAtualizar } from './Icones'

interface Props {
  dados: DadosApp
  atualizando: boolean
  aoAtualizar: () => void
}

/** Rodape discreto com "atualizado às HHhMM" e um botao de atualizar agora. */
export function StatusAtualizacao({ dados, atualizando, aoAtualizar }: Props) {
  const { idioma, t } = useIdioma()
  const hora = horaCurta(dados.atualizadoEm, LOCALES[idioma])

  return (
    <p className="status-atualizacao" aria-live="polite">
      <IconeAtualizar className={atualizando ? 'girando' : undefined} />
      <span>{atualizando ? t.status.atualizando : t.status.atualizadoAs(hora)}</span>
      {!atualizando && (
        <button type="button" className="status-atualizacao__botao" onClick={aoAtualizar}>
          {t.status.atualizarAgora}
        </button>
      )}
    </p>
  )
}
