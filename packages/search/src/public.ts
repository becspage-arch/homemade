/**
 * Public search — server-side helpers that wrap the search-only client.
 *
 * Even though the search-only API key is safe in the browser, we keep search
 * server-side so the public bundle stays light and the URL is a clean
 * shareable `/search?q=...` rather than a client-state route.
 */

import { getSearchClient } from './client'
import {
  CROCHET_PATTERNS_COLLECTION,
  PATTERNS_COLLECTION,
  TUTORIALS_COLLECTION,
  type CrochetPatternDoc,
  type PatternDoc,
  type TutorialDoc,
} from './schemas'

export interface SearchTutorialsParams {
  q: string
  categorySlug?: string | null
  difficulty?: string | null
  season?: string | null
  mealType?: string | null
  cuisine?: string | null
  dietaryFlag?: string | null
  practiceType?: string | null
  timeBand?: string | null
  practiceDepth?: string | null
  containerFriendly?: boolean | null
  indoorFriendly?: boolean | null
  region?: string | null
  plantingMonth?: string | null
  harvestMonth?: string | null
  foundationalOnly?: boolean
  type?: string | null
  page?: number
  perPage?: number
}

export interface SearchPatternsParams {
  q: string
  categorySlug?: string | null
  subCategorySlug?: string | null
  difficulty?: string | null
  designerSlug?: string | null
  hasBackstitch?: boolean | null
  hasFrenchKnots?: boolean | null
  premium?: boolean | null
  page?: number
  perPage?: number
}

export interface SearchCrochetPatternsParams {
  q: string
  categorySlug?: string | null
  subCategorySlug?: string | null
  difficulty?: string | null
  designerSlug?: string | null
  shape?: string | null
  yarnWeight?: string | null
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

const emptyResult = <T>(perPage: number): SearchResults<T> => ({
  found: 0,
  page: 1,
  perPage,
  hits: [],
  facets: {},
})

export async function searchTutorials(
  params: SearchTutorialsParams,
): Promise<SearchResults<TutorialDoc>> {
  const perPage = params.perPage ?? 20
  const client = getSearchClient()
  if (!client) return emptyResult<TutorialDoc>(perPage)

  const filters: string[] = []
  if (params.categorySlug) filters.push(`categorySlug:=${escapeFilter(params.categorySlug)}`)
  if (params.difficulty) filters.push(`difficulty:=${escapeFilter(params.difficulty)}`)
  if (params.season) filters.push(`season:=${escapeFilter(params.season)}`)
  if (params.mealType) filters.push(`mealType:=${escapeFilter(params.mealType)}`)
  if (params.cuisine) filters.push(`cuisine:=${escapeFilter(params.cuisine)}`)
  if (params.dietaryFlag) filters.push(`dietaryFlags:=${escapeFilter(params.dietaryFlag)}`)
  if (params.practiceType) filters.push(`practiceType:=${escapeFilter(params.practiceType)}`)
  if (params.timeBand) filters.push(`timeBand:=${escapeFilter(params.timeBand)}`)
  if (params.practiceDepth) filters.push(`practiceDepth:=${escapeFilter(params.practiceDepth)}`)
  if (params.containerFriendly !== null && params.containerFriendly !== undefined)
    filters.push(`containerFriendly:=${params.containerFriendly}`)
  if (params.indoorFriendly !== null && params.indoorFriendly !== undefined)
    filters.push(`indoorFriendly:=${params.indoorFriendly}`)
  if (params.region) filters.push(`regionsApplicable:=${escapeFilter(params.region)}`)
  if (params.plantingMonth) filters.push(`plantingMonths:=${escapeFilter(params.plantingMonth)}`)
  if (params.harvestMonth) filters.push(`harvestMonths:=${escapeFilter(params.harvestMonth)}`)
  if (params.foundationalOnly) filters.push('foundational:=true')
  if (params.type) filters.push(`type:=${escapeFilter(params.type)}`)

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
        sort_by: isEmptyQuery
          ? 'publishedAt:desc'
          : '_text_match:desc,publishedAt:desc',
        filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
        facet_by:
          'categorySlug,difficulty,season,mealType,cuisine,dietaryFlags,practiceType,timeBand,practiceDepth,foundational',
        per_page: perPage,
        page: params.page ?? 1,
        highlight_full_fields: 'title,excerpt',
        snippet_threshold: 30,
      })

    return shapeResult<TutorialDoc>(result, perPage, params.page)
  } catch {
    return emptyResult<TutorialDoc>(perPage)
  }
}

