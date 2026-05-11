import type { ReactNode } from 'react'

interface SuppliesItem {
  name?: string
  qty?: string
  link?: string
}

interface SuppliesCardProps {
  heading: string
  items: SuppliesItem[]
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function SuppliesCard({ heading, items }: SuppliesCardProps): ReactNode {
  const cleanItems = items.filter((i) => i?.name?.trim())
  if (cleanItems.length === 0 && !heading) return null
  return (
    <aside className="supplies-card">
      <span className="supplies-card-label">you will need</span>
      {heading && <h3 className="supplies-card-heading">{heading}</h3>}
      <ul className="supplies-card-list">
        {cleanItems.map((item, i) => (
          <li key={i}>
            <span className="supplies-qty">{item.qty?.trim() || '·'}</span>
            <span className="supplies-name">{item.name}</span>
            {item.link?.trim() && isHttpUrl(item.link.trim()) ? (
              <a
                className="supplies-link"
                href={item.link.trim()}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                buy →
              </a>
            ) : (
              <span aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
