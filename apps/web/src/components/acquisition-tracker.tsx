'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  ACQUISITION_STORAGE_KEY,
  deriveChannel,
  deriveDeviceClass,
  parseUtm,
  readStoredAcquisition,
  type AcquisitionData,
} from '@/lib/acquisition'
import { captureClientEvent } from '@/lib/client-analytics'
import { persistAcquisitionIfMissing } from '@/lib/acquisition-actions'

const PERSIST_DEDUPE_KEY = 'homemade-acquisition-persisted'

/**
 * Captures UTM + referrer on first visit and persists to localStorage so the
 * Clerk webhook can read it when a user signs up later. Idempotent — only
 * the first visit's data is kept, so a user who arrives via UTM today and
 * signs up next week still gets attributed correctly.
 *
 * Mounted in the root layout so it runs on every page entry (including
 * deep links from emails / social posts).
 */
export function AcquisitionTracker() {
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(ACQUISITION_STORAGE_KEY)
      if (existing) return // first-touch already captured

      const url = new URL(window.location.href)
      const utm = parseUtm(url.searchParams)
      const referrer = document.referrer || null
      const channel = deriveChannel({
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        referrer,
      })

      const data: AcquisitionData = {
        ...utm,
        referrer,
        landingPath: url.pathname || '/',
        acquisitionChannel: channel,
        firstSeenAt: new Date().toISOString(),
      }

      window.localStorage.setItem(ACQUISITION_STORAGE_KEY, JSON.stringify(data))

      captureClientEvent('acquisition_captured', {
        ...utm,
        referrer,
        landingPath: data.landingPath,
        acquisitionChannel: channel,
        deviceClass: deriveDeviceClass(navigator.userAgent),
      })
    } catch {
      // localStorage may be unavailable (private mode); the next page load
      // will retry. The trade-off is that those users go un-attributed —
      // acceptable for a tiny share.
    }
  }, [])

  // Once a user signs in, push the stored acquisition data to the server so
  // it lands on their User row. Idempotent: the server action no-ops if a
  // cohort week is already set. Deduped per session so we don't hammer the
  // server with a redundant write on every navigation.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    try {
      const sentThisSession = window.sessionStorage.getItem(PERSIST_DEDUPE_KEY)
      if (sentThisSession === '1') return
      const acquisition = readStoredAcquisition()
      window.sessionStorage.setItem(PERSIST_DEDUPE_KEY, '1')
      void persistAcquisitionIfMissing({
        utmSource: acquisition?.utmSource ?? null,
        utmMedium: acquisition?.utmMedium ?? null,
        utmCampaign: acquisition?.utmCampaign ?? null,
        utmContent: acquisition?.utmContent ?? null,
        utmTerm: acquisition?.utmTerm ?? null,
        referrer: acquisition?.referrer ?? null,
        acquisitionChannel: acquisition?.acquisitionChannel ?? null,
      })
    } catch {
      // sessionStorage unavailable — try again next render at worst.
    }
  }, [isLoaded, isSignedIn])

  return null
}
