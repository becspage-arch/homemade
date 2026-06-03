import { NextResponse } from 'next/server'
import { lookupPostcode } from '@/lib/postcode-lookup'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

/**
 * Postcode → climate-zone lookup endpoint. The settings page calls this
 * when the user enters a postcode so the form can show "we think you're
 * in zone X, frost-free from MM-DD to MM-DD" before they save.
 *
 * Phase location_climate_paper_001 — MVP. Approximation-based; the
 * licensed-data version ships in a follow-up.
 *
 * Sign-in required so a scanner can't enumerate postcode coverage.
 */
export async function GET(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country') ?? ''
  const postcode = searchParams.get('postcode') ?? ''
  if (!country || !postcode) {
    return NextResponse.json({ error: 'country and postcode are required' }, { status: 400 })
  }

  const result = lookupPostcode(country, postcode)
  if (!result) {
    return NextResponse.json(
      { found: false, message: 'Postcode shape not recognised for that country, or country not supported by the MVP lookup.' },
      { status: 404 },
    )
  }

  return NextResponse.json({ found: true, ...result })
}
