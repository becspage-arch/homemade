import type { ReactNode } from 'react'

interface TroubleItem {
  symptom?: string
  cause?: string
  fix?: string
}

interface TroubleshooterProps {
  heading: string
  intro: string
  items: TroubleItem[]
}

export function Troubleshooter({
  heading,
  intro,
  items,
}: TroubleshooterProps): ReactNode {
  const clean = items.filter(
    (it) => (it?.symptom ?? '').trim() || (it?.fix ?? '').trim(),
  )
  if (clean.length === 0 && !heading) return null

  return (
    <aside className="troubleshooter">
      {heading && <h3 className="troubleshooter-heading">{heading}</h3>}
      {intro && <p className="troubleshooter-intro">{intro}</p>}

      <ul className="troubleshooter-list">
        {clean.map((item, i) => (
          <li key={i} className="trouble">
            <div className="trouble-symptom">{item.symptom}</div>
            <div className="trouble-fix">
              {item.cause && <strong>{item.cause} </strong>}
              {item.fix}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
