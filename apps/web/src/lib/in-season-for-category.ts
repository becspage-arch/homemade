import 'server-only'
import { prisma, TutorialStatus } from '@homemade/db'
import { seasonalityScore } from './seasonality'

interface CardSelect {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: string
  totalMinutes: number | null
  timeMinutes: number | null
  dietaryFlags: string[]
  category: { slug: string; name: string }
  hero: { cloudflareId: string | null; r2Key: string | null; alt: string | null } | null
  publishedAt: Date | null
  categoryId: string
  mood: string[]
  season: string | null
  cuisine: string | null
  mealType: string | null
}

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  difficulty: true,
  totalMinutes: true,
  timeMinutes: true,
  dietaryFlags: true,
  category: { select: { slug: true, name: true } },
  hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
  publishedAt: true,
  categoryId: true,
  mood: true,
  season: true,
  cuisine: true,
  mealType: true,
} as const

/**
 * In-season tutorials for a single category. Mirrors the homepage
 * seasonality logic: pull a candidate pool, score each in memory,
 * return the top N with non-zero score.
 */
export async function loadInSeasonForCategory(opts: {
  categoryId: string
  now: Date
  countryCode: string | null
  limit?: number
}): Promise<CardSelect[]> {
  const limit = opts.limit ?? 8
  const candidates = await prisma.tutorial.findMany({
    where: {
      categoryId: opts.categoryId,
      status: TutorialStatus.PUBLISHED,
    },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    select: CARD_SELECT,
  })
  return candidates
    .map((t) => ({
      t,
      score: seasonalityScore(t, { date: opts.now, countryCode: opts.countryCode }),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.t as CardSelect)
}
