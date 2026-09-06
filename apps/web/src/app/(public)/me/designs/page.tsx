import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma, PatternType } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your designs · homemade',
}

/**
 * /me/designs — the maker's own patterns, gathered in one place off their
 * profile so a design they made (from an idea, a photo, or a blank canvas) is
 * easy to find again after they navigate away from the Studio.
 *
 * These are rows they own (`ownerUserId`), always PRIVATE — they are not in the
 * public catalogue. The owner IS the author, so when the Maker programme lands a
 * user can choose to publish one under their own name; until then everything here
 * stays private to them.
 *
 * Two tables feed it: `Pattern` (cross-stitch and the chart crafts) and
 * `CrochetPattern` (the crochet Studio's own designs, which carry a stitch
 * program rather than a cell grid). They are listed together, newest first, so a
 * maker who works in both crafts finds everything in one place.
 */

const STUDIO_HREF: Record<PatternType, string> = {
  CROSS_STITCH: '/studio/cross-stitch',
  KNITTING_CHART: '/studio/knitting',
  CROCHET_CHART: '/studio/crochet',
  // NEEDLEWORK and SEWING exist on PatternType so maker photos can attach to
  // those patterns. Neither has a design-your-own Studio, so both point at the
  // pattern library instead.
  NEEDLEWORK: '/needlework/patterns',
  SEWING: '/sewing',
}

const CRAFT_LABEL: Record<PatternType, string> = {
  CROSS_STITCH: 'Cross-stitch',
  KNITTING_CHART: 'Knitting',
  CROCHET_CHART: 'Crochet',
  NEEDLEWORK: 'Needlework',
  SEWING: 'Sewing',
}

interface DesignCard {
  key: string
  href: string
  name: string
  updatedAt: Date
  thumbnailUrl: string | null
  sub: string
}

function shapeLabel(shape: string | null): string | null {
  if (!shape) return null
  return shape.charAt(0) + shape.slice(1).toLowerCase().replace(/_/g, ' ')
}

export default async function MyDesignsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const [chartDesigns, crochetDesigns] = await Promise.all([
    prisma.pattern.findMany({
      where: { ownerUserId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        updatedAt: true,
        widthCells: true,
        heightCells: true,
        colourCount: true,
      },
    }),
    prisma.crochetPattern.findMany({
      where: { ownerUserId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        finishedSizeText: true,
        shapeCategory: true,
        hero: { select: { cloudflareId: true, r2Key: true } },
      },
    }),
  ])

  const designs: DesignCard[] = [
    ...chartDesigns.map((d) => ({
      key: `pattern-${d.id}`,
      href: `${STUDIO_HREF[d.type]}?patternId=${d.id}`,
      name: d.name,
      updatedAt: d.updatedAt,
      thumbnailUrl: `/api/studio/patterns/${d.id}/thumbnail`,
      sub: `${CRAFT_LABEL[d.type]} · ${d.widthCells}×${d.heightCells} · ${d.colourCount} colours`,
    })),
    ...crochetDesigns.map((d) => ({
      key: `crochet-${d.id}`,
      href: `/studio/crochet?crochetPatternId=${d.id}`,
      name: d.name,
      updatedAt: d.updatedAt,
      thumbnailUrl: mediaUrl(d.hero, 'card'),
      sub: ['Crochet', d.finishedSizeText, shapeLabel(d.shapeCategory)].filter(Boolean).join(' · '),
    })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  return (
    <section>
      <span className="me-section-label">Yours to keep</span>
      <h2 className="me-section-title">Your designs</h2>
      <p className="me-section-description">
        Everything you&apos;ve made — from an idea, from a photo, or from a blank canvas. These are
        private to you and never in the public library. Open one to keep stitching or to print it.
      </p>

      {designs.length === 0 ? (
        <p className="me-empty">
          You haven&apos;t made a design yet.{' '}
          <Link href="/studio/cross-stitch?new=design" className="me-nav-link">
            Design your own →
          </Link>
        </p>
      ) : (
        <ul className="me-designs-grid">
          {designs.map((d) => (
            <li key={d.key} className="me-design-card">
              <Link href={d.href} className="me-design-card-link">
                <span className="me-design-thumb">
                  {d.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.thumbnailUrl} alt="" loading="lazy" />
                  ) : null}
                </span>
                <span className="me-design-meta">
                  <span className="me-design-name">{d.name}</span>
                  <span className="me-design-sub">{d.sub}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
