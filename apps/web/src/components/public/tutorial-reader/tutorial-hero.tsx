import Link from 'next/link'
import type { ReactNode } from 'react'

import { HeroAttribution, type HeroAttributionData } from '../hero-attribution'

interface TutorialHeroProps {
  heroUrl: string | null
  heroAlt: string | null
  /** When set, renders the small © tooltip over the hero. */
  heroAttribution?: HeroAttributionData | null
  /** "BAKING" or "BAKING · CAKES" overline above the title. */
  categoryOverline: string
  title: string
  standfirst: string | null
  /** "By Homemade" / "By {Maker}" inside the sage scrim. */
  bylineSlot: ReactNode
  /** Primary action — anchor href ("#ingredients") for in-page jump. */
  primaryCtaLabel: string
  primaryCtaHref: string
  /** Secondary ghost actions next to the primary CTA (bookmark, share). */
  actionsSlot?: ReactNode
}

/**
 * Tutorial page hero. Full-bleed photograph; sage scrim card bottom-left
 * with category overline, title, italic standfirst, byline, primary CTA
 * pill, and ghost action buttons. Mirrors the homepage / category hero
 * shape so the brand register carries onto the tutorial reader.
 *
 * The hero photo renders as an <img> rather than a background-image so
 * the browser can pick the right size from `heroUrl` (which is already
 * the responsive `width=1600,format=auto` CDN variant for above-the-
 * fold delivery).
 */
export function TutorialHero({
  heroUrl,
  heroAlt,
  heroAttribution,
  categoryOverline,
  title,
  standfirst,
  bylineSlot,
  primaryCtaLabel,
  primaryCtaHref,
  actionsSlot,
}: TutorialHeroProps) {
  return (
    <section className="tutorial-hero-zone">
      <div className="tutorial-hero-feature">
        <span className="tutorial-hero-image-wrap">
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="tutorial-hero-image"
              src={heroUrl}
              alt={heroAlt ?? ''}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <span className="tutorial-hero-image placeholder" aria-hidden="true" />
          )}
          {heroAttribution && <HeroAttribution {...heroAttribution} />}
        </span>
        <span className="tutorial-hero-gradient" aria-hidden="true" />
        <div className="tutorial-hero-content">
          <span className="tutorial-hero-overline">{categoryOverline}</span>
          <h1 className="tutorial-hero-title">{title}</h1>
          {standfirst && (
            <p className="tutorial-hero-standfirst">{standfirst}</p>
          )}
          {bylineSlot && (
            <span className="tutorial-hero-byline">{bylineSlot}</span>
          )}
          <div className="tutorial-hero-actions">
            <Link href={primaryCtaHref} className="tutorial-hero-cta">
              {primaryCtaLabel}
            </Link>
            {actionsSlot}
          </div>
        </div>
      </div>
    </section>
  )
}
