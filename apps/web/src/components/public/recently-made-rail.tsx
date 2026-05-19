import Link from 'next/link'
import { mediaSrcSet } from '@/lib/media'
import { HomeRail } from './home-rail'
import type { RecentlyMadeTile } from '@/lib/recently-made'

interface RecentlyMadeRailProps {
  heading: string
  subheading?: string
  tiles: RecentlyMadeTile[]
}

/**
 * Pinterest-style rail of recent public makes. One tile per UserProject,
 * showing the hero photo + tutorial title + "Made by {Name}" caption.
 *
 * The whole tile links to the Made it detail page (which itself links to
 * the Maker profile). Nesting a maker-profile link inside the tile would
 * produce nested anchors — invalid HTML — so the maker name renders as
 * plain text here and the tap target is the tile + detail page.
 *
 * Renders nothing when there are no tiles — the parent should already
 * check this but we belt-and-braces it.
 */
export function RecentlyMadeRail({
  heading,
  subheading,
  tiles,
}: RecentlyMadeRailProps) {
  if (tiles.length === 0) return null
  return (
    <HomeRail heading={heading} subheading={subheading}>
      {tiles.map((t) => {
        const card = mediaSrcSet(t.heroSource, 'card', ['public'])
        return (
          <Link
            key={t.projectId}
            href={`/m/${t.makerHandle}/made/${t.projectId}`}
            className="home-card home-card-card"
          >
            <span className="home-card-image-wrap">
              {card ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="home-card-image"
                  src={card.src}
                  srcSet={card.srcSet}
                  sizes="(min-width: 900px) 28vw, (min-width: 600px) 44vw, 80vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="home-card-image procedural" />
              )}
            </span>
            <span className="home-card-body">
              <span className="home-card-category">{t.categoryName}</span>
              <span className="home-card-title">{t.tutorialTitle}</span>
              <span className="home-card-meta">
                <span>Made by {t.makerName}</span>
              </span>
            </span>
          </Link>
        )
      })}
    </HomeRail>
  )
}
