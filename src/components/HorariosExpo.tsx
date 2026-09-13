import { HORARIOS_EXPO } from '../config'
import { LOCALES, useIdioma } from '../i18n'
import { diaDoMes, mesCurto, nomeDiaSemana } from '../utils/tempo'

interface Props {
  titulo: string
  horarios: Record<string, [string, string]>
  nota?: string
}

/** Quadro fixo com um horario por dia, como o da Expo e o da retirada de kits. */
export function QuadroHorarios({ titulo, horarios, nota }: Props) {
  const { idioma } = useIdioma()
  const locale = LOCALES[idioma]

  return (
    <section className="horarios-expo">
      <h2 className="horarios-expo__titulo">{titulo}</h2>
      <ul className="horarios-expo__lista">
        {Object.entries(horarios).map(([data, [inicio, fim]]) => (
          <li key={data} className="horarios-expo__linha">
            <span className="horarios-expo__dia">
              {nomeDiaSemana(data, locale).slice(0, 3)} {diaDoMes(data)} {mesCurto(data, locale)}
            </span>
            <span className="horarios-expo__hora">
              {inicio} - {fim}
            </span>
          </li>
        ))}
      </ul>
      {nota && <p className="horarios-expo__nota">{nota}</p>}
    </section>
  )
}

/**
 * Horario de funcionamento da Expo em cada dia. Deixou de ser um item da
 * programacao, onde se repetia nos quatro dias, e virou este quadro fixo.
 */
export function HorariosExpo() {
  const { t } = useIdioma()
  return <QuadroHorarios titulo={t.programacao.horariosExpo} horarios={HORARIOS_EXPO} />
}
