/**
 * PDF export for a Pattern. Composes:
 *   1. Cover page — title, designer, finished size, totals
 *   2. Index sheet — the whole chart small, with the page grid and page
 *      numbers laid over it, so a stitcher can see where they are
 *   3. Floss key page — every palette entry with stitch count + skein
 *   4. Chart pages — tiled across the chosen paper size, every tile carrying
 *      absolute row and column numbers on all four edges
 *
 * Four things the printed chart gets right, because they are what stitchers
 * complain about most in printed charts they buy elsewhere:
 *
 *   - Row and column numbers every ten cells, on every tile and on the index
 *     sheet, in whole-chart coordinates rather than per-page ones.
 *   - Tiles land on multiples of ten, so a ten-by-ten block is never split
 *     across two sheets and counting never restarts mid-block.
 *   - The two-cell overlap is kept, but washed back and outlined, so it is
 *     obvious which stitches belong to the neighbouring page.
 *   - A large-print option, for anyone who would rather have more paper than
 *     a magnifier.
 *
 * Uses pdf-lib for the page composition and sharp to rasterise each chart
 * tile from the same SVG renderer the on-screen viewport uses. Tiles are
 * rasterised at RASTER_SCALE times their printed size, so symbols stay sharp
 * on paper instead of being a 72 dpi bitmap stretched to fit.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  estimateSkeinCount,
  type PatternData,
  type Fabric,
} from '@homemade/db'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { symbolOnFill } from '@/components/studio/chart/render-helpers'

// Chart symbols use glyphs outside WinAnsi (Latin-Extended letters from
// imported charts, geometric shapes ●▲◆, dingbats ✚✦). pdf-lib's standard
// fonts can only encode WinAnsi, so drawing any such symbol throws and the
// whole export 500s. We embed DejaVu Sans — a libre font with broad
// Unicode coverage — via fontkit so every symbol renders. The font files
// are bundled in public/fonts (copied into the container image).
const FONT_DIR_CANDIDATES = ['apps/web/public/fonts', 'public/fonts']

function loadBundledFont(file: string): Buffer | null {
  for (const dir of FONT_DIR_CANDIDATES) {
    try {
      return readFileSync(join(process.cwd(), dir, file))
    } catch {
      // try next candidate
    }
  }
  return null
}

export type PaperKey = 'a4' | 'letter' | 'a3' | 'legal'

const PAPER_DIMENSIONS_PT: Record<PaperKey, { width: number; height: number; label: string }> = {
  // 1 inch = 72 points
  a4: { width: 595.28, height: 841.89, label: 'A4 (210 × 297 mm)' },
  letter: { width: 612, height: 792, label: 'US Letter (8.5 × 11 in)' },
  a3: { width: 841.89, height: 1190.55, label: 'A3 (297 × 420 mm)' },
  legal: { width: 612, height: 1008, label: 'US Legal (8.5 × 14 in)' },
}

const PAGE_MARGIN_PT = 36
const TILE_OVERLAP_CELLS = 2

/** Chart pages align to the tens grid, so a ten-by-ten block never splits. */
const BLOCK_CELLS = 10

/**
 * Printed size of one chart cell, in points (72 to the inch). Normal is
 * 3.2 mm, about eight squares to the inch, which is the density a bought
 * chart prints at. Large is half as big again — 4.8 mm — for anyone who would
 * rather have more sheets of paper than reach for a magnifier.
 */
const CELL_PT: Record<'normal' | 'large', number> = { normal: 9, large: 13.5 }

/**
 * Tiles are rasterised at this multiple of their printed size. Only the
 * stitches go into that raster — flat colour, which survives 144 dpi without
 * complaint. Everything a stitcher has to read off the page (the grid, the
 * symbols, the row and column numbers) is drawn as real PDF vector work over
 * the top, so it prints at whatever resolution the printer offers instead of
 * being a bitmap stretched to fit. That is what makes a 114-colour chart
 * readable on paper, and it keeps the file to a tenth of the size.
 */
const RASTER_SCALE = 2

/** Vertical space reserved above and below the chart image on a tile page. */
const CHART_HEADER_PT = 26
const CHART_FOOTER_PT = 50

interface ExportOptions {
  paper: PaperKey
  monochrome?: boolean
  /** Bigger cells, fewer per page. More paper, less squinting. */
  largePrint?: boolean
  designerName?: string | null
  /** Optional uploaded hero photograph. If provided, the cover embeds
   *  this image instead of the rendered chart. Buffer must be PNG / JPEG
   *  bytes the caller has already fetched. */
  heroPhoto?: Buffer | null
}

