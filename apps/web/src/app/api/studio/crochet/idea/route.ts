import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import {
  buildIdeaProgram,
  ideaBuilderAvailable,
  ideaChatReply,
} from '@/lib/studio/crochet/idea-builder'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const Body = z.object({
  mode: z.enum(['chat', 'build']),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(24),
})

/**
 * POST /api/studio/crochet/idea — the guided pattern builder.
 *
 * `chat` is the conversation: the maker says what they want, the assistant says
 * back what it means to build. `build` turns that conversation into an actual
 * stitch program, compiles it, and puts it through the loom's audit gate before
 * the maker ever sees it. Nothing here writes a pattern; that is the save route.
 */
export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!hasPremium(user)) {
    return NextResponse.json(
      { error: 'Homemade Premium is required to design a pattern from an idea.' },
      { status: 402 },
    )
  }
  if (!ideaBuilderAvailable()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Body.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  if (parsed.data.mode === 'chat') {
    try {
      const reply = await ideaChatReply(parsed.data.messages)
      return NextResponse.json({ reply })
    } catch (err) {
      console.error('[studio/crochet/idea] chat failed:', err)
      return NextResponse.json(
        { error: 'The pattern builder could not be reached just now. Try again in a moment.' },
        { status: 502 },
      )
    }
  }

  const outcome = await buildIdeaProgram(parsed.data.messages)
  if (!outcome.built) {
    return NextResponse.json({ problems: outcome.problems }, { status: 422 })
  }
  return NextResponse.json({
    kind: outcome.built.kind,
    program: outcome.built.program,
    attempts: outcome.attempts,
  })
}

/** GET — is the builder wired up in this environment? */
export async function GET() {
  return NextResponse.json({ available: ideaBuilderAvailable() })
}
