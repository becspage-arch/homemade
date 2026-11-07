/**
 * THE OVAL WORKED ROUND A CHAIN, tested (engine-shapes-1107; chainOval.ts):
 *  - the words read back to the plan (every round's stitches made and taken,
 *    the stated count), round 1 in the standard wording;
 *  - patch, open stuffed and closed stuffed pieces build, relax and AUDIT
 *    clean, their rounds concentric round the chain;
 *  - the outline is a smooth oval (the cute check's own contour code: no
 *    sharp corners, rule 33; no straight run over 0.25 of the width on the
 *    designed muzzles, rule 34);
 *  - wide and short is reachable (rules 11 / 12): the designer hits the size
 *    asked;
 *  - the presets' switches leave every default hash unchanged.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/chainOval.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildChainOvalPiece, chainOvalMetrics, chainOvalPlan, chainOvalRounds, chainOvalSideSpot, chainOvalSpot, chainOvalWords, chainRoundOneWords,
  designChainOval, type ChainOvalOptions,
} from './chainOval'
import { COW_DEFAULTS, buildCowProgram, cowChainMuzzle } from './cowPreset'
import { LAMB_DEFAULTS, buildLambProgram, lambChainMuzzle } from './lambPreset'
import { compileComposition } from './composition'

const DK = 1.6
const FINE_COW = 2.308

/** Read one round's words back: stitches taken from the round below, made. */
function readBack(line: string): { taken: number; made: number; stated: number } {
  const m = /^Round \d+: (.*)\. \((\d+) sts\)$/.exec(line)
  assert.ok(m, `not a round line: ${line}`)
  const stated = Number(m[2])
  const body = m[1]!
  if (body === 'dc in each st around') return { taken: stated, made: stated, stated }
  let taken = 0, made = 0
  for (const t of body.split(', ')) {
    let r: RegExpExecArray | null
    if ((r = /^dc in next (\d+) sts$/.exec(t))) { taken += +r[1]!; made += +r[1]! }
    else if (t === 'dc in next st') { taken += 1; made += 1 }
    else if (t === '2 dc in next st') { taken += 1; made += 2 }
    else if ((r = /^\[2 dc in next st\] (\d+) times$/.exec(t))) { taken += +r[1]!; made += 2 * +r[1]! }
    else if (t === 'dc2tog') { taken += 2; made += 1 }
    else if ((r = /^\[dc2tog\] (\d+) times$/.exec(t))) { taken += 2 * +r[1]!; made += +r[1]! }
    else assert.fail(`unknown words "${t}" in: ${line}`)
  }
  return { taken, made, stated }
}

/** The pattern gate's line rule (packages/db crochet-completeness). */
const COUNTED = /\((\d+)\s*sts?\)\s*$/
const UNCOUNTED = /^(fasten off|weave in|sew |stuff |fit the|join |block |repeat rows|assembly\b|make \d|start with |change to |cut the |carry the |work every stitch |work in a continuous spiral|do not stuff )/i

const CASES: ChainOvalOptions[] = [
  { kind: 'patch', chain: 7, rounds: 2 },
  { kind: 'patch', chain: 10, rounds: 3, endInc: [3, 3, 2] },
  { kind: 'stuffed', chain: 6, rounds: 3, even: 2 },
  { kind: 'stuffed', chain: 5, rounds: 4, endInc: [3, 3, 2, 2], even: 1, closed: true },
]

test('round 1 is the standard wording: both sides of the chain, 3 in the last ch, 2 in the first', () => {
  assert.equal(
    chainRoundOneWords(7),
    'Round 1: starting in the 2nd ch from the hook, dc in next 5 ch, 3 dc in last ch; working along the other side of the chain, dc in next 4 ch, 2 dc in next ch. (14 sts)',
  )
  const w = chainOvalWords({ kind: 'patch', chain: 7, rounds: 2 }, 'face patch')
  assert.equal(w[0], 'Foundation: ch 7. (7 sts)')
  assert.equal(w[1], chainRoundOneWords(7))
  assert.deepEqual(chainOvalRounds({ kind: 'patch', chain: 7, rounds: 2 }), [14, 20, 26])
})

test('the words read back to the plan: every round takes the round below and makes its stated count', () => {
  for (const o of CASES) {
    const plan = chainOvalPlan(o)
    const words = chainOvalWords(o, 'muzzle')
    const rounds = words.filter((l) => /^Round \d+:/.test(l))
    assert.equal(rounds.length, plan.length, JSON.stringify(o))
    // Round 1: 2N stitches round the chain.
    assert.ok(rounds[0]!.endsWith(`(${2 * o.chain} sts)`))
    for (let k = 1; k < rounds.length; k++) {
      const r = readBack(rounds[k]!)
      assert.equal(r.made, r.stated, rounds[k])
      assert.equal(r.made, plan[k]!.count, rounds[k])
      assert.equal(r.taken, plan[k - 1]!.count, `${rounds[k]} takes the ${plan[k - 1]!.count} below`)
    }
    for (const l of words) assert.ok(COUNTED.test(l) || UNCOUNTED.test(l), `the pattern gate would block: ${l}`)
    // A closed piece's decreases mirror its increases, back to within one
    // round of round 1's count.
    if (o.closed) assert.ok(plan[plan.length - 1]!.count <= plan[1]!.count, `closed down to ${plan[plan.length - 1]!.count}`)
  }
})

