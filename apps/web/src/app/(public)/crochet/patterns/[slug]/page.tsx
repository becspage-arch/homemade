import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma, Visibility, crochetHeroMedia } from '@homemade/db'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { buildBreadcrumbSchema, absoluteImageUrl } from '@/lib/seo/schema-builders'
import { JsonLd } from '@/components/seo/json-ld'
import { getCurrentDbUser, isEditorOrAbove } from '@/lib/get-current-user'
import { canAccessPremiumContent, isPremiumContent } from '@/lib/entitlements'
import { mediaUrl } from '@/lib/media'
import { PremiumBadge } from '@/components/premium'
import { PatternUnlockCta } from '@/components/public/pattern-access/PatternUnlockCta'
import { MakerPhotos } from '@/components/public/maker-photos/maker-photos'
import { loadMakerPhotos } from '@/lib/maker-photos'
import {
  CROCHET_CATEGORY_SLUG,
  abbreviationLegend,
  canViewCrochetPatternPage,
  crochetPageAccess,
  crochetPatternPath,
  isLibraryViewable,
  normalisePublicRows,
  prettyEnum,
  shouldIndex,
  visibleSections,
  yarnMetres,
} from '@/lib/crochet/public-pattern'
import './crochet-pattern-detail.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * The public crochet pattern page: the indexable shop window for one library
 * pattern, modelled on the needlework and cross-stitch pages. Rendered with
 * plain React (no TipTap: the public renderer stays editor-free).
 *
 * Gated on the crochet category being publicly visible, like every other
 * public crochet surface; while it is hidden this 404s to the public and an
 * editor can preview it (noindex). The free / gated split lives in
 * `lib/crochet/public-pattern.ts`.
 */

const loadCategoryVisible = cache(async (): Promise<boolean> => {
  const c = await prisma.category.findUnique({
    where: { slug: CROCHET_CATEGORY_SLUG },
    select: { isPublicVisible: true },
  })
  return c?.isPublicVisible === true
})

const loadPattern = cache(async (slug: string) =>
  prisma.crochetPattern.findUnique({
    where: { slug },
    // Field by field: never loomProgram or chartData, which this page never draws.
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      ownerUserId: true,
      visibility: true,
      rowsStructured: true,
      difficulty: true,
      estimatedHours: true,
      premium: true,
      gaugeText: true,
      finishedSizeText: true,
      yardageBySize: true,
      notions: true,
      safetyNotes: true,
      pieceCount: true,
      abbreviationsUsed: true,
      terminologyConvention: true,
      subCategoryId: true,
      designer: { select: { displayName: true, bio: true, isHouseDesigner: true } },
      subCategory: { select: { slug: true, name: true } },
      primaryYarnWeight: { select: { canonicalName: true } },
      primaryHook: { select: { canonicalName: true } },
      loomHero: { select: { cloudflareId: true, r2Key: true, alt: true } },
      hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true, alt: true } },
    },
  }),
)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [row, categoryVisible] = await Promise.all([loadPattern(slug), loadCategoryVisible()])
  if (!row || !isLibraryViewable(row) || !categoryVisible) {
    // A hidden category (or a missing row) is never indexed, preview or not.
    return { robots: { index: false, follow: false } }
  }
  const image = crochetHeroMedia(row)
  return buildPublicMetadata({
    title: `${row.name} · crochet pattern · homemade`,
    description: row.description ?? 'A crochet pattern on homemade.education.',
    path: crochetPatternPath(slug),
    ogType: 'article',
    imageUrl: absoluteImageUrl(mediaUrl(image, 'hero')),
    imageAlt: row.name,
    index: shouldIndex({ categoryVisible, visibility: row.visibility }),
  })
}

