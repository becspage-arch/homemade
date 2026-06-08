import { NextResponse } from 'next/server'
import { prisma, type Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

interface Context {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const existing = Array.isArray(user.myYarns) ? (user.myYarns as Record<string, unknown>[]) : []
  const next = existing.filter((y) => y && typeof y === 'object' && y.id !== id)
  if (next.length === existing.length) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { myYarns: next as unknown as Prisma.InputJsonValue },
  })

  return NextResponse.json({ ok: true })
}
