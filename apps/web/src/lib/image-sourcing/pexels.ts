/**
 * Pexels search client. Pexels Licence — free use, attribution not required
 * but appreciated. We set `requiresAttribution: false`.
 *
 * Env: PEXELS_API_KEY (required).
 */

import type { ImageSearchResult, SearchOpts } from './types'
import { computeRequiresAttribution } from './types'

const API = 'https://api.pexels.com/v1/search'

interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  src: { large2x: string; large: string; medium: string; original: string }
  photographer: string | null
  photographer_url: string | null
  alt: string | null
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[]
}

export async function searchPexels(query: string, opts: SearchOpts = {}): Promise<ImageSearchResult[]> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return []

  const limit = opts.limit ?? 3
  const timeoutMs = opts.timeoutMs ?? 6000

  const url = new URL(API)
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(Math.max(limit, 3)))
  url.searchParams.set('orientation', 'landscape')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: key },
      signal: ctrl.signal,
    })
    if (!res.ok) return []
    const data = (await res.json()) as PexelsSearchResponse
    return (data.photos ?? []).slice(0, limit).map((p) => ({
      url: p.src.large2x ?? p.src.large ?? p.src.original,
      pageUrl: p.url,
      source: 'pexels' as const,
      creatorName: p.photographer ?? null,
      licenceCode: 'PEXELS' as const,
      licenceUrl: 'https://www.pexels.com/license/',
      requiresAttribution: computeRequiresAttribution('PEXELS'),
      width: p.width,
      height: p.height,
      upstreamId: String(p.id),
    }))
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
