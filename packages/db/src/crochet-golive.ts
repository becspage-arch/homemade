/**
 * THE CROCHET GO-LIVE GATES, decided by code where code can decide them.
 *
 * The playbook's launch gate (Close-out F, plus the category-page check and the
 * per-publish invariants) lists what must be true before a category is added to
 * `LAUNCH_VISIBLE_CATEGORY_SLUGS`. Cross-stitch's close-out checked these by
 * hand with throwaway scripts. This is the same list for crochet as one pure
 * function over what the database holds, so the answer is the same every time
 * it is asked and the orchestrator can run it before the sign-off train.
 *
 * Three outcomes, no warning tier:
 *   · pass   — code checked it and it holds.
 *   · fail   — code checked it and it does not; the detail says what to fix.
 *   · manual — code cannot decide it (looking at every hero, Rebecca's
 *              sign-off); the detail says what has to be done and by whom.
 * `ready` is true only when every gate passes. A manual gate is not a pass.
 *
 * READ-ONLY by construction: it takes data and returns a verdict. It never
 * changes visibility and it does not know how to.
 *
 * Pure: no Prisma, no network.
 */

import { runVoiceCheck } from '../scripts/voice-check-lib'
import { itemTypesForCraft } from '../prisma/item-type-vocabulary'
import { checkCrochetPatternCompleteness, type CrochetCompletenessInput } from './crochet-completeness'

export type GateStatus = 'pass' | 'fail' | 'manual'

export interface GoLiveGate {
  id: string
  /** Plain-English name, as the playbook words it. */
  name: string
  status: GateStatus
  /** One line on what was found. */
  summary: string
  /** Slugs or lines to act on, when there are any. */
  items: string[]
}

/** One public house crochet pattern, as the check needs it. */
export interface GoLiveRow extends CrochetCompletenessInput {
  id: string
  slug: string | null
  /** Has a loom hero, hero or thumbnail (`crochetHeroMedia` is non-null). */
  hasImage: boolean
  /** How many CollectionTagAssignment rows the pattern carries. */
  tagCount: number
  /** How many of those are on the STYLE axis. */
  styleTagCount?: number
}

export interface GoLiveShelf {
  slug: string
  name: string
  description: string | null
}

export interface GoLiveInput {
  rows: GoLiveRow[]
  category: { description: string | null }
  /** Every crochet SubCategory in the database. */
  shelves: GoLiveShelf[]
  /** Documents in the Typesense crochet collection; null when unreachable. */
  searchIndexCount: number | null
  /** Search documents that carry an image; null when not measured. */
  searchDocsWithImage?: number | null
  /** Whether a public `/crochet/patterns/<slug>` page exists to list in the sitemap. */
  patternPageRoute: boolean
  /** Set once the Step E sweep is done and Rebecca has checked its sample. */
  visionSweepSignedOff?: boolean
  /** Set once the premium gate and the /premium config have been checked. */
  premiumChecked?: boolean
}

export interface GoLiveReport {
  gates: GoLiveGate[]
  /** Every gate passes, so the only step left is the switch itself. */
  ready: boolean
}

/** The description the crochet category was seeded with, which is not a list of what is inside. */
export const CROCHET_PLACEHOLDER_DESCRIPTION = 'Stitches, techniques, and patterns.'

const LONG_DASH = /[–—]/

/** Voice faults in one piece of public copy, as plain lines; empty when clean. */
export function copyFaults(text: string | null | undefined): string[] {
  const t = (text ?? '').trim()
  if (!t) return ['missing']
  const out: string[] = []
  if (LONG_DASH.test(t)) out.push('long dash')
  for (const e of runVoiceCheck({ excerpt: t }).errors) out.push(e.message)
  return out
}

function gate(id: string, name: string, failing: string[], passSummary: string, failSummary: (n: number) => string): GoLiveGate {
  return failing.length
    ? { id, name, status: 'fail', summary: failSummary(failing.length), items: failing }
    : { id, name, status: 'pass', summary: passSummary, items: [] }
}

