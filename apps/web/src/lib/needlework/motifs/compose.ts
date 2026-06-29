/**
 * The composer — turns a bag of placed motif elements into a finished canonical
 * pattern. It collects every coordinate, fits the whole design into a hoop of a
 * given millimetre width (squared so a round hoop frames it), remaps all geometry
 * to millimetres, and assembles the `NeedleworkSurfacePattern` the rest of the
 * pipeline (buildPatternDocument + the loom's renderHero) consumes unchanged.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'
import type { NeedleworkSurfacePattern, NeedleworkFabricSpec } from '../pattern'

export interface ComposeOptions {
  /** Finished hoop WIDTH in millimetres (height follows the squared design). */
  targetWidthMm: number
  /** Fraction of the design's max extent added as a margin. Default 0.08. */
  padFrac?: number
  fabricSpec?: NeedleworkFabricSpec | null
  defaultThread?: { type: string; weight: string } | null
  frameType?: string | null
}

type Pt = [number, number]

const FILL_SLUGS = new Set(['embroidery-satin', 'embroidery-padded-satin', 'embroidery-long-and-short'])

function polyArea(pts: Pt[]): number {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    a += pts[i]![0] * pts[j]![1] - pts[j]![0] * pts[i]![1]
  }
  return Math.abs(a) / 2
}

/**
 * Add a fine outline stitch around each filled shape — a back/stem-stitch line in
 * a darker thread that gives the shape a crisp, defined edge (the way real
 * embroidery reads, vs a soft long-and-short edge that blurs into the cloth). The
 * outline is inserted RIGHT AFTER its shape so later shapes still cover it
 * (occlusion holds in the render). Tiny shapes (knots, specks) are skipped.
 */
export function addOutlines(
  elements: StitchedElement[],
  opts: { colour?: string; minArea?: number; slug?: string } = {},
): StitchedElement[] {
  const colour = opts.colour ?? '#33251a'
  const minArea = opts.minArea ?? 10
  const slug = opts.slug ?? 'embroidery-back'
  const out: StitchedElement[] = []
  for (const el of elements) {
    out.push(el)
    const g = el.geometry
    if (g.kind === 'path' && g.points && g.points.length >= 3 && FILL_SLUGS.has(el.stitchType) && polyArea(g.points) >= minArea) {
      out.push({
        stitchType: slug,
        colourHex: colour,
        thread: el.thread ?? null,
        directionDeg: null,
        geometry: { kind: 'path', points: [...g.points, g.points[0]!] },
      })
    }
  }
  return out
}

function eachPoint(el: StitchedElement, fn: (p: Pt) => void): void {
  const g = el.geometry
  if (g.at) fn(g.at)
  for (const p of g.points ?? []) fn(p)
}

/** Map a design (in author px) into a squared hoop in millimetres. */
export function composePattern(
  elements: StitchedElement[],
  opts: ComposeOptions,
): NeedleworkSurfacePattern {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const el of elements) {
    eachPoint(el, ([x, y]) => {
      // discs extend by their radius — count it so a wheel never clips the edge
      const r = el.geometry.kind === 'disc' ? el.geometry.radiusMm ?? 0 : 0
      if (x - r < minX) minX = x - r
      if (y - r < minY) minY = y - r
      if (x + r > maxX) maxX = x + r
      if (y + r > maxY) maxY = y + r
    })
  }
  const pad = (opts.padFrac ?? 0.08) * Math.max(maxX - minX, maxY - minY)
  minX -= pad
  minY -= pad
  maxX += pad
  maxY += pad
  // square the canvas so the round hoop frames the whole design
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const half = Math.max(maxX - minX, maxY - minY) / 2
  minX = cx - half
  minY = cy - half
  const scale = opts.targetWidthMm / (2 * half)

  const tx = (p: Pt): Pt => [(p[0] - minX) * scale, (p[1] - minY) * scale]

  const mapped: StitchedElement[] = elements.map((el) => {
    const g = el.geometry
    const geometry = {
      ...g,
      ...(g.at ? { at: tx(g.at) } : {}),
      ...(g.points ? { points: g.points.map(tx) } : {}),
      ...(g.kind === 'disc' && g.radiusMm != null ? { radiusMm: g.radiusMm * scale } : {}),
    }
    return { ...el, geometry }
  })

  return {
    stitchedElements: mapped,
    finishedSizeMm: { width: opts.targetWidthMm, height: 2 * half * scale },
    fabricSpec: opts.fabricSpec ?? null,
    defaultThread: opts.defaultThread ?? { type: 'stranded-cotton', weight: '6-strand' },
    frameType: opts.frameType ?? 'HOOP',
  }
}
