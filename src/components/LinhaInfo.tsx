import { useId, useState, type ComponentType, type ReactNode } from 'react'
import { IconeChevron } from './Icones'

type Icone = ComponentType<{ className?: string }>

interface Comum {
  icone: Icone
  rotulo: string
  sub?: string
}

/** Linha que abre um link externo. */
export function LinhaLink({ icone: Icone, rotulo, sub, href }: Comum & { href: string }) {
  const externo = !href.startsWith('mailto:')
  return (
    <li>
      <a
        className="linha"
        href={href}
        {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <Icone className="linha__icone" />
        <span className="linha__texto">
          <span className="linha__rotulo">{rotulo}</span>
          {sub && <span className="linha__sub">{sub}</span>}
        </span>
        <IconeChevron className="linha__seta" />
      </a>
    </li>
  )
}

/** Linha que abre e fecha uma explicacao logo abaixo dela. */
export function LinhaExplicativa({ icone: Icone, rotulo, sub, texto }: Comum & { texto: string }) {
  const [aberta, setAberta] = useState(false)
  const id = useId()
  return (
    <li>
      <button
        type="button"
        className="linha"
        aria-expanded={aberta}
        aria-controls={id}
        onClick={() => setAberta((v) => !v)}
      >
        <Icone className="linha__icone" />
        <span className="linha__texto">
          <span className="linha__rotulo">{rotulo}</span>
          {sub && <span className="linha__sub">{sub}</span>}
        </span>
        <IconeChevron className="linha__seta" />
      </button>
      <p className="linha__explicacao" id={id} hidden={!aberta}>
        {texto}
      </p>
    </li>
  )
}

export function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="grupo">
      <h2 className="grupo__titulo">{titulo}</h2>
      <ul className="grupo__lista">{children}</ul>
    </section>
  )
}
