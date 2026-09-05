/**
 * Geometry hash of every swatch in the dictionary — the refactor/merge
 * regression guard. Run it on both sides of any engine refactor, rebase, or
 * merge and diff the JSON: a locked stitch whose hash moved has CHANGED
 * GEOMETRY and needs Rebecca's re-verification, no matter how innocent the
 * code change looked. (This is how the emitPlainStitch extraction and the
 * library-branch rebase were both verified bit-identical.)
 *
 *   cd apps/web && npx tsx scripts/loom-geom-hash.ts > before.json
 *   ...change code...
 *   cd apps/web && npx tsx scripts/loom-geom-hash.ts > after.json && diff before.json after.json
 */
import { createHash } from 'node:crypto'
import { buildRelaxedSwatch } from '../src/lib/loom/crochet/engine/buildSwatch'
import { SWATCH_RECIPES, type SwatchArg } from '../src/lib/loom/crochet/engine/dictionary'

const out: Record<string, { nodes: number; links: number; hash: string }> = {}
for (const arg of Object.keys(SWATCH_RECIPES) as SwatchArg[]) {
  const { built } = buildRelaxedSwatch(arg, SWATCH_RECIPES[arg].auditW, 2.4)
  const h = createHash('sha256')
  for (const n of built.model.nodes) h.update(`${n.x.toFixed(9)},${n.y.toFixed(9)},${n.z.toFixed(9)},${n.w};`)
  out[arg] = { nodes: built.model.nodes.length, links: built.links.length, hash: h.digest('hex').slice(0, 16) }
}
console.log(JSON.stringify(out, null, 1))
