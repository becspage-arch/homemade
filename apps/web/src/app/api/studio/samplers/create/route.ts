import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, computePatternMetrics, Visibility } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { loadSampler } from '@/lib/studio/generation/samplers/load'
import { personaliseSampler, SamplerTextTooLongError } from '@/lib/studio/generation/samplers/chart'
import {
  SAMPLER_KINDS,
  cleanSamplerValues,
  dateLocaleForCountry,
  missingRequired,
} from '@/lib/studio/generation/samplers/kinds'

export const dynamic = 'force-dynamic'

/**
 * POST /api/studio/samplers/create — "Stitch it".
 *
 * Takes a published sampler and the maker's own words, and writes a new pattern
 * that belongs to them: same art, their name on it. The art is copied cell for
 * cell out of the published chart, so this costs one font pass and one insert.
 *
 * PREMIUM. Making a pattern of your own is the create-your-own line
 * (`notes/project/project_premium_free_spec.md`), and it is that line rather
 * than a new one: the check is `hasPremium`, the same call the Studio's
 * "Design your own" panel and the print routes make. Stitching the CATALOGUE
 * sampler as it stands is free with an account, exactly like every other free
 * pattern; what premium buys is the copy with your own name on it.
 *
 * The new row is PRIVATE, which is what every other owned pattern is: the
 * blank-canvas save, the photo-to-chart save and the silent fork all write
 * PRIVATE, and UNLISTED means something else here (a house candidate waiting to
 * be judged).
 */
const Body = z.object({
  patternId: z.string().min(1).max(64),
  values: z.record(z.string(), z.unknown()),
})

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!hasPremium(user)) {
    return NextResponse.json(
      {
        error: 'Making a sampler of your own is part of Homemade Premium.',
        premium: true,
      },
      { status: 403 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const sampler = await loadSampler(parsed.data.patternId)
  if (!sampler) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const values = cleanSamplerValues(sampler.meta.kind, parsed.data.values)
  const missing = missingRequired(sampler.meta.kind, values)
  if (missing.length > 0) {
    return NextResponse.json({ error: `Still to fill in: ${missing.join(', ')}.` }, { status: 400 })
  }

  const locale = dateLocaleForCountry(user.homeCountryCode ?? user.country ?? null)

  let data
  try {
    data = await personaliseSampler(sampler.data, sampler.meta, values, locale)
  } catch (err) {
    if (err instanceof SamplerTextTooLongError) {
      return NextResponse.json({ error: err.message, tooLong: true }, { status: 422 })
    }
    throw err
  }

  const metrics = computePatternMetrics(data)
  const row = await prisma.pattern.create({
    data: {
      type: 'CROSS_STITCH',
      name: patternNameFor(sampler.meta.kind, values, sampler.name),
      data: data as unknown as object,
      ownerUserId: user.id,
      visibility: Visibility.PRIVATE,
      forkedFromId: sampler.id,
      widthCells: metrics.widthCells,
      heightCells: metrics.heightCells,
      colourCount: metrics.colourCount,
      totalStitches: metrics.totalStitches,
      hasBackstitch: metrics.hasBackstitch,
      hasFrenchKnots: metrics.hasFrenchKnots,
      hasBeads: metrics.hasBeads,
      hasQuarterStitches: metrics.hasQuarterStitches,
      confettiShare: metrics.confettiShare,
      colourChangesPer100: metrics.colourChangesPer100,
      medianRunLength: metrics.medianRunLength,
      stitchability: metrics.stitchability,
      fabricCountSuggested: data.fabric.count,
      generationMeta: {
        sampler: { ...sampler.meta, values },
        personalisedFrom: sampler.id,
        at: new Date().toISOString(),
      } as unknown as object,
    },
    select: { id: true },
  })

  return NextResponse.json({ id: row.id }, { status: 201 })
}

/**
 * What the maker's copy is called in their own list. Their words, so they can
 * tell three birth samplers apart, falling back to the design's own title.
 */
function patternNameFor(
  kind: keyof typeof SAMPLER_KINDS,
  values: Record<string, string>,
  fallback: string,
): string {
  const first =
    values.name ??
    (values.nameOne && values.nameTwo
      ? `${values.nameOne} and ${values.nameTwo}`
      : (values.nameOne ?? values.home))
  const label = SAMPLER_KINDS[kind].label.toLowerCase()
  return first ? `${first} ${label} sampler`.slice(0, 120) : fallback
}
