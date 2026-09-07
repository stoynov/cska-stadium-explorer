import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { stadiumFacts } from '../content-facts'
import { factSources } from '../config/fact-sources'
import { content } from '../content'
import { Dialog } from './Dialog'

const photographs = [
  'optimized/stadium-render.jpg',
  'DJI_20260809161340_0103_D-845x684.jpg',
  'DJI_20260809160800_0092_D-2048x1152.jpg',
  'DJI_20260809160303_0086_D-845x684.jpg',
  'DJI_20260809160419_0087_D-845x684.jpg',
]
export function StadiumGuide({
  language,
  chapter,
  onClose,
  onTower,
}: {
  language: 'bg' | 'en'
  chapter: number
  onClose: () => void
  onTower: () => void
}) {
  const [section, setSection] = useState(chapter),
    t = content[language],
    bg = language === 'bg'
  const names = [...t.chapters, bg ? 'Посещение' : 'Visiting']
  return (
    <Dialog
      title={bg ? 'Опознай новата Армия.' : 'Meet the new stadium.'}
      closeLabel={t.close}
      onClose={onClose}
      className="stadium-guide"
    >
      <p className="guide-date">
        {bg
          ? 'Проверено на 06.09.2026 · Официални публикации'
          : 'Checked 6 September 2026 · Official publications'}
      </p>
      <nav
        className="guide-navigation"
        aria-label={bg ? 'Теми за стадиона' : 'Stadium topics'}
      >
        {names.map((name, i) => (
          <button
            key={name}
            aria-pressed={section === i}
            onClick={() => setSection(i)}
          >
            {name}
          </button>
        ))}
      </nav>
      <p className="guide-status">
        {bg
          ? 'Данните описват публикувания проект. Капацитетът зависи от състезанието; отварянето за посетители се обявява отделно.'
          : 'Figures describe the published project. Capacity depends on the competition; visitor opening is announced separately.'}
      </p>
      {section === 4 && (
        <button className="guide-trigger" onClick={onTower}>
          {bg ? 'Телевизионната кула отблизо' : 'Explore the TV tower in 3D'}
          <ArrowUpRight size={14} />
        </button>
      )}
      <div className="guide-facts" key={section}>
        {stadiumFacts[language][section].map((fact) => {
          const source = factSources[fact.source]
          return (
            <article className="guide-fact" key={fact.title}>
              <strong className="fact-value">{fact.value}</strong>
              <div>
                <h3>{fact.title}</h3>
                <p>{fact.text}</p>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {bg ? 'Източник: ' : 'Source: '}
                  {'publisher' in source ? source.publisher : 'ЦСКА'}
                  {source.date ? ` · ${source.date}` : ''}
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </article>
          )
        })}
      </div>
      {section < 5 && (
        <figure className="guide-photo">
          <img
            src={`/assets/cska/${photographs[section]}`}
            alt={`${t.chapters[section]} — ${section === 0 ? t.render : t.photo}`}
            loading="lazy"
          />
          <figcaption>
            {section === 0 ? t.render : t.photo} · stadium.cska.bg
          </figcaption>
        </figure>
      )}
      {section === 5 && (
        <a
          className="source-link"
          href="https://cska.bg/news/"
          target="_blank"
          rel="noreferrer"
        >
          {bg ? 'Последни съобщения на клуба' : 'Latest club announcements'}
          <ArrowUpRight size={16} />
        </a>
      )}
    </Dialog>
  )
}
