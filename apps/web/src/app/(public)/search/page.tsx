import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma, TutorialStatus } from '@homemade/db'
import { searchTutorials, isSearchConfigured } from '@homemade/search'
import { TutorialCard } from '@/components/public/tutorial-card'
import { mediaUrl } from '@/lib/media'
import { SearchForm } from './search-form'

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
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
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

  const results = !isEmpty
    ? await searchTutorials({
        q,
        categorySlug,
        difficulty,
        season,
        perPage: RESULTS_PER_PAGE,
      })
    : null

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

      {configured && results && (
        <section aria-live="polite">
          <p className="search-summary">
            {results.found === 0
              ? `Nothing matched ${q ? `"${q}"` : 'those filters'} yet.`
              : `${results.found} result${results.found === 1 ? '' : 's'}${q ? ` for "${q}"` : ''}`}
          </p>

          {results.hits.length > 0 ? (
            <div className="search-grid">
              {results.hits.map((hit) => (
                <TutorialCard
                  key={hit.document.id}
                  href={`/${hit.document.categorySlug}/${hit.document.slug}`}
                  title={hit.document.title}
                  excerpt={hit.document.excerpt}
                  heroUrl={mediaUrl({ r2Key: hit.document.heroR2Key, cloudflareId: hit.document.heroCloudflareId }, 'card')}
                  difficulty={hit.document.difficulty}
                  season={hit.document.season}
                  categoryName={hit.document.categoryName}
                />
              ))}
            </div>
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
              {recents.map((t) => (
                <TutorialCard
                  key={t.id}
                  href={`/${t.category.slug}/${t.slug}`}
                  title={t.title}
                  excerpt={t.excerpt}
                  heroUrl={mediaUrl(t.hero, 'card')}
                  difficulty={t.difficulty}
                  season={t.season}
                  categoryName={t.category.name}
                />
              ))}
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
