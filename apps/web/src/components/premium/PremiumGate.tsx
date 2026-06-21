'use client'

/**
 * PremiumGate — render the real feature to premium users, the gated fallback
 * (usually an <UpgradeBlock />) to everyone else.
 *
 * Premium status comes from `useHasPremium()` by default, so client features
 * deep in the tree need no props. Pass `isPremium` explicitly when the value
 * is already known server-side and handed down (e.g. the Studio threads it
 * through as a prop).
 */

import type { ReactNode } from 'react'
import { useHasPremium } from './premium-context'

export function PremiumGate({
  children,
  fallback,
  isPremium,
}: {
  children: ReactNode
  fallback: ReactNode
  isPremium?: boolean
}) {
  const ctxPremium = useHasPremium()
  const premium = isPremium ?? ctxPremium
  return <>{premium ? children : fallback}</>
}
