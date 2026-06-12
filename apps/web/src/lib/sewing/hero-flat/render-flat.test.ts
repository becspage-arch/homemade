// SPDX-License-Identifier: MIT
// Hero-flat renderer tests.
//
// Runnable via:
//   pnpm --filter @homemade/web exec tsx src/lib/sewing/hero-flat/render-flat.test.ts
//
// Snapshot tests pin the SVG output for representative archetypes so
// renderer-side regressions surface in code review. Bumping
// RENDERER_VERSION is the supported way to invalidate snapshots; this
// test file then needs the GOLDEN strings refreshed in the same PR.

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

import {
  computeCacheKey,
  RENDERER_VERSION,
  renderArchetype,
  renderFlatForSlug,
} from './render-flat'
import { trimSeamAllowance } from './trim-seam-allowance'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
    process.stdout.write(`  ok  ${name}\n`)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    results.push({ name, passed: false, detail })
    process.stdout.write(`  FAIL ${name}\n  ${detail}\n`)
  }
}

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex')
}

// ── Golden snapshots — refresh by bumping RENDERER_VERSION and
//    pasting the printed hash from `node:assert/strict.equal`. ──────────

// The goldens are SHA-256 over the full SVG output, so a single byte
// difference in any path / construction line surfaces here.
const BELLA_GOLDEN = 'd41e2d6c325579ce4d0d6a751cc0a4da6fa030d9594ce857e3666abfe23baa24'
const TOTE_GOLDEN = 'f4c2e546abad2bf585fa5e26a8019b9c5a5ec2deac07cf807d4a0ce443e30f53'

record('renderFlatForSlug renders Bella body block (bodice-fitted)', () => {
  const out = renderFlatForSlug('freesewing-bella-body-block')
  assert.ok(out, 'expected a render result')
  assert.equal(out!.rendererVersion, RENDERER_VERSION)
  assert.match(out!.svg, /^<svg/, 'svg starts with <svg')
  assert.match(out!.svg, /viewBox="0 0 800 1000"/, 'canvas size pinned')
  // Print the current hash on a mismatch so refreshing the golden is
  // a copy-paste rather than a re-derivation.
  const hash = sha256(out!.svg)
  assert.equal(hash, BELLA_GOLDEN, `Bella SVG hash drifted; refresh BELLA_GOLDEN to "${hash}"`)
})

record('renderFlatForSlug renders the tote bag', () => {
  const out = renderFlatForSlug('sewing-tote-bag-interfaced-handles')
  assert.ok(out, 'expected a render result')
  const hash = sha256(out!.svg)
  assert.equal(hash, TOTE_GOLDEN, `Tote SVG hash drifted; refresh TOTE_GOLDEN to "${hash}"`)
})

record('renderFlatForSlug returns null for an unmapped slug', () => {
  const out = renderFlatForSlug('does-not-exist')
  assert.equal(out, null)
})

record('renderArchetype covers every archetype id (exhaustive switch)', () => {
  // Smoke each one. The exhaustive check inside renderArchetype throws
  // if any case is missing.
  const ids = [
    'bodice-fitted', 'top-set-in-sleeve', 'shirt-button-down', 'hoodie',
    'tank', 'bikini-top', 'coat', 'corset', 'jumpsuit', 'kids-tshirt',
    'skirt-pencil', 'skirt-flared', 'trousers', 'trousers-wrap',
    'bag-tote', 'bag-drawstring', 'bag-pouch-zip', 'bag-backpack',
    'bag-bucket', 'bag-sling',
    'pillowcase', 'cushion', 'tea-towel', 'table-runner',
    'throw-blanket', 'baby-blanket', 'curtain-rod-pocket',
    'curtain-eyelet', 'apron', 'pot-holder-set', 'lampshade-drum',
    'headband', 'scrunchie', 'belt', 'tie', 'bow-tie',
    'scarf-infinity', 'snood', 'sun-hat', 'baby-bib',
  ] as const
  for (const id of ids) {
    const r = renderArchetype({ archetype: id })
    assert.ok(r.front.length > 0, `${id} front markup empty`)
    assert.ok(r.back.length > 0, `${id} back markup empty`)
    assert.ok(r.viewHeightPx > 0, `${id} viewHeightPx invalid`)
  }
})

record('computeCacheKey is deterministic for the same inputs', () => {
  const k1 = computeCacheKey('bodice-fitted', { ease: 4 })
  const k2 = computeCacheKey('bodice-fitted', { ease: 4 })
  assert.equal(k1, k2)
})

record('computeCacheKey changes when archetype changes', () => {
  const k1 = computeCacheKey('bodice-fitted')
  const k2 = computeCacheKey('tank')
  assert.notEqual(k1, k2)
})

record('computeCacheKey changes when customisation differs', () => {
  const k1 = computeCacheKey('bodice-fitted', { ease: 4 })
  const k2 = computeCacheKey('bodice-fitted', { ease: 8 })
  assert.notEqual(k1, k2)
})

// ── trim-seam-allowance helper unit tests ──────────────────────────────

record('trimSeamAllowance shrinks a clockwise square inward by the allowance', () => {
  // Clockwise square 100x100 centred on origin.
  const sq = [
    { x: -50, y: -50 },
    { x: 50, y: -50 },
    { x: 50, y: 50 },
    { x: -50, y: 50 },
  ]
  const trimmed = trimSeamAllowance(sq, 10)
  // Expect a 80x80 square centred on origin.
  for (const p of trimmed) {
    assert.ok(Math.abs(Math.abs(p.x) - 40) < 0.01, `x off — got ${p.x}`)
    assert.ok(Math.abs(Math.abs(p.y) - 40) < 0.01, `y off — got ${p.y}`)
  }
})

record('trimSeamAllowance with zero allowance returns the input verbatim', () => {
  const poly = [
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 },
  ]
  const trimmed = trimSeamAllowance(poly, 0)
  assert.deepEqual(trimmed, poly)
})

record('trimSeamAllowance handles a clockwise triangle', () => {
  const tri = [
    { x: 0, y: -50 },
    { x: 50, y: 50 },
    { x: -50, y: 50 },
  ]
  const trimmed = trimSeamAllowance(tri, 5)
  assert.equal(trimmed.length, 3)
  for (const p of trimmed) {
    assert.ok(Number.isFinite(p.x))
    assert.ok(Number.isFinite(p.y))
  }
})

// ── Summary ────────────────────────────────────────────────────────────

const failed = results.filter(r => !r.passed)
process.stdout.write(`\n${results.length - failed.length}/${results.length} passed\n`)
if (failed.length > 0) {
  process.exitCode = 1
}