export async function buildPatternPdf(
  pattern: PatternData,
  patternName: string,
  opts: ExportOptions,
): Promise<Uint8Array> {
  const paper = PAPER_DIMENSIONS_PT[opts.paper]
  const doc = await PDFDocument.create()

  // Prefer the embedded Unicode font so chart symbols render. If the font
  // files can't be loaded for any reason, fall back to the standard fonts
  // and sanitise text to WinAnsi so the export degrades (symbols → "?")
  // rather than 500ing.
  let fonts: Fonts
  const sansBytes = loadBundledFont('DejaVuSans.ttf')
  const boldBytes = loadBundledFont('DejaVuSans-Bold.ttf')
  if (sansBytes && boldBytes) {
    doc.registerFontkit(fontkit)
    const body = await doc.embedFont(sansBytes, { subset: true })
    const display = await doc.embedFont(boldBytes, { subset: true })
    fonts = { display, body, mono: body, clean: (s) => s }
  } else {
    const display = await doc.embedFont(StandardFonts.HelveticaBold)
    const body = await doc.embedFont(StandardFonts.Helvetica)
    const mono = await doc.embedFont(StandardFonts.Courier)
    fonts = { display, body, mono, clean: (s) => s.replace(/[^ -ÿ]/g, '?') }
  }

  const plan = planTiles(pattern, paper, opts.largePrint === true)

  await drawCover(doc, paper, pattern, patternName, opts, fonts)
  await drawIndexSheet(doc, paper, pattern, plan, opts, fonts)
  await drawFlossKey(doc, paper, pattern, opts, fonts)
  await drawChartPages(doc, paper, pattern, plan, opts, fonts)

  return await doc.save()
}

type Fonts = {
  display: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>
  body: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>
  mono: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>
  /** Pass-through when the Unicode font is embedded; strips non-WinAnsi
   *  characters in the standard-font fallback so drawText never throws. */
  clean: (s: string) => string
}

async function drawCover(
  doc: PDFDocument,
  paper: { width: number; height: number; label: string },
  pattern: PatternData,
  patternName: string,
  opts: ExportOptions,
  fonts: Fonts,
) {
  const page = doc.addPage([paper.width, paper.height])
  const m = PAGE_MARGIN_PT
  const ink = rgb(0.24, 0.18, 0.13)
  const mute = rgb(0.42, 0.36, 0.28)
  const accent = rgb(0.77, 0.52, 0.42)

  // Overline
  page.drawText('CROSS-STITCH PATTERN', {
    x: m,
    y: paper.height - m - 18,
    size: 9,
    font: fonts.mono,
    color: accent,
  })

  // Title
  page.drawText(fonts.clean(patternName), {
    x: m,
    y: paper.height - m - 64,
    size: 32,
    font: fonts.display,
    color: ink,
  })

  if (opts.designerName) {
    page.drawText(fonts.clean(`by ${opts.designerName}`), {
      x: m,
      y: paper.height - m - 88,
      size: 12,
      font: fonts.body,
      color: mute,
    })
  }

  // Cover hero: a finished-piece photograph if the pattern has one
  // attached, otherwise the beauty-mode render (strand-shaded X stitches
  // on Aida weave with soft drop shadow). Either way, sized to leave
  // room for the spec table beneath.
  const heroBoxW = paper.width - m * 2
  const heroBoxH = Math.min(380, paper.height * 0.42)

  let heroBuffer: Buffer
  if (opts.heroPhoto && !opts.monochrome) {
    heroBuffer = await sharp(opts.heroPhoto)
      .resize(Math.round(heroBoxW * 2), Math.round(heroBoxH * 2), {
        fit: 'cover',
        position: 'attention',
      })
      .png()
      .toBuffer()
  } else {
    const heroSvg = renderPatternSvgString(pattern, {
      mode: opts.monochrome ? 'chart' : 'beauty',
      cellPx: 24,
      showSymbols: false,
      showGrid: false,
      showCentreCrosshairs: false,
      padding: 24,
      monochrome: opts.monochrome,
    })
    heroBuffer = await sharp(Buffer.from(heroSvg))
      .resize(Math.round(heroBoxW * 2), Math.round(heroBoxH * 2), {
        fit: 'contain',
        background: { r: 245, g: 240, b: 232 },
      })
      .png()
      .toBuffer()
  }
  const heroImage = await doc.embedPng(heroBuffer)
  const heroPlace = scaleFit(heroImage.width, heroImage.height, heroBoxW, heroBoxH)
  page.drawImage(heroImage, {
    x: m + (heroBoxW - heroPlace.w) / 2,
    y: paper.height - m - 120 - heroBoxH,
    width: heroPlace.w,
    height: heroPlace.h,
  })

  // Spec block
  const specY = paper.height - m - 120 - heroBoxH - 36
  const finishedSize = describeFinishedSize(pattern.fabric, pattern)
  const lines: Array<[string, string]> = [
    ['Finished size', finishedSize],
    ['Stitches', `${pattern.grid.width} × ${pattern.grid.height} = ${pattern.grid.cells.length.toLocaleString()} stitches`],
    ['Fabric', `${pattern.fabric.count}-count ${pattern.fabric.type}`],
    ['Floss colours', `${pattern.palette.length}`],
    ['Paper', opts.largePrint ? `${paper.label} · large print` : paper.label],
    ['Made with', 'homemade.education'],
  ]
  let cursor = specY
  for (const [k, v] of lines) {
    page.drawText(k.toUpperCase(), {
      x: m,
      y: cursor,
      size: 8,
      font: fonts.mono,
      color: mute,
    })
    page.drawText(v, {
      x: m + 110,
      y: cursor,
      size: 11,
      font: fonts.body,
      color: ink,
    })
    cursor -= 18
  }
}

