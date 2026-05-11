import Link from 'next/link'
import type { ReactNode } from 'react'
import type { SubTutorialRef } from '../types'

interface SubTutorialCardProps {
  tutorialId: string
  refs: SubTutorialRef[]
}

export function SubTutorialCard({
  tutorialId,
  refs,
}: SubTutorialCardProps): ReactNode {
  const ref = refs.find((r) => r.id === tutorialId)
  if (!ref) {
    return (
      <div className="sub-tutorial-card-missing">
        Linked tutorial no longer available.
      </div>
    )
  }

  const href = `/${ref.categorySlug}/${ref.slug}` as const

  return (
    <Link href={href} className="sub-tutorial-card">
      {ref.heroThumbnailUrl ? (
        <span
          className="sub-tutorial-card-thumb"
          role="img"
          aria-label=""
          style={{ backgroundImage: `url(${ref.heroThumbnailUrl})` }}
        />
      ) : (
        <span className="sub-tutorial-card-thumb placeholder" aria-hidden="true">
          h
        </span>
      )}
      <span className="sub-tutorial-card-content">
        <span className="sub-tutorial-card-label">read also</span>
        <span className="sub-tutorial-card-title">{ref.title}</span>
        {ref.excerpt && (
          <span className="sub-tutorial-card-excerpt">{ref.excerpt}</span>
        )}
      </span>
      <span className="sub-tutorial-card-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
