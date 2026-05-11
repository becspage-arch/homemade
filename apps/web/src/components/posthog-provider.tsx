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
      const primaryEmail = user.primaryEmailAddress?.emailAddress
      posthog.identify(user.id, {
        email: primaryEmail,
        name: user.fullName ?? undefined,
      })
    } else if (initialized) {
      // signed out — reset so we don't keep firing identified events
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
