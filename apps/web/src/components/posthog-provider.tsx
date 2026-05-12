'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'
import { usePathname, useSearchParams } from 'next/navigation'

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
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>
}
