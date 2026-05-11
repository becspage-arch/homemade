import * as Sentry from '@sentry/nextjs'

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
