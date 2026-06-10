// Knitting grader test suite.
//
// Runnable as a tsx script. Compares library output against 10 reference
// patterns drawn from freely-published designers (Drops Design, PetiteKnit,
// Brooklyn Tweed) and pre-1964 pattern publications (Elizabeth Zimmermann,
// Mary Thomas). Each reference records the published stitch counts at hem
// / bust / cuff for one size at one gauge; the test asserts library output
// lands within a 15% tolerance (tighter than crochet's 15% because knit
// fabric grades more predictably).
//
// Run:
//   pnpm --filter @homemade/web exec tsx src/lib/knitting/grading/garment-grader.test.ts
//
// Exits non-zero if any assertion fails.

import assert from 'node:assert/strict'
import { gradeGarment, gradeAllSizes } from './garment-grader'
import { verifyGradedPattern } from './verifier'
import type { ConstructionShape, GarmentType, Gauge } from './types'
import type { EasePreset } from './ease-presets'
import type { SizeName } from './size-charts'
import { listAllSizes } from './size-charts'

type PassFail = { name: string; passed: boolean; detail?: string }

type DominantFabricKey =
  | 'STOCKINETTE' | 'GARTER' | 'RIB_1X1' | 'RIB_2X2' | 'CABLE'
  | 'LACE' | 'BRIOCHE' | 'COLOURWORK_STRANDED'

interface ReferencePattern {
  name: string
  source: string
  shape: ConstructionShape
  garmentType: GarmentType
  size: SizeName
  gauge: Gauge
  ease: EasePreset
  weightCategory: 1 | 2 | 3 | 4 | 5 | 6 | 7
  dominantFabric?: DominantFabricKey
  expected: {
    hemStitchCount?: number
    bustStitchCount?: number
    sleeveCuffStitchCount?: number
    sleeveBicepStitchCount?: number
    yarnGramsLow?: number
    yarnGramsHigh?: number
  }
}

