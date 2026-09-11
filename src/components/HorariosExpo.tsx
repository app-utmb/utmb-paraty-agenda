import { HORARIOS_EXPO } from '../config'
import { LOCALES, useIdioma } from '../i18n'
import { diaDoMes, mesCurto, nomeDiaSemana } from '../utils/tempo'

/**
 * Horario de funcionamento da Expo em cada dia. Deixou de ser um item da
 * programacao, onde se repetia nos quatro dias, e virou este quadro fixo.
 */
export function HorariosExpo() {
  const { idioma, t } = useIdioma()
  const locale = LOCALES[idioma]

  return (
    <section className="horarios-expo">
      <h2 className="horarios-expo__titulo">{t.programacao.horariosExpo}</h2>
      <ul className="horarios-expo__lista">
        {Object.entries(HORARIOS_EXPO).map(([data, [inicio, fim]]) => (
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
    </section>
  )
}
