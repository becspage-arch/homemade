import Link from 'next/link'

interface SubCategoryChipsProps {
  categorySlug: string
  subCategories: { slug: string; name: string }[]
  /** The current ?sub= search param value; null = "All". */
  activeSlug: string | null
  /** Preserve other active filters when switching sub-category. */
  preserveQuery?: Record<string, string>
}

/**
 * Horizontal scrollable strip of sub-category pill chips. The "All"
 * chip points at the category base URL; each sub-category chip points
 * at /[categorySlug]?sub=[subCategorySlug]. Active state when the
 * current ?sub= matches.
 *
 * Query-param routing (not a new path segment) avoids the route
 * conflict with /[categorySlug]/[tutorialSlug].
 */
export function SubCategoryChips({
  categorySlug,
  subCategories,
  activeSlug,
  preserveQuery = {},
}: SubCategoryChipsProps) {
  if (subCategories.length === 0) return null

  const baseQuery = new URLSearchParams(preserveQuery)
  // The "All" link strips ?sub but keeps other params.
  const allHref = baseQuery.toString()
    ? `/${categorySlug}?${baseQuery.toString()}`
    : `/${categorySlug}`

  return (
    <nav className="category-chip-strip" aria-label="Sub-categories">
      <Link
        href={allHref}
        className={`category-chip${activeSlug === null ? ' is-active' : ''}`}
      >
        All
      </Link>
      {subCategories.map((sub) => {
        const params = new URLSearchParams(preserveQuery)
        params.set('sub', sub.slug)
        const href = `/${categorySlug}?${params.toString()}`
        return (
          <Link
            key={sub.slug}
            href={href}
            className={`category-chip${activeSlug === sub.slug ? ' is-active' : ''}`}
          >
            {sub.name}
          </Link>
        )
      })}
    </nav>
  )
}
