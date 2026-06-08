import Link from 'next/link'

interface CrochetPatternCardData {
  id: string
  slug: string | null
  name: string
  thumbnailMediaId: string | null
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
  shapeCategory: string | null
  finishedSizeText: string | null
  primaryYarnWeightName: string | null
  primaryHookName: string | null
  premium: boolean
  designerName: string | null
  designerSlug: string | null
  subCategoryName: string | null
  subCategorySlug: string | null
}

interface SubCategoryRef {
  slug: string
  name: string
}

interface Props {
  patterns: CrochetPatternCardData[]
  subCategories: SubCategoryRef[]
  currentFilters: {
    sub: string | null
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
    yarnWeight: string | null
    sort: 'newest' | 'name'
  }
  basePath: string
}

/**
 * Crochet pattern library grid — surfaces CrochetPattern rows on the
 * /crochet category landing. Cards lead with the thumbnail, then name,
 * sub-category, finished size, yarn + hook. Tap opens the Studio at
 * the pattern.
 *
 * Filters drive query-string navigation (Server Component pattern):
 * sub-category, difficulty, yarn weight, sort. The page re-renders
 * with the new params; client-side state isn't needed.
 */
export function CrochetPatternGrid({ patterns, subCategories, currentFilters, basePath }: Props) {
  const buildHref = (overrides: Partial<typeof currentFilters>): string => {
    const params = new URLSearchParams()
    const next = { ...currentFilters, ...overrides }
    if (next.sub) params.set('sub', next.sub)
    if (next.difficulty) params.set('difficulty', next.difficulty)
    if (next.yarnWeight) params.set('yarnWeight', next.yarnWeight)
    if (next.sort && next.sort !== 'newest') params.set('sort', next.sort)
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <div className="crochet-pattern-grid">
      <nav className="crochet-pattern-grid-filters" aria-label="Filter crochet patterns">
        <div className="crochet-pattern-grid-filter-row">
          <span className="crochet-pattern-grid-filter-label">Section</span>
          <Link
            href={buildHref({ sub: null })}
            className={`crochet-pattern-grid-chip${currentFilters.sub === null ? ' is-active' : ''}`}
          >
            All
          </Link>
          {subCategories.map((s) => (
            <Link
              key={s.slug}
              href={buildHref({ sub: s.slug })}
              className={`crochet-pattern-grid-chip${currentFilters.sub === s.slug ? ' is-active' : ''}`}
            >
              {s.name}
            </Link>
          ))}
        </div>

        <div className="crochet-pattern-grid-filter-row">
          <span className="crochet-pattern-grid-filter-label">Skill</span>
          {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((d) => (
            <Link
              key={d}
              href={buildHref({ difficulty: currentFilters.difficulty === d ? null : d })}
              className={`crochet-pattern-grid-chip${currentFilters.difficulty === d ? ' is-active' : ''}`}
            >
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      </nav>

      {patterns.length === 0 ? (
        <p className="crochet-pattern-grid-empty">
          No patterns match these filters yet. Try clearing one or browsing all.
        </p>
      ) : (
        <ul className="crochet-pattern-grid-list">
          {patterns.map((p) => {
            const href = p.slug
              ? `/studio/crochet?crochetPatternSlug=${encodeURIComponent(p.slug)}`
              : `/studio/crochet?crochetPatternId=${encodeURIComponent(p.id)}`
            return (
              <li key={p.id} className="crochet-pattern-grid-card">
                <Link href={href}>
                  <div className="crochet-pattern-grid-thumb">
                    {p.thumbnailMediaId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/media/${p.thumbnailMediaId}?variant=card`}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="crochet-pattern-grid-thumb-placeholder" aria-hidden />
                    )}
                    {p.premium && (
                      <span className="crochet-pattern-grid-premium">Premium</span>
                    )}
                  </div>
                  <div className="crochet-pattern-grid-meta">
                    <span className="crochet-pattern-grid-name">{p.name}</span>
                    <span className="crochet-pattern-grid-sub">
                      {[
                        p.subCategoryName,
                        p.difficulty
                          ? p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase()
                          : null,
                        p.finishedSizeText,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    {(p.primaryYarnWeightName || p.primaryHookName) && (
                      <span className="crochet-pattern-grid-yarn">
                        {[p.primaryYarnWeightName, p.primaryHookName].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    {p.designerName && (
                      <span className="crochet-pattern-grid-designer">by {p.designerName}</span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
