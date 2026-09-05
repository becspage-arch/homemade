/**
 * SCRATCH DIAGNOSTIC (not shipped): per-ROW summary of the blo/flo ridge — is the
 * proud loop landing at a consistent height across a row, and what happens on the
 * turned (wrong-side) rows where fz flips? Top-down camera sees +z; anything the
 * relaxer leaves at −z is HIDDEN under the fabric. This tells us whether the ridge
 * is "uneven" because it is alternating onto the back face row-by-row.
 */
import { buildRelaxedSwatch } from '../src/lib/loom/crochet/engine/buildSwatch'
import { ridgeDebugNodes } from '../src/lib/loom/crochet/engine/yarnPath'

const arg = (process.argv[2] ?? 'scblo') as 'scblo' | 'scflo'
const yr = 2.4
const W = 16
const { built } = buildRelaxedSwatch(arg, W, yr)
const ridges = [...ridgeDebugNodes]
const n = built.model.nodes

// group by row j
const byRow = new Map<number, { rz: number; hz: number }[]>()
for (const r of ridges) {
  const rz = n[r.node]!.z / yr
  const hz = n[r.hookNode]!.z / yr
  if (!byRow.has(r.j)) byRow.set(r.j, [])
  byRow.get(r.j)!.push({ rz, hz })
}

// also the max z of the WHOLE fabric per row (what the top camera would actually see)
const stat = (xs: number[]) => {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length)
  return { mean, sd, min: Math.min(...xs), max: Math.max(...xs) }
}

console.log(`${arg}  (z in yarn-radii; top camera sees LARGER z; fabric surface ~ +1..-? )`)
console.log('row | ridgeZ mean±sd (min..max)      | hookedZ mean | ridge visible?')
for (const j of [...byRow.keys()].sort((a, b) => a - b)) {
  const rows = byRow.get(j)!
  const rz = stat(rows.map((r) => r.rz))
  const hz = stat(rows.map((r) => r.hz))
  const visible = rz.mean > hz.mean + 0.3 ? (rz.mean > 0 ? 'YES front' : 'on BACK face (hidden)') : 'no / buried'
  console.log(
    `${String(j).padStart(3)} | ${rz.mean.toFixed(2).padStart(6)}±${rz.sd.toFixed(2)} (${rz.min.toFixed(2)}..${rz.max.toFixed(2)}) | ${hz.mean.toFixed(2).padStart(6)}       | ${visible}`,
  )
}
