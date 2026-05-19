/**
 * Canonical site origin + URL helpers used throughout the SEO surface.
 *
 * The site serves a single English-language origin (UK + US share the
 * domain; hreflang annotations on each page tell Google both markets are
 * targeted). When this gains a separate www / preview origin, override via
 * `SITE_URL` in the ECS task env.
 */
const DEFAULT_SITE_URL = 'https://homemade.education'

export function siteOrigin(): string {
  const raw = process.env.SITE_URL ?? DEFAULT_SITE_URL
  return raw.replace(/\/$/, '')
}

/**
 * Build an absolute URL for a path. Leading slash optional; trailing slash
 * stripped to match the trailing-slash policy enforced in proxy.ts.
 */
export function siteUrl(path = '/'): string {
  const origin = siteOrigin()
  if (!path || path === '/') return origin + '/'
  const cleaned = path.startsWith('/') ? path : `/${path}`
  if (cleaned === '/') return origin + '/'
  const trimmed = cleaned.replace(/\/+$/, '')
  return origin + trimmed
}

export const SITE_NAME = 'Homemade'
export const SITE_TWITTER = '@homemade_education'
