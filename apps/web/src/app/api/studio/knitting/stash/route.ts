import { NextResponse } from 'next/server'

import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Per-user knitting yarn + needle stash.
 *
 *   GET  /api/studio/knitting/stash  — list active rows for the signed-in user.
 *   POST /api/studio/knitting/stash  — create a row.
 *
 * Per `feedback_free_signin_carrots`, server-side sync is a FREE feature.
 * Signed-out users get local-only behaviour via the Studio client's
 * localStorage fallback.
 */

const ALLOWED_WEIGHTS = new Set([
  'LACE',
  'FINGERING',
  'SPORT',
  'DK',
  'WORSTED',
  'ARAN',
  'BULKY',
  'SUPER_BULKY',
  'JUMBO',
])

interface PostBody {
  yarnName?: string
  brand?: string | null
  colourway?: string | null
  weight?: string
  yardsPerSkein?: number | null
  metresPerSkein?: number | null
  skeinsOwned?: number
  fibre?: string | null
  needleSizesOwned?: number[]
  notes?: string | null
  projectAssignedToId?: string | null
}

function shapeRow(row: {
  id: string
  yarnName: string
  brand: string | null
  colourway: string | null
  weight: string
  yardsPerSkein: number | null
  metresPerSkein: number | null
  skeinsOwned: number
  fibre: string | null
  needleSizesOwned: number[]
  notes: string | null
  projectAssignedToId: string | null
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: row.id,
    yarnName: row.yarnName,
    brand: row.brand,
    colourway: row.colourway,
    weight: row.weight,
    yardsPerSkein: row.yardsPerSkein,
    metresPerSkein: row.metresPerSkein,
    skeinsOwned: row.skeinsOwned,
    fibre: row.fibre,
    needleSizesOwned: row.needleSizesOwned,
    notes: row.notes,
    projectAssignedToId: row.projectAssignedToId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const rows = await prisma.knittingStash.findMany({
    where: { userId: user.id, archivedAt: null },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ entries: rows.map(shapeRow) })
}

export async function POST(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: PostBody
  try {
    body = (await request.json()) as PostBody
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  if (!body.yarnName || typeof body.yarnName !== 'string') {
    return NextResponse.json({ error: 'yarnName required' }, { status: 400 })
  }
  if (!body.weight || !ALLOWED_WEIGHTS.has(body.weight)) {
    return NextResponse.json({ error: 'weight required' }, { status: 400 })
  }

  const row = await prisma.knittingStash.create({
    data: {
      userId: user.id,
      yarnName: body.yarnName,
      brand: body.brand ?? null,
      colourway: body.colourway ?? null,
      // KnittingYarnWeightStandard enum
      weight: body.weight as 'LACE' | 'FINGERING' | 'SPORT' | 'DK' | 'WORSTED' | 'ARAN' | 'BULKY' | 'SUPER_BULKY' | 'JUMBO',
      yardsPerSkein: body.yardsPerSkein ?? null,
      metresPerSkein: body.metresPerSkein ?? null,
      skeinsOwned: typeof body.skeinsOwned === 'number' ? body.skeinsOwned : 1,
      fibre: body.fibre ?? null,
      needleSizesOwned: Array.isArray(body.needleSizesOwned) ? body.needleSizesOwned : [],
      notes: body.notes ?? null,
      projectAssignedToId: body.projectAssignedToId ?? null,
    },
  })

  return NextResponse.json({ entry: shapeRow(row) }, { status: 201 })
}