/**
 * Every floss in the chart, with its symbol, its code, how many stitches it
 * works and roughly how many skeins to buy. Paginated: a 114-colour showpiece
 * runs to two sheets rather than sliding off the bottom of one.
 */
async function drawFlossKey(
  doc: PDFDocument,
  paper: { width: number; height: number },
  pattern: PatternData,
  opts: ExportOptions,
  fonts: Fonts,
) {
  const m = PAGE_MARGIN_PT
  const ink = rgb(0.24, 0.18, 0.13)
  const mute = rgb(0.42, 0.36, 0.28)

  const stitchesBySymbol = new Map<string, number>()
  for (const cell of pattern.grid.cells) {
    stitchesBySymbol.set(cell.s, (stitchesBySymbol.get(cell.s) ?? 0) + 1)
  }
  // Cells of back-stitch line per floss. An outline floss can have no full
  // crosses at all, and a key row reading "0 st" against a skein estimate would
  // look like a mistake rather than a colour you buy for the line work.
  const lineBySymbol = new Map<string, number>()
  for (const seg of pattern.grid.backstitch) {
    const len = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1)
    lineBySymbol.set(seg.s, (lineBySymbol.get(seg.s) ?? 0) + len)
  }
  const knotsBySymbol = new Map<string, number>()
  for (const knot of pattern.grid.frenchKnots) {
    knotsBySymbol.set(knot.s, (knotsBySymbol.get(knot.s) ?? 0) + 1)
  }

  const rows = pattern.palette.map((entry) => ({
    entry,
    stitchCount: stitchesBySymbol.get(entry.symbol) ?? 0,
    lineCells: Math.round(lineBySymbol.get(entry.symbol) ?? 0),
    knotCount: knotsBySymbol.get(entry.symbol) ?? 0,
    skein: estimateSkeinCount(pattern, entry.symbol),
  }))

  const colCount = 2
  const colW = (paper.width - m * 2) / colCount
  const rowH = 15.5
  const topY = paper.height - m - 46
  const bottomY = m + 24
  const rowsPerCol = Math.max(1, Math.floor((topY - bottomY) / rowH))
  const perPage = rowsPerCol * colCount
  const pageCount = Math.max(1, Math.ceil(rows.length / perPage))

  // Column offsets inside one entry. Names are truncated rather than wrapped:
  // a wrapped name would run into the row beneath it.
  const SWATCH = 11
  const SYMBOL_X = 18
  const CODE_X = 33
  const NAME_X = 82
  // The counts column grows when the chart carries line work or knots, so the
  // extra numbers never eat into the floss name beside them.
  const COUNT_W =
    74 +
    (pattern.grid.backstitch.length > 0 ? 36 : 0) +
    (pattern.grid.frenchKnots.length > 0 ? 26 : 0)
  const nameW = colW - NAME_X - COUNT_W - 8

  for (let p = 0; p < pageCount; p++) {
    const page = doc.addPage([paper.width, paper.height])
    page.drawText('FLOSS KEY', {
      x: m,
      y: paper.height - m - 18,
      size: 9,
      font: fonts.mono,
      color: mute,
    })
    if (pageCount > 1) {
      const label = `${p + 1} OF ${pageCount}`
      page.drawText(label, {
        x: paper.width - m - fonts.mono.widthOfTextAtSize(label, 9),
        y: paper.height - m - 18,
        size: 9,
        font: fonts.mono,
        color: mute,
      })
    }
    page.drawText(`${rows.length} floss colours · ${pattern.grid.cells.length.toLocaleString()} stitches`, {
      x: m,
      y: paper.height - m - 34,
      size: 10,
      font: fonts.body,
      color: ink,
    })

    const slice = rows.slice(p * perPage, (p + 1) * perPage)
    for (let i = 0; i < slice.length; i++) {
      const row = slice[i]!
      const colIdx = Math.floor(i / rowsPerCol)
      const rowIdx = i % rowsPerCol
      const x = m + colIdx * colW
      const y = topY - rowIdx * rowH

      const swatchHex = opts.monochrome ? '#ffffff' : row.entry.rgb
      const [r, g, b] = hexToRgbTuple(swatchHex)
      page.drawRectangle({
        x,
        y: y - 9,
        width: SWATCH,
        height: SWATCH,
        color: rgb(r / 255, g / 255, b / 255),
        borderColor: ink,
        borderWidth: 0.5,
      })

      page.drawText(fonts.clean(row.entry.symbol), {
        x: x + SYMBOL_X,
        y: y - 7,
        size: 9,
        font: fonts.body,
        color: ink,
      })
      page.drawText(fonts.clean(`${row.entry.brand} ${row.entry.code}`), {
        x: x + CODE_X,
        y: y - 7,
        size: 7.5,
        font: fonts.mono,
        color: mute,
      })
      page.drawText(truncateToWidth(fonts.clean(row.entry.name), fonts.body, 8.5, nameW), {
        x: x + NAME_X,
        y: y - 7,
        size: 8.5,
        font: fonts.body,
        color: ink,
      })

      const extras = [
        ...(row.lineCells > 0 ? [`${row.lineCells.toLocaleString()} bs`] : []),
        ...(row.knotCount > 0 ? [`${row.knotCount} kn`] : []),
      ]
      const counts =
        `${row.stitchCount.toLocaleString()} st · ` +
        (extras.length > 0 ? `${extras.join(' · ')} · ` : '') +
        `~${formatSkein(row.skein)} sk`
      page.drawText(counts, {
        x: x + colW - 8 - fonts.mono.widthOfTextAtSize(counts, 7),
        y: y - 7,
        size: 7,
        font: fonts.mono,
        color: mute,
      })
    }

    const hasLine = pattern.grid.backstitch.length > 0
    const hasKnots = pattern.grid.frenchKnots.length > 0
    const legend =
      'Skein estimates include a 25% safety margin. "sk" is skeins' +
      (hasLine ? ', "bs" cells of back-stitch' : '') +
      (hasKnots ? ', "kn" French knots' : '') +
      '.'
    page.drawText(legend, {
      x: m,
      y: m + 8,
      size: 8,
      font: fonts.body,
      color: mute,
    })
  }
}

