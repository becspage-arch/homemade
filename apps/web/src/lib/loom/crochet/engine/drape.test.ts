/**
 * The drape relax (engine/drape.ts): a soft tube settles on the table under
 * gravity without its stitches moving relative to each other, and nothing
 * that does not opt in moves at all.
 *   cd apps/web && npx tsx src/lib/loom/crochet/engine/drape.test.ts
 */
import assert from 'node:assert/strict'
import { drapeTube, shellRoundTrip } from './drape'
import { compileRelaxAudit, geometryHash, programScene } from './programScene'
import type { CrochetProgram } from './program'

const failures: string[] = []
function check(name: string, fn: () => void): void {
  try { fn(); console.log(`  ok  ${name}`) } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`); console.log(`FAIL  ${name}`)
  }
}

// A small hat: a dome crown to 36 around, a short body, in worsted (quick to build).
const hat: CrochetProgram = {
  name: 'drape-hat', form: 'tube', stitch: 'sc',
  rounds: [6, 12, 18, 24, 30, 36, 36, 36, 36, 36, 36, 36],
  tube: { anchor: 'ring', join: 'spiral', cap: 'dome' },
  yarnWeight: 'worsted', colourHex: '#b7a4d8', staging: 'standing',
}
const { built, yr, problems } = compileRelaxAudit(hat)

check('the test hat audits clean', () => assert.deepEqual(problems, []))

check('the shell map round-trips the relaxed geometry (no drape = no move)', () => {
  const { maxErr, meanErr } = shellRoundTrip(built, 36)
  assert.ok(meanErr < yr * 0.1, `mean ${meanErr.toFixed(3)} mm`)
  assert.ok(maxErr < yr * 1.5, `max ${maxErr.toFixed(3)} mm`)
})

check('a program without `drape` renders the geometry as worked, hash untouched', () => {
  const before = geometryHash(built)
  const scene = programScene(hat, built, yr, 0.08, 'standing')
  assert.equal(geometryHash(built), before)
  assert.equal(scene.view.tiltDeg, 56, 'the standing camera')
})

check('draped: every point lands on or above the table, the piece lies low, and the fabric is near-isometric', () => {
  const r = drapeTube(built, yr, { start: 'collapsed', steps: 300 })
  let zmin = Infinity, zmax = -Infinity
  for (const p of r.world) { if (p.z < zmin) zmin = p.z; if (p.z > zmax) zmax = p.z }
  assert.ok(zmin > -yr * 0.5, `lowest point ${zmin.toFixed(2)} mm`)
  // Standing, the hat is ~12 rounds tall; lying doubled it is a couple of fabric thicknesses.
  assert.ok(zmax < r.thicknessMm * 4, `lying height ${zmax.toFixed(1)} mm vs thickness ${r.thicknessMm.toFixed(1)}`)
  assert.ok(r.stretch < 0.06, `mean edge stretch ${(r.stretch * 100).toFixed(1)}%`)
  assert.equal(r.world.length, built.strandPath.length)
})

check('draped: the stitches keep their shape (neighbour spacing along the yarn is preserved)', () => {
  const r = drapeTube(built, yr, { start: 'side', steps: 300 })
  const nodes = built.model.nodes
  const ctrl = built.strandPath.map((ni) => nodes[ni]!)
  let worst = 0
  let sum = 0
  for (let i = built.anchorPins + 1; i < ctrl.length; i++) {
    const a = ctrl[i - 1]!, b = ctrl[i]!
    const d0 = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
    const p = r.world[i - 1]!, q = r.world[i]!
    const d1 = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)
    if (d0 < 1e-6) continue
    const e = Math.abs(d1 - d0) / d0
    sum += e
    if (e > worst) worst = e
  }
  const mean = sum / (ctrl.length - built.anchorPins - 1)
  // A 36-stitch hat crumples tightly for its thickness (the big beanie measures
  // ~4%); the figure includes the genuine (1 ± n·κ) stretch across folds.
  assert.ok(mean < 0.1, `mean segment change ${(mean * 100).toFixed(1)}%`)
  assert.ok(worst < 0.6, `worst segment change ${(worst * 100).toFixed(0)}%`)
})

check('draped: deterministic for the same seed, different for another', () => {
  const a = drapeTube(built, yr, { steps: 120, seed: 3 })
  const b = drapeTube(built, yr, { steps: 120, seed: 3 })
  const c = drapeTube(built, yr, { steps: 120, seed: 4 })
  assert.deepEqual(a.world[500], b.world[500])
  assert.notDeepEqual(a.world[500], c.world[500])
})

check('a prop holds the fabric off the table', () => {
  const r = drapeTube(built, yr, {
    start: 'standing', steps: 300,
    colliders: [{ kind: 'ellipsoid', centre: { x: 0, y: 0, z: 0 }, semi: { x: 30, y: 30, z: 30 } }],
  })
  let zmax = -Infinity
  for (const p of r.world) if (p.z > zmax) zmax = p.z
  assert.ok(zmax > 25, `top at ${zmax.toFixed(1)} mm over a 30 mm sphere`)
})

check('with `drape` set, the scene is the draped piece and the geometry hash still does not move', () => {
  const before = geometryHash(built)
  const scene = programScene({ ...hat, drape: { steps: 200 }, stage: 'linen' }, built, yr, 0.08, 'standing')
  assert.equal(geometryHash(built), before)
  assert.equal(scene.view.stage, 'linen')
  assert.equal(scene.view.tiltDeg, 24, 'the draped camera')
  let zmax = -Infinity
  for (const s of scene.strokes) for (const ply of s.filaments) for (const q of ply) if (q[2]! > zmax) zmax = q[2]!
  assert.ok(zmax < 40, `draped scene height ${zmax.toFixed(1)}`)
})

if (failures.length) { console.error(`\n${failures.length} failure(s):\n  ${failures.join('\n  ')}`); process.exit(1) }
console.log('\nall drape checks pass')
