/**
 * THE BENT TUBE, tested (STITCH_ENGINE.md §8r): the planner's stitches and
 * words, the build's audit, the bend MEASURED off the settled nodes against
 * the requested angle, the outer/inner stitch heights, no self-intersection,
 * and the tapered limb's counts and audit.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/bentTube.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  bentRoundWords, bentTubeMetrics, bentTubeWords, buildBentTube, planBend, predictedBendDeg, straightPlan, taperRounds, validateBentTube,
  type BentTubeSpec,
} from './bentTube'
import { taperedLimbRounds } from './limbProfiles'
import { relaxProgram } from './programScene'
import { auditProblems } from './auditChecks'
import { buildSphere } from './shaping'

const YR = 2.4
const HORN = taperRounds(5, 14, 11, 1.6)

function settle(spec: BentTubeSpec, yr = YR) {
  const built = buildBentTube(spec, yr)
  relaxProgram(built, yr)
  const problems = auditProblems({ built, recipe: undefined as never }, 'bent', 0, yr)
  return { built, problems, m: bentTubeMetrics(built, spec) }
}

/** Read a round's words back into (stitches worked into, stitches made). */
function parseRound(words: string, prev: number): { used: number; made: number } {
  let used = 0
  let made = 0
  const unit = (u: string): { used: number; made: number } => {
    u = u.trim()
    let m: RegExpMatchArray | null
    if ((m = u.match(/^(dc|htr) in next (\d+) sts$/))) return { used: +m[2]!, made: +m[2]! }
    if (/^(dc|htr) in next st$/.test(u)) return { used: 1, made: 1 }
    if (/^2 (dc|htr) in next st$/.test(u)) return { used: 1, made: 2 }
    if (/^\((dc|htr), (dc|htr)\) in next st$/.test(u)) return { used: 1, made: 2 }
    if (u === 'dc2tog') return { used: 2, made: 1 }
    throw new Error(`unreadable: "${u}"`)
  }
  if (/^(dc|htr) in each st around$/.test(words)) return { used: prev, made: prev }
  // Split on the commas outside brackets/parens.
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of words) {
    if (ch === '[' || ch === '(') depth++
    if (ch === ']' || ch === ')') depth--
    if (ch === ',' && depth === 0) { parts.push(cur); cur = '' } else cur += ch
  }
  parts.push(cur)
  for (const p of parts) {
    const rep = p.trim().match(/^\[(.*)\] (\d+) times$/)
    const u = rep ? unit(rep[1]!) : unit(p)
    const n = rep ? +rep[2]! : 1
    used += u.used * n
    made += u.made * n
  }
  return { used, made }
}

test('the planner reaches the request and its words read back to every count', () => {
  for (const angle of [30, 60, 80]) {
    const plan = planBend(HORN, { angleDeg: angle })
    assert.ok(Math.abs(plan.predictedDeg - angle) <= 3, `${angle}: predicted ${plan.predictedDeg.toFixed(1)}`)
    validateBentTube(plan.spec)
    const words = bentTubeWords(plan.spec)
    assert.equal(words[0], `Round 1: 5 dc into a magic ring. (5 sts)`)
    for (let k = 1; k < HORN.length; k++) {
      const r = parseRound(bentRoundWords(plan.spec, k), HORN[k - 1]!)
      assert.equal(r.used, HORN[k - 1], `round ${k + 1} works into ${r.used} of ${HORN[k - 1]}`)
      assert.equal(r.made, HORN[k], `round ${k + 1} makes ${r.made}, not ${HORN[k]}`)
      const tall = plan.spec.plan[k]!.filter((s) => s === 'hdc').length
      const htr = (bentRoundWords(plan.spec, k).match(/htr/g) ?? []).length
      assert.equal(htr > 0, tall > 0, `round ${k + 1}: htr in the words iff in the plan`)
      assert.ok(words[k]!.includes(tall ? `; ${tall} on the outside of the curve)` : `(${HORN[k]} sts)`))
    }
    assert.ok(words.some((w) => w.startsWith('Stuff lightly')))
  }
})

test('tall stitches sit in the middle of the round, decreases stay dc', () => {
  const plan = planBend(HORN, { angleDeg: 60 })
  for (const k of plan.bentRounds) {
    const ids = plan.spec.plan[k]!
    const idx = ids.map((s, i) => (s === 'hdc' ? i : -1)).filter((i) => i >= 0)
    const mid = (idx[0]! + idx[idx.length - 1]!) / 2
    assert.ok(Math.abs(mid - (ids.length - 1) / 2) <= 0.5, `round ${k + 1}: tall run centred at ${mid} of ${ids.length}`)
    assert.equal(idx.length, idx[idx.length - 1]! - idx[0]! + 1, `round ${k + 1}: one run`)
  }
  assert.throws(() => validateBentTube({ rounds: [6, 6, 6, 6], plan: [['hdc', 'sc', 'sc', 'sc', 'sc', 'sc']] }), /round 1/)
  assert.throws(() => validateBentTube({ rounds: [6, 12, 11, 11], plan: [straightPlan([6])[0]!, straightPlan([12])[0]!, Array(11).fill('hdc'), straightPlan([11])[0]!] }), /decrease/)
})

