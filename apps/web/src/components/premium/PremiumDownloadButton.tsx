'use client'

/**
 * PremiumDownloadButton — the universal print / download gate.
 *
 * Printing or downloading anything (a recipe, a shopping list, a chart PDF, a
 * template) is a premium action across every category. For premium users this
 * runs the real action — either an href download or an `onAction` callback
 * (e.g. `window.print`). For everyone else it reveals a calm inline upgrade
 * block in place of firing the action.
 *
 * Premium status comes from `useHasPremium()` unless `isPremium` is passed in.
 * Note: this is the client-side UX gate; the authoritative enforcement for any
 * server-generated file (PDF routes) lives in the route handler itself.
 */

import { useState, type ReactNode } from 'react'
import { UpgradeBlock } from './UpgradeBlock'
import { useHasPremium } from './premium-context'

export function PremiumDownloadButton({
  children,
  className,
  href,
  onAction,
  isPremium,
  gateMessage = 'Printing and downloading are part of Homemade Premium.',
  gateRationale = 'Premium unlocks a clean PDF or print of any recipe, list, or pattern.',
  productArea,
}: {
  children: ReactNode
  className?: string
  /** Download URL — used when the action is a server-generated file. */
  href?: string
  /** Callback action — e.g. () => window.print(). */
  onAction?: () => void
  isPremium?: boolean
  gateMessage?: string
  gateRationale?: string
  /** Product area for gate analytics, e.g. `cooking`, `cross_stitch`. */
  productArea?: string
}) {
  const ctxPremium = useHasPremium()
  const premium = isPremium ?? ctxPremium
  const [showGate, setShowGate] = useState(false)

  if (premium) {
    if (href) {
      return (
        <a className={className} href={href} target="_blank" rel="noopener">
          {children}
        </a>
      )
    }
    return (
      <button type="button" className={className} onClick={onAction}>
        {children}
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        className={className}
        aria-expanded={showGate}
        onClick={() => setShowGate((v) => !v)}
      >
        {children}
      </button>
      {showGate && (
        <UpgradeBlock
          message={gateMessage}
          rationale={gateRationale}
          compact
          gate="download"
          productArea={productArea}
        />
      )}
    </>
  )
}
