import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { prisma, type Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * POST /api/me/crochet-stash/yarns
 *   Appends a yarn entry to User.myYarns (Json array).
 */

interface PostPayload {
  label: string
  weightSlug?: string
  yardage?: number
  colourHex?: string
  colourName?: string
  leftoverYardage?: number
  notes?: string
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

  const label = (payload.label ?? '').trim()
  if (!label) return NextResponse.json({ error: 'label is required' }, { status: 400 })

  const existing = Array.isArray(user.myYarns) ? (user.myYarns as Record<string, unknown>[]) : []
  const yarn = {
    id: randomUUID(),
    label,
    weightSlug: payload.weightSlug?.trim() || undefined,
    yardage:
      typeof payload.yardage === 'number' && Number.isFinite(payload.yardage) && payload.yardage > 0
        ? payload.yardage
        : undefined,
    colourHex: payload.colourHex?.trim() || undefined,
    colourName: payload.colourName?.trim() || undefined,
    leftoverYardage:
      typeof payload.leftoverYardage === 'number' &&
      Number.isFinite(payload.leftoverYardage) &&
      payload.leftoverYardage >= 0
        ? payload.leftoverYardage
        : undefined,
    notes: payload.notes?.trim() || undefined,
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { myYarns: [...existing, yarn] as unknown as Prisma.InputJsonValue },
  })

  return NextResponse.json(yarn)
}
