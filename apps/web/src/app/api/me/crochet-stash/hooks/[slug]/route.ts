import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

interface Context {
  params: Promise<{ slug: string }>
}

export async function DELETE(_request: Request, { params }: Context) {
  const { slug } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const existing = Array.isArray(user.myHooks) ? user.myHooks : []
  if (!existing.includes(slug)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { myHooks: existing.filter((s) => s !== slug) },
  })

  return NextResponse.json({ ok: true })
}
