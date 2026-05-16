import { NextResponse } from 'next/server'
import { prisma, UserRole, TutorialStatus } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'

/**
 * Cmd-K search endpoint. Returns tutorial titles + (for EDITOR / ADMIN) user
 * emails matching `q`. Capped at 20 each. Read-only.
 */
export async function GET(req: Request) {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.CREATOR)) {
    return NextResponse.json({ tutorials: [], users: [] }, { status: 401 })
  }

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim()
  if (!q) {
    return NextResponse.json({ tutorials: [], users: [] })
  }

  const tutorialWhere =
    user.role === UserRole.CREATOR
      ? { creatorId: user.id, OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { slug: { contains: q, mode: 'insensitive' as const } }] }
      : { OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { slug: { contains: q, mode: 'insensitive' as const } }] }

  const [tutorials, users] = await Promise.all([
    prisma.tutorial.findMany({
      where: tutorialWhere,
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: { select: { name: true } },
      },
    }),
    hasRoleAtLeast(user, UserRole.EDITOR)
      ? prisma.user.findMany({
          where: {
            OR: [
              { email: { contains: q, mode: 'insensitive' as const } },
              { name: { contains: q, mode: 'insensitive' as const } },
              { displayHandle: { contains: q, mode: 'insensitive' as const } },
            ],
          },
          orderBy: { updatedAt: 'desc' },
          take: 20,
          select: { id: true, email: true, name: true, displayHandle: true, role: true },
        })
      : Promise.resolve([]),
  ])

  return NextResponse.json({
    tutorials: tutorials.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      status: t.status as TutorialStatus,
      category: t.category?.name ?? null,
    })),
    users,
  })
}