export default async function CrochetPatternDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [row, categoryVisible, user] = await Promise.all([
    loadPattern(slug),
    loadCategoryVisible(),
    getCurrentDbUser(),
  ])
  if (!row || !isLibraryViewable(row)) notFound()
  if (!canViewCrochetPatternPage({ categoryVisible, viewerIsAdmin: isEditorOrAbove(user) })) {
    notFound()
  }

  const path = crochetPatternPath(slug)
  const heroMedia = row.loomHero ?? row.hero ?? row.thumbnail
  const heroUrl = mediaUrl(crochetHeroMedia(row), 'hero')
  const heroAlt = heroMedia?.alt ?? row.name

  const content = { premium: row.premium, designer: row.designer }
  const premiumContent = isPremiumContent(content)
  const access = crochetPageAccess({
    signedIn: Boolean(user),
    canAccessPremium: canAccessPremiumContent(user, content),
  })

  const rows = normalisePublicRows(row.rowsStructured)
  const { sections, heldBack } = visibleSections(rows, access)
  const legend = abbreviationLegend(row.abbreviationsUsed, row.terminologyConvention)
  const metres = yarnMetres(row.yardageBySize)
  const terms = row.terminologyConvention === 'us' ? 'US terms' : 'UK terms'
  const studioHref = `/studio/crochet?crochetPatternSlug=${encodeURIComponent(slug)}`

  const [makerPhotos, related] = await Promise.all([
    loadMakerPhotos({ kind: 'pattern', patternId: row.id, patternType: 'CROCHET_CHART' }),
    row.subCategoryId
      ? prisma.crochetPattern.findMany({
          where: {
            subCategoryId: row.subCategoryId,
            ownerUserId: null,
            visibility: Visibility.PUBLIC,
            publishedAt: { not: null },
            slug: { not: null },
            id: { not: row.id },
          },
          orderBy: [{ popularityScore: 'desc' }, { publishedAt: 'desc' }],
          take: 4,
          select: {
            id: true,
            slug: true,
            name: true,
            difficulty: true,
            loomHero: { select: { cloudflareId: true, r2Key: true } },
            hero: { select: { cloudflareId: true, r2Key: true } },
            thumbnail: { select: { cloudflareId: true, r2Key: true } },
          },
        })
      : Promise.resolve([]),
  ])

  // What you need: the yarn and hook first, then the notions as authored.
  const yarnLine = [
    row.primaryYarnWeight?.canonicalName ? `${row.primaryYarnWeight.canonicalName} yarn` : null,
    metres ? `about ${metres} m` : null,
  ]
    .filter(Boolean)
    .join(', ')
  const materials: string[] = [
    ...(yarnLine ? [yarnLine.charAt(0).toUpperCase() + yarnLine.slice(1)] : []),
    ...(row.primaryHook?.canonicalName ? [`${row.primaryHook.canonicalName} crochet hook`] : []),
    ...row.notions,
  ]

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Crochet', href: '/crochet' },
    ...(row.subCategory
      ? [{ name: row.subCategory.name, href: `/crochet?sub=${row.subCategory.slug}` }]
      : []),
    { name: row.name, href: path },
  ])
  // The shop-window schema: what is public on the page, never the held rounds.
  const patternSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: row.name,
    genre: 'Crochet pattern',
    url: path,
    ...(heroUrl ? { image: absoluteImageUrl(heroUrl) } : {}),
    ...(row.description ? { description: row.description } : {}),
    ...(row.designer ? { author: { '@type': 'Person', name: row.designer.displayName } } : {}),
    material: materials,
    keywords: ['crochet pattern', row.subCategory?.name, ...legend.map((l) => l.meaning)]
      .filter(Boolean)
      .join(', '),
  }

  return (
    <article className="cr-detail">
      <JsonLd data={[patternSchema, breadcrumbSchema]} />
      {!categoryVisible && (
        <p className="cr-detail-preview-note" role="status">
          Preview: crochet is hidden, so only editors can see this page and it is not indexed.
        </p>
      )}
      <nav className="cr-detail-breadcrumb" aria-label="Breadcrumb">
        <Link href="/crochet">Crochet</Link>
        {row.subCategory && (
          <>
            <span>·</span>
            <Link href={`/crochet?sub=${row.subCategory.slug}#patterns`}>{row.subCategory.name}</Link>
          </>
        )}
      </nav>

      <header className="cr-detail-hero">
        <div className="cr-detail-hero-image">
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroUrl} alt={heroAlt} loading="eager" />
          ) : (
            <div className="cr-detail-hero-empty" aria-hidden />
          )}
        </div>
        <div className="cr-detail-hero-body">
          <p className="cr-detail-overline">
            {row.subCategory ? `${row.subCategory.name} · ` : ''}Crochet pattern
            {premiumContent && <PremiumBadge iconOnly className="cr-detail-premium-badge" />}
          </p>
          <h1 className="cr-detail-title">{row.name}</h1>
          {row.designer && <p className="cr-detail-designer">by {row.designer.displayName}</p>}

          <dl className="cr-detail-spec">
            {row.finishedSizeText && (
              <div className="cr-detail-spec-wide"><dt>Finished size</dt><dd>{row.finishedSizeText}</dd></div>
            )}
            {row.difficulty && <div><dt>Skill</dt><dd>{prettyEnum(row.difficulty)}</dd></div>}
            {row.estimatedHours && <div><dt>Time</dt><dd>~{row.estimatedHours}h</dd></div>}
            {row.primaryYarnWeight && <div><dt>Yarn</dt><dd>{row.primaryYarnWeight.canonicalName}</dd></div>}
            {metres && <div><dt>Yarn amount</dt><dd>~{metres} m</dd></div>}
            {row.primaryHook && <div><dt>Hook</dt><dd>{row.primaryHook.canonicalName}</dd></div>}
            {row.pieceCount > 1 && <div><dt>Pieces</dt><dd>{row.pieceCount}</dd></div>}
            <div><dt>Written in</dt><dd>{terms}</dd></div>
          </dl>

          {row.description && <p className="cr-detail-description">{row.description}</p>}

          <div className="cr-detail-actions">
            {access === 'full' ? (
              <Link href={studioHref} className="cr-detail-action primary">Make this in the Studio</Link>
            ) : access === 'premium' ? (
              <Link href="/premium" className="cr-detail-action primary">Make this pattern · Premium</Link>
            ) : (
              <a href="#rounds" className="cr-detail-action primary">See the pattern</a>
            )}
          </div>

          <p className="cr-detail-first-time">
            New to crochet?{' '}
            <Link href="/crochet/crochet-reading-written-patterns">How to read a written pattern</Link>
          </p>
        </div>
      </header>

      <MakerPhotos
        photos={makerPhotos}
        signedIn={Boolean(user)}
        patternId={row.id}
        patternType="CROCHET_CHART"
        returnTo={path}
        galleryHref="/crochet/makes"
      />

      <section className="cr-detail-materials">
        <h2>What you’ll need</h2>
        {materials.length > 0 && (
          <ul className="cr-detail-list">
            {materials.map((m) => <li key={m}>{m}</li>)}
          </ul>
        )}
        {row.gaugeText && (
          <p className="cr-detail-gauge"><strong>Gauge:</strong> {row.gaugeText}</p>
        )}
        {row.safetyNotes && (
          <p className="cr-detail-safety" role="note"><strong>Safety:</strong> {row.safetyNotes}</p>
        )}
      </section>

      {legend.length > 0 && (
        <section className="cr-detail-abbreviations">
          <h2>Stitches and abbreviations</h2>
          <dl>
            {legend.map((l) => (
              <div key={l.abbr}>
                <dt>{l.abbr}</dt>
                <dd>{l.meaning || ' '}</dd>
              </div>
            ))}
          </dl>
          <p className="cr-detail-note">
            Not sure of a stitch? <Link href="/stitches/crochet">The crochet stitch guide</Link> shows each one.
          </p>
        </section>
      )}

      <section className="cr-detail-rounds" id="rounds">
        <h2>The pattern</h2>
        <p className="cr-detail-note">Written in {terms}.</p>
        {sections.map((s) => (
          <div key={s.name} className="cr-detail-section">
            {(sections.length > 1 || s.name !== 'Pattern') && <h3>{s.name}</h3>}
            <ol>
              {s.rows.map((r, i) => (
                <li key={i}>
                  {r.label && !r.instruction.startsWith(r.label) && (
                    <span className="cr-detail-row-label">{r.label}: </span>
                  )}
                  {r.instruction}
                  {r.colourLabel && !(r.label ?? '').includes(r.colourLabel) && (
                    <span className="cr-detail-row-colour"> ({r.colourLabel})</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}

        {access === 'full' ? (
          <div className="cr-detail-studio-cta">
            <Link href={studioHref} className="cr-detail-action primary">Open in the Studio</Link>
            <p>Tick off each round as you go, switch to US terms, and pick up where you left off on any device.</p>
          </div>
        ) : (
          <div className="cr-detail-gate">
            {heldBack > 0 && (
              <p className="cr-detail-held">
                {heldBack} more {heldBack === 1 ? 'step' : 'steps'} to the finished piece.
              </p>
            )}
            {access === 'sign-in' ? (
              <PatternUnlockCta
                craftLabel="the whole pattern"
                returnTo={path}
                unlocks={[
                  'Every round, written out with its stitch count',
                  'The Crochet Studio to tick off each round as you go',
                  'UK or US terms, whichever you learned',
                ]}
              />
            ) : (
              <div className="cr-detail-premium">
                <h3>This is a premium pattern</h3>
                <p>Premium opens every round of it, and the Studio to work it in.</p>
                <Link href="/premium" className="cr-detail-action primary">See premium</Link>
              </div>
            )}
          </div>
        )}
      </section>

      {row.designer?.bio && (
        <section className="cr-detail-designer-card">
          <h2>About {row.designer.displayName}</h2>
          <p>{row.designer.bio}</p>
        </section>
      )}

      {related.some((r) => crochetHeroMedia(r)) && (
        <section className="cr-detail-related">
          <h2>Make one of these next</h2>
          <ul>
            {related.map((r) => {
              const img = mediaUrl(crochetHeroMedia(r), 'card')
              if (!img) return null
              return (
                <li key={r.id}>
                  <Link href={crochetPatternPath(r.slug as string)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" loading="lazy" />
                    <span className="cr-detail-related-name">{r.name}</span>
                    {r.difficulty && <span className="cr-detail-related-meta">{prettyEnum(r.difficulty)}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </article>
  )
}
