import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { photoToTapestryGrid } from '@/lib/studio/crochet/photo-to-tapestry'
import {
  buildTapestryProgram,
  tapestrySizeProblem,
  TAPESTRY_MAX_COLOURS,
  TAPESTRY_MIN_COLOURS,
} from '@/lib/studio/crochet/tapestry-program'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/studio/crochet/photo-to-tapestry — the live preview.
 *
 * Turns the maker's photo into a colour grid and the stitch program that goes
 * with it, so the panel can show the chart and the colours before anything is
 * saved. Fast: this is the quantise, not the compile. The audit gate runs on
 * the save, which is where a pattern is actually written.
 */
export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!hasPremium(user)) {
    return NextResponse.json(
      { error: 'Homemade Premium is required to turn a photo into a pattern.' },
      { status: 402 },
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
  }
  const file = form.get('image')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Choose a photo first.' }, { status: 400 })
  }

  const width = Math.round(Number(form.get('width') ?? 24))
  const height = Math.round(Number(form.get('height') ?? 24))
  const sizeProblem = tapestrySizeProblem(width, height)
  if (sizeProblem) return NextResponse.json({ error: sizeProblem }, { status: 400 })

  const colours = clamp(Number(form.get('colours') ?? 4), TAPESTRY_MIN_COLOURS, TAPESTRY_MAX_COLOURS)
  const smoothingRaw = String(form.get('smoothing') ?? 'medium')
  const smoothing = smoothingRaw === 'low' || smoothingRaw === 'high' ? smoothingRaw : 'medium'
  const name = (String(form.get('name') ?? '').trim() || 'Untitled tapestry').slice(0, 120)

  let grid
  try {
    grid = await photoToTapestryGrid(Buffer.from(await file.arrayBuffer()), {
      width,
      height,
      colours,
      backgroundRemoval: String(form.get('backgroundRemoval') ?? '0') === '1',
      smoothing,
    })
  } catch (err) {
    console.error('[studio/crochet/photo-to-tapestry] conversion failed:', err)
    return NextResponse.json(
      { error: 'That photo could not be turned into a pattern. Try a different one.' },
      { status: 502 },
    )
  }

  const program = buildTapestryProgram(grid, { name })
  return NextResponse.json({ grid, program })
}

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo
  return Math.max(lo, Math.min(hi, Math.round(v)))
}
