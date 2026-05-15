'use client'

import { TutorialCard } from '@/components/public/tutorial-card'
import { captureClientEvent } from '@/lib/client-analytics'

interface SearchResultHit {
  id: string
  slug: string
  categorySlug: string
  categoryName: string
  title: string
  excerpt: string | null
  heroUrl: string | null
  heroSrcSet: string | null
  difficulty: string
  season: string | null
}

interface SearchResultsProps {
  query: string
  filters: {
    category?: string
    difficulty?: string
    season?: string
  }
  totalResults: number
  hits: SearchResultHit[]
}

/**
 * Client wrapper around the search results grid. Each card click fires
 * `search_result_clicked` (fire-and-forget, doesn't delay navigation) with
 * the query + filters + 0-indexed position + tutorial identifiers.
 */
export function SearchResults({ query, filters, totalResults, hits }: SearchResultsProps) {
  return (
    <div className="search-grid">
      {hits.map((hit, position) => (
        <span
          key={hit.id}
          className="search-result-card-wrap"
          onClickCapture={() => {
            captureClientEvent('search_result_clicked', {
              query,
              filters,
              position,
              tutorialId: hit.id,
              tutorialSlug: hit.slug,
              categorySlug: hit.categorySlug,
              totalResults,
            })
          }}
        >
          <TutorialCard
            href={`/${hit.categorySlug}/${hit.slug}`}
            title={hit.title}
            excerpt={hit.excerpt}
            heroUrl={hit.heroUrl}
            heroSrcSet={hit.heroSrcSet}
            difficulty={hit.difficulty}
            season={hit.season}
            categoryName={hit.categoryName}
          />
        </span>
      ))}
    </div>
  )
}
