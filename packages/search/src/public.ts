/**
 * Public search — server-side helpers that wrap the search-only client.
 *
 * Even though the search-only API key is safe in the browser, we keep search
 * server-side so the public bundle stays light and the URL is a clean
 * shareable `/search?q=...` rather than a client-state route.
 */

import { getSearchClient } from './client'
import {
  TUTORIALS_COLLECTION,
  type TutorialDoc,
} from './schemas'

export interface SearchTutorialsParams {
  q: string
  categorySlug?: string | null
  difficulty?: string | null
  season?: string | null
  page?: number
  perPage?: number
}

export interface SearchHit<T> {
  document: T
  highlights?: { field: string; snippet?: string; matched_tokens?: string[] }[]
}

export interface SearchResults<T> {
  found: number
  page: number
  perPage: number
  hits: SearchHit<T>[]
  facets: Record<string, { value: string; count: number }[]>
}

const EMPTY: SearchResults<TutorialDoc> = {
  found: 0,
  page: 1,
  perPage: 0,
  hits: [],
  facets: {},
}

export async function searchTutorials(
  params: SearchTutorialsParams,
): Promise<SearchResults<TutorialDoc>> {
  const client = getSearchClient()
  if (!client) return { ...EMPTY, perPage: params.perPage ?? 20 }

  const filters: string[] = []
  if (params.categorySlug) {
    filters.push(`categorySlug:=${escapeFilter(params.categorySlug)}`)
  }
  if (params.difficulty) {
    filters.push(`difficulty:=${escapeFilter(params.difficulty)}`)
  }
  if (params.season) {
    filters.push(`season:=${escapeFilter(params.season)}`)
  }

  const q = params.q.trim()
  const isEmptyQuery = q === ''

  try {
    const result = await client
      .collections(TUTORIALS_COLLECTION)
      .documents()
      .search({
        q: isEmptyQuery ? '*' : q,
        query_by: 'title,subtitle,excerpt,bodyText,categoryName',
        query_by_weights: '6,4,3,1,2',
        // When the user types a query, prefer recency-tie-breaking; for the
        // empty state surface most-recent first.
        sort_by: isEmptyQuery
          ? 'publishedAt:desc'
          : '_text_match:desc,publishedAt:desc',
        filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
        facet_by: 'categorySlug,difficulty,season',
        per_page: params.perPage ?? 20,
        page: params.page ?? 1,
        highlight_full_fields: 'title,excerpt',
        snippet_threshold: 30,
      })

    const facets: Record<string, { value: string; count: number }[]> = {}
    for (const f of result.facet_counts ?? []) {
      if (!f.field_name) continue
      facets[f.field_name] = (f.counts ?? []).map((c) => ({
        value: c.value,
        count: c.count,
      }))
    }

    return {
      found: result.found,
      page: result.page ?? params.page ?? 1,
      perPage: params.perPage ?? 20,
      hits: (result.hits ?? []).map((h) => ({
        document: h.document as TutorialDoc,
        highlights: (h.highlights ?? []).map((hl) => ({
          field: hl.field,
          snippet: hl.snippet,
          matched_tokens: hl.matched_tokens?.map((token) =>
            typeof token === 'string' ? token : String(token),
          ),
        })),
      })),
      facets,
    }
  } catch {
    // Network failure, schema missing, etc. — return an empty result rather
    // than 500ing the search page.
    return { ...EMPTY, perPage: params.perPage ?? 20 }
  }
}

function escapeFilter(value: string): string {
  // Typesense filter syntax: wrap in backticks to be safe with hyphens / spaces.
  return '`' + value.replace(/`/g, '') + '`'
}
