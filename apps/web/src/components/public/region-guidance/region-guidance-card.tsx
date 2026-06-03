import type { ReactElement } from 'react'
import type { RegionGuidanceCardProps } from '@/lib/region-guidance'

/**
 * "Where this works best" — collapsible region guidance card shown above
 * the tutorial body when the reader hasn't set a location.
 *
 * Phase location_climate_paper_001.
 *
 * Server-rendered. Uses the native `<details>` disclosure widget so it's
 * zero-JS and keyboard-accessible by default. No client hydration cost.
 *
 * The collapsed summary is rendered inside `<summary>`; the expanded
 * body unfolds beneath. Authors don't write any of this language; the
 * helper in `apps/web/src/lib/region-guidance.ts` composes it from the
 * tutorial's `primaryRegionWrittenFor` + `alsoGrowsIn` fields.
 */
export function RegionGuidanceCard({
  card,
}: {
  card: RegionGuidanceCardProps
}): ReactElement {
  return (
    <details
      className="region-guidance-card"
      data-testid="region-guidance-card"
    >
      <summary>
        <span className="region-guidance-card-label">Where this works best</span>
        <span className="region-guidance-card-summary">{card.collapsedSummary}</span>
      </summary>
      <div className="region-guidance-card-body">
        <p className="region-guidance-card-best-for">{card.bestForLine}</p>
        <p className="region-guidance-card-also-works">{card.alsoWorksLine}</p>
        <p className="region-guidance-card-trickier">{card.trickierLine}</p>
        <p className="region-guidance-card-heading">
          Not in the region above? Here&apos;s how to adjust the timing.
        </p>
        <ul className="region-guidance-card-bullets">
          {card.adjustmentBullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
        <p className="region-guidance-card-frost">{card.frostHint}</p>
      </div>
    </details>
  )
}