/** Cut a label to fit its column, with an ellipsis, rather than wrapping it
 *  into the row below. */
function truncateToWidth(
  text: string,
  font: Fonts['body'],
  size: number,
  maxWidth: number,
): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
  let out = text
  while (out.length > 1 && font.widthOfTextAtSize(`${out}…`, size) > maxWidth) {
    out = out.slice(0, -1)
  }
  return `${out.trimEnd()}…`
}

// ───────────────────────────────────────────────────────────────────────────
// Tiling
// ───────────────────────────────────────────────────────────────────────────

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface Tile {
  /** 1-based page number among the chart pages. */
  page: number
  tx: number
  ty: number
  /** The cells this page owns. Always aligned to the tens grid. */
  core: Rect
  /** What is printed: the core plus the shared overlap on each joined side. */
  region: Rect
}

interface TilePlan {
  cellPt: number
  /** Ruler gutter around the grid, in points. */
  gutterPt: number
  stepX: number
  stepY: number
  tilesX: number
  tilesY: number
  tiles: Tile[]
}

/**
 * Work out how the chart falls across pages.
 *
 * The advance from one page to the next is rounded DOWN to a multiple of ten,
 * which is the whole point: a stitcher counting in tens never has a block cut
 * in half by a page edge, and the ruler numbers on facing tiles line up. The
 * two-cell overlap sits outside that core on any side with a neighbour, so a
 * tile is at most `step + 4` cells wide and still fits the page.
 */
