import type { Metadata } from 'next'
import { SITE_NAME, SITE_TWITTER, siteUrl } from './site-url'

const MAX_TITLE = 60
const MAX_DESCRIPTION = 160

export type OpenGraphType = 'website' | 'article' | 'profile' | 'book'

interface PublicMetadataInput {
  /** Page-specific title fragment. The full title gets " | Homemade" appended unless it already includes "Homemade". */
  title: string
  description: string | null
  /** Path on the site, e.g. `/cooking/sourdough-bread`. The helper builds the absolute URL. */
  path: string
  ogType?: OpenGraphType
  /** Hero image URL, ideally 1200×630. Absolute or relative — relative URLs are resolved against siteOrigin. */
  imageUrl?: string | null
  imageAlt?: string | null
  keywords?: string[]
  /** Defaults to `index, follow` for public surfaces. Set false for /me, /admin, /search, query-filtered URLs. */
  index?: boolean
  /** Publish date for article/profile content. */
  publishedTime?: Date | null
  modifiedTime?: Date | null
  /** Author display name — surfaces in OG:article tags. */
  author?: string | null
}

/**
 * Build a Next.js `Metadata` object for a public route. Centralises:
 *   - title formatting (page title | Homemade, capped at 60 chars)
 *   - description trimming to ≤160 chars
 *   - canonical URL (absolute, no trailing slash)
 *   - hreflang annotations (en-GB / en-US / x-default — all point at the
 *     same URL until region-specific routing lands)
 *   - openGraph + twitter cards
 *   - robots index/follow toggle (defaults to index/follow — the root layout
 *     defaults to noindex so each public page MUST opt in here)
 *
 * Callers that need to extend further (e.g. adding `other` fields) can spread
 * the returned object and override.
 */
export function buildPublicMetadata(input: PublicMetadataInput): Metadata {
  const absoluteUrl = siteUrl(input.path)
  const title = formatTitle(input.title)
  const description = trimDescription(input.description)
  const indexable = input.index !== false

  const ogImages =
    input.imageUrl
      ? [
          {
            url: input.imageUrl,
            width: 1200,
            height: 630,
            alt: input.imageAlt ?? input.title,
          },
        ]
      : undefined

  const metadata: Metadata = {
    title,
    description: description ?? undefined,
    keywords: input.keywords && input.keywords.length ? input.keywords : undefined,
    alternates: {
      canonical: absoluteUrl,
      languages: {
        'en-GB': absoluteUrl,
        'en-US': absoluteUrl,
        'x-default': absoluteUrl,
      },
    },
    openGraph: {
      title,
      description: description ?? undefined,
      type: input.ogType ?? 'website',
      url: absoluteUrl,
      siteName: SITE_NAME,
      images: ogImages,
      ...(input.publishedTime
        ? { publishedTime: input.publishedTime.toISOString() }
        : {}),
      ...(input.modifiedTime
        ? { modifiedTime: input.modifiedTime.toISOString() }
        : {}),
      ...(input.author ? { authors: [input.author] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description ?? undefined,
      site: SITE_TWITTER,
      images: input.imageUrl ? [input.imageUrl] : undefined,
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  }
  return metadata
}

export function formatTitle(raw: string): string {
  if (!raw) return SITE_NAME
  const trimmed = raw.trim()
  const includesBrand = /homemade/i.test(trimmed)
  const candidate = includesBrand ? trimmed : `${trimmed} | ${SITE_NAME}`
  if (candidate.length <= MAX_TITLE) return candidate
  // Title too long: drop the brand suffix and truncate.
  if (includesBrand) {
    return trimmed.length <= MAX_TITLE
      ? trimmed
      : trimmed.slice(0, MAX_TITLE - 1).trimEnd() + '…'
  }
  const room = MAX_TITLE - ` | ${SITE_NAME}`.length
  if (room < 20) return trimmed.slice(0, MAX_TITLE - 1).trimEnd() + '…'
  return `${trimmed.slice(0, room).trimEnd()} | ${SITE_NAME}`
}

export function trimDescription(raw: string | null | undefined): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= MAX_DESCRIPTION) return cleaned
  return cleaned.slice(0, MAX_DESCRIPTION - 1).trimEnd() + '…'
}

export function notFoundMetadata(): Metadata {
  return buildPublicMetadata({
    title: 'Not found',
    description: 'The page you were looking for has moved or never existed.',
    path: '/',
    index: false,
  })
}
