import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ count: 0 })
  }
  const count = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  })
  return NextResponse.json({ count })
}
