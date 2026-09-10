/**
 * Icones em SVG inline. Sao decorativos: o rotulo textual ao lado
 * carrega o significado, entao levam aria-hidden.
 */
type Props = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export const IconeInicio = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9.5h13V10" />
  </svg>
)

export const IconeCalendario = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="3.2" y="5" width="17.6" height="15.5" rx="2.6" />
    <path d="M3.2 9.6h17.6M8 3.2v3.6M16 3.2v3.6" />
  </svg>
)

export const IconeMapa = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="m9 4.2-5.4 2.4v13.2L9 17.4l6 2.4 5.4-2.4V4.2L15 6.6z" />
    <path d="M9 4.2v13.2M15 6.6v13.2" />
  </svg>
)

export const IconeLivro = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M4 4.5h6a3 3 0 0 1 3 3v12a2.4 2.4 0 0 0-2.4-2.4H4z" />
    <path d="M20 4.5h-6a3 3 0 0 0-3 3v12a2.4 2.4 0 0 1 2.4-2.4H20z" />
  </svg>
)

export const IconeInfo = ({ className }: Props) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 11v5.4M12 7.9h.01" />
  </svg>
)

export const IconeGlobo = ({ className }: Props) => (
  <svg {...base} className={className} width="17" height="17">
    <circle cx="12" cy="12" r="8.6" />
    <path d="M3.6 12h16.8M12 3.4c2.3 2.4 3.5 5.4 3.5 8.6s-1.2 6.2-3.5 8.6c-2.3-2.4-3.5-5.4-3.5-8.6S9.7 5.8 12 3.4Z" />
  </svg>
)

export const IconeFechar = ({ className }: Props) => (
  <svg {...base} className={className} width="19" height="19">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconeSeta = ({ className }: Props) => (
  <svg {...base} className={className} width="18" height="18">
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
  </svg>
)

export const IconeAtualizar = ({ className }: Props) => (
  <svg {...base} className={className} width="14" height="14">
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20.2 4v4.6h-4.6" />
  </svg>
)

export const IconeCheck = ({ className }: Props) => (
  <svg {...base} className={className} width="17" height="17">
    <path d="m5 12.6 4.4 4.4L19 6.8" />
  </svg>
)

export const IconeMais = ({ className }: Props) => (
  <svg {...base} className={className} width="19" height="19">
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
)

export const IconeMenos = ({ className }: Props) => (
  <svg {...base} className={className} width="19" height="19">
    <path d="M5.5 12h13" />
  </svg>
)

export const IconeNuvemCortada = ({ className }: Props) => (
  <svg {...base} className={className} width="17" height="17">
    <path d="M6.6 18.5h10a4 4 0 0 0 .7-7.9 6 6 0 0 0-9.6-3.4" />
    <path d="M3 3l18 18" />
  </svg>
)

export const IconeBusca = ({ className }: Props) => (
  <svg {...base} className={className} width="18" height="18">
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="m15.6 15.6 4 4" />
  </svg>
)

export const IconeEtiqueta = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M11 3.6H4.6a1 1 0 0 0-1 1V11a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8L12.4 4.2A2 2 0 0 0 11 3.6Z" />
    <path d="M7.9 7.9h.01" />
  </svg>
)

export const IconeAoVivo = ({ className }: Props) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M6.7 6.7a7.5 7.5 0 0 0 0 10.6M17.3 17.3a7.5 7.5 0 0 0 0-10.6" />
  </svg>
)

export const IconeLua = ({ className }: Props) => (
  <svg {...base} className={className} width="19" height="19">
    <path d="M20.2 14.2A8.4 8.4 0 0 1 9.8 3.8a8.4 8.4 0 1 0 10.4 10.4Z" />
  </svg>
)

export const IconeSol = ({ className }: Props) => (
  <svg {...base} className={className} width="19" height="19">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.6v2.2M12 19.2v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.4 19.6 6 18M18 6l1.6-1.6" />
  </svg>
)

export const IconeMonitor = ({ className }: Props) => (
  <svg {...base} className={className} width="19" height="19">
    <rect x="3" y="4.4" width="18" height="12.4" rx="2" />
    <path d="M8.4 20.4h7.2M12 16.8v3.6" />
  </svg>
)

export const IconeChevron = ({ className }: Props) => (
  <svg {...base} className={className} width="17" height="17">
    <path d="m9.4 5.6 6.4 6.4-6.4 6.4" />
  </svg>
)

export const IconePino = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M19 10.4c0 5.2-7 10.4-7 10.4s-7-5.2-7-10.4a7 7 0 0 1 14 0Z" />
    <circle cx="12" cy="10.2" r="2.6" />
  </svg>
)

export const IconeLink = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M10.2 13.8a3.6 3.6 0 0 0 5.4.4l2.6-2.6a3.7 3.7 0 0 0-5.2-5.2l-1.5 1.5" />
    <path d="M13.8 10.2a3.6 3.6 0 0 0-5.4-.4l-2.6 2.6a3.7 3.7 0 0 0 5.2 5.2l1.5-1.5" />
  </svg>
)

export const IconeEnvelope = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="3" y="5.4" width="18" height="13.2" rx="2.4" />
    <path d="m3.6 7 7.3 5.2a2 2 0 0 0 2.2 0L20.4 7" />
  </svg>
)

export const IconeWhatsapp = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M20.2 11.6a8.2 8.2 0 0 1-12.1 7.2L3.8 20.2l1.4-4.2A8.2 8.2 0 1 1 20.2 11.6Z" />
    <path d="M9.2 9.1c.3 2.4 2.3 4.4 4.7 4.7l1-1.2 1.5.8-.3 1.5c-2.9.5-6.5-3.1-6-6l1.5-.3.8 1.5z" />
  </svg>
)

export const IconeCelular = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="6.4" y="2.8" width="11.2" height="18.4" rx="2.6" />
    <path d="M10.6 5.6h2.8" />
  </svg>
)

export const IconeEstrela = ({ className, cheia = false }: Props & { cheia?: boolean }) => (
  <svg {...base} className={className} width="21" height="21" fill={cheia ? 'currentColor' : 'none'}>
    <path d="m12 3.6 2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.8-5.2 2.8 1-6-4.3-4.2 5.9-.8z" />
  </svg>
)
