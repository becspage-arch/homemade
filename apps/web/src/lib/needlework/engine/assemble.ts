/**
 * Bind classified regions into the loom render contract.
 *
 * Each region's quantised colour is snapped to a real DMC floss (perceptual
 * CIELAB nearest, reusing the floss tables), its geometry is scaled from working
 * px to millimetres, and it becomes one StitchedElement carrying its controlled
 * stitch slug + floss colour + geometry. The same elements drive the hero, the
 * legend and the steps — so all three are the one pattern, by construction.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'
import { nearestFloss } from '../../floss/nearest-floss'
import type { ClassifiedRegion } from './classify'
import type { QuantResult } from './quantize'
import type { FlossUsage } from './types'

function rgbToHex(rgb: [number, number, number]): string {
  const h = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
  return `#${h(rgb[0])}${h(rgb[1])}${h(rgb[2])}`
}

/** Render layer order: fills under, then lines, then wheels, knots on top. */
const ROLE_ORDER: Record<string, number> = { fill: 0, line: 1, wheel: 2, point: 3 }

export interface AssembleOptions {
  mmPerPx: number
  strands: number
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
  defaultThread: { type: string; weight: string }
}

export interface AssembleResult {
  elements: StitchedElement[]
  palette: FlossUsage[]
  /** Parallel to `elements`: the resolved floss + role for legend/steps. */
  bound: BoundElement[]
}

/** A stitched element plus the floss + role metadata the legend/steps need. */
export interface BoundElement {
  element: StitchedElement
  role: ClassifiedRegion['role']
  stitchSlug: string
  stitchName: string
  area: string
  floss: { code: string; name: string; hex: string }
}

export function assemble(
  classified: ClassifiedRegion[],
  quant: QuantResult,
  opts: AssembleOptions,
): AssembleResult {
  const mm = opts.mmPerPx
  const toMm = (p: [number, number]): [number, number] => [p[0] * mm, p[1] * mm]

  // Resolve each cluster colour to a floss once (cache by cluster index).
  const flossByCluster = new Map<number, { code: string; name: string; hex: string }>()
  const flossFor = (cluster: number) => {
    const cached = flossByCluster.get(cluster)
    if (cached) return cached
    const srcHex = rgbToHex(quant.clusters[cluster]!)
    const { entry } = nearestFloss(srcHex, { brand: opts.brand })
    const floss = { code: entry.code, name: entry.name, hex: entry.rgb }
    flossByCluster.set(cluster, floss)
    return floss
  }

  const order = [...classified].sort(
    (a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9),
  )

  const bound: BoundElement[] = []
  const usage = new Map<string, FlossUsage>()

  for (const c of order) {
    const floss = flossFor(c.region.cluster)
    const srcHex = rgbToHex(quant.clusters[c.region.cluster]!)
    let element: StitchedElement
    const g = c.geomPx
    if (g.kind === 'point') {
      element = mk(c, floss.hex, opts, { kind: 'point', at: toMm(g.at) })
    } else if (g.kind === 'wheel') {
      element = mk(c, floss.hex, opts, {
        kind: 'disc',
        at: toMm(g.at),
        radiusMm: g.radiusPx * mm,
      })
    } else {
      // line or fill -> a path
      element = mk(c, floss.hex, opts, { kind: 'path', points: g.points.map(toMm) })
    }
    bound.push({
      element,
      role: c.role,
      stitchSlug: c.stitchSlug,
      stitchName: c.stitchName,
      area: c.area,
      floss,
    })

    const u = usage.get(floss.code)
    if (u) {
      u.elementCount++
    } else {
      usage.set(floss.code, {
        code: floss.code,
        name: floss.name,
        hex: floss.hex,
        sourceHex: srcHex,
        strands: opts.strands,
        elementCount: 1,
      })
    }
  }

  return {
    elements: bound.map((b) => b.element),
    palette: [...usage.values()].sort((a, b) => b.elementCount - a.elementCount),
    bound,
  }
}

function mk(
  c: ClassifiedRegion,
  hex: string,
  opts: AssembleOptions,
  geometry: StitchedElement['geometry'],
): StitchedElement {
  return {
    stitchType: `embroidery-${c.stitchSlug}`,
    colourHex: hex,
    thread: opts.defaultThread,
    directionDeg: c.directionDeg,
    geometry,
  }
}
