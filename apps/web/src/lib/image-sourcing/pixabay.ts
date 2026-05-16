/**
 * Pixabay search client. Pixabay Licence — no attribution required.
 *
 * Env: PIXABAY_API_KEY (required).
 */

import type { ImageSearchResult, SearchOpts } from './types'
import { computeRequiresAttribution } from './types'

const API = 'https://pixabay.com/api/'

interface PixabayHit {
  id: number
  pageURL: string
  largeImageURL: string
  webformatURL: string
  imageWidth: number
  imageHeight: number
  user: string | null
  type: string
}

interface PixabayResponse {
  hits: PixabayHit[]
}

export async function searchPixabay(query: string, opts: SearchOpts = {}): Promise<ImageSearchResult[]> {
  const key = process.env.PIXABAY_API_KEY
  if (!key) return []

  const limit = opts.limit ?? 3
  const timeoutMs = opts.timeoutMs ?? 6000

  const url = new URL(API)
  url.searchParams.set('key', key)
  url.searchParams.set('q', query)
  url.searchParams.set('orientation', 'horizontal')
  url.searchParams.set('image_type', 'photo')
  url.searchParams.set('safesearch', 'true')
  url.searchParams.set('per_page', String(Math.max(limit, 3)))

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url.toString(), { signal: ctrl.signal })
    if (!res.ok) return []
    const data = (await res.json()) as PixabayResponse
    return (data.hits ?? []).slice(0, limit).map((h) => ({
      url: h.largeImageURL ?? h.webformatURL,
      pageUrl: h.pageURL,
      source: 'pixabay' as const,
      creatorName: h.user ?? null,
      licenceCode: 'PIXABAY' as const,
      licenceUrl: 'https://pixabay.com/service/license-summary/',
      requiresAttribution: computeRequiresAttribution('PIXABAY'),
      width: h.imageWidth,
      height: h.imageHeight,
      upstreamId: String(h.id),
    }))
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
