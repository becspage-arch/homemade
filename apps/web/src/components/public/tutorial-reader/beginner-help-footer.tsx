import Link from 'next/link'
import type { GlossaryRef } from '../tutorial-content/types'

interface BeginnerHelpFooterProps {
  glossary: GlossaryRef[]
  categorySlug: string
  categoryName: string
  subCategoryName: string | null
}

/**
 * Beginner-mode footer that surfaces the glossary terms used in this tutorial
 * and offers an easier-tier link back into the category. Rendered only when
 * `beginnerMode === true`.
 */
export function BeginnerHelpFooter({
  glossary,
  categorySlug,
  categoryName,
  subCategoryName,
}: BeginnerHelpFooterProps) {
  const hasGlossary = glossary.length > 0
  return (
    <aside className="beginner-help-footer">
      <span className="beginner-help-footer-label">More help</span>
      <h2 className="beginner-help-footer-title">
        If anything in here was unfamiliar
      </h2>
      <ul className="beginner-help-footer-list">
        {hasGlossary &&
          glossary.map((g) => (
            <li key={g.id}>
              <span style={{ color: 'var(--color-espresso)' }}>{g.term}:</span>{' '}
              {g.definition}
            </li>
          ))}
        <li>
          <Link href={`/${categorySlug}?difficulty=BEGINNER`}>
            Browse easier {categoryName.toLowerCase()} tutorials
          </Link>
        </li>
        {subCategoryName && (
          <li>
            More in <span>{subCategoryName.toLowerCase()}</span>:{' '}
            <Link href={`/${categorySlug}`}>{categoryName.toLowerCase()}</Link>
          </li>
        )}
      </ul>
    </aside>
  )
}
