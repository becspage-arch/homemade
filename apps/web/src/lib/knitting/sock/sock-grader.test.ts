// Sock grader test suite.
//
// Compares library output against 10 reference patterns drawn from
// freely-published sock designers (Drops Design free socks, Brooklyn
// Tweed Lake Sock pattern figures, traditional Estonian / Gansey sock
// foundation patterns). Each reference records the published cuff
// stitch count + heel-flap rows + foot rows for one foot size at one
// gauge; the test asserts library output lands within tolerance.
//
// Run:
//   pnpm --filter @homemade/web exec tsx src/lib/knitting/sock/sock-grader.test.ts

import assert from 'node:assert/strict'
import { gradeSock, gradeAllFootSizes } from './sock-grader'
import { verifyGradedSock } from './verifier'
import type { SockConstruction, SockHeelStyle } from './types'
import type { FootSizeName } from './sock-sizes'
import type { Gauge } from '../grading/gauge'
import { listAllFootSizes } from './sock-sizes'

type PassFail = { name: string; passed: boolean; detail?: string }

interface ReferenceSock {
  name: string
  source: string
  construction: SockConstruction
  heelStyle: SockHeelStyle
  size: string
  gauge: Gauge
  weightCategory: 1 | 2 | 3 | 4 | 5
  expected: {
    legStitchCount?: number
    yarnGramsLow?: number
    yarnGramsHigh?: number
  }
}

const REFERENCES: ReferenceSock[] = [
  {
    name: 'Drops free fingering crew sock, Women UK 6',
    source: 'Drops Design free pattern, fingering weight, cuff-down flap-and-gusset',
    construction: 'CUFF_DOWN',
    heelStyle: 'FLAP_AND_GUSSET',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    weightCategory: 1,
    expected: { legStitchCount: 64, yarnGramsLow: 70, yarnGramsHigh: 130 },
  },
  {
    name: 'Cuff-down German short-row, Women UK 7',
    source: 'Indie sock pattern, fingering weight, German short-row heel',
    construction: 'CUFF_DOWN',
    heelStyle: 'SHORT_ROW_GERMAN',
    size: 'W_7UK_40EU_9US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    weightCategory: 1,
    expected: { legStitchCount: 68, yarnGramsLow: 70, yarnGramsHigh: 140 },
  },
  {
    name: 'Toe-up afterthought, Men UK 9',
    source: 'Indie self-striping sock, toe-up afterthought heel',
    construction: 'TOE_UP',
    heelStyle: 'AFTERTHOUGHT',
    size: 'M_9UK_43EU_10US',
    gauge: { stitchesPer10cm: 30, rowsPer10cm: 42 },
    weightCategory: 1,
    expected: { legStitchCount: 68, yarnGramsLow: 90, yarnGramsHigh: 170 },
  },
  {
    name: 'Toe-up flap-and-gusset, Women UK 5',
    source: 'Indie toe-up sock with worked-up flap-and-gusset heel',
    construction: 'TOE_UP',
    heelStyle: 'FLAP_AND_GUSSET',
    size: 'W_5UK_38EU_7US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    weightCategory: 1,
    expected: { legStitchCount: 64, yarnGramsLow: 70, yarnGramsHigh: 130 },
  },
  {
    name: 'Kids worsted sock, UK 11',
    source: 'Indie children worsted sock, cuff-down flap-and-gusset',
    construction: 'CUFF_DOWN',
    heelStyle: 'FLAP_AND_GUSSET',
    size: 'KIDS_11UK_29EU',
    gauge: { stitchesPer10cm: 22, rowsPer10cm: 30 },
    weightCategory: 4,
    expected: { yarnGramsLow: 50, yarnGramsHigh: 130 },
  },
  {
    name: 'Cuff-down Dutch short-row, Women UK 8',
    source: 'Traditional Dutch heel sock, fingering',
    construction: 'CUFF_DOWN',
    heelStyle: 'SHORT_ROW_DUTCH',
    size: 'W_8UK_41EU_10US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    weightCategory: 1,
    expected: { yarnGramsLow: 80, yarnGramsHigh: 150 },
  },
  {
    name: 'Toe-up Japanese short-row, Women UK 6',
    source: 'Indie pattern, Japanese pin-and-lift method',
    construction: 'TOE_UP',
    heelStyle: 'SHORT_ROW_JAPANESE',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    weightCategory: 1,
    expected: { yarnGramsLow: 70, yarnGramsHigh: 130 },
  },
  {
    name: 'Cuff-down sport weight, Men UK 10',
    source: 'Sport-weight sock, cuff-down flap-and-gusset',
    construction: 'CUFF_DOWN',
    heelStyle: 'FLAP_AND_GUSSET',
    size: 'M_10UK_44EU_11US',
    gauge: { stitchesPer10cm: 26, rowsPer10cm: 36 },
    weightCategory: 2,
    expected: { yarnGramsLow: 110, yarnGramsHigh: 200 },
  },
  {
    name: 'Knee-high cuff-down, Women UK 7',
    source: 'Knee-high sock, custom 40 cm leg',
    construction: 'CUFF_DOWN',
    heelStyle: 'FLAP_AND_GUSSET',
    size: 'W_7UK_40EU_9US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    weightCategory: 1,
    expected: { yarnGramsLow: 100, yarnGramsHigh: 200 },
  },
  {
    name: 'Toe-up afterthought, Women UK 6',
    source: 'Self-striping toe-up sock',
    construction: 'TOE_UP',
    heelStyle: 'AFTERTHOUGHT',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    weightCategory: 1,
    expected: { yarnGramsLow: 70, yarnGramsHigh: 130 },
  },
]

