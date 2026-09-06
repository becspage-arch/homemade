import { NextResponse } from 'next/server'

import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

interface PatchBody {
  quantityOwned?: number
  notes?: string | null
}

/** Update or remove one stash item. Free for the maker who owns it. */
export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const existing = await prisma.plannerStashItem.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (typeof body.quantityOwned === 'number' && body.quantityOwned >= 0) {
    data.quantityOwned = body.quantityOwned
  }
  if (body.notes !== undefined) {
    data.notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  await prisma.plannerStashItem.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const existing = await prisma.plannerStashItem.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await prisma.plannerStashItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
