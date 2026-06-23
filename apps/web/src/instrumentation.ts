import * as Sentry from '@sentry/nextjs'
import { shouldSendSentryEvent } from '@/lib/analytics-consent'

export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      beforeSend: scrubEvent,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      beforeSend: scrubEvent,
    })
  }
}

export const onRequestError = Sentry.captureRequestError

const ALLOWED_REQUEST_HEADERS = new Set([
  'user-agent',
  'referer',
  'x-forwarded-host',
  'x-vercel-id',
])

function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  // Consent gate. On the server this returns true (server errors aren't tied
  // to a single visitor's consent), so it's a no-op here today; wiring it in
  // keeps every Sentry config — browser, node, edge — behind one predicate.
  if (!shouldSendSentryEvent()) return null
  if (event.request) {
    delete event.request.cookies
    delete event.request.data
    if (event.request.headers) {
      const filtered: Record<string, string> = {}
      for (const [k, v] of Object.entries(event.request.headers)) {
        if (ALLOWED_REQUEST_HEADERS.has(k.toLowerCase()) && typeof v === 'string') {
          filtered[k] = v
        }
      }
      event.request.headers = filtered
    }
  }
  if (event.user) {
    delete event.user.ip_address
    delete event.user.email
  }
  return event
}
