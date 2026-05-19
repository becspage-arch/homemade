import Link from 'next/link'
import type { BreadcrumbItem } from '@/lib/seo/schema-builders'

import './breadcrumbs.css'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  /** Hides the rightmost item's link (the current page) — Google's recommendation. */
  currentLast?: boolean
}

/**
 * Visible breadcrumb trail. The matching `BreadcrumbList` schema is emitted
 * separately via `buildBreadcrumbSchema` so the trail can be silenced
 * visually on pages where the tutorial chrome already shows its own
 * breadcrumb (e.g. the tutorial reader) while keeping the structured data.
 */
export function Breadcrumbs({ items, currentLast = true }: BreadcrumbsProps) {
  if (items.length === 0) return null
  return (
    <nav aria-label="Breadcrumb" className="public-breadcrumbs">
      <ol className="public-breadcrumbs-list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={item.href} className="public-breadcrumbs-item">
              {isLast && currentLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.href as never}>{item.name}</Link>
              )}
              {!isLast && <span aria-hidden="true"> / </span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
