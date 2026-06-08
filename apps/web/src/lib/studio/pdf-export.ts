/**
 * PDF export for a Pattern. Composes:
 *   1. Cover page — title, designer, finished size, totals
 *   2. Floss key page — every palette entry with stitch count + skein
 *   3. Chart pages — tiled across the chosen paper size with overlap
 *      and a tile-position thumbnail map on every page
 *
 * Uses pdf-lib for the page composition and sharp to rasterise each
 * chart tile from the same SVG renderer the on-screen viewport uses.
 * Result: the PDF reads as the same chart, just printable.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import sharp from 'sharp'
import {
  estimateSkeinCount,
  type PatternData,
  type Fabric,
} from '@homemade/db'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'

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

interface ExportOptions {
  paper: PaperKey
  monochrome?: boolean
  designerName?: string | null
}

export async function buildPatternPdf(
  pattern: PatternData,
  patternName: string,
  opts: ExportOptions,
): Promise<Uint8Array> {
  const paper = PAPER_DIMENSIONS_PT[opts.paper]
  const doc = await PDFDocument.create()
  const display = await doc.embedFont(StandardFonts.HelveticaBold)
  const body = await doc.embedFont(StandardFonts.Helvetica)
  const mono = await doc.embedFont(StandardFonts.Courier)

  await drawCover(doc, paper, pattern, patternName, opts, { display, body, mono })
  await drawFlossKey(doc, paper, pattern, opts, { display, body, mono })
  await drawChartPages(doc, paper, pattern, opts, { display, body, mono })

  return await doc.save()
}

type Fonts = {
  display: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>
  body: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>
  mono: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>
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
  page.drawText(patternName, {
    x: m,
    y: paper.height - m - 64,
    size: 32,
    font: fonts.display,
    color: ink,
  })

  if (opts.designerName) {
    page.drawText(`by ${opts.designerName}`, {
      x: m,
      y: paper.height - m - 88,
      size: 12,
      font: fonts.body,
      color: mute,
    })
  }

  // Hero thumbnail — square aspect, sized to leave room for the spec table.
  const heroBoxW = paper.width - m * 2
  const heroBoxH = Math.min(380, paper.height * 0.42)
  const heroSvg = renderPatternSvgString(pattern, {
    cellPx: 18,
    showSymbols: false,
    showGrid: false,
    showCentreCrosshairs: false,
    padding: 18,
    monochrome: opts.monochrome,
  })
  const heroPng = await sharp(Buffer.from(heroSvg))
    .resize(Math.round(heroBoxW * 2), Math.round(heroBoxH * 2), { fit: 'contain', background: { r: 245, g: 240, b: 232 } })
    .png()
    .toBuffer()
  const heroImage = await doc.embedPng(heroPng)
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
    ['Paper', paper.label],
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

async function drawFlossKey(
  doc: PDFDocument,
  paper: { width: number; height: number },
  pattern: PatternData,
  opts: ExportOptions,
  fonts: Fonts,
) {
  const page = doc.addPage([paper.width, paper.height])
  const m = PAGE_MARGIN_PT
  const ink = rgb(0.24, 0.18, 0.13)
  const mute = rgb(0.42, 0.36, 0.28)

  page.drawText('FLOSS KEY', {
    x: m,
    y: paper.height - m - 18,
    size: 9,
    font: fonts.mono,
    color: mute,
  })

  // Column layout
  const colW = (paper.width - m * 2) / 2
  const rowH = 22
  const startY = paper.height - m - 50

  const rows = pattern.palette.map((entry) => {
    let stitchCount = 0
    for (const cell of pattern.grid.cells) if (cell.s === entry.symbol) stitchCount++
    const skein = estimateSkeinCount(pattern, entry.symbol)
    return { entry, stitchCount, skein }
  })

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const colIdx = Math.floor(i / Math.ceil(rows.length / 2))
    const rowIdx = i % Math.ceil(rows.length / 2)
    const x = m + colIdx * colW
    const y = startY - rowIdx * rowH

    // Colour swatch
    const swatchHex = opts.monochrome ? '#ffffff' : row.entry.rgb
    const [r, g, b] = hexToRgbTuple(swatchHex)
    page.drawRectangle({
      x,
      y: y - 13,
      width: 14,
      height: 14,
      color: rgb(r / 255, g / 255, b / 255),
      borderColor: ink,
      borderWidth: 0.5,
    })

    // Symbol
    page.drawText(row.entry.symbol, {
      x: x + 22,
      y: y - 9,
      size: 10,
      font: fonts.mono,
      color: ink,
    })

    // Code + name
    page.drawText(`${row.entry.brand} ${row.entry.code}`, {
      x: x + 44,
      y: y - 9,
      size: 9,
      font: fonts.mono,
      color: mute,
    })
    page.drawText(row.entry.name, {
      x: x + 110,
      y: y - 9,
      size: 10,
      font: fonts.body,
      color: ink,
      maxWidth: colW - 220,
    })

    // Stitches + skein
    page.drawText(`${row.stitchCount.toLocaleString()} st · ~${formatSkein(row.skein)} skein${row.skein > 1 ? 's' : ''}`, {
      x: x + colW - 130,
      y: y - 9,
      size: 9,
      font: fonts.mono,
      color: mute,
    })
  }

  // Footer note
  page.drawText('Skein estimates include a 25% safety margin.', {
    x: m,
    y: m + 8,
    size: 8,
    font: fonts.body,
    color: mute,
  })
}

async function drawChartPages(
  doc: PDFDocument,
  paper: { width: number; height: number },
  pattern: PatternData,
  opts: ExportOptions,
  fonts: Fonts,
) {
  const m = PAGE_MARGIN_PT
  const availW = paper.width - m * 2
  const availH = paper.height - m * 2 - 40

  // Pick a cell pixel size that yields a readable density (>= 24 px / cell
  // on screen ≈ 8 px / cell at print 300dpi). For larger patterns we
  // tile across more pages.
  const cellPx = 18
  const cellsPerPageX = Math.max(10, Math.floor(availW / cellPx))
  const cellsPerPageY = Math.max(10, Math.floor(availH / cellPx))

  const tilesX = Math.ceil(pattern.grid.width / (cellsPerPageX - TILE_OVERLAP_CELLS))
  const tilesY = Math.ceil(pattern.grid.height / (cellsPerPageY - TILE_OVERLAP_CELLS))

  const ink = rgb(0.24, 0.18, 0.13)
  const mute = rgb(0.42, 0.36, 0.28)
  const accent = rgb(0.77, 0.52, 0.42)

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const page = doc.addPage([paper.width, paper.height])

      const regionX = tx * (cellsPerPageX - TILE_OVERLAP_CELLS)
      const regionY = ty * (cellsPerPageY - TILE_OVERLAP_CELLS)
      const regionW = Math.min(cellsPerPageX, pattern.grid.width - regionX)
      const regionH = Math.min(cellsPerPageY, pattern.grid.height - regionY)

      const svg = renderPatternSvgString(pattern, {
        cellPx,
        showSymbols: true,
        showGrid: true,
        showCentreCrosshairs: true,
        monochrome: opts.monochrome,
        region: { x: regionX, y: regionY, width: regionW, height: regionH },
      })
      const png = await sharp(Buffer.from(svg))
        .png()
        .toBuffer()
      const img = await doc.embedPng(png)

      const placed = scaleFit(img.width, img.height, availW, availH)
      page.drawImage(img, {
        x: m + (availW - placed.w) / 2,
        y: m + 40 + (availH - placed.h) / 2,
        width: placed.w,
        height: placed.h,
      })

      // Header
      page.drawText(`Tile ${tx + 1}.${ty + 1}`, {
        x: m,
        y: paper.height - m - 12,
        size: 9,
        font: fonts.mono,
        color: mute,
      })

      // Footer: tile-position thumbnail map
      drawTileMap(page, { paper, m, ink, mute, accent }, tilesX, tilesY, tx, ty)
    }
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
      page.drawRectangle({
        x: baseX + x * cellSize,
        y: baseY + (tilesY - 1 - y) * cellSize,
        width: cellSize,
        height: cellSize,
        color: isCurrent ? ctx.accent : ctx.mute,
        opacity: isCurrent ? 1 : 0.32,
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

function hexToRgbTuple(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

function formatSkein(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}
