import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { prisma, Visibility, parsePatternData, estimateSkeinCount } from '@homemade/db'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { buildBreadcrumbSchema } from '@/lib/seo/schema-builders'
import { JsonLd } from '@/components/seo/json-ld'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import './pattern-detail.css'

export const dynamic = 'force-dynamic'

// Countries that default to US Letter rather than A4 for printed charts.
const LETTER_PAPER_COUNTRIES = new Set(['US', 'CA', 'MX', 'PH'])

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const row = await prisma.pattern.findUnique({
    where: { slug },
    select: { name: true, description: true, ownerUserId: true, visibility: true },
  })
  if (!row || row.ownerUserId !== null || row.visibility !== Visibility.PUBLIC) {
    return { robots: { index: false, follow: false } }
  }
  return buildPublicMetadata({
    title: `${row.name} · cross-stitch pattern · homemade`,
    description: row.description ?? `Cross-stitch pattern available on homemade.education.`,
    path: `/cross-stitch/patterns/${slug}`,
  })
}

export default async function PatternDetailPage({ params }: PageProps) {
  const { slug } = await params
  const row = await prisma.pattern.findUnique({
    where: { slug },
    include: {
      designer: { select: { displayName: true, slug: true, bio: true } },
      subCategory: { select: { slug: true, name: true } },
      hero: { select: { cloudflareId: true, r2Key: true } },
      license: true,
    },
  })
  if (!row || row.ownerUserId !== null || row.visibility !== Visibility.PUBLIC) notFound()

  let data
  try { data = parsePatternData(row.data) } catch { notFound() }

  const finishedW = (row.widthCells / row.fabricCountSuggested) * 2.54
  const finishedH = (row.heightCells / row.fabricCountSuggested) * 2.54

  const totalSkein = data.palette.reduce((sum, p) => sum + estimateSkeinCount(data, p.symbol), 0)

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
    },
  })

  const h = await headers()
  const cc = (h.get('cf-ipcountry') ?? h.get('x-vercel-ip-country') ?? '').toUpperCase()
  const paper = LETTER_PAPER_COUNTRIES.has(cc) ? 'letter' : 'a4'

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
    image: patternHeroUrl({ id: row.id, hero: row.hero }, 'hero'),
    ...(row.description ? { description: row.description } : {}),
    ...(row.designer
      ? { author: { '@type': 'Person', name: row.designer.displayName } }
      : {}),
  }

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
          <img src={patternHeroUrl({ id: row.id, hero: row.hero }, 'hero')} alt={row.name} loading="eager" />
        </div>
        <div className="pattern-detail-hero-body">
          <p className="pattern-detail-overline">Cross-stitch pattern</p>
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
            <Link href={`/studio/cross-stitch?patternId=${row.id}`} className="pattern-detail-action primary">
              Stitch this pattern
            </Link>
            <a href={`/api/studio/patterns/${row.id}/pdf?paper=${paper}`} className="pattern-detail-action ghost">
              Download PDF ({paper === 'letter' ? 'US Letter' : 'A4'})
            </a>
          </div>

          <dl className="pattern-detail-spec">
            <div><dt>Size</dt><dd>{row.widthCells} × {row.heightCells} cells</dd></div>
            <div><dt>Stitches</dt><dd>{row.totalStitches.toLocaleString()}</dd></div>
            <div><dt>Colours</dt><dd>{row.colourCount}</dd></div>
            <div><dt>Finished</dt><dd>{finishedW.toFixed(1)} × {finishedH.toFixed(1)} cm</dd></div>
            <div><dt>Fabric</dt><dd>{row.fabricCountSuggested}-count Aida</dd></div>
            <div><dt>Skeins</dt><dd>~{totalSkein.toFixed(0)} total</dd></div>
            {row.difficulty && <div><dt>Difficulty</dt><dd>{prettify(row.difficulty)}</dd></div>}
            {row.estimatedHours && <div><dt>Time</dt><dd>~{row.estimatedHours}h</dd></div>}
            {row.hasBackstitch && <div><dt>Back-stitch</dt><dd>Yes</dd></div>}
            {row.hasFrenchKnots && <div><dt>French knots</dt><dd>Yes</dd></div>}
          </dl>
        </div>
      </header>

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
                  <img src={patternHeroUrl({ id: r.id, hero: r.hero }, 'card')} alt="" loading="lazy" />
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
function formatSkein(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}
