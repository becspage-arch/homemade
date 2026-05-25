import { PinterestCard } from './home-cards/pinterest-card'
import { RailScroll } from './rail-scroll'
import type { RecentlyMadeTile } from '@/lib/recently-made'

interface RecentlyMadeRailProps {
  heading: string
  subheading?: string
  tiles: RecentlyMadeTile[]
}

/**
 * Recently-made-by-the-community rail. Desktop is a horizontal-scroll
 * rail of Pinterest Caption Cards with varied aspect ratios (4:5, 1:1,
 * 3:4 rotated) so the rhythm breaks. Mobile is a 2-column masonry grid
 * driven by CSS columns. The mobile masonry is the one place Pinterest's
 * mobile model fits Homemade better than the swipe rail.
 *
 * The whole tile links to the Made-it detail page. The Maker handle
 * renders as plain text below the image (nested anchors would be
 * invalid HTML).
 */
export function RecentlyMadeRail({
  heading,
  subheading,
  tiles,
}: RecentlyMadeRailProps) {
  if (tiles.length === 0) return null

  const items = tiles.map((t) => (
    <PinterestCard
      key={t.projectId}
      href={`/m/${t.makerHandle}/made/${t.projectId}`}
      imageMedia={t.heroSource}
      title={t.tutorialTitle}
      byline={`Made by ${t.makerName}`}
    />
  ))

  return (
    <section className="home-rail home-recently-made-rail">
      <header className="home-rail-header">
        <h2 className="home-rail-heading">{heading}</h2>
        {subheading && <p className="home-rail-subheading">{subheading}</p>}
      </header>

      {/* Desktop: horizontal swipe rail with varied-aspect cards. */}
      <div className="home-recently-made-desktop">
        <RailScroll>
          <div className="home-rail-track">{items}</div>
        </RailScroll>
      </div>

      {/* Mobile: 2-column masonry grid. */}
      <div className="home-recently-made-masonry">{items}</div>
    </section>
  )
}