test('a straight plan builds a straight tube', () => {
  const spec: BentTubeSpec = { rounds: HORN, plan: straightPlan(HORN) }
  assert.equal(predictedBendDeg(spec), 0)
  const { problems, m } = settle(spec)
  assert.deepEqual(problems, [])
  assert.ok(m.bendDeg < 5, `straight settled at ${m.bendDeg.toFixed(1)}°`)
})

test('the bend measured off the settled piece is the one asked for', () => {
  for (const angle of [30, 60, 80]) {
    const plan = planBend(HORN, { angleDeg: angle })
    const { built, problems, m } = settle(plan.spec)
    assert.deepEqual(problems, [], `${angle}°: ${problems.join('; ')}`)
    const tol = Math.max(4, angle * 0.1)
    assert.ok(Math.abs(m.bendDeg - angle) <= tol, `${angle}°: settled ${m.bendDeg.toFixed(1)}° (predicted ${plan.predictedDeg.toFixed(1)})`)
    // The outside really is longer: measured crown to crown on the settled
    // fabric, an hdc column climbs further than an sc one — less than its
    // natural 1.56 x (row pitch 3.74 / 2.4 yr), because the ring takes up the
    // step between neighbours, more the more of the round is hdc.
    const ratio = m.tallClimbMm / m.scClimbMm
    assert.ok(ratio > 1.08 && ratio < 1.56, `${angle}°: hdc/sc climb ${ratio.toFixed(2)}`)
    // No self-intersection: rounds three or more apart never come within a
    // yarn diameter (the inside of the curve gathers, it does not fold).
    assert.ok(m.minGapMm > 2 * YR, `${angle}°: rounds ≥3 apart ${m.minGapMm.toFixed(2)} mm close`)
    // Seated by the open end at the bottom, the tip curling toward +x.
    const nodes = built.model.nodes
    const row = built.nodeRow!
    const cen = (k: number) => {
      let x = 0, z = 0, n = 0
      nodes.forEach((p, i) => { if (row[i] === k) { x += p.x; z += p.z; n++ } })
      return { x: x / n, z: z / n }
    }
    const tip = cen(1), base = cen(HORN.length - 1)
    assert.ok(base.z < tip.z, `${angle}°: base below the tip`)
    assert.ok(tip.x > base.x + 1, `${angle}°: tip curls toward +x (${(tip.x - base.x).toFixed(1)} mm)`)
  }
})

test('the bend is the same at fine and bulky yarn (it is in the stitches)', () => {
  const plan = planBend(HORN, { angleDeg: 60 })
  const a = settle(plan.spec, 1.5)
  const b = settle(plan.spec, 3.2)
  assert.deepEqual(a.problems, [])
  assert.deepEqual(b.problems, [])
  assert.ok(Math.abs(a.m.bendDeg - b.m.bendDeg) < 2, `${a.m.bendDeg.toFixed(1)} vs ${b.m.bendDeg.toFixed(1)}`)
})

test('a tail that narrows (decreases) bends too, and audits clean', () => {
  const tail = [6, 9, 12, 12, 12, 11, 10, 9, 9, 8, 8]
  const plan = planBend(tail, { angleDeg: 45, from: 0.2, to: 0.9 })
  const { problems, m } = settle(plan.spec)
  assert.deepEqual(problems, [])
  assert.ok(Math.abs(m.bendDeg - plan.predictedDeg) <= 5 && Math.abs(plan.predictedDeg - 45) <= 4, `tail settled ${m.bendDeg.toFixed(1)}°`)
  for (let k = 1; k < tail.length; k++) assert.equal(parseRound(bentRoundWords(plan.spec, k), tail[k - 1]!).made, tail[k])
})

test('taperRounds: a plump taper never more than doubles and ends at the widest', () => {
  for (const p of [1, 1.6, 2.4]) {
    const r = taperRounds(4, 14, 9, p)
    assert.equal(r[0], 4)
    assert.equal(r[r.length - 1], 14)
    for (let k = 1; k < r.length; k++) assert.ok(r[k]! >= r[k - 1]! && r[k]! <= 2 * r[k - 1]!)
  }
  // Plumper = wider sooner.
  assert.ok(taperRounds(4, 14, 9, 2)[3]! > taperRounds(4, 14, 9, 1)[3]!)
})

test('tapered limb: a round foot, a slow taper, closed; audits clean as a stuffed piece', () => {
  const r = taperedLimbRounds({ foot: 14, top: 9, length: 20 })
  assert.equal(r.length, 20)
  const w = Math.max(...r)
  const iw = r.indexOf(w)
  assert.ok(iw >= 2 && iw <= 4, 'the foot climbs as a ball cap')
  for (let k = iw + 1; k < r.length - 1; k++) assert.ok(r[k]! <= r[k - 1]! && r[k - 1]! - r[k]! <= 1, `round ${k + 1}: ${r[k - 1]} → ${r[k]}`)
  assert.equal(r[r.length - 2], 9)
  assert.ok(r[r.length - 1]! >= 6 && r[r.length - 1]! * 2 >= r[r.length - 2]!)
  const built = buildSphere('sc', 0, YR, r)
  relaxProgram(built, YR)
  assert.deepEqual(auditProblems({ built, recipe: undefined as never }, 'leg', 0, YR), [])
})
