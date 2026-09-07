/**
 * Validate the crochet idea backlog and print what it holds.
 *
 *   cd apps/web && pnpm exec tsx scripts/check-crochet-idea-backlog.ts
 *
 * Pure: no database, no network, no credentials. It checks the five things
 * that would quietly break the autopilot if the file drifted, then prints the
 * per-shelf counts against the recommended targets so a glance says which
 * shelves are named to target and which are still short.
 *
 * Exits non-zero on any failure, so it can go in a pre-merge sweep.
 */

import { PALETTES } from '@homemade/db/design-direction'
import { CROCHET_SHELF_BY_SLUG, CROCHET_SHELVES } from '../src/lib/studio/generation/categories'
import {
  envelopeFor,
  shelfIsBuildable,
  treatmentsForShelf,
} from '../src/lib/studio/generation/bulk/crochet-forms'
import {
  CROCHET_IDEA_BACKLOG,
  CROCHET_BUILDABLE_IDEAS,
  CROCHET_IDEA_THEMES,
  RECOMMENDED_CROCHET_SHELF_TARGETS,
  backlogCountsByShelf,
  isHonestAmigurumiSubject,
} from '../src/lib/studio/generation/bulk/crochet-idea-backlog'

/** The four shelves whose sole (or, on baby-toy-lovey, partial) treatment is
 *  'amigurumi' — see isHonestAmigurumiSubject's doc comment in the backlog
 *  file for why a theme can sit here despite the shelf being buildable. */
const AMIGURUMI_BASE_SHELVES = new Set(['amigurumi', 'animal-toy', 'doll', 'baby-toy-lovey'])

const failures: string[] = []
const fail = (msg: string): void => {
  failures.push(msg)
}

const paletteSlugs = new Set(PALETTES.map((p) => p.slug))

// 1. Ids and dedupe keys are unique.
const ids = new Set<string>()
const keys = new Map<string, string>()
for (const idea of CROCHET_IDEA_BACKLOG) {
  if (ids.has(idea.id)) fail(`duplicate id: ${idea.id}`)
  ids.add(idea.id)
  const existing = keys.get(idea.dedupeKey)
  if (existing) fail(`duplicate dedupe key "${idea.dedupeKey}": ${existing} and ${idea.id}`)
  keys.set(idea.dedupeKey, idea.id)
  if (!idea.dedupeKey) fail(`${idea.id} has an empty dedupe key`)
  if (!idea.searchPhrase.startsWith('crochet ')) fail(`${idea.id} search phrase is not a query`)
}

// 2. Every shelf is a real CROCHET_SHELVES slug.
for (const idea of CROCHET_IDEA_BACKLOG) {
  if (!CROCHET_SHELF_BY_SLUG[idea.shelf]) fail(`${idea.id} names a shelf that does not exist: ${idea.shelf}`)
  if (!paletteSlugs.has(idea.colourway)) fail(`${idea.id} names a colourway that is not a palette: ${idea.colourway}`)
}

// 3. A buildable idea names a treatment inside its shelf's envelope, and sits
//    on a shelf the loom actually agrees it can build. On the four
//    amigurumi-treatment shelves, it must also be an honest bear/bunny/
//    ball/egg subject — the shelf having a treatment is not enough.
for (const idea of CROCHET_BUILDABLE_IDEAS) {
  if (!shelfIsBuildable(idea.shelf)) {
    fail(`${idea.id} is marked buildable but ${idea.shelf} has no loom envelope`)
    continue
  }
  if (!idea.treatment) {
    fail(`${idea.id} is buildable with no treatment`)
    continue
  }
  if (!envelopeFor(idea.shelf, idea.treatment)) {
    fail(
      `${idea.id} treatment "${idea.treatment}" is not in the ${idea.shelf} envelope ` +
        `(allowed: ${treatmentsForShelf(idea.shelf).join(', ')})`,
    )
  }
  if (
    AMIGURUMI_BASE_SHELVES.has(idea.shelf) &&
    idea.treatment === 'amigurumi' &&
    !isHonestAmigurumiSubject(idea.motif)
  ) {
    fail(`${idea.id} is buildable amigurumi but "${idea.motif}" is not a bear/bunny/ball/egg`)
  }
}

