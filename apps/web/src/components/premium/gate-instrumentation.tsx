'use client'

import Link from 'next/link'
import { useEffect, type ReactNode } from 'react'
import { captureClientEvent } from '@/lib/client-analytics'

/**
 * Conversion-gate instrumentation, shared by every premium gate.
 *
 * `premium_gate_viewed` fires when a gate is actually shown to a non-premium
 * user; `upgrade_cta_clicked` fires when they tap through to /premium. Both
 * carry `gate` (which specific gate) and `productArea` (cooking, sewing,
 * cross-stitch, …) so the funnel can tell us which gate converts best — the
 * "which gate drives upgrades" question.
 *
 * Consent-aware via captureClientEvent (no-op without analytics consent).
 */

export interface GateContext {
  /** Which gate, e.g. `recipe_scaling`, `creator_content`, `download`. */
  gate: string
  /** Product area, e.g. `cooking`, `sewing`, `cross_stitch`. */
  productArea?: string
}

/** Renders nothing; fires `premium_gate_viewed` once on mount. */
export function PremiumGateViewed({ gate, productArea }: GateContext) {
  useEffect(() => {
    captureClientEvent('premium_gate_viewed', { gate, productArea })
  }, [gate, productArea])
  return null
}

/** The gate's CTA link — fires `upgrade_cta_clicked` before navigating. */
export function UpgradeCtaLink({
  gate,
  productArea,
  href,
  className,
  children,
}: GateContext & { href: string; className?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        captureClientEvent('upgrade_cta_clicked', { gate, productArea })
        captureClientEvent('premium_gate_cta_clicked', { gate, productArea })
      }}
    >
      {children}
    </Link>
  )
}
