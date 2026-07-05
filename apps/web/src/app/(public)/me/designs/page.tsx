import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma, PatternType } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your designs · homemade',
}

/**
 * /me/designs — the maker's own patterns, gathered in one place off their
 * profile so a design they made (from an idea, a photo, or a blank canvas) is
 * easy to find again after they navigate away from the Studio.
 *
 * These are `Pattern` rows they own (`ownerUserId`), always PRIVATE — they are
 * not in the public catalogue. The owner IS the author, so when the Maker
 * programme lands a user can choose to publish one under their own name; until
 * then everything here stays private to them.
 */

const STUDIO_HREF: Record<PatternType, string> = {
  CROSS_STITCH: '/studio/cross-stitch',
  KNITTING_CHART: '/studio/knitting',
  CROCHET_CHART: '/studio/crochet',
}

const CRAFT_LABEL: Record<PatternType, string> = {
  CROSS_STITCH: 'Cross-stitch',
  KNITTING_CHART: 'Knitting',
  CROCHET_CHART: 'Crochet',
}

export default async function MyDesignsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const designs = await prisma.pattern.findMany({
    where: { ownerUserId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      type: true,
      widthCells: true,
      heightCells: true,
      colourCount: true,
    },
  })

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
            <li key={d.id} className="me-design-card">
              <Link href={`${STUDIO_HREF[d.type]}?patternId=${d.id}`} className="me-design-card-link">
                <span className="me-design-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/studio/patterns/${d.id}/thumbnail`} alt="" loading="lazy" />
                </span>
                <span className="me-design-meta">
                  <span className="me-design-name">{d.name}</span>
                  <span className="me-design-sub">
                    {CRAFT_LABEL[d.type]} · {d.widthCells}×{d.heightCells} · {d.colourCount} colours
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
