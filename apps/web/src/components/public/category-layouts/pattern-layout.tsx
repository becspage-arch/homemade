import Link from 'next/link'
import { prisma, TutorialStatus, Visibility } from '@homemade/db'
import { CategoryScopedSearch } from '@/components/public/category/category-scoped-search'
import { FoundationsPath } from '@/components/public/category/foundations-path'
import { PatternLibraryGrid } from '@/app/(public)/cross-stitch/patterns/pattern-library-grid'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'

const DESIGNER_SPOTLIGHT_TAKE = 6
const RECENTLY_COMPLETED_TAKE = 8

interface PatternLayoutCategory {
  id: string
  slug: string
  name: string
  description: string | null
  subCategories: { id: string; slug: string; name: string }[]
}

interface PatternLayoutProps {
  category: PatternLayoutCategory
  searchParams: {
    sub?: string
    sort?: 'featured' | 'newest' | 'size' | 'popular'
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    size?: 's' | 'm' | 'l'
    minColour?: string
    maxColour?: string
    hasBackstitch?: '1'
    hasFrenchKnots?: '1'
  }
}

const SIZE_RANGES: Record<string, { maxCells: number }> = {
  s: { maxCells: 4_000 },
  m: { maxCells: 12_000 },
  l: { maxCells: Number.POSITIVE_INFINITY },
}

const PATTERN_TYPE_BY_SLUG: Record<string, 'CROSS_STITCH' | 'KNITTING_CHART' | 'CROCHET_CHART'> = {
  'cross-stitch': 'CROSS_STITCH',
  knitting: 'KNITTING_CHART',
  crochet: 'CROCHET_CHART',
}

const SEARCH_SUGGESTIONS: Record<string, { label: string; q: string }[]> = {
  'cross-stitch': [
    { label: 'Animals', q: 'animal' },
    { label: 'Florals', q: 'flower' },
    { label: 'Beginner-friendly', q: 'beginner' },
    { label: 'Under 5 hours', q: 'quick' },
    { label: 'No back-stitch', q: 'no backstitch' },
  ],
  knitting: [
    { label: 'Beginner scarf', q: 'beginner scarf' },
    { label: 'Hats', q: 'hat' },
    { label: 'Baby blanket', q: 'baby blanket' },
    { label: 'Socks', q: 'sock' },
    { label: 'Garments', q: 'garment sweater' },
  ],
  crochet: [
    { label: 'Granny squares', q: 'granny square' },
    { label: 'Amigurumi', q: 'amigurumi' },
    { label: 'Blankets', q: 'blanket' },
    { label: 'Quick gift', q: 'small gift' },
    { label: 'Beginner', q: 'beginner' },
  ],
  needlework: [
    { label: 'Lace edging', q: 'lace' },
    { label: 'Needlepoint', q: 'needlepoint' },
    { label: 'Tatting', q: 'tatting' },
  ],
  sewing: [
    { label: 'Aprons', q: 'apron' },
    { label: 'Bags', q: 'bag' },
    { label: 'Mending', q: 'mending' },
    { label: 'Quilting', q: 'quilt' },
    { label: 'Soft toys', q: 'soft toy' },
  ],
}

const STUDIO_CTAS: Record<string, { primary?: { label: string; href: string }; secondary?: { label: string; href: string } }> = {
  'cross-stitch': {
    primary: { label: 'Make one from a photo', href: '/studio/cross-stitch?new=photo' },
    secondary: { label: 'Start with a blank canvas', href: '/studio/cross-stitch?new=blank' },
  },
  crochet: {
    primary: { label: 'Open the Crochet Studio', href: '/studio/crochet' },
  },
  knitting: {},
  needlework: {},
  sewing: {},
}

