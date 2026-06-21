import { Sparkles } from 'lucide-react'
import './premium.css'

/**
 * PremiumBadge — the marker shown on premium items in search results and
 * category / listing grids, so a premium pattern or recipe reads as premium
 * before you open it. Premium content is never hidden, just badged.
 *
 * `iconOnly` renders a compact sparkle pill for dense card corners; the
 * default shows the word too.
 */
export function PremiumBadge({
  iconOnly = false,
  className = '',
}: {
  iconOnly?: boolean
  className?: string
}) {
  return (
    <span
      className={`premium-badge${iconOnly ? ' is-icon-only' : ''}${className ? ` ${className}` : ''}`}
      title="Homemade Premium"
      aria-label="Homemade Premium"
    >
      <Sparkles strokeWidth={1.8} aria-hidden="true" />
      {!iconOnly && <span>Premium</span>}
    </span>
  )
}