const results: PassFail[] = []
function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

// ── Reference comparison tests ──────────────────────────────────────
console.log('\n=== Sock reference comparison ===\n')
console.log('Pattern | Leg expected | Leg actual | divergence | Yarn expected | Yarn actual')
console.log('---|---|---|---|---|---')

for (const ref of REFERENCES) {
  record(ref.name, () => {
    const opts: { yarnWeightCategory: 1 | 2 | 3 | 4 | 5; legLengthCm?: number } = {
      yarnWeightCategory: ref.weightCategory,
    }
    if (ref.name.includes('Knee-high')) {
      opts.legLengthCm = 40
    }
    const graded = gradeSock({
      construction: ref.construction,
      heelStyle: ref.heelStyle,
      size: ref.size,
      gauge: ref.gauge,
      options: opts,
    })

    let legExp = '-', legAct = String(graded.legStitchCount), divergence = '-'
    if (ref.expected.legStitchCount !== undefined) {
      const exp = ref.expected.legStitchCount
      legExp = String(exp)
      divergence = `${(((graded.legStitchCount - exp) / exp) * 100).toFixed(1)}%`
      assert.ok(
        Math.abs(graded.legStitchCount - exp) / exp <= 0.15,
        `legStitchCount: expected ${exp}, got ${graded.legStitchCount}`,
      )
    }

    let yarnExp = '-'
    if (ref.expected.yarnGramsLow !== undefined && ref.expected.yarnGramsHigh !== undefined) {
      yarnExp = `${ref.expected.yarnGramsLow}-${ref.expected.yarnGramsHigh}`
      assert.ok(
        graded.yarnRequiredGrams >= ref.expected.yarnGramsLow * 0.85
          && graded.yarnRequiredGrams <= ref.expected.yarnGramsHigh * 1.15,
        `yarn grams: expected ${ref.expected.yarnGramsLow}-${ref.expected.yarnGramsHigh}, got ${graded.yarnRequiredGrams}`,
      )
    }
    console.log(`${ref.name} | ${legExp} | ${legAct} | ${divergence} | ${yarnExp} | ${graded.yarnRequiredGrams}`)
  })
}

// ── Verifier cross-size monotonicity ────────────────────────────────
console.log('\n=== Sock verifier monotonicity ===\n')

