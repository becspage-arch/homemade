import { MagazineCard } from './home-cards/magazine-card'
import { HomeCard } from './home-card'
import type { ReaderStateMap } from '@/lib/user-state'
import { readerStateFor } from '@/lib/user-state'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

interface MosaicTutorial {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: string
  totalMinutes?: number | null
  timeMinutes?: number | null
  dietaryFlags?: string[] | null
  category: { slug: string; name: string }
  hero?: MediaLike | null
}

/**
 * Asymmetric mosaic for the "In season this week" section. One large
 * Magazine Editorial Card on the left, four Standard Discovery Cards on
 * the right in a 2x2 grid (desktop). Collapses to a uniform single-
 * column stack on mobile (tablet breakpoint and below).
 */
export function InSeasonMosaic({
  heading,
  tutorials,
  readerState,
}: {
  heading: string
  tutorials: MosaicTutorial[]
  readerState: ReaderStateMap
}) {
  if (tutorials.length === 0) return null
  const lead = tutorials[0]
  if (!lead) return null
  const rest = tutorials.slice(1, 5)

  return (
    <section className="home-in-season">
      <header className="home-rail-header">
        <h2 className="home-rail-heading">{heading}</h2>
      </header>
      <div className="home-in-season-grid">
        <div className="home-in-season-lead">
          <MagazineCard tutorial={lead} kicker={lead.category.name} />
        </div>
        {rest.map((t) => (
          <HomeCard
            key={t.id}
            tutorial={t}
            state={readerStateFor(readerState, t.id)}
          />
        ))}
      </div>
    </section>
  )
}
