import { NextResponse } from 'next/server'
import { prisma, type Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Colour schemes — saved palettes the user can reuse on future
 * projects.
 *
 *   GET    /api/studio/crochet/colour-schemes
 *     -> list of the current user's schemes
 *
 *   POST   /api/studio/crochet/colour-schemes
 *     body: { name, colours, sourceCrochetPatternId? }
 *     -> the created scheme
 *
 *   DELETE /api/studio/crochet/colour-schemes/[id]
 */

interface PostPayload {
  name: string
  colours: Array<{ hex: string; label?: string; role?: string }>
  sourceCrochetPatternId?: string | null
}

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const schemes = await prisma.crochetColourScheme.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      colours: true,
      sourceCrochetPatternId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json(
    schemes.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  )
}

export async function POST(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let payload: PostPayload
  try {
    payload = (await request.json()) as PostPayload
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const name = (payload.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  if (!Array.isArray(payload.colours) || payload.colours.length === 0) {
    return NextResponse.json({ error: 'colours[] is required' }, { status: 400 })
  }

  const colours = payload.colours
    .filter((c) => typeof c === 'object' && c !== null && typeof c.hex === 'string' && /^#[0-9a-f]{3,8}$/i.test(c.hex))
    .slice(0, 24)
  if (colours.length === 0) {
    return NextResponse.json({ error: 'at least one valid colour required' }, { status: 400 })
  }

  // Validate the source pattern (if given) exists and is visible.
  let sourceCrochetPatternId: string | null = null
  if (payload.sourceCrochetPatternId) {
    const found = await prisma.crochetPattern.findUnique({
      where: { id: payload.sourceCrochetPatternId },
      select: { id: true },
    })
    if (found) sourceCrochetPatternId = found.id
  }

  const created = await prisma.crochetColourScheme.create({
    data: {
      userId: user.id,
      name,
      colours: colours as unknown as Prisma.InputJsonValue,
      sourceCrochetPatternId,
    },
    select: { id: true, name: true, colours: true, sourceCrochetPatternId: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json({
    ...created,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  })
}
