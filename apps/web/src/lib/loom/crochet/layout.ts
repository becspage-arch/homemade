/**
 * Lay the Aspen Throw's hdc-blo stitches out in space.
 *
 * The blanket is worked corner-to-corner, so the ROWS run on the diagonal and
 * the blo ridge (and therefore the ribbing) runs at ~45 degrees across the
 * finished rectangle — exactly what the hero photo shows. We tile stitch cells
 * on a lattice whose row axis is the +45 degree diagonal, then clip to the
 * blanket's real outline (a 42" x 50" rectangle at gauge). The increases /
 * decreases in the pattern are what give that rectangle its straight edges; we
 * reproduce the silhouette directly (a rectangle) and fill it with the exact
 * hdc-blo stitch, at the exact gauge — every stitch in the field is the real one.
 */

import type { Vec2 } from '../core/vec'
import { ASPEN_GAUGE } from './aspenProgram'
import { hdcBloStitch, fringeTassel, type CrochetCell } from './loop'
import type { ThreadStroke } from '../render/thread'

const MM_PER_INCH = 25.4

export interface LayoutResult {
  strokes: ThreadStroke[]
  widthMm: number
  heightMm: number
  stitchCount: number
}

export interface LayoutOptions {
  /** Yarn colour (defaults to the sampled hero cream). */
  hex?: string
  /** Strand/ply count of the bundle (lower for big pulled-back views = lighter). */
  strands?: number
  /** Add fringe to the two short ends. */
  fringe?: boolean
  /** Render only a close-up patch this many stitches wide x rows tall (centred). */
  patch?: { stitches: number; rows: number }
  /** Stray fuzz fibres per stitch (the wool halo) — worth it at swatch zoom. */
  fuzz?: number
  /**
   * Coarsen the gauge by this factor for the full-blanket view (the true 42x50
   * gauge is ~14k stitches — too much yarn geometry for one Blender scene). A
   * value of ~2 keeps the true proportion + diagonal rib + fringe while bringing
   * the stitch count into a renderable range. 1 = true gauge. Patch mode ignores
   * this (it's already a small region at true gauge).
   */
  gaugeScale?: number
}

/** Rotate a unit vector by +45 degrees (the diagonal row direction). */
const ROW_DIR: Vec2 = { x: Math.SQRT1_2, y: Math.SQRT1_2 } // up-right (y-down space)
const BUILD_DIR: Vec2 = { x: -Math.SQRT1_2, y: Math.SQRT1_2 } // perpendicular

export function layoutAspen(options: LayoutOptions = {}): LayoutResult {
  const hex = options.hex ?? ASPEN_GAUGE.colourHex
  const strands = options.strands ?? 4

  const gscale = options.patch ? 1 : options.gaugeScale ?? 1
  const swMm = (MM_PER_INCH / ASPEN_GAUGE.stitchesPerInch) * gscale // stitch width
  const rhMm = (MM_PER_INCH / ASPEN_GAUGE.rowsPerInch) * gscale // row height
  const yarnRadiusMm = (swMm * 0.5) * 1.06 // yarn nearly fills the cell (chunky)

  const strokes: ThreadStroke[] = []
  let stitchCount = 0

  if (options.patch) {
    // A clean rectangular swatch in stitch-space, with the rib on the diagonal.
    // Centre it on the origin; size the canvas to the rotated extent.
    const { stitches, rows } = options.patch
    const half = (n: number) => (n - 1) / 2
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    const cells: CrochetCell[] = []
    for (let r = 0; r < rows; r++) {
      // Half-stitch stagger per row so each row's legs nest between the heads of
      // the row below — exactly how crochet loops interlock.
      const stagger = (r % 2) * 0.5
      for (let s = 0; s < stitches; s++) {
        const u = (s - half(stitches) + stagger) * swMm
        const v = (r - half(rows)) * rhMm
        const center: Vec2 = {
          x: ROW_DIR.x * u + BUILD_DIR.x * v,
          y: ROW_DIR.y * u + BUILD_DIR.y * v,
        }
        minX = Math.min(minX, center.x)
        maxX = Math.max(maxX, center.x)
        minY = Math.min(minY, center.y)
        maxY = Math.max(maxY, center.y)
        cells.push({
          center,
          rowDir: ROW_DIR,
          buildDir: BUILD_DIR,
          widthMm: swMm,
          heightMm: rhMm,
          yarnRadiusMm,
          hex,
          seed: r * 131.5 + s * 7.31 + 0.123,
          strands,
          fuzz: options.fuzz,
        })
      }
    }
    for (const cell of cells) {
      strokes.push(...hdcBloStitch(cell))
      stitchCount++
    }
    const pad = swMm * 1.5
    return {
      strokes,
      widthMm: maxX - minX + pad * 2,
      heightMm: maxY - minY + pad * 2,
      stitchCount,
    }
  }

  // ---- Full blanket: fill the 42 x 50 rectangle with diagonal-rib stitches. ----
  const widthMm = ASPEN_GAUGE.widthInch * MM_PER_INCH
  const heightMm = ASPEN_GAUGE.lengthInch * MM_PER_INCH
  const halfW = widthMm / 2
  const halfH = heightMm / 2
  const inside = (p: Vec2): boolean => Math.abs(p.x) <= halfW && Math.abs(p.y) <= halfH

  // Lattice bounds large enough that the rotated grid covers the whole rectangle.
  const diag = Math.hypot(widthMm, heightMm)
  const uMax = Math.ceil(diag / swMm) + 2
  const vMax = Math.ceil(diag / rhMm) + 2
  for (let vi = -vMax; vi <= vMax; vi++) {
    const stagger = ((vi % 2) + 2) % 2 === 1 ? 0.5 : 0
    for (let ui = -uMax; ui <= uMax; ui++) {
      const u = (ui + stagger) * swMm
      const v = vi * rhMm
      const center: Vec2 = {
        x: ROW_DIR.x * u + BUILD_DIR.x * v,
        y: ROW_DIR.y * u + BUILD_DIR.y * v,
      }
      if (!inside(center)) continue
      strokes.push(
        ...hdcBloStitch({
          center,
          rowDir: ROW_DIR,
          buildDir: BUILD_DIR,
          widthMm: swMm,
          heightMm: rhMm,
          yarnRadiusMm,
          hex,
          seed: vi * 131.5 + ui * 7.31 + 0.123,
          strands,
        }),
      )
      stitchCount++
    }
  }

  if (options.fringe) {
    // Fringe hangs off the two short (top + bottom, 42"-wide) ends. Dense doubled
    // tassels so the band reads clearly (the real throw's fringe is full).
    const tasselGapMm = swMm * 0.9
    const nT = Math.floor(widthMm / tasselGapMm)
    const fringeLen = 5.5 * MM_PER_INCH
    for (let i = 0; i <= nT; i++) {
      const x = -halfW + (i / nT) * widthMm
      // bottom end: hang down (+y in y-down space)
      strokes.push(
        ...fringeTassel({ x, y: halfH }, { x: 0, y: 1 }, fringeLen, 5, hex, x * 0.7 + 11, yarnRadiusMm),
      )
      // top end: hang up (-y)
      strokes.push(
        ...fringeTassel({ x, y: -halfH }, { x: 0, y: -1 }, fringeLen, 5, hex, x * 0.7 + 53, yarnRadiusMm),
      )
    }
  }

  return {
    strokes,
    widthMm: widthMm + (options.fringe ? 8 * MM_PER_INCH : MM_PER_INCH),
    heightMm: heightMm + (options.fringe ? 8 * MM_PER_INCH + 40 : MM_PER_INCH),
    stitchCount,
  }
}
