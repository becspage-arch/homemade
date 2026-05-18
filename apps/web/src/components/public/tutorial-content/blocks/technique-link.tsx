import type { ReactNode } from 'react'
import Link from 'next/link'
import type { TechniqueRef } from '../types'

interface TechniqueLinkProps {
  techniqueSlug: string
  /**
   * Cached label captured by the editor at the moment the author wrapped
   * the text. Used only as a fallback when the resolved technique tutorial
   * doesn't carry a title (it always should — but defensive against a
   * future where the title becomes blank-able).
   */
  label: string
  techniques: TechniqueRef[]
  children: ReactNode
}

/**
 * Renders a `techniqueLink` mark. Two branches:
 *
 *   1. The slug resolves to a published technique tutorial in the
 *      `techniques` Map fed by the page server component. Render an
 *      `<a>` to the technique page with a hover popover showing the
 *      technique title.
 *   2. The slug doesn't resolve (technique tutorial not authored yet,
 *      or the row is unpublished). Fall back to plain text — the
 *      surrounding sentence still reads naturally and the link goes
 *      live automatically the moment the technique row is published.
 */
export function TechniqueLink({
  techniqueSlug,
  label,
  techniques,
  children,
}: TechniqueLinkProps): ReactNode {
  const technique = techniques.find((t) => t.slug === techniqueSlug)
  if (!technique) return <>{children}</>

  const href = `/${technique.categorySlug}/${technique.slug}`
  const displayTitle = technique.title || label
  const popoverId = `technique-${technique.slug}`

  return (
    <span className="technique-link-wrapper">
      <Link
        href={href}
        className="technique-link"
        aria-describedby={popoverId}
      >
        {children}
      </Link>
      <span className="technique-popup" id={popoverId} role="tooltip">
        <span className="technique-popup-label">technique</span>
        <span className="technique-popup-title">{displayTitle}</span>
      </span>
    </span>
  )
}
