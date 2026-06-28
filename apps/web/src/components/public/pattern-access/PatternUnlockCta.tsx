'use client'

/**
 * The "log in free to get the pattern" control for a pattern-craft page.
 *
 * Reusable across cross-stitch / crochet / needlework: the page renders the
 * SEO shop window (hero, photo, description, materials, stitches, size) and
 * drops this in where the usable pattern would be. It offers BOTH log in and
 * sign up as INLINE Clerk modals (mode="modal") — no redirect-away first, which
 * is what irritates people — and on success Clerk returns the visitor to the
 * SAME page (`returnTo`), where the now-signed-in render reveals the diagram,
 * the printable template and the Studio.
 *
 * The core pattern is FREE-with-login: signing up gives full access. The premium
 * tier (grading / create-your-own / independent-designer patterns) is a separate,
 * optional upsell linked beneath — not a gate on this pattern.
 */

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
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
        <SignInButton
          mode="modal"
          forceRedirectUrl={returnTo}
          signUpForceRedirectUrl={returnTo}
        >
          <button type="button" className="pattern-unlock-cta primary">
            Log in
          </button>
        </SignInButton>
        <SignUpButton
          mode="modal"
          forceRedirectUrl={returnTo}
          signInForceRedirectUrl={returnTo}
        >
          <button type="button" className="pattern-unlock-cta ghost">
            Sign up free
          </button>
        </SignUpButton>
      </div>
      <p className="pattern-unlock-foot">
        It only takes a moment, and your progress saves across every device.{' '}
        <Link href="/premium" className="pattern-unlock-premium-link">
          See Premium
        </Link>
      </p>
    </aside>
  )
}
