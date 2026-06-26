/**
 * Printable 1:1 transfer template — the line drawing tiled across real A4 / US
 * Letter pages at exact millimetre scale, with corner registration marks + page
 * labels so the sheets line up when overlapped, plus a calibration sheet (a known
 * square the stitcher measures to confirm "print at 100%"). Same dataset as the
 * hero + the document, so it can never drift from the finished piece.
 *
 * Output is page-sized SVG (each page is true mm); SVG prints at exact scale and
 * converts cleanly to PDF downstream. For a hoop-sized design this is usually one
 * page; larger designs tile.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'

const PAGE = {
  A4: { widthMm: 210, heightMm: 297 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
} as const

export interface PrintPage { name: string; row: number; col: number; svg: string }
export interface PrintTemplate {
  page: 'A4' | 'Letter'
  pageSizeMm: { widthMm: number; heightMm: number }
  cols: number
  rows: number
  pages: PrintPage[]
  /** Standalone calibration sheet — print with the pages and measure the square. */
  calibrationSvg: string
}

export interface PrintOptions {
  page?: 'A4' | 'Letter'
  /** Page margin (mm). Default 10. */ marginMm?: number
  /** Overlap between tiles (mm) for gluing. Default 12. */ overlapMm?: number
  /** Calibration square side (mm). Default 50. */ calibrationMm?: number
  stroke?: string
}

const LINE_SLUGS = new Set([
  'embroidery-stem', 'embroidery-outline', 'embroidery-back', 'embroidery-split',
  'embroidery-running', 'embroidery-straight', 'embroidery-fern', 'embroidery-couching',
])

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Draw the elements as a line drawing in design-mm coordinates (no <svg> wrapper). */
function drawBody(elements: StitchedElement[], stroke: string): string {
  let body = ''
  for (const el of elements) {
    const g = el.geometry
    if (g.kind === 'point' && g.at) {
      body += `<circle cx="${r2(g.at[0])}" cy="${r2(g.at[1])}" r="1.3" fill="none" stroke="${stroke}" stroke-width="0.4"/>`
      continue
    }
    const pts = g.points
    if (pts && pts.length >= 2) {
      const d = pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' ')
      body += LINE_SLUGS.has(el.stitchType)
        ? `<polyline points="${d}" fill="none" stroke="${stroke}" stroke-width="0.65" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<polygon points="${d}" fill="none" stroke="${stroke}" stroke-width="0.5" stroke-linejoin="round"/>`
    }
  }
  return body
}

/** Corner registration crosses + a faint printable-area frame for one page. */
function pageMarks(px: number, py: number, pw: number, ph: number, label: string, stroke: string): string {
  const m = 5 // cross arm length
  const cross = (x: number, y: number) =>
    `<path d="M${r2(x - m)},${r2(y)} H${r2(x + m)} M${r2(x)},${r2(y - m)} V${r2(y + m)}" stroke="${stroke}" stroke-width="0.3"/>`
  return (
    `<rect x="${r2(px)}" y="${r2(py)}" width="${r2(pw)}" height="${r2(ph)}" fill="none" stroke="${stroke}" stroke-width="0.2" stroke-dasharray="2 2"/>` +
    cross(px, py) + cross(px + pw, py) + cross(px, py + ph) + cross(px + pw, py + ph) +
    `<text x="${r2(px + pw - 2)}" y="${r2(py + ph - 2)}" font-family="sans-serif" font-size="4" fill="${stroke}" text-anchor="end">${label}</text>`
  )
}

export function patternToPrintTemplate(
  elements: StitchedElement[],
  designSizeMm: { width: number; height: number },
  opts: PrintOptions = {},
): PrintTemplate {
  const pageKey = opts.page ?? 'A4'
  const pageSizeMm = PAGE[pageKey]
  const margin = opts.marginMm ?? 10
  const overlap = opts.overlapMm ?? 12
  const stroke = opts.stroke ?? '#1b2a4a'
  const printW = pageSizeMm.widthMm - 2 * margin
  const printH = pageSizeMm.heightMm - 2 * margin
  const stepX = Math.max(1, printW - overlap)
  const stepY = Math.max(1, printH - overlap)
  const cols = Math.max(1, Math.ceil((designSizeMm.width - overlap) / stepX))
  const rows = Math.max(1, Math.ceil((designSizeMm.height - overlap) / stepY))

  const body = drawBody(elements, stroke)
  const pages: PrintPage[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // The design region this page shows starts here (mm, design space).
      const ox = col * stepX
      const oy = row * stepY
      const label = `Sheet ${row * cols + col + 1} of ${rows * cols}  (row ${row + 1}, col ${col + 1})`
      // Clip the design to the printable area; translate so the region sits at the margin.
      const clipId = `clip-${row}-${col}`
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${r2(pageSizeMm.widthMm)}mm" height="${r2(pageSizeMm.heightMm)}mm" viewBox="0 0 ${r2(pageSizeMm.widthMm)} ${r2(pageSizeMm.heightMm)}">` +
        `<rect width="100%" height="100%" fill="#ffffff"/>` +
        `<defs><clipPath id="${clipId}"><rect x="${r2(margin)}" y="${r2(margin)}" width="${r2(printW)}" height="${r2(printH)}"/></clipPath></defs>` +
        `<g clip-path="url(#${clipId})"><g transform="translate(${r2(margin - ox)} ${r2(margin - oy)})">${body}</g></g>` +
        pageMarks(margin, margin, printW, printH, label, stroke) +
        `</svg>`
      pages.push({ name: `${pageKey}-r${row + 1}c${col + 1}`, row, col, svg })
    }
  }

  const cal = opts.calibrationMm ?? 50
  const cx = margin
  const cy = margin
  const calibrationSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${r2(pageSizeMm.widthMm)}mm" height="${r2(pageSizeMm.heightMm)}mm" viewBox="0 0 ${r2(pageSizeMm.widthMm)} ${r2(pageSizeMm.heightMm)}">` +
    `<rect width="100%" height="100%" fill="#ffffff"/>` +
    `<rect x="${r2(cx)}" y="${r2(cy)}" width="${r2(cal)}" height="${r2(cal)}" fill="none" stroke="${stroke}" stroke-width="0.4"/>` +
    `<path d="M${r2(cx)},${r2(cy + cal / 2)} H${r2(cx + cal)} M${r2(cx + cal / 2)},${r2(cy)} V${r2(cy + cal)}" stroke="${stroke}" stroke-width="0.2"/>` +
    `<text x="${r2(cx)}" y="${r2(cy + cal + 8)}" font-family="sans-serif" font-size="4.5" fill="${stroke}">Calibration: this square must measure ${cal} mm.</text>` +
    `<text x="${r2(cx)}" y="${r2(cy + cal + 14)}" font-family="sans-serif" font-size="4" fill="${stroke}">Print at 100% (actual size), not “fit to page”. Check the square before transferring.</text>` +
    `</svg>`

  return { page: pageKey, pageSizeMm, cols, rows, pages, calibrationSvg }
}
