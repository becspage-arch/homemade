'use client'

/**
 * Visual hack composer landing grid. Each card is a design picker that
 * opens the per-design hack surface. Anonymous users can navigate to the
 * composer (per the free-translation rule); saving a hack still requires
 * sign-in (handled at the composer's save button).
 *
 * When the premium gate is active and the user isn't premium, the CTA
 * shows a gate explanation chip instead of navigating, and fires the
 * gate-encountered event.
 */

import Link from 'next/link'
import { useCallback } from 'react'

import { captureClientEvent } from '@/lib/client-analytics'

export interface HackLandingCard {
  slug: string
  name: string
  description: string
  skillLabel: string
  genderLabel: string
  showcaseSvg: string | null
  handleCount: number
}

interface Props {
  cards: HackLandingCard[]
  signedIn: boolean
  gateActive: boolean
}

export function HackLandingCards({ cards, signedIn, gateActive }: Props) {
  const onPickDesign = useCallback(
    (slug: string) => {
      captureClientEvent('sewing_hack_composer_opened', {
        designSlug: slug,
        signed_in: signedIn,
        surface: 'card',
      })
    },
    [signedIn],
  )

  const onGateBlocked = useCallback(
    (slug: string) => {
      captureClientEvent('sewing_hack_premium_gate_encountered', {
        designSlug: slug,
        signed_in: signedIn,
        surface: 'card',
      })
    },
    [signedIn],
  )

  return (
    <div className="sew-pers-grid">
      {cards.map((card) => (
        <article key={card.slug} className="sew-pers-card">
          <div
            className="sew-pers-card-illustration"
            role="img"
            aria-label={`${card.name} illustration`}
          >
            {card.showcaseSvg ? (
              <div
                className="sew-pers-card-illustration-svg"
                dangerouslySetInnerHTML={{ __html: card.showcaseSvg }}
              />
            ) : (
              <div className="sew-pers-card-illustration-fallback">
                Preview not available
              </div>
            )}
          </div>
          <div className="sew-pers-card-body">
            <div className="sew-pers-card-tags">
              <span className="sew-pers-card-tag">{card.genderLabel}</span>
              <span className="sew-pers-card-tag">{card.skillLabel}</span>
              {card.handleCount > 0 ? (
                <span className="sew-pers-card-tag">
                  {card.handleCount} hack{card.handleCount === 1 ? '' : 's'}
                </span>
              ) : null}
            </div>
            <h2 className="sew-pers-card-title">{card.name}</h2>
            <p className="sew-pers-card-description">{card.description}</p>
            <div className="sew-pers-card-actions">
              {gateActive ? (
                <button
                  type="button"
                  className="sew-pers-card-cta primary"
                  onClick={() => onGateBlocked(card.slug)}
                >
                  Upgrade to Homemade Premium
                </button>
              ) : (
                <Link
                  className="sew-pers-card-cta primary"
                  href={`/studio/sewing/hack/${encodeURIComponent(card.slug)}`}
                  onClick={() => onPickDesign(card.slug)}
                >
                  Open hack composer
                </Link>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
