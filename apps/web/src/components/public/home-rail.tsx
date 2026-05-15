import Link from 'next/link'
import type { ReactNode } from 'react'

interface HomeRailProps {
  heading: string
  /** Optional small body line under the heading. */
  subheading?: string | null
  /** Optional "see all" link target. */
  seeAllHref?: string | null
  seeAllLabel?: string
  children: ReactNode
}

/**
 * Horizontal rail with a brand-register heading. Cards inside scroll
 * horizontally on mobile (touch + native momentum) and wrap into a grid on
 * desktop. Empty rails should not call this — the caller guards.
 */
export function HomeRail({
  heading,
  subheading,
  seeAllHref,
  seeAllLabel,
  children,
}: HomeRailProps) {
  return (
    <section className="home-rail">
      <header className="home-rail-header">
        <h2 className="home-rail-heading">{heading}</h2>
        {subheading && <p className="home-rail-subheading">{subheading}</p>}
        {seeAllHref && (
          <Link href={seeAllHref} className="home-rail-see-all">
            {seeAllLabel ?? 'See all →'}
          </Link>
        )}
      </header>
      <div className="home-rail-scroll">
        <div className="home-rail-track">{children}</div>
      </div>
    </section>
  )
}
