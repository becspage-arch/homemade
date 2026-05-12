/**
 * Acquisition + channel attribution.
 *
 * Captured client-side on first visit (see `components/acquisition-tracker.tsx`),
 * persisted to localStorage as the `homemade-acquisition` JSON, and pushed to
 * `User.utm*` / `User.acquisitionChannel` on first signup (Clerk webhook).
 *
 * Channel inference is a small lookup table — accurate enough for the
 * acquisition / activation funnels we care about pre-launch, and easy to
 * extend as new sources appear.
 */

export const ACQUISITION_STORAGE_KEY = 'homemade-acquisition'

export interface AcquisitionData {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  referrer: string | null
  landingPath: string | null
  acquisitionChannel: AcquisitionChannel
  firstSeenAt: string // ISO timestamp
}

export type AcquisitionChannel =
  | 'organic'
  | 'direct'
  | 'paid_search'
  | 'paid_social'
  | 'social'
  | 'referral'
  | 'email'
  | 'unknown'

const SOCIAL_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  't.co',
  'pinterest.com',
  'pinterest.co.uk',
  'tiktok.com',
  'youtube.com',
  'reddit.com',
  'linkedin.com',
  'mastodon.social',
  'threads.net',
  'bsky.app',
]

const SEARCH_DOMAINS = [
  'google.com',
  'google.co.uk',
  'bing.com',
  'duckduckgo.com',
  'yahoo.com',
  'ecosia.org',
  'kagi.com',
]

function hostMatches(host: string, list: string[]): boolean {
  const h = host.toLowerCase()
  return list.some((d) => h === d || h.endsWith(`.${d}`))
}

function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null
  try {
    return new URL(referrer).host
  } catch {
    return null
  }
}

/**
 * Map (UTM, referrer) to a channel bucket. Deliberately small and explicit;
 * easier to reason about than a regex chain.
 */
export function deriveChannel(input: {
  utmSource: string | null
  utmMedium: string | null
  referrer: string | null
}): AcquisitionChannel {
  const src = input.utmSource?.toLowerCase() ?? null
  const med = input.utmMedium?.toLowerCase() ?? null

  // UTM-driven first — explicit campaign tagging beats inferred channel.
  if (src || med) {
    if (med === 'cpc' || med === 'ppc' || med === 'paidsearch' || med === 'paid_search') {
      return 'paid_search'
    }
    if (med === 'paidsocial' || med === 'paid_social' || med === 'social-paid') {
      return 'paid_social'
    }
    if (med === 'email' || src === 'newsletter' || src === 'mailchimp' || src === 'substack-email') {
      return 'email'
    }
    if (med === 'social' || (src && SOCIAL_DOMAINS.some((d) => {
      const root = d.split('.')[0]
      return root ? src.includes(root) : false
    }))) {
      return 'social'
    }
    if (med === 'referral') return 'referral'
    if (med === 'organic') return 'organic'
    // Tagged but uncategorised — call it referral.
    return 'referral'
  }

  const host = referrerHost(input.referrer)
  if (!host) return 'direct'
  if (hostMatches(host, SEARCH_DOMAINS)) return 'organic'
  if (hostMatches(host, SOCIAL_DOMAINS)) return 'social'

  // Self-referrer doesn't count — internal navigation.
  if (host.includes('homemade.education')) return 'direct'

  return 'referral'
}

/**
 * Parse a URL's query string into UTM parts. Tolerant of missing values.
 */
export function parseUtm(searchParams: URLSearchParams): {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
} {
  const get = (k: string) => searchParams.get(k)?.slice(0, 200) || null
  return {
    utmSource: get('utm_source'),
    utmMedium: get('utm_medium'),
    utmCampaign: get('utm_campaign'),
    utmContent: get('utm_content'),
    utmTerm: get('utm_term'),
  }
}

/**
 * Coarse device-class bucket from a UA string. Mobile vs tablet detection is
 * intentionally rough — PostHog's own UA parser does a better job once
 * events land; this is just for the first-touch fallback we persist to the
 * User row before the user has fired any events.
 */
export function deriveDeviceClass(userAgent: string | null): 'mobile' | 'tablet' | 'desktop' {
  if (!userAgent) return 'desktop'
  const ua = userAgent.toLowerCase()
  if (/ipad|tablet|playbook|kindle/.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua)) return 'mobile'
  return 'desktop'
}

/**
 * Client-side: read stored acquisition data if any. Returns null when nothing
 * has been captured yet (e.g. first visit hasn't finished writing).
 */
export function readStoredAcquisition(): AcquisitionData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ACQUISITION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AcquisitionData>
    if (typeof parsed !== 'object' || parsed === null) return null
    return {
      utmSource: parsed.utmSource ?? null,
      utmMedium: parsed.utmMedium ?? null,
      utmCampaign: parsed.utmCampaign ?? null,
      utmContent: parsed.utmContent ?? null,
      utmTerm: parsed.utmTerm ?? null,
      referrer: parsed.referrer ?? null,
      landingPath: parsed.landingPath ?? null,
      acquisitionChannel: (parsed.acquisitionChannel as AcquisitionChannel) ?? 'unknown',
      firstSeenAt: parsed.firstSeenAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}