function planTiles(
  pattern: PatternData,
  paper: { width: number; height: number },
  largePrint: boolean,
): TilePlan {
  const m = PAGE_MARGIN_PT
  const base = largePrint ? CELL_PT.large : CELL_PT.normal
  // Wide enough for a three-digit row number in the ruler gutter.
  const gutterFor = (cell: number) => Math.max(13, cell * 1.3)

  const pageW = paper.width - m * 2
  const pageH = paper.height - m * 2 - CHART_HEADER_PT - CHART_FOOTER_PT

  const stepFor = (maxCells: number) =>
    Math.max(
      BLOCK_CELLS,
      Math.floor((maxCells - TILE_OVERLAP_CELLS * 2) / BLOCK_CELLS) * BLOCK_CELLS,
    )
  const baseGutter = gutterFor(base)
  const stepX = stepFor(Math.floor((pageW - baseGutter * 2) / base))
  const stepY = stepFor(Math.floor((pageH - baseGutter * 2) / base))

  // Rounding the advance down to a multiple of ten leaves the page short of
  // full, so spend the slack on bigger cells rather than white paper. Capped
  // at half again the base size, and never smaller than it.
  const effX = Math.min(stepX, pattern.grid.width) + TILE_OVERLAP_CELLS * 2
  const effY = Math.min(stepY, pattern.grid.height) + TILE_OVERLAP_CELLS * 2
  const fits = (cell: number) =>
    effX * cell + gutterFor(cell) * 2 <= pageW && effY * cell + gutterFor(cell) * 2 <= pageH
  let cellPt = base
  for (let candidate = base * 1.5; candidate > base; candidate -= 0.05) {
    if (fits(candidate)) {
      cellPt = candidate
      break
    }
  }
  const gutterPt = gutterFor(cellPt)

  const tilesX = Math.max(1, Math.ceil(pattern.grid.width / stepX))
  const tilesY = Math.max(1, Math.ceil(pattern.grid.height / stepY))

  const tiles: Tile[] = []
  let page = 1
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const coreX = tx * stepX
      const coreY = ty * stepY
      const core: Rect = {
        x: coreX,
        y: coreY,
        width: Math.min(stepX, pattern.grid.width - coreX),
        height: Math.min(stepY, pattern.grid.height - coreY),
      }
      const regionX = Math.max(0, coreX - TILE_OVERLAP_CELLS)
      const regionY = Math.max(0, coreY - TILE_OVERLAP_CELLS)
      const region: Rect = {
        x: regionX,
        y: regionY,
        width: Math.min(pattern.grid.width, core.x + core.width + TILE_OVERLAP_CELLS) - regionX,
        height: Math.min(pattern.grid.height, core.y + core.height + TILE_OVERLAP_CELLS) - regionY,
      }
      tiles.push({ page: page++, tx, ty, core, region })
    }
  }

  return { cellPt, gutterPt, stepX, stepY, tilesX, tilesY, tiles }
}

// ───────────────────────────────────────────────────────────────────────────
// Index sheet
// ───────────────────────────────────────────────────────────────────────────

/**
 * The whole chart, small, with the page grid and page numbers drawn over it.
 * The sheet a stitcher keeps beside them to know which page comes next and
 * where the piece they are working sits in the whole.
 */
