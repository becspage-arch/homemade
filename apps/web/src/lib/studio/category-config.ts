/**
 * Per-Studio category metadata. Shared by every Studio surface (top-nav,
 * landing hero, category-page CTA card) so a new Studio registers here
 * once and the wrappers pick up the rest.
 *
 * Each Studio still owns its own toolbar / chart engine / panels  -  this
 * file only describes the wrapper-level shell, not the editor itself.
 */

export type StudioCategorySlug = 'cross-stitch' | 'crochet' | 'knitting' | 'needlework'

export interface StudioCategoryConfig {
  slug: StudioCategorySlug
  /** "Cross-stitch", "Crochet", "Knitting", "Needlework". */
  displayName: string
  /** "Cross-stitch Studio" / etc. */
  studioName: string
  /** "stitching" / "crocheting" / "knitting" / "embroidering"  -  used in
   *  "Continue [verb]" rail title. */
  continueVerb: string
  /** Body text for the category-page Studio CTA card. */
  ctaBody: string
  /** Where the Studio lives. */
  studioHref: string
  /** Where the category lives. */
  categoryHref: string
  /** Where the library lives if different from category root. */
  libraryHref: string
}

export const STUDIO_CATEGORY_CONFIG: Record<StudioCategorySlug, StudioCategoryConfig> = {
  'cross-stitch': {
    slug: 'cross-stitch',
    displayName: 'Cross-stitch',
    studioName: 'Cross-stitch Studio',
    continueVerb: 'stitching',
    ctaBody:
      'Open a pattern, mark your progress, design your own from a photo, or start from a blank canvas. Free to use.',
    studioHref: '/studio/cross-stitch',
    categoryHref: '/cross-stitch',
    libraryHref: '/cross-stitch/patterns',
  },
  crochet: {
    slug: 'crochet',
    displayName: 'Crochet',
    studioName: 'Crochet Studio',
    continueVerb: 'crocheting',
    ctaBody:
      'Open a pattern, mark each row as you go, switch between written and chart, or start your own project. Free to use.',
    studioHref: '/studio/crochet',
    categoryHref: '/crochet',
    libraryHref: '/crochet/patterns',
  },
  knitting: {
    slug: 'knitting',
    displayName: 'Knitting',
    studioName: 'Knitting Studio',
    continueVerb: 'knitting',
    ctaBody:
      'Open a pattern, mark each row as you go, switch between written and chart, or follow a schematic. Free to use.',
    studioHref: '/studio/knitting',
    categoryHref: '/knitting',
    libraryHref: '/knitting/patterns',
  },
  needlework: {
    slug: 'needlework',
    displayName: 'Needlework',
    studioName: 'Needlework Studio',
    continueVerb: 'embroidering',
    ctaBody:
      'Open a pattern, mark counted threads on the grid or annotate a surface design, save your place, print a clean PDF. Free to use.',
    studioHref: '/studio/needlework',
    categoryHref: '/needlework',
    libraryHref: '/needlework',
  },
}

export function isStudioCategorySlug(value: string): value is StudioCategorySlug {
  return value in STUDIO_CATEGORY_CONFIG
}

/**
 * Pick the right Studio category from a /studio/<slug> pathname. Returns
 * null if the path is outside a known Studio (sewing, settings, etc.)
 * so the caller can fall back to a plain Homemade-only nav.
 */
export function studioCategoryFromPath(pathname: string): StudioCategoryConfig | null {
  const match = pathname.match(/^\/studio\/([^/?#]+)/)
  const slug = match?.[1]
  if (!slug) return null
  if (isStudioCategorySlug(slug)) return STUDIO_CATEGORY_CONFIG[slug]
  return null
}
