import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

const Body = z.object({ name: z.string().min(1).max(120) })

export async function POST(req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id } = await ctx.params
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const existing = await prisma.pattern.findUnique({ where: { id }, select: { ownerUserId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.ownerUserId !== user.id) return NextResponse.json({ error: 'Not authorised' }, { status: 403 })

  await prisma.pattern.update({ where: { id }, data: { name: parsed.data.name } })
  return NextResponse.json({ ok: true })
}
