import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'

export const dynamic = 'force-dynamic'

/**
 * Lightweight recipe title search for the meal-plan add picker. Published
 * library recipes only, title contains match, capped at 8. Public (recipe
 * titles are public); no Typesense dependency for this small lookup.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ results: [] })

  const rows = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      type: 'RECIPE',
      title: { contains: q, mode: 'insensitive' },
    },
    select: { slug: true, title: true },
    take: 8,
    orderBy: { title: 'asc' },
  })
  return NextResponse.json({ results: rows })
}
