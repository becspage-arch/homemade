import 'server-only'
import { prisma, TutorialStatus } from '@homemade/db'

/**
 * Region-aware "familiar comfort canon" loader for a food category
 * (phase_dish_type_001).
 *
 * The category featuring used to order by engagement then recency, which —
 * with no customers yet — collapsed to newest-first and surfaced only the
 * latest (world-cuisine) fills. This leads instead with the everyday UK/US
 * household canon (Tutorial.familiarCanon), weighted to the visitor's home
 * cuisine, so a UK/US cook sees spag bol, roast chicken and shepherd's pie at
 * the front. World food still appears below as discovery — it is not removed.
 *
 * Reuses the same `cf-ipcountry` signal as the seasonality engine (read by the
 * caller and passed in as `countryCode`). Region weighting is a gentle boost,
 * never an exclusion: a US visitor still sees British staples and vice versa.
 */

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
  cuisine: string | null
  subCategoryId: string | null
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
  cuisine: true,
  subCategoryId: true,
} as const

/** Map a visitor country to the home cuisines to weight first. */
export function homeCuisinesFor(countryCode: string | null): string[] {
  switch ((countryCode ?? '').toUpperCase()) {
    case 'GB': return ['british']
    case 'IE': return ['irish', 'british']
    case 'US': return ['american']
    case 'CA': return ['american', 'british']
    case 'AU': return ['australian', 'british']
    case 'NZ': return ['new-zealand', 'british']
    default: return [] // lead the general familiar canon (British/American-heavy)
  }
}

/** Broadly familiar Anglo cuisines, weighted above world food for any visitor. */
const BROAD_FAMILIAR = new Set(['british', 'american', 'italian', 'french'])

function score(t: CardSelect, home: string[], now: number): number {
  let n = 0
  const c = (t.cuisine ?? '').toLowerCase()
  if (home.includes(c)) n += 5
  else if (BROAD_FAMILIAR.has(c)) n += 2
  if (t.hero) n += 2 // a real card photo leads better
  // mild recency tiebreak (newer first), scaled small so it never dominates
  if (t.publishedAt) n += Math.max(0, 1 - (now - t.publishedAt.getTime()) / (1000 * 60 * 60 * 24 * 365))
  return n
}

/**
 * Familiar-canon recipes for a food category, region-weighted. Pulls the canon
 * pool, scores in memory (home cuisine → hero → recency), returns the top N.
 */
export async function loadFamiliarForCategory(opts: {
  categoryId: string
  countryCode: string | null
  limit?: number
}): Promise<CardSelect[]> {
  const limit = opts.limit ?? 12
  const home = homeCuisinesFor(opts.countryCode)
  const candidates = await prisma.tutorial.findMany({
    where: {
      categoryId: opts.categoryId,
      status: TutorialStatus.PUBLISHED,
      familiarCanon: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 200,
    select: CARD_SELECT,
  })
  const now = Date.now()
  return candidates
    .map((t) => ({ t: t as CardSelect, s: score(t as CardSelect, home, now) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.t)
}
