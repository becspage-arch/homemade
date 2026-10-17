/**
 * The public crochet pattern page (`/crochet/patterns/<slug>`), its rules in
 * one place so the page, the sitemap and the cards cannot disagree.
 *
 * Pure: no Prisma, no React, no TipTap. The page reads rows from the database
 * and hands them here; everything that decides what shows comes back out.
 *
 * The free / gated split mirrors the needlework and cross-stitch pages:
 *  - Everyone, signed in or not: the photo, the description, the designer, the
 *    spec (size, skill, time, yarn, hook, gauge, metres), what you need, the
 *    stitches and abbreviations, the safety note and the first few rounds.
 *  - A free account: every written round on the page, and the Studio.
 *  - Premium content (the premium flag, or an independent designer, the
 *    shared `isPremiumContent` rule) needs premium for the full rounds and the
 *    Studio, the same as a premium cross-stitch chart.
 */

// Type-only: this module is also imported by the client-side crochet grid,
// so it must never pull the Prisma client into a browser bundle.
import type { Visibility } from '@homemade/db'

export const CROCHET_CATEGORY_SLUG = 'crochet'

/** The most written rows a visitor without access sees. */
export const PREVIEW_ROW_COUNT = 3

/**
 * How many rows the preview shows: up to `PREVIEW_ROW_COUNT`, but never more
 * than half the pattern, so a two-row edging or a three-round granny square is
 * not given away whole. At least one row whenever there is any.
 */
export function previewRowCount(total: number): number {
  if (total <= 0) return 0
  return Math.min(PREVIEW_ROW_COUNT, Math.max(1, Math.floor(total / 2)))
}

/** The public page for a library crochet pattern. */
export function crochetPatternPath(slug: string): string {
  return `/crochet/patterns/${encodeURIComponent(slug)}`
}

/**
 * Where a crochet card opens. A pattern with a slug opens its public page; a
 * slugless row (none in the library today) still opens the Studio by id.
 * Cards only render on surfaces that are themselves gated on the crochet
 * category being visible (the category page and crochet search).
 */
export function crochetCardHref(p: { id: string; slug: string | null }): string {
  return p.slug
    ? crochetPatternPath(p.slug)
    : `/studio/crochet?crochetPatternId=${encodeURIComponent(p.id)}`
}

/** A house/library row that is PUBLIC or UNLISTED; members' own rows never show. */
export function isLibraryViewable(row: { ownerUserId: string | null; visibility: Visibility }): boolean {
  return (
    row.ownerUserId === null &&
    (row.visibility === 'PUBLIC' || row.visibility === 'UNLISTED')
  )
}

/**
 * Can this request see the page at all? Only when the crochet category is
 * publicly visible, the same rule that 404s a tutorial in a hidden category.
 * An admin may preview it while the category is hidden; the page is then
 * noindex (see `shouldIndex`).
 */
export function canViewCrochetPatternPage(opts: {
  categoryVisible: boolean
  viewerIsAdmin: boolean
}): boolean {
  return opts.categoryVisible || opts.viewerIsAdmin
}

/** Indexed only when the category is visible and the row is PUBLIC. */
export function shouldIndex(opts: { categoryVisible: boolean; visibility: Visibility }): boolean {
  return opts.categoryVisible && opts.visibility === 'PUBLIC'
}

export type CrochetPageAccess =
  /** Every round shows, and the Studio button. */
  | 'full'
  /** Preview rounds, then the free sign-in gate. */
  | 'sign-in'
  /** Signed in, but premium content: preview rounds, then the premium upsell. */
  | 'premium'

export function crochetPageAccess(opts: {
  signedIn: boolean
  /** `canAccessPremiumContent(user, content)` from lib/entitlements. */
  canAccessPremium: boolean
}): CrochetPageAccess {
  if (!opts.signedIn) return 'sign-in'
  return opts.canAccessPremium ? 'full' : 'premium'
}

export interface PublicRow {
  section: string
  label: string | null
  instruction: string
  stitchCount: number | null
  colourLabel: string | null
}

/**
 * The written rows out of `rowsStructured`, tolerant of older data in the
 * same way the Studio's own parser is: a row needs an instruction and a
 * number, a missing section reads as "Pattern".
 */
