/**
 * Photo → TAPESTRY CROCHET program.
 *
 * Tapestry crochet is single crochet worked flat, carrying the unused yarns
 * inside the stitches and changing colour cell by cell, so a picture becomes a
 * grid of coloured stitches. That maps exactly onto the loom's `grid` form:
 * every row is `gridWidth` single crochet, and `GridRow.cellColours` carries the
 * per-cell palette key the renderer already understands.
 *
 * Pure module (no sharp, no Node built-ins) so both the server converter and the
 * Studio panel can use it.
 *
 * ROW ORDER. A picture is described from the top down; a crochet chart is worked
 * from the bottom up. `buildTapestryProgram` flips the picture so program row 0
 * is the bottom row of the finished piece, which is the row the maker works
 * first.
 *
 * SIZE. The declared `finishedSizeMm` is never guessed here. The save route
 * compiles the program through `compileRelaxAudit` and reads the SETTLED size
 * off the relaxed geometry, then calls `declareSettledSize` with it, so the
 * declared size, the written gauge line and the rendered hero all describe the
 * same piece (the size-consistency gate, STITCH_ENGINE §8e-3).
 */

import type { CrochetProgram, GridRow, YarnWeight } from '@/lib/loom/crochet/engine/program'

/** One yarn in the finished piece. `key` indexes the program palette. */
export interface TapestryColour {
  key: string
  /** Plain yarn shade name ("Sage", "Terracotta") — yarn, not floss. */
  name: string
  hex: string
  /** How many stitches are worked in this colour. */
  stitches: number
}

/** The converted picture: one palette key per stitch, read from the TOP down. */
export interface TapestryGrid {
  width: number
  height: number
  /** Palette keys, row-major, first row = the top of the picture. */
  cells: string[]
  palette: TapestryColour[]
}

// ── The size cap ───────────────────────────────────────────────────────────
// Compiling a grid runs the real relaxation over every stitch, so the cost
// scales with the stitch COUNT. Measured on a four-core box (worsted, sc):
//   20 x 20 =  400 sts →  4.5 s      40 x 40 = 1600 sts → 22.2 s
//   30 x 30 =  900 sts → 11.3 s      50 x 50 = 2500 sts → 38.8 s
// Roughly 11 ms a stitch, near enough linear. The relaxation is single
// threaded and the web task runs at half a vCPU, so budget about double that
// on the server: 700 stitches lands near fifteen seconds, which leaves real
// headroom under the load balancer's timeout. That is the cap. The per-side
// limits stop a 3 x 200 sliver from slipping through it.
export const TAPESTRY_MAX_CELLS = 700
export const TAPESTRY_MIN_SIDE = 10
export const TAPESTRY_MAX_WIDTH = 40
export const TAPESTRY_MAX_HEIGHT = 60
export const TAPESTRY_MIN_COLOURS = 2
export const TAPESTRY_MAX_COLOURS = 8

/** Plain-English reason the requested size will not work, or null. */
export function tapestrySizeProblem(width: number, height: number): string | null {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return 'Give the width and height as whole numbers of stitches.'
  }
  if (width < TAPESTRY_MIN_SIDE || height < TAPESTRY_MIN_SIDE) {
    return `Keep both sides to at least ${TAPESTRY_MIN_SIDE} stitches.`
  }
  if (width > TAPESTRY_MAX_WIDTH) return `Keep the width to ${TAPESTRY_MAX_WIDTH} stitches or fewer.`
  if (height > TAPESTRY_MAX_HEIGHT) return `Keep the height to ${TAPESTRY_MAX_HEIGHT} rows or fewer.`
  if (width * height > TAPESTRY_MAX_CELLS) {
    return `That comes to ${width * height} stitches. Keep it to ${TAPESTRY_MAX_CELLS} or fewer so the pattern builds while you wait.`
  }
  return null
}

export interface BuildTapestryOptions {
  name: string
  yarnWeight?: YarnWeight
  hookMm?: number
  notes?: string
}

/**
 * Grid of palette keys (top-down) → a stitchable `CrochetProgram`.
 * Single crochet throughout; the colour changes cell by cell.
 */
export function buildTapestryProgram(
  grid: TapestryGrid,
  options: BuildTapestryOptions,
): CrochetProgram {
  const { width, height, cells } = grid
  if (cells.length !== width * height) {
    throw new Error(`tapestry grid is ${cells.length} cells but ${width} x ${height} was declared`)
  }
  const palette: Record<string, string> = {}
  for (const c of grid.palette) palette[c.key] = c.hex

  const rows: GridRow[] = []
  for (let j = 0; j < height; j++) {
    // Program row 0 is the BOTTOM of the picture — the row worked first.
    const pictureRow = height - 1 - j
    const cellColours = cells.slice(pictureRow * width, pictureRow * width + width)
    rows.push({
      stitches: Array.from({ length: width }, () => 'sc' as const),
      cellColours,
    })
  }

  return {
    name: options.name,
    form: 'grid',
    grid: rows,
    gridWidth: width,
    yarnWeight: options.yarnWeight ?? 'worsted',
    hookMm: options.hookMm ?? 4,
    colourHex: grid.palette[0]?.hex ?? '#c98a5e',
    palette,
    notes: options.notes,
  }
}

/** Read the per-cell palette keys back out of a program, top-down, so a stored
 *  program can be shown as the picture it came from. The inverse of the row flip
 *  in `buildTapestryProgram`. */
export function tapestryCellsFromProgram(p: CrochetProgram): string[] | null {
  if (p.form !== 'grid' || !p.grid || !p.gridWidth) return null
  const out: string[] = []
  for (let j = p.grid.length - 1; j >= 0; j--) {
    const row = p.grid[j]
    if (!row?.cellColours || row.cellColours.length !== p.gridWidth) return null
    out.push(...row.cellColours)
  }
  return out
}

/**
 * Stamp the SETTLED size onto the program, plus the gauge line that follows
 * from it. Call this with the size measured off the relaxed geometry.
 */
export function declareSettledSize(
  p: CrochetProgram,
  settled: { width: number; height: number },
): CrochetProgram {
  const w = p.gridWidth ?? 1
  const h = p.grid?.length ?? 1
  const perStitch = settled.width / w
  const perRow = settled.height / h
  const stitchesPer10cm = Math.max(1, Math.round(100 / perStitch))
  const rowsPer10cm = Math.max(1, Math.round(100 / perRow))
  return {
    ...p,
    finishedSizeMm: { width: Math.round(settled.width), height: Math.round(settled.height) },
    gaugeText: `${stitchesPer10cm} dc x ${rowsPer10cm} rows = 10 cm in tapestry single crochet (UK terms)`,
  }
}

/** Finished size as the sentence the pattern page shows. */
export function finishedSizeText(settled: { width: number; height: number }): string {
  return `${(settled.width / 10).toFixed(1)} x ${(settled.height / 10).toFixed(1)} cm`
}
