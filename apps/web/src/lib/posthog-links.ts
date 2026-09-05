/**
 * Admin-only deep link from a Maker's account into their PostHog person page.
 * `NEXT_PUBLIC_POSTHOG_HOST` is the ingestion host (eu.i.posthog.com); the
 * dashboard app lives one subdomain over (eu.posthog.com). Every identify
 * call in this app uses the Clerk id as the PostHog distinct id (see
 * `posthog-provider.tsx` and the Clerk webhook), so that's what this links on.
 */

function appHost(): string {
  const ingestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'
  return ingestHost.replace(/\/\/i\./, '//').replace(/\/$/, '')
}

/**
 * A direct person-page link when `POSTHOG_PROJECT_ID` is configured;
 * otherwise a person-search URL by distinct id, which PostHog resolves
 * within whichever project the signed-in admin has open.
 */
export function posthogPersonUrl(distinctId: string): string {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const host = appHost()
  if (projectId) {
    return `${host}/project/${projectId}/person/${encodeURIComponent(distinctId)}`
  }
  return `${host}/search?q=${encodeURIComponent(distinctId)}`
}