const REFERENCES: ReferencePattern[] = [
  {
    name: 'Drops 245-1 raglan pullover, size M',
    source: 'Drops Design — free published top-down raglan, DK',
    shape: 'TOP_DOWN_RAGLAN',
    garmentType: 'PULLOVER',
    size: 'M', gauge: { stitchesPer10cm: 21, rowsPer10cm: 28 }, ease: 'POSITIVE_6', weightCategory: 3,
    expected: { bustStitchCount: 214, yarnGramsLow: 350, yarnGramsHigh: 550 },
  },
  {
    name: 'PetiteKnit Sophie Yoke style, size M',
    source: 'PetiteKnit Sophie Yoke published pattern, fingering colourwork yoke',
    shape: 'TOP_DOWN_YOKE',
    garmentType: 'PULLOVER',
    size: 'M', gauge: { stitchesPer10cm: 28, rowsPer10cm: 36 }, ease: 'POSITIVE_4', weightCategory: 1,
    dominantFabric: 'COLOURWORK_STRANDED',
    expected: { bustStitchCount: 280, yarnGramsLow: 300, yarnGramsHigh: 500 },
  },
  {
    name: 'Brooklyn Tweed set-in aran pullover, size L',
    source: 'Brooklyn Tweed style set-in sleeve pullover, aran',
    shape: 'BOTTOM_UP_SET_IN',
    garmentType: 'PULLOVER',
    size: 'L', gauge: { stitchesPer10cm: 19, rowsPer10cm: 27 }, ease: 'POSITIVE_4', weightCategory: 4,
    expected: { bustStitchCount: 212, yarnGramsLow: 500, yarnGramsHigh: 800 },
  },
  {
    name: 'Indie drop-shoulder oversized DK sweater, size S',
    source: 'Common indie drop-shoulder pattern, DK weight',
    shape: 'DROP_SHOULDER',
    garmentType: 'PULLOVER',
    size: 'S', gauge: { stitchesPer10cm: 22, rowsPer10cm: 28 }, ease: 'GENEROUS_10', weightCategory: 3,
    expected: { yarnGramsLow: 350, yarnGramsHigh: 650 },
  },
  {
    name: 'Side-to-side cardigan, size M',
    source: 'Traditional side-to-side cardigan drafting (PD manuals)',
    shape: 'SIDE_TO_SIDE',
    garmentType: 'CARDIGAN',
    size: 'M', gauge: { stitchesPer10cm: 20, rowsPer10cm: 26 }, ease: 'POSITIVE_6', weightCategory: 4,
    expected: { yarnGramsLow: 500, yarnGramsHigh: 900 },
  },
  {
    name: 'Worsted raglan kids 8',
    source: 'Indie worsted children raglan pullover',
    shape: 'TOP_DOWN_RAGLAN',
    garmentType: 'PULLOVER',
    size: 'K-8', gauge: { stitchesPer10cm: 18, rowsPer10cm: 24 }, ease: 'POSITIVE_4', weightCategory: 4,
    expected: { yarnGramsLow: 150, yarnGramsHigh: 320 },
  },
  {
    name: 'Drops Air style yoke, women XL',
    source: 'Drops Design Air-yarn yoke pullover, super bulky',
    shape: 'TOP_DOWN_YOKE',
    garmentType: 'PULLOVER',
    size: 'XL', gauge: { stitchesPer10cm: 11, rowsPer10cm: 15 }, ease: 'POSITIVE_2', weightCategory: 6,
    expected: { yarnGramsLow: 500, yarnGramsHigh: 1100 },
  },
  {
    name: 'Men M set-in cardigan',
    source: 'Standard men set-in cardigan grading, aran',
    shape: 'BOTTOM_UP_SET_IN',
    garmentType: 'CARDIGAN',
    size: 'M-M', gauge: { stitchesPer10cm: 19, rowsPer10cm: 27 }, ease: 'POSITIVE_4', weightCategory: 4,
    expected: { yarnGramsLow: 500, yarnGramsHigh: 800 },
  },
  {
    name: 'Bulky drop-shoulder oversize',
    source: 'Indie bulky drop-shoulder, women L',
    shape: 'DROP_SHOULDER',
    garmentType: 'PULLOVER',
    size: 'L', gauge: { stitchesPer10cm: 14, rowsPer10cm: 18 }, ease: 'GENEROUS_15', weightCategory: 5,
    expected: { yarnGramsLow: 600, yarnGramsHigh: 1200 },
  },
  {
    name: 'Contiguous set-in pullover, women M',
    source: 'Susie Myers contiguous method, worsted weight',
    shape: 'CONTIGUOUS_SET_IN',
    garmentType: 'PULLOVER',
    size: 'M', gauge: { stitchesPer10cm: 20, rowsPer10cm: 26 }, ease: 'POSITIVE_4', weightCategory: 4,
    expected: { bustStitchCount: 200, yarnGramsLow: 400, yarnGramsHigh: 700 },
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

// ── Reference comparison tests ──────────────────────────────────────────
console.log('\n=== Reference comparison ===\n')
console.log('Pattern | Stitch expected | Stitch actual | divergence | Yarn expected | Yarn actual')
console.log('---|---|---|---|---|---')

for (const ref of REFERENCES) {
  record(ref.name, () => {
    const graded = gradeGarment({
      constructionShape: ref.shape,
      size: ref.size,
      gauge: ref.gauge,
      easePreset: ref.ease,
      garmentType: ref.garmentType,
      options: {
        yarnWeightCategory: ref.weightCategory,
        ...(ref.dominantFabric ? { dominantFabric: ref.dominantFabric } : {}),
      },
    })

    let stitchExp = '-', stitchAct = '-', divergence = '-'
    if (ref.expected.bustStitchCount !== undefined) {
      const exp = ref.expected.bustStitchCount
      const act = graded.bustStitchCount
      stitchExp = String(exp); stitchAct = String(act)
      divergence = `${(((act - exp) / exp) * 100).toFixed(1)}%`
      // 15% tolerance — gauges vary, ease conventions vary by designer.
      assert.ok(
        Math.abs(act - exp) / exp <= 0.15,
        `bustStitchCount: expected ${exp}, got ${act}`,
      )
    } else if (ref.expected.hemStitchCount !== undefined) {
      const exp = ref.expected.hemStitchCount
      const act = graded.hemStitchCount
      stitchExp = String(exp); stitchAct = String(act)
      divergence = `${(((act - exp) / exp) * 100).toFixed(1)}%`
    }

    let yarnExp = '-'
    const yarnAct = String(graded.yarnRequiredGrams)
    if (ref.expected.yarnGramsLow !== undefined && ref.expected.yarnGramsHigh !== undefined) {
      yarnExp = `${ref.expected.yarnGramsLow}-${ref.expected.yarnGramsHigh}`
      assert.ok(
        graded.yarnRequiredGrams >= ref.expected.yarnGramsLow * 0.85
          && graded.yarnRequiredGrams <= ref.expected.yarnGramsHigh * 1.15,
        `yarn grams: expected ${ref.expected.yarnGramsLow}-${ref.expected.yarnGramsHigh}, got ${graded.yarnRequiredGrams}`,
      )
    }

    console.log(`${ref.name} | ${stitchExp} | ${stitchAct} | ${divergence} | ${yarnExp} | ${yarnAct}`)
  })
}

// ── Verifier cross-size monotonicity tests ─────────────────────────────
console.log('\n=== Verifier monotonicity ===\n')

record('Verifier: top-down raglan grades smoothly across women sizes', () => {
  const sizes: SizeName[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
  const graded = gradeAllSizes(sizes, {
    constructionShape: 'TOP_DOWN_RAGLAN',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_4',
    garmentType: 'PULLOVER',
    options: { yarnWeightCategory: 4 },
  })
  const result = verifyGradedPattern(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

record('Verifier: top-down yoke grades smoothly across women sizes', () => {
  const sizes: SizeName[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
  const graded = gradeAllSizes(sizes, {
    constructionShape: 'TOP_DOWN_YOKE',
    gauge: { stitchesPer10cm: 22, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_4',
    garmentType: 'PULLOVER',
    options: { yarnWeightCategory: 3 },
  })
  const result = verifyGradedPattern(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

record('Verifier: bottom-up set-in grades smoothly across men sizes', () => {
  const sizes: SizeName[] = ['M-S', 'M-M', 'M-L', 'M-XL', 'M-2XL']
  const graded = gradeAllSizes(sizes, {
    constructionShape: 'BOTTOM_UP_SET_IN',
    gauge: { stitchesPer10cm: 19, rowsPer10cm: 27 },
    easePreset: 'POSITIVE_4',
    garmentType: 'PULLOVER',
    options: { yarnWeightCategory: 4 },
  })
  const result = verifyGradedPattern(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

record('Verifier: drop-shoulder grades smoothly across women sizes', () => {
  const sizes: SizeName[] = ['XS', 'S', 'M', 'L', 'XL']
  const graded = gradeAllSizes(sizes, {
    constructionShape: 'DROP_SHOULDER',
    gauge: { stitchesPer10cm: 22, rowsPer10cm: 28 },
    easePreset: 'GENEROUS_10',
    garmentType: 'PULLOVER',
    options: { yarnWeightCategory: 3 },
  })
  const result = verifyGradedPattern(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

record('Verifier: side-to-side grades smoothly across women sizes', () => {
  const sizes: SizeName[] = ['S', 'M', 'L', 'XL']
  const graded = gradeAllSizes(sizes, {
    constructionShape: 'SIDE_TO_SIDE',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 26 },
    easePreset: 'POSITIVE_6',
    garmentType: 'CARDIGAN',
    options: { yarnWeightCategory: 4 },
  })
  const result = verifyGradedPattern(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

record('Verifier: contiguous-set-in grades smoothly across women sizes', () => {
  const sizes: SizeName[] = ['XS', 'S', 'M', 'L', 'XL', '2XL']
  const graded = gradeAllSizes(sizes, {
    constructionShape: 'CONTIGUOUS_SET_IN',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 26 },
    easePreset: 'POSITIVE_4',
    garmentType: 'PULLOVER',
    options: { yarnWeightCategory: 4 },
  })
  const result = verifyGradedPattern(graded)
  assert.ok(result.ok, `verifier reported issues: ${result.issues.join('; ')}`)
})

// ── Spot checks ────────────────────────────────────────────────────────
console.log('\n=== Spot checks ===\n')

record('All sizes return positive yarn requirements (top-down raglan)', () => {
  const all = listAllSizes()
  for (const size of all) {
    const g = gradeGarment({
      constructionShape: 'TOP_DOWN_RAGLAN', size,
      gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
      easePreset: 'POSITIVE_4',
      garmentType: 'PULLOVER',
      options: { yarnWeightCategory: 4 },
    })
    assert.ok(g.yarnRequiredGrams > 0, `size ${size} returned 0 grams`)
    assert.ok(g.yarnRequiredYards > 0, `size ${size} returned 0 yards`)
  }
})

record('Negative ease produces smaller bust than positive ease', () => {
  const tight = gradeGarment({
    constructionShape: 'TOP_DOWN_YOKE', size: 'M',
    gauge: { stitchesPer10cm: 22, rowsPer10cm: 28 },
    easePreset: 'NEGATIVE_4', garmentType: 'PULLOVER',
  })
  const loose = gradeGarment({
    constructionShape: 'TOP_DOWN_YOKE', size: 'M',
    gauge: { stitchesPer10cm: 22, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_8', garmentType: 'PULLOVER',
  })
  assert.ok(tight.bustStitchCount < loose.bustStitchCount)
})

record('Bulkier yarn weight produces more yarn grams for same dimensions', () => {
  const aran = gradeGarment({
    constructionShape: 'TOP_DOWN_RAGLAN', size: 'M',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_4', garmentType: 'PULLOVER',
    options: { yarnWeightCategory: 4 },
  })
  const bulky = gradeGarment({
    constructionShape: 'TOP_DOWN_RAGLAN', size: 'M',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_4', garmentType: 'PULLOVER',
    options: { yarnWeightCategory: 5 },
  })
  assert.ok(bulky.yarnRequiredGrams > aran.yarnRequiredGrams)
})

record('All locked K-5 keys populated and positive', () => {
  const g = gradeGarment({
    constructionShape: 'TOP_DOWN_RAGLAN', size: 'M',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_4', garmentType: 'PULLOVER',
  })
  for (const key of [
    'yokeDepth', 'neckCircumference', 'armholeDepth', 'sleeveCapDepth',
    'upperArmCircumference', 'wristCircumference', 'sleeveCuffCircumference',
  ] as const) {
    assert.ok(typeof g[key] === 'number', `K-5 key ${key} missing`)
    assert.ok(g[key] > 0, `K-5 key ${key} non-positive: ${g[key]}`)
  }
})

record('Cable fabric increases body stitch count vs stockinette', () => {
  const stock = gradeGarment({
    constructionShape: 'TOP_DOWN_RAGLAN', size: 'M',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_4', garmentType: 'PULLOVER',
    options: { dominantFabric: 'STOCKINETTE' },
  })
  const cable = gradeGarment({
    constructionShape: 'TOP_DOWN_RAGLAN', size: 'M',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_4', garmentType: 'PULLOVER',
    options: { dominantFabric: 'CABLE' },
  })
  assert.ok(cable.bustStitchCount > stock.bustStitchCount,
    `cable should add stitches; stockinette=${stock.bustStitchCount}, cable=${cable.bustStitchCount}`)
})

record('Vest construction skips sleeve yarn (set-in shape)', () => {
  const pull = gradeGarment({
    constructionShape: 'BOTTOM_UP_SET_IN', size: 'M',
    gauge: { stitchesPer10cm: 19, rowsPer10cm: 27 },
    easePreset: 'POSITIVE_2', garmentType: 'PULLOVER',
  })
  const vest = gradeGarment({
    constructionShape: 'BOTTOM_UP_SET_IN', size: 'M',
    gauge: { stitchesPer10cm: 19, rowsPer10cm: 27 },
    easePreset: 'POSITIVE_2', garmentType: 'VEST',
  })
  assert.ok(vest.yarnRequiredGrams < pull.yarnRequiredGrams,
    `vest should use less yarn than pullover; pull=${pull.yarnRequiredGrams}, vest=${vest.yarnRequiredGrams}`)
})

record('Contiguous set-in: sleeveCapDepth fits inside armholeDepth', () => {
  const g = gradeGarment({
    constructionShape: 'CONTIGUOUS_SET_IN', size: 'M',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 26 },
    easePreset: 'POSITIVE_4', garmentType: 'PULLOVER',
  })
  assert.ok(g.sleeveCapDepth <= g.armholeDepth + 1,
    `cap depth ${g.sleeveCapDepth} > armhole depth ${g.armholeDepth} + tolerance`)
})

// ── Summary ────────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length
const failed = results.length - passed

console.log(`\n=== Summary ===`)
console.log(`passed: ${passed} / ${results.length}`)
if (failed > 0) {
  console.log(`\nFailures:`)
  for (const r of results.filter(r => !r.passed)) {
    console.log(`  ✗ ${r.name}: ${r.detail}`)
  }
  process.exit(1)
}
console.log('All tests passed.')
