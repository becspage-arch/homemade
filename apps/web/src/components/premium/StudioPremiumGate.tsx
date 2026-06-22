import Link from 'next/link'
import { PremiumBadge } from './PremiumBadge'
import './premium.css'

/**
 * StudioPremiumGate — shown when a signed-in Maker opens a *premium* piece of
 * content (a premium-flagged or independent-designer pattern) in a Studio
 * without an active premium entitlement. This is the access half of the
 * cross-craft content gate (`isPremiumContent`): the content page previews +
 * badges it, and opening it to work needs premium.
 *
 * Distinct from `StudioAuthGate`, which is the free sign-in prompt for
 * anonymous visitors. A signed-in free Maker sees this; an anonymous visitor
 * sees the auth gate first.
 */
export function StudioPremiumGate({
  craftLabel = 'this pattern',
  browseHref,
  browseLabel = 'Or keep browsing the library',
}: {
  craftLabel?: string
  browseHref?: string
  browseLabel?: string
}) {
  return (
    <section className="studio-auth-gate">
      <PremiumBadge />
      <h1 className="studio-auth-gate-title">Open {craftLabel} with Homemade Premium</h1>
      <p className="studio-auth-gate-lede">
        This is an independent-designer pattern — part of the premium library
        that supports the designers who make it. The free Studio, your own
        patterns, and the rest of the library stay open; premium unlocks the
        designer collection.
      </p>
      <Link href="/premium" className="studio-auth-gate-cta">
        See what premium includes
      </Link>
      {browseHref && (
        <Link href={browseHref} className="studio-auth-gate-secondary">
          {browseLabel}
        </Link>
      )}
    </section>
  )
}
