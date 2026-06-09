import { NextResponse } from 'next/server'

import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Per-user knitting stash row mutations.
 *
 *   PATCH  /api/studio/knitting/stash/[id]  — update a row.
 *   DELETE /api/studio/knitting/stash/[id]  — soft-archive a row.
 *
 * The DELETE handler sets `archivedAt` rather than dropping the row so
 * the Studio can show a brief undo affordance after a delete.
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

interface RouteContext {
  params: Promise<{ id: string }>
}

interface PatchBody {
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

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  // Confirm ownership before mutating.
  const existing = await prisma.knittingStash.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (typeof body.yarnName === 'string') data.yarnName = body.yarnName
  if (body.brand !== undefined) data.brand = body.brand
  if (body.colourway !== undefined) data.colourway = body.colourway
  if (typeof body.weight === 'string') {
    if (!ALLOWED_WEIGHTS.has(body.weight)) {
      return NextResponse.json({ error: 'invalid weight' }, { status: 400 })
    }
    data.weight = body.weight
  }
  if (body.yardsPerSkein !== undefined) data.yardsPerSkein = body.yardsPerSkein
  if (body.metresPerSkein !== undefined) data.metresPerSkein = body.metresPerSkein
  if (typeof body.skeinsOwned === 'number') data.skeinsOwned = body.skeinsOwned
  if (body.fibre !== undefined) data.fibre = body.fibre
  if (Array.isArray(body.needleSizesOwned)) data.needleSizesOwned = body.needleSizesOwned
  if (body.notes !== undefined) data.notes = body.notes
  if (body.projectAssignedToId !== undefined) data.projectAssignedToId = body.projectAssignedToId

  const row = await prisma.knittingStash.update({ where: { id }, data })

  return NextResponse.json({
    id: row.id,
    updatedAt: row.updatedAt.toISOString(),
  })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const existing = await prisma.knittingStash.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await prisma.knittingStash.update({
    where: { id },
    data: { archivedAt: new Date() },
  })

  return new NextResponse(null, { status: 204 })
}
