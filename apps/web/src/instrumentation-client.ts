import * as Sentry from '@sentry/nextjs'

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
