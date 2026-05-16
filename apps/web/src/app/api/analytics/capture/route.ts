import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@homemade/db'
import * as Sentry from '@sentry/nextjs'
import { categoryFor } from '@/lib/analytics-events'
import { getOrCreateSessionId } from '@/lib/analytics-session'
import { deriveDeviceClass } from '@/lib/acquisition'

/**
 * Client-side dual-fire ingress.
 *
 * `captureClientEvent` POSTs here in parallel with its PostHog capture so
 * the event lands in our `AnalyticsEvent` table for the admin dashboards.
 *
 * The endpoint is intentionally permissive — it accepts any event shape
 * (analytics taxonomy lives in code, not in a runtime schema) and never
 * returns user-facing errors that would surface to the visitor. A bad
 * payload is dropped silently and logged to Sentry.
 *
 * Cohort week / acquisition channel are looked up server-side from the
 * User row when the caller is signed in — the client cannot fake them.
 */

const MAX_BODY_SIZE = 32 * 1024 // 32 KB — any single event larger than this is suspicious

interface ClientCapturePayload {
  event?: unknown
  properties?: unknown
  url?: unknown
  referrer?: unknown
}

export async function POST(req: Request) {
  let payload: ClientCapturePayload
  try {
    const text = await req.text()
    if (text.length > MAX_BODY_SIZE) return NextResponse.json({ ok: false }, { status: 413 })
    payload = JSON.parse(text || '{}')
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (typeof payload.event !== 'string' || payload.event.length === 0 || payload.event.length > 80) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const event = payload.event
  const properties =
    payload.properties && typeof payload.properties === 'object'
      ? (payload.properties as Record<string, unknown>)
      : null
  const url = typeof payload.url === 'string' ? payload.url.slice(0, 2048) : null
  const referrer = typeof payload.referrer === 'string' ? payload.referrer.slice(0, 2048) : null

  let pathname: string | null = null
  if (url) {
    try {
      pathname = new URL(url).pathname
    } catch {
      pathname = url.startsWith('/') ? url : null
    }
  }

  const h = await headers()
  const userAgent = h.get('user-agent')
  const country = h.get('cf-ipcountry')
  const deviceClass = deriveDeviceClass(userAgent)

  let sessionId: string
  try {
    sessionId = await getOrCreateSessionId()
  } catch {
    sessionId = 'capture'
  }

  let clerkUserId: string | null = null
  let cohortWeek: string | null = null
  let acquisitionChannel: string | null = null
  let utmSource: string | null = null
  let utmMedium: string | null = null
  let utmCampaign: string | null = null

  try {
    const { userId } = await auth()
    clerkUserId = userId ?? null
    if (clerkUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
          signupCohortWeek: true,
          acquisitionChannel: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
        },
      })
      if (user) {
        cohortWeek = user.signupCohortWeek
        acquisitionChannel = user.acquisitionChannel
        utmSource = user.utmSource
        utmMedium = user.utmMedium
        utmCampaign = user.utmCampaign
      }
    }
  } catch {
    // Clerk middleware not active on this request — treat as anonymous.
  }

  try {
    await prisma.analyticsEvent.create({
      data: {
        clerkUserId,
        sessionId,
        event,
        category: categoryFor(event),
        properties: (properties as never) ?? null,
        url,
        pathname,
        referrer,
        userAgent,
        country,
        deviceClass,
        cohortWeek,
        acquisitionChannel,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    })
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'analytics', sink: 'api-capture' } })
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
