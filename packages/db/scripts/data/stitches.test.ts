/**
 * Stitch seed file tests.
 *
 *   cd packages/db && pnpm exec tsx scripts/data/stitches.test.ts
 *
 * The seed file had drifted from the live Stitch table: on 17 June 2026 the
 * house voice sweep took the long dashes out of 24 rows' notes in the database,
 * and the file kept them, so a full run of seed-stitches.ts would have put
 * every one back on the public stitch pages. The file now carries the swept
 * text, and this keeps it that way: no em or en dash in any seed string.
 */
import assert from 'node:assert/strict'
import { STITCHES } from './stitches.js'

let passed = 0
let failed = 0
function test(name: string, fn: () => void): void {
  try {
    fn()
    passed++
    console.log(`PASS: ${name}`)
  } catch (err) {
    failed++
    console.log(`FAIL: ${name}\n  ${(err as Error).message}`)
  }
}

test('no long dashes in any seed string (house voice rule)', () => {
  const bad: string[] = []
  for (const s of STITCHES) {
    for (const [field, value] of Object.entries(s)) {
      const values = Array.isArray(value) ? value : [value]
      for (const v of values) if (typeof v === 'string' && /[–—]/.test(v)) bad.push(`${s.slug}.${field}`)
    }
  }
  assert.deepEqual(bad, [])
})

test('slugs are unique and craft-prefixed', () => {
  const seen = new Set<string>()
  for (const s of STITCHES) {
    assert.ok(!seen.has(s.slug), `duplicate slug ${s.slug}`)
    seen.add(s.slug)
    assert.ok(s.slug.startsWith(`${s.craft}-`), `${s.slug} is not prefixed with ${s.craft}-`)
  }
})

test('every parent is seeded', () => {
  const slugs = new Set(STITCHES.map((s) => s.slug))
  for (const s of STITCHES) if (s.parentStitchSlug) assert.ok(slugs.has(s.parentStitchSlug), `${s.slug} -> ${s.parentStitchSlug}`)
})

console.log(`\n${passed}/${passed + failed} passed`)
if (failed > 0) process.exit(1)