async function drawIndexSheet(
  doc: PDFDocument,
  paper: { width: number; height: number },
  pattern: PatternData,
  plan: TilePlan,
  opts: ExportOptions,
  fonts: Fonts,
) {
  const page = doc.addPage([paper.width, paper.height])
  const m = PAGE_MARGIN_PT
  const ink = rgb(0.24, 0.18, 0.13)
  const mute = rgb(0.42, 0.36, 0.28)
  const accent = rgb(0.77, 0.52, 0.42)

  page.drawText('CHART INDEX', {
    x: m,
    y: paper.height - m - 18,
    size: 9,
    font: fonts.mono,
    color: mute,
  })
  page.drawText(
    `${plan.tiles.length} chart page${plan.tiles.length === 1 ? '' : 's'}, ${plan.tilesX} across × ${plan.tilesY} down`,
    { x: m, y: paper.height - m - 40, size: 13, font: fonts.body, color: ink },
  )

  // Leave room for the numbers around the outside of the miniature.
  const gutter = 18
  const topY = paper.height - m - 62
  const maxW = paper.width - m * 2 - gutter * 2
  const maxH = topY - m - 46 - gutter * 2
  const scale = Math.min(maxW / pattern.grid.width, maxH / pattern.grid.height)
  const imgW = pattern.grid.width * scale
  const imgH = pattern.grid.height * scale
  const originX = m + gutter + (maxW - imgW) / 2
  const originY = topY - gutter - imgH - (maxH - imgH) / 2

  // Chart coordinates run top-down; PDF space runs bottom-up.
  const px = (cx: number) => originX + cx * scale
  const py = (cy: number) => originY + imgH - cy * scale

  const svg = renderPatternSvgString(pattern, {
    mode: 'chart',
    cellPx: Math.max(2, Math.ceil(scale * 3)),
    showSymbols: false,
    showGrid: false,
    showCentreCrosshairs: false,
    cellStyle: 'block',
    monochrome: opts.monochrome,
  })
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  const img = await doc.embedPng(png)
  page.drawImage(img, { x: originX, y: originY, width: imgW, height: imgH })

  // Row and column numbers, in whole-chart coordinates. Every ten cells, or
  // the next multiple of ten that still leaves the numbers readable on a very
  // wide chart.
  let labelEvery = BLOCK_CELLS
  while (labelEvery * scale < 13) labelEvery += BLOCK_CELLS
  page.setFont(fonts.mono)
  page.setFontSize(5.5)
  page.setFontColor(mute)
  for (let c = labelEvery; c <= pattern.grid.width; c += labelEvery) {
    page.drawText(String(c), { x: px(c) - 5, y: originY + imgH + 5 })
  }
  for (let r = labelEvery; r <= pattern.grid.height; r += labelEvery) {
    page.drawText(String(r), { x: originX - gutter + 2, y: py(r) - 2 })
  }

  // The page grid: one cell per chart page, numbered in reading order.
  for (const tile of plan.tiles) {
    const x = px(tile.core.x)
    const y = py(tile.core.y + tile.core.height)
    const w = tile.core.width * scale
    const h = tile.core.height * scale
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderColor: accent,
      borderWidth: 0.9,
      opacity: 0,
      borderOpacity: 0.95,
    })
    const label = String(tile.page)
    const size = Math.min(13, Math.max(6, Math.min(w, h) * 0.42))
    const labelW = fonts.display.widthOfTextAtSize(label, size)
    // A pale plate under the number so it reads over any colour beneath.
    page.drawRectangle({
      x: x + w / 2 - labelW / 2 - 2.5,
      y: y + h / 2 - size * 0.42 - 1.5,
      width: labelW + 5,
      height: size * 0.84 + 3,
      color: rgb(1, 1, 1),
      opacity: 0.78,
    })
    page.drawText(label, {
      x: x + w / 2 - labelW / 2,
      y: y + h / 2 - size * 0.36,
      size,
      font: fonts.display,
      color: ink,
    })
  }

  page.drawText(
    `Pages run left to right, then down. Each page repeats ${TILE_OVERLAP_CELLS} rows and columns of its neighbours; the repeat is shaded on the page so nothing gets stitched twice.`,
    {
      x: m,
      y: m + 22,
      size: 8.5,
      lineHeight: 11,
      font: fonts.body,
      color: mute,
      maxWidth: paper.width - m * 2,
    },
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Chart pages
// ───────────────────────────────────────────────────────────────────────────

async function drawChartPages(
  doc: PDFDocument,
  paper: { width: number; height: number },
  pattern: PatternData,
  plan: TilePlan,
  opts: ExportOptions,
  fonts: Fonts,
) {
  const m = PAGE_MARGIN_PT
  const availW = paper.width - m * 2
  const availH = paper.height - m * 2 - CHART_HEADER_PT - CHART_FOOTER_PT

  const ink = rgb(0.24, 0.18, 0.13)
  const mute = rgb(0.42, 0.36, 0.28)
  const accent = rgb(0.77, 0.52, 0.42)

  // Cell lookup and palette colours, built once for the whole chart.
  const gridW = pattern.grid.width
  const cellAt = new Map<number, string>()
  for (const c of pattern.grid.cells) cellAt.set(c.y * gridW + c.x, c.s)
  const colourBySymbol = new Map(pattern.palette.map((p) => [p.symbol, p.rgb]))

  const symbolSize = plan.cellPt * 0.62
  const rulerSize = Math.min(7.5, Math.max(5.5, plan.cellPt * 0.58))
  // Glyph widths are the same on every page; measure each one once.
  const glyphWidth = new Map<string, number>()
  const widthOf = (glyph: string): number => {
    let w = glyphWidth.get(glyph)
    if (w === undefined) {
      w = fonts.body.widthOfTextAtSize(glyph, symbolSize)
      glyphWidth.set(glyph, w)
    }
    return w
  }

  for (const tile of plan.tiles) {
    const page = doc.addPage([paper.width, paper.height])

    // The raster carries the stitches, the grid and the overlap wash — the
    // parts that are made of colour. Nothing that has to stay legible at
    // printed size goes into it.
    const svg = renderPatternSvgString(pattern, {
      cellPx: plan.cellPt * RASTER_SCALE,
      showSymbols: false,
      showGrid: false,
      showCentreCrosshairs: false,
      monochrome: opts.monochrome,
      cellStyle: 'block',
      region: tile.region,
      core: tile.core,
    })
    // Indexed PNG. A tile's flat colours are all kept; only the antialiased
    // edges shift, by an average of under two levels per channel, and the
    // file lands at a quarter of the size — which matters across two dozen
    // pages of a showpiece chart.
    const png = await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0 })
      .toBuffer()
    const img = await doc.embedPng(png)

    const imgW = tile.region.width * plan.cellPt
    const imgH = tile.region.height * plan.cellPt
    const originX = m + plan.gutterPt + (availW - plan.gutterPt * 2 - imgW) / 2
    const originY =
      m + CHART_FOOTER_PT + plan.gutterPt + (availH - plan.gutterPt * 2 - imgH) / 2
    page.drawImage(img, { x: originX, y: originY, width: imgW, height: imgH })

    // Chart coordinates run top-down; PDF space runs bottom-up.
    const px = (cx: number) => originX + (cx - tile.region.x) * plan.cellPt
    const py = (cy: number) => originY + imgH - (cy - tile.region.y) * plan.cellPt

    // ── Grid ─────────────────────────────────────────────────────────────
    // Drawn here rather than in the raster so the hairlines stay hairlines on
    // paper. Every tenth line is heavier, which is what the ruler numbers
    // count in and what a stitcher counts blocks by.
    const regionMaxX = tile.region.x + tile.region.width
    const regionMaxY = tile.region.y + tile.region.height
    const gridMinor = rgb(0.42, 0.36, 0.28)
    for (let c = tile.region.x; c <= regionMaxX; c++) {
      const isEdge = c === 0 || c === pattern.grid.width
      const isMajor = c % BLOCK_CELLS === 0
      page.drawLine({
        start: { x: px(c), y: py(tile.region.y) },
        end: { x: px(c), y: py(regionMaxY) },
        thickness: isEdge ? 1.2 : isMajor ? 0.65 : 0.3,
        color: isEdge || isMajor ? ink : gridMinor,
        opacity: isEdge ? 0.95 : isMajor ? 0.9 : 0.6,
      })
    }
    for (let r = tile.region.y; r <= regionMaxY; r++) {
      const isEdge = r === 0 || r === pattern.grid.height
      const isMajor = r % BLOCK_CELLS === 0
      page.drawLine({
        start: { x: px(tile.region.x), y: py(r) },
        end: { x: px(regionMaxX), y: py(r) },
        thickness: isEdge ? 1.2 : isMajor ? 0.65 : 0.3,
        color: isEdge || isMajor ? ink : gridMinor,
        opacity: isEdge ? 0.95 : isMajor ? 0.9 : 0.6,
      })
    }

    // Centre lines, for anyone starting from the middle of the fabric.
    const centreX = pattern.grid.width / 2
    const centreY = pattern.grid.height / 2
    if (centreX >= tile.region.x && centreX <= regionMaxX) {
      page.drawLine({
        start: { x: px(centreX), y: py(tile.region.y) },
        end: { x: px(centreX), y: py(regionMaxY) },
        thickness: 1,
        color: accent,
        opacity: 0.8,
        dashArray: [4, 3],
      })
    }
    if (centreY >= tile.region.y && centreY <= regionMaxY) {
      page.drawLine({
        start: { x: px(tile.region.x), y: py(centreY) },
        end: { x: px(regionMaxX), y: py(centreY) },
        thickness: 1,
        color: accent,
        opacity: 0.8,
        dashArray: [4, 3],
      })
    }

    // ── Symbols, as real text ────────────────────────────────────────────
    // Drawn over the stitches at the printer's own resolution rather than
    // baked into the bitmap. Overlap cells are drawn faintly, matching the
    // wash beneath them.
    const coreMaxX = tile.core.x + tile.core.width
    const coreMaxY = tile.core.y + tile.core.height
    for (let y = tile.region.y; y < regionMaxY; y++) {
      const inCoreRow = y >= tile.core.y && y < coreMaxY
      for (let x = tile.region.x; x < regionMaxX; x++) {
        const symbol = cellAt.get(y * gridW + x)
        if (symbol === undefined) continue
        const swatch = colourBySymbol.get(symbol)
        if (swatch === undefined) continue
        const glyph = fonts.clean(symbol)
        if (glyph.length === 0) continue
        const inCore = inCoreRow && x >= tile.core.x && x < coreMaxX
        page.drawText(glyph, {
          x: px(x) + plan.cellPt / 2 - widthOf(glyph) / 2,
          y: py(y + 1) + plan.cellPt * 0.29,
          size: symbolSize,
          font: fonts.body,
          color: opts.monochrome ? ink : hexColour(symbolOnFill(swatch)),
          opacity: inCore ? 1 : 0.32,
        })
      }
    }

    // ── Rulers ───────────────────────────────────────────────────────────
    // Whole-chart row and column numbers on the tens lines, on all four
    // edges, so the tile can be placed without counting from a page corner.
    const firstCol = Math.ceil(tile.region.x / BLOCK_CELLS) * BLOCK_CELLS
    for (let c = firstCol; c <= regionMaxX; c += BLOCK_CELLS) {
      if (c === 0) continue
      const label = String(c)
      const w = fonts.mono.widthOfTextAtSize(label, rulerSize)
      const x = px(c) - w / 2
      page.drawText(label, {
        x,
        y: originY + imgH + plan.gutterPt * 0.3,
        size: rulerSize,
        font: fonts.mono,
        color: mute,
      })
      page.drawText(label, {
        x,
        y: originY - plan.gutterPt * 0.62,
        size: rulerSize,
        font: fonts.mono,
        color: mute,
      })
    }
    const firstRow = Math.ceil(tile.region.y / BLOCK_CELLS) * BLOCK_CELLS
    for (let r = firstRow; r <= regionMaxY; r += BLOCK_CELLS) {
      if (r === 0) continue
      const label = String(r)
      const w = fonts.mono.widthOfTextAtSize(label, rulerSize)
      const y = py(r) - rulerSize * 0.35
      page.drawText(label, {
        x: originX - plan.gutterPt * 0.5 - w / 2,
        y,
        size: rulerSize,
        font: fonts.mono,
        color: mute,
      })
      page.drawText(label, {
        x: originX + imgW + plan.gutterPt * 0.5 - w / 2,
        y,
        size: rulerSize,
        font: fonts.mono,
        color: mute,
      })
    }

    // ── Header and footer ────────────────────────────────────────────────
    page.drawText(`PAGE ${tile.page} OF ${plan.tiles.length}`, {
      x: m,
      y: paper.height - m - 12,
      size: 9,
      font: fonts.mono,
      color: ink,
    })
    const range =
      `COLUMNS ${tile.core.x + 1}-${coreMaxX} · ROWS ${tile.core.y + 1}-${coreMaxY}`
    page.drawText(range, {
      x: paper.width - m - fonts.mono.widthOfTextAtSize(range, 8.5),
      y: paper.height - m - 12,
      size: 8.5,
      font: fonts.mono,
      color: mute,
    })

    page.drawText(
      'Shaded cells repeat the neighbouring page. Numbers are whole-chart rows and columns.',
      { x: m, y: m + 14, size: 8, font: fonts.body, color: mute },
    )
    drawTileMap(page, { paper, m, ink, mute, accent }, plan.tilesX, plan.tilesY, tile.tx, tile.ty)
  }
}

