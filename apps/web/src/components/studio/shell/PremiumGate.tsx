'use client'

/**
 * PremiumGate — the soft inline upgrade block the Studio surfaces in
 * place of a gated feature when the flag is on.
 *
 * Spec: calm warm copy, single CTA, no urgency / scarcity, no popup
 * modal. The Studio chrome around it remains usable.
 */

import Link from 'next/link'
import type { GateResult } from '@/lib/studio/premium-gates'

interface PremiumGateProps {
  gate: GateResult
}

export function PremiumGate({ gate }: PremiumGateProps) {
  return (
    <aside className="studio-premium-gate">
      <p className="studio-premium-gate-overline">Homemade Premium</p>
      <h3 className="studio-premium-gate-message">{gate.message}</h3>
      <p className="studio-premium-gate-rationale">{gate.rationale}</p>
      <Link href="/premium" className="studio-premium-gate-cta">
        Upgrade to Homemade Premium
      </Link>
    </aside>
  )
}