// 4. A theme carries no treatment and sits on a shelf the loom cannot build —
//    UNLESS it is one of the amigurumi-family shelves, where a theme can also
//    be an idea-level "not one of the four bases" flag on an otherwise
//    buildable shelf. There the treatment may stay set (informational) but
//    must still be a real treatment for that shelf, and the subject must
//    genuinely fail the honesty test (never a theme just because someone
//    forgot to flip it).
for (const idea of CROCHET_IDEA_THEMES) {
  if (AMIGURUMI_BASE_SHELVES.has(idea.shelf)) {
    if (idea.treatment && !envelopeFor(idea.shelf, idea.treatment)) {
      fail(`${idea.id} theme names a treatment "${idea.treatment}" outside the ${idea.shelf} envelope`)
    }
    if (idea.treatment === 'amigurumi' && isHonestAmigurumiSubject(idea.motif)) {
      fail(`${idea.id} is a theme but "${idea.motif}" IS a bear/bunny/ball/egg — should be buildable`)
    }
    continue
  }
  if (idea.treatment) fail(`${idea.id} is a theme but names a treatment`)
  if (shelfIsBuildable(idea.shelf)) fail(`${idea.id} is a theme on a buildable shelf`)
}

// 5. Every non-buildable shelf has a theme list of at least ten.
const counts = backlogCountsByShelf()
for (const shelf of CROCHET_SHELVES) {
  if (shelfIsBuildable(shelf.slug)) continue
  const n = counts[shelf.slug] ?? 0
  if (n < 10) fail(`${shelf.slug} has only ${n} themes, the floor is ten`)
}

// 6. The working order actually interleaves: the first fifty entries should
//    touch most of the buildable shelves and most of the palette library.
const firstFifty = CROCHET_IDEA_BACKLOG.slice(0, 50)
const shelvesInFifty = new Set(firstFifty.map((i) => i.shelf)).size
const coloursInFifty = new Set(firstFifty.map((i) => i.colourway)).size
if (shelvesInFifty < 8) fail(`the first fifty entries only touch ${shelvesInFifty} shelves`)
if (coloursInFifty < 8) fail(`the first fifty entries only touch ${coloursInFifty} colourways`)

// ── Report ──
const pad = (s: string, n: number): string => s.padEnd(n)
const num = (n: number, w: number): string => String(n).padStart(w)

console.log('\nCROCHET IDEA BACKLOG')
console.log(`  entries        ${CROCHET_IDEA_BACKLOG.length}`)
console.log(`  buildable      ${CROCHET_BUILDABLE_IDEAS.length}`)
console.log(`  themes         ${CROCHET_IDEA_THEMES.length}`)
console.log(
  `  first 50       ${shelvesInFifty} shelves, ${coloursInFifty} colourways, ` +
    `${new Set(firstFifty.map((i) => i.difficulty)).size} difficulty bands`,
)

console.log('\n  shelf                        build  named  target(now)  target(rec)')
let namedBuildable = 0
for (const shelf of CROCHET_SHELVES) {
  const named = counts[shelf.slug] ?? 0
  const build = shelfIsBuildable(shelf.slug)
  if (build) namedBuildable += named
  console.log(
    `  ${pad(shelf.slug, 28)} ${build ? ' yes ' : '  no '} ${num(named, 6)} ${num(shelf.target, 12)} ${num(
      RECOMMENDED_CROCHET_SHELF_TARGETS[shelf.slug] ?? 0,
      12,
    )}`,
  )
}

const nowTotal = CROCHET_SHELVES.reduce((n, s) => n + s.target, 0)
const recTotal = Object.values(RECOMMENDED_CROCHET_SHELF_TARGETS).reduce((n, v) => n + v, 0)
console.log(`  ${pad('TOTAL', 28)}       ${num(namedBuildable, 6)} ${num(nowTotal, 12)} ${num(recTotal, 12)}`)

if (Object.keys(RECOMMENDED_CROCHET_SHELF_TARGETS).length !== CROCHET_SHELVES.length) {
  fail('the recommended targets do not cover every shelf')
}

if (failures.length) {
  console.error(`\n${failures.length} FAILURE(S):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('\nAll checks passed.\n')
