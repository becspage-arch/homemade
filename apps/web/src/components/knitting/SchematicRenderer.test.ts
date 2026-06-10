/**
 * SchematicRenderer test suite — exercises every non-deferred template
 * via the `computeSchematicSummary` helper so the geometry math is
 * tested without a React render loop.
 *
 * Runnable as a tsx script (matches the crochet + knitting-chart
 * renderer convention — no vitest in this repo):
 *
 *   pnpm --filter @homemade/web exec tsx \
 *     src/components/knitting/SchematicRenderer.test.ts
 */

import assert from 'node:assert/strict'

import {
  computeSchematicSummary,
  parseFinishedSizeText,
  type ShawlStyle,
} from './SchematicRenderer'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function nth<T>(arr: readonly T[], i: number): T {
  const v = arr[i]
  if (v === undefined) {
    throw new Error(`expected element at index ${i}, got undefined`)
  }
  return v
}

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

// ─── Scarf ──────────────────────────────────────────────────────────

record('SCARF: rectangle with width + length labels', () => {
  const summary = computeSchematicSummary(
    {
      sizesGraded: [{ name: 'default', bust: 22, length: 180 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'SCARF',
    },
    undefined,
  )
  assert.equal(summary.shape, 'SCARF')
  assert.equal(summary.sizeName, 'default')
  assert.equal(summary.measurements.length, 2)
  assert.equal(nth(summary.measurements, 0).letter, 'A')
  assert.equal(nth(summary.measurements, 0).valueCm, 22)
  assert.equal(nth(summary.measurements, 1).letter, 'B')
  assert.equal(nth(summary.measurements, 1).valueCm, 180)
  assert.equal(summary.stub, false)
})

// ─── Blanket ────────────────────────────────────────────────────────

record('BLANKET: rectangle with width + length labels', () => {
  const summary = computeSchematicSummary(
    {
      sizesGraded: [{ name: 'default', bust: 100, length: 130 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'BLANKET',
    },
    undefined,
  )
  assert.equal(summary.measurements.length, 2)
  assert.equal(nth(summary.measurements, 0).valueCm, 100)
  assert.equal(nth(summary.measurements, 1).valueCm, 130)
  assert.deepEqual(summary.viewBox, [-14, -14, 128, 158])
})

// ─── Hat ────────────────────────────────────────────────────────────

record('HAT: M size renders three measurements', () => {
  const summary = computeSchematicSummary(
    {
      sizesGraded: [
        { name: 'S', bust: 52, waist: 4, length: 20 },
        { name: 'M', bust: 56, waist: 5, length: 22 },
        { name: 'L', bust: 60, waist: 5, length: 23 },
      ],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'HAT',
    },
    undefined,
    'M',
  )
  assert.equal(summary.sizeName, 'M')
  assert.equal(summary.measurements.length, 3)
  assert.equal(nth(summary.measurements, 0).label, 'Circumference (head)')
  assert.equal(nth(summary.measurements, 0).valueCm, 56)
  assert.equal(nth(summary.measurements, 1).label, 'Brim depth')
  assert.equal(nth(summary.measurements, 1).valueCm, 5)
  assert.equal(nth(summary.measurements, 2).label, 'Total depth')
  assert.equal(nth(summary.measurements, 2).valueCm, 22)
})

record('HAT: chooses smallest graded size when chosenSize omitted', () => {
  const summary = computeSchematicSummary(
    {
      sizesGraded: [
        { name: 'S', bust: 52, length: 20 },
        { name: 'M', bust: 56, length: 22 },
      ],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'HAT',
    },
    undefined,
  )
  assert.equal(summary.sizeName, 'S')
  assert.equal(nth(summary.measurements, 0).valueCm, 52)
})

// ─── Mitt ───────────────────────────────────────────────────────────

record('MITT_GLOVE: four measurements (cuff, cuff length, hand, thumb)', () => {
  const summary = computeSchematicSummary(
    {
      sizesGraded: [
        { name: 'L', bust: 20, waist: 20, sleeveLength: 6, length: 20 },
      ],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'MITT_GLOVE',
    },
    undefined,
    'L',
  )
  assert.equal(summary.measurements.length, 4)
  assert.equal(nth(summary.measurements, 0).label, 'Cuff circumference')
  assert.equal(nth(summary.measurements, 0).valueCm, 20)
  assert.equal(nth(summary.measurements, 1).label, 'Cuff length')
  assert.equal(nth(summary.measurements, 1).valueCm, 6)
  assert.equal(nth(summary.measurements, 2).label, 'Hand length')
  assert.equal(nth(summary.measurements, 2).valueCm, 20)
  assert.equal(nth(summary.measurements, 3).label, 'Thumb length')
  // 35% of hand length.
  assert.equal(nth(summary.measurements, 3).valueCm, 7)
})

// ─── Shawl ──────────────────────────────────────────────────────────

const shawlStyles: ShawlStyle[] = [
  'TRIANGLE_TOP_DOWN',
  'TRIANGLE_BOTTOM_UP',
  'SEMICIRCLE',
  'HALF_PI',
  'ASYMMETRIC',
  'FAROESE',
  'SQUARE',
  'RECTANGULAR_STOLE',
]

for (const style of shawlStyles) {
  record(`SHAWL: ${style} renders without throwing`, () => {
    const summary = computeSchematicSummary(
      {
        sizesGraded: [{ name: 'default', bust: 180, length: 80 }],
        needleBySection: null,
        finishedSizeText: null,
        projectShape: 'SHAWL',
      },
      style,
    )
    assert.equal(summary.shape, 'SHAWL')
    assert.ok(summary.measurements.length >= 2)
    assert.equal(summary.stub, false)
  })
}

record('SHAWL: triangle wingspan + centre depth labelled', () => {
  const summary = computeSchematicSummary(
    {
      sizesGraded: [{ name: 'default', bust: 180, length: 80 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'SHAWL',
    },
    'TRIANGLE_TOP_DOWN',
  )
  assert.equal(nth(summary.measurements, 0).label, 'Wingspan')
  assert.equal(nth(summary.measurements, 0).valueCm, 180)
  assert.equal(nth(summary.measurements, 1).label, 'Centre depth')
  assert.equal(nth(summary.measurements, 1).valueCm, 80)
})

// ─── K-5 stubs ──────────────────────────────────────────────────────

for (const shape of ['SWEATER', 'CARDIGAN', 'VEST'] as const) {
  record(`${shape}: renders as K-5 placeholder`, () => {
    const summary = computeSchematicSummary(
      {
        sizesGraded: [{ name: 'M', bust: 96, length: 60 }],
        needleBySection: null,
        finishedSizeText: null,
        projectShape: shape,
      },
      undefined,
      'M',
    )
    assert.equal(summary.stub, true)
    assert.ok(summary.stubMessage?.includes('K-5'))
    assert.equal(summary.measurements.length, 0)
  })
}

record('SOCK: deferred placeholder', () => {
  const summary = computeSchematicSummary(
    {
      sizesGraded: null,
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'SOCK',
    },
    undefined,
  )
  assert.equal(summary.stub, true)
  assert.ok(summary.stubMessage?.toLowerCase().includes('sock'))
})

// ─── finishedSizeText fallback ──────────────────────────────────────

record('finishedSizeText fallback: parses "22 x 180 cm"', () => {
  const row = parseFinishedSizeText('22 x 180 cm')
  assert.ok(row)
  assert.equal(row.bust, 22)
  assert.equal(row.length, 180)
})

record('finishedSizeText fallback: parses inches and converts to cm', () => {
  const row = parseFinishedSizeText('8 x 72 in')
  assert.ok(row)
  assert.equal(row.bust, 20)
  assert.equal(row.length, 183)
})

record('finishedSizeText fallback: parses metres', () => {
  const row = parseFinishedSizeText('0.6 x 1.8 m')
  assert.ok(row)
  assert.equal(row.bust, 60)
  assert.equal(row.length, 180)
})

record('finishedSizeText fallback: returns null on unparseable string', () => {
  assert.equal(parseFinishedSizeText('a fingering-weight scarf'), null)
})

record('SCARF: works with only finishedSizeText (no sizesGraded)', () => {
  const summary = computeSchematicSummary(
    {
      sizesGraded: null,
      needleBySection: null,
      finishedSizeText: '20 x 200 cm',
      projectShape: 'SCARF',
    },
    undefined,
  )
  assert.equal(nth(summary.measurements, 0).valueCm, 20)
  assert.equal(nth(summary.measurements, 1).valueCm, 200)
  assert.equal(summary.sizeName, 'default')
})

// ─── Reporting ──────────────────────────────────────────────────────

const passed = results.filter((r) => r.passed).length
const failed = results.length - passed

console.log('\nSchematicRenderer test suite\n')
for (const r of results) {
  const mark = r.passed ? 'PASS' : 'FAIL'
  console.log(`  [${mark}] ${r.name}${r.detail ? '\n          ' + r.detail : ''}`)
}
console.log(`\n${passed}/${results.length} passed`)

if (failed > 0) {
  process.exit(1)
}
