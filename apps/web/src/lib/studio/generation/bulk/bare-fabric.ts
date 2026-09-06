/**
 * BARE FABRIC — stop stitching white backgrounds.
 *
 * A printed proof of `b07032021-cute-baby-tortoise` (9 colours, 112x112) came
 * back with the whole background stitched in DMC B5200: 8,007 stitches of white
 * floss on white aida, 64% of the chart. Nobody stitches that. Every best-selling
 * kit leaves the ground bare and lets the cloth be the cloth — it is faster,
 * cheaper in floss, and it looks better, because a hand-stitched white block is
 * never as flat and even as the fabric it sits on.
 *
 * The old catalogue was converted with `backgroundRemoval: false`, so the
 * quantiser dutifully assigned a floss to every pixel of the Flux image's "clean
 * white background" prompt. This module is the fix, and it is deliberately a
 * PURE function over the chart: no image, no model, no judgement. Given a
 * PatternData it decides, in a way that can be tested on synthetic grids and
 * replayed on any row, which cells are background and which are design.
 *
 * The method is a flood fill inwards from the grid border through near-white
 * cells and bare fabric. That single mechanic gets the three cases right:
 *
 *   background   white that touches the edge of the chart, with nothing between
 *                it and the outside. Cleared.
 *   framed       white inside a stitched border (Delft, blackwork, a sampler
 *                frame) — the fill cannot cross the frame, so the ground the
 *                design is drawn ON survives. Kept.
 *   interior     a white cat, a highlight in an eye, the foam on a wave — walled
 *                in by the design itself. Kept.
 *
 * The fill alone is not enough, and the first proof run said so: a full-bleed
 * painted scene whose white CLOUDS happen to touch the top edge lets the fill in,
 * and it eats the sky. So the rule also asks whether the white goes ROUND the
 * design (MIN_OPEN_PERIMETER) — a background surrounds a piece; a cloud sits in
 * one. Full-coverage work is exempt outright on top of that: the showpiece tier
 * is stitched edge to edge on purpose and a bare patch in it would be a fault.
 *
 * Pure: no `server-only`, no Prisma, no sharp. The bulk converter, the backfill
 * script and the tests all call the same three functions — `scanBackground`
 * measures, `bareFabricVerdict` decides, `clearBackground` rewrites.
 */

import type { PatternData, PaletteEntry } from '@homemade/db'
import { rgbToLab } from '@/lib/floss/equivalence-table'

// ───────────────────────────────────────────────────────────────────────────
// What counts as "white"
// ───────────────────────────────────────────────────────────────────────────

/**
 * Lightness floor for a near-white floss. B5200 is L=100, Blanc 99, Winter
 * White 3865 sits at 99, DMC 762 (the palest grey) at 92 and Ecru at 97 — so
 * the line has to be drawn on chroma as well as lightness, below.
 */
export const NEAR_WHITE_MIN_L = 94

/**
 * Chroma ceiling. Ecru (#fff7e7, chroma ~9) and Off White 746 (#faf2d5, chroma
 * ~17) are warm design colours a stitcher chooses on purpose — a cream ground,
 * an ivory petal — and they are NOT the "clean white background" fault. Only a
 * genuinely colourless white is background.
 */
export const NEAR_WHITE_MAX_CHROMA = 6

/**
 * Explicit white floss codes, per brand. Belt and braces beside the Lab test:
 * a palette entry carrying one of these codes is white whatever rgb the row
 * happens to store (some early imported rows carry approximate hexes).
 */
