/**
 * Numeric debug dump for any swatch — the generalised loom-ch-debug pattern.
 * Renders lie; before touching parameters, LOOK AT NUMBERS: per-link settled
 * offsets (hook vs its below-crown / head), per-row-or-round summaries, z
 * layering. Use when a topology-correct build looks wrong, or when the audit
 * fails and you need to see by how much.
 *
 *   cd apps/web && npx tsx scripts/loom-link-debug.ts <swatch> [yarnRadiusMm]
 */

import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { SWATCH_RECIPES } from '../src/lib/loom/crochet/engine/dictionary'

const arg = process.argv[2] ?? ''
if (!isSwatchArg(arg)) {
  console.error(`unknown swatch '${arg}' — known: ${Object.keys(SWATCH_RECIPES).join(', ')}`)
  process.exit(2)
}
const yr = Number(process.argv[3] ?? 2.4)
const recipe = SWATCH_RECIPES[arg]
const { built } = buildRelaxedSwatch(arg, recipe.auditW, yr)
const nodes = built.model.nodes

console.log(`${arg}: ${nodes.length} nodes, ${built.links.length} links, anchorPins=${built.anchorPins}, yr=${yr}`)

// Per-link settled offsets, grouped by row/round.
const byRow = new Map<number, { role: string; dx: number; dy: number; dz: number; c: number }[]>()
for (const l of built.links) {
  const h = nodes[l.hook]!
  const b = nodes[l.below]!
  const rec = {
    role: l.role,
    dx: (h.x - b.x) / yr,
    dy: (h.y - b.y) / yr,
    dz: ((h.z - b.z) * (l.zSign ?? 1)) / yr,
    c: l.c,
  }
  const list = byRow.get(l.j) ?? []
  list.push(rec)
  byRow.set(l.j, list)
}
for (const [j, list] of [...byRow.entries()].sort((a, b) => a[0] - b[0])) {
  const stat = (k: 'dx' | 'dy' | 'dz'): string => {
    const vs = list.map((r) => r[k])
    const mean = vs.reduce((a, v) => a + v, 0) / vs.length
    const worst = vs.reduce((a, v) => (Math.abs(v) > Math.abs(a) ? v : a), 0)
    return `${k} mean ${mean.toFixed(2)} worst ${worst.toFixed(2)}`
  }
  console.log(`  row/round ${j} (${list.length} links, ${list[0]!.role}): ${stat('dx')} | ${stat('dy')} | ${stat('dz')}`)
  // The three worst links by |dx|+|dy| — where the construction is straining.
  const worst = [...list].sort((a, b) => Math.abs(b.dx) + Math.abs(b.dy) - (Math.abs(a.dx) + Math.abs(a.dy))).slice(0, 3)
  for (const w of worst)
    console.log(`      c${w.c}: dx=${w.dx.toFixed(2)} dy=${w.dy.toFixed(2)} dz=${w.dz.toFixed(2)}`)
}

// z layering summary: where the fabric's relief settled.
const free = nodes.filter((n) => n.w > 0)
const zs = free.map((n) => n.z).sort((a, b) => a - b)
const q = (p: number): number => zs[Math.floor(p * (zs.length - 1))]!
console.log(
  `  z (free nodes, yr): min ${(q(0) / yr).toFixed(2)}  p10 ${(q(0.1) / yr).toFixed(2)}  median ${(q(0.5) / yr).toFixed(2)}  p90 ${(q(0.9) / yr).toFixed(2)}  max ${(q(1) / yr).toFixed(2)}`,
)
