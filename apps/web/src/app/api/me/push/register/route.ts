import { NextResponse } from 'next/server'
import { prisma, PushPlatform } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { PUSH_CATEGORIES } from '@/lib/push-notifications'

export const dynamic = 'force-dynamic'

interface RegisterBody {
  platform?: string
  deviceToken?: string
  deviceId?: string | null
  userAgent?: string | null
  enabledCategories?: string[]
}

function parsePlatform(value: unknown): PushPlatform | null {
  if (value === 'IOS' || value === 'ANDROID' || value === 'WEB') return value
  return null
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  let body: RegisterBody
  try {
    body = (await req.json()) as RegisterBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const platform = parsePlatform(body.platform)
  if (!platform) {
    return NextResponse.json({ error: 'Bad platform' }, { status: 400 })
  }
  if (typeof body.deviceToken !== 'string' || body.deviceToken.length < 8) {
    return NextResponse.json({ error: 'Bad deviceToken' }, { status: 400 })
  }

  const allowed = new Set<string>(PUSH_CATEGORIES)
  const enabledCategories =
    Array.isArray(body.enabledCategories)
      ? body.enabledCategories.filter((c): c is string => typeof c === 'string' && allowed.has(c))
      : Array.from(allowed)

  // Upsert by (userId, platform, deviceToken). Reinstalls reuse the row when
  // the token survives; new tokens insert fresh and the old row gets revoked
  // lazily when its next delivery fails.
  const existing = await prisma.pushSubscription.findFirst({
    where: {
      userId: user.id,
      platform,
      deviceToken: body.deviceToken,
    },
  })

  if (existing) {
    await prisma.pushSubscription.update({
      where: { id: existing.id },
      data: {
        deviceId: body.deviceId ?? existing.deviceId,
        userAgent: body.userAgent ?? existing.userAgent,
        enabledCategories,
        revokedAt: null,
        lastActiveAt: new Date(),
      },
    })
  } else {
    await prisma.pushSubscription.create({
      data: {
        userId: user.id,
        platform,
        deviceToken: body.deviceToken,
        deviceId: body.deviceId ?? null,
        userAgent: body.userAgent ?? null,
        enabledCategories,
      },
    })
  }

  // Flip the master toggle on first registration so the server-side gate
  // in sendPushToUser starts dispatching.
  if (!user.pushNotificationsEnabled) {
    await prisma.user.update({
      where: { id: user.id },
      data: { pushNotificationsEnabled: true },
    })
  }

  return NextResponse.json({ ok: true })
}
