/**
 * High-level parser for Stitching Mama (Ursa MacStitch / WinStitch
 * Full Color PDF) charts. Built on the generic content-stream parser
 * in pdf-content-stream.ts plus pdfjs-dist for text decoding.
 *
 * Returns an intermediate "parsed pattern" shape that the importer
 * converts into PatternData (the Zod-validated JSON the database stores
 * in Pattern.data).
 *
 * The format consistently lays out:
 *   - Page 1 (cover): title + finished-size table + author block.
 *   - Pages 2..N (chart tiles): regular grid of 8.505pt cells with
 *     per-colour rg/re fills. Column / row gauge labels print at the
 *     edges of each tile so the tile's global origin can be inferred.
 *   - Two legend pages near the end: one row per palette entry with the
 *     symbol, brand, DMC code, colour name, recommended strands and
 *     thread length, plus a 61.5pt × 15.1pt colour swatch on the left.
 */

import { extractAllPageCells, loadPageContentStreams, executeContentStream, type RgbCell } from './pdf-content-stream'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Cell side length on every Stitching Mama chart page (constant from
// the Ursa exporter regardless of pattern size).
const CELL_PT = 8.505
// Legend swatch HEIGHT is constant (15.10pt for every Ursa export);
// width varies by pattern (Blue Hydrangea 61.5pt, Im a Cool Mom 82.5pt
// — Ursa picks width to fit the longest colour name on the page). So
// detect swatches by height + minimum width rather than exact size.
const LEGEND_SWATCH_H = 15.1
const LEGEND_SWATCH_MIN_W = 30
const LEGEND_SWATCH_H_EPS = 1.0
// Tolerance for "this rectangle is a chart cell" — Ursa rounds cell
// sizes slightly so an exact equality check would be brittle.
const CELL_EPS = 0.1

export interface ParsedPalette {
  symbol: string
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
  code: string
  name: string
  /** Hex like "#aabbcc". */
  hex: string
  rgb: [number, number, number]
  strands: number
  stitches: number
  lengthCm: number
}

export interface ParsedCell {
  /** Global chart x (0 = leftmost column). */
  x: number
  /** Global chart y (0 = topmost row). */
  y: number
  /** Symbol from the palette entry that matches this cell's RGB. */
  symbol: string
}

export interface ParsedStitchingMamaPattern {
  /** Title from cover page (e.g. "Blue Hydrangea"). */
  title: string
  /** Optional copyright line if present on legend ("© 2023 Stitching Mama"). */
  copyrightLine: string | null
  gridWidth: number
  gridHeight: number
  fabricCount: number
  finishedSizeCm: { width: number; height: number } | null
  declaredTotalStitches: number | null
  palette: ParsedPalette[]
  cells: ParsedCell[]
  /** Per-page diagnostics; useful in the importer's hand-off summary. */
  diagnostics: {
    pageCount: number
    chartPages: number
    legendPages: number
    uniqueColoursOnChart: number
    matchedCells: number
    unmatchedCells: number
  }
}

interface TextItem { str: string; x: number; y: number }

// Reading-order grouping by y coordinate then x.
function groupByRow(items: TextItem[], yTolerance = 3): TextItem[][] {
  const sorted = items.slice().sort((a, b) => b.y - a.y || a.x - b.x)
  const rows: TextItem[][] = []
  let curr: TextItem[] | null = null
  let currY = -Infinity
  for (const it of sorted) {
    if (!curr || Math.abs(currY - it.y) > yTolerance) {
      curr = [it]
      rows.push(curr)
      currY = it.y
    } else {
      curr.push(it)
    }
  }
  for (const r of rows) r.sort((a, b) => a.x - b.x)
  return rows
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function isWhitish(rgb: [number, number, number]): boolean {
  return rgb[0] > 0.995 && rgb[1] > 0.995 && rgb[2] > 0.995
}

function isChartCell(c: RgbCell): boolean {
  return Math.abs(c.w - CELL_PT) < CELL_EPS && Math.abs(c.h - CELL_PT) < CELL_EPS
}

function isLegendSwatch(c: RgbCell): boolean {
  return Math.abs(c.h - LEGEND_SWATCH_H) < LEGEND_SWATCH_H_EPS && c.w >= LEGEND_SWATCH_MIN_W
}

/** Approximate RGB equality (Ursa exports slightly different rounded
 *  RGB on chart vs legend pages — sub-2/255 of slack is plenty). */
function rgbClose(a: [number, number, number], b: [number, number, number], tol = 0.012): boolean {
  return Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol
}

interface ChartTileInfo {
  pageIndex: number
  /** Cells on this tile (8.505×8.505 only). */
  cells: RgbCell[]
  /** First global column index this tile shows. */
  colOrigin: number
  /** First global row index this tile shows. */
  rowOrigin: number
  /** Number of columns visible on this tile. */
  colsVisible: number
  /** Number of rows visible on this tile. */
  rowsVisible: number
}

interface CoverInfo {
  title: string | null
  gridWidth: number | null
  gridHeight: number | null
  fabricCount: number | null
  finishedSizeCm: { width: number; height: number } | null
  declaredTotalStitches: number | null
}

interface LegendInfo {
  copyrightLine: string | null
  rows: Array<{
    y: number
    symbol: string
    brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
    code: string
    name: string
    strands: number
    stitches: number
    lengthCm: number
  }>
  /** Swatch fills, keyed by approximate y midpoint for matching with rows. */
  swatches: Array<{ y: number; rgb: [number, number, number] }>
}

function parseCover(items: TextItem[]): CoverInfo {
  // Cover page text is short (~40 items) and the rows we care about are:
  //   "BLUE HYDRANGEA"
  //   "Aida 14 count"
  //   "163 x 174"               (grid width × height)
  //   "29.6cm x 31.6cm ..."     (finished size at recommended count)
  //   "14 ct (29.6 x 31.6 cm) ..." (canonical size table — the row we trust)
  // The "40cm x 40cm" near the top is the recommended fabric-piece size
  // (includes margins) — NOT the finished design size. We prefer the
  // size-table row that matches the fabric count.
  let title: string | null = null
  let fabricCount: number | null = null
  let gridWidth: number | null = null
  let gridHeight: number | null = null
  let finishedSizeCm: { width: number; height: number } | null = null
  const declaredTotalStitches: number | null = null

  const sorted = items.slice().sort((a, b) => b.y - a.y || a.x - b.x)
  for (const it of sorted) {
    if (it.y < 600) break
    if (it.str.length > 3 && /^[A-Z][A-Z &'\-]+$/.test(it.str) && it.str !== 'PATTERN') {
      title = it.str
      break
    }
  }

  for (const it of sorted) {
    const s = it.str
    if (!fabricCount) {
      const m = s.match(/Aida\s+(\d+)\s+count/i)
      if (m && m[1]) fabricCount = parseInt(m[1], 10)
    }
    if (gridWidth === null) {
      const m = s.match(/^\s*(\d+)\s*x\s*(\d+)\s*$/i)
      if (m && m[1] && m[2]) {
        gridWidth = parseInt(m[1], 10)
        gridHeight = parseInt(m[2], 10)
      }
    }
  }

  // Pull finished size from the size-table row that matches the
  // recommended fabric count. Pattern is "<n> ct (<w> x <h> cm)..."
  if (fabricCount) {
    for (const it of sorted) {
      const m = it.str.match(new RegExp(`(?:^|\\s)${fabricCount}\\s*ct\\s*\\(\\s*([\\d.]+)\\s*x\\s*([\\d.]+)\\s*cm\\)`, 'i'))
      if (m && m[1] && m[2]) {
        finishedSizeCm = { width: parseFloat(m[1]), height: parseFloat(m[2]) }
        break
      }
    }
  }
  // Fallback: first cm × cm match that ISN'T the recommended fabric-piece
  // size (skip the first cm × cm if both dimensions are integers — the
  // fabric piece size is usually rounded to whole cm, finished size has
  // decimals).
  if (!finishedSizeCm) {
    const all = sorted.flatMap(it => {
      const m = it.str.match(/([\d.]+)\s*cm\s*x\s*([\d.]+)\s*cm/i)
      return m && m[1] && m[2] ? [{ w: parseFloat(m[1]), h: parseFloat(m[2]) }] : []
    })
    const decimal = all.find(s => !Number.isInteger(s.w) || !Number.isInteger(s.h))
    if (decimal) finishedSizeCm = { width: decimal.w, height: decimal.h }
    else if (all.length > 1 && all[1]) finishedSizeCm = { width: all[1].w, height: all[1].h }
    else if (all.length > 0 && all[0]) finishedSizeCm = { width: all[0].w, height: all[0].h }
  }

  return { title, gridWidth, gridHeight, fabricCount, finishedSizeCm, declaredTotalStitches }
}

function looksLikeLegendPage(items: TextItem[]): boolean {
  // Legend pages have a header row "Number  Name  Strands  Length  Stitches"
  // and many "DMC" tokens. The chart pages don't have those strings.
  let hasNumberHeader = false
  let dmcCount = 0
  for (const it of items) {
    const s = it.str.trim()
    if (s === 'Number') hasNumberHeader = true
    if (s === 'DMC' || s === 'ANCHOR' || s === 'MADEIRA') dmcCount++
  }
  return hasNumberHeader || dmcCount > 8
}

function parseLegendPage(items: TextItem[], cells: RgbCell[]): LegendInfo {
  // pdfjs emits zero-width font-boundary items (empty strings) and
  // standalone single-space items between every column. Strip those
  // before grouping so brandIdx-1 reliably points at the symbol glyph.
  const meaningful = items.filter(it => it.str.length > 0 && it.str.trim().length > 0)
  const rows = groupByRow(meaningful)
  const out: LegendInfo = { copyrightLine: null, rows: [], swatches: [] }
  // Legend swatch rectangles on this page (one per palette row).
  const swatches = cells.filter(isLegendSwatch)
    .map(c => ({ y: c.y + c.h / 2, rgb: c.rgb }))
  out.swatches = swatches.sort((a, b) => b.y - a.y)

  for (const row of rows) {
    const yMid = row[0]?.y ?? 0
    // Look for the "DMC" / "ANCHOR" / "MADEIRA" token in this row
    const brandIdx = row.findIndex(it => it.str.trim() === 'DMC' || it.str.trim() === 'ANCHOR' || it.str.trim() === 'MADEIRA')
    if (brandIdx < 0) {
      // Capture copyright text from any row that contains a © sign.
      const copy = row.find(it => it.str.includes('©'))
      if (copy && !out.copyrightLine) out.copyrightLine = copy.str
      continue
    }
    const brand = row[brandIdx].str.trim() as 'DMC' | 'ANCHOR' | 'MADEIRA'
    const symbolItem = row[brandIdx - 1] // symbol sits to the left of brand
    const codeItem = row[brandIdx + 1]   // code follows the brand
    if (!symbolItem || !codeItem) continue
    // Colour name occupies one or more items after the code, up until the
    // strands column (single-digit integer like "2").
    let strandsIdx = -1
    for (let j = brandIdx + 2; j < row.length; j++) {
      if (/^\d$/.test(row[j].str.trim())) { strandsIdx = j; break }
    }
    if (strandsIdx < 0) continue
    const name = row.slice(brandIdx + 2, strandsIdx).map(it => it.str).join(' ').replace(/\s+/g, ' ').trim()
    // Strands; length ("xxx.xx cm"); stitches integer follow.
    const strandsItem = row[strandsIdx]
    if (!strandsItem) continue
    const strands = parseInt(strandsItem.str.trim(), 10)
    let lengthCm = 0
    let stitches = 0
    for (let j = strandsIdx + 1; j < row.length; j++) {
      const item = row[j]
      if (!item) continue
      const s = item.str.trim()
      const lm = s.match(/^([\d.]+)\s*cm$/)
      if (lm && lm[1] && !lengthCm) lengthCm = parseFloat(lm[1])
      else if (!stitches && /^\d{1,6}$/.test(s)) stitches = parseInt(s, 10)
    }
    out.rows.push({
      y: yMid,
      symbol: symbolItem.str.trim(),
      brand,
      code: codeItem.str.trim(),
      name,
      strands,
      stitches,
      lengthCm,
    })
  }
  return out
}

/** Match each legend row's y to the swatch whose rectangle vertically
 *  contains the row's text baseline. Where pdfjs returned an empty
 *  symbol (a font CID with no ToUnicode mapping — happens for a few
 *  glyphs in subsetted fonts), substitute a unique fallback character
 *  from a pool that doesn't collide with any decoded symbol. The
 *  pattern's Pattern.data only cares that symbols are unique within
 *  the palette and present on the cells — what *glyph* the renderer
 *  draws is interchangeable. */
const FALLBACK_SYMBOL_POOL =
  'αβγδεζηθικλμνξοπρστυφχψω' + 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' + '∞∂∇∫∮∝∴∵≈≠≤≥⊕⊗⊙⊥∠∥◇◆◯●'

function buildPalette(legends: LegendInfo[]): ParsedPalette[] {
  const palette: ParsedPalette[] = []
  const usedSymbols = new Set<string>()
  let fallbackCursor = 0
  for (const leg of legends) {
    for (const r of leg.rows) {
      const swatch = leg.swatches.find(sw => Math.abs(sw.y - r.y) < 10)
      if (!swatch) continue
      let symbol = r.symbol
      if (!symbol || /^\s*$/.test(symbol) || usedSymbols.has(symbol)) {
        // Find next fallback that isn't already used.
        while (fallbackCursor < FALLBACK_SYMBOL_POOL.length && usedSymbols.has(FALLBACK_SYMBOL_POOL[fallbackCursor])) {
          fallbackCursor++
        }
        if (fallbackCursor < FALLBACK_SYMBOL_POOL.length) {
          symbol = FALLBACK_SYMBOL_POOL[fallbackCursor++]
        } else {
          // Extreme palette size — extend with letters / digits.
          for (let cc = 0x21; cc < 0x7f; cc++) {
            const ch = String.fromCharCode(cc)
            if (!usedSymbols.has(ch)) { symbol = ch; break }
          }
        }
      }
      usedSymbols.add(symbol)
      palette.push({
        symbol,
        brand: r.brand,
        code: r.code,
        name: r.name,
        hex: rgbToHex(swatch.rgb),
        rgb: swatch.rgb,
        strands: r.strands,
        stitches: r.stitches,
        lengthCm: r.lengthCm,
      })
    }
  }
  return palette
}

/** Pull gauge labels (chart-coordinate numbers printed at the top edge
 *  and left edge of each chart tile) so the importer can compute the
 *  tile's origin in the global chart grid. */
function inferTileOrigin(
  items: TextItem[],
  cells: RgbCell[],
): { colOrigin: number; rowOrigin: number; colsVisible: number; rowsVisible: number } | null {
  // Chart cells extend horizontally from x ≈ 58.35 to x ≈ 58.35 + 60*8.505 = 568.65.
  // Gauge labels (column numbers) sit just above the top row of cells:
  // ~y in [680.98 + CELL_PT*1, 680.98 + CELL_PT*2].
  // Row labels sit just to the left of the left column at x ≈ < 58.35.
  const chartCells = cells.filter(isChartCell)
  if (chartCells.length === 0) return null
  // Find chart area bounds from chart-cell positions.
  const minX = Math.min(...chartCells.map(c => c.x))
  const maxX = Math.max(...chartCells.map(c => c.x + c.w))
  const minY = Math.min(...chartCells.map(c => c.y))
  const maxY = Math.max(...chartCells.map(c => c.y + c.h))
  const colsVisible = Math.round((maxX - minX) / CELL_PT)
  const rowsVisible = Math.round((maxY - minY) / CELL_PT)
  // Column gauge labels: integers above the top of the chart area, within ~2 cell-heights.
  const colLabels = items.filter(it =>
    /^\d+$/.test(it.str.trim()) &&
    it.y > maxY - CELL_PT * 0.5 &&
    it.y < maxY + CELL_PT * 3 &&
    it.x > minX - CELL_PT &&
    it.x < maxX + CELL_PT,
  ).map(it => ({ x: it.x, label: parseInt(it.str.trim(), 10) }))
  // Row gauge labels: integers left of the chart area.
  const rowLabels = items.filter(it =>
    /^\d+$/.test(it.str.trim()) &&
    it.x < minX - CELL_PT * 0.5 &&
    it.x > minX - CELL_PT * 5 &&
    it.y > minY - CELL_PT &&
    it.y < maxY + CELL_PT,
  ).map(it => ({ y: it.y, label: parseInt(it.str.trim(), 10) }))
  if (colLabels.length === 0 || rowLabels.length === 0) return null
  // Use the leftmost column label and its x position to determine col origin.
  // Stitching Mama labels every 10th column at the column's *centre*. So if
  // the leftmost label is "10" at x=137.2, that's column 10 of the chart
  // (1-indexed) = global column 9 (0-indexed) at that x position. The tile
  // origin is then column (label - colsFromLeft) where colsFromLeft = round((labelX - minX) / CELL_PT).
  colLabels.sort((a, b) => a.x - b.x)
  rowLabels.sort((a, b) => b.y - a.y)
  const leftMostLabel = colLabels[0]
  const colsFromLeft = Math.round((leftMostLabel.x - minX) / CELL_PT)
  const colOrigin = leftMostLabel.label - 1 - colsFromLeft
  // Row labels increase downward; topmost label corresponds to lowest row index.
  const topMostRowLabel = rowLabels[0]
  const rowsFromTop = Math.round((maxY - topMostRowLabel.y) / CELL_PT)
  const rowOrigin = topMostRowLabel.label - 1 - rowsFromTop
  return {
    colOrigin: Math.max(0, colOrigin),
    rowOrigin: Math.max(0, rowOrigin),
    colsVisible,
    rowsVisible,
  }
}

export async function parseStitchingMamaPdf(buffer: Buffer): Promise<ParsedStitchingMamaPattern> {
  // 1. Page-level raw cells (from content streams)
  const pageCells = await extractAllPageCells(buffer)
  // 2. Page-level text items (from pdfjs)
  const doc = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise
  const allPageText: TextItem[][] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const tc = await page.getTextContent()
    const items: TextItem[] = []
    for (const it of tc.items as Array<{ str: string; transform: number[] }>) {
      if (!it.str) continue
      items.push({ str: it.str, x: it.transform[4], y: it.transform[5] })
    }
    allPageText.push(items)
  }

  // Classify pages.
  const coverIndex = 0
  const legendIndices: number[] = []
  const chartIndices: number[] = []
  for (let i = 1; i < pageCells.length; i++) {
    if (looksLikeLegendPage(allPageText[i])) legendIndices.push(i)
    else if (pageCells[i].cells.filter(isChartCell).length > 100) chartIndices.push(i)
  }

  // Cover
  const cover = parseCover(allPageText[coverIndex])

  // Legend
  const legends: LegendInfo[] = legendIndices.map(i =>
    parseLegendPage(allPageText[i], pageCells[i].cells),
  )
  const palette = buildPalette(legends)

  // Build RGB → palette entry index for lookup. There's slight rounding
  // drift between chart-cell rgb and legend-swatch rgb so we keep the
  // entries as-is for tolerant matching.
  const matchedCells: ParsedCell[] = []
  let unmatched = 0
  const tileInfos: ChartTileInfo[] = []
  const uniqueColoursOnChart = new Set<string>()
  // Use Map for global cell dedupe across overlapping tiles.
  const globalCells = new Map<string, string>() // "x,y" -> symbol

  for (const idx of chartIndices) {
    const chartCells = pageCells[idx].cells.filter(isChartCell)
    const origin = inferTileOrigin(allPageText[idx], pageCells[idx].cells)
    if (!origin) {
      // Skip tiles whose origin we couldn't infer — better to drop than mis-place.
      continue
    }
    // Chart cell area bounds for this tile (in pt).
    const minX = Math.min(...chartCells.map(c => c.x))
    const maxY = Math.max(...chartCells.map(c => c.y))
    tileInfos.push({
      pageIndex: idx,
      cells: chartCells,
      colOrigin: origin.colOrigin,
      rowOrigin: origin.rowOrigin,
      colsVisible: origin.colsVisible,
      rowsVisible: origin.rowsVisible,
    })

    for (const cell of chartCells) {
      // Background cells are pure white; we use that as the primary filter
      // but also match against the palette so off-white DMC colours
      // (like DMC blanc or 712 cream) still register as stitched.
      if (isWhitish(cell.rgb)) continue
      uniqueColoursOnChart.add(rgbToHex(cell.rgb))
      const palEntry = palette.find(p => rgbClose(p.rgb, cell.rgb))
      if (!palEntry) { unmatched++; continue }
      const col = origin.colOrigin + Math.round((cell.x - minX) / CELL_PT)
      const row = origin.rowOrigin + Math.round((maxY - cell.y) / CELL_PT)
      // Clip to grid bounds — Stitching Mama's chart tiles routinely
      // extend a few cells past the design's right or bottom edge
      // (printer's choice of tile size). Those overhang cells are
      // background-white anyway in the rendered chart, so dropping them
      // costs no stitched content. We need the grid dimensions from
      // the cover; rely on them being parsed before this step.
      if (col < 0 || row < 0) continue
      if (cover.gridWidth && col >= cover.gridWidth) continue
      if (cover.gridHeight && row >= cover.gridHeight) continue
      const key = `${col},${row}`
      if (!globalCells.has(key)) {
        globalCells.set(key, palEntry.symbol)
        matchedCells.push({ x: col, y: row, symbol: palEntry.symbol })
      }
    }
  }

  return {
    title: cover.title ?? '(untitled)',
    copyrightLine: legends[0]?.copyrightLine ?? null,
    gridWidth: cover.gridWidth ?? 0,
    gridHeight: cover.gridHeight ?? 0,
    fabricCount: cover.fabricCount ?? 14,
    finishedSizeCm: cover.finishedSizeCm,
    declaredTotalStitches: cover.declaredTotalStitches,
    palette,
    cells: matchedCells,
    diagnostics: {
      pageCount: pageCells.length,
      chartPages: chartIndices.length,
      legendPages: legendIndices.length,
      uniqueColoursOnChart: uniqueColoursOnChart.size,
      matchedCells: matchedCells.length,
      unmatchedCells: unmatched,
    },
  }
}
