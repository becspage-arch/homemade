/**
 * SCRATCH DIAGNOSTIC (not shipped): checks whether the blo/flo ridge boost
 * (nodes[bcOther].z *= 1.7 in yarnPath.ts) actually survives relaxation, or
 * gets crushed back toward the fabric plane by collision/bending — per the
 * skill's "diagnose with numbers, not renders" rule.
 */
import { buildRelaxedSwatch } from '../src/lib/loom/crochet/engine/buildSwatch'
import { ridgeDebugNodes } from '../src/lib/loom/crochet/engine/yarnPath'

const arg = (process.argv[2] ?? 'scblo') as 'scblo' | 'scflo'
const yr = 2.4
const W = 16
const { built } = buildRelaxedSwatch(arg, W, yr)
const ridges = [...ridgeDebugNodes] // snapshot before any later build clears it
const n = built.model.nodes

console.log(`${arg}: ${ridges.length} ridge nodes recorded`)
console.log('j  c  | ridgeZ/yr | hookedLoopZ/yr | |ridge-hook|/yr')
for (const r of ridges.slice(0, 20)) {
  const rz = n[r.node]!.z / yr
  const hz = n[r.hookNode]!.z / yr
  console.log(
    `${String(r.j).padStart(2)} ${String(r.c).padStart(2)} | ${rz.toFixed(3).padStart(9)} | ${hz.toFixed(3).padStart(14)} | ${Math.abs(rz - hz).toFixed(3)}`,
  )
}
const avgGap = ridges.reduce((s, r) => s + Math.abs(n[r.node]!.z - n[r.hookNode]!.z), 0) / (ridges.length * yr)
console.log(`avg |ridge - hooked loop| gap = ${avgGap.toFixed(3)} yr (yarn diameter = 2 yr; need a good fraction of that to read as a distinct ridge)`)
