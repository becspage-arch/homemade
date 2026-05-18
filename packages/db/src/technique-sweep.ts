/**
 * Technique reverse-sweep (phase_technique_linking_002).
 *
 * The forward path is the `techniqueLink` mark + the upload script
 * persisting `Tutorial.techniqueSlugs` — recipe authors wrap technique
 * words as they write, and the slug lands on the row at upload time.
 *
 * The reverse path lives here. When a TECHNIQUE row transitions to
 * PUBLISHED (or is republished after a title / slug / aliases change),
 * we walk every other published Tutorial in the same Category and, if
 * the body text mentions the technique by title / slug-with-spaces /
 * alias, append the technique's slug to that row's `techniqueSlugs`.
 * Combined with the forward path this is the guarantee that technique
 * linking can never silently miss a mention — even years apart.
 *
 * The sweep:
 *
 *   - Is idempotent. Running it twice on the same {technique, target}
 *     pair is a no-op; the slug is only appended when not already
 *     present.
 *   - Restricts itself to the SAME Category as the technique. A
 *     cooking technique never sweeps mindset bodies; a mindset
 *     technique never sweeps cooking bodies. Cross-category surprises
 *     stay contained.
 *   - Never touches `criticalTechniques`. Critical-vs-incidental is a
 *     human judgement only the recipe author can make.
 *   - Never touches the body content itself. Wrapping the matched
 *     phrase in a `techniqueLink` mark is a separate decision; the
 *     mark gracefully falls back to plain text when the slug doesn't
 *     resolve, so the link goes live as soon as the slug lands on the
 *     row regardless of whether the body is re-marked.
 *
 * Both the Inngest function in
 * `apps/web/src/inngest/functions/technique-publish-sweep.ts` and the
 * one-time backfill script in
 * `packages/db/scripts/backfill-technique-links.ts` call into
 * `sweepForTechnique`. The pure helpers (`buildSearchTerms`,
 * `extractTextForSweep`, `bodyMentionsAnyTerm`) are exported for
 * unit-testing without a database.
 */

import { TutorialType, type PrismaClient } from '@prisma/client'

/**
 * Tutorial types eligible to be swept. TECHNIQUE rows are excluded
 * deliberately — a technique never references another technique
 * inline; READING rows are static articles that shouldn't accumulate
 * technique links either.
 */
const SWEEPABLE_TYPES: TutorialType[] = [
  TutorialType.RECIPE,
  TutorialType.PRACTICE,
  TutorialType.GROWING_GUIDE,
  TutorialType.REMEDY,
  TutorialType.HERB_PROFILE,
  TutorialType.STITCH,
  TutorialType.PATTERN,
]

export interface TechniqueForSweep {
  /** Tutorial.id of the TECHNIQUE row driving the sweep. */
  id: string
  /** Slug appended to matching rows' `techniqueSlugs`. */
  slug: string
  /** Surfaced verbatim in audit-log + return value. */
  title: string
  /** Free-form alias phrases authors might use instead of the title. */
  aliases: string[]
  /** Scope-fence: sweep only targets rows under this Category. */
  categoryId: string
}

export interface SweepTargetRow {
  id: string
  slug: string
  title: string
  body: unknown
  techniqueSlugs: string[]
}

export interface SweepResult {
  /** Same `Tutorial.id` passed in. */
  techniqueId: string
  techniqueSlug: string
  techniqueTitle: string
  /** How many target rows had the slug appended this run. */
  recipesAnnotated: number
  /** Up to 10 titles of newly-annotated rows, for audit visibility. */
  sampleTitles: string[]
  /** Total candidates considered (sweepable, same-category, PUBLISHED). */
  candidatesConsidered: number
}

/**
 * Build the case-folded, deduplicated search-term set for a technique.
 * Includes the title verbatim, the slug with hyphens swapped for
 * spaces (so `blind-baking` becomes "blind baking"), and every
 * non-empty alias. Trimmed; empty terms dropped; duplicates collapsed.
 */
export function buildSearchTerms(technique: {
  title: string
  slug: string
  aliases: string[]
}): string[] {
  const raw: string[] = []
  if (technique.title) raw.push(technique.title)
  if (technique.slug) raw.push(technique.slug.replace(/-/g, ' '))
  for (const alias of technique.aliases) {
    if (typeof alias === 'string') raw.push(alias)
  }
  const seen = new Set<string>()
  const out: string[] = []
  for (const term of raw) {
    const normalised = term.trim().toLowerCase()
    if (!normalised) continue
    if (seen.has(normalised)) continue
    seen.add(normalised)
    out.push(normalised)
  }
  return out
}

