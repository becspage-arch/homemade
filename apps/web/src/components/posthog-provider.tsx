'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'
import { usePathname, useSearchParams } from 'next/navigation'
import { applyAnalyticsConsent } from '@/lib/analytics-consent'

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

let initialized = false

function init() {
  if (initialized || typeof window === 'undefined' || !KEY) return
  initialized = true
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // we capture pageviews manually below to handle App Router transitions
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    person_profiles: 'identified_only',
    autocapture: false,
    // Start opted out so NOTHING captures before the cookie banner gets an
    // answer. The consent wrapper flips this to opt-in only once analytics
    // consent is granted. This single SDK-level switch gates every capture —
    // pageviews, identify, and the funnel events fired directly below.
    opt_out_capturing_by_default: true,
  })
  // Expose the live instance so the consent wrappers (installed by the
  // cookie banner) can reach it via `window.posthog` and opt in/out as the
  // banner choice changes.
  ;(window as unknown as { posthog?: typeof posthog }).posthog = posthog
  // Reconcile with whatever consent is already stored (e.g. a returning
  // visitor who accepted on a previous visit) — opts in if granted, stays
  // opted out otherwise.
  applyAnalyticsConsent()
}

export function PostHogProvider() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (!KEY || !isLoaded) return
    if (user) {
      posthog.identify(user.id, {
        name: user.fullName ?? undefined,
      })
      // Fire `signin_completed` once per browser session so the activation
      // funnel sees the event without flooding on every navigation.
      try {
        const fired = window.sessionStorage.getItem('homemade-signin-fired')
        if (fired !== '1') {
          window.sessionStorage.setItem('homemade-signin-fired', '1')
          posthog.capture('signin_completed', { clerkId: user.id })
        }
      } catch {
        // sessionStorage may be unavailable; tolerate.
      }
    } else if (initialized) {
      // signed out — fire the matching event (best-effort) and reset so we
      // don't keep firing identified events.
      try {
        posthog.capture('signout_completed')
        window.sessionStorage.removeItem('homemade-signin-fired')
      } catch {
        // ignore
      }
      posthog.reset()
    }
  }, [user, isLoaded])

  useEffect(() => {
    if (!KEY || !initialized || !pathname) return
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  // Pure analytics tracker — renders nothing. Kept out of the children tree so
  // the page subtree below isn't forced behind this component's Suspense
  // boundary (which exists only because useSearchParams() requires one). A page
  // wrapped in that boundary streams its shell at 200 before notFound() can set
  // a 404 — the soft-404 SEO bug. See layout.tsx.
  return null
}
