'use client'

import { useState } from 'react'

/**
 * Discreet attribution tooltip for hero images on the public tutorial page.
 *
 * Renders a small © glyph at the bottom-right of the hero image. Hidden
 * (20% opacity) at rest; on hover or focus the icon goes opaque and a
 * popover surfaces with photographer + source + licence link.
 *
 * Per Rebecca's brief: "I don't want to give an attribution visibly … happy
 * to have that very small or as a little tooltip. Something discrete."
 *
 * Only render when the upstream Media row has `requiresAttribution: true`.
 * Unsplash / Pexels / Pixabay / CC0 / public-domain / AI-generated heroes
 * skip this entirely.
 */
export interface HeroAttributionData {
  creatorName: string | null
  source: string | null
  licenceCode: string | null
  licenceUrl: string | null
}

const SOURCE_LABEL: Record<string, string> = {
  unsplash: 'Unsplash',
  pexels: 'Pexels',
  wikimedia: 'Wikimedia Commons',
  pixabay: 'Pixabay',
  usda: 'USDA',
  nlm: 'National Library of Medicine',
}

const LICENCE_LABEL: Record<string, string> = {
  'CC-BY': 'CC BY',
  'CC-BY-SA': 'CC BY-SA',
  CC0: 'CC0',
  PD: 'Public domain',
}

export function HeroAttribution({ creatorName, source, licenceCode, licenceUrl }: HeroAttributionData) {
  const [open, setOpen] = useState(false)
  const sourceLabel = source ? (SOURCE_LABEL[source] ?? source) : null
  const licenceLabel = licenceCode ? (LICENCE_LABEL[licenceCode] ?? licenceCode) : null
  const credit = creatorName
    ? `Photo: ${creatorName}${sourceLabel ? ` / ${sourceLabel}` : ''}`
    : sourceLabel
      ? `Photo: ${sourceLabel}`
      : 'Photo credit'

  return (
    <div
      className={`hero-attribution${open ? ' is-open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="hero-attribution-trigger"
        aria-label="Photo credit"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ©
      </button>
      {open && (
        <div role="tooltip" className="hero-attribution-popover">
          <span>{credit}</span>
          {licenceLabel && (
            <>
              {' · '}
              {licenceUrl ? (
                <a href={licenceUrl} target="_blank" rel="noopener noreferrer">
                  {licenceLabel}
                </a>
              ) : (
                <span>{licenceLabel}</span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
