'use client'

/**
 * Shared rails for the Studio landing page  -  render below the welcome
 * hero + action cards. Each Studio passes whatever data it already has
 * server-side and gets a consistent visual rhythm in return:
 *
 *   Continue rail         -  only shown when the user has saved patterns
 *   Recently added        -  always shown (gives the Studio landing a taste
 *                          of the library without duplicating it)
 *   Designer spotlight    -  optional, shown when a designer has 2+ patterns
 *
 * Without these, the landing read as three cold action cards on cream.
 * With them, the landing matches the warmth of the category page without
 * duplicating its content.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  STUDIO_CATEGORY_CONFIG,
  type StudioCategorySlug,
} from '@/lib/studio/category-config'

interface RailCard {
  id: string
  href: string
  thumbnailUrl: string | null
  name: string
  meta?: string | null
}

interface StudioContinueRailProps {
  category: StudioCategorySlug
  items: RailCard[]
  viewAllHref?: string | null
}

/**
 * "Continue stitching / crocheting / knitting / embroidering" rail. Only
 * renders when the user has at least one saved pattern; the empty case
 * is the caller's to skip (don't render the rail with zero items).
 */
export function StudioContinueRail({
  category,
  items,
  viewAllHref,
}: StudioContinueRailProps) {
  if (items.length === 0) return null
  const config = STUDIO_CATEGORY_CONFIG[category]
  return (
    <Rail
      title={`Continue ${config.continueVerb}`}
      viewAllLabel={viewAllHref ? 'View all' : null}
      viewAllHref={viewAllHref ?? null}
    >
      {items.map((card) => (
        <RailItem key={card.id} card={card} />
      ))}
    </Rail>
  )
}

interface StudioRecentlyAddedRailProps {
  category: StudioCategorySlug
  items: RailCard[]
}

/**
 * "Recently added to the library" rail. Always renders, even when the
 * user has no saved patterns yet  -  it's the taste of the library that
 * makes the landing feel inhabited.
 */
export function StudioRecentlyAddedRail({
  category,
  items,
}: StudioRecentlyAddedRailProps) {
  if (items.length === 0) return null
  const config = STUDIO_CATEGORY_CONFIG[category]
  return (
    <Rail
      title="Recently added to the library"
      viewAllLabel="Browse the full library"
      viewAllHref={config.categoryHref}
    >
      {items.map((card) => (
        <RailItem key={card.id} card={card} />
      ))}
    </Rail>
  )
}

interface StudioDesignerSpotlightRailProps {
  category: StudioCategorySlug
  designerName: string
  designerHref: string
  designerBio?: string | null
  items: RailCard[]
}

/**
 * "Designer spotlight" rail. Optional  -  only renders when at least two
 * patterns from a single designer can be surfaced.
 */
export function StudioDesignerSpotlightRail({
  designerName,
  designerHref,
  designerBio,
  items,
}: StudioDesignerSpotlightRailProps) {
  if (items.length < 2) return null
  return (
    <section className="studio-landing-rail studio-landing-spotlight">
      <header className="studio-landing-rail-header">
        <p className="studio-landing-rail-eyebrow">Designer spotlight</p>
        <h2 className="studio-landing-rail-title">{designerName}</h2>
        {designerBio && (
          <p className="studio-landing-rail-sub">{designerBio}</p>
        )}
        <Link href={designerHref} className="studio-landing-rail-link">
          See the rest of {designerName}&rsquo;s patterns →
        </Link>
      </header>
      <ul className="studio-landing-rail-grid">
        {items.map((card) => (
          <RailItem key={card.id} card={card} />
        ))}
      </ul>
    </section>
  )
}

interface RailProps {
  title: string
  viewAllLabel: string | null
  viewAllHref: string | null
  children: ReactNode
}

function Rail({ title, viewAllLabel, viewAllHref, children }: RailProps) {
  return (
    <section className="studio-landing-rail">
      <header className="studio-landing-rail-header">
        <h2 className="studio-landing-rail-title">{title}</h2>
        {viewAllLabel && viewAllHref && (
          <Link href={viewAllHref} className="studio-landing-rail-link">
            {viewAllLabel} →
          </Link>
        )}
      </header>
      <ul className="studio-landing-rail-grid">{children}</ul>
    </section>
  )
}

function RailItem({ card }: { card: RailCard }) {
  return (
    <li className="studio-landing-rail-card">
      <Link href={card.href}>
        <div className="studio-landing-rail-card-thumb">
          {card.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.thumbnailUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="studio-landing-rail-card-thumb-placeholder" aria-hidden="true" />
          )}
        </div>
        <span className="studio-landing-rail-card-name">{card.name}</span>
        {card.meta && (
          <span className="studio-landing-rail-card-meta">{card.meta}</span>
        )}
      </Link>
    </li>
  )
}

export type { RailCard }
