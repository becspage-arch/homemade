/**
 * Pure tile-math for the sewing tiled print exporter. Splits a pattern's
 * bounding box across page tiles at 1:1 scale (1mm of pattern → 1mm of
 * paper). Each tile carries page coordinates and the pattern-space
 * window it represents.
 *
 * Sized for A4 and Letter end-to-end in S-1. S-5c rounds out Legal, A3,
 * A0, and the wider matrix of edge cases.
 */

export type PaperSize = 'A4' | 'LETTER' | 'A3' | 'LEGAL'

export interface PaperDimensions {
  /** Width in mm. */
  widthMm: number
  /** Height in mm. */
  heightMm: number
}

export const PAPER: Record<PaperSize, PaperDimensions> = {
  A4: { widthMm: 210, heightMm: 297 },
  LETTER: { widthMm: 216, heightMm: 279.4 },
  A3: { widthMm: 297, heightMm: 420 },
  LEGAL: { widthMm: 216, heightMm: 355.6 },
}

/**
 * Default overlap between tiles, in mm. Authors tape along these overlap
 * bands so small misalignments don't add up across the assembly. The
 * locks specify "overlap rows between pages (default 1cm)".
 */
export const DEFAULT_OVERLAP_MM = 10

/**
 * Default margin around each page, in mm. Keeps content clear of the
 * printer's hard-stop zone.
 */
export const DEFAULT_MARGIN_MM = 10

export interface PatternBounds {
  /** Pattern-space x of the bounding-box top-left. */
  minX: number
  /** Pattern-space y of the bounding-box top-left. */
  minY: number
  /** Pattern-space width in mm. */
  widthMm: number
  /** Pattern-space height in mm. */
  heightMm: number
}

export interface PageTile {
  /** 1-indexed page number. */
  pageNumber: number
  /** 1-indexed column (left to right). */
  col: number
  /** 1-indexed row (top to bottom). */
  row: number
  /** Pattern-space window covered by this tile (mm, top-left to bottom-right). */
  windowMinX: number
  windowMinY: number
  windowMaxX: number
  windowMaxY: number
  /** Inner content rect on the page (mm). */
  contentMarginMm: number
}

export interface TileMap {
  paper: PaperSize
  cols: number
  rows: number
  tiles: PageTile[]
  /** Pattern-space bounds at 1:1 scale (mm). */
  bounds: PatternBounds
  /** Net per-tile drawable area (mm). */
  drawableWidthMm: number
  drawableHeightMm: number
  /** Overlap rows / cols carry per tile (mm). */
  overlapMm: number
  marginMm: number
}

/**
 * Build a TileMap for a pattern with the given bounding box, at 1:1
 * scale, on the given paper. Each tile gets `marginMm` of margin and
 * `overlapMm` of overlap with the next tile so the user can tape along
 * the overlap band.
 */
export function buildTileMap({
  bounds,
  paper,
  overlapMm = DEFAULT_OVERLAP_MM,
  marginMm = DEFAULT_MARGIN_MM,
}: {
  bounds: PatternBounds
  paper: PaperSize
  overlapMm?: number
  marginMm?: number
}): TileMap {
  const dims = PAPER[paper]
  const drawableWidthMm = dims.widthMm - marginMm * 2
  const drawableHeightMm = dims.heightMm - marginMm * 2

  const stepX = drawableWidthMm - overlapMm
  const stepY = drawableHeightMm - overlapMm

  const cols = Math.max(1, Math.ceil(bounds.widthMm / stepX))
  const rows = Math.max(1, Math.ceil(bounds.heightMm / stepY))

  const tiles: PageTile[] = []
  let pageNumber = 1
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const windowMinX = bounds.minX + col * stepX
      const windowMinY = bounds.minY + row * stepY
      tiles.push({
        pageNumber,
        col: col + 1,
        row: row + 1,
        windowMinX,
        windowMinY,
        windowMaxX: windowMinX + drawableWidthMm,
        windowMaxY: windowMinY + drawableHeightMm,
        contentMarginMm: marginMm,
      })
      pageNumber++
    }
  }

  return {
    paper,
    cols,
    rows,
    tiles,
    bounds,
    drawableWidthMm,
    drawableHeightMm,
    overlapMm,
    marginMm,
  }
}

/** Convert mm → PDF user-space points (1 pt = 1/72 inch, 1 inch = 25.4mm). */
export function mmToPt(mm: number): number {
  return (mm / 25.4) * 72
}
