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

import './search-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search · homemade',
  robots: { index: false, follow: false },
}

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

      {!configured && (
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
