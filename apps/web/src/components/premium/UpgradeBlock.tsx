import Link from 'next/link'
import { PremiumGateViewed, UpgradeCtaLink } from './gate-instrumentation'
import './premium.css'

/**
 * UpgradeBlock — the calm inline upsell every gate surfaces in place of a
 * premium feature. One overline, one message, one rationale, one CTA. No
 * popup, no urgency, no scarcity (the locked gating-copy rule).
 *
 * Server-safe (just markup + Link), so it renders inside server content pages
 * and client feature components alike.
 *
 * Pass `gate` (and ideally `productArea`) to instrument the conversion funnel:
 * a `premium_gate_viewed` fires when the block shows and `upgrade_cta_clicked`
 * when the CTA is tapped. Omit `gate` and the block stays pure server markup.
 */
export function UpgradeBlock({
  message,
  rationale,
  cta = 'Upgrade to Homemade Premium',
  href = '/premium',
  compact = false,
  gate,
  productArea,
}: {
  message: string
  rationale?: string
  cta?: string
  href?: string
  compact?: boolean
  gate?: string
  productArea?: string
}) {
  return (
    <aside className={`premium-upgrade-block${compact ? ' is-compact' : ''}`}>
      {gate && <PremiumGateViewed gate={gate} productArea={productArea} />}
      <p className="premium-upgrade-overline">Homemade Premium</p>
      <p className="premium-upgrade-message">{message}</p>
      {rationale && <p className="premium-upgrade-rationale">{rationale}</p>}
      {gate ? (
        <UpgradeCtaLink
          gate={gate}
          productArea={productArea}
          href={href}
          className="premium-upgrade-cta"
        >
          {cta}
        </UpgradeCtaLink>
      ) : (
        <Link href={href} className="premium-upgrade-cta">
          {cta}
        </Link>
      )}
    </aside>
  )
}
