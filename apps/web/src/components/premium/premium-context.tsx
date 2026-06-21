'use client'

/**
 * Client-side premium entitlement context.
 *
 * The server resolves `hasPremium(user)` once (in the (public) layout) and
 * feeds it here; client components deep in the render tree — the recipe
 * ingredient scaler, print buttons — read it with `useHasPremium()` instead
 * of threading a prop through every layer.
 *
 * Default is `false`, so a component rendered without a provider (an admin
 * preview, a stray test) degrades to the gated, non-premium experience rather
 * than leaking a premium feature.
 */

import { createContext, useContext, type ReactNode } from 'react'

const PremiumContext = createContext<boolean>(false)

export function PremiumProvider({
  isPremium,
  children,
}: {
  isPremium: boolean
  children: ReactNode
}) {
  return <PremiumContext.Provider value={isPremium}>{children}</PremiumContext.Provider>
}

/** Returns whether the current user has an active premium entitlement. */
export function useHasPremium(): boolean {
  return useContext(PremiumContext)
}
