import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { PUSH_CATEGORIES } from '@/lib/push-notifications'

export const dynamic = 'force-dynamic'

interface CategoriesBody {
  categories?: string[]
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  let body: CategoriesBody = {}
  try {
    body = (await req.json()) as CategoriesBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowed = new Set<string>(PUSH_CATEGORIES)
  const categories = Array.isArray(body.categories)
    ? body.categories.filter((c): c is string => typeof c === 'string' && allowed.has(c))
    : []

  await prisma.pushSubscription.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { enabledCategories: categories },
  })

  return NextResponse.json({ ok: true, categories })
}
