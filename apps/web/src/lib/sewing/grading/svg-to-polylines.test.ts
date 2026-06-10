// SPDX-License-Identifier: MIT
// Tests for the SVG → polyline sampler. Exercises the path-d parser,
// curve sampling, and the parse-then-convert-to-pieces pipeline against
// a live freesewing render.
//
// Run:
//   pnpm --filter @homemade/web exec tsx src/lib/sewing/grading/svg-to-polylines.test.ts

import assert from 'node:assert/strict'

import {
  parseFreesewingSvg,
  parsedSvgToPieces,
  samplePathD,
} from './svg-to-polylines'
import { draftPattern } from './grader'
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
  neckCircumferenceCm: 36,
}

async function main() {
  process.stdout.write('\nSVG → polyline sampler test suite\n\n')

  // ───────────────────────────────────────────────────────────────────
  // samplePathD — straight-line commands.
  // ───────────────────────────────────────────────────────────────────
  await record('samplePathD: simple M/L line', () => {
    const pts = samplePathD('M 0 0 L 100 0 L 100 100 L 0 100 Z')
    assert.equal(pts.length, 5)
    assert.equal(pts[0]!.x, 0)
    assert.equal(pts[1]!.x, 100)
    assert.equal(pts[3]!.y, 100)
    // Z returns to start.
    assert.equal(pts[4]!.x, 0)
    assert.equal(pts[4]!.y, 0)
  })

  await record('samplePathD: relative l command', () => {
    const pts = samplePathD('M 10 10 l 5 0 l 0 5')
    assert.equal(pts[1]!.x, 15)
    assert.equal(pts[1]!.y, 10)
    assert.equal(pts[2]!.x, 15)
    assert.equal(pts[2]!.y, 15)
  })

  await record('samplePathD: H and V', () => {
    const pts = samplePathD('M 10 10 H 50 V 80')
    assert.equal(pts[1]!.x, 50)
    assert.equal(pts[1]!.y, 10)
    assert.equal(pts[2]!.x, 50)
    assert.equal(pts[2]!.y, 80)
  })

  // ───────────────────────────────────────────────────────────────────
  // samplePathD — curve commands.
  // ───────────────────────────────────────────────────────────────────
  await record('samplePathD: cubic C samples to multiple segments', () => {
    const pts = samplePathD('M 0 0 C 50 0, 50 100, 100 100')
    // 16 samples per curve + 1 start point.
    assert.ok(pts.length >= 16, `expected >= 16 points, got ${pts.length}`)
    assert.equal(pts[0]!.x, 0)
    // Last point should be at the endpoint.
    const last = pts[pts.length - 1]!
    assert.ok(Math.abs(last.x - 100) < 1)
    assert.ok(Math.abs(last.y - 100) < 1)
  })

  await record('samplePathD: quadratic Q samples', () => {
    const pts = samplePathD('M 0 0 Q 50 50 100 0')
    assert.ok(pts.length >= 16)
    const last = pts[pts.length - 1]!
    assert.ok(Math.abs(last.x - 100) < 1)
    assert.ok(Math.abs(last.y) < 1)
  })

  await record('samplePathD: smooth S follows previous cubic reflection', () => {
    const pts = samplePathD('M 0 0 C 25 0, 25 50, 50 50 S 75 50, 100 0')
    assert.ok(pts.length >= 32, `expected >= 32 points, got ${pts.length}`)
  })

  // ───────────────────────────────────────────────────────────────────
  // parseFreesewingSvg — synthetic minimal SVG.
  // ───────────────────────────────────────────────────────────────────
  await record('parseFreesewingSvg: synthetic group extracts one part', () => {
    const svg = '<svg width="200mm" height="200mm"><g id="fs-test.body"><path d="M 0 0 L 100 0 L 100 100 L 0 100 Z"/></g></svg>'
    const parsed = parseFreesewingSvg(svg)
    assert.equal(parsed.parts.length, 1)
    assert.equal(parsed.parts[0]!.name, 'fs-test.body')
    assert.equal(parsed.parts[0]!.paths.length, 1)
  })

  await record('parseFreesewingSvg: synthetic SVG bounds are computed', () => {
    const svg = '<svg><g id="part-a"><path d="M 0 0 L 50 0 L 50 50 L 0 50 Z"/></g></svg>'
    const parsed = parseFreesewingSvg(svg)
    assert.equal(parsed.bounds.minX, 0)
    assert.equal(parsed.bounds.minY, 0)
    assert.equal(parsed.bounds.maxX, 50)
    assert.equal(parsed.bounds.maxY, 50)
    assert.equal(parsed.widthMm, 50)
    assert.equal(parsed.heightMm, 50)
  })

  // ───────────────────────────────────────────────────────────────────
  // parsedSvgToPieces — synthetic.
  // ───────────────────────────────────────────────────────────────────
  await record('parsedSvgToPieces: produces SewingPiece-shaped output', () => {
    const svg = '<svg><g id="part-a"><path d="M 0 0 L 50 0 L 50 50 L 0 50 Z"/></g></svg>'
    const pieces = parsedSvgToPieces(parseFreesewingSvg(svg))
    assert.equal(pieces.length, 1)
    const p = pieces[0]!
    assert.equal(p.name, 'part-a')
    assert.equal(p.cut, 1)
    assert.equal(p.fold, null)
    assert.ok(p.pathPoints.length >= 4)
    assert.ok(typeof p.grainline.from.x === 'number')
  })

  // ───────────────────────────────────────────────────────────────────
  // End-to-end: real freesewing Bella render.
  // ───────────────────────────────────────────────────────────────────
  await record('end-to-end: Bella render parses to multiple parts', async () => {
    const out = await draftPattern({
      designSlug: 'bella',
      measurements: CYC_WOMENS_M,
      calibrationMode: 'BROWSE',
    })
    const parsed = parseFreesewingSvg(out.svg)
    assert.ok(parsed.parts.length >= 1, `expected ≥ 1 part, got ${parsed.parts.length}`)
    const pieces = parsedSvgToPieces(parsed)
    assert.ok(pieces.length >= 1, `expected ≥ 1 piece, got ${pieces.length}`)
    // Bounding box should be plausible (≥ 100mm in either axis).
    assert.ok(parsed.widthMm >= 100, `width too small: ${parsed.widthMm}mm`)
    assert.ok(parsed.heightMm >= 100, `height too small: ${parsed.heightMm}mm`)
  })

  await record('end-to-end: Bella pieces all carry pathPoints with finite coords', async () => {
    const out = await draftPattern({
      designSlug: 'bella',
      measurements: CYC_WOMENS_M,
      calibrationMode: 'BROWSE',
    })
    const pieces = parsedSvgToPieces(parseFreesewingSvg(out.svg))
    for (const p of pieces) {
      for (const pt of p.pathPoints) {
        assert.ok(Number.isFinite(pt.x), `non-finite x in piece ${p.name}`)
        assert.ok(Number.isFinite(pt.y), `non-finite y in piece ${p.name}`)
      }
    }
  })

  // ───────────────────────────────────────────────────────────────────
  // Summary.
  // ───────────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.passed)
  process.stdout.write(
    `\n${results.length - failed.length}/${results.length} passed\n`,
  )
  if (failed.length) process.exit(1)
}

main().catch((err) => {
  process.stderr.write(`\nUnexpected error in test runner:\n${err.stack ?? err.message}\n`)
  process.exit(2)
})