function drawTileMap(
  page: ReturnType<PDFDocument['addPage']>,
  ctx: {
    paper: { width: number; height: number }
    m: number
    ink: ReturnType<typeof rgb>
    mute: ReturnType<typeof rgb>
    accent: ReturnType<typeof rgb>
  },
  tilesX: number,
  tilesY: number,
  curX: number,
  curY: number,
) {
  const mapMax = 60
  const cellSize = Math.min(mapMax / tilesX, mapMax / tilesY)
  const mapW = cellSize * tilesX
  const baseX = ctx.paper.width - ctx.m - mapW
  const baseY = ctx.m + 4
  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      const isCurrent = x === curX && y === curY
      const gap = Math.min(1.2, cellSize * 0.12)
      page.drawRectangle({
        x: baseX + x * cellSize,
        y: baseY + (tilesY - 1 - y) * cellSize,
        width: cellSize - gap,
        height: cellSize - gap,
        color: isCurrent ? ctx.accent : ctx.mute,
        opacity: isCurrent ? 1 : 0.28,
      })
    }
  }
}

function scaleFit(w: number, h: number, maxW: number, maxH: number): { w: number; h: number } {
  const scale = Math.min(maxW / w, maxH / h)
  return { w: w * scale, h: h * scale }
}

function describeFinishedSize(fabric: Fabric, pattern: PatternData): string {
  const cmW = (pattern.grid.width / fabric.count) * 2.54
  const cmH = (pattern.grid.height / fabric.count) * 2.54
  return `${cmW.toFixed(1)} × ${cmH.toFixed(1)} cm (${(cmW / 2.54).toFixed(1)} × ${(cmH / 2.54).toFixed(1)} in)`
}

function hexColour(hex: string): ReturnType<typeof rgb> {
  const [r, g, b] = hexToRgbTuple(hex)
  return rgb(r / 255, g / 255, b / 255)
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

function formatSkein(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}
