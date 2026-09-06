// Tests for the grader route's contract: what a grade request is allowed to
// say, who gets the custom-size half of the answer, and what a stored pattern
// row has to record before the grader will touch it.
//
// Runnable as a tsx script, the same as the rest of the knitting library:
//   pnpm --filter @homemade/web exec tsx src/lib/knitting/grading/grade-request.test.ts
//
// Exits non-zero if any assertion fails.

import assert from 'node:assert/strict'

import {
  BodyMeasurementsSchema,
  FootMeasurementsSchema,
  GradeRequestSchema,
  decideCustomFit,
  toShapeOptions,
} from './grade-request'
import {
  DEFAULT_GARMENT_SIZES,
  deriveGradableSpec,
  parseGaugeText,
  readConstructionShape,
  readEasePreset,
} from './pattern-spec'
import { gradeGarment } from './garment-grader'
import { gradeSock } from '../sock/sock-grader'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function check(name: string, fn: () => void) {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: (err as Error).message })
  }
}

// ── Request validation ──────────────────────────────────────────────────────

check('a request with neither a slug nor a spec is rejected', () => {
  assert.equal(GradeRequestSchema.safeParse({}).success, false)
  assert.equal(
    GradeRequestSchema.safeParse({ gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 } }).success,
    false,
  )
})

check('a slug alone is accepted', () => {
  const parsed = GradeRequestSchema.safeParse({ slug: 'a-jumper' })
  assert.equal(parsed.success, true)
})

check('a garment spec alone is accepted, a malformed one is not', () => {
  assert.equal(
    GradeRequestSchema.safeParse({
      spec: { kind: 'GARMENT', constructionShape: 'TOP_DOWN_RAGLAN', garmentType: 'PULLOVER' },
    }).success,
    true,
  )
  assert.equal(
    GradeRequestSchema.safeParse({
      spec: { kind: 'GARMENT', constructionShape: 'SIDEWAYS_MAGIC', garmentType: 'PULLOVER' },
    }).success,
    false,
  )
  assert.equal(GradeRequestSchema.safeParse({ spec: { kind: 'HAT' } }).success, false)
})

check('a sock spec is accepted with a known heel style only', () => {
  assert.equal(
    GradeRequestSchema.safeParse({
      spec: { kind: 'SOCK', construction: 'TOE_UP', heelStyle: 'FLAP_AND_GUSSET' },
    }).success,
    true,
  )
  assert.equal(
    GradeRequestSchema.safeParse({
      spec: { kind: 'SOCK', construction: 'TOE_UP', heelStyle: 'MYSTERY' },
    }).success,
    false,
  )
})

check('a gauge of zero or nonsense is rejected', () => {
  for (const gauge of [
    { stitchesPer10cm: 0, rowsPer10cm: 28 },
    { stitchesPer10cm: 20, rowsPer10cm: -4 },
    { stitchesPer10cm: 900, rowsPer10cm: 28 },
    { stitchesPer10cm: 'twenty', rowsPer10cm: 28 },
  ]) {
    assert.equal(
      GradeRequestSchema.safeParse({ slug: 'a-jumper', gauge }).success,
      false,
      `gauge should be rejected: ${JSON.stringify(gauge)}`,
    )
  }
})

check('an ease preset outside the library vocabulary is rejected', () => {
  assert.equal(
    GradeRequestSchema.safeParse({ slug: 'a-jumper', easePreset: 'POSITIVE_4' }).success,
    true,
  )
  assert.equal(
    GradeRequestSchema.safeParse({ slug: 'a-jumper', easePreset: 'ROOMY' }).success,
    false,
  )
})

check('the size list is bounded', () => {
  assert.equal(GradeRequestSchema.safeParse({ slug: 'a', sizes: [] }).success, false)
  assert.equal(
    GradeRequestSchema.safeParse({ slug: 'a', sizes: new Array(40).fill('M') }).success,
    false,
  )
  assert.equal(GradeRequestSchema.safeParse({ slug: 'a', sizes: ['S', 'M'] }).success, true)
})

check('body measurements are sanity-bounded', () => {
  const good = {
    bust: 96, waist: 78, hip: 102, backLengthToWaist: 42, bodyLength: 60,
    shoulderWidth: 39, armLength: 75, upperArm: 30, neck: 37, wrist: 16,
  }
  assert.equal(BodyMeasurementsSchema.safeParse(good).success, true)
  // A bust typed in millimetres, and one field left out.
  assert.equal(BodyMeasurementsSchema.safeParse({ ...good, bust: 960 }).success, false)
  const { wrist: _wrist, ...missing } = good
  assert.equal(BodyMeasurementsSchema.safeParse(missing).success, false)
})

