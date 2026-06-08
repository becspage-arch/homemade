import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

interface Context {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const scheme = await prisma.crochetColourScheme.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!scheme || scheme.userId !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await prisma.crochetColourScheme.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
