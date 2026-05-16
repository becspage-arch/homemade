import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface UnregisterBody {
  deviceToken?: string
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  let body: UnregisterBody = {}
  try {
    body = (await req.json()) as UnregisterBody
  } catch {
    /* empty body is fine — revoke all of user's devices */
  }

  if (body.deviceToken) {
    await prisma.pushSubscription.updateMany({
      where: { userId: user.id, deviceToken: body.deviceToken, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  } else {
    await prisma.pushSubscription.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    await prisma.user.update({
      where: { id: user.id },
      data: { pushNotificationsEnabled: false },
    })
  }

  return NextResponse.json({ ok: true })
}
