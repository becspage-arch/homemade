/**
 * The hung tapestry (staging 'wall'): the stitched panel is only turned
 * upright, and it hangs from a real dowel with a whipstitch, a cord and
 * tassels as render props.
 *
 *   cd apps/web && pnpm exec tsx --test src/lib/loom/crochet/engine/tapestryHang.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildTapestryProgram } from '../../../studio/crochet/tapestry-program'
import { compileRelaxAudit, geometryHash, programScene } from './programScene'
import { hangTapestry } from './tapestryHang'

// A small two-colour chart: a cream ground with a green block in the lower half.
const W = 16
const H = 12
const cells: string[] = []
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) cells.push(y > 6 && x > 3 && x < 12 ? 'leaf' : 'cream')
const program = buildTapestryProgram(
  {
    width: W,
    height: H,
    cells,
    palette: [
      { key: 'cream', name: 'Cream', hex: '#efe6d2', stitches: cells.filter((c) => c === 'cream').length },
      { key: 'leaf', name: 'Leaf', hex: '#74ab4c', stitches: cells.filter((c) => c === 'leaf').length },
    ],
  },
  { name: 'hang-test' },
)
// The wall-hanging lane's own flip (generation/bulk/crochet.ts): the renderer
// puts program row 0 at the top of the picture.
program.grid = [...program.grid!].reverse()
const { built, yr, problems } = compileRelaxAudit(program)
const flat = programScene(program, built, yr, 0.08, 'flatlay')
const hungScene = programScene({ ...program, staging: 'wall' }, built, yr, 0.08, 'wall')
const nPanel = flat.strokes.length

function bounds(pts: number[][]) {
  const mn = [Infinity, Infinity, Infinity]
  const mx = [-Infinity, -Infinity, -Infinity]
  for (const p of pts) for (let k = 0; k < 3; k++) {
    mn[k] = Math.min(mn[k]!, p[k]!)
    mx[k] = Math.max(mx[k]!, p[k]!)
  }
  return { mn, mx }
}
const allPts = (strokes: { filaments: number[][][] }[]) => strokes.flatMap((s) => s.filaments.flat())

test('the chart audits clean and staging does not touch the geometry hash', () => {
  assert.deepEqual(problems, [])
  const again = compileRelaxAudit({ ...program, staging: 'wall' })
  assert.equal(geometryHash(again.built), geometryHash(built))
})

test('the panel is only turned upright: every stitch keeps its colour and shape', () => {
  assert.equal(hungScene.view.stage, 'wall')
  // Same panel strokes first, same colours in the same order.
  assert.deepEqual(hungScene.strokes.slice(0, nPanel).map((s) => s.hex), flat.strokes.map((s) => s.hex))
  // A rigid motion keeps every distance: compare each stroke's first-to-last span
  // and a few chords.
  for (let i = 0; i < nPanel; i++) {
    const a = flat.strokes[i]!.filaments[0]!
    const b = hungScene.strokes[i]!.filaments[0]!
    assert.equal(a.length, b.length)
    for (const [p, q] of [[0, a.length - 1], [0, Math.floor(a.length / 2)], [Math.floor(a.length / 3), a.length - 1]] as const) {
      const da = Math.hypot(a[p]![0]! - a[q]![0]!, a[p]![1]! - a[q]![1]!, a[p]![2]! - a[q]![2]!)
      const db = Math.hypot(b[p]![0]! - b[q]![0]!, b[p]![1]! - b[q]![1]!, b[p]![2]! - b[q]![2]!)
      assert.ok(Math.abs(da - db) < 1e-6, `stroke ${i} changed shape`)
    }
  }
  // Upright: the panel is tall in z (up) and thin in y (toward the camera).
  const pb = bounds(allPts(hungScene.strokes.slice(0, nPanel)))
  assert.ok(pb.mx[2]! - pb.mn[2]! > 5 * (pb.mx[1]! - pb.mn[1]!), 'the panel is not standing up')
  // The flat-lay's picture top (engine low y) is the hung panel's top: the
  // green block sits in the lower half of both.
  const greenZ = allPts(hungScene.strokes.slice(0, nPanel).filter((s) => s.hex === '#74ab4c')).map((p) => p[2]!)
  assert.ok(Math.max(...greenZ) < (pb.mn[2]! + pb.mx[2]!) / 2 + 2 * yr, 'the picture is upside down')
})

test('it hangs from a straight wooden dowel above the top edge, wider than the panel', () => {
  const pb = bounds(allPts(hungScene.strokes.slice(0, nPanel)))
  const dowel = (hungScene.props ?? []).find((p) => 'branch' in p && p.wood)
  assert.ok(dowel && 'branch' in dowel, 'no dowel prop')
  const zs = dowel.branch.map((q) => q[2]!)
  assert.ok(Math.max(...zs) - Math.min(...zs) < 1e-9, 'the dowel is not straight')
  const r = dowel.branch[0]![3]!
  assert.ok(zs[0]! - r > pb.mx[2]!, 'the dowel is not above the top edge')
  assert.ok(dowel.branch[0]![0]! < pb.mn[0]! - 10 && dowel.branch.at(-1)![0]! > pb.mx[0]! + 10, 'no overhang')
})

test('a whipstitch, a cord and tassels are real plied yarn round the dowel and under the panel', () => {
  const extra = hungScene.strokes.slice(nPanel)
  assert.ok(extra.every((s) => s.filaments.length === 3), 'notions must be plied yarn (3 plies)')
  const pb = bounds(allPts(hungScene.strokes.slice(0, nPanel)))
  const dowel = (hungScene.props ?? []).find((p) => 'branch' in p && p.wood) as { branch: number[][] }
  const dz = dowel.branch[0]![2]!
  const r = dowel.branch[0]![3]!
  // The whipstitch (first notion) dips into the top row and goes over the dowel.
  const whip = bounds(extra[0]!.filaments.flat())
  assert.ok(whip.mn[2]! < pb.mx[2]! && whip.mx[2]! > dz + r, 'the whipstitch does not wrap the dowel through the top edge')
  // The cord (second) rises well above the dowel.
  const cord = bounds(extra[1]!.filaments.flat())
  assert.ok(cord.mx[2]! > dz + 30, 'no hanging cord')
  // Tassels: everything else, all below the bottom edge except their loops.
  const tasselPts = extra.slice(2).flatMap((s) => s.filaments.flat())
  const tb = bounds(tasselPts)
  assert.ok(tb.mn[2]! < pb.mn[2]! - 30, 'tassels too short or missing')
  assert.ok(tb.mx[2]! < pb.mn[2]! + 4 * yr, 'a tassel climbs the panel')
})

test('tassel count follows the option, and none means none', () => {
  const panel = flat.strokes
  const three = hangTapestry(panel, yr, { top: '#efe6d2', bottom: '#74ab4c' }, { tassels: 3 })
  const none = hangTapestry(panel, yr, { top: '#efe6d2', bottom: '#74ab4c' }, { tassels: 0 })
  // Each tassel is a loop, its strands and a wrap band, all in the tassel yarn.
  const perTassel = (three.strokes.length - none.strokes.length) / 3
  assert.ok(Number.isInteger(perTassel) && perTassel >= 8, `per tassel ${perTassel}`)
  assert.equal(none.strokes.length, panel.length + 2)
  assert.ok(three.strokes.slice(panel.length + 2).every((s) => s.hex === '#74ab4c'))
})
