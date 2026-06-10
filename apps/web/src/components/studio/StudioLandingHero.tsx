/**
 * StudioLandingHero  -  shared eyebrow + heading + lede that sits above the
 * action cards on every Studio landing page.
 *
 * Replaces the three near-duplicate hero blocks the four Studios were
 * each carrying (studio-empty-hero, crochet-studio-empty-hero,
 * knitting-studio-empty-hero, needlework-studio-empty-hero) with one
 * surface so the copy + register stays consistent.
 *
 * Signed-in users get "Welcome back, [Name]."  -  signed-out users get
 * "Welcome to the [Category] Studio." per the locked microcopy. The
 * subtitle is passed in by the host so each Studio can describe its
 * own start paths without forcing one phrasing on everyone.
 */

import type { StudioCategorySlug } from '@/lib/studio/category-config'
import { STUDIO_CATEGORY_CONFIG } from '@/lib/studio/category-config'

interface StudioLandingHeroProps {
  category: StudioCategorySlug
  signedIn: boolean
  userName: string | null
  /** Subtitle text. Each Studio supplies its own  -  the start paths are
   *  per-Studio so the lede phrasing is too. */
  lede: string
}

export function StudioLandingHero({
  category,
  signedIn,
  userName,
  lede,
}: StudioLandingHeroProps) {
  const config = STUDIO_CATEGORY_CONFIG[category]
  const firstName = userName?.split(' ')[0] ?? null
  const heading = signedIn
    ? `Welcome back${firstName ? `, ${firstName}` : ''}.`
    : `Welcome to the ${config.studioName}.`

  return (
    <div className="studio-landing-hero">
      <p className="studio-landing-eyebrow">{config.studioName.toUpperCase()}</p>
      <h1 className="studio-landing-heading">{heading}</h1>
      <p className="studio-landing-lede">{lede}</p>
    </div>
  )
}
