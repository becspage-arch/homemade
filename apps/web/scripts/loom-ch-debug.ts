/**
 * SCRATCH DIAGNOSTIC (not shipped): rebuild + relax the chain exactly as the
 * driver does, then print where each stitch's parts settled — fold apex, body
 * legs, crossing legs, back bump — and each loop's rotation about the chain axis.
 */
import { buildContinuous } from '../src/lib/loom/crochet/engine/yarnPath'
import { relax } from '../src/lib/loom/crochet/engine/relax'

const yr = 2.4
const W = 16
const built = buildContinuous([], W, yr)
relax(built.model, {
  collMinDist: yr * 1.0,
  collK: 0.3,
  collAdjacency: 2,
  planeZ: 0,
  planeK: 0.01,
  layoutK: 0,
  floorZ: -yr * 1.6,
  iterations: 400,
})

const n = built.model.nodes
const f = (v: number): string => (v / yr).toFixed(2).padStart(6)
// stitch n (1-based) starts at 11 + (n-1)*15; layout per stitch:
// +0,1 bump | +2,3 cross-up (l1,l2) | +4..12 loop body (apex=+8) | +13,14 cross-down
console.log('st |  apex x,y,z  | upleg y,z | loleg y,z | crossUp y,z | crossDn y,z | bump z | rotX(deg)')
for (let s = 1; s < W; s++) {
  const b = 11 + (s - 1) * 15
  const apex = n[b + 8]!
  const up = n[b + 5]! // body[1] upper leg mid
  const lo = n[b + 11]! // body[7] lower leg mid
  const cu = n[b + 3]!
  const cd = n[b + 13]!
  const bump = n[b + 1]!
  // loop rotation about the chain (x) axis: angle of the upper→lower leg line vs the y axis
  const rot = (Math.atan2(up.z - lo.z, up.y - lo.y) * 180) / Math.PI
  console.log(
    `${String(s).padStart(2)} | ${f(apex.x)},${f(apex.y)},${f(apex.z)} | ${f(up.y)},${f(up.z)} | ${f(lo.y)},${f(lo.z)} | ${f(cu.y)},${f(cu.z)} | ${f(cd.y)},${f(cd.z)} | ${f(bump.z)} | ${rot.toFixed(0)}`,
  )
}
