/**
 * Crochet idea backlog test suite. The invariants the autopilot would rely on
 * if it started taking work off the backlog rather than inventing every brief.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/crochet-idea-backlog.test.ts
 *
 * Pure: no database, no network. The one thing it CANNOT check is the thing a
 * session has to redo by hand, which is whether an idea already exists in the
 * live catalogue — that runs against the database, and the file's header
 * records when it was last done.
 */

import assert from 'node:assert/strict'
import { PALETTES } from '@homemade/db/design-direction'
import { CROCHET_SHELVES, CROCHET_SHELF_BY_SLUG } from '../categories'
import { envelopeFor, shelfIsBuildable, treatmentsForShelf } from './crochet-forms'
import { subjectKey } from './subject-key'
import {
  CROCHET_IDEA_BACKLOG,
  CROCHET_BUILDABLE_IDEAS,
  CROCHET_IDEA_THEMES,
  RECOMMENDED_CROCHET_SHELF_TARGETS,
  backlogCountsByShelf,
  ideasForShelf,
  nextBuildableIdeas,
} from './crochet-idea-backlog'

let passed = 0
function test(name: string, fn: () => void): void {
  fn()
  passed++
  console.log(`  ok  ${name}`)
}

console.log('\ncrochet idea backlog\n')

test('ids are unique', () => {
  const ids = CROCHET_IDEA_BACKLOG.map((i) => i.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('dedupe keys are unique and shelf scoped', () => {
  const keys = CROCHET_IDEA_BACKLOG.map((i) => i.dedupeKey)
  assert.equal(new Set(keys).size, keys.length)
  for (const idea of CROCHET_IDEA_BACKLOG) {
    assert.equal(idea.dedupeKey, `${idea.shelf}:${subjectKey(idea.motif)}`)
  }
})

test('titles are unique across the backlog', () => {
  const titles = CROCHET_IDEA_BACKLOG.map((i) => i.title.toLowerCase())
  const seen = new Set<string>()
  const dupes = titles.filter((t) => (seen.has(t) ? true : (seen.add(t), false)))
  assert.deepEqual(dupes, [])
})

test('every shelf is a real crochet shelf', () => {
  for (const idea of CROCHET_IDEA_BACKLOG) {
    assert.ok(CROCHET_SHELF_BY_SLUG[idea.shelf], `${idea.id}: unknown shelf ${idea.shelf}`)
  }
})

test('every colourway is a real palette', () => {
  const slugs = new Set(PALETTES.map((p) => p.slug))
  for (const idea of CROCHET_IDEA_BACKLOG) {
    assert.ok(slugs.has(idea.colourway), `${idea.id}: unknown palette ${idea.colourway}`)
  }
})

test('a buildable idea names a treatment inside its shelf envelope', () => {
  for (const idea of CROCHET_BUILDABLE_IDEAS) {
    assert.ok(shelfIsBuildable(idea.shelf), `${idea.id}: ${idea.shelf} has no envelope`)
    assert.ok(idea.treatment, `${idea.id}: buildable with no treatment`)
    assert.ok(
      envelopeFor(idea.shelf, idea.treatment!),
      `${idea.id}: ${idea.treatment} not in [${treatmentsForShelf(idea.shelf).join(', ')}]`,
    )
  }
})

test('a theme carries no treatment and no engine lane', () => {
  for (const idea of CROCHET_IDEA_THEMES) {
    assert.equal(idea.treatment, null, `${idea.id} names a treatment`)
    assert.equal(shelfIsBuildable(idea.shelf), false, `${idea.id} sits on a buildable shelf`)
  }
})

test('every buildable shelf is named to at least its recommended target', () => {
  const counts = backlogCountsByShelf()
  for (const shelf of CROCHET_SHELVES) {
    if (!shelfIsBuildable(shelf.slug)) continue
    const want = RECOMMENDED_CROCHET_SHELF_TARGETS[shelf.slug] ?? 0
    assert.ok(
      (counts[shelf.slug] ?? 0) >= want,
      `${shelf.slug}: ${counts[shelf.slug] ?? 0} ideas for a target of ${want}`,
    )
  }
})

test('every shelf the loom cannot build has ten to thirty themes', () => {
  const counts = backlogCountsByShelf()
  for (const shelf of CROCHET_SHELVES) {
    if (shelfIsBuildable(shelf.slug)) continue
    const n = counts[shelf.slug] ?? 0
    assert.ok(n >= 10 && n <= 30, `${shelf.slug} has ${n} themes`)
  }
})

test('the recommended targets cover every shelf and sum to the proposal', () => {
  assert.equal(Object.keys(RECOMMENDED_CROCHET_SHELF_TARGETS).length, CROCHET_SHELVES.length)
  for (const shelf of CROCHET_SHELVES) {
    assert.ok(
      typeof RECOMMENDED_CROCHET_SHELF_TARGETS[shelf.slug] === 'number',
      `${shelf.slug} has no recommended target`,
    )
  }
  const total = Object.values(RECOMMENDED_CROCHET_SHELF_TARGETS).reduce((n, v) => n + v, 0)
  assert.equal(total, 1500)
})

test('seq is 1..n in array order', () => {
  CROCHET_IDEA_BACKLOG.forEach((idea, i) => assert.equal(idea.seq, i + 1))
})

test('buildable ideas come before themes', () => {
  const firstTheme = CROCHET_IDEA_BACKLOG.findIndex((i) => !i.buildable)
  const lastBuildable = CROCHET_IDEA_BACKLOG.map((i) => i.buildable).lastIndexOf(true)
  assert.ok(lastBuildable < firstTheme)
})

test('the working order is interleaved, not shelf by shelf', () => {
  const first = CROCHET_IDEA_BACKLOG.slice(0, 50)
  assert.ok(new Set(first.map((i) => i.shelf)).size >= 8, 'too few shelves in the first fifty')
  assert.ok(new Set(first.map((i) => i.colourway)).size >= 8, 'too few colourways in the first fifty')
  assert.ok(new Set(first.map((i) => i.difficulty)).size >= 3, 'too few difficulty bands')
  // The biggest shelf must not monopolise the front of the queue.
  const amigurumi = first.filter((i) => i.shelf === 'amigurumi').length
  assert.ok(amigurumi <= 20, `amigurumi takes ${amigurumi} of the first fifty`)
})

test('search phrases are real queries', () => {
  for (const idea of CROCHET_IDEA_BACKLOG) {
    assert.match(idea.searchPhrase, /^crochet .+ pattern$/, `${idea.id}: ${idea.searchPhrase}`)
    const words = idea.searchPhrase.split(' ')
    assert.equal(new Set(words).size, words.length, `${idea.id} repeats a word`)
  }
})

test('house voice: no long dashes, no banned phrases', () => {
  const banned = /—|–|\bperfect for\b|\bideal for\b|\bhonest\b/i
  for (const idea of CROCHET_IDEA_BACKLOG) {
    for (const field of [idea.title, idea.motif, idea.brief]) {
      assert.ok(!banned.test(field), `${idea.id}: ${field}`)
    }
  }
})

test('ideasForShelf returns that shelf only, in working order', () => {
  const list = ideasForShelf('coaster')
  assert.ok(list.length > 0)
  assert.ok(list.every((i) => i.shelf === 'coaster'))
  assert.deepEqual([...list].sort((a, b) => a.seq - b.seq), list)
})

test('nextBuildableIdeas skips subjects the catalogue already has', () => {
  const first = CROCHET_BUILDABLE_IDEAS[0]!
  const taken = [subjectKey(first.motif)]
  const next = nextBuildableIdeas(3, taken)
  assert.equal(next.length, 3)
  assert.ok(!next.some((i) => i.id === first.id))
  assert.equal(nextBuildableIdeas(3).length, 3)
  assert.equal(nextBuildableIdeas(3)[0]!.id, first.id)
})

console.log(`\n${passed} tests passed\n`)
