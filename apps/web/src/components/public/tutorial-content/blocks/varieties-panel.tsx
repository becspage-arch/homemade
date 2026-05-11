import type { ReactNode } from 'react'

interface VarietyItem {
  name?: string
  type?: string
  description?: string
}

interface VarietiesPanelProps {
  label: string
  heading: string
  intro: string
  items: VarietyItem[]
}

export function VarietiesPanel({
  label,
  heading,
  intro,
  items,
}: VarietiesPanelProps): ReactNode {
  const clean = items.filter((it) => (it?.name ?? '').trim())
  if (clean.length === 0 && !heading) return null

  return (
    <aside className="varieties-panel">
      {label && <span className="varieties-panel-label">{label}</span>}
      {heading && <h3 className="varieties-panel-heading">{heading}</h3>}
      {intro && <p className="varieties-panel-intro">{intro}</p>}

      <ul className="varieties-grid">
        {clean.map((item, i) => (
          <li key={i} className="variety">
            <span className="variety-name">{item.name}</span>
            {item.type && <span className="variety-type">{item.type}</span>}
            {item.description && (
              <p className="variety-description">{item.description}</p>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
