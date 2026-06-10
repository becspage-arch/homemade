// SPDX-License-Identifier: MIT
// Sewing grading wrapper test suite.
//
// Runnable via:
//   pnpm --filter @homemade/web exec tsx src/lib/sewing/grading/grader.test.ts
//
// Tests:
//   * Bella drafts on CYC Women's M body block — back + front emitted,
//     dimensions within 5% of chest.
//   * Brian drafts on CYC Men's M body block — same.
//   * Aaron drafts on CYC Women's M T-shirt with three option configs.
//   * Cache key is deterministic (same input → same hash).
//   * Cache key changes with options / measurements / mode.
//   * Measurement translation round-trips the full Homemade vocabulary
//     into freesewing keys and applies CYC defaults for gaps.
//   * Footer credit voice rules — hidden on PROJECTOR mode.

import assert from 'node:assert/strict'

import {
  draftPattern,
  computeCacheKey,
  FREESEWING_VERSION,
} from './grader'
import { verifyDrafterOutput } from './verifier'
import { homemadeToFreesewing } from './measurement-translation'
import { getDrafterFooterCredit, FOOTER_CREDIT_TEXT } from './attribution'
import { SEWING_DESIGN_REGISTRY } from './design-registry'
import type { MeasurementsPayload } from '../measurements'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function record(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      results.push({ name, passed: true })
      process.stdout.write(`  ok  ${name}\n`)
    })
    .catch((err: Error) => {
      results.push({ name, passed: false, detail: err.message })
      process.stdout.write(`  FAIL ${name}\n         ${err.message}\n`)
    })
}

// CYC Women's M measurements (per the freesewing cisFemaleAdult38 model,
// rounded to whole cm where the user-facing form would have them).
const CYC_WOMENS_M: MeasurementsPayload = {
  bustChestCm: 92,
  waistCm: 74,
  hipCm: 100,
  bodyHeightCm: 168,
  inseamCm: 78,
  bustPointCm: 18,
  backWaistLengthCm: 41,
  frontWaistLengthCm: 42,
  shoulderWidthCm: 41,
  armLengthCm: 60,
  wristCircumferenceCm: 16,
  thighCircumferenceCm: 56,
  calfCircumferenceCm: 38,
  ankleCircumferenceCm: 24,
  neckCircumferenceCm: 36,
}

// CYC Men's M per cisMaleAdult40.
const CYC_MENS_M: MeasurementsPayload = {
  bustChestCm: 100,
  waistCm: 87,
  hipCm: 99,
  bodyHeightCm: 178,
  inseamCm: 80,
  shoulderWidthCm: 45,
  armLengthCm: 66,
  wristCircumferenceCm: 17,
  neckCircumferenceCm: 38,
  thighCircumferenceCm: 59,
  calfCircumferenceCm: 41,
  ankleCircumferenceCm: 24,
}

