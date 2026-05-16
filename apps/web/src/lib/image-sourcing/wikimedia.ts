/**
 * Wikimedia Commons search client. No API key required.
 *
 * Uses the MediaWiki action API (generator=search + imageinfo) to fetch image
 * candidates plus their licence metadata. Filters to CC-BY / CC-BY-SA / CC0 /
 * PD only — anything more restrictive is skipped.
 *
 * CC-BY and CC-BY-SA require attribution; CC0 / PD don't.
 */

import type { ImageSearchResult, LicenceCode, SearchOpts } from './types'
import { computeRequiresAttribution } from './types'

const API = 'https://commons.wikimedia.org/w/api.php'

interface MWImageInfo {
  url: string
  width: number
  height: number
  descriptionurl: string
  extmetadata?: {
    LicenseShortName?: { value?: string }
    Artist?: { value?: string }
    LicenseUrl?: { value?: string }
  }
}

interface MWPage {
  title: string
  imageinfo?: MWImageInfo[]
}

interface MWResponse {
  query?: {
    pages?: Record<string, MWPage>
  }
}

const ALLOWED_LICENCES: Record<string, LicenceCode> = {
  'cc by 4.0': 'CC-BY',
  'cc-by-4.0': 'CC-BY',
  'cc by 3.0': 'CC-BY',
  'cc-by-3.0': 'CC-BY',
  'cc by 2.0': 'CC-BY',
  'cc-by-2.0': 'CC-BY',
  'cc by-sa 4.0': 'CC-BY-SA',
  'cc-by-sa-4.0': 'CC-BY-SA',
  'cc by-sa 3.0': 'CC-BY-SA',
  'cc-by-sa-3.0': 'CC-BY-SA',
  'cc0': 'CC0',
  'public domain': 'PD',
}

function normaliseLicence(raw: string | undefined): LicenceCode | null {
  if (!raw) return null
  const k = raw.trim().toLowerCase()
  if (ALLOWED_LICENCES[k]) return ALLOWED_LICENCES[k]
  // Loose contains-match for variants we haven't enumerated.
  if (k.includes('cc0')) return 'CC0'
  if (k.includes('public domain')) return 'PD'
  if (k.includes('by-sa')) return 'CC-BY-SA'
  if (k.includes('cc by') || k.includes('cc-by')) return 'CC-BY'
  return null
}

function stripHtml(s: string | undefined | null): string | null {
  if (!s) return null
  return s.replace(/<[^>]*>/g, '').trim() || null
}

export async function searchWikimedia(query: string, opts: SearchOpts = {}): Promise<ImageSearchResult[]> {
  const limit = opts.limit ?? 3
  const timeoutMs = opts.timeoutMs ?? 6000

  const url = new URL(API)
  url.searchParams.set('action', 'query')
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')
  url.searchParams.set('generator', 'search')
  url.searchParams.set('gsrnamespace', '6') // File namespace
  url.searchParams.set('gsrsearch', `${query} filetype:bitmap`)
  url.searchParams.set('gsrlimit', String(Math.max(limit * 3, 9)))
  url.searchParams.set('prop', 'imageinfo')
  url.searchParams.set('iiprop', 'url|size|extmetadata|mime')
  url.searchParams.set('iiurlwidth', '1600')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Homemade/1.0 (homemade.education; rebecca@homemade.education)' },
      signal: ctrl.signal,
    })
    if (!res.ok) return []
    const data = (await res.json()) as MWResponse
    const pages = data.query?.pages ?? {}
    const out: ImageSearchResult[] = []
    for (const page of Object.values(pages)) {
      const info = page.imageinfo?.[0]
      if (!info) continue
      const licence = normaliseLicence(info.extmetadata?.LicenseShortName?.value)
      if (!licence) continue
      out.push({
        url: info.url,
        pageUrl: info.descriptionurl,
        source: 'wikimedia',
        creatorName: stripHtml(info.extmetadata?.Artist?.value),
        licenceCode: licence,
        licenceUrl: info.extmetadata?.LicenseUrl?.value ?? null,
        requiresAttribution: computeRequiresAttribution(licence),
        width: info.width,
        height: info.height,
        upstreamId: page.title,
      })
      if (out.length >= limit) break
    }
    return out
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