check('foot measurements are sanity-bounded', () => {
  const good = {
    footLengthCm: 24, footCircumferenceCm: 21, ankleCircumferenceCm: 22,
    calfCircumferenceCm: 34,
  }
  assert.equal(FootMeasurementsSchema.safeParse(good).success, true)
  assert.equal(FootMeasurementsSchema.safeParse({ ...good, footLengthCm: 240 }).success, false)
})

check('yarn weight category comes back as a library literal', () => {
  assert.deepEqual(toShapeOptions({ yarnWeightCategory: 4 }), { yarnWeightCategory: 4 })
  assert.deepEqual(toShapeOptions(undefined), {})
  assert.deepEqual(toShapeOptions({ dominantFabric: 'CABLE' }), { dominantFabric: 'CABLE' })
})

// ── The free / paid line ────────────────────────────────────────────────────

check('a signed-out visitor cannot have a custom fit', () => {
  const decision = decideCustomFit(null)
  assert.equal(decision.allowed, false)
  assert.equal(decision.allowed === false && decision.status, 401)
})

check('a signed-in free maker is shown the gate, not an error', () => {
  const decision = decideCustomFit({ premiumActive: false })
  assert.equal(decision.allowed, false)
  assert.equal(decision.allowed === false && decision.status, 402)
  assert.equal(decision.allowed === false && decision.gate, 'KNITTING_CUSTOM_FIT')
  assert.ok(
    decision.allowed === false && decision.rationale && decision.rationale.length > 20,
    'the gate carries its rationale',
  )
})

check('a premium maker gets the custom fit', () => {
  assert.equal(decideCustomFit({ premiumActive: true }).allowed, true)
})

check('a lapsed entitlement is treated as lapsed', () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const decision = decideCustomFit({ premiumActive: true, premiumUntil: yesterday })
  assert.equal(decision.allowed, false)
  assert.equal(decision.allowed === false && decision.status, 402)
})

check('an admin gets the custom fit without a paid entitlement', () => {
  assert.equal(decideCustomFit({ role: 'ADMIN' }).allowed, true)
})

// ── What a stored row has to say before it grades ───────────────────────────

const GRADABLE_ROW = {
  slug: 'a-raglan-jumper',
  name: 'A raglan jumper',
  projectShape: 'SWEATER',
  constructionDirection: 'TOP_DOWN',
  techniqueDisciplines: [] as string[],
  craftTechniqueTags: [] as string[],
  easePresetSlug: 'POSITIVE_4',
  gaugeInPatternStitch: { stitchesPer10cm: 20, rowsPer10cm: 28 },
  yarnWeightStandard: 'ARAN',
  sizesGraded: null,
}

check('a row with a gauge and a construction grades', () => {
  const spec = deriveGradableSpec(GRADABLE_ROW)
  assert.ok(spec, 'expected a spec')
  assert.equal(spec.kind, 'GARMENT')
  assert.equal(spec.kind === 'GARMENT' && spec.constructionShape, 'TOP_DOWN_RAGLAN')
  assert.equal(spec.kind === 'GARMENT' && spec.easePreset, 'POSITIVE_4')
  assert.deepEqual(spec.kind === 'GARMENT' && spec.sizes, DEFAULT_GARMENT_SIZES)
})

check('a row with no gauge does not grade', () => {
  const spec = deriveGradableSpec({
    ...GRADABLE_ROW,
    gaugeInPatternStitch: null,
    gaugeText: null,
  })
  assert.equal(spec, null)
})

check('a row with no build direction does not grade', () => {
  const spec = deriveGradableSpec({ ...GRADABLE_ROW, constructionDirection: null })
  assert.equal(spec, null)
})

check('a scarf does not grade', () => {
  const spec = deriveGradableSpec({ ...GRADABLE_ROW, projectShape: 'SCARF' })
  assert.equal(spec, null)
})

check('a top-down colourwork sweater grades as a yoke', () => {
  const spec = deriveGradableSpec({
    ...GRADABLE_ROW,
    techniqueDisciplines: ['COLOURWORK'],
  })
  assert.equal(spec?.kind === 'GARMENT' && spec.constructionShape, 'TOP_DOWN_YOKE')
  assert.equal(
    spec?.kind === 'GARMENT' && spec.options.dominantFabric,
    'COLOURWORK_STRANDED',
  )
})

check('a tag naming the construction beats the build direction', () => {
  assert.equal(
    readConstructionShape({
      constructionDirection: 'TOP_DOWN',
      craftTechniqueTags: ['drop-shoulder'],
    }),
    'DROP_SHOULDER',
  )
})

check('a sock row grades through the sock library', () => {
  const spec = deriveGradableSpec({
    ...GRADABLE_ROW,
    projectShape: 'SOCK',
    constructionDirection: 'BOTTOM_UP',
    craftTechniqueTags: ['afterthought heel'],
  })
  assert.equal(spec?.kind, 'SOCK')
  assert.equal(spec?.kind === 'SOCK' && spec.construction, 'TOE_UP')
  assert.equal(spec?.kind === 'SOCK' && spec.heelStyle, 'AFTERTHOUGHT')
})

