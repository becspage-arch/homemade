import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * POST /api/me/crochet-stash/hooks
 *   body: { slug }
 *   Adds the CrochetHook slug to User.myHooks. Validates against the
 *   master table; rejects slugs that don't exist.
 */

interface PostPayload {
  slug: string
}

export async function POST(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let payload: PostPayload
  try {
    payload = (await request.json()) as PostPayload
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  if (!payload.slug || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(payload.slug)) {
    return NextResponse.json({ error: 'invalid slug' }, { status: 400 })
  }

  const hook = await prisma.crochetHook.findUnique({
    where: { slug: payload.slug },
    select: { slug: true, canonicalName: true, mmSize: true, ukSize: true, usSize: true },
  })
  if (!hook) return NextResponse.json({ error: 'hook not found' }, { status: 404 })

  const existing = Array.isArray(user.myHooks) ? user.myHooks : []
  if (existing.includes(hook.slug)) {
    return NextResponse.json(hook)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { myHooks: [...existing, hook.slug] },
  })

  return NextResponse.json(hook)
}
