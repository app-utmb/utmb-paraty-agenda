import { useState } from 'react'
import { useIdioma } from '../i18n'

interface Props {
  url: string
}

/**
 * Faixa fina de patrocinadores acima da barra de navegacao.
 * Some sozinha se a imagem nao existir ou falhar em carregar,
 * para nunca deixar um espaco quebrado na tela.
 */
export function ReguaPatrocinadores({ url }: Props) {
  const { t } = useIdioma()
  const [falhou, setFalhou] = useState(false)

  if (!url || falhou) return null

  return (
    <div className="regua">
      <img
        className="regua__img"
        src={url}
        alt={t.comum.patrocinadores}
        loading="lazy"
        decoding="async"
        onError={() => setFalhou(true)}
      />
    </div>
  )
}