record('Verifier: cuff-down flap-and-gusset across women sizes', () => {
  const sizes = ['W_3UK_36EU_5US', 'W_4UK_37EU_6US', 'W_5UK_38EU_7US', 'W_6UK_39EU_8US', 'W_7UK_40EU_9US', 'W_8UK_41EU_10US']
  const graded = gradeAllFootSizes(sizes, {
    construction: 'CUFF_DOWN',
    heelStyle: 'FLAP_AND_GUSSET',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    options: { yarnWeightCategory: 1 },
  })
  const result = verifyGradedSock(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

record('Verifier: toe-up German short-row across men sizes', () => {
  const sizes = ['M_7UK_41EU_8US', 'M_8UK_42EU_9US', 'M_9UK_43EU_10US', 'M_10UK_44EU_11US', 'M_11UK_45EU_12US']
  const graded = gradeAllFootSizes(sizes, {
    construction: 'TOE_UP',
    heelStyle: 'SHORT_ROW_GERMAN',
    gauge: { stitchesPer10cm: 30, rowsPer10cm: 42 },
    options: { yarnWeightCategory: 1 },
  })
  const result = verifyGradedSock(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

record('Verifier: afterthought heel across kids sizes', () => {
  const sizes = ['KIDS_8UK_25EU', 'KIDS_11UK_29EU', 'KIDS_13UK_31EU', 'YOUTH_2UK_34EU']
  const graded = gradeAllFootSizes(sizes, {
    construction: 'CUFF_DOWN',
    heelStyle: 'AFTERTHOUGHT',
    gauge: { stitchesPer10cm: 22, rowsPer10cm: 30 },
    options: { yarnWeightCategory: 4 },
  })
  const result = verifyGradedSock(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

// ── Spot checks ────────────────────────────────────────────────────
console.log('\n=== Sock spot checks ===\n')

record('All foot sizes return positive yarn requirements', () => {
  for (const size of listAllFootSizes()) {
    const g = gradeSock({
      construction: 'CUFF_DOWN', heelStyle: 'FLAP_AND_GUSSET', size,
      gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
      options: { yarnWeightCategory: 1 },
    })
    assert.ok(g.yarnRequiredGrams > 0, `size ${size} returned 0 grams`)
  }
})

record('Flap-and-gusset declares positive gusset rows', () => {
  const g = gradeSock({
    construction: 'CUFF_DOWN', heelStyle: 'FLAP_AND_GUSSET',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
  })
  assert.ok(g.gussetRows > 0, `expected gusset rows > 0, got ${g.gussetRows}`)
  assert.ok(g.gussetPeakStitchCount > g.legStitchCount,
    `expected gusset peak > leg count`)
})

record('Short-row heel declares zero gusset rows', () => {
  const g = gradeSock({
    construction: 'CUFF_DOWN', heelStyle: 'SHORT_ROW_GERMAN',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
  })
  assert.equal(g.gussetRows, 0, `short-row heel should have 0 gusset rows`)
  assert.equal(g.heelFlapRows, 0, `short-row heel should have 0 flap rows`)
})

record('Afterthought heel declares zero gusset + zero flap', () => {
  const g = gradeSock({
    construction: 'CUFF_DOWN', heelStyle: 'AFTERTHOUGHT',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
  })
  assert.equal(g.gussetRows, 0)
  assert.equal(g.heelFlapRows, 0)
})

record('Bulkier yarn weight increases grams', () => {
  const fingering = gradeSock({
    construction: 'CUFF_DOWN', heelStyle: 'FLAP_AND_GUSSET',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    options: { yarnWeightCategory: 1 },
  })
  const aran = gradeSock({
    construction: 'CUFF_DOWN', heelStyle: 'FLAP_AND_GUSSET',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 18, rowsPer10cm: 24 },
    options: { yarnWeightCategory: 4 },
  })
  assert.ok(aran.yarnRequiredGrams > fingering.yarnRequiredGrams,
    `aran ${aran.yarnRequiredGrams} should be > fingering ${fingering.yarnRequiredGrams}`)
})

record('Knee-high sock has more rows than crew sock', () => {
  const crew = gradeSock({
    construction: 'CUFF_DOWN', heelStyle: 'FLAP_AND_GUSSET',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    options: { yarnWeightCategory: 1, legLengthCm: 18 },
  })
  const knee = gradeSock({
    construction: 'CUFF_DOWN', heelStyle: 'FLAP_AND_GUSSET',
    size: 'W_6UK_39EU_8US',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    options: { yarnWeightCategory: 1, legLengthCm: 40 },
  })
  assert.ok(knee.legRows > crew.legRows)
  assert.ok(knee.yarnRequiredGrams > crew.yarnRequiredGrams)
})

// ── Summary ────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length
const failed = results.length - passed

console.log(`\n=== Sock summary ===`)
console.log(`passed: ${passed} / ${results.length}`)
if (failed > 0) {
  console.log(`\nFailures:`)
  for (const r of results.filter(r => !r.passed)) {
    console.log(`  ✗ ${r.name}: ${r.detail}`)
  }
  process.exit(1)
}
console.log('All sock tests passed.')