interface TipTapNodeLike {
  type?: string
  text?: string
  attrs?: Record<string, unknown> | null
  content?: TipTapNodeLike[]
}

/**
 * Flatten a TipTap document into a single lower-cased search blob.
 * Mirrors `packages/search/src/schemas.ts#extractBodyText` shape-wise
 * (text nodes + common attrs on custom blocks like infoPanel /
 * pullQuote / ingredientsList items), but lower-cases on the way out
 * so the matcher doesn't have to. Non-object input returns "".
 */
export function extractTextForSweep(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const out: string[] = []
  walkBody(body as TipTapNodeLike, out)
  return out.join(' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

function walkBody(node: TipTapNodeLike, out: string[]): void {
  if (!node || typeof node !== 'object') return
  if (typeof node.text === 'string') out.push(node.text)

  const attrs = node.attrs
  if (attrs && typeof attrs === 'object') {
    for (const key of ['title', 'body', 'heading', 'quote', 'attribution', 'description', 'intro'] as const) {
      const value = (attrs as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.trim()) out.push(value)
    }
    const items = (attrs as Record<string, unknown>).items
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item && typeof item === 'object') {
          for (const v of Object.values(item as Record<string, unknown>)) {
            if (typeof v === 'string' && v.trim()) out.push(v)
          }
        }
      }
    }
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) walkBody(child, out)
  }
}

function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * True when any term appears in the lower-cased body text as a
 * whole-word match. "blind baking" matches "Blind baking the
 * pastry…" but not "rolling blind bakingly". Multi-word terms are
 * matched with leading + trailing word boundaries on the outer letters.
 *
 * The function accepts the already-lower-cased text rather than the
 * raw body so the same text blob can be reused across many techniques
 * without re-walking the TipTap tree.
 */
export function bodyMentionsAnyTerm(loweredText: string, terms: string[]): boolean {
  if (!loweredText) return false
  for (const term of terms) {
    if (!term) continue
    const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i')
    if (pattern.test(loweredText)) return true
  }
  return false
}

/**
 * Run the reverse-sweep for one technique. Pulls every same-Category
 * PUBLISHED Tutorial of a sweepable type, walks the body text, and
 * appends the technique's slug to `techniqueSlugs` on any row whose
 * body mentions the technique by title / slug-with-spaces / alias.
 *
 * Returns a structured result so the caller (Inngest function or
 * backfill script) can audit-log + print the summary. Idempotent: the
 * slug is only appended where it isn't already present, so re-running
 * after a partial failure or a re-publish is harmless.
 */
export async function sweepForTechnique(
  prisma: PrismaClient,
  technique: TechniqueForSweep,
): Promise<SweepResult> {
  const terms = buildSearchTerms(technique)

  if (terms.length === 0) {
    return {
      techniqueId: technique.id,
      techniqueSlug: technique.slug,
      techniqueTitle: technique.title,
      recipesAnnotated: 0,
      sampleTitles: [],
      candidatesConsidered: 0,
    }
  }

  // Same-category, published, sweepable, and the slug isn't already on
  // the row. The `NOT has` filter on the array lets Postgres skip the
  // (potentially large) set of rows that already carry the slug.
  const candidates = await prisma.tutorial.findMany({
    where: {
      categoryId: technique.categoryId,
      status: 'PUBLISHED',
      type: { in: SWEEPABLE_TYPES },
      NOT: { techniqueSlugs: { has: technique.slug } },
      id: { not: technique.id },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      body: true,
      techniqueSlugs: true,
    },
  })

  const annotated: SweepTargetRow[] = []
  for (const candidate of candidates) {
    const blob = extractTextForSweep(candidate.body)
    if (!bodyMentionsAnyTerm(blob, terms)) continue
    annotated.push(candidate as SweepTargetRow)
  }

  for (const target of annotated) {
    await prisma.tutorial.update({
      where: { id: target.id },
      data: { techniqueSlugs: { push: technique.slug } },
    })
  }

  return {
    techniqueId: technique.id,
    techniqueSlug: technique.slug,
    techniqueTitle: technique.title,
    recipesAnnotated: annotated.length,
    sampleTitles: annotated.slice(0, 10).map((t) => t.title),
    candidatesConsidered: candidates.length,
  }
}
