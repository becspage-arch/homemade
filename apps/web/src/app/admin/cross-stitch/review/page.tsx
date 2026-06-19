import { prisma, Visibility } from '@homemade/db'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import { ReviewActions } from './review-actions'
import './review.css'

export const dynamic = 'force-dynamic'

/**
 * Cross-stitch REVIEW queue. The autopilot generates patterns into the
 * UNLISTED state (visibility !== PUBLIC, ownerUserId null) after passing the
 * deterministic structural + licence gates. This page is the human-grade
 * vision gate: an editor (or Claude in a worker session) eyeballs each render
 * and publishes the lovely ones or discards the rest. Nothing reaches the
 * public catalogue without passing through here.
 */
export default async function CrossStitchReviewPage() {
  const rows = await prisma.pattern.findMany({
    where: { type: 'CROSS_STITCH', visibility: Visibility.UNLISTED, ownerUserId: null },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, slug: true, name: true, widthCells: true, heightCells: true, colourCount: true,
      hero: { select: { cloudflareId: true, r2Key: true } },
      designer: { select: { displayName: true } }, description: true,
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Cross-stitch review queue</h1>
          <p>
            {rows.length} pattern{rows.length === 1 ? '' : 's'} awaiting the vision pass. Publish the lovely ones; discard the rest.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">The review queue is empty.</p>
      ) : (
        <ul className="cross-stitch-review-grid">
          {rows.map((p) => {
            const held = (p.description ?? '').includes('HOLD')
            return (
              <li key={p.id} className="cross-stitch-review-card">
                <div className="cross-stitch-review-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={patternHeroUrl({ id: p.id, hero: p.hero }, 'card')} alt={p.name} loading="lazy" />
                  <span className={`cross-stitch-review-pill ${held ? 'hold' : 'ok'}`}>{held ? 'held' : 'ready'}</span>
                </div>
                <div className="cross-stitch-review-body">
                  <h3>{p.name}</h3>
                  <p className="cross-stitch-review-meta">
                    {p.widthCells} × {p.heightCells} · {p.colourCount} colours · {p.designer?.displayName ?? 'no designer'}
                  </p>
                  {p.description && <p className="cross-stitch-review-desc">{p.description}</p>}
                  <ReviewActions id={p.id} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
