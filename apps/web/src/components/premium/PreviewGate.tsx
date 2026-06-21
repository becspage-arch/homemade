import type { ReactNode } from 'react'
import { UpgradeBlock } from './UpgradeBlock'
import './premium.css'

/**
 * PreviewGate — the premium-content preview model. Premium users see the whole
 * thing; everyone else sees the `preview` (the first part of the page) fading
 * out under a calm upgrade block, so the value is visible but the rest is held.
 *
 * Server-safe: premium status is passed in (content pages are server
 * components that already resolved `hasPremium(user)`).
 */
export function PreviewGate({
  isPremium,
  preview,
  full,
  message,
  rationale,
}: {
  isPremium: boolean
  /** Shown to non-premium users — the opening part of the content. */
  preview: ReactNode
  /** Shown to premium users — the whole content. */
  full: ReactNode
  message: string
  rationale?: string
}) {
  if (isPremium) return <>{full}</>
  return (
    <div className="premium-preview">
      <div className="premium-preview-fade">{preview}</div>
      <UpgradeBlock message={message} rationale={rationale} />
    </div>
  )
}
