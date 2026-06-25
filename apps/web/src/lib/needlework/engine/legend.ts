/**
 * Build the printable stitch legend from the bound elements. One row per
 * (floss colour x stitch) group, each given a symbol the template marks. This
 * is the region -> strand -> colour -> stitch map the stitcher works from, and
 * it is derived from the SAME elements the hero renders — never a parallel list.
 */

import type { BoundElement } from './assemble'
import type { LegendRow } from './types'

const SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/** Worked order: fills first, then lines, then wheels, knots last. */
const ROLE_ORDER: Record<string, number> = { fill: 0, line: 1, wheel: 2, point: 3 }

export function buildLegend(bound: BoundElement[], strands: number): LegendRow[] {
  const groups = new Map<string, { items: BoundElement[]; sample: BoundElement }>()
  for (const b of bound) {
    const key = `${b.floss.code}|${b.stitchSlug}`
    const g = groups.get(key)
    if (g) g.items.push(b)
    else groups.set(key, { items: [b], sample: b })
  }

  const ordered = [...groups.values()].sort((a, b) => {
    const ra = ROLE_ORDER[a.sample.role] ?? 9
    const rb = ROLE_ORDER[b.sample.role] ?? 9
    if (ra !== rb) return ra - rb
    return b.items.length - a.items.length
  })

  return ordered.map((g, i) => ({
    symbol: SYMBOLS[i] ?? `#${i + 1}`,
    code: g.sample.floss.code,
    name: g.sample.floss.name,
    hex: g.sample.floss.hex,
    strands,
    stitchSlug: `embroidery-${g.sample.stitchSlug}`,
    stitchName: g.sample.stitchName,
    area: g.sample.area,
    count: g.items.length,
  }))
}
