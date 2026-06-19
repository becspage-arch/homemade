import Link from 'next/link'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import type { ContinueMakingPattern } from '@/lib/homepage-data'

import './home-cards/home-cards.css'

/**
 * A single in-progress pattern in the homepage "Continue where you left off"
 * rail. Reuses the HomeCard classes so it sits cleanly among the tutorial
 * cards, but links straight back into the Studio the maker was stitching in.
 */
export function PatternResumeCard({ pattern }: { pattern: ContinueMakingPattern }) {
  return (
    <div className="home-card">
      <Link href={studioHref(pattern.type, pattern.id)} className="home-card-link">
        <span className="home-card-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="home-card-image"
            src={patternHeroUrl({ id: pattern.id, hero: pattern.hero }, 'card')}
            alt={pattern.name}
            sizes="(min-width: 900px) 28vw, (min-width: 600px) 44vw, 80vw"
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className="home-card-body">
          <span className="home-card-overline">Pattern · in progress</span>
          <span className="home-card-title">{pattern.name}</span>
        </span>
      </Link>
    </div>
  )
}

/** Continue stitching → open the Studio the pattern belongs to. */
function studioHref(type: string, patternId: string): string {
  switch (type) {
    case 'KNITTING_CHART':
      return `/studio/knitting?patternId=${patternId}`
    case 'CROCHET_CHART':
      return `/studio/crochet?patternId=${patternId}`
    default:
      return `/studio/cross-stitch?patternId=${patternId}`
  }
}
