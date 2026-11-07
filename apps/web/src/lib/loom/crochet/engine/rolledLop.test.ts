/**
 * THE ROLLED-EDGE LOP, tested (ears-1107; rolledLop.ts):
 *  - the counts and words: the oval round a chain, the lining, the part round
 *    (forward, or turned back for the mirror ear), the fold, the pinch and
 *    the sewing by it;
 *  - every ear builds, relaxes with its pinch and AUDITS clean at the bunny's
 *    fine yarn and at worsted, short and long, narrow and wide;
 *  - posed to hang from its pinch, with a real hollow;
 *  - on the bunny M: clean, a lop by the rules (22 long, 23 wide) and folded
 *    (21: the rolled rim seen round the lining); absent = the default bunny's
 *    program unchanged.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/rolledLop.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildRolledLop, designRolledLop, outerRollStitches, rolledLopRounds, rolledLopWords, type RolledLopOptions } from './rolledLop'
import { allPresetChoices, buildAmigurumiProgram } from './amigurumiPresets'
import { compileComposition } from './composition'

const FINE = 1.3
const WORSTED = 2.1

test('the counts and words: the oval, the lining, the part round, the fold, the pinch', () => {
  const o: RolledLopOptions = { chain: 20, rounds: 1, liningHex: '#e8b4b0' }
  // ch 20: round 1 40, the flat increase round 46, two wall rounds, the
  // folded round, the part round.
  assert.deepEqual(rolledLopRounds(o), [40, 46, 46, 46, 46, 46])
  // The part round: the tip fan's leading half (2 sts) and side A (17), less
  // ceil(46 / 6) = 8 sts clear of the base fan.
  const n = outerRollStitches(o)
  assert.equal(n, 2 + 17 - 8)
  const w = rolledLopWords(o)
  assert.equal(w[0], 'Start with the lining yarn.')
  assert.equal(w[1], 'Foundation: ch 20. (20 sts)')
  assert.match(w[2]!, /^Round 1: starting in the 2nd ch from the hook, dc in next 18 ch, 3 dc in last ch/)
  assert.equal(w.indexOf('Change to the main yarn.'), 4, 'the main yarn from the first wall round')
  assert.ok(w.includes(`Round 6 (part round, down the outer side of the ear): dc in next ${n} sts only, leaving the rest of the round unworked; sl st in next st. (${n} sts)`), w.join('\n'))
  assert.ok(w.some((l) => /^Fold the last 2 rounds back over the outside .*a round deeper down the outer side/.test(l)))
  assert.match(w.at(-2)!, /^Sew the base of the rim together where you pinch it: at the starting end of the chain .* 2 small stitches/)
  assert.match(w.at(-1)!, /^Sew the ear to the head by the pinch only, so it hangs with the lined hollow facing forward/)
  // The mirror ear turns and works the part row back down the other side.
  const m = rolledLopWords({ ...o, outerRoll: { side: -1 } })
  assert.ok(m.some((l) => /^Round 6 \(part row, down the outer side of the ear\): turn, ch 1, and working back/.test(l)))
  // Without the outer roll: one folded round, no part round.
  const plain = rolledLopWords({ ...o, outerRoll: false })
  assert.ok(plain.some((l) => /^Fold the last round back over the outside of the ear, so the rim rolls outward into a thick lip all round\.$/.test(l)))
  assert.ok(!plain.some((l) => /part round/.test(l)))
  assert.throws(() => rolledLopRounds({ chain: 4, rounds: 1 }), /6-60/)
  assert.throws(() => rolledLopRounds({ chain: 20, rounds: 1, wall: 4 }), /wall/)
  assert.throws(() => rolledLopRounds({ chain: 20, rounds: 1, pinch: 0.1 }), /pinch/)
})

test('every rolled lop audits clean, hangs from its pinch, and holds a hollow', () => {
  const cases: [RolledLopOptions, number][] = [
    [{ chain: 12, rounds: 1 }, FINE],
    [{ chain: 24, rounds: 2 }, FINE],
    [{ chain: 34, rounds: 1 }, FINE],
    [{ chain: 34, rounds: 1, rim: 2 }, FINE],
    [{ chain: 34, rounds: 1, outerRoll: false }, FINE],
    [{ chain: 34, rounds: 1, pinch: 0.6 }, FINE],
    [{ chain: 16, rounds: 1 }, WORSTED],
  ]
  for (const [o, yr] of cases) for (const side of [1, -1] as const) {
    const b = buildRolledLop(o, yr, side)
    const tag = `${JSON.stringify(o)} side ${side} @ ${yr}`
    assert.deepEqual(b.problems, [], `${tag}: ${b.problems.join(' | ')}`)
    let zMin = Infinity
    for (const n of b.built.model.nodes) zMin = Math.min(zMin, n.z)
    assert.ok(b.seat.z - zMin < 4 * yr, `${tag}: the pinch is the ear's top (${(b.seat.z - zMin).toFixed(1)} mm)`)
    assert.ok(b.lengthMm > 1.8 * b.widthMm, `${tag}: a long ear (${b.lengthMm.toFixed(0)} x ${b.widthMm.toFixed(0)} mm)`)
    assert.ok(b.hollowMm > 3 * yr, `${tag}: hollow ${b.hollowMm.toFixed(1)} mm`)
  }
  // The designer picks the chain for the length and the rounds for the width.
  const d = designRolledLop({ lengthMm: 140, widthMm: 24 }, FINE)
  assert.equal(d.rounds, 1)
  assert.ok(d.chain >= 30 && d.chain <= 38, `ch ${d.chain}`)
})

test('the bunny M with rolled lops: clean, long, wide, folded; absent = unchanged', () => {
  const bunny = allPresetChoices().find((c) => c.base === 'bunny' && c.size === 'M')!
  const pinned = (p: ReturnType<typeof buildAmigurumiProgram>) => JSON.stringify(p.parts.map((q) => [q.name, q.rounds, q.place, q.words]))
  assert.equal(pinned(buildAmigurumiProgram({ ...bunny, rolledLops: false })), pinned(buildAmigurumiProgram(bunny)))
  const p = buildAmigurumiProgram({ ...bunny, rolledLops: true })
  const ear = p.parts.find((q) => q.name === 'ear-l')!
  assert.ok(ear.custom, 'the rolled lop is the custom piece')
  assert.ok(ear.words!.some((l) => /part row, down the outer side/.test(l)), 'the left ear turns its part row')
  const cc = compileComposition(p)
  assert.deepEqual(cc.problems, [])
  const r = new Map(cc.cute!.results.map((x) => [x.n, x]))
  // Rule 21 (thickest / thinnest rim as seen, 1.8-4): the closed lop reads 1.0.
  for (const n of [21, 22, 23, 33, 34]) assert.ok(r.get(n)?.pass, `rule ${n}: ${r.get(n)?.value.toFixed(3)}`)
})
