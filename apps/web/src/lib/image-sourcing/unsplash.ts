/**
 * Unsplash search client.
 *
 * Uses the Unsplash API search endpoint. Returns photos under the Unsplash
 * Licence — no attribution required (we still credit on hover in the page
 * renderer for sources that DO require it, but Unsplash gets `requiresAttribution: false`).
 *
 * Env: UNSPLASH_ACCESS_KEY (required). UNSPLASH_APPLICATION_ID is the public id
 * that Unsplash recommends including in the User-Agent.
 */

import type { ImageSearchResult, SearchOpts } from './types'
import { computeRequiresAttribution } from './types'

const API = 'https://api.unsplash.com/search/photos'

interface UnsplashPhoto {
  id: string
  width: number
  height: number
  urls: { regular: string; full: string; raw: string }
  links: { html: string }
  user: { name: string | null; username: string | null }
  description: string | null
  alt_description: string | null
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[]
}

export async function searchUnsplash(query: string, opts: SearchOpts = {}): Promise<ImageSearchResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return []

  const limit = opts.limit ?? 3
  const timeoutMs = opts.timeoutMs ?? 6000

  const url = new URL(API)
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(Math.max(limit, 3)))
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('content_filter', 'high')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${key}`,
        'Accept-Version': 'v1',
      },
      signal: ctrl.signal,
    })
    if (!res.ok) return []
    const data = (await res.json()) as UnsplashSearchResponse
    return (data.results ?? []).slice(0, limit).map((p) => ({
      url: p.urls.regular,
      pageUrl: p.links.html,
      source: 'unsplash' as const,
      creatorName: p.user.name ?? p.user.username ?? null,
      licenceCode: 'UNSPLASH' as const,
      licenceUrl: 'https://unsplash.com/license',
      requiresAttribution: computeRequiresAttribution('UNSPLASH'),
      width: p.width,
      height: p.height,
      upstreamId: p.id,
    }))
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
