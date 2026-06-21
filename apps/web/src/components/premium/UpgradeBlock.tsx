import Link from 'next/link'
import './premium.css'

/**
 * UpgradeBlock — the calm inline upsell every gate surfaces in place of a
 * premium feature. One overline, one message, one rationale, one CTA. No
 * popup, no urgency, no scarcity (the locked gating-copy rule).
 *
 * Server-safe (just markup + Link), so it renders inside server content pages
 * and client feature components alike.
 */
export function UpgradeBlock({
  message,
  rationale,
  cta = 'Upgrade to Homemade Premium',
  href = '/premium',
  compact = false,
}: {
  message: string
  rationale?: string
  cta?: string
  href?: string
  compact?: boolean
}) {
  return (
    <aside className={`premium-upgrade-block${compact ? ' is-compact' : ''}`}>
      <p className="premium-upgrade-overline">Homemade Premium</p>
      <p className="premium-upgrade-message">{message}</p>
      {rationale && <p className="premium-upgrade-rationale">{rationale}</p>}
      <Link href={href} className="premium-upgrade-cta">
        {cta}
      </Link>
    </aside>
  )
}
