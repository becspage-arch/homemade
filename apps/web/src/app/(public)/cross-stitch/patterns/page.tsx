import { permanentRedirect } from 'next/navigation'

/**
 * Legacy pattern-library URL. The cross-stitch category root now renders
 * the pattern library directly under the new Pattern archetype layout.
 * Permanent redirect preserves any external links and search-engine
 * authority.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) {
      if (v[0]) params.set(k, v[0])
    } else if (typeof v === 'string') {
      params.set(k, v)
    }
  }
  const qs = params.toString()
  permanentRedirect(qs ? `/cross-stitch?${qs}` : '/cross-stitch')
}
