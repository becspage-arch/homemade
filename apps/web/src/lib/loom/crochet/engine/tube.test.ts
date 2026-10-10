/**
 * TUBE SHAPING, tested (STITCH_ENGINE.md §8h): the builder's invariants, the
 * numeric audit at fine / worsted / bulky on every construction option, the
 * written rounds and the chart from the same program.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && npx tsx src/lib/loom/crochet/engine/tube.test.ts
 *
 * The proofs the handbook names are the full-size hat / cowl / basket; these
 * are their small siblings so the whole file runs in under two minutes.
 */

import assert from 'node:assert/strict'
import { buildTube, tubeRibRounds, tubeRidgeLoop, tubeRidgeRounds, tubeRoundStitch, tubeSettledSizeMm, validateTubeSpec, type TubeSpec } from './tube'
import { compileRelaxAudit } from './programScene'
import { programFromChart, programToChart, tubeSpecOf, writeInstructions, type CrochetProgram } from './program'

const failures: string[] = []
function check(name: string, fn: () => void): void {
  try {
    fn()
    console.log(`  ok  ${name}`)
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`)
    console.log(`FAIL  ${name}`)
  }
}

const WEIGHTS = [1.5, 2.4, 3.2]

const hat: CrochetProgram = {
  name: 'test-hat',
  form: 'tube',
  stitch: 'hdc',
  rounds: [6, 12, 18, 24, 24, 24, 24, 24, 24],
  tube: { anchor: 'ring', join: 'spiral', cap: 'dome', brim: { kind: 'rib', rounds: 2 } },
}
const foldHat: CrochetProgram = {
  name: 'test-fold-hat',
  form: 'tube',
  stitch: 'sc',
  rounds: [6, 12, 18, 24, 24, 24, 24, 24, 24, 24],
  tube: { anchor: 'ring', join: 'spiral', cap: 'dome', brim: { kind: 'fold', rounds: 3 } },
}
const cowl: CrochetProgram = {
  name: 'test-cowl',
  form: 'tube',
  stitch: 'dc',
  rounds: [24, 24, 24, 24, 24],
  tube: { anchor: 'chain', join: 'joined' },
  palette: { a: '#aaaaaa', b: '#bbbbbb' },
  roundColours: ['a', 'a', 'b', 'b', 'a'],
}
const basket: CrochetProgram = {
  name: 'test-basket',
  form: 'tube',
  stitch: 'sc',
  rounds: [6, 12, 18, 24, 30, 30, 30, 30, 30],
  tube: { anchor: 'ring', join: 'spiral', cap: 'flat', openEnd: 'top' },
}
/** A NIGHTCAP: a tip-first cone (+2 a round) with a folded RIDGE brim (sc flo). */
const nightcap: CrochetProgram = {
  name: 'test-nightcap',
  form: 'tube',
  stitch: 'sc',
  rounds: [6, 6, 8, 10, 12, 14, 16, 18, 20, 20, 20, 20, 20],
  tube: { anchor: 'ring', join: 'spiral', cap: 'cone', brim: { kind: 'ridge', rounds: 3, fold: true } },
}
/** A beanie band: an unfolded ridge brim (sc blo). */
const ridgeHat: CrochetProgram = {
  name: 'test-ridge-hat',
  form: 'tube',
  stitch: 'sc',
  rounds: [6, 12, 18, 24, 24, 24, 24, 24, 24],
  tube: { anchor: 'ring', join: 'spiral', cap: 'dome', brim: { kind: 'ridge', rounds: 3 } },
}
/** An hdc beanie with an sc-blo band (mixed-stitch rounds). */
const beanie: CrochetProgram = {
  name: 'test-beanie',
  form: 'tube',
  stitch: 'hdc',
  rounds: [8, 16, 24, 24, 24, 24, 24, 24],
  tube: { anchor: 'ring', join: 'spiral', cap: 'dome', brim: { kind: 'ridge', rounds: 3 } },
}
/** Rise, hold, FALL: a sock-toe / pouffe shape that narrows again but stays open. */
const taper: CrochetProgram = {
  name: 'test-taper',
  form: 'tube',
  stitch: 'sc',
  rounds: [6, 12, 18, 24, 24, 24, 18, 14, 12],
  tube: { anchor: 'ring', join: 'joined' },
}

console.log('builder invariants')
check('a magic-ring tube pins only the ring and records a link per stitch', () => {
  const built = buildTube(tubeSpecOf(hat), 2.4)
  assert.equal(built.anchorPins, 18)
  assert.equal(built.frame, 'surface')
  assert.equal(built.links.length, hat.rounds!.reduce((a, b) => a + b, 0))
  assert.equal(built.model.meridian?.length, built.model.nodes.length)
  assert.equal(built.model.round, undefined, 'a tube carries no round index: no stuffing')
  const pinned = built.model.nodes.filter((n) => n.w === 0).length
  assert.equal(pinned, 18)
  assert.ok(built.nodeRow && built.nodeRow.length === built.model.nodes.length)
  assert.equal(Math.max(...built.nodeRow!), hat.rounds!.length - 1)
})
check('a chain-ring tube pins three nodes a chain and adds a slip stitch a round', () => {
  const built = buildTube(tubeSpecOf(cowl), 2.4)
  assert.equal(built.anchorPins, 3 * 24)
  const hooks = built.links.filter((l) => l.role === 'hook').length
  const through = built.links.filter((l) => l.role === 'through').length
  // 5 rounds × 24 dc hooks + 4 joining sl sts; every dc also rings one collar.
  assert.equal(hooks, 5 * 24 + 4)
  assert.equal(through, 5 * 24)
})
check('rib rounds are the last N, and must be even and unshaped', () => {
  assert.deepEqual([...tubeRibRounds(tubeSpecOf(hat))], [7, 8])
  assert.throws(() => validateTubeSpec({ ...tubeSpecOf(hat), rounds: [6, 12, 18, 23, 23] }), /even/)
  assert.throws(() => validateTubeSpec({ ...tubeSpecOf(hat), rounds: [6, 12, 18, 24, 30] }), /cannot shape/)
  assert.throws(() => validateTubeSpec({ ...tubeSpecOf(hat), stitch: 'tr' } as TubeSpec), /sc, hdc or dc/)
  assert.throws(() => validateTubeSpec({ ...tubeSpecOf(hat), rounds: [6, 14] }), /doubles/)
})

console.log('\naudit at fine, worsted and bulky')
for (const p of [hat, foldHat, cowl, basket, taper, nightcap, ridgeHat, beanie]) {
  for (const yr of WEIGHTS) {
    check(`${p.name} yr ${yr}`, () => {
      const { built, problems } = compileRelaxAudit(p, yr)
      assert.deepEqual(problems, [], problems.join(' | '))
      const size = tubeSettledSizeMm(built)
      assert.ok(size.height > yr * 4, 'it stands')
    })
  }
}

console.log('\nthe open end stays open, the rib stands, the fold is a second layer')
check('the last round of a basket is as wide as its count says (no gathered pole)', () => {
  const { built } = compileRelaxAudit(basket, 2.4)
  const last = basket.rounds!.length - 1
  const nodes = built.model.nodes
  const rim = nodes.filter((_, i) => built.nodeRow![i] === last).map((n) => Math.hypot(n.x, n.y))
  const meanR = rim.reduce((a, b) => a + b, 0) / rim.length
  const nominal = (30 * 2.7 * 2.4) / (2 * Math.PI)
  assert.ok(Math.abs(meanR - nominal) / nominal < 0.15, `rim radius ${meanR.toFixed(1)} vs nominal ${nominal.toFixed(1)}`)
})
check('front posts stand proud and back posts sink on a rib round', () => {
  const { built } = compileRelaxAudit(hat, 2.4)
  const k = hat.rounds!.length - 1
  const nodes = built.model.nodes
  const rings = built.links.filter((l) => l.j === k && l.role === 'ring')
  assert.equal(rings.length, 24)
  const roundR = nodes.filter((_, i) => built.nodeRow![i] === k).map((n) => Math.hypot(n.x, n.y))
  const meanR = roundR.reduce((a, b) => a + b, 0) / roundR.length
  const off = (parity: number): number => {
    const v = rings.filter((l) => l.c % 2 === parity).map((l) => Math.hypot(nodes[l.hook + 3]!.x, nodes[l.hook + 3]!.y) - meanR)
    return v.reduce((a, b) => a + b, 0) / v.length / 2.4
  }
  const fp = off(0)
  const bp = off(1)
  assert.ok(fp > 0.3, `fp post mid ${fp.toFixed(2)}yr should stand proud`)
  assert.ok(fp - bp > 0.8, `rib relief ${(fp - bp).toFixed(2)}yr`)
})
check('a folded brim settles outside the body wall', () => {
  const { built } = compileRelaxAudit(foldHat, 2.4)
  const nodes = built.model.nodes
  const rOf = (k: number): number => {
    const v = nodes.filter((_, i) => built.nodeRow![i] === k).map((n) => Math.hypot(n.x, n.y))
    return v.reduce((a, b) => a + b, 0) / v.length
  }
  const body = rOf(6)
  const brim = rOf(9)
  assert.ok(brim - body > 2.4 * 1.5, `brim ${brim.toFixed(1)} vs body ${body.toFixed(1)}`)
})

console.log('\na cone is a cone, a ridge brim hooks one loop and folds out')
check('a cone cap descends every round (no dome): round heights fall monotonically from the tip', () => {
  const { built } = compileRelaxAudit(nightcap, 2.4)
  const nodes = built.model.nodes
  const zOf = (k: number): number => {
    const v = nodes.filter((_, i) => built.nodeRow![i] === k).map((n) => n.z)
    return v.reduce((a, b) => a + b, 0) / v.length
  }
  for (let k = 1; k < 9; k++) assert.ok(zOf(k) < zOf(k - 1) - 2.4 * 1.2, `round ${k + 1} drops below round ${k} (${zOf(k).toFixed(1)} vs ${zOf(k - 1).toFixed(1)})`)
  // A straight-sided cone: the drop a round is the same within 15% once past the tip.
  const drops = [3, 4, 5, 6, 7].map((k) => zOf(k - 1) - zOf(k))
  const mean = drops.reduce((a, b) => a + b, 0) / drops.length
  for (const d of drops) assert.ok(Math.abs(d - mean) / mean < 0.15, `cone drop ${d.toFixed(2)} vs mean ${mean.toFixed(2)}`)
})
check('ridge rounds are sc in one loop: a hook a stitch, no post rings, the loop chosen by the fold', () => {
  const spec = tubeSpecOf(nightcap)
  assert.deepEqual([...tubeRidgeRounds(spec)], [10, 11, 12])
  assert.equal(tubeRidgeLoop(spec), 'front')
  assert.equal(tubeRoundStitch(spec, 11), 'scflo')
  assert.equal(tubeRoundStitch(spec, 5), 'sc')
  assert.equal(tubeRidgeLoop(tubeSpecOf(ridgeHat)), 'back')
  assert.equal(tubeRoundStitch(tubeSpecOf(ridgeHat), 8), 'scblo')
  const built = buildTube(spec, 2.4)
  const k = 11
  assert.equal(built.links.filter((l) => l.j === k && l.role === 'hook').length, 20)
  assert.equal(built.links.filter((l) => l.j === k && l.role === 'ring').length, 0)
  validateTubeSpec({ ...spec, stitch: 'hdc' }) // an hdc body may carry an sc ridge band
  assert.throws(() => validateTubeSpec({ ...spec, rounds: [6, 6, 8, 10, 12, 14, 16, 18, 20, 20, 20, 20, 22] }), /cannot shape/)
})
check('a folded ridge brim settles outside the body wall', () => {
  const { built } = compileRelaxAudit(nightcap, 2.4)
  const nodes = built.model.nodes
  const rOf = (k: number): number => {
    const v = nodes.filter((_, i) => built.nodeRow![i] === k).map((n) => Math.hypot(n.x, n.y))
    return v.reduce((a, b) => a + b, 0) / v.length
  }
  assert.ok(rOf(12) - rOf(9) > 2.4 * 1.5, `brim ${rOf(12).toFixed(1)} vs body ${rOf(9).toFixed(1)}`)
})

console.log('\nwords and chart from the same program')
check('a spiral hat writes its ring, its rib and an open end', () => {
  const lines = writeInstructions(hat)
  assert.equal(lines[0], 'Round 1: 6 htr into a magic ring. (6 sts)')
  assert.equal(lines[1], 'Round 2: 2 htr in each st around. (12 sts)')
  assert.equal(lines[7], 'Round 8: [FPtr around next st, BPtr around next st] 12 times. (24 sts)')
  assert.ok(lines.some((l) => l.startsWith('Work in a continuous spiral')))
  assert.equal(lines[lines.length - 1], 'Fasten off and weave in the end.')
  assert.ok(!lines.some((l) => /Stuff|draw the opening closed/.test(l)))
})
check('a joined chain-ring cowl writes its foundation ring, chain-ups, joins and colour changes', () => {
  const lines = writeInstructions(cowl)
  assert.equal(lines[0], 'Foundation: ch 24, join with a sl st into a ring, taking care not to twist. (24 sts)')
  assert.equal(lines[1], 'Round 1: ch 3, tr in each ch around, join with a sl st to the first st. (24 sts)')
  assert.equal(lines[2], 'Round 2: ch 3, tr in each st around, join with a sl st to the first st. (24 sts)')
  assert.equal(lines[3], 'Change to the b yarn.')
  assert.ok(!lines.some((l) => l.startsWith('Work in a continuous spiral')))
})
check('a folded brim ends with the fold', () => {
  const lines = writeInstructions(foldHat)
  assert.equal(lines[lines.length - 1], 'Fold the last 3 rounds up to the outside to form the brim.')
})
check('a nightcap writes its cone, its front-loop brim rounds, the ridge note and the fold', () => {
  const lines = writeInstructions(nightcap)
  assert.equal(lines[2], 'Round 3: [dc in next 2 sts, 2 dc in next st] 2 times. (8 sts)')
  assert.equal(lines[10], 'Round 11: dc in the front loop only of each st around. (20 sts)')
  assert.ok(lines.some((l) => l.startsWith('The unworked back loops form the ridges')))
  assert.equal(lines[lines.length - 1], 'Fold the last 3 rounds up to the outside to form the brim.')
  const chart = programToChart(nightcap)
  assert.equal(chart.rounds![11]!.stitches[0]!.label, 'FLO')
  assert.match(chart.caption!, /front loop only .* fold up/)
  const b = writeInstructions(ridgeHat)
  assert.equal(b[8], 'Round 9: dc in the back loop only of each st around. (24 sts)')
  assert.ok(!b.some((l) => l.startsWith('Fold')))
})
check('a taper writes its decreases with the remainder', () => {
  const lines = writeInstructions(taper)
  assert.ok(lines.some((l) => l.includes('[dc in next 2 sts, dc2tog] 6 times')))
  assert.ok(lines.some((l) => l.includes('(14 sts)')))
})
check('the chart is a round chart with the anchor, rib labels and joins', () => {
  const chart = programToChart(hat)
  assert.equal(chart.layout, 'round')
  assert.equal(chart.rounds!.length, 9)
  assert.equal(chart.rounds![0]!.stitches[0]!.symbol, 'magic-ring')
  const rib = chart.rounds![8]!.stitches
  assert.equal(rib.length, 24)
  assert.equal(rib[0]!.label, 'FPtr')
  assert.equal(rib[1]!.label, 'BPtr')
  assert.match(chart.caption!, /left open/)
  const c2 = programToChart(cowl)
  assert.equal(c2.rounds![0]!.stitches[0]!.symbol, 'chain')
  assert.equal(c2.rounds![1]!.stitches[0]!.symbol, 'chain')
  assert.equal(c2.rounds![1]!.stitches[c2.rounds![1]!.stitches.length - 1]!.symbol, 'slip-stitch')
})
check('a round chart that never narrows again comes back as a tube, a ball as a sphere', () => {
  const t = programFromChart(programToChart(basket))
  assert.equal(t.form, 'tube')
  assert.deepEqual(t.rounds, basket.rounds)
  assert.equal(t.tube?.anchor, 'ring')
  const ball = programFromChart({
    layout: 'round',
    rounds: [6, 12, 18, 12, 6].map((count, i) => ({ roundNumber: i + 1, stitches: [{ symbol: 'double-crochet-uk', count }] })),
  })
  assert.equal(ball.form, 'sphere')
  const disc = programFromChart({
    layout: 'round',
    rounds: [6, 12, 18].map((count, i) => ({ roundNumber: i + 1, stitches: [{ symbol: 'double-crochet-uk', count }] })),
  })
  assert.equal(disc.form, 'disc')
})

if (failures.length) {
  console.error(`\n${failures.length} failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
console.log('\nAll tube tests pass.')