export function evaluateCrochetGoLive(input: GoLiveInput): GoLiveReport {
  const { rows } = input
  const label = (r: GoLiveRow) => r.slug ?? r.id
  const canonical = new Set(itemTypesForCraft('crochet').map((t) => t.slug))
  const gates: GoLiveGate[] = []

  // 1. Seed content.
  gates.push(
    rows.length > 0
      ? { id: 'seed', name: 'Initial Homemade seed content published', status: 'pass', summary: `${rows.length} public house patterns`, items: [] }
      : { id: 'seed', name: 'Initial Homemade seed content published', status: 'fail', summary: 'no public house crochet patterns', items: [] },
  )

  // 2. Completeness, the same gate the publisher runs.
  const incomplete = rows.flatMap((r) => {
    const res = checkCrochetPatternCompleteness(r)
    return res.blocked ? [`${label(r)}: ${res.reasons.join(' ')}`] : []
  })
  gates.push(gate('completeness', 'Every public pattern passes the completeness gate', incomplete, `all ${rows.length} pass`, (n) => `${n} of ${rows.length} fail`))

  // 3. Every pattern on a canonical item-type shelf (NULL never shows in the grid).
  const offShelf = rows.filter((r) => !r.subCategorySlug || !canonical.has(r.subCategorySlug)).map((r) => `${label(r)}: ${r.subCategorySlug ?? 'no shelf'}`)
  gates.push(gate('shelves', 'Every public pattern is on a canonical crochet shelf', offShelf, 'all on canonical shelves', (n) => `${n} off-shelf`))

  // 4. Every public pattern carries an image.
  const imageless = rows.filter((r) => !r.hasImage).map(label)
  gates.push(gate('images', 'Every public pattern carries a hero or thumbnail', imageless, 'all have an image', (n) => `${n} have no image`))

  // 5. Names unique (cross-stitch found 14 names shared by 29 patterns).
  const byName = new Map<string, string[]>()
  for (const r of rows) {
    const k = (r.name ?? '').trim().toLowerCase()
    byName.set(k, [...(byName.get(k) ?? []), label(r)])
  }
  const dupes = [...byName.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => `"${k}": ${v.join(', ')}`)
  gates.push(gate('names', 'No two public patterns share a name', dupes, 'all names unique', (n) => `${n} names shared`))

  // 6. Vision sweep (Step E): a person or session has to look.
  gates.push(
    input.visionSweepSignedOff
      ? { id: 'vision', name: 'Step E vision sweep over every published hero', status: 'pass', summary: 'swept and signed off', items: [] }
      : {
          id: 'vision',
          name: 'Step E vision sweep over every published hero',
          status: 'manual',
          summary: `look at all ${rows.filter((r) => r.hasImage).length} heroes beside the bar photos; fix or pull each flag; report; Rebecca checks a sample`,
          items: [],
        },
  )

  // 7. Tagging coverage.
  const untagged = rows.filter((r) => r.tagCount === 0).map(label)
  gates.push(gate('tags', 'Every public pattern carries cross-craft tags', untagged, 'all tagged', (n) => `${n} of ${rows.length} untagged`))
  const noStyle = rows.filter((r) => r.tagCount > 0 && (r.styleTagCount ?? 0) === 0).map(label)
  if (rows.length && untagged.length === 0 && noStyle.length) {
    gates.push({ id: 'style-tags', name: 'Style tags (judged by looking at the hero)', status: 'manual', summary: `${noStyle.length} tagged patterns carry no style tag`, items: noStyle })
  }

  // 8. Category copy and every shelf's copy.
  const catDesc = input.category.description
  const catFaults = (catDesc ?? '').trim() === CROCHET_PLACEHOLDER_DESCRIPTION ? ['still the seeded placeholder'] : copyFaults(catDesc)
  gates.push(gate('category-copy', 'Category description: a list of what is inside, voice-clean', catFaults.map((f) => `crochet: ${f}`), 'clean', () => 'needs rewriting'))
  const shelfFaults = input.shelves.flatMap((s) => {
    const f = copyFaults(s.description)
    return f.length ? [`${s.slug}: ${f.join('; ')}`] : []
  })
  gates.push(gate('shelf-copy', 'Every shelf description voice-clean', shelfFaults, `all ${input.shelves.length} clean`, (n) => `${n} of ${input.shelves.length} need fixing`))
  const legacy = input.shelves.filter((s) => !canonical.has(s.slug)).map((s) => s.slug)
  if (legacy.length) {
    gates.push({
      id: 'legacy-shelves',
      name: 'Shelves outside the item-type list',
      status: 'manual',
      summary: `${legacy.length} older shelves still exist (they hold tutorials, not library patterns); decide whether each stays on the category page`,
      items: legacy,
    })
  }

  // 9. Search.
  if (input.searchIndexCount === null) {
    gates.push({ id: 'search', name: 'Search index holds every public pattern', status: 'manual', summary: 'Typesense not reachable from here; run search:backfill and recount', items: [] })
  } else {
    const missing: string[] = []
    if (input.searchIndexCount !== rows.length) missing.push(`index holds ${input.searchIndexCount}, database has ${rows.length} public`)
    const withImage = rows.filter((r) => r.hasImage).length
    if (input.searchDocsWithImage != null && input.searchDocsWithImage < withImage) {
      missing.push(`${input.searchDocsWithImage} index documents carry an image, ${withImage} patterns have one (reindex)`)
    }
    gates.push(gate('search', 'Search index holds every public pattern', missing, `${rows.length} indexed`, () => 'out of step'))
  }

  // 10. Sitemap: crochet patterns can only be listed once they have a public page.
  gates.push(
    input.patternPageRoute
      ? { id: 'sitemap', name: 'Pattern pages listed in the sitemap', status: 'pass', summary: 'route exists', items: [] }
      : {
          id: 'sitemap',
          name: 'Pattern pages listed in the sitemap',
          status: 'fail',
          summary: 'no public /crochet/patterns/<slug> page exists, so there is nothing to list; cards open the Studio',
          items: [],
        },
  )

  // 11. Premium gate and the switch: Rebecca's.
  gates.push({
    id: 'premium',
    name: 'Premium gate done; crochet rows un-hidden in the /premium config',
    status: input.premiumChecked ? 'pass' : 'manual',
    summary: input.premiumChecked
      ? 'checked'
      : 'check the /premium feature-availability rows for crochet promise nothing un-built',
    items: [],
  })

  // The switch is the action the gates clear the way for, not a gate itself.
  const ready = gates.every((g) => g.status === 'pass')
  gates.push({
    id: 'switch',
    name: "Add 'crochet' to LAUNCH_VISIBLE_CATEGORY_SLUGS on a train",
    status: 'manual',
    summary: ready
      ? "every gate passes: Rebecca's sign-off, then the orchestrator adds the slug on a train"
      : "not yet; Rebecca's sign-off moment comes after every gate above passes. This check never changes visibility",
    items: [],
  })

  return { gates, ready }
}
