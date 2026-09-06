import 'server-only'
import { prisma, Visibility } from '@homemade/db'

/**
 * Categories whose real library is PATTERNS, not tutorials. Cross-stitch
 * lives in the shared `Pattern` model (`type: 'CROSS_STITCH'`); crochet,
 * needlework, knitting and sewing each have their own table
 * (`CrochetPattern` / `NeedleworkPattern` / `KnittingPattern` /
 * `SewingPattern`). A tutorial count is the wrong number for any of these —
 * it undercounts (or, for crochet, zeroes out) the actual published library.
 *
 * Kept here rather than in `studio/generation/categories.ts` because this is
 * a display-only concern for admin count surfaces: it does not gate what the
 * generation pipeline may plan or publish, and knitting / needlework /
 * sewing have no `PatternCategoryConfig` entry there yet (no sign-off pass
 * on shelves + targets for them).
 */
export const PATTERN_LED_CATEGORY_SLUGS = [
  'cross-stitch',
  'crochet',
  'knitting',
  'needlework',
  'sewing',
] as const

export type PatternLedSlug = (typeof PATTERN_LED_CATEGORY_SLUGS)[number]

export function isPatternLedSlug(slug: string): slug is PatternLedSlug {
  return (PATTERN_LED_CATEGORY_SLUGS as readonly string[]).includes(slug)
}

export interface CraftPatternStats {
  /** PUBLIC + house-owned (ownerUserId null — sewing has no owner column). */
  published: number
  /** House-owned, not PUBLIC (PRIVATE/UNLISTED) — the pattern equivalent of "draft". */
  draft: number
  lastPublishedAt: Date | null
  /** Published count per sub-category id, for per-shelf breakdowns. */
  publishedBySubCategoryId: Map<string, number>
}

function bySubCat(
  rows: { subCategoryId: string | null; _count: { _all: number } }[],
): Map<string, number> {
  const m = new Map<string, number>()
  for (const r of rows) if (r.subCategoryId) m.set(r.subCategoryId, r._count._all)
  return m
}

/**
 * Published / draft / last-published / per-sub-category counts for all five
 * pattern-led categories, each read from its own table. One query set,
 * shared by every admin surface that shows per-category pattern counts (the
 * dashboard pipeline table, the bulk-generation Library progress table, the
 * categories tree) so they can never drift apart or silently fall back to
 * counting tutorials.
 */
export async function patternLedCraftStats(): Promise<Record<PatternLedSlug, CraftPatternStats>> {
  const [
    xsPublished, xsDraft, xsMax, xsBySubCat,
    crochetPublished, crochetDraft, crochetMax, crochetBySubCat,
    needleworkPublished, needleworkDraft, needleworkMax, needleworkBySubCat,
    knittingPublished, knittingDraft, knittingMax, knittingBySubCat,
    sewingPublished, sewingDraft, sewingMax, sewingBySubCat,
  ] = await Promise.all([
    prisma.pattern.count({ where: { type: 'CROSS_STITCH', visibility: Visibility.PUBLIC, ownerUserId: null } }),
    prisma.pattern.count({ where: { type: 'CROSS_STITCH', visibility: { not: Visibility.PUBLIC }, ownerUserId: null } }),
    prisma.pattern.aggregate({ where: { type: 'CROSS_STITCH', visibility: Visibility.PUBLIC, ownerUserId: null }, _max: { publishedAt: true } }),
    prisma.pattern.groupBy({ by: ['subCategoryId'], where: { type: 'CROSS_STITCH', visibility: Visibility.PUBLIC, ownerUserId: null }, _count: { _all: true } }),

    prisma.crochetPattern.count({ where: { visibility: Visibility.PUBLIC, ownerUserId: null } }),
    prisma.crochetPattern.count({ where: { visibility: { not: Visibility.PUBLIC }, ownerUserId: null } }),
    prisma.crochetPattern.aggregate({ where: { visibility: Visibility.PUBLIC, ownerUserId: null }, _max: { publishedAt: true } }),
    prisma.crochetPattern.groupBy({ by: ['subCategoryId'], where: { visibility: Visibility.PUBLIC, ownerUserId: null }, _count: { _all: true } }),

    prisma.needleworkPattern.count({ where: { visibility: Visibility.PUBLIC, ownerUserId: null } }),
    prisma.needleworkPattern.count({ where: { visibility: { not: Visibility.PUBLIC }, ownerUserId: null } }),
    prisma.needleworkPattern.aggregate({ where: { visibility: Visibility.PUBLIC, ownerUserId: null }, _max: { publishedAt: true } }),
    prisma.needleworkPattern.groupBy({ by: ['subCategoryId'], where: { visibility: Visibility.PUBLIC, ownerUserId: null }, _count: { _all: true } }),

    prisma.knittingPattern.count({ where: { visibility: Visibility.PUBLIC, ownerUserId: null } }),
    prisma.knittingPattern.count({ where: { visibility: { not: Visibility.PUBLIC }, ownerUserId: null } }),
    prisma.knittingPattern.aggregate({ where: { visibility: Visibility.PUBLIC, ownerUserId: null }, _max: { publishedAt: true } }),
    prisma.knittingPattern.groupBy({ by: ['subCategoryId'], where: { visibility: Visibility.PUBLIC, ownerUserId: null }, _count: { _all: true } }),

    // Sewing has no ownerUserId column yet — no user pattern ownership exists
    // for it, so PUBLIC already means house-owned.
    prisma.sewingPattern.count({ where: { visibility: Visibility.PUBLIC } }),
    prisma.sewingPattern.count({ where: { visibility: { not: Visibility.PUBLIC } } }),
    prisma.sewingPattern.aggregate({ where: { visibility: Visibility.PUBLIC }, _max: { publishedAt: true } }),
    prisma.sewingPattern.groupBy({ by: ['subCategoryId'], where: { visibility: Visibility.PUBLIC }, _count: { _all: true } }),
  ])

  return {
    'cross-stitch': {
      published: xsPublished,
      draft: xsDraft,
      lastPublishedAt: xsMax._max.publishedAt,
      publishedBySubCategoryId: bySubCat(xsBySubCat),
    },
    crochet: {
      published: crochetPublished,
      draft: crochetDraft,
      lastPublishedAt: crochetMax._max.publishedAt,
      publishedBySubCategoryId: bySubCat(crochetBySubCat),
    },
    needlework: {
      published: needleworkPublished,
      draft: needleworkDraft,
      lastPublishedAt: needleworkMax._max.publishedAt,
      publishedBySubCategoryId: bySubCat(needleworkBySubCat),
    },
    knitting: {
      published: knittingPublished,
      draft: knittingDraft,
      lastPublishedAt: knittingMax._max.publishedAt,
      publishedBySubCategoryId: bySubCat(knittingBySubCat),
    },
    sewing: {
      published: sewingPublished,
      draft: sewingDraft,
      lastPublishedAt: sewingMax._max.publishedAt,
      publishedBySubCategoryId: bySubCat(sewingBySubCat),
    },
  }
}
