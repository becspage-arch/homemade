import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import {
  LETTERING_FACE_IDS,
  minCapFor,
  renderTextBlock,
  splitBalanced,
  type LetteringFace,
} from '@/lib/studio/generation/samplers/lettering'

export const dynamic = 'force-dynamic'

/**
 * POST /api/studio/word-art — turn typed words into chart cells.
 *
 * The Studio's word-art tool asks for this every time the text, the face or the
 * size changes, then paints the cells it gets back wherever the maker has
 * dragged them. The lettering is set from glyph OUTLINES on the server, so the
 * letters are the same shapes everywhere and no model is ever asked to draw a
 * letter. The reply is a list of squares, not a picture.
 *
 * PREMIUM, for the same reason the personalise section is: putting your own
 * words on a chart is making a pattern of your own, which is the create-your-own
 * line in `notes/project/project_premium_free_spec.md`. Working an existing
 * chart in the Studio stays free with an account.
 */
const Body = z.object({
  text: z.string().min(1).max(120),
  face: z.enum(LETTERING_FACE_IDS as [LetteringFace, ...LetteringFace[]]),
  /** Cap height in cells. */
  size: z.number().min(3).max(60),
  tracking: z.number().min(-2).max(6).optional(),
  upper: z.boolean().optional(),
  /** Break the words over this many lines. 1 is a single line. */
  lines: z.number().int().min(1).max(4).optional(),
  /** Gap between lines, in cells. */
  lineGap: z.number().int().min(0).max(20).optional(),
})

/** A single piece of word art never covers more than this many cells. */
const MAX_CELLS = 12_000

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!hasPremium(user)) {
    return NextResponse.json(
      { error: 'Adding your own words to a chart is part of Homemade Premium.', premium: true },
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

  const { text, face, tracking, upper, lineGap } = parsed.data
  const size = Math.max(minCapFor(face), parsed.data.size)
  const parts = parsed.data.lines ?? 1
  const pieces = parts > 1 ? splitBalanced(text, face, parts) : [text]

  const mask = await renderTextBlock({
    lines: pieces.map((t) => ({
      text: t,
      face,
      size,
      ...(tracking !== undefined ? { tracking } : {}),
      ...(upper !== undefined ? { upper } : {}),
    })),
    align: 'centre',
    lineGap: lineGap ?? Math.max(2, Math.round(size * 0.35)),
  })

  if (mask.cells.length > MAX_CELLS) {
    return NextResponse.json(
      { error: 'That is a lot of stitches for one piece of lettering. Try a smaller size.' },
      { status: 422 },
    )
  }

  return NextResponse.json({
    width: mask.width,
    height: mask.height,
    cells: mask.cells.map((c) => [c.x, c.y]),
  })
}
