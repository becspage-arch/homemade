'use client'

/**
 * The "log in free to get the pattern" control for a pattern-craft page.
 *
 * Reusable across cross-stitch / crochet / needlework: the page renders the
 * SEO shop window (hero, photo, description, materials, stitches, size) and
 * drops this in where the usable pattern would be.
 *
 *  - "Log in" → inline Clerk sign-in modal (no redirect-away); returns to this
 *    same page on success, where the signed-in render reveals the pattern.
 *  - "Sign up free" → opens the in-page premium overlay (the real /premium page
 *    embedded) so we upsell premium at the conversion moment while keeping the
 *    visitor here. The core pattern stays FREE-with-login; premium is the
 *    optional upgrade surfaced there.
 */

import { useState } from 'react'
import { SignInButton } from '@clerk/nextjs'
import { PremiumOverlay } from './PremiumOverlay'
import './pattern-access.css'

interface PatternUnlockCtaProps {
  /** e.g. "this embroidery pattern" — names what they unlock. */
  craftLabel?: string
  /** Path to return to after auth (this pattern page). */
  returnTo: string
  /** What logging in reveals, shown as a short checklist. */
  unlocks?: string[]
}

const DEFAULT_UNLOCKS = [
  'The transfer template to print at home',
  'The full step-by-step stitch guide',
  'The interactive Studio to track your progress',
]

export function PatternUnlockCta({
  craftLabel = 'this pattern',
  returnTo,
  unlocks = DEFAULT_UNLOCKS,
}: PatternUnlockCtaProps) {
  const [premiumOpen, setPremiumOpen] = useState(false)

  return (
    <aside className="pattern-unlock" aria-label="Log in to get the pattern">
      <p className="pattern-unlock-overline">Free with an account</p>
      <h2 className="pattern-unlock-title">Log in free to get {craftLabel}</h2>
      <ul className="pattern-unlock-list">
        {unlocks.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
      <div className="pattern-unlock-actions">
        <SignInButton mode="modal" forceRedirectUrl={returnTo} signUpForceRedirectUrl={returnTo}>
          <button type="button" className="pattern-unlock-cta primary">
            Log in
          </button>
        </SignInButton>
        <button
          type="button"
          className="pattern-unlock-cta ghost"
          onClick={() => setPremiumOpen(true)}
        >
          Sign up free
        </button>
      </div>
      <p className="pattern-unlock-foot">
        It only takes a moment, and your progress saves across every device.
      </p>
      <PremiumOverlay open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </aside>
  )
}
