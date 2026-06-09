// Crochet finished-piece renderer test suite.
//
// Runnable as a tsx script (no vitest/jest in this repo). Validates:
//   - The anchor (granny-square-basic-three-round) renders + verifies.
//   - Round (mandala), square (granny), and hexagon motifs each layout
//     correctly via the motif detector.
//   - Three stitch swatches render: chain, double-crochet-uk, bobble.
//   - Edge cases: empty chartData, single-stitch chart, very large round.
//   - Unknown stitch symbols downgrade to UNKNOWN_STITCH and the verifier
//     surfaces an issue.

import assert from 'node:assert/strict'
import {
  renderPattern,
  renderSwatch,
  hasStitchShape,
  listStitchShapes,
} from './index'
import type { ChartDefinition } from '../../craft-charts/types'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({
      name,
      passed: false,
      detail: err instanceof Error ? err.message : String(err),
    })
  }
}

// ─── Fixtures ───────────────────────────────────────────────────────────

const GRANNY_THREE_ROUND: ChartDefinition = {
  craft: 'crochet',
  layout: 'round',
  title: 'Granny square, three-round chart',
  rounds: [
    {
      roundNumber: 1,
      stitches: [
        { symbol: 'magic-ring' },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
      ],
    },
    {
      roundNumber: 2,
      stitches: [
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
      ],
    },
    {
      roundNumber: 3,
      stitches: [
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 2 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain', count: 1 },
      ],
    },
  ],
}

const MANDALA_ROUND: ChartDefinition = {
  craft: 'crochet',
  layout: 'round',
  title: 'Mandala medallion',
  rounds: [
    { roundNumber: 1, stitches: [{ symbol: 'magic-ring' }, { symbol: 'treble', count: 8 }] },
    { roundNumber: 2, stitches: [{ symbol: 'treble', count: 16 }] },
    { roundNumber: 3, stitches: [{ symbol: 'treble', count: 24 }, { symbol: 'picot', count: 8 }] },
  ],
}

