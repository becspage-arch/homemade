import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
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
