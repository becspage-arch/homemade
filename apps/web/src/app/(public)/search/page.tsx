import Link from 'next/link'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { prisma, TutorialStatus } from '@homemade/db'
import { searchTutorials, isSearchConfigured } from '@homemade/search'
import { TutorialCard } from '@/components/public/tutorial-card'
import { mediaSrcSet } from '@/lib/media'
import { captureServerEvent } from '@/lib/posthog'
import { checkRateLimit } from '@/lib/ratelimit'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { SearchForm } from './search-form'
import { SearchResults } from './search-results'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import { mediaUrl } from '@/lib/media'

import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

import './search-page.css'

export const dynamic = 'force-dynamic'

// Pattern-led categories: the search index only holds tutorials, so for these
// we query the Pattern library directly by name/description.
const PATTERN_TYPES: Record<string, 'CROSS_STITCH' | 'KNITTING_CHART' | 'CROCHET_CHART'> = {
  'cross-stitch': 'CROSS_STITCH',
  knitting: 'KNITTING_CHART',
  crochet: 'CROCHET_CHART',
}
const DIFFICULTIES = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])

// Search-results pages are intentionally noindex — Google's "soft 404"
// guideline. The canonical / hreflang still point at /search so any
// crawlable links back to /search resolve to the unfiltered surface.
export const metadata: Metadata = buildPublicMetadata({
  title: 'Search Homemade tutorials',
  description: 'Find recipes, techniques, growing guides and patterns across the Homemade library.',
  path: '/search',
  ogType: 'website',
  index: false,
})

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const RESULTS_PER_PAGE = 24

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = pickString(params.q)?.trim() ?? ''
  const categorySlug = pickString(params.category) ?? null
  const difficulty = pickString(params.difficulty) ?? null
  const season = pickString(params.season) ?? null

  const categories = await prisma.category.findMany({
    where: { isPublicVisible: true },
    orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    select: { slug: true, name: true },
  })

  const configured = isSearchConfigured()

  // Empty query, no filters → show recently published tutorials so the page
  // feels alive even with no input.
  const isEmpty = q === '' && !categorySlug && !difficulty && !season
  const recents = isEmpty
    ? await prisma.tutorial.findMany({
        where: { status: TutorialStatus.PUBLISHED },
        orderBy: [{ publishedAt: 'desc' }],
        take: 12,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          difficulty: true,
          season: true,
          category: { select: { slug: true, name: true } },
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      })
    : []

  // IP-keyed rate limit on actual search queries. Skip the empty/recent state
  // since that's just landing on /search with no input.
  let rateLimited = false
  if (!isEmpty) {
    const ip = await getClientIp()
    const limit = await checkRateLimit('searchQuery', ip)
    if (!limit.allowed) rateLimited = true
  }

  const results = !isEmpty && !rateLimited
    ? await searchTutorials({
        q,
        categorySlug,
        difficulty,
        season,
        perPage: RESULTS_PER_PAGE,
      })
    : null

  // Pattern-led categories: search the Pattern library directly (the tutorial
  // index doesn't cover patterns). Runs even when the tutorial search service
  // isn't configured, since it's a direct DB query.
  const patternType = categorySlug ? PATTERN_TYPES[categorySlug] : null
  const patternHits = patternType && q !== '' && !rateLimited
    ? await prisma.pattern.findMany({
        where: {
          type: patternType,
          ownerUserId: null,
          visibility: 'PUBLIC',
          publishedAt: { not: null },
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
          ...(difficulty && DIFFICULTIES.has(difficulty) ? { difficulty: difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' } : {}),
        },
        orderBy: { publishedAt: 'desc' },
        take: RESULTS_PER_PAGE,
        select: {
          id: true,
          slug: true,
          name: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
          thumbnail: { select: { cloudflareId: true, r2Key: true } },
        },
      })
    : []

  // Needlework lives on a separate model (NeedleworkPattern), so it has its own
  // direct-DB branch — same shape as the Pattern branch above.
  const isNeedlework = categorySlug === 'needlework'
  const needleworkHits = isNeedlework && q !== '' && !rateLimited
    ? await prisma.needleworkPattern.findMany({
        where: {
          ownerUserId: null,
          visibility: 'PUBLIC',
          publishedAt: { not: null },
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
          ...(difficulty && DIFFICULTIES.has(difficulty) ? { difficulty: difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' } : {}),
        },
        orderBy: { publishedAt: 'desc' },
        take: RESULTS_PER_PAGE,
        select: {
          id: true,
          slug: true,
          name: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
          thumbnail: { select: { cloudflareId: true, r2Key: true } },
        },
      })
    : []

  if (results) {
    const dbUser = await getCurrentDbUser()
    const ip = await getClientIp()
    void captureServerEvent({
      event: 'search_query',
      distinctId: dbUser?.clerkId ?? `anon:${ip}`,
      properties: {
        query: q,
        resultCount: results.found,
        filters: {
          category: categorySlug ?? undefined,
          difficulty: difficulty ?? undefined,
          season: season ?? undefined,
        },
        identified: Boolean(dbUser),
      },
    })
  }

  return (
    <div className="search-page">
      <header className="search-header">
        <h1 className="search-heading">Search</h1>
        <SearchForm
          defaultQuery={q}
          defaultCategory={categorySlug}
          defaultDifficulty={difficulty}
          defaultSeason={season}
          categories={categories}
        />
      </header>

      {patternType && q !== '' && !rateLimited && (
        <section aria-live="polite">
          <p className="search-summary">
            {patternHits.length === 0
              ? `No patterns matched "${q}" yet.`
              : `${patternHits.length} pattern${patternHits.length === 1 ? '' : 's'} for "${q}"`}
          </p>
          {patternHits.length > 0 && (
            <ul className="search-pattern-grid">
              {patternHits.map((p) => (
                <li key={p.id} className="search-pattern-card">
                  <Link href={`/${categorySlug}/patterns/${p.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={patternHeroUrl({ id: p.id, hero: p.hero, thumbnail: p.thumbnail }, 'card')} alt={p.name} loading="lazy" />
                    <span>{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isNeedlework && q !== '' && !rateLimited && (
        <section aria-live="polite">
          <p className="search-summary">
            {needleworkHits.length === 0
              ? `No patterns matched "${q}" yet.`
              : `${needleworkHits.length} pattern${needleworkHits.length === 1 ? '' : 's'} for "${q}"`}
          </p>
          {needleworkHits.length > 0 && (
            <ul className="search-pattern-grid">
              {needleworkHits.map((p) => (
                <li key={p.id} className="search-pattern-card">
                  <Link href={`/needlework/patterns/${p.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(p.hero ?? p.thumbnail, 'card') ?? ''} alt={p.name} loading="lazy" />
                    <span>{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!configured && !patternType && !isNeedlework && (
        <p className="search-empty">
          Search is not yet wired up in this environment. Try the category
          pages from the menu while we finish setting it up.
        </p>
      )}

      {rateLimited && (
        <p className="search-empty">
          Search is busy right now. Try again in a minute.
        </p>
      )}

      {configured && results && (
        <section aria-live="polite">
          <p className="search-summary">
            {results.found === 0
              ? `Nothing matched ${q ? `"${q}"` : 'those filters'} yet.`
              : `${results.found} result${results.found === 1 ? '' : 's'}${q ? ` for "${q}"` : ''}`}
          </p>

          {results.hits.length > 0 ? (
            <SearchResults
              query={q}
              filters={{
                category: categorySlug ?? undefined,
                difficulty: difficulty ?? undefined,
                season: season ?? undefined,
              }}
              totalResults={results.found}
              hits={results.hits.map((hit) => {
                const heroSource = {
                  r2Key: hit.document.heroR2Key,
                  cloudflareId: hit.document.heroCloudflareId,
                }
                const card = mediaSrcSet(heroSource, 'card', ['public'])
                return {
                  id: hit.document.id,
                  slug: hit.document.slug,
                  categorySlug: hit.document.categorySlug,
                  categoryName: hit.document.categoryName,
                  title: hit.document.title,
                  excerpt: hit.document.excerpt,
                  heroUrl: card?.src ?? null,
                  heroSrcSet: card?.srcSet ?? null,
                  difficulty: hit.document.difficulty,
                  season: hit.document.season,
                }
              })}
            />
          ) : (
            <div className="search-no-results">
              <p>
                <Link href="/search" className="search-link">
                  clear filters
                </Link>{' '}
                or try a different word.
              </p>
            </div>
          )}
        </section>
      )}

      {configured && isEmpty && (
        <section>
          <p className="search-summary">Recently published</p>
          {recents.length > 0 ? (
            <div className="search-grid">
              {recents.map((t) => {
                const card = mediaSrcSet(t.hero, 'card', ['public'])
                return (
                  <TutorialCard
                    key={t.id}
                    href={`/${t.category.slug}/${t.slug}`}
                    title={t.title}
                    excerpt={t.excerpt}
                    heroUrl={card?.src ?? null}
                    heroSrcSet={card?.srcSet}
                    difficulty={t.difficulty}
                    season={t.season}
                    categoryName={t.category.name}
                  />
                )
              })}
            </div>
          ) : (
            <p className="search-summary">No tutorials published yet.</p>
          )}
        </section>
      )}
    </div>
  )
}

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

async function getClientIp(): Promise<string> {
  const h = await headers()
  // Cloudflare puts the original client IP in cf-connecting-ip; ALB rewrites
  // x-forwarded-for. Fall back to a coarse bucket so the limiter has *something*.
  return (
    h.get('cf-connecting-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}
