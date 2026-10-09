/**
 * THE POOL MERGE — `mergeThemesWithExtras` folding `poolExtras` (a routine
 * session's `pool-add` subjects) onto the file's themes, without a git push.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/pool-merge.test.ts
 *
 * Pure module only (`pool-merge.ts` has no `server-only`), so this exercises the
 * exact function `planner.ts` calls at plan time.
 */

import assert from 'node:assert/strict'
import { mergeThemesWithExtras } from './pool-merge'
import { CROSS_STITCH_THEMES, type PoolExtra } from './subject-pool'

interface PassFail {
  name: string
  passed: boolean
  detail?: string
}
const results: PassFail[] = []
function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

const extra = (theme: string, subject: string, rest: Partial<PoolExtra> = {}): PoolExtra => ({
  theme,
  subject,
  addedAt: '2026-09-08T00:00:00.000Z',
  addedBy: 'test',
  ...rest,
})

// ─── no extras, no change ──────────────────────────────────────────────────

record('no extras: the same array comes back, untouched', () => {
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [])
  assert.equal(merged, CROSS_STITCH_THEMES)
})

record('an extra for a theme not in the pool is dropped, not thrown', () => {
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [extra('not-a-real-theme', 'a made-up thing')])
  for (const t of merged) assert.equal(t.examples.includes('a made-up thing'), false)
})

// ─── the join ───────────────────────────────────────────────────────────────

record('a genuinely new subject joins its theme, and only its theme', () => {
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [extra('coastal', 'a puffin colony on a chalk stack')])
  const coastal = merged.find((t) => t.id === 'coastal')!
  assert.ok(coastal.examples.includes('a puffin colony on a chalk stack'))
  // Every other theme is untouched (same reference — nothing cloned needlessly).
  for (const t of merged) {
    if (t.id === 'coastal') continue
    const original = CROSS_STITCH_THEMES.find((o) => o.id === t.id)!
    assert.equal(t, original, `${t.id} should not have been touched`)
  }
})

record('the file theme object itself is never mutated', () => {
  const before = CROSS_STITCH_THEMES.find((t) => t.id === 'coastal')!.examples.length
  mergeThemesWithExtras(CROSS_STITCH_THEMES, [extra('coastal', 'a lifeboat launching down a slipway')])
  const after = CROSS_STITCH_THEMES.find((t) => t.id === 'coastal')!.examples.length
  assert.equal(after, before, 'subject-pool.ts examples array must not grow across calls')
})

// ─── the dedupe against the file ───────────────────────────────────────────

record('an extra that duplicates a file subject verbatim is skipped', () => {
  const coastal = CROSS_STITCH_THEMES.find((t) => t.id === 'coastal')!
  const already = coastal.examples[0]!
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [extra('coastal', already)])
  const mergedCoastal = merged.find((t) => t.id === 'coastal')!
  assert.equal(mergedCoastal.examples.length, coastal.examples.length, 'a verbatim repeat must not grow the pool')
})

record('an extra that is a re-wording of a file subject (same subject key) is skipped', () => {
  // "a white lighthouse above a blue bay" is already in `coastal`; a re-wording
  // normalises to the same key and must not double the pool's runway.
  const coastal = CROSS_STITCH_THEMES.find((t) => t.id === 'coastal')!
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [extra('coastal', 'the white lighthouse above the blue bay')])
  const mergedCoastal = merged.find((t) => t.id === 'coastal')!
  assert.equal(mergedCoastal.examples.length, coastal.examples.length, 'a same-idea re-wording must not grow the pool')
})

record('two extras that are the same idea as each other: only the first survives', () => {
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [
    extra('coastal', 'a puffin colony on a chalk sea stack'),
    extra('coastal', 'a colony of puffins on a chalk sea stack'), // same idea, same tokens
  ])
  const coastal = merged.find((t) => t.id === 'coastal')!
  const original = CROSS_STITCH_THEMES.find((t) => t.id === 'coastal')!
  assert.equal(coastal.examples.length, original.examples.length + 1, 'the second extra should have been deduped against the first')
})

// ─── lane fields ────────────────────────────────────────────────────────────

record('a per-subject lane restriction lands in the merged theme\'s laneOverrides', () => {
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [
    extra('coastal', 'a tide pool of hermit crabs at low water', { lanes: ['mini', 'small'] }),
  ])
  const coastal = merged.find((t) => t.id === 'coastal')!
  assert.deepEqual(coastal.laneOverrides?.['a tide pool of hermit crabs at low water'], ['mini', 'small'])
})

record("a theme's existing laneOverrides survive alongside a new one", () => {
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [
    extra('coastal', 'a tide pool of hermit crabs at low water', { lanes: ['mini', 'small'] }),
  ])
  const coastal = merged.find((t) => t.id === 'coastal')!
  const original = CROSS_STITCH_THEMES.find((t) => t.id === 'coastal')!
  for (const [subject, lanes] of Object.entries(original.laneOverrides ?? {})) {
    assert.deepEqual(coastal.laneOverrides?.[subject], lanes)
  }
})

record('setOf is raised when an extra asks for a bigger set, never lowered', () => {
  const smallMakes = CROSS_STITCH_THEMES.find((t) => t.id === 'small-makes')!
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [
    extra('small-makes', 'a striped conker on a green cushion', { setOf: 3 }), // lower than the file's 6
  ])
  const mergedTheme = merged.find((t) => t.id === 'small-makes')!
  assert.equal(mergedTheme.setOf, smallMakes.setOf, 'a smaller setOf must not lower the theme default')

  const merged2 = mergeThemesWithExtras(CROSS_STITCH_THEMES, [
    extra('small-makes', 'a striped conker on a green cushion', { setOf: 9 }), // higher than the file's 6
  ])
  const mergedTheme2 = merged2.find((t) => t.id === 'small-makes')!
  assert.equal(mergedTheme2.setOf, 9)
})

// ─── several themes at once ─────────────────────────────────────────────────

record('extras for several themes each join their own theme only', () => {
  const merged = mergeThemesWithExtras(CROSS_STITCH_THEMES, [
    extra('coastal', 'a rope-fendered dinghy tied to a ring'),
    extra('folk-geometric', 'a Nordic star band in indigo and cream'),
    extra('small-makes', 'a single blackberry on a green leaf'),
  ])
  assert.ok(merged.find((t) => t.id === 'coastal')!.examples.includes('a rope-fendered dinghy tied to a ring'))
  assert.ok(merged.find((t) => t.id === 'folk-geometric')!.examples.includes('a Nordic star band in indigo and cream'))
  assert.ok(merged.find((t) => t.id === 'small-makes')!.examples.includes('a single blackberry on a green leaf'))
  // Cross-contamination check: none of these leaked into a theme they were not addressed to.
  assert.equal(merged.find((t) => t.id === 'witchy-gothic')!, CROSS_STITCH_THEMES.find((t) => t.id === 'witchy-gothic')!)
})

// ─── Report ────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
