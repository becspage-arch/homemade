'use client'

/**
 * MyCrochetPatternsGrid — the maker's own crochet designs, the crochet twin of
 * the cross-stitch Studio's "Your patterns". Sits alongside "Your projects" on
 * the Studio landing: projects are library patterns being worked, these are
 * patterns the maker made.
 */

export interface MyCrochetPatternListItem {
  id: string
  name: string
  updatedAt: string
  finishedSizeText: string | null
  shapeCategory: string | null
  heroUrl: string | null
  renderPending: boolean
}

interface Props {
  patterns: MyCrochetPatternListItem[]
  onOpen: (id: string) => void
}

export function MyCrochetPatternsGrid({ patterns, onOpen }: Props) {
  if (patterns.length === 0) return null

  return (
    <section className="crochet-studio-my-designs">
      <h2 className="crochet-studio-my-projects-heading">Your designs</h2>
      <ul className="crochet-studio-my-designs-grid">
        {patterns.map((p) => (
          <li key={p.id} className="crochet-studio-my-designs-card">
            <button type="button" className="crochet-studio-my-designs-button" onClick={() => onOpen(p.id)}>
              <span className="crochet-studio-my-designs-thumb">
                {p.heroUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.heroUrl} alt="" loading="lazy" />
                ) : (
                  <span className="crochet-studio-my-designs-placeholder">
                    {p.renderPending ? 'Photo on its way' : 'No photo'}
                  </span>
                )}
              </span>
              <span className="crochet-studio-my-designs-meta">
                <span className="crochet-studio-my-designs-name">{p.name}</span>
                <span className="crochet-studio-my-designs-sub">
                  {[p.finishedSizeText, shapeLabel(p.shapeCategory)].filter(Boolean).join(' · ')}
                </span>
                <span className="crochet-studio-my-designs-time">{relativeTime(p.updatedAt)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function shapeLabel(shape: string | null): string | null {
  if (!shape) return null
  return shape.charAt(0) + shape.slice(1).toLowerCase().replace(/_/g, ' ')
}

function relativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
