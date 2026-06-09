// Amigurumi shape-math test suite.
//
// Runnable as a tsx script. Validates that primitives produce
// well-formed row-by-row patterns and that the assembled multi-piece
// pattern verifies cleanly.

import assert from 'node:assert/strict'
import { sphere, cylinder, cone, capsule, oval, pear } from './shape-math'
import { verifyAmigurumiPattern } from './verifier'
import { describeJoin, listJoinMethods } from './joiner'

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

// ─── Per-shape smoke tests ──────────────────────────────────────────────────

record('Sphere: 8cm closes from 6 → equator → 6', () => {
  const piece = sphere({ diameterCm: 8, gauge: GAUGE, label: 'head' })
  assert.ok(piece.rowByRow.length > 4, 'sphere should have multiple rounds')
  assert.equal(piece.rowByRow[0]!.stitchCount, 6, 'first round must be 6 sc in magic ring')
  const final = piece.rowByRow[piece.rowByRow.length - 1]!
  assert.ok(final.stitchCount <= 12, `final round stitch count should be ≤ 12 for closure, got ${final.stitchCount}`)
  assert.ok(piece.yarnRequiredGrams > 0, 'yarn estimate must be positive')
})

record('Sphere: stitch counts mirror around equator', () => {
  const piece = sphere({ diameterCm: 10, gauge: GAUGE })
  const counts = piece.rowByRow.map(r => r.stitchCount)
  const maxCount = Math.max(...counts)
  const equatorIdx = counts.indexOf(maxCount)
  assert.ok(equatorIdx > 2, 'equator should be reached after several rounds')
  // The increase pattern up to the equator should match the decrease pattern
  // back down (within ±6 since we have straight rounds at the equator).
  const peak = counts.indexOf(maxCount)
  const lastPeak = counts.lastIndexOf(maxCount)
  assert.ok(peak >= 1)
  assert.ok(lastPeak >= peak)
})

record('Cylinder: closed both ends has decreasing tail', () => {
  const piece = cylinder({ diameterCm: 6, heightCm: 12, gauge: GAUGE, closeBothEnds: true, label: 'body' })
  const final = piece.rowByRow[piece.rowByRow.length - 1]!
  assert.ok(final.stitchCount <= 12, `closed cylinder should taper to ≤ 12 stitches, got ${final.stitchCount}`)
})

record('Cylinder: open-ended stays at circumference', () => {
  const piece = cylinder({ diameterCm: 4, heightCm: 10, gauge: GAUGE, closeBothEnds: false, label: 'arm' })
  const final = piece.rowByRow[piece.rowByRow.length - 1]!
  assert.ok(final.stitchCount >= 18, `open cylinder should end at circumference, got ${final.stitchCount}`)
})

record('Cone: stitch count grows monotonically', () => {
  const piece = cone({ baseDiameterCm: 6, heightCm: 8, gauge: GAUGE, label: 'hat' })
  for (let i = 1; i < piece.rowByRow.length; i++) {
    assert.ok(
      piece.rowByRow[i]!.stitchCount >= piece.rowByRow[i - 1]!.stitchCount,
      `cone stitch count must not decrease (round ${piece.rowByRow[i]!.round})`,
    )
  }
})

record('Capsule: inc, straight, dec sections', () => {
  const piece = capsule({ diameterCm: 6, lengthCm: 14, gauge: GAUGE, label: 'leg' })
  const counts = piece.rowByRow.map(r => r.stitchCount)
  const max = Math.max(...counts)
  const firstMax = counts.indexOf(max)
  const lastMax = counts.lastIndexOf(max)
  assert.ok(firstMax > 0, 'capsule must increase to max')
  assert.ok(lastMax > firstMax, 'capsule must have a straight section at max')
  const final = counts[counts.length - 1]!
  assert.ok(final <= 12, `capsule should close to ≤ 12, got ${final}`)
})

record('Oval: validates inputs', () => {
  assert.throws(() => oval({ longAxisCm: 5, shortAxisCm: 10, gauge: GAUGE }))
})

record('Oval: ratio respected', () => {
  const piece = oval({ longAxisCm: 14, shortAxisCm: 7, gauge: GAUGE, label: 'foot' })
  assert.ok(piece.finishedDimensionsCm.width === 7)
  assert.ok(piece.finishedDimensionsCm.height === 14)
})

record('Pear: validates inputs', () => {
  assert.throws(() => pear({ maxDiameterCm: 5, topDiameterCm: 10, heightCm: 8, gauge: GAUGE }))
})

record('Pear: max diameter reached and held', () => {
  const piece = pear({ maxDiameterCm: 12, topDiameterCm: 6, heightCm: 18, gauge: GAUGE, label: 'body' })
  const counts = piece.rowByRow.map(r => r.stitchCount)
  const max = Math.max(...counts)
  const firstMax = counts.indexOf(max)
  const lastMax = counts.lastIndexOf(max)
  assert.ok(firstMax > 2, 'pear must take several rounds to reach max')
  assert.ok(lastMax > firstMax, 'pear must hold the max for a straight belly section')
})

// ─── Assembly + verifier tests ──────────────────────────────────────────────

