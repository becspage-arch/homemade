/**
 * Knitting chart renderer — public API contract.
 *
 * This contract is locked and shared with K-3 (the Studio surface). K-3
 * imports `KnittingChartData`, `RenderOptions`, `RenderedChart`, and
 * `renderKnittingChart` from this module. Revisions go through the
 * orchestrator.
 *
 * Four chart types are covered:
 *   - COLOURWORK — pure grid, colour per cell (Fair Isle / Bohus / intarsia
 *                  / Scandinavian).
 *   - LACE       — grid with yarn-overs, directional decreases, optional
 *                  no-stitch markers for shaped pieces.
 *   - CABLE      — overlapping crossings that visually span multiple cells.
 *   - BRIOCHE    — two-colour with brk / brp / brkyobrk notation.
 *
 * Knitting charts read differently per construction:
 *   - Flat work RS rows: right-to-left
 *   - Flat work WS rows: left-to-right
 *   - In-the-round:      every row right-to-left
 *
 * The renderer surfaces RS / WS markers + reading-direction arrows for flat
 * work and suppresses WS markers for in-the-round.
 */

export type KnittingChartType = 'COLOURWORK' | 'LACE' | 'CABLE' | 'BRIOCHE'

/** Construction context — drives reading-direction markers. */
export type KnittingConstruction = 'IN_THE_ROUND' | 'FLAT'

/** Where row 1, stitch 1 sits on the chart. Standard convention puts it
 *  bottom-right; some designers (and historical Eastern-European charts)
 *  put it bottom-left. */
export type ChartReadOrigin = 'RIGHT' | 'LEFT'

/** Cable crossing record. The grid's plain symbols beneath the crossing
 *  are ignored — the cable layout renders one composite shape spanning
 *  `endX - startX + 1` cells. */
export interface CableCrossing {
  /** Inclusive x-coordinate of the leftmost cell the cable occupies. */
  startX: number
  /** Inclusive x-coordinate of the rightmost cell the cable occupies. */
  endX: number
  /** Row this crossing lives on (chart y-coordinate). */
  y: number
  /** Which set of stitches crosses in front. LEFT = the right-hand stitches
   *  cross over to the left (visually leans left, "front cable"). */
  crossDirection: 'LEFT' | 'RIGHT'
  /** Cable name — standard knitting notation, free-form string so the
   *  vocabulary extends without a schema change.
   *  Common values: 'C4F', 'C4B', 'C6F', 'C6B', 'C8F', 'C8B', 'T2L', 'T2R',
   *  'T3L', 'T3R'. The renderer falls back to a generic crossing shape for
   *  unknown values. */
  type: string
}

/** Palette entry — keyed by the symbol slug used in `cells[].s`. */
export interface ChartPaletteEntry {
  /** Symbol slug as it appears in `cells[].s`. */
  symbol: string
  /** CSS hex (#rrggbb). */
  rgb: string
  /** Human-readable name (e.g. "Natural", "Charcoal"). */
  name: string
}

/** Schema version 1 — bump on incompatible changes. */
export interface KnittingChartData {
  schemaVersion: 1
  type: KnittingChartType
  grid: {
    /** Stitches across (chart width). */
    width: number
    /** Rows (chart height). */
    height: number
    /** Sparse cell map. Missing coordinates render as the chart-type's
     *  default symbol (knit for colourwork, knit for lace, knit for
     *  cable, brk for brioche). `s` is a symbol slug — see
     *  `stitch-symbols/` for the registry. */
    cells: Array<{ x: number; y: number; s: string }>
    /** Cable crossings — populated on CABLE charts and any other chart
     *  that includes cable detail. Empty / omitted for plain grids. */
    cables?: CableCrossing[]
  }
  /** Optional colour palette. COLOURWORK + BRIOCHE charts use this to
   *  resolve symbol slug → fill colour. LACE + CABLE charts typically
   *  render mono and ignore the palette. */
  palette?: ChartPaletteEntry[]
  metadata?: {
    construction: KnittingConstruction
    /** Bottom-row read direction. Standard charts read right-to-left so
     *  the chart's right edge becomes the start. Defaults to 'RIGHT'. */
    rsRowsStartFrom: ChartReadOrigin
    designer?: string
    /** Optional human-readable title rendered in the chart key. */
    title?: string
  }
}

/** Render-time options. */
export interface RenderOptions {
  /** SVG only (default), PNG only, or both. PNG is rasterised via sharp. */
  outputFormat: 'SVG' | 'PNG' | 'BOTH'
  /** PNG width in pixels. Defaults to the SVG's natural width. */
  pixelWidth?: number
  /** PNG height in pixels. Defaults to the SVG's natural height. */
  pixelHeight?: number
  /** Render the row-number column on the right edge of flat charts (or
   *  both edges if showStitchCount is also set). Defaults to true. */
  showRowNumbers?: boolean
  /** Render the stitch-count column along the bottom edge. Defaults to
   *  true. */
  showStitchCount?: boolean
  /** Render the legend below the chart. Defaults to true. */
  showChartKey?: boolean
  /** Visual theme:
   *   - 'DEFAULT' — soft cream background, suited to screen + library cards.
   *   - 'PRINT'   — pure white background, full-contrast lines, suited to
   *                 PDF + paper printouts.  */
  theme?: 'DEFAULT' | 'PRINT'
  /** Pixel size of one chart cell. Defaults to a value that fits well in a
   *  library card (~28px). Larger values produce print-friendly output. */
  cellPx?: number
}

/** Render result. */
export interface RenderedChart {
  /** SVG markup. Present unless outputFormat === 'PNG'. */
  svg?: string
  /** PNG buffer. Present when outputFormat === 'PNG' or 'BOTH'. */
  pngBuffer?: Buffer
  /** Canvas width in CSS / SVG units (px). */
  width: number
  /** Canvas height in CSS / SVG units (px). */
  height: number
  /** Non-fatal warnings — unknown symbols, palette mismatches, cable
   *  bounds clipped, etc. Empty when nothing surprising happened. */
  warnings: string[]
}

/** SVG symbol definition. Each path is drawn in a unit space where the
 *  cell sits at x = [0, 1], y = [0, 1]. The composer scales by `cellPx`
 *  and translates per grid coordinate. */
export interface KnittingSymbol {
  /** Symbol slug used in `cells[].s`. */
  key: string
  /** Display name shown in the chart key. */
  label: string
  /** Standard knitting abbreviation (e.g. "k", "yo", "k2tog"). Shown in
   *  the chart key alongside the symbol. */
  abbreviation: string
  /** SVG path drawn in unit space. Use 'M' / 'L' / 'Q' / 'C' / 'Z' /
   *  multiple sub-paths. */
  path: string
  /** Stroke colour when the chart-type renders mono (LACE / CABLE).
   *  Defaults to the theme foreground. */
  strokeOverride?: string
  /** Fill colour when the chart-type renders mono. Defaults to none. */
  fillOverride?: string
  /** Stroke width override in unit space. Defaults to 0.08. */
  strokeWidth?: number
  /** When set, the renderer treats the cell as "no stitch" — fills it
   *  with a diagonal-stripe pattern instead of placing the symbol. */
  noStitch?: boolean
  /** Hide this cell from the row-stitch-count tally (chart key headers,
   *  no-stitch markers). Defaults to false. */
  excludeFromCount?: boolean
  /** Source convention citation (CYC / Vogue Knitting / publisher).
   *  Documentation only — not used at render time. */
  source?: string
}

/** Verifier verdict. */
export interface VerifyResult {
  ok: boolean
  warnings: string[]
}
