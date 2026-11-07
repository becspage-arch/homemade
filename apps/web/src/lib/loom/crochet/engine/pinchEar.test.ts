/**
 * THE EAR SEWN BY ITS PINCH, tested (engine-shapes-1107; pinchEar.ts):
 *  - round (rolled-rim cup) and pointed (soft-rolled cone) ears, plain and
 *    lined, build, relax and AUDIT clean at DK and at the fine cow's yarn;
 *  - posed to be sewn by the pinch: the seat is the bottom of the posed ear,
 *    the ear stands out from it, the cup holds a hollow and its base is
 *    pinched;
 *  - the words print the pinch and the sewing by it;
 *  - on the fine cow with the oval muzzle: clean, and the ear rules the
 *    shape was built for (18 out, 19 high, 20 shape, 40 thick rim) pass;
 *    absent = every default unchanged.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/pinchEar.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildPinchEar, pinchEarRounds, pinchEarWords, type PinchEarOptions } from './pinchEar'
import { COW_DEFAULTS, buildCowProgram } from './cowPreset'
import { LAMB_DEFAULTS, buildLambProgram } from './lambPreset'
import { compileComposition } from './composition'

const DK = 1.6
const FINE_COW = 2.308

const ROUND: PinchEarOptions[] = [
  { shape: 'round', width: 12, depth: 1 },
  { shape: 'round', width: 18, depth: 1, pinch: 1 },
  { shape: 'round', width: 21, depth: 1, pinch: 1 },
  { shape: 'round', width: 24, depth: 2, liningHex: '#eeddcc' },
]
// The top roll (a part round over the top, folded with the rim), both ways.
const TOP_ROLL: PinchEarOptions[] = [
  { shape: 'round', width: 18, depth: 1, pinch: 1, topRoll: { arc: 0.33 } },
  { shape: 'round', width: 18, depth: 1, pinch: 1, topRoll: { arc: 0.33, side: -1 } },
]
const POINTED: PinchEarOptions[] = [
  { shape: 'pointed', width: 12, depth: 3 },
  { shape: 'pointed', width: 15, depth: 3, liningHex: '#eeddcc' },
  { shape: 'pointed', width: 15, depth: 6 },
]

test('the rounds and words: the cup or cone, then the pinch sewn and the ear sewn by it', () => {
  assert.deepEqual(pinchEarRounds({ shape: 'round', width: 18, depth: 1 }), [6, 12, 18, 18, 18])
  assert.deepEqual(pinchEarRounds({ shape: 'pointed', width: 12, depth: 3 }), [6, 9, 12, 12, 12, 12, 12])
  for (const o of [...ROUND, ...POINTED]) {
    const w = pinchEarWords(o)
    const sewPinch = w.findIndex((l) => /^Sew the base .*together where you pinch it/.test(l))
    assert.ok(sewPinch > 0, `${JSON.stringify(o)}: the pinch is sewn`)
    assert.match(w[sewPinch]!, /2 small stitches through/)
    assert.match(w[sewPinch + 1]!, /^Sew the ear to the head by the pinch/)
    assert.equal(sewPinch + 2, w.length, 'the sewing closes the ear\'s words')
    if (o.shape === 'round') assert.ok(w.some((l) => /^Fold the last round back/.test(l)), 'the rim is rolled')
    if (o.liningHex) assert.ok(w.some((l) => /contrast|lining/i.test(l)), 'the lining is named')
  }
  assert.throws(() => pinchEarRounds({ shape: 'pointed', width: 18, depth: 3 }), /9-15/)
  assert.throws(() => pinchEarRounds({ shape: 'round', width: 18, depth: 1, pinch: 0.1 }), /pinch/)
  assert.throws(() => pinchEarRounds({ shape: 'round', width: 24, depth: 1, pinch: 1 }), /tears/)
  // The top roll: one more round (the part round), its words, the pinch placed.
  assert.deepEqual(pinchEarRounds(TOP_ROLL[0]!), [6, 12, 18, 18, 18, 18])
  for (const o of TOP_ROLL) {
    const w = pinchEarWords(o)
    assert.ok(w.some((l) => /^Round 6 \(part round, over the top of the ear\): dc in next 6 sts only/.test(l)), w.join('\n'))
    assert.ok(w.some((l) => /^Fold the last 2 rounds back .*two rounds deep over the top/.test(l)), 'the rim folds two deep over the top')
    assert.match(w.at(-2)!, new RegExp(`Make the pinch at the stitch 6 sts ${o.topRoll!.side === -1 ? 'on' : 'back'} from the middle stitch of the part round`))
  }
  assert.throws(() => pinchEarRounds({ shape: 'round', width: 18, depth: 1, rimRoll: 2, topRoll: {} }), /one-round rim/)
  assert.throws(() => pinchEarRounds({ shape: 'round', width: 18, depth: 1, topRoll: { arc: 0.8 } }), /arc/)
})

test('every ear audits clean, stands out from its pinch, and a cup holds a pinched hollow', () => {
  for (const yr of [DK, FINE_COW]) {
    for (const o of [...ROUND, ...TOP_ROLL, ...POINTED]) {
      const b = buildPinchEar(o, yr)
      const tag = `${JSON.stringify(o)} @ ${yr}`
      assert.deepEqual(b.problems, [], `${tag}: ${b.problems.join(' | ')}`)
      // The seat is the bottom of the posed ear (sewn by it); the ear stands
      // out from it by most of its size.
      let zMin = Infinity
      for (const n of b.built.model.nodes.slice(b.built.anchorPins ?? 0)) zMin = Math.min(zMin, n.z)
      assert.ok(b.seat.z - zMin < 3 * yr, `${tag}: the pinch is the ear's base (${(b.seat.z - zMin).toFixed(1)} mm above the bottom)`)
      assert.ok(b.standOutMm > 0.6 * b.widthMm, `${tag}: stands out ${b.standOutMm.toFixed(1)} mm for ${b.widthMm.toFixed(1)} wide`)
      if (o.shape === 'round') {
        assert.ok(b.metrics.hollowMm > 2 * yr, `${tag}: hollow ${b.metrics.hollowMm.toFixed(1)} mm`)
        // earMetrics reads the pinch as the rim band's width at the base over
        // its width at the far end; the top roll's extra folded round lies in
        // that band along one edge and skews it (DK: -0.27), so a rolled cup's
        // pinch is checked on the cow instead (rules 20, 21 and the render).
        if (!o.topRoll) assert.ok((b.metrics.rimMm?.pinch ?? 0) > 0.05, `${tag}: base pinched (${b.metrics.rimMm?.pinch.toFixed(2)})`)
      }
    }
  }
})

test('the switches: absent = every default unchanged; at gauge 1 the cow ignores it', () => {
  const pinned = (p: ReturnType<typeof buildCowProgram>) => JSON.stringify(p.parts.map((q) => [q.name, q.rounds, q.place]))
  assert.equal(pinned(buildCowProgram({ ...COW_DEFAULTS, pinchEars: false })), pinned(buildCowProgram(COW_DEFAULTS)))
  assert.equal(pinned(buildCowProgram({ ...COW_DEFAULTS, pinchEars: true })), pinned(buildCowProgram(COW_DEFAULTS)))
  assert.equal(pinned(buildLambProgram({ ...LAMB_DEFAULTS, pinchEars: false })), pinned(buildLambProgram(LAMB_DEFAULTS)))
  const lamb = buildLambProgram({ ...LAMB_DEFAULTS, pinchEars: true })
  const ear = lamb.parts.find((q) => q.name === 'ear-r')!
  assert.ok(ear.custom, 'the lamb\'s pinched ear is the custom piece')
  assert.match(ear.words!.at(-1)!, /^Sew the ear to the head by the pinch/)
})

test('the fine cow with both shapes: clean, the ears stand out, high, cow-shaped, the rim rolled thick over the top', () => {
  const p = buildCowProgram({
    ...COW_DEFAULTS, size: 'M', mainHex: '#5c382c', eyeMm: 16, gauge: 1.3,
    muzzleSize: { equator: 1.15, across: 1 }, muzzleOval: { equator: 1.2, aspect: 1.45 }, cuppedEars: true, foldedEars: true, seatBackLegs: true,
    coiledCurls: true, curvedHorns: true, taperedLegs: true, cuteFit: true, chainMuzzle: true, pinchEars: true,
  })
  // The rule-calib r1 cow's fringe (rule-calib-1027.md): tighter coils than
  // the preset's, which would link at this head.
  const h0 = p.hair![0]!
  p.hair = [{ ...h0, coil: { ...h0.coil!, radiusYr: 2.5, turns: 1.5, pitchYr: 2.7 }, strandYr: 0.9 }]
  const cc = compileComposition(p)
  assert.deepEqual(cc.problems, [])
  const r = new Map(cc.cute!.results.map((x) => [x.n, x]))
  // Rule 21 (thickest / thinnest rim as seen, 1.8-4): the top roll (2.05;
  // the even roll read 1.43), with rule 40 (the rim thick enough) still met.
  for (const n of [8, 9, 11, 12, 13, 18, 19, 20, 21, 33, 34, 40]) assert.ok(r.get(n)?.pass, `rule ${n}: ${r.get(n)?.value.toFixed(3)}`)
  const ear = p.parts.find((q) => q.name === 'ear-r')!
  assert.ok(ear.words!.some((l) => /part round, over the top of the ear/.test(l)), 'the cow\'s ear has the top roll')
  // The oval muzzle's nostrils: the chain oval's default (chainOval.ts).
  const nose = cc.embroidery.find((e) => e.name === 'nose')
  assert.ok(nose, 'the nostrils are stitched')
  const mz = p.parts.find((q) => q.name === 'muzzle')!
  assert.match(mz.words![1]!, /^Round 1: starting in the 2nd ch from the hook/)
})