export async function searchPatterns(
  params: SearchPatternsParams,
): Promise<SearchResults<PatternDoc>> {
  const perPage = params.perPage ?? 24
  const client = getSearchClient()
  if (!client) return emptyResult<PatternDoc>(perPage)

  const filters: string[] = []
  if (params.categorySlug) filters.push(`categorySlug:=${escapeFilter(params.categorySlug)}`)
  if (params.subCategorySlug) filters.push(`subCategorySlug:=${escapeFilter(params.subCategorySlug)}`)
  if (params.difficulty) filters.push(`difficulty:=${escapeFilter(params.difficulty)}`)
  if (params.designerSlug) filters.push(`designerSlug:=${escapeFilter(params.designerSlug)}`)
  if (params.hasBackstitch === true) filters.push('hasBackstitch:=true')
  if (params.hasFrenchKnots === true) filters.push('hasFrenchKnots:=true')
  if (params.premium !== null && params.premium !== undefined)
    filters.push(`premium:=${params.premium}`)

  const q = params.q.trim()
  const isEmptyQuery = q === ''

  try {
    const result = await client
      .collections(PATTERNS_COLLECTION)
      .documents()
      .search({
        q: isEmptyQuery ? '*' : q,
        query_by: 'name,description,designerName,subCategoryName',
        query_by_weights: '6,3,4,2',
        sort_by: isEmptyQuery
          ? 'publishedAt:desc'
          : '_text_match:desc,publishedAt:desc',
        filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
        facet_by: 'categorySlug,subCategorySlug,difficulty,designerSlug,hasBackstitch,hasFrenchKnots,premium',
        per_page: perPage,
        page: params.page ?? 1,
      })

    return shapeResult<PatternDoc>(result, perPage, params.page)
  } catch {
    return emptyResult<PatternDoc>(perPage)
  }
}

export async function searchCrochetPatterns(
  params: SearchCrochetPatternsParams,
): Promise<SearchResults<CrochetPatternDoc>> {
  const perPage = params.perPage ?? 24
  const client = getSearchClient()
  if (!client) return emptyResult<CrochetPatternDoc>(perPage)

  const filters: string[] = []
  if (params.categorySlug) filters.push(`categorySlug:=${escapeFilter(params.categorySlug)}`)
  if (params.subCategorySlug) filters.push(`subCategorySlug:=${escapeFilter(params.subCategorySlug)}`)
  if (params.difficulty) filters.push(`difficulty:=${escapeFilter(params.difficulty)}`)
  if (params.designerSlug) filters.push(`designerSlug:=${escapeFilter(params.designerSlug)}`)
  if (params.shape) filters.push(`shape:=${escapeFilter(params.shape)}`)
  if (params.yarnWeight) filters.push(`yarnWeight:=${escapeFilter(params.yarnWeight)}`)

  const q = params.q.trim()
  const isEmptyQuery = q === ''

  try {
    const result = await client
      .collections(CROCHET_PATTERNS_COLLECTION)
      .documents()
      .search({
        q: isEmptyQuery ? '*' : q,
        query_by: 'name,description,designerName,subCategoryName',
        query_by_weights: '6,3,4,2',
        sort_by: isEmptyQuery
          ? 'publishedAt:desc'
          : '_text_match:desc,publishedAt:desc',
        filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
        facet_by: 'categorySlug,subCategorySlug,difficulty,designerSlug,shape,yarnWeight',
        per_page: perPage,
        page: params.page ?? 1,
      })

    return shapeResult<CrochetPatternDoc>(result, perPage, params.page)
  } catch {
    return emptyResult<CrochetPatternDoc>(perPage)
  }
}

interface RawResultLike {
  found: number
  page?: number
  hits?: ReadonlyArray<{
    document: unknown
    highlights?: ReadonlyArray<{
      field?: unknown
      snippet?: string
      matched_tokens?: ReadonlyArray<unknown>
    }>
  }>
  facet_counts?: ReadonlyArray<{
    field_name?: string
    counts?: ReadonlyArray<{ value: string; count: number }>
  }>
}

function shapeResult<T>(
  result: unknown,
  perPage: number,
  paramPage?: number,
): SearchResults<T> {
  const r = result as RawResultLike
  const facets: Record<string, { value: string; count: number }[]> = {}
  for (const f of r.facet_counts ?? []) {
    if (!f.field_name) continue
    facets[f.field_name] = (f.counts ?? []).map((c) => ({
      value: c.value,
      count: c.count,
    }))
  }

  return {
    found: r.found,
    page: r.page ?? paramPage ?? 1,
    perPage,
    hits: (r.hits ?? []).map((h) => ({
      document: h.document as T,
      highlights: (h.highlights ?? []).map((hl) => ({
        field: typeof hl.field === 'string' ? hl.field : '',
        snippet: hl.snippet,
        matched_tokens: hl.matched_tokens?.flat().map((token) => String(token)),
      })),
    })),
    facets,
  }
}

function escapeFilter(value: string): string {
  return '`' + value.replace(/`/g, '') + '`'
}
