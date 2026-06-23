/**
 * Pure tag-axis vocabulary for the pattern category filters — no DB imports, so
 * it's safe to pull into the client grid. The server-side derivation lives in
 * pattern-tag-facets.ts and re-uses these.
 */

export type PatternTagAxis = 'OCCASION' | 'SEASON' | 'STYLE' | 'SUBJECT' | 'AUDIENCE'

/** Filter axes in the order they render in the sidebar. */
export const TAG_AXES: PatternTagAxis[] = [
  'SUBJECT',
  'STYLE',
  'OCCASION',
  'SEASON',
  'AUDIENCE',
]

/** Human label for each axis heading. */
export const TAG_AXIS_LABEL: Record<PatternTagAxis, string> = {
  SUBJECT: 'Subject',
  STYLE: 'Style',
  OCCASION: 'Occasion',
  SEASON: 'Season',
  AUDIENCE: 'Audience',
}

/** The URL query key each axis filters on. */
export const TAG_AXIS_PARAM: Record<PatternTagAxis, string> = {
  SUBJECT: 'subject',
  STYLE: 'style',
  OCCASION: 'occasion',
  SEASON: 'season',
  AUDIENCE: 'audience',
}

export interface TagFacetTerm {
  slug: string
  name: string
  count: number
}

export type TagFacets = Record<PatternTagAxis, TagFacetTerm[]>

export const emptyTagFacets = (): TagFacets => ({
  SUBJECT: [],
  STYLE: [],
  OCCASION: [],
  SEASON: [],
  AUDIENCE: [],
})
