/**
 * The nightcap accessory and the yarn pompom (STITCH_ENGINE.md §8h-2):
 * sized from the head, built as a real cone-and-ridge-brim tube, audited,
 * bent as worn, seated on a compiled bunny, pompom at the tip.
 *   cd apps/web && npx tsx src/lib/loom/crochet/engine/hatAccessory.test.ts
 */
import assert from 'node:assert/strict'
import { nightcapBandCount, nightcapProgram, nightcapRounds, wearNightcap } from './hatAccessory'
import { pompomStrandCount, pompomStrokes } from './pompom'
import { bendTube, collapseTube } from './tubeStaging'
import { buildAmigurumiProgram } from './amigurumiPresets'
import { compileComposition } from './composition'
import { compileRelaxAudit } from './programScene'

const failures: string[] = []
function check(name: string, fn: () => void): void {
  try { fn(); console.log(`  ok  ${name}`) } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`); console.log(`FAIL  ${name}`)
  }
}

check('the band count is the head circumference in the hat gauge, even', () => {
  const n = nightcapBandCount(25, 1.3)
  assert.equal(n % 2, 0)
  // 2π(25·0.97 + 1.3·1.6) / (1.3·2.7) ≈ 47 → 48
  assert.ok(n >= 44 && n <= 50, `band ${n}`)
  assert.ok(nightcapBandCount(25, 2.1) < n, 'thicker yarn, fewer stitches')
})
check('the rounds climb +2 from a 6-stitch tip to the band, then hold for the band and the brim', () => {
  const o = { headRadiusMm: 25, colourHex: '#b7a4d8' }
  const r = nightcapRounds(o)
  const N = nightcapBandCount(25, 1.3)
  assert.equal(r[0], 6)
  for (let k = 1; k < r.length; k++) assert.ok(r[k]! - r[k - 1]! === 0 || r[k]! - r[k - 1]! === 2, `round ${k + 1}: ${r[k - 1]} → ${r[k]}`)
  assert.equal(r[r.length - 1], N)
  assert.equal(r.filter((c) => c === N).length, 3 + 4)
  const p = nightcapProgram(o)
  assert.equal(p.tube?.cap, 'cone')
  assert.deepEqual(p.tube?.brim, { kind: 'ridge', rounds: 4, fold: true })
})
check('a small nightcap audits clean at fine and worsted', () => {
  for (const yarnWeight of ['fine', 'worsted'] as const) {
    const p = nightcapProgram({ headRadiusMm: 14, yarnWeight, colourHex: '#b7a4d8' })
    const { problems } = compileRelaxAudit(p)
    assert.deepEqual(problems, [], problems.join(' | '))
  }
})
check('a pompom is a few hundred cut strands of 3 plies each, inside its trimmed radius', () => {
  const n = pompomStrandCount(10, 1.3)
  assert.ok(n > 600 && n < 2000, `${n} strands`)
  const s = pompomStrokes({ centre: { x: 1, y: 2, z: 3 }, radiusMm: 10, yarnRadiusMm: 1.3, colourHex: '#fff', strands: 50, seed: 3 })
  assert.equal(s.length, 50)
  for (const st of s) {
    assert.equal(st.filaments.length, 3)
    for (const ply of st.filaments) for (const p of ply) {
      const d = Math.hypot(p[0]! - 1, p[1]! - 2, p[2]! - 3)
      assert.ok(d <= 10 * 1.12 + 1.3, `ply point ${d.toFixed(1)} mm from the centre`)
    }
  }
  const again = pompomStrokes({ centre: { x: 1, y: 2, z: 3 }, radiusMm: 10, yarnRadiusMm: 1.3, colourHex: '#fff', strands: 50, seed: 3 })
  assert.deepEqual(again[7], s[7], 'deterministic')
})
check('bendTube leaves the part below the start untouched and turns the axis through the angle', () => {
  const pts = []
  for (let z = 0; z <= 100; z += 5) pts.push({ x: 0, y: 0, z }, { x: 3, y: 0, z }, { x: 0, y: 3, z })
  const out = bendTube(pts, { startZ: 40, lengthMm: 30, angleDeg: 90, dirDeg: 0 })
  for (let i = 0; i < pts.length; i++) if (pts[i]!.z <= 40) assert.deepEqual(out[i], pts[i])
  // Axis arclength is preserved: the axis point at z = 100 is 60 mm along the bent curve.
  const top = out[pts.findIndex((p) => p.z === 100 && p.x === 0 && p.y === 0)]!
  assert.ok(top.x > 30 && Math.abs(top.z - 40) < 40, `tip at ${JSON.stringify(top)}`)
  // Past the ramp the heading is horizontal (+x): the last two axis points differ only in x.
  const a = out[pts.findIndex((p) => p.z === 90 && p.x === 0 && p.y === 0)]!
  assert.ok(Math.abs(top.z - a.z) < 0.05 && Math.abs(top.x - a.x - 10) < 0.05, `straight run ${JSON.stringify([a, top])}`)
  // The across offset rides unchanged.
  const across = out[pts.findIndex((p) => p.z === 100 && p.y === 3)]!
  assert.ok(Math.abs(across.y - 3) < 1e-9)
})
check('collapseTube lays a tube doubled on the table: each round keeps its circumference, the crown narrows', () => {
  const pts: { x: number; y: number; z: number }[] = []
  const rr: number[] = []
  // A cone-ish tube: radius 40 at z 0..60, narrowing to 5 at z 100.
  for (let z = 0; z <= 100; z += 4) {
    const R = z <= 60 ? 40 : 40 - ((z - 60) / 40) * 35
    for (let k = 0; k < 48; k++) {
      const th = (k / 48) * Math.PI * 2
      pts.push({ x: R * Math.cos(th), y: R * Math.sin(th), z })
      rr.push(R)
    }
  }
  const out = collapseTube(pts, { foldRadiusMm: 10, yarnRadiusMm: 2, roundRadius: rr })
  // Every point is on or above the table.
  for (const p of out) assert.ok(p.z >= 0, `z ${p.z}`)
  // The body rounds lie as a band about half the circumference wide; the crown round is narrow.
  const width = (z: number): number => {
    const xs = out.filter((_, i) => pts[i]!.z === z).map((p) => p.x)
    return Math.max(...xs) - Math.min(...xs)
  }
  // A flattened loop of fold radius ρ is C/2 − (π − 2)ρ wide.
  assert.ok(Math.abs(width(20) - (Math.PI * 40 - (Math.PI - 2) * 10)) < 4, `body width ${width(20).toFixed(1)}`)
  assert.ok(width(100) < 25, `crown width ${width(100).toFixed(1)}`)
  // Perimeter of the flattened loop equals the round's circumference (adjacent points stay the same distance apart).
  const ring = out.slice(0, 48)
  let per = 0
  for (let k = 0; k < 48; k++) { const a = ring[k]!, b = ring[(k + 1) % 48]!; per += Math.hypot(a.x - b.x, a.z - b.z) }
  assert.ok(Math.abs(per - 2 * Math.PI * 40) / (2 * Math.PI * 40) < 0.03, `perimeter ${per.toFixed(1)}`)
})
check('the nightcap wears on the bunny: clean, seated above the eye line, tail off to the side, pompom at the tip', () => {
  const prog = buildAmigurumiProgram({ base: 'bunny', size: 'S', mainHex: '#f1e6d2', contrastHex: '#e3a9a4', eyeMm: 6, nose: true, paws: true } as never)
  const comp = compileComposition(prog)
  const hat = wearNightcap(comp, 'head', { headRadiusMm: 0, colourHex: '#b7a4d8' })
  assert.deepEqual(hat.problems, [])
  const head = comp.placed.find((p) => p.part.name === 'head')!.bounds
  const hc = { z: (head.minz + head.maxz) / 2, x: (head.minx + head.maxx) / 2 }
  const R = (head.maxx - head.minx) / 2
  assert.ok(hat.tip.z > hc.z - R && hat.tip.z < hc.z + R * 2.2, `tip z ${hat.tip.z.toFixed(1)} vs head centre ${hc.z.toFixed(1)}`)
  assert.ok(Math.abs(hat.tip.x - hc.x) > R * 0.8, `tip x ${hat.tip.x.toFixed(1)} off to the side`)
  assert.equal(hat.strokes.length, 1)
  assert.ok(hat.pompom.length > 100)
  assert.ok(hat.instructions.some((l) => l.startsWith('Make a pompom')))
  assert.ok(hat.instructions.some((l) => l.startsWith('Fold the last 4 rounds')))
})

if (failures.length) { console.error(`\n${failures.length} failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`); process.exit(1) }
console.log('\nAll hat accessory tests pass.')
