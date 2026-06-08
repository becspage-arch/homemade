import * as Sentry from '@sentry/nextjs'

// Clear the chunk-error reload guard once the page has rendered successfully.
// The guard prevents a reload loop when a NEW build is also broken; clearing
// it on a healthy load means a later chunk error in the same long-open tab
// still gets one auto-recovery rather than going straight to the fallback.
if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem('homemade-chunk-reload-attempted')
  } catch {
    // sessionStorage unavailable (private mode etc.) — nothing to clear.
  }
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // PostHog covers UX telemetry. Sentry stays on for error reporting only —
    // tracesSampleRate: 0 disables tracing at runtime, and filtering
    // BrowserTracing out of default integrations stops it initialising at all.
    tracesSampleRate: 0,
    integrations: (defaults) =>
      defaults.filter((i) => i.name !== 'BrowserTracing'),
    sendDefaultPii: false,
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
    beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
      if (event.request) {
        delete event.request.cookies
        delete event.request.data
      }
      if (event.user) {
        delete event.user.ip_address
        delete event.user.email
      }
      return event
    },
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