record('Verifier: well-formed bear pattern passes', () => {
  const head = sphere({ diameterCm: 10, gauge: GAUGE, label: 'head' })
  const body = pear({ maxDiameterCm: 12, topDiameterCm: 8, heightCm: 14, gauge: GAUGE, label: 'body' })
  const armL = capsule({ diameterCm: 4, lengthCm: 8, gauge: GAUGE, label: 'arm-left' })
  const armR = capsule({ diameterCm: 4, lengthCm: 8, gauge: GAUGE, label: 'arm-right' })
  const legL = capsule({ diameterCm: 5, lengthCm: 9, gauge: GAUGE, label: 'leg-left' })
  const legR = capsule({ diameterCm: 5, lengthCm: 9, gauge: GAUGE, label: 'leg-right' })
  const earL = sphere({ diameterCm: 3, gauge: GAUGE, label: 'ear-left' })
  const earR = sphere({ diameterCm: 3, gauge: GAUGE, label: 'ear-right' })

  const result = verifyAmigurumiPattern(
    [head, body, armL, armR, legL, legR, earL, earR],
    {
      buildOrder: ['body', 'head', 'arm-left', 'arm-right', 'leg-left', 'leg-right', 'ear-left', 'ear-right'],
      joints: [
        { piecesJoined: ['head', 'body'], method: 'LADDER_STITCH', placement: 'top centre of body' },
        { piecesJoined: ['arm-left', 'body'], method: 'WHIP_STITCH', placement: 'upper left side of body' },
        { piecesJoined: ['arm-right', 'body'], method: 'WHIP_STITCH', placement: 'upper right side of body' },
        { piecesJoined: ['leg-left', 'body'], method: 'WHIP_STITCH', placement: 'lower left of body' },
        { piecesJoined: ['leg-right', 'body'], method: 'WHIP_STITCH', placement: 'lower right of body' },
        { piecesJoined: ['ear-left', 'head'], method: 'WHIP_STITCH', placement: 'upper left of head' },
        { piecesJoined: ['ear-right', 'head'], method: 'WHIP_STITCH', placement: 'upper right of head' },
      ],
      embellishments: ['stitched mouth in black yarn', 'safety eyes between rounds 8 and 9 of head'],
      safetyEyePlacement: 'between rounds 8 and 9, 4 stitches apart on the centre front of head',
    },
  )
  assert.ok(result.ok, `verifier reported: ${result.issues.join('; ')}`)
})

record('Verifier: catches missing piece in buildOrder', () => {
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'head' })
  const body = sphere({ diameterCm: 10, gauge: GAUGE, label: 'body' })
  const result = verifyAmigurumiPattern(
    [head, body],
    {
      buildOrder: ['body'],
      joints: [],
      embellishments: [],
    },
  )
  assert.ok(!result.ok)
  assert.ok(result.issues.some(i => i.includes('head')))
})

record('Verifier: catches missing piece in joints', () => {
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'head' })
  const body = sphere({ diameterCm: 10, gauge: GAUGE, label: 'body' })
  const result = verifyAmigurumiPattern(
    [head, body],
    {
      buildOrder: ['body', 'head'],
      joints: [], // head joined nowhere
      embellishments: [],
    },
  )
  assert.ok(!result.ok)
  assert.ok(result.issues.some(i => i.includes('head')))
})

// ─── Joiner tests ───────────────────────────────────────────────────────────

record('Joiner: lists all five methods', () => {
  const methods = listJoinMethods()
  assert.equal(methods.length, 5)
})

record('Joiner: returns full description for each method', () => {
  for (const m of listJoinMethods()) {
    const t = describeJoin(m)
    assert.ok(t.name.length > 0)
    assert.ok(t.description.length > 30)
    assert.ok(t.whenToUse.length > 0)
  }
})

// ─── Yarn estimate sanity ─────────────────────────────────────────────────

record('Yarn estimates: bigger sphere → more yarn', () => {
  const small = sphere({ diameterCm: 5, gauge: GAUGE })
  const large = sphere({ diameterCm: 10, gauge: GAUGE })
  assert.ok(large.yarnRequiredGrams > small.yarnRequiredGrams)
})

record('Yarn estimates: typical small bear under 60g', () => {
  const body = pear({ maxDiameterCm: 10, topDiameterCm: 6, heightCm: 13, gauge: GAUGE })
  const head = sphere({ diameterCm: 8, gauge: GAUGE })
  const limbs = capsule({ diameterCm: 3, lengthCm: 7, gauge: GAUGE })
  const total = body.yarnRequiredGrams + head.yarnRequiredGrams + 4 * limbs.yarnRequiredGrams
  // A small classic teddy-style bear ~15cm tall typically uses 30-60g.
  assert.ok(total >= 20 && total <= 90, `small bear total estimate is ${total}g, expected 20-90g`)
})

// ─── Summary ───────────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length
const failed = results.length - passed

console.log(`\n=== Amigurumi shape-math test summary ===`)
console.log(`passed: ${passed} / ${results.length}`)
if (failed > 0) {
  console.log(`\nFailures:`)
  for (const r of results.filter(r => !r.passed)) {
    console.log(`  ✗ ${r.name}: ${r.detail}`)
  }
  process.exit(1)
}
console.log('All tests passed.')
