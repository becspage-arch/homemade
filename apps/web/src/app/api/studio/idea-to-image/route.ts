import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { generatePatternImage } from '@/lib/studio/generation/pattern-engine'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/studio/idea-to-image — describe-an-idea, step one.
 *
 * The customer types a brief; we generate an original illustration (Flux) and
 * hand it back for them to APPROVE or REGENERATE. This route does NOT convert —
 * approving the image is the customer's acceptance gate (they can regenerate
 * until happy). Once approved, the client posts the same image to
 * /api/studio/photo-to-chart, which runs the rigorous converter — so the idea
 * flow and the photo flow share one convert path.
 *
 * Create-your-own is premium (the locked spec). A non-premium user never
 * reaches here — the Studio shows an upgrade block in place of the panel — but
 * the route enforces the gate itself too, since it's the thing that spends a
 * Flux call.
 */
export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!hasPremium(user)) {
    return NextResponse.json(
      { error: 'Homemade Premium is required to design a pattern from an idea.' },
      { status: 402 },
    )
  }

  let body: { brief?: unknown; detailed?: unknown }
  try {
    body = (await req.json()) as { brief?: unknown; detailed?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const brief = typeof body.brief === 'string' ? body.brief.trim() : ''
  // Floor, not a quality judgement: a real brief has to say something, and we
  // cap length so the prompt stays a subject, not an essay.
  if (brief.length < 3) {
    return NextResponse.json(
      { error: 'Describe your idea in a few words (for example, "a sleepy fox curled under autumn leaves").' },
      { status: 400 },
    )
  }
  if (brief.length > 400) {
    return NextResponse.json({ error: 'Keep your idea under 400 characters.' }, { status: 400 })
  }
  const detailed = body.detailed === true

  try {
    const image = await generatePatternImage(brief, { detailed })
    return NextResponse.json({ image: image.dataUrl, credit: image.credit })
  } catch (err) {
    console.error('[idea-to-image] generation failed:', err)
    return NextResponse.json(
      { error: 'That idea did not generate cleanly. Try rewording it and generating again.' },
      { status: 502 },
    )
  }
}