export function normalisePublicRows(raw: unknown): PublicRow[] {
  if (!Array.isArray(raw)) return []
  const out: PublicRow[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const instruction = typeof r.instruction === 'string' ? r.instruction.trim() : ''
    if (typeof r.rowNumber !== 'number' || !instruction) continue
    out.push({
      section: typeof r.section === 'string' && r.section ? r.section : 'Pattern',
      label: typeof r.rowLabel === 'string' && r.rowLabel ? r.rowLabel : null,
      instruction,
      stitchCount: typeof r.stitchCount === 'number' ? r.stitchCount : null,
      colourLabel: typeof r.colourLabel === 'string' && r.colourLabel ? r.colourLabel : null,
    })
  }
  return out
}

export interface RowSection {
  name: string
  rows: PublicRow[]
}

/** Rows grouped by section, in the order the sections first appear. */
export function groupBySection(rows: PublicRow[]): RowSection[] {
  const sections: RowSection[] = []
  const byName = new Map<string, RowSection>()
  for (const row of rows) {
    let s = byName.get(row.section)
    if (!s) {
      s = { name: row.section, rows: [] }
      byName.set(row.section, s)
      sections.push(s)
    }
    s.rows.push(row)
  }
  return sections
}

/**
 * What the page prints for this access level. Full access gets every section;
 * otherwise the first `previewRowCount` rows of the pattern, still grouped,
 * plus how many rows are held back.
 */
export function visibleSections(
  rows: PublicRow[],
  access: CrochetPageAccess,
): { sections: RowSection[]; heldBack: number } {
  if (access === 'full') return { sections: groupBySection(rows), heldBack: 0 }
  const shown = rows.slice(0, previewRowCount(rows.length))
  return { sections: groupBySection(shown), heldBack: Math.max(0, rows.length - shown.length) }
}

/** Metres of yarn for a non-graded pattern (`yardageBySize.default`, metres). */
export function yarnMetres(yardageBySize: unknown): number | null {
  if (!yardageBySize || typeof yardageBySize !== 'object') return null
  const v = (yardageBySize as Record<string, unknown>).default
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : null
}

/** UK abbreviation → what it means, with the US term where it differs. */
const ABBREVIATIONS: Record<string, { uk: string; us?: string }> = {
  ch: { uk: 'chain' },
  'sl st': { uk: 'slip stitch' },
  dc: { uk: 'double crochet', us: 'sc' },
  htr: { uk: 'half treble', us: 'hdc' },
  tr: { uk: 'treble', us: 'dc' },
  dtr: { uk: 'double treble', us: 'tr' },
  dc2tog: { uk: 'double crochet two together', us: 'sc2tog' },
  'dc-blo': { uk: 'double crochet in the back loop only', us: 'sc blo' },
  mr: { uk: 'magic ring' },
  st: { uk: 'stitch' },
  sts: { uk: 'stitches' },
  sp: { uk: 'space' },
}

export interface AbbreviationLine {
  abbr: string
  meaning: string
}

/** The legend for a pattern's `abbreviationsUsed`, in the order given, without repeats. */
export function abbreviationLegend(
  abbreviations: string[],
  terminology: string,
): AbbreviationLine[] {
  const seen = new Set<string>()
  const out: AbbreviationLine[] = []
  for (const a of abbreviations) {
    const key = a.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    const known = ABBREVIATIONS[key]
    if (!known) {
      out.push({ abbr: a, meaning: '' })
      continue
    }
    const meaning =
      terminology === 'uk' && known.us ? `${known.uk} (US ${known.us})` : known.uk
    out.push({ abbr: a, meaning })
  }
  return out
}

/**
 * The sitemap's crochet pattern rows, each with its page path: none until the
 * crochet category is visible, then every row handed in that has a slug (the
 * sitemap hands in only PUBLIC, published library rows).
 */
export function crochetSitemapRows<T extends { slug: string | null }>(
  publicCategorySlugs: Set<string>,
  rows: T[],
): Array<T & { path: string }> {
  if (!publicCategorySlugs.has(CROCHET_CATEGORY_SLUG)) return []
  return rows.flatMap((r) => (r.slug ? [{ ...r, path: crochetPatternPath(r.slug) }] : []))
}

/** "Beginner" from "BEGINNER". */
export function prettyEnum(s: string): string {
  const t = s.replace(/_/g, ' ')
  return t.charAt(0) + t.slice(1).toLowerCase()
}
