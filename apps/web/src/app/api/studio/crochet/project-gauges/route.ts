import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Per-project gauge logs. A crocheter often re-swatches after a few
 * cm of real work — the table allows multiple gauge entries per
 * (user, crochetPattern).
 *
 *   GET    /api/studio/crochet/project-gauges?crochetPatternId=X
 *   POST   /api/studio/crochet/project-gauges
 *     body: { crochetPatternId, stitchesPer10cm?, rowsPer10cm?,
 *             hookMm?, yarnLabel?, blocked?, notes? }
 */

interface PostPayload {
  crochetPatternId: string
  stitchesPer10cm?: number | null
  rowsPer10cm?: number | null
  hookMm?: number | null
  yarnLabel?: string | null
  blocked?: boolean
  notes?: string | null
}

export async function GET(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const crochetPatternId = url.searchParams.get('crochetPatternId')
  if (!crochetPatternId) {
    return NextResponse.json({ error: 'crochetPatternId required' }, { status: 400 })
  }

  const rows = await prisma.crochetProjectGauge.findMany({
    where: { userId: user.id, crochetPatternId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      stitchesPer10cm: true,
      rowsPer10cm: true,
      hookMm: true,
      yarnLabel: true,
      blocked: true,
      notes: true,
      createdAt: true,
    },
  })

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
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
  if (!payload.crochetPatternId) {
    return NextResponse.json({ error: 'crochetPatternId required' }, { status: 400 })
  }

  const pattern = await prisma.crochetPattern.findUnique({
    where: { id: payload.crochetPatternId },
    select: { id: true },
  })
  if (!pattern) return NextResponse.json({ error: 'pattern not found' }, { status: 404 })

  const created = await prisma.crochetProjectGauge.create({
    data: {
      userId: user.id,
      crochetPatternId: payload.crochetPatternId,
      stitchesPer10cm: payload.stitchesPer10cm ?? null,
      rowsPer10cm: payload.rowsPer10cm ?? null,
      hookMm: payload.hookMm ?? null,
      yarnLabel: payload.yarnLabel ?? null,
      blocked: payload.blocked ?? false,
      notes: payload.notes ?? null,
    },
    select: {
      id: true,
      stitchesPer10cm: true,
      rowsPer10cm: true,
      hookMm: true,
      yarnLabel: true,
      blocked: true,
      notes: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    ...created,
    createdAt: created.createdAt.toISOString(),
  })
}
