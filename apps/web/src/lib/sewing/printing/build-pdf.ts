/**
 * Builds a tiled-print PDF for a sewing pattern via pdf-lib. Each page
 * carries:
 *   - Registration marks at the four corners (1cm cross, 0.5pt stroke)
 *   - The pattern fragment within the tile's window
 *   - Page number + (col, row) coordinates in the bottom-right
 *   - A small assembly-map thumbnail in the top-right of page 1, showing
 *     which tile is which
 *   - A 5cm × 5cm test square on page 1 for calibration
 *
 * Pure render: no DB, no fetches. The page route hands in the pattern
 * data + paper choice, this returns Uint8Array bytes the client offers
 * as a download.
 *
 * Lines render via pdf-lib's `drawLine` and pieces render by walking
 * pathPoints and emitting `drawLine` for each segment (closed polyline).
 * Curves and arcs are out of scope; pieces are assumed to be sampled
 * polylines.
 */

import { PDFDocument, StandardFonts, rgb, type PDFPage } from 'pdf-lib'

import type { SewingPatternData, SewingPiece } from '@/components/studio/sewing/types'
import {
  buildTileMap,
  mmToPt,
  PAPER,
  type PageTile,
  type PaperSize,
} from './page-tiles'

interface BuildPdfArgs {
  pattern: SewingPatternData
  paper: PaperSize
  overlapMm?: number
  marginMm?: number
}

const INK = rgb(0, 0, 0)
const SEAM = rgb(0.45, 0.45, 0.45)
const FOLD = rgb(0.4, 0.3, 0.55)
const REG = rgb(0.5, 0.5, 0.5)

export async function buildSewingPatternPdf({
  pattern,
  paper,
  overlapMm,
  marginMm,
}: BuildPdfArgs): Promise<Uint8Array> {
  const bounds = computePatternBounds(pattern)
  const tileMap = buildTileMap({ bounds, paper, overlapMm, marginMm })
  const dims = PAPER[paper]

  const pdf = await PDFDocument.create()
  pdf.setTitle(`${pattern.name} - tiled print`)
  pdf.setCreator('homemade')

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  for (const tile of tileMap.tiles) {
    const page = pdf.addPage([mmToPt(dims.widthMm), mmToPt(dims.heightMm)])
    drawRegistrationMarks(page, dims, tile.contentMarginMm)
    drawPageFooter(page, pattern, tile, tileMap.cols, tileMap.rows, font, fontBold)
    drawTileContent(page, pattern.pieces, tile)
    if (tile.pageNumber === 1) {
      drawAssemblyMap(page, dims, tileMap, font)
      drawTestSquare(page, dims, font, fontBold)
      drawScaleWarning(page, dims, fontBold)
    }
  }

  return pdf.save()
}

function drawRegistrationMarks(page: PDFPage, dims: { widthMm: number; heightMm: number }, marginMm: number) {
  const arm = 5 // 5mm crosshair
  const corners = [
    { x: marginMm, y: marginMm },
    { x: dims.widthMm - marginMm, y: marginMm },
    { x: marginMm, y: dims.heightMm - marginMm },
    { x: dims.widthMm - marginMm, y: dims.heightMm - marginMm },
  ]
  for (const c of corners) {
    page.drawLine({
      start: { x: mmToPt(c.x - arm), y: mmToPt(c.y) },
      end: { x: mmToPt(c.x + arm), y: mmToPt(c.y) },
      thickness: 0.5,
      color: REG,
    })
    page.drawLine({
      start: { x: mmToPt(c.x), y: mmToPt(c.y - arm) },
      end: { x: mmToPt(c.x), y: mmToPt(c.y + arm) },
      thickness: 0.5,
      color: REG,
    })
  }
}

function drawPageFooter(
  page: PDFPage,
  pattern: SewingPatternData,
  tile: PageTile,
  cols: number,
  rows: number,
  font: typeof StandardFonts extends never ? never : Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontBold: typeof StandardFonts extends never ? never : Awaited<ReturnType<PDFDocument['embedFont']>>,
) {
  const dims = page.getSize()
  const footerY = mmToPt(5)
  page.drawText(`${pattern.name}`, {
    x: mmToPt(5),
    y: footerY,
    size: 8,
    font: fontBold,
    color: INK,
  })
  page.drawText(`Page ${tile.pageNumber} of ${cols * rows} - col ${tile.col}, row ${tile.row}`, {
    x: dims.width - mmToPt(80),
    y: footerY,
    size: 8,
    font,
    color: INK,
  })
  if (pattern.attributionText) {
    page.drawText(pattern.attributionText, {
      x: mmToPt(5),
      y: footerY - mmToPt(3.5),
      size: 6,
      font,
      color: INK,
    })
  }
}