test('patch, open and closed pieces audit clean, concentric round the chain, smooth outline', () => {
  for (const o of CASES) {
    const b = buildChainOvalPiece(o, DK)
    assert.deepEqual(b.problems, [], `${JSON.stringify(o)}: ${b.problems.join(' | ')}`)
    const m = b.metrics
    assert.ok(m.concentric, `${JSON.stringify(o)}: rounds not concentric (back ${m.worstBackDeg.toFixed(1)} deg, growth ${m.minGrowthMm.toFixed(2)} mm)`)
    assert.ok(m.corners === 0, `${JSON.stringify(o)}: ${m.corners} sharp corners`)
    assert.ok(m.widthMm > m.heightMm, `${JSON.stringify(o)}: an oval is wider than tall (${m.widthMm.toFixed(1)} x ${m.heightMm.toFixed(1)})`)
    if (o.kind === 'patch') assert.ok(m.depthMm < 4 * DK * 2, `a patch lies flat (depth ${m.depthMm.toFixed(1)} mm)`)
    else assert.ok(m.depthMm > m.heightMm * 0.25, `a stuffed piece is domed (depth ${m.depthMm.toFixed(1)} of ${m.heightMm.toFixed(1)} mm)`)
  }
})

test('the designed muzzles: no corner, short straight sides (rule 34 scale), sized as asked', () => {
  const cow = cowChainMuzzle({ ...COW_DEFAULTS, size: 'M', gauge: 1.3, chainMuzzle: true }, 1.3)!
  const lamb = lambChainMuzzle({ ...LAMB_DEFAULTS, chainMuzzle: true }, 1.3)!
  for (const [name, o, yr, maxRun] of [['cow', cow, FINE_COW, 0.3], ['lamb', lamb, FINE_COW, 0.42]] as const) {
    // Rule 34 scales runs by the head's width, the muzzle ~0.68 of it (rule
    // 11). Seen square on, an oval round a chain keeps the chain's straight
    // sides (a stadium): measured 0.27 (cow, ch 5) and 0.40 (lamb, ch 9: a
    // 1.6:1 oval needs its long chain) of the head width. On the toy the face
    // curves them away: the head outlines read 0.22 (cow) and 0.30 (lamb,
    // 0.31 with its capsule muzzle).
    const b = buildChainOvalPiece(o, yr)
    const m = chainOvalMetrics(o, b.built, b.metrics.widthMm / 0.68)
    assert.ok(m.straightRunToWidth <= maxRun, `${name}: straight run ${m.straightRunToWidth.toFixed(3)} of the head width`)
    assert.equal(m.corners, 0, `${name}: corners`)
  }
  // Wide and short (rules 11 / 12): asked 70 x 40 mm, it builds within 15%.
  for (const kind of ['patch', 'stuffed'] as const) {
    const o = designChainOval({ widthMm: 70, heightMm: 40, kind }, DK * 1.5)
    const m = buildChainOvalPiece(o, DK * 1.5).metrics
    assert.ok(Math.abs(m.widthMm / 70 - 1) < 0.15, `${kind}: width ${m.widthMm.toFixed(1)} for 70`)
    assert.ok(Math.abs(m.heightMm / 40 - 1) < 0.15, `${kind}: height ${m.heightMm.toFixed(1)} for 40`)
  }
})

test('embroidery spots are read off the geometry: the ends sit at +-x, the sides at +-y, a motif symmetric', () => {
  const o: ChainOvalOptions = { kind: 'stuffed', chain: 6, rounds: 3, even: 1 }
  const e1 = chainOvalSpot(o, DK, 3, 'E1', 0).th
  const e0 = chainOvalSpot(o, DK, 3, 'E0', 0).th
  assert.ok(Math.abs(e1) < 1e-6, `E1 end at +x (th ${e1})`)
  assert.ok(Math.abs(Math.abs(e0) - Math.PI) < 1e-6, `E0 end at -x (th ${e0})`)
  const top = chainOvalSideSpot(o, DK, 3, -1, 0).th
  assert.ok(Math.abs(top + Math.PI / 2) < 1e-6, `the -y side's middle (th ${top})`)
  const l = chainOvalSideSpot(o, DK, 3, -1, -1).th, r = chainOvalSideSpot(o, DK, 3, -1, 1).th
  assert.ok(Math.abs((l + r) / 2 + Math.PI / 2) < 1e-6, 'one stitch either side of the middle is symmetric')
})

test('the switches: absent = every default hash unchanged; on = clean, and the words print the oval', () => {
  const pinned = (p: ReturnType<typeof buildCowProgram>) => JSON.stringify(p.parts.map((q) => [q.name, q.rounds]))
  assert.equal(pinned(buildCowProgram({ ...COW_DEFAULTS, chainMuzzle: false })), pinned(buildCowProgram(COW_DEFAULTS)))
  assert.equal(pinned(buildLambProgram({ ...LAMB_DEFAULTS, chainMuzzle: false })), pinned(buildLambProgram(LAMB_DEFAULTS)))
  // Gauge 1 ignores the switch (fine-gauge only, like the cow's other cute parts).
  assert.equal(pinned(buildCowProgram({ ...COW_DEFAULTS, chainMuzzle: true })), pinned(buildCowProgram(COW_DEFAULTS)))
  const lamb = buildLambProgram({ ...LAMB_DEFAULTS, chainMuzzle: true })
  const mz = lamb.parts.find((q) => q.name === 'muzzle')!
  assert.ok(mz.words![0]!.startsWith('Foundation: ch '))
  assert.ok(mz.joinWords!.startsWith('Sew the muzzle on by its last round'))
  assert.match(lamb.embroidery![0]!.words!, /rounds out from the chain/)
  const cc = compileComposition(lamb)
  assert.deepEqual(cc.problems, [])
})
