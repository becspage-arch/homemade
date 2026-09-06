import Link from 'next/link'
import { DiscoveryCard, type DiscoveryCardTutorial } from './home-cards/discovery-card'
import { DiscoveryPatternCard } from './home-cards/discovery-pattern-card'
import { PinterestCard } from './home-cards/pinterest-card'
import type { ReaderStateMap } from '@/lib/user-state'
import { readerStateFor } from '@/lib/user-state'
import type { RecentlyMadeTile } from '@/lib/recently-made'
import type { MakerPhotoTile } from '@/lib/maker-photos'
import type { DiscoveryPatternCard as DiscoveryPattern } from '@/lib/homepage-data'

import './home-cards/home-cards.css'

/**
 * One entry in the discovery wall: a tutorial to make, a real catalogue
 * pattern, or a real make from the community. Built in the homepage loader and
 * interleaved so the wall mixes categories, patterns and community work rather
 * than siloing them.
 */
export type DiscoveryItem =
  | { kind: 'tutorial'; tutorial: DiscoveryCardTutorial }
  | { kind: 'pattern'; pattern: DiscoveryPattern }
  | { kind: 'community'; tile: RecentlyMadeTile }
  | { kind: 'photo'; tile: MakerPhotoTile }

interface DiscoveryFeedProps {
  heading: string
  subheading?: string | null
  items: DiscoveryItem[]
  readerState: ReaderStateMap
  /** Optional "show me more" target — the search/browse surface. */
  moreHref?: string | null
}

/**
 * Pinterest-style masonry discovery wall. Image-led tiles of varied heights
 * (CSS columns), category mixed in for serendipity, save-on-hover on every
 * tutorial tile, and community makes woven in among them. Replaces the
 * stack of discovery rails (most-loved / new / in-season) on the homepage —
 * personal "continue making" rails stay as rails above this.
 */
export function DiscoveryFeed({
  heading,
  subheading,
  items,
  readerState,
  moreHref,
}: DiscoveryFeedProps) {
  if (items.length === 0) return null

  return (
    <section className="home-discovery">
      <header className="home-rail-header">
        <h2 className="home-rail-heading">{heading}</h2>
        {subheading && <p className="home-rail-subheading">{subheading}</p>}
      </header>

      <div className="home-discovery-masonry">
        {items.map((item) => {
          if (item.kind === 'tutorial') {
            return (
              <div className="home-discovery-item" key={`t-${item.tutorial.id}`}>
                <DiscoveryCard
                  tutorial={item.tutorial}
                  saved={readerStateFor(readerState, item.tutorial.id).bookmarked}
                />
              </div>
            )
          }
          if (item.kind === 'pattern') {
            return (
              <div className="home-discovery-item" key={`p-${item.pattern.id}`}>
                <DiscoveryPatternCard pattern={item.pattern} saved={false} />
              </div>
            )
          }
          if (item.kind === 'photo') {
            return (
              <div className="home-discovery-item" key={`ph-${item.tile.photoId}`}>
                <PinterestCard
                  href={item.tile.href}
                  imageMedia={item.tile.imageSource}
                  title={item.tile.title}
                  byline={`Photo by ${item.tile.makerHandle}`}
                />
              </div>
            )
          }
          return (
            <div className="home-discovery-item" key={`c-${item.tile.projectId}`}>
              <PinterestCard
                href={`/m/${item.tile.makerHandle}/made/${item.tile.projectId}`}
                imageMedia={item.tile.heroSource}
                title={item.tile.tutorialTitle}
                byline={`Made by ${item.tile.makerName}`}
              />
            </div>
          )
        })}
      </div>

      {moreHref && (
        <div className="home-discovery-more">
          <Link href={moreHref} className="home-discovery-more-link">
            Show me more to make &rarr;
          </Link>
        </div>
      )}
    </section>
  )
}
