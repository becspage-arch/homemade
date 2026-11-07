/**
 * THE CURLS SPRING OPEN (curl-relax-1107; coilSpring.ts).
 *
 *   - wound at full size, a packed cap of coils is emitted with neighbours
 *     threaded through each other, and the relax cannot unlink them;
 *   - sprung open from seeds, the same cap settles with every pair unlinked,
 *     the coils as big as before, and the yarn's rest lengths restored;
 *   - off means off: a patch without `coilSpring` builds as before.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/coilSpring.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildHairPatch, hairPatchProblems, loopBodies, type HairPatch } from './hairPatch'
import { springCoils } from './coilSpring'
import { buildRounds } from './shaping'
import { coilProblems } from './loopStitch'

const YR = 1
const CAP: HairPatch = {
  name: 'cap', on: 'head', dir: { x: 0, y: 0, z: 1 }, stitch: 'loopst',
  rounds: [6, 12, 18, 24, 30, 36, 42, 48], firstLoopRound: 1, loopEvery: 3,
  coil: { radiusYr: 1.8, turns: 1.5, pitchYr: 2.7, pairYr: 0.7 },
  coilMix: { every: 3, big: 1.6, small: 0.7 },
  faceDir: { x: 0, y: 1, z: 0.55 }, faceJitterDeg: 24,
  coilClearYr: 0, strandYr: 0.9, colourHex: '#885a4a',
}

const linked = (probs: string[]): number => probs.filter((p) => /linked/.test(p)).length
const sizes = (h: HairPatch): number[] => {
  const b = buildHairPatch(h, YR)
  return loopBodies(b).map((body) => {
    const pts = body.map((i) => b.model.nodes[i]!)
    const m = pts.reduce((a, v) => ({ x: a.x + v.x / pts.length, y: a.y + v.y / pts.length, z: a.z + v.z / pts.length }), { x: 0, y: 0, z: 0 })
    return 2 * Math.sqrt(pts.reduce((a, v) => a + (v.x - m.x) ** 2 + (v.y - m.y) ** 2 + (v.z - m.z) ** 2, 0) / pts.length)
  })
}

test('a packed cap wound at full size links; sprung open from seeds it does not', () => {
  const wound = buildHairPatch(CAP, YR)
  const before = linked(hairPatchProblems(CAP, wound, YR))
  assert.ok(before > 0, `the packed cap should link when wound at full size (got ${before})`)
  const sprung = { ...CAP, coilSpring: true }
  const probs = hairPatchProblems(sprung, buildHairPatch(sprung, YR), YR)
  assert.deepEqual(probs, [])
  // The curls are as big as they were wound (not shrunk to fit).
  const a = sizes(CAP), b = sizes(sprung)
  const mean = (x: number[]): number => x.reduce((s, v) => s + v, 0) / x.length
  assert.ok(mean(b) > 0.8 * mean(a), `sprung curls ${mean(b).toFixed(2)} vs wound ${mean(a).toFixed(2)}`)
})

test('springCoils restores every rest length and leaves the fabric where it was', () => {
  const built = buildRounds('sc', CAP.rounds, YR, undefined, {
    roundStitch: (k) => (k >= 1 ? 'loopst' : 'sc'),
    loopByStitch: () => ({ coil: CAP.coil! }),
  })
  const m = built.model
  const rest = [...m.dist.map((c) => c.rest), ...m.bend.map((c) => c.rest)]
  const fabric = m.nodes.map((n, i) => (m.loose?.[i] ? null : { ...n }))
  const bodies = loopBodies(built)
  assert.ok(coilProblems(bodies.map((b) => b.map((i) => m.nodes[i]!)), 0).length > 0, 'wound linked')
  const { seeds } = springCoils(m, bodies, { collMinDist: YR * 1.25 })
  assert.ok(Math.min(...seeds) < 1)
  assert.deepEqual([...m.dist.map((c) => c.rest), ...m.bend.map((c) => c.rest)], rest)
  m.nodes.forEach((n, i) => { if (fabric[i]) assert.deepEqual({ ...n }, fabric[i]) })
  assert.deepEqual(coilProblems(bodies.map((b) => b.map((i) => m.nodes[i]!)), 0), [])
})

test('off means off: no coilSpring builds the same patch', () => {
  const a = buildHairPatch(CAP, YR).model.nodes
  const b = buildHairPatch({ ...CAP, coilSpring: false }, YR).model.nodes
  assert.equal(JSON.stringify(a), JSON.stringify(b))
})
