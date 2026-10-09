import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadSampler } from '@/lib/studio/generation/samplers/load'
import { setSamplerText, SamplerTextTooLongError } from '@/lib/studio/generation/samplers/chart'
import { cleanSamplerValues, dateLocaleForCountry } from '@/lib/studio/generation/samplers/kinds'

export const dynamic = 'force-dynamic'

/**
 * POST /api/studio/samplers/preview — set a maker's words and hand back where
 * every stitch of the lettering goes.
 *
 * It returns CELLS, not a picture. The page already has a picture of the design
 * with no words on it, so the browser draws the new lettering over that: the
 * reply is a few thousand small numbers instead of a fresh render per keystroke,
 * and the preview updates as fast as the typing.
 *
 * Open to anyone, because it is the shop window. It reads one published row, does
 * a little font work, and writes nothing.
 */
const Body = z.object({
  patternId: z.string().min(1).max(64),
  values: z.record(z.string(), z.unknown()),
})

export async function POST(req: Request) {
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

  const user = await getCurrentDbUser()
  const locale = dateLocaleForCountry(user?.homeCountryCode ?? user?.country ?? null)
  const values = cleanSamplerValues(sampler.meta.kind, parsed.data.values)

  const rgbFor = new Map(sampler.data.palette.map((p) => [p.symbol, p.rgb]))

  try {
    const placed = await setSamplerText(sampler.meta.blocks, sampler.meta.kind, values, locale)
    return NextResponse.json({
      grid: { width: sampler.data.grid.width, height: sampler.data.grid.height },
      blocks: placed.map((b) => ({
        rgb: rgbFor.get(b.inkSymbol) ?? '#3c3c3c',
        cells: b.cells.map((c) => [c.x, c.y]),
      })),
    })
  } catch (err) {
    if (err instanceof SamplerTextTooLongError) {
      return NextResponse.json({ error: err.message, tooLong: true }, { status: 422 })
    }
    throw err
  }
}