async function main() {
  process.stdout.write(
    `\nfreesewing wrapper test suite — engine version ${FREESEWING_VERSION}\n\n`,
  )

  // ───────────────────────────────────────────────────────────────────
  // Measurement translation.
  // ───────────────────────────────────────────────────────────────────
  await record('measurement-translation: cm → mm scaling', () => {
    const r = homemadeToFreesewing(CYC_WOMENS_M, {
      genderFamily: 'WOMENS',
      requiredMeasurements: ['chest', 'waist', 'hips'],
    })
    assert.equal(r.measurements.chest, 920)
    assert.equal(r.measurements.waist, 740)
    assert.equal(r.measurements.hips, 1000)
  })

  await record('measurement-translation: missing required key falls back to CYC womens default', () => {
    const empty: MeasurementsPayload = {}
    const r = homemadeToFreesewing(empty, {
      genderFamily: 'WOMENS',
      requiredMeasurements: ['chest', 'neck', 'shoulderSlope'],
    })
    assert.equal(r.measurements.chest, 925)
    assert.equal(r.measurements.neck, 340)
    assert.equal(r.measurements.shoulderSlope, 13)
    assert.ok(r.fallbacksUsed.includes('chest'))
  })

  await record('measurement-translation: mens fallback column', () => {
    const empty: MeasurementsPayload = {}
    const r = homemadeToFreesewing(empty, {
      genderFamily: 'MENS',
      requiredMeasurements: ['chest', 'neck'],
    })
    assert.equal(r.measurements.chest, 1000)
    assert.equal(r.measurements.neck, 380)
  })

  await record('measurement-translation: bodyHeightCm is reported as unmapped', () => {
    const r = homemadeToFreesewing({ bodyHeightCm: 170 }, {
      genderFamily: 'WOMENS',
      requiredMeasurements: [],
    })
    assert.ok(r.unmappedHomemadeKeys.includes('bodyHeightCm'))
  })

  // ───────────────────────────────────────────────────────────────────
  // Attribution + voice rules.
  // ───────────────────────────────────────────────────────────────────
  await record('attribution: footer credit hidden on PROJECTOR', () => {
    assert.equal(getDrafterFooterCredit('bella', 'PROJECTOR'), '')
  })
  await record('attribution: footer credit set on PRINT', () => {
    assert.equal(getDrafterFooterCredit('bella', 'PRINT'), FOOTER_CREDIT_TEXT)
  })
  await record('attribution: footer credit set on BROWSE', () => {
    assert.equal(getDrafterFooterCredit('bella', 'BROWSE'), FOOTER_CREDIT_TEXT)
  })
  await record('attribution: voice — no em / en dashes, no marketing words', () => {
    const txt = FOOTER_CREDIT_TEXT
    assert.ok(!txt.includes('—'), `em dash present: ${txt}`)
    assert.ok(!txt.includes('–'), `en dash present: ${txt}`)
    assert.ok(!/perfect for/i.test(txt), 'marketing phrase present')
    assert.ok(!/\bmash\b/i.test(txt), 'forbidden term present')
  })

  // ───────────────────────────────────────────────────────────────────
  // Cache key determinism.
  // ───────────────────────────────────────────────────────────────────
  await record('cache-key: deterministic for identical inputs', () => {
    const a = computeCacheKey({
      designSlug: 'bella',
      measurements: { chest: 920, waist: 740 },
      options: { chestEase: 8 },
      calibrationMode: 'PRINT',
      freesewingVersion: '4.9.0',
    })
    const b = computeCacheKey({
      designSlug: 'bella',
      measurements: { waist: 740, chest: 920 },     // different order
      options: { chestEase: 8 },
      calibrationMode: 'PRINT',
      freesewingVersion: '4.9.0',
    })
    assert.equal(a, b)
  })
  await record('cache-key: changes with calibration mode', () => {
    const print = computeCacheKey({
      designSlug: 'bella',
      measurements: { chest: 920 },
      options: {},
      calibrationMode: 'PRINT',
      freesewingVersion: '4.9.0',
    })
    const projector = computeCacheKey({
      designSlug: 'bella',
      measurements: { chest: 920 },
      options: {},
      calibrationMode: 'PROJECTOR',
      freesewingVersion: '4.9.0',
    })
    assert.notEqual(print, projector)
  })
  await record('cache-key: changes with freesewing version', () => {
    const oldV = computeCacheKey({
      designSlug: 'bella',
      measurements: { chest: 920 },
      options: {},
      calibrationMode: 'PRINT',
      freesewingVersion: '4.8.0',
    })
    const newV = computeCacheKey({
      designSlug: 'bella',
      measurements: { chest: 920 },
      options: {},
      calibrationMode: 'PRINT',
      freesewingVersion: '4.9.0',
    })
    assert.notEqual(oldV, newV)
  })

  // ───────────────────────────────────────────────────────────────────
  // Design registry.
  // ───────────────────────────────────────────────────────────────────
  await record('registry: bella + brian + aaron all registered', () => {
    assert.ok(SEWING_DESIGN_REGISTRY.bella)
    assert.ok(SEWING_DESIGN_REGISTRY.brian)
    assert.ok(SEWING_DESIGN_REGISTRY.aaron)
  })

  // ───────────────────────────────────────────────────────────────────
  // End-to-end drafts. These exercise the real freesewing engine.
  // ───────────────────────────────────────────────────────────────────
  await record('bella: drafts on CYC Womens M without throwing', async () => {
    const out = await draftPattern({
      designSlug: 'bella',
      measurements: CYC_WOMENS_M,
      calibrationMode: 'BROWSE',
    })
    assert.ok(out.svg.length > 1000, `SVG too short: ${out.svg.length} bytes`)
    assert.ok(out.cacheKey.length === 64, 'cacheKey is not a SHA-256 hex')
    assert.ok(out.attribution.includes('freesewing'))
    assert.ok(out.partList.length > 0, 'no drafted parts')
  })

  await record('bella: verifier passes within 5% tolerance', async () => {
    const out = await draftPattern({
      designSlug: 'bella',
      measurements: CYC_WOMENS_M,
      calibrationMode: 'BROWSE',
    })
    const v = verifyDrafterOutput(out, {
      expectedMeasurementsMm: { chest: 920 },
      tolerance: 0.05,
    })
    assert.ok(v.ok, `verifier issues:\n${v.issues.join('\n')}`)
  })

  await record('brian: drafts on CYC Mens M without throwing', async () => {
    const out = await draftPattern({
      designSlug: 'brian',
      measurements: CYC_MENS_M,
      calibrationMode: 'BROWSE',
    })
    assert.ok(out.svg.length > 1000)
    assert.ok(out.partList.length > 0)
  })

  await record('brian: verifier passes within 5% tolerance', async () => {
    const out = await draftPattern({
      designSlug: 'brian',
      measurements: CYC_MENS_M,
      calibrationMode: 'BROWSE',
    })
    const v = verifyDrafterOutput(out, {
      expectedMeasurementsMm: { chest: 1000 },
      tolerance: 0.05,
    })
    assert.ok(v.ok, `verifier issues:\n${v.issues.join('\n')}`)
  })

  await record('aaron: drafts on default options', async () => {
    const out = await draftPattern({
      designSlug: 'aaron',
      measurements: CYC_WOMENS_M,
      calibrationMode: 'BROWSE',
    })
    assert.ok(out.svg.length > 1000)
    assert.ok(out.partList.length > 0)
  })

  await record('aaron: draft with chestEase override changes cache key', async () => {
    const a = await draftPattern({
      designSlug: 'aaron',
      measurements: CYC_WOMENS_M,
      options: { designOptions: { chestEase: 0.05 } },
      calibrationMode: 'BROWSE',
    })
    const b = await draftPattern({
      designSlug: 'aaron',
      measurements: CYC_WOMENS_M,
      options: { designOptions: { chestEase: 0.18 } },
      calibrationMode: 'BROWSE',
    })
    assert.notEqual(a.cacheKey, b.cacheKey)
  })

  await record('aaron: PROJECTOR mode hides footer credit', async () => {
    const out = await draftPattern({
      designSlug: 'aaron',
      measurements: CYC_WOMENS_M,
      calibrationMode: 'PROJECTOR',
    })
    assert.equal(out.attribution, '')
  })

  await record('cross-design: same measurements + slug + mode → same cache key', async () => {
    const a = await draftPattern({
      designSlug: 'bella',
      measurements: CYC_WOMENS_M,
      calibrationMode: 'BROWSE',
    })
    const b = await draftPattern({
      designSlug: 'bella',
      measurements: CYC_WOMENS_M,
      calibrationMode: 'BROWSE',
    })
    assert.equal(a.cacheKey, b.cacheKey)
  })

  await record('unknown slug throws', async () => {
    let threw = false
    try {
      await draftPattern({
        designSlug: 'nonexistent',
        measurements: CYC_WOMENS_M,
      })
    } catch {
      threw = true
    }
    assert.ok(threw, 'expected throw on unknown slug')
  })

  // ───────────────────────────────────────────────────────────────────
  // Summary.
  // ───────────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.passed)
  process.stdout.write(
    `\n${results.length - failed.length}/${results.length} passed\n`,
  )
  if (failed.length) {
    process.exit(1)
  }
}

main().catch((err) => {
  process.stderr.write(`\nUnexpected error in test runner:\n${err.stack ?? err.message}\n`)
  process.exit(2)
})
