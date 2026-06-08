import { NextResponse } from 'next/server'
import { prisma, type Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Stitch markers for a crochet pattern.
 *
 *   GET    /api/studio/crochet/stitch-markers?crochetPatternId=X
 *     -> [{ id, position, label, colour, createdAt }, ...]
 *
 *   POST   /api/studio/crochet/stitch-markers
 *     body: { crochetPatternId, position, label?, colour? }
 *     -> { id, position, label, colour, createdAt }
 *
 * Position is JSON — v1 supports:
 *   { type: 'row', section: string, rowNumber: number }
 *
 * Future: chart-cell markers ({ type: 'chart', x, y }) when the chart
 * SVG renderer surfaces tap-to-mark hooks.
 */

interface PostPayload {
  crochetPatternId: string
  position: Record<string, unknown>
  label?: string | null
  colour?: string | null
}

export async function GET(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const crochetPatternId = url.searchParams.get('crochetPatternId')
  if (!crochetPatternId) {
    return NextResponse.json({ error: 'crochetPatternId is required' }, { status: 400 })
  }

  const markers = await prisma.crochetStitchMarker.findMany({
    where: { userId: user.id, crochetPatternId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, position: true, label: true, colour: true, createdAt: true },
  })

  return NextResponse.json(
    markers.map((m) => ({
      id: m.id,
      position: m.position,
      label: m.label,
      colour: m.colour,
      createdAt: m.createdAt.toISOString(),
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

  if (!payload.crochetPatternId || !payload.position || typeof payload.position !== 'object') {
    return NextResponse.json({ error: 'crochetPatternId + position required' }, { status: 400 })
  }

  const pattern = await prisma.crochetPattern.findUnique({
    where: { id: payload.crochetPatternId },
    select: { id: true },
  })
  if (!pattern) return NextResponse.json({ error: 'pattern not found' }, { status: 404 })

  const marker = await prisma.crochetStitchMarker.create({
    data: {
      userId: user.id,
      crochetPatternId: payload.crochetPatternId,
      position: payload.position as Prisma.InputJsonValue,
      label: payload.label ?? null,
      colour: payload.colour ?? null,
    },
    select: { id: true, position: true, label: true, colour: true, createdAt: true },
  })

  return NextResponse.json({
    id: marker.id,
    position: marker.position,
    label: marker.label,
    colour: marker.colour,
    createdAt: marker.createdAt.toISOString(),
  })
}