const WHITE_CODES: Record<string, ReadonlySet<string>> = {
  DMC: new Set(['B5200', 'BLANC', 'WHITE', '3865']),
  ANCHOR: new Set(['1', '2', '926']),
  MADEIRA: new Set(['2401', '2402', '2403']),
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m?.[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

/** Is this palette entry a near-white — i.e. background floss, not a design colour? */
export function isNearWhite(entry: Pick<PaletteEntry, 'brand' | 'code' | 'rgb'>): boolean {
  if (WHITE_CODES[entry.brand]?.has(entry.code.trim().toUpperCase())) return true
  const [r, g, b] = hexToRgb(entry.rgb)
  const [L, a, bb] = rgbToLab(r, g, b)
  return L >= NEAR_WHITE_MIN_L && Math.sqrt(a * a + bb * bb) <= NEAR_WHITE_MAX_CHROMA
}

// ───────────────────────────────────────────────────────────────────────────
// The scan
// ───────────────────────────────────────────────────────────────────────────

export interface BackgroundScan {
  widthCells: number
  heightCells: number
  /** width x height — every cell position, stitched or not. */
  gridCells: number
  /** Cells carrying a stitch. */
  stitchedCells: number
  colourCount: number
  /** Palette symbols that are near-white floss. */
  nearWhiteSymbols: string[]
  /** All near-white stitches, wherever they are. */
  nearWhiteCells: number
  /** Near-white stitches the fill reached from the border — the background. */
  borderWhiteCells: number
  /** Near-white stitches walled in by the design or a frame — always kept. */
  interiorWhiteCells: number
  /** borderWhiteCells / gridCells. The number the rule is cut on. */
  borderWhiteShare: number
  /** Cells on the four edges of the grid: 2w + 2h - 4. */
  perimeterCells: number
  /** Edge cells that are bare fabric or near-white — i.e. not stitched design. */
  openPerimeterCells: number
  /** openPerimeterCells / perimeterCells. Does the white go all the way round? */
  openPerimeterShare: number
  /** stitchedCells / gridCells. */
  coverage: number
  /** (stitchedCells - nearWhiteCells) / gridCells — coverage in real colour. */
  nonWhiteCoverage: number
}

/** Flat index of a cell. */
function idx(x: number, y: number, width: number): number {
  return y * width + x
}

/**
 * Flood fill inwards from every border cell, through bare fabric and near-white
 * stitches alike, and return the flat indices of the near-white STITCHES it
 * reached.
 *
 * Four-connectivity, not eight, and that is load-bearing: a diagonal outline is
 * drawn as a staircase of cells, and an eight-connected fill would squeeze
 * between two of its steps and eat the design's interior. Four-connectivity
 * treats a one-cell staircase as the wall a stitcher sees.
 */
function borderConnectedWhite(
  width: number,
  height: number,
  symbolAt: Map<number, string>,
  nearWhite: ReadonlySet<string>,
): Set<number> {
  const seen = new Uint8Array(width * height)
  const found = new Set<number>()
  const stack: number[] = []

  const push = (x: number, y: number): void => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const i = idx(x, y, width)
    if (seen[i]) return
    const sym = symbolAt.get(i)
    // A stitch in a real colour is a wall. Bare fabric and white are open.
    if (sym !== undefined && !nearWhite.has(sym)) return
    seen[i] = 1
    if (sym !== undefined) found.add(i)
    stack.push(i)
  }

  for (let x = 0; x < width; x++) {
    push(x, 0)
    push(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    push(0, y)
    push(width - 1, y)
  }

  while (stack.length > 0) {
    const i = stack.pop()!
    const x = i % width
    const y = (i - x) / width
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }

  return found
}

/** Measure the white background of one chart. Read-only — never mutates the chart. */
export function scanBackground(data: PatternData): BackgroundScan {
  const { width, height, cells } = data.grid
  const gridCells = width * height

  const nearWhite = new Set(data.palette.filter(isNearWhite).map((p) => p.symbol))
  const symbolAt = new Map<number, string>()
  for (const c of cells) symbolAt.set(idx(c.x, c.y, width), c.s)

  let nearWhiteCells = 0
  for (const c of cells) if (nearWhite.has(c.s)) nearWhiteCells++

  const border = nearWhite.size === 0 ? new Set<number>() : borderConnectedWhite(width, height, symbolAt, nearWhite)

  // How much of the chart's own edge is NOT stitched design. A real background
  // goes round the piece; a white sky along one edge of a full-bleed scene does
  // not. See MIN_OPEN_PERIMETER.
  const open = (x: number, y: number): boolean => {
    const sym = symbolAt.get(idx(x, y, width))
    return sym === undefined || nearWhite.has(sym)
  }
  let perimeterCells = 0
  let openPerimeterCells = 0
  for (let x = 0; x < width; x++) {
    perimeterCells++
    if (open(x, 0)) openPerimeterCells++
    if (height > 1) {
      perimeterCells++
      if (open(x, height - 1)) openPerimeterCells++
    }
  }
  for (let y = 1; y < height - 1; y++) {
    perimeterCells++
    if (open(0, y)) openPerimeterCells++
    if (width > 1) {
      perimeterCells++
      if (open(width - 1, y)) openPerimeterCells++
    }
  }

  return {
    widthCells: width,
    heightCells: height,
    gridCells,
    stitchedCells: cells.length,
    colourCount: data.palette.length,
    nearWhiteSymbols: [...nearWhite].sort(),
    nearWhiteCells,
    borderWhiteCells: border.size,
    interiorWhiteCells: nearWhiteCells - border.size,
    borderWhiteShare: gridCells > 0 ? border.size / gridCells : 0,
    perimeterCells,
    openPerimeterCells,
    openPerimeterShare: perimeterCells > 0 ? openPerimeterCells / perimeterCells : 0,
    coverage: gridCells > 0 ? cells.length / gridCells : 0,
    nonWhiteCoverage: gridCells > 0 ? (cells.length - nearWhiteCells) / gridCells : 0,
  }
}

// ───────────────────────────────────────────────────────────────────────────
// The rule
// ───────────────────────────────────────────────────────────────────────────

/**
 * Below this share of the grid, a border-connected white region is a corner of
 * sky or a bit of edge highlight, not a background worth rewriting the chart
 * for. At 8% of a 112x112 chart that is still a thousand stitches saved.
 */
export const MIN_BACKGROUND_SHARE = 0.08

/** At or above this colour count, the piece is showpiece tier: full coverage by design. */
export const FULL_COVERAGE_COLOURS = 60

/** At or above this coverage in real colour, the piece is already stitched edge to edge. */
export const FULL_COVERAGE_SHARE = 0.92

/**
 * A background has to actually go round the design.
 *
 * This is the guard the first proof run needed. `apb-land-coastal-lighthouse` is
 * a full-bleed painted scene — blue sky, sea, rock, stitched corner to corner —
 * whose white CLOUDS happen to touch the top edge of the chart. The flood fill
 * walked in through them and ate the clouds, leaving a bare hole in the sky. The
 * clouds are 9% of the grid, so the share test alone waved it through.
 *
 * What separates that from the tortoise is not how much white there is but WHERE
 * it is: the tortoise's white runs all the way round the piece, and the
 * lighthouse's white is one patch on one edge. So the rule asks how much of the
 * chart's own perimeter is bare fabric or white — how much of the edge is not
 * design. Below this, the white is part of the picture, not the ground it sits on.
 *
 * Calibrated by eye against the live catalogue at three settings. The number has
 * to sit above the full-bleed scenes and below the framed pieces:
 *
 *   0.002  apb-land-coastal-lighthouse  full-bleed scene, white clouds     EXCLUDE
 *   0.06   lavender-field-receding      full-bleed, white haze band        EXCLUDE
 *   0.13   scene-penguin-postman        full-bleed snow scene              EXCLUDE
 *   0.18   apm-london-big-ben-fog       full-bleed, white fog IS the piece EXCLUDE
 *   0.26   apa-delft-fox-reading        blue on white, floral corners      CONVERT
 *   0.29   apn-mono-delft-bird          blue on white, corner motifs       CONVERT
 *   0.32   apm-blackwork-geometric-tile black on white, edge-to-edge motif CONVERT
 *   0.48   bigscene-hedgehog-teaparty   white sky above a garden           CONVERT
 *   1.00   b07032021-cute-baby-tortoise the fault this job started on      CONVERT
 *
 * At 0.6 the whole Delft and blackwork shelf was wrongly held back; at 0.25 the
 * scenes are safe and the framed pieces convert. 32 rows sit below it.
 */
export const MIN_OPEN_PERIMETER = 0.25

export interface BareFabricOptions {
  /**
   * The piece is full coverage BY INTENT and must never be cleared, whatever the
   * grid says — the dense lane, and the large scene / showpiece / landscape
   * styles. The chart alone cannot always tell a deliberate white sky from an
   * accidental white void, so where the brief that made the row is on record,
   * it wins.
   */
  fullCoverageByIntent?: boolean
}

export interface BareFabricVerdict {
  /** Binary: rewrite this chart's border-connected white to bare fabric, or don't. */
  convert: boolean
  /** Why, in one phrase — recorded on the row so the decision stays auditable. */
  reason: string
  scan: BackgroundScan
}

/**
 * The rule. Binary, and it is the same rule in both directions: the converter
 * applies it to new work before the thumbnail is rendered, the backfill applies
 * it to the 1,182 rows already published.
 */
export function bareFabricVerdict(data: PatternData, opts: BareFabricOptions = {}): BareFabricVerdict {
  const scan = scanBackground(data)
  const pct = (n: number): string => `${(n * 100).toFixed(1)}%`
  const measured = `border white ${pct(scan.borderWhiteShare)}, ${scan.colourCount} colours, colour coverage ${pct(scan.nonWhiteCoverage)}`

  if (opts.fullCoverageByIntent) {
    return { convert: false, reason: `full coverage by intent (${measured})`, scan }
  }
  if (scan.colourCount >= FULL_COVERAGE_COLOURS) {
    return { convert: false, reason: `showpiece tier — ${scan.colourCount} colours (${measured})`, scan }
  }
  if (scan.nonWhiteCoverage >= FULL_COVERAGE_SHARE) {
    return { convert: false, reason: `already full coverage (${measured})`, scan }
  }
  if (scan.borderWhiteShare < MIN_BACKGROUND_SHARE) {
    return {
      convert: false,
      reason: `no background worth clearing — under ${pct(MIN_BACKGROUND_SHARE)} (${measured})`,
      scan,
    }
  }
  if (scan.openPerimeterShare < MIN_OPEN_PERIMETER) {
    return {
      convert: false,
      reason:
        `white is part of the picture, not the ground — only ${pct(scan.openPerimeterShare)} of the chart's edge is ` +
        `bare or white (${measured})`,
      scan,
    }
  }
  return { convert: true, reason: `white background (${measured})`, scan }
}

// ───────────────────────────────────────────────────────────────────────────
// The rewrite
// ───────────────────────────────────────────────────────────────────────────

export interface ClearedBackground {
  data: PatternData
  /** Stitches turned back into bare fabric. */
  removed: number
  /** Palette entries dropped because nothing references them any more. */
  droppedSymbols: string[]
}

/**
 * Rewrite the border-connected near-white cells of a chart as bare fabric and
 * drop any palette entry left unused.
 *
 * Interior white is untouched by construction — the fill never reached it. A
 * palette entry still referenced by a back-stitch line, a French knot, a bead
 * or a surviving interior stitch stays in the key, so symbol references can
 * never dangle. Idempotent: run it twice and the second pass removes nothing.
 */
export function clearBackground(data: PatternData): ClearedBackground {
  const { width, height, cells } = data.grid
  const nearWhite = new Set(data.palette.filter(isNearWhite).map((p) => p.symbol))
  if (nearWhite.size === 0) return { data, removed: 0, droppedSymbols: [] }

  const symbolAt = new Map<number, string>()
  for (const c of cells) symbolAt.set(idx(c.x, c.y, width), c.s)

  const background = borderConnectedWhite(width, height, symbolAt, nearWhite)
  if (background.size === 0) return { data, removed: 0, droppedSymbols: [] }

  const kept = cells.filter((c) => !background.has(idx(c.x, c.y, width)))
  // A chart that is nothing BUT background is not a pattern with a background —
  // it is a blank, and clearing it would leave an empty palette the schema
  // rightly refuses. Leave it exactly as found and let a human look at it.
  if (kept.length === 0) return { data, removed: 0, droppedSymbols: [] }

  const used = new Set<string>()
  for (const c of kept) used.add(c.s)
  for (const b of data.grid.backstitch) used.add(b.s)
  for (const k of data.grid.frenchKnots) used.add(k.s)
  for (const b of data.grid.beads) used.add(b.s)

  const palette = data.palette.filter((p) => used.has(p.symbol))
  const droppedSymbols = data.palette.filter((p) => !used.has(p.symbol)).map((p) => p.symbol)

  return {
    data: { ...data, grid: { ...data.grid, cells: kept }, palette },
    removed: cells.length - kept.length,
    droppedSymbols,
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Full coverage by intent
// ───────────────────────────────────────────────────────────────────────────

/**
 * Lanes and styles that are stitched edge to edge on purpose.
 *
 * `dense` is the 110–150 colour Flux 1.1 Pro tier — the heirloom showpiece,
 * where bare cloth would be a hole. `scene`, `showpiece` and `landscape` are
 * full painted scenes: their sky IS the design, and a white sky in one of them
 * is a deliberate flat expanse, not the "clean white background" the other
 * style prompts ask Flux for.
 */
const FULL_COVERAGE_LANES: ReadonlySet<string> = new Set(['dense'])
const FULL_COVERAGE_STYLES: ReadonlySet<string> = new Set(['scene', 'showpiece', 'landscape'])

/**
 * Is this brief full coverage by intent? Reads the lane and style the row (or
 * the candidate) was generated from. The chart alone cannot always tell a
 * deliberate white sky from an accidental white void; where the brief is on
 * record, the brief wins. Rows with no brief — most of the old catalogue — fall
 * through to the grid-only rule.
 */
export function fullCoverageByIntent(brief: { lane?: string | null; style?: string | null }): boolean {
  const lane = brief.lane ?? ''
  const style = brief.style ?? ''
  if (FULL_COVERAGE_LANES.has(lane)) return true
  return lane === 'large' && FULL_COVERAGE_STYLES.has(style)
}

/**
 * Size lane a finished chart falls in, by its longest side. The bulk planner's
 * own lanes (mini 55–80, small 110–130, medium 150–165, large 200–220, dense
 * 200–230) only exist on rows it generated, so the scan derives a lane from the
 * grid instead and can report on the whole catalogue the same way.
 */
export function laneForSize(width: number, height: number): string {
  const side = Math.max(width, height)
  if (side <= 90) return 'mini'
  if (side <= 140) return 'small'
  if (side <= 180) return 'medium'
  if (side <= 240) return 'large'
  return 'huge'
}