function drawTileContent(page: PDFPage, pieces: SewingPiece[], tile: PageTile) {
  // Translate pattern-space coords so the tile's window origin sits at
  // (marginMm, marginMm) on the page. PDF coords run from bottom-left;
  // we flip Y so pattern-y grows downward like the viewer.
  const dims = page.getSize()
  const tileWidthMm = tile.windowMaxX - tile.windowMinX
  const tileHeightMm = tile.windowMaxY - tile.windowMinY

  for (const piece of pieces) {
    const segments = pieceSegments(piece, tile)
    for (const seg of segments) {
      page.drawLine({
        start: {
          x: mmToPt(tile.contentMarginMm + (seg.from.x - tile.windowMinX)),
          y: dims.height - mmToPt(tile.contentMarginMm + (seg.from.y - tile.windowMinY)),
        },
        end: {
          x: mmToPt(tile.contentMarginMm + (seg.to.x - tile.windowMinX)),
          y: dims.height - mmToPt(tile.contentMarginMm + (seg.to.y - tile.windowMinY)),
        },
        thickness: 1,
        color: INK,
      })
    }
    // Grainline.
    const gSegs = lineThroughTile(piece.grainline.from, piece.grainline.to, tile)
    for (const seg of gSegs) {
      page.drawLine({
        start: {
          x: mmToPt(tile.contentMarginMm + (seg.from.x - tile.windowMinX)),
          y: dims.height - mmToPt(tile.contentMarginMm + (seg.from.y - tile.windowMinY)),
        },
        end: {
          x: mmToPt(tile.contentMarginMm + (seg.to.x - tile.windowMinX)),
          y: dims.height - mmToPt(tile.contentMarginMm + (seg.to.y - tile.windowMinY)),
        },
        thickness: 0.7,
        color: SEAM,
      })
    }
    // Fold edge.
    if (piece.onFoldEdge) {
      const fSegs = lineThroughTile(piece.onFoldEdge.from, piece.onFoldEdge.to, tile)
      for (const seg of fSegs) {
        page.drawLine({
          start: {
            x: mmToPt(tile.contentMarginMm + (seg.from.x - tile.windowMinX)),
            y: dims.height - mmToPt(tile.contentMarginMm + (seg.from.y - tile.windowMinY)),
          },
          end: {
            x: mmToPt(tile.contentMarginMm + (seg.to.x - tile.windowMinX)),
            y: dims.height - mmToPt(tile.contentMarginMm + (seg.to.y - tile.windowMinY)),
          },
          thickness: 0.7,
          color: FOLD,
          dashArray: [3, 2],
        })
      }
    }
  }

  // Suppress unused-vars (pdf-lib doesn't expose tile size beyond this scope).
  void tileWidthMm
  void tileHeightMm
}

function pieceSegments(piece: SewingPiece, tile: PageTile): { from: { x: number; y: number }; to: { x: number; y: number } }[] {
  const pts = piece.pathPoints
  const out: { from: { x: number; y: number }; to: { x: number; y: number } }[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    if (!a || !b) continue
    const clipped = clipSegmentToTile(a, b, tile)
    if (clipped) out.push(clipped)
  }
  return out
}

function lineThroughTile(
  a: { x: number; y: number },
  b: { x: number; y: number },
  tile: PageTile,
): { from: { x: number; y: number }; to: { x: number; y: number } }[] {
  const c = clipSegmentToTile(a, b, tile)
  return c ? [c] : []
}

function clipSegmentToTile(
  a: { x: number; y: number },
  b: { x: number; y: number },
  tile: PageTile,
): { from: { x: number; y: number }; to: { x: number; y: number } } | null {
  // Liang-Barsky line clipping against tile window.
  const xmin = tile.windowMinX
  const xmax = tile.windowMaxX
  const ymin = tile.windowMinY
  const ymax = tile.windowMaxY
  const dx = b.x - a.x
  const dy = b.y - a.y
  let t0 = 0
  let t1 = 1
  const p: [number, number, number, number] = [-dx, dx, -dy, dy]
  const q: [number, number, number, number] = [a.x - xmin, xmax - a.x, a.y - ymin, ymax - a.y]
  for (let i = 0; i < 4; i++) {
    const pi = p[i] as number
    const qi = q[i] as number
    if (pi === 0) {
      if (qi < 0) return null
    } else {
      const r = qi / pi
      if (pi < 0) {
        if (r > t1) return null
        else if (r > t0) t0 = r
      } else {
        if (r < t0) return null
        else if (r < t1) t1 = r
      }
    }
  }
  return {
    from: { x: a.x + t0 * dx, y: a.y + t0 * dy },
    to: { x: a.x + t1 * dx, y: a.y + t1 * dy },
  }
}

