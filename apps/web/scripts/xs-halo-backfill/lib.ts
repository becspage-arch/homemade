/**
 * xs-halo-backfill helpers: take a stored chart back to how it stood straight
 * after the bare-fabric clear, and put the outline and fractionals back the way
 * the converter does. Pure: no Prisma, no network. Tested in lib.test.ts.
 */
import type { PatternData, PatternCell } from '@homemade/db'
import { embellishChart } from '@/lib/studio/generation/bulk/outline'
import { deriveFractionals, smoothingWantedFor } from '@/lib/studio/generation/bulk/fractionals'
import { QUICK_STYLE } from '@/lib/studio/generation/bulk/cross-stitch-style'

export interface GenMeta {
  brief?: { lane?: string; shelf?: string; sat?: number }
  style?: string
  haloPeel?: unknown
  [k: string]: unknown
}

/** Take the outline and the fractionals off: the chart as it stood after the clear. */
export function unembellish(d: PatternData): PatternData {
  const restored: PatternCell[] = [...d.grid.cells]
  for (const f of d.grid.fractional) if (f.k === 'threeQuarter') restored.push({ x: f.x, y: f.y, s: f.s })
  restored.sort((a, b) => a.y - b.y || a.x - b.x)
  const used = new Set(restored.map((c) => c.s))
  for (const b of d.grid.beads) used.add(b.s)
  return {
    ...d,
    grid: { ...d.grid, cells: restored, backstitch: [], frenchKnots: [], fractional: [] },
    palette: d.palette.filter((p) => used.has(p.symbol)),
  }
}

/** The converter's own order after the clear: outline, then fractionals. */
export function reembellish(d: PatternData, gm: GenMeta): PatternData {
  const lane = gm.brief?.lane ?? null
  // The converter draws the quick lane in its own look whatever style the brief
  // named (bulk/cross-stitch.ts: QUICK_LANE -> QUICK_STYLE), and the outline
  // mode follows that look, so the re-derivation has to as well.
  const ctx = { lane, style: lane === 'quick' ? QUICK_STYLE : (gm.style ?? null), shelf: gm.brief?.shelf ?? null }
  let out = embellishChart(d, { lane: ctx.lane, style: ctx.style }).data
  if (smoothingWantedFor(out, { lane: ctx.lane, shelf: ctx.shelf }).yes) {
    const sm = deriveFractionals(out)
    if (sm.cellsShared > 0) out = sm.data
  }
  return out
}

/** Same stitches in the same colours, whatever order and symbols they are stored in. */
export function sameChart(a: PatternData, b: PatternData): boolean {
  const code = (d: PatternData) => new Map(d.palette.map((p) => [p.symbol, `${p.brand}:${p.code}`]))
  const ca = code(a)
  const cb = code(b)
  const cells = (d: PatternData, c: Map<string, string>) => d.grid.cells.map((x) => `${x.x},${x.y},${c.get(x.s)}`).sort().join('|')
  const lines = (d: PatternData, c: Map<string, string>) => d.grid.backstitch.map((x) => `${x.x1},${x.y1},${x.x2},${x.y2},${c.get(x.s)}`).sort().join('|')
  const fr = (d: PatternData, c: Map<string, string>) => d.grid.fractional.map((x) => `${x.x},${x.y},${x.q},${x.k},${c.get(x.s)}`).sort().join('|')
  return cells(a, ca) === cells(b, cb) && lines(a, ca) === lines(b, cb) && fr(a, ca) === fr(b, cb)
}