check('the sizes a pattern names are the sizes it grades', () => {
  const spec = deriveGradableSpec({
    ...GRADABLE_ROW,
    sizesGraded: [{ name: 'S' }, { name: 'M' }, { name: 'not-a-size' }],
  })
  assert.deepEqual(spec?.kind === 'GARMENT' && spec.sizes, ['S', 'M'])
})

check('a written gauge sentence is read', () => {
  assert.deepEqual(parseGaugeText('22 sts x 30 rows = 10 cm in stockinette'), {
    stitchesPer10cm: 22,
    rowsPer10cm: 30,
  })
  assert.deepEqual(parseGaugeText('18 stitches and 24 rounds to 10 cm'), {
    stitchesPer10cm: 18,
    rowsPer10cm: 24,
  })
  assert.equal(parseGaugeText('a soft, loose fabric'), null)
  assert.equal(parseGaugeText(null), null)
})

check('an ease preset is read by name or by label', () => {
  assert.equal(readEasePreset('positive-4'), 'POSITIVE_4')
  assert.equal(readEasePreset('POSITIVE_4'), 'POSITIVE_4')
  assert.equal(readEasePreset('oversized'), 'GENEROUS_10')
  assert.equal(readEasePreset('roomy-ish'), null)
  assert.equal(readEasePreset(null), null)
})

// ── The custom fit itself ───────────────────────────────────────────────────

check('a custom garment grades to the measurements it was given', () => {
  const graded = gradeGarment({
    constructionShape: 'TOP_DOWN_RAGLAN',
    size: 'CUSTOM',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'ZERO',
    garmentType: 'PULLOVER',
    bodyMeasurements: {
      bust: 101, waist: 84, hip: 106, backLengthToWaist: 41, bodyLength: 62,
      shoulderWidth: 40, armLength: 74, upperArm: 32, neck: 38, wrist: 16.5,
    },
  })
  assert.equal(graded.size, 'CUSTOM')
  // Zero ease, so the finished bust is the measured bust.
  assert.ok(
    Math.abs(graded.finishedMeasurements.bust - 101) < 0.6,
    `finished bust ${graded.finishedMeasurements.bust} should track the measured 101`,
  )
  assert.ok(graded.bustStitchCount > 0 && graded.bodyLengthRows > 0)
  assert.ok(graded.assemblyInstructions.steps.length > 0)
})

check('a custom garment is not the same as the nearest standard size', () => {
  const shared = {
    constructionShape: 'TOP_DOWN_RAGLAN' as const,
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'ZERO' as const,
    garmentType: 'PULLOVER' as const,
  }
  const standard = gradeGarment({ ...shared, size: 'M' })
  const custom = gradeGarment({
    ...shared,
    size: 'CUSTOM',
    bodyMeasurements: {
      bust: 101, waist: 84, hip: 106, backLengthToWaist: 41, bodyLength: 62,
      shoulderWidth: 40, armLength: 74, upperArm: 32, neck: 38, wrist: 16.5,
    },
  })
  assert.notEqual(standard.bustStitchCount, custom.bustStitchCount)
})

check('a custom sock grades to the foot it was given', () => {
  const graded = gradeSock({
    construction: 'CUFF_DOWN',
    heelStyle: 'FLAP_AND_GUSSET',
    size: 'CUSTOM',
    gauge: { stitchesPer10cm: 30, rowsPer10cm: 42 },
    footMeasurements: {
      footLengthCm: 25, footCircumferenceCm: 22, ankleCircumferenceCm: 23,
      calfCircumferenceCm: 35, label: 'Your measurements',
    },
  })
  assert.equal(graded.size, 'CUSTOM')
  assert.ok(graded.legStitchCount > 0 && graded.footRows > 0)
  assert.ok(Math.abs(graded.finishedMeasurements.footLengthCm - 25) < 1)
})

check('a custom grade with no measurements is refused by the library', () => {
  assert.throws(
    () =>
      gradeGarment({
        constructionShape: 'TOP_DOWN_RAGLAN',
        size: 'CUSTOM',
        gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
        easePreset: 'ZERO',
        garmentType: 'PULLOVER',
      }),
    /custom size has no chart row/i,
  )
})

// ── Report ──────────────────────────────────────────────────────────────────

let failed = 0
for (const r of results) {
  if (r.passed) {
    console.log(`  ok   ${r.name}`)
  } else {
    failed += 1
    console.log(`  FAIL ${r.name}`)
    console.log(`       ${r.detail}`)
  }
}
console.log(`\n${results.length - failed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