const HEXAGON: ChartDefinition = {
  craft: 'crochet',
  layout: 'round',
  title: 'Hexagon motif',
  rounds: [
    {
      roundNumber: 1,
      stitches: [
        { symbol: 'magic-ring' },
        { symbol: 'treble', count: 2 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 2 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 2 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 2 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 2 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 2 },
        { symbol: 'chain' },
      ],
    },
    {
      roundNumber: 2,
      stitches: [
        { symbol: 'treble', count: 3 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain' },
        { symbol: 'treble', count: 3 },
        { symbol: 'chain' },
      ],
    },
  ],
}

const FLAT_BLOCK: ChartDefinition = {
  craft: 'crochet',
  layout: 'flat',
  title: 'Flat block',
  rows: [
    { rowNumber: 1, rightSide: true, stitches: [{ symbol: 'treble', count: 8 }] },
    { rowNumber: 2, rightSide: false, stitches: [{ symbol: 'treble', count: 8 }] },
    { rowNumber: 3, rightSide: true, stitches: [{ symbol: 'treble', count: 8 }] },
  ],
}

// ─── Smoke + structural tests ───────────────────────────────────────────

record('Anchor: granny square renders + verifies', () => {
  const r = renderPattern(GRANNY_THREE_ROUND, { unitPx: 28 })
  assert.ok(r.svg.startsWith('<svg'), 'svg output starts with <svg')
  assert.ok(r.svg.length > 500, 'svg output non-trivial')
  assert.equal(r.motifShape.kind, 'square', 'motif detector identifies square')
  assert.ok(r.width > 200 && r.height > 200, 'canvas non-trivial')
  assert.ok(r.verify.stitchCount > 30, `enough placements (got ${r.verify.stitchCount})`)
  assert.ok(r.verify.ok, `verifier ok (issues: ${r.verify.issues.join('; ')})`)
})

record('Round motif: mandala renders + detects round shape', () => {
  const r = renderPattern(MANDALA_ROUND, { unitPx: 28 })
  assert.equal(r.motifShape.kind, 'round', 'detected as round')
  assert.ok(r.verify.stitchCount >= 48, 'stitches roughly match expanded count')
  assert.ok(r.verify.ok || r.verify.issues.length === 0)
})

record('Hexagon: 6-corner detector triggers', () => {
  const r = renderPattern(HEXAGON, { unitPx: 28 })
  assert.equal(r.motifShape.kind, 'hexagon', 'detected as hexagon')
  assert.ok(r.verify.stitchCount > 12)
})

record('Flat block: row layout produces grid placements', () => {
  const r = renderPattern(FLAT_BLOCK, { unitPx: 28 })
  assert.equal(r.motifShape.kind, 'flat', 'flat shape')
  assert.equal(r.verify.stitchCount, 24, '8 trebles x 3 rows = 24 placements')
  assert.ok(r.verify.ok)
})

// ─── Stitch swatches ────────────────────────────────────────────────────

record('Swatch: chain', () => {
  const s = renderSwatch({ symbol: 'chain', pixelSize: 400 })
  assert.ok(s.ok)
  assert.ok(s.svg.startsWith('<svg'))
})

record('Swatch: double-crochet-uk', () => {
  const s = renderSwatch({ symbol: 'double-crochet-uk', pixelSize: 400 })
  assert.ok(s.ok)
  assert.ok(s.svg.length > 300)
})

record('Swatch: bobble', () => {
  const s = renderSwatch({ symbol: 'bobble', pixelSize: 400 })
  assert.ok(s.ok)
})

record('Swatch: unknown key returns ok=false', () => {
  const s = renderSwatch({ symbol: 'not-a-real-stitch', pixelSize: 400 })
  assert.equal(s.ok, false)
  assert.ok((s.reason ?? '').includes('not found'))
})

// ─── Edge cases ──────────────────────────────────────────────────────────

record('Edge: empty rounds returns small canvas without crashing', () => {
  const empty: ChartDefinition = { craft: 'crochet', layout: 'round', rounds: [] }
  const r = renderPattern(empty, { unitPx: 28 })
  assert.equal(r.verify.stitchCount, 0)
  assert.ok(r.width > 0 && r.height > 0, 'fallback canvas size')
})

record('Edge: single-stitch chart yields one placement', () => {
  const single: ChartDefinition = {
    craft: 'crochet',
    layout: 'round',
    rounds: [{ roundNumber: 1, stitches: [{ symbol: 'treble', count: 1 }] }],
  }
  const r = renderPattern(single, { unitPx: 28 })
  assert.equal(r.verify.stitchCount, 1)
})

record('Edge: large round (96 stitches) places all', () => {
  const big: ChartDefinition = {
    craft: 'crochet',
    layout: 'round',
    rounds: [{ roundNumber: 1, stitches: [{ symbol: 'treble', count: 96 }] }],
  }
  const r = renderPattern(big, { unitPx: 14 })
  assert.equal(r.verify.stitchCount, 96)
})

record('Edge: unknown stitch in chart logged, fallback rendered', () => {
  const mixed: ChartDefinition = {
    craft: 'crochet',
    layout: 'round',
    rounds: [
      {
        roundNumber: 1,
        stitches: [
          { symbol: 'treble', count: 4 },
          { symbol: 'mystery-stitch', count: 2 },
        ],
      },
    ],
  }
  const r = renderPattern(mixed, { unitPx: 28 })
  // Verifier flags unknown symbols.
  assert.ok(
    r.verify.issues.some((i) => i.includes('unknown stitch')),
    `verifier should flag unknown stitch (issues: ${r.verify.issues.join('; ')})`,
  )
  // Placements still happen (with fallback shape).
  assert.equal(r.verify.stitchCount, 6)
})

// ─── Registry coverage ──────────────────────────────────────────────────

record('Registry: all shapes are unique', () => {
  const keys = listStitchShapes().map((s) => s.key)
  const set = new Set(keys)
  assert.equal(set.size, keys.length, 'no duplicate stitch keys')
})

record('Registry: foundation keys are present', () => {
  const required = ['chain', 'slip-stitch', 'magic-ring', 'treble', 'double-crochet-uk', 'half-treble', 'double-treble']
  for (const k of required) {
    assert.ok(hasStitchShape(k), `${k} should be in the registry`)
  }
})

record('Registry: joining keys are present (for swatches)', () => {
  for (const k of ['join-as-you-go', 'slip-stitch-seam', 'whipstitch-join']) {
    assert.ok(hasStitchShape(k), `${k} should be in the registry`)
  }
})

// ─── Summary ────────────────────────────────────────────────────────────

let pass = 0
let fail = 0
for (const r of results) {
  if (r.passed) {
    console.log(`  PASS  ${r.name}`)
    pass++
  } else {
    console.log(`  FAIL  ${r.name}`)
    if (r.detail) console.log(`        ${r.detail}`)
    fail++
  }
}
console.log(`\n${pass} passed, ${fail} failed, ${results.length} total.`)
if (fail > 0) process.exit(1)