export async function PatternLayout({ category, searchParams }: PatternLayoutProps) {
  const sp = searchParams
  const patternType = PATTERN_TYPE_BY_SLUG[category.slug]

  // Load patterns + foundations + designer spotlight in parallel.
  const where: Record<string, unknown> = {
    ownerUserId: null,
    visibility: Visibility.PUBLIC,
    publishedAt: { not: null },
    subCategory: { categoryId: category.id },
  }
  if (patternType) where.type = patternType
  if (sp.difficulty) where.difficulty = sp.difficulty
  if (sp.hasBackstitch === '1') where.hasBackstitch = true
  if (sp.hasFrenchKnots === '1') where.hasFrenchKnots = true
  if (sp.sub) where.subCategory = { slug: sp.sub, categoryId: category.id }

  const sort = sp.sort ?? 'featured'
  const orderBy =
    sort === 'newest'
      ? { publishedAt: 'desc' as const }
      : sort === 'size'
        ? { totalStitches: 'asc' as const }
        : sort === 'popular'
          ? { updatedAt: 'desc' as const }
          : { publishedAt: 'desc' as const }

  const [patterns, foundations, anchorPatterns, spotlightDesigner, recentlyCompleted] = await Promise.all([
    patternType
      ? prisma.pattern.findMany({
          where,
          orderBy,
          take: 96,
          select: {
            id: true,
            slug: true,
            name: true,
            widthCells: true,
            heightCells: true,
            colourCount: true,
            totalStitches: true,
            difficulty: true,
            estimatedHours: true,
            hasBackstitch: true,
            hasFrenchKnots: true,
            premium: true,
            fabricCountSuggested: true,
            designer: { select: { displayName: true, slug: true } },
            subCategory: { select: { slug: true, name: true } },
            hero: { select: { cloudflareId: true, r2Key: true } },
          },
        })
      : Promise.resolve([]),
    prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        foundational: true,
      },
      orderBy: [{ publishedAt: 'asc' }],
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        difficulty: true,
        category: { select: { slug: true, name: true } },
        hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
      },
    }),
    patternType
      ? prisma.pattern.findMany({
          where: {
            ownerUserId: null,
            visibility: Visibility.PUBLIC,
            publishedAt: { not: null },
            type: patternType,
            subCategory: { categoryId: category.id },
            hero: { isNot: null },
          },
          orderBy: { publishedAt: 'desc' },
          take: 6,
          select: {
            id: true,
            slug: true,
            hero: { select: { cloudflareId: true, r2Key: true } },
          },
        })
      : Promise.resolve([]),
    patternType
      ? pickRotatingDesigner({ categoryId: category.id, patternType })
      : Promise.resolve(null),
    patternType
      ? prisma.userPatternProgress.findMany({
          where: {
            completedAt: { not: null },
            pattern: {
              ownerUserId: null,
              visibility: Visibility.PUBLIC,
              type: patternType,
              subCategory: { categoryId: category.id },
            },
          },
          orderBy: { completedAt: 'desc' },
          take: RECENTLY_COMPLETED_TAKE,
          select: {
            id: true,
            completedAt: true,
            pattern: {
              select: {
                id: true,
                slug: true,
                name: true,
                hero: { select: { cloudflareId: true, r2Key: true } },
              },
            },
            user: {
              select: { id: true, name: true, displayHandle: true },
            },
          },
        })
      : Promise.resolve([]),
  ])

  const sizeFilter = sp.size ? SIZE_RANGES[sp.size] : null
  const filtered = patterns.filter((p) => {
    if (sizeFilter && p.widthCells * p.heightCells > sizeFilter.maxCells) return false
    if (sp.minColour && p.colourCount < Number(sp.minColour)) return false
    if (sp.maxColour && p.colourCount > Number(sp.maxColour)) return false
    return true
  })

  const suggestions = SEARCH_SUGGESTIONS[category.slug]
  const studioCtas = STUDIO_CTAS[category.slug] ?? {}
  const foundationsSubCat = category.subCategories.find(
    (sc) => sc.slug === 'foundations',
  )

  return (
    <div className="pattern-landing">
      {/* Header: lede + Studio CTAs + decorative thumbnail strip. */}
      <header className="pattern-landing-header">
        <div className="pattern-landing-header-content">
          <p className="pattern-landing-eyebrow">{category.name} · pattern library</p>
          <h1 className="pattern-landing-title">{patternHeaderTitle(category.slug)}</h1>
          <p className="pattern-landing-lede">{patternHeaderLede(category.slug)}</p>
          <div className="pattern-landing-actions">
            {studioCtas.primary && (
              <Link href={studioCtas.primary.href} className="pattern-landing-action primary">
                {studioCtas.primary.label}
              </Link>
            )}
            {studioCtas.secondary && (
              <Link href={studioCtas.secondary.href} className="pattern-landing-action ghost">
                {studioCtas.secondary.label}
              </Link>
            )}
            <Link href="#patterns" className="pattern-landing-action ghost">
              Browse patterns ↓
            </Link>
          </div>
        </div>
        {anchorPatterns.length > 0 && (
          <ul className="pattern-landing-thumbstrip" aria-hidden="true">
            {anchorPatterns.slice(0, 5).map((p) => (
              <li key={p.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={patternHeroUrl({ id: p.id, hero: p.hero }, 'card')}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              </li>
            ))}
          </ul>
        )}
      </header>

      <CategoryScopedSearch
        categorySlug={category.slug}
        placeholder={patternSearchPlaceholder(category.slug)}
        suggestions={suggestions}
      />

      {foundations.length > 0 && (
        <FoundationsPath
          heading="Start here"
          subheading={`The foundation skills for ${category.name.toLowerCase()}.`}
          steps={foundations.map((f) => ({
            id: f.id,
            slug: f.slug,
            title: f.title,
            excerpt: f.excerpt,
            difficulty: f.difficulty,
            category: f.category,
            hero: f.hero,
          }))}
          seeAllHref={
            foundationsSubCat
              ? `/${category.slug}?sub=${foundationsSubCat.slug}`
              : null
          }
        />
      )}

      {spotlightDesigner && spotlightDesigner.patterns.length >= 2 && (
        <section className="pattern-landing-spotlight" aria-label="Designer spotlight">
          <header className="pattern-landing-spotlight-header">
            <p className="pattern-landing-spotlight-eyebrow">Designer spotlight</p>
            <h2 className="pattern-landing-spotlight-name">
              {spotlightDesigner.displayName}
            </h2>
            {spotlightDesigner.bio && (
              <p className="pattern-landing-spotlight-bio">
                {spotlightDesigner.bio}
              </p>
            )}
            {spotlightDesigner.websiteUrl && (
              <a
                href={spotlightDesigner.websiteUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="pattern-landing-spotlight-link"
              >
                Designer website ↗
              </a>
            )}
          </header>
          <ul className="pattern-landing-spotlight-grid">
            {spotlightDesigner.patterns.map((p) => {
              const href = p.slug
                ? `/${category.slug}/patterns/${p.slug}`
                : `/studio/cross-stitch?patternId=${p.id}`
              return (
                <li key={p.id} className="pattern-landing-spotlight-card">
                  <Link href={href}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={patternHeroUrl({ id: p.id, hero: p.hero }, 'card')}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="pattern-landing-spotlight-card-name">
                      {p.name}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {recentlyCompleted.length > 0 && (
        <section className="pattern-landing-completed" aria-label="Recently completed by the community">
          <header className="pattern-landing-completed-header">
            <h2 className="pattern-landing-completed-heading">Recently finished by the community</h2>
            <p className="pattern-landing-completed-subheading">
              Real makes from real makers.
            </p>
          </header>
          <ul className="pattern-landing-completed-grid">
            {recentlyCompleted.map((p) => {
              const href = p.pattern.slug
                ? `/${category.slug}/patterns/${p.pattern.slug}`
                : `/studio/cross-stitch?patternId=${p.pattern.id}`
              const handle = p.user.displayHandle ?? p.user.name
              return (
                <li key={p.id} className="pattern-landing-completed-card">
                  <Link href={href}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={patternHeroUrl({ id: p.pattern.id, hero: p.pattern.hero }, 'card')}
                      alt={p.pattern.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="pattern-landing-completed-card-name">
                      {p.pattern.name}
                    </span>
                    {handle && (
                      <span className="pattern-landing-completed-card-maker">
                        by {handle}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section id="patterns" className="pattern-landing-library">
        {patternType ? (
          patterns.length === 0 && filtered.length === 0 && Object.keys(sp).length === 0 ? (
            <div className="pattern-landing-empty">
              <h2>{emptyPatternHeading(category.slug, foundations.length > 0)}</h2>
              <p>{emptyPatternBody(category.slug, foundations.length > 0)}</p>
            </div>
          ) : (
            <PatternLibraryGrid
              patterns={filtered.map((p) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                widthCells: p.widthCells,
                heightCells: p.heightCells,
                colourCount: p.colourCount,
                totalStitches: p.totalStitches,
                difficulty: p.difficulty,
                estimatedHours: p.estimatedHours,
                hasBackstitch: p.hasBackstitch,
                hasFrenchKnots: p.hasFrenchKnots,
                premium: p.premium,
                fabricCountSuggested: p.fabricCountSuggested,
                designerName: p.designer?.displayName ?? null,
                designerSlug: p.designer?.slug ?? null,
                subCategorySlug: p.subCategory?.slug ?? null,
                subCategoryName: p.subCategory?.name ?? null,
                thumbnailUrl: patternHeroUrl({ id: p.id, hero: p.hero }, 'card'),
              }))}
              subCategories={category.subCategories.map((s) => ({
                slug: s.slug,
                name: s.name,
              }))}
              currentFilters={{
                sub: sp.sub ?? null,
                difficulty: sp.difficulty ?? null,
                size: sp.size ?? null,
                sort,
                hasBackstitch: sp.hasBackstitch === '1',
                hasFrenchKnots: sp.hasFrenchKnots === '1',
              }}
              basePath={`/${category.slug}`}
            />
          )
        ) : (
          <div className="pattern-landing-empty">
            <h2>{emptyPatternHeading(category.slug, foundations.length > 0)}</h2>
            <p>{emptyPatternBody(category.slug, foundations.length > 0)}</p>
          </div>
        )}
      </section>
    </div>
  )
}

function patternHeaderTitle(slug: string): string {
  switch (slug) {
    case 'cross-stitch': return 'Stitch something beautiful.'
    case 'knitting': return 'Knit something quietly extraordinary.'
    case 'crochet': return 'Hook something heirloom.'
    case 'needlework': return 'Slow stitching, made simple.'
    case 'sewing': return 'Sew something well-made.'
    default: return 'Make something with your hands.'
  }
}

function patternHeaderLede(slug: string): string {
  switch (slug) {
    case 'cross-stitch':
      return 'Designed patterns from independent makers. Open one in the Studio, mark stitched as you go, print a clean PDF when you are ready.'
    case 'knitting':
      return 'Designed knitting patterns from independent designers. Open one in the Studio when it ships; read the foundation tutorials below today.'
    case 'crochet':
      return 'Row-by-row patterns with UK and US terminology, gauge logging, and per-size grading in the Crochet Studio.'
    case 'needlework':
      return 'Patterns and reference for cross-stitch, needlepoint, tatting, and lacemaking.'
    case 'sewing':
      return 'Patterns from independent designers with grading, fabric requirements, and finished measurements. Studio coming.'
    default:
      return 'Patterns from independent designers, with the Studio you need to make them yours.'
  }
}

function patternSearchPlaceholder(slug: string): string {
  switch (slug) {
    case 'cross-stitch': return 'Pattern name, theme, designer'
    case 'knitting': return "Pattern name or 'beginner scarf'"
    case 'crochet': return "Pattern name or 'granny square'"
    case 'needlework': return 'Pattern name or technique'
    case 'sewing': return "Pattern name or 'tote bag'"
    default: return 'Pattern name, theme, designer'
  }
}

/**
 * Pick the designer to spotlight for this category, rotating every 2 days.
 *
 * Eligible designers are those with at least 2 PUBLIC + published patterns
 * in the category. They're ordered newest-first by their createdAt; the
 * rotation index advances every 2 days so each designer gets a fair turn.
 *
 * Falls back to most-popular ordering (patternCount desc) when the
 * newest-first cycle would land on the same designer it just left, which
 * happens when the category has only one eligible designer.
 */
async function pickRotatingDesigner({
  categoryId,
  patternType,
}: {
  categoryId: string
  patternType: 'CROSS_STITCH' | 'KNITTING_CHART' | 'CROCHET_CHART'
}) {
  const eligibleWhere = {
    patterns: {
      some: {
        ownerUserId: null,
        visibility: Visibility.PUBLIC,
        publishedAt: { not: null },
        type: patternType,
        subCategory: { categoryId },
      },
    },
  }

  // Pull the full eligible list with a hard cap so a deep designer list
  // doesn't pull a huge result set; 50 is generous for the foreseeable.
  const newestFirst = await prisma.designer.findMany({
    where: eligibleWhere,
    orderBy: [{ createdAt: 'desc' }],
    take: 50,
    select: { id: true, createdAt: true },
  })

  if (newestFirst.length === 0) return null

  // Rotation index: advance every 2 days, deterministic per category so the
  // homepage and category page would agree. Computed in UTC against a fixed
  // epoch so the cycle survives timezone drift.
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
  const cyclesSinceEpoch = Math.floor(Date.now() / TWO_DAYS_MS)
  // Salt the index with the category id so different categories rotate on
  // different days of the cycle. Hash by char-code sum is enough for spread.
  const salt = categoryId
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const idx = (cyclesSinceEpoch + salt) % newestFirst.length
  const targetEntry = newestFirst[idx]
  if (!targetEntry) return null

  // Hydrate the chosen designer with the data the section needs.
  return prisma.designer.findUnique({
    where: { id: targetEntry.id },
    select: {
      id: true,
      slug: true,
      displayName: true,
      bio: true,
      websiteUrl: true,
      avatar: { select: { cloudflareId: true, r2Key: true } },
      patterns: {
        where: {
          ownerUserId: null,
          visibility: Visibility.PUBLIC,
          publishedAt: { not: null },
          type: patternType,
          subCategory: { categoryId },
        },
        orderBy: { publishedAt: 'desc' },
        take: DESIGNER_SPOTLIGHT_TAKE,
        select: {
          id: true,
          slug: true,
          name: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      },
    },
  })
}

function emptyPatternHeading(slug: string, hasFoundations: boolean): string {
  if (hasFoundations) {
    switch (slug) {
      case 'knitting': return 'Start with the basics above.'
      case 'crochet': return 'Open the Studio, or learn the foundations first.'
      case 'sewing': return 'Sewing patterns are arriving soon.'
      case 'needlework': return 'Needlework patterns are arriving soon.'
      case 'cross-stitch': return 'New patterns coming soon.'
      default: return 'Patterns are arriving soon.'
    }
  }
  switch (slug) {
    case 'sewing': return 'Sewing patterns are on the way.'
    case 'needlework': return 'Needlework patterns are on the way.'
    case 'cross-stitch': return 'The cross-stitch library is being seeded.'
    default: return 'Patterns are on the way.'
  }
}

function emptyPatternBody(slug: string, hasFoundations: boolean): string {
  if (hasFoundations) {
    switch (slug) {
      case 'knitting':
        return 'The Knitting Studio is on its way. While we build it, learn the cast-on, the knit stitch, the purl stitch, and the bind-off in the foundation tutorials above.'
      case 'crochet':
        return 'The Crochet Studio is live. Start with the foundation tutorials above if you are new to crochet; designed patterns are landing as we sign more designers.'
      case 'sewing':
        return 'Designer sewing patterns are landing as we sign more designers. The Techniques sub-category above is the place to start in the meantime.'
      case 'needlework':
        return 'Needlepoint, tatting and lacemaking patterns are arriving with the Needlework Studio. The reference tutorials above are live.'
      case 'cross-stitch':
        return 'More patterns from independent designers are joining the library each week. Browse what is there above, or start your own from a photo.'
      default:
        return 'Designed patterns are arriving with the Studio. The foundation tutorials above are live.'
    }
  }
  switch (slug) {
    case 'sewing':
      return 'Independent sewing designers are joining as we open the Studio for sewing. Until then, the rest of the site has plenty to make.'
    case 'needlework':
      return 'Needlepoint, tatting and lacemaking patterns are arriving with the Needlework Studio. Until then, the rest of the site has plenty to make.'
    default:
      return 'Patterns will arrive here as the catalogue grows. Check back soon.'
  }
}
