import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { notFound } from 'next/navigation'
import {
  prisma,
  Visibility,
  parsePatternData,
  estimateSkeinCount,
  STITCHABILITY_BANDS,
} from '@homemade/db'
import { bumpPatternView } from '@/lib/popularity'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { buildBreadcrumbSchema, absoluteImageUrl } from '@/lib/seo/schema-builders'
import { JsonLd } from '@/components/seo/json-ld'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium, isPremiumContent, canAccessPremiumContent } from '@/lib/entitlements'
import { PremiumBadge } from '@/components/premium'
import { PatternSaveButton } from '@/components/public/pattern-save-button'
import { PatternPlanButton } from '@/components/public/pattern-plan-button'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import { FabricCalculator } from './fabric-calculator'
import { PdfDownload } from './pdf-download'
import { SpecTip } from './spec-tip'
import './pattern-detail.css'

export const dynamic = 'force-dynamic'

// Countries that default to US Letter rather than A4 for printed charts.
const LETTER_PAPER_COUNTRIES = new Set(['US', 'CA', 'MX', 'PH'])

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { slug } = await params
  const row = await prisma.pattern.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      description: true,
      ownerUserId: true,
      visibility: true,
      hero: { select: { cloudflareId: true, r2Key: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  if (!row || row.ownerUserId !== null || row.visibility !== Visibility.PUBLIC) {
    return { robots: { index: false, follow: false } }
  }
  return buildPublicMetadata({
    title: `${row.name} · cross-stitch pattern · homemade`,
    description: row.description ?? `Cross-stitch pattern available on homemade.education.`,
    path: `/cross-stitch/patterns/${slug}`,
    imageUrl: absoluteImageUrl(patternHeroUrl(row, 'hero')),
    imageAlt: row.name,
  })
}

export default async function PatternDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const row = await prisma.pattern.findUnique({
    where: { slug },
    include: {
      designer: { select: { displayName: true, slug: true, bio: true, isHouseDesigner: true } },
      subCategory: { select: { slug: true, name: true } },
      hero: { select: { cloudflareId: true, r2Key: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true } },
      license: true,
    },
  })
  if (!row || row.ownerUserId !== null || row.visibility !== Visibility.PUBLIC) notFound()

  // headers() must be read before after() is registered — Next.js treats any
  // headers()/cookies() call later in the same route as "used inside after()"
  // once after() has been scheduled, even when it's not actually called from
  // the callback (HOMEMADE-WEB-1V). Read it here and use the plain value below.
  const h = await headers()
  const cc = (h.get('cf-ipcountry') ?? h.get('x-vercel-ip-country') ?? '').toUpperCase()
  const paper = LETTER_PAPER_COUNTRIES.has(cc) ? 'letter' : 'a4'

  // Real view signal feeding popularityScore. Runs after the response so it
  // never adds latency to the page; a failed bump must not break the page.
  after(async () => {
    try { await bumpPatternView(row.id) } catch { /* best-effort counter */ }
  })

  let data
  try { data = parsePatternData(row.data) } catch { notFound() }

  const finishedW = (row.widthCells / row.fabricCountSuggested) * 2.54
  const finishedH = (row.heightCells / row.fabricCountSuggested) * 2.54

  const totalSkein = data.palette.reduce((sum, p) => sum + estimateSkeinCount(data, p.symbol), 0)

  // How the chart feels under the needle. Computed off the grid at save time
  // and stored on the row; older rows the backfill hasn't reached simply show
  // nothing rather than a guess.
  const band = row.stitchability != null ? STITCHABILITY_BANDS[row.stitchability] : undefined

  // Difficulty and stitchability read as two competing verdicts when they sit
  // in the spec grid as separate rows. They are one thought: how hard it is
  // and how it feels to work. One row, one label, one explanation.
  const difficultyLabel = row.difficulty ? prettify(row.difficulty) : null
  const goingLabel =
    difficultyLabel && band
      ? 'Difficulty and stitching'
      : difficultyLabel
        ? 'Difficulty'
        : 'Stitching'
  const goingValue =
    difficultyLabel && band
      ? `Difficulty: ${difficultyLabel}. Stitching: ${band.label}`
      : difficultyLabel
        ? difficultyLabel
        : (band?.label ?? '')

  const related = await prisma.pattern.findMany({
    where: {
      ownerUserId: null,
      visibility: Visibility.PUBLIC,
      type: 'CROSS_STITCH',
      id: { not: row.id },
      ...(row.subCategoryId ? { subCategoryId: row.subCategoryId } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    select: {
      id: true,
      slug: true,
      name: true,
      widthCells: true,
      heightCells: true,
      colourCount: true,
      designer: { select: { displayName: true } },
      hero: { select: { cloudflareId: true, r2Key: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true } },
    },
  })

  const patternPath = `/cross-stitch/patterns/${slug}`

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Cross-stitch', href: '/cross-stitch' },
    { name: 'Patterns', href: '/cross-stitch/patterns' },
    { name: row.name, href: `/cross-stitch/patterns/${slug}` },
  ])
  const patternSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: row.name,
    genre: 'Cross-stitch pattern',
    url: `/cross-stitch/patterns/${slug}`,
    image: absoluteImageUrl(patternHeroUrl({ id: row.id, hero: row.hero, thumbnail: row.thumbnail }, 'hero')),
    ...(row.description ? { description: row.description } : {}),
    ...(row.designer
      ? { author: { '@type': 'Person', name: row.designer.displayName } }
      : {}),
  }

  // Privacy-safe social proof: an anonymous count of makers who've finished
  // this pattern. UserPatternProgress is private tracking with no publish
  // opt-in, so we never name individuals here — only the aggregate.
  const finishedCount = await prisma.userPatternProgress.count({
    where: { patternId: row.id, completedAt: { not: null } },
  })

  // Make-it-list save state for the signed-in reader. Anonymous readers still
  // see the Save button; tapping it routes them through sign-in.
  const user = await getCurrentDbUser()
  const premium = hasPremium(user)
  // Cross-craft content gate: premium-flagged OR independent-designer content
  // reads as premium. The page stays a full preview (hero, spec, floss) and is
  // badged; opening it in the Studio is the access gate. Printing/downloading
  // is the separate universal premium action below (gated on `premium`).
  const content = { premium: row.premium, designer: row.designer }
  const premiumContent = isPremiumContent(content)
  const canAccess = canAccessPremiumContent(user, content)
  const [saved, inPlan] = user
    ? await Promise.all([
        prisma.savedPattern
          .findUnique({
            where: { userId_patternId: { userId: user.id, patternId: row.id } },
            select: { id: true },
          })
          .then(Boolean),
        prisma.plannerProject
          .findUnique({
            where: {
              userId_craft_patternId: {
                userId: user.id,
                craft: 'CROSS_STITCH',
                patternId: row.id,
              },
            },
            select: { id: true },
          })
          .then(Boolean),
      ])
    : [false, false]

  return (
    <article className="pattern-detail">
      <JsonLd data={[patternSchema, breadcrumbSchema]} />
      <nav className="pattern-detail-breadcrumb">
        <Link href="/cross-stitch">Cross-stitch</Link>
        <span>·</span>
        <Link href="/cross-stitch/patterns">Patterns</Link>
        {row.subCategory && (
          <>
            <span>·</span>
            <Link href={`/cross-stitch/patterns?sub=${row.subCategory.slug}`}>{row.subCategory.name}</Link>
          </>
        )}
      </nav>

      <header className="pattern-detail-hero">
        <div className="pattern-detail-hero-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={patternHeroUrl({ id: row.id, hero: row.hero, thumbnail: row.thumbnail }, 'hero')} alt={row.name} loading="eager" />
        </div>
        <div className="pattern-detail-hero-body">
          <p className="pattern-detail-overline">
            Cross-stitch pattern
            {premiumContent && <PremiumBadge iconOnly className="pattern-detail-premium-badge" />}
          </p>
          <h1 className="pattern-detail-title">{row.name}</h1>
          {row.designer && (
            // Designer name is plain text — per-designer profile pages
            // aren't built yet (they belong with designer onboarding). The
            // "About {designer}" card below carries the bio. Matches the
            // library card, which also shows the name as plain text.
            <p className="pattern-detail-designer">by {row.designer.displayName}</p>
          )}
          {row.description && <p className="pattern-detail-description">{row.description}</p>}

          <div className="pattern-detail-actions">
            {/* Opening a premium (independent-designer) pattern in the Studio
                is the access gate. Free + house patterns open straight in; a
                non-premium reader on premium content is routed to upgrade (the
                Studio enforces it server-side too). */}
            {canAccess ? (
              <Link href={`/studio/cross-stitch?patternId=${row.id}`} className="pattern-detail-action primary">
                Stitch this pattern
              </Link>
            ) : (
              <Link href="/premium" className="pattern-detail-action primary">
                Stitch this pattern · Premium
              </Link>
            )}
            {/* Downloading the PDF is premium (universal print/download gate).
                Non-premium readers get a link to upgrade; the route enforces it
                server-side too. */}
            {premium ? (
              <PdfDownload patternId={row.id} defaultPaper={paper} />
            ) : (
              <Link href="/premium" className="pattern-detail-action ghost">
                Download PDF · Premium
              </Link>
            )}
            <PatternSaveButton patternId={row.id} initialSaved={saved} />
            <PatternPlanButton
              patternId={row.id}
              initialInPlan={inPlan}
              signedIn={Boolean(user)}
              patternPath={patternPath}
              pendingIntent={sp.plan === row.id}
            />
          </div>

          {/* First step for anyone who has never stitched, in the actions
              area where the decision is being made. The fuller "Start here"
              card below repeats it for readers who scroll. Both destinations
              are free and open without an account. */}
          <p className="pattern-detail-first-time">
            New to cross-stitch?{' '}
            <Link href={`/cross-stitch/how-to-read-a-cross-stitch-chart?from=${slug}`}>
              Start with how to read a chart
            </Link>
          </p>

          {finishedCount > 0 && (
            <p className="pattern-detail-finished">
              Finished by {finishedCount.toLocaleString()}{' '}
              {finishedCount === 1 ? 'maker' : 'makers'} in the community
            </p>
          )}

          <dl className="pattern-detail-spec">
            <div><dt>Size</dt><dd>{row.widthCells} × {row.heightCells} cells</dd></div>
            <div><dt>Stitches</dt><dd>{row.totalStitches.toLocaleString()}</dd></div>
            <div><dt>Colours</dt><dd>{row.colourCount}</dd></div>
            <div><dt>Finished</dt><dd>{finishedW.toFixed(1)} × {finishedH.toFixed(1)} cm</dd></div>
            <div><dt>Fabric</dt><dd>{row.fabricCountSuggested}-count Aida</dd></div>
            <div><dt>Skeins</dt><dd>~{totalSkein.toFixed(0)} total</dd></div>
            {(band || row.difficulty) && (
              <div className="pattern-detail-spec-going">
                <dt>{goingLabel}</dt>
                <dd>
                  {goingValue}
                  <SpecTip label="What difficulty and stitching mean">
                    Difficulty is the skill the pattern asks for. Stitching is
                    how much attention the chart wants while you work it
                    {band ? `: ${lowerFirst(band.blurb)}` : '.'}
                  </SpecTip>
                </dd>
              </div>
            )}
            {row.estimatedHours && <div><dt>Time</dt><dd>~{row.estimatedHours}h</dd></div>}
            {row.hasBackstitch && <div><dt>Back-stitch</dt><dd>Yes</dd></div>}
            {row.hasFrenchKnots && <div><dt>French knots</dt><dd>Yes</dd></div>}
          </dl>

          <FabricCalculator
            widthCells={row.widthCells}
            heightCells={row.heightCells}
            suggestedCount={row.fabricCountSuggested}
          />
        </div>
      </header>

      {/* Provenance, one line. The market is learning to distrust listing
          images that turn out to be renderings, and our answer is the strong
          one: the image IS the chart. Links through to the full account. */}
      <p className="pattern-detail-provenance">
        This picture is the chart itself, so what you stitch is exactly what you see.{' '}
        <Link href="/cross-stitch/about-the-library">How the library is made</Link>
      </p>

      {/* First step for someone who has never stitched. Both destinations are
          free and open without an account. */}
      <aside className="pattern-detail-startpoints">
        <h2>New to cross-stitch? Start here</h2>
        <ul>
          <li>
            <Link href="/cross-stitch/how-to-read-a-cross-stitch-chart">
              How to read a cross-stitch chart
            </Link>
            <span>The grid, the key, the centre, and where to put the first stitch.</span>
          </li>
          <li>
            <Link href="/stitches/cross-stitch">Cross-stitch stitch guide</Link>
            <span>
              Every stitch a chart can ask for, with the symbol and a reminder of how
              it is worked.
            </span>
          </li>
        </ul>
      </aside>

      <section className="pattern-detail-floss">
        <h2>Floss colours</h2>
        <ul>
          {data.palette.map((p) => {
            const stitches = data.grid.cells.filter((c) => c.s === p.symbol).length
            const skein = estimateSkeinCount(data, p.symbol)
            return (
              <li key={p.symbol}>
                <span className="pattern-detail-floss-swatch" style={{ background: p.rgb }} />
                <span className="pattern-detail-floss-detail">
                  <span className="pattern-detail-floss-name">{p.name}</span>
                  <span className="pattern-detail-floss-code">{p.brand} {p.code}</span>
                </span>
                <span className="pattern-detail-floss-counts">
                  {stitches.toLocaleString()} st · ~{formatSkein(skein)} skein{skein > 1 ? 's' : ''}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {row.designer && row.designer.bio && (
        <section className="pattern-detail-designer-card">
          <h2>About {row.designer.displayName}</h2>
          <p>{row.designer.bio}</p>
        </section>
      )}

      {related.length > 0 && (
        <section className="pattern-detail-related">
          <h2>Stitch one of these next</h2>
          <ul>
            {related.map((r) => (
              <li key={r.id}>
                <Link href={r.slug ? `/cross-stitch/patterns/${r.slug}` : `/studio/cross-stitch?patternId=${r.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={patternHeroUrl({ id: r.id, hero: r.hero, thumbnail: r.thumbnail }, 'card')} alt="" loading="lazy" />
                  <div>
                    <span className="pattern-detail-related-name">{r.name}</span>
                    {r.designer?.displayName && <span className="pattern-detail-related-by">by {r.designer.displayName}</span>}
                    <span className="pattern-detail-related-meta">{r.widthCells} × {r.heightCells} · {r.colourCount} colours</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

function prettify(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}
/** Lower-case the first letter so a band blurb can follow a colon. */
function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}
function formatSkein(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}
