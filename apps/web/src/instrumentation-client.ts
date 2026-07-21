import * as Sentry from '@sentry/nextjs'
import { shouldSendSentryEvent } from '@/lib/analytics-consent'

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
    // Known third-party noise. "Object Not Found Matching Id:N, MethodName:...,
    // ParamCount:N" is emitted by a browser extension's injected content script
    // (the Outlook/Office "Safe Links" bridge), surfaced to us only as an
    // unhandled promise rejection with a plain-string value. It is not our code
    // and there is nothing on the page to fix — drop it so it stops paging.
    ignoreErrors: [/Object Not Found Matching Id/i],
    beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
      // Drop the event entirely unless the user has granted error-monitoring
      // consent via the cookie banner.
      if (!shouldSendSentryEvent()) return null
      // Belt-and-braces for the browser-extension noise above: some builds
      // surface it as a raw rejection value that ignoreErrors doesn't see.
      const values = event.exception?.values
      if (
        values?.some((v) => v.value?.includes('Object Not Found Matching Id'))
      ) {
        return null
      }
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