function drawAssemblyMap(
  page: PDFPage,
  dims: { widthMm: number; heightMm: number },
  tileMap: ReturnType<typeof buildTileMap>,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
) {
  const dimsPt = page.getSize()
  const mapWidthMm = 40
  const mapHeightMm = 40 * (tileMap.rows / Math.max(tileMap.cols, 1))
  const baseX = dims.widthMm - tileMap.marginMm - mapWidthMm
  const baseY = dims.heightMm - tileMap.marginMm - mapHeightMm - 5
  const cellW = mapWidthMm / tileMap.cols
  const cellH = mapHeightMm / Math.max(tileMap.rows, 1)
  for (const tile of tileMap.tiles) {
    const x = baseX + (tile.col - 1) * cellW
    const y = baseY + (tile.row - 1) * cellH
    page.drawRectangle({
      x: mmToPt(x),
      y: dimsPt.height - mmToPt(y + cellH),
      width: mmToPt(cellW),
      height: mmToPt(cellH),
      borderColor: INK,
      borderWidth: 0.4,
    })
    page.drawText(String(tile.pageNumber), {
      x: mmToPt(x + cellW / 2 - 2),
      y: dimsPt.height - mmToPt(y + cellH / 2 + 1),
      size: 5,
      font,
      color: INK,
    })
  }
  page.drawText('Page layout', {
    x: mmToPt(baseX),
    y: dimsPt.height - mmToPt(baseY - 1),
    size: 6,
    font,
    color: INK,
  })
}

function drawTestSquare(
  page: PDFPage,
  dims: { widthMm: number; heightMm: number },
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>,
) {
  const dimsPt = page.getSize()
  const x = 15
  const y = 15
  const size = 50 // 5cm
  page.drawRectangle({
    x: mmToPt(x),
    y: dimsPt.height - mmToPt(y + size),
    width: mmToPt(size),
    height: mmToPt(size),
    borderColor: INK,
    borderWidth: 1,
  })
  page.drawText('5 cm × 5 cm test square', {
    x: mmToPt(x),
    y: dimsPt.height - mmToPt(y + size + 4),
    size: 7,
    font: fontBold,
    color: INK,
  })
  page.drawText(
    'If this square measures 5 cm with a ruler, your printer is calibrated.',
    {
      x: mmToPt(x),
      y: dimsPt.height - mmToPt(y + size + 7.5),
      size: 6,
      font,
      color: INK,
    },
  )
}

function drawScaleWarning(
  page: PDFPage,
  dims: { widthMm: number; heightMm: number },
  fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>,
) {
  const dimsPt = page.getSize()
  page.drawText('Print at 100% scale. Do not select "Fit to page".', {
    x: mmToPt(70),
    y: dimsPt.height - mmToPt(15),
    size: 8,
    font: fontBold,
    color: INK,
  })
}

function computePatternBounds(pattern: SewingPatternData): {
  minX: number
  minY: number
  widthMm: number
  heightMm: number
} {
  if (pattern.pieces.length === 0) return { minX: 0, minY: 0, widthMm: 200, heightMm: 200 }
  // Lay pieces in a row with 40mm gaps so each piece prints separately.
  let cursorX = 0
  let maxY = 0
  let minX = 0
  let minY = 0
  let maxX = 0
  let first = true
  for (const piece of pattern.pieces) {
    const w = pieceBboxWidth(piece)
    const h = pieceBboxHeight(piece)
    const pieceMinX = cursorX
    const pieceMaxX = cursorX + w
    if (first) {
      minX = pieceMinX
      minY = 0
      first = false
    }
    if (pieceMaxX > maxX) maxX = pieceMaxX
    if (h > maxY) maxY = h
    cursorX += w + 40
  }
  return {
    minX,
    minY,
    widthMm: maxX - minX,
    heightMm: maxY - minY,
  }
}

function pieceBboxWidth(piece: SewingPiece): number {
  let min = Infinity
  let max = -Infinity
  for (const p of piece.pathPoints) {
    if (p.x < min) min = p.x
    if (p.x > max) max = p.x
  }
  return max - min
}

function pieceBboxHeight(piece: SewingPiece): number {
  let min = Infinity
  let max = -Infinity
  for (const p of piece.pathPoints) {
    if (p.y < min) min = p.y
    if (p.y > max) max = p.y
  }
  return max - min
}
