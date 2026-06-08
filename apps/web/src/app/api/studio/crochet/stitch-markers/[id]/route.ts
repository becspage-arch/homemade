import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * DELETE /api/studio/crochet/stitch-markers/[id]
 *   Deletes one of the current user's markers. 404 if the marker
 *   doesn't exist or belongs to a different user.
 */

interface Context {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const marker = await prisma.crochetStitchMarker.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!marker || marker.userId !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await prisma.crochetStitchMarker.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
