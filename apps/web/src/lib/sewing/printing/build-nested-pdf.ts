// SPDX-License-Identifier: MIT
/**
 * Multi-size nested PDF builder.
 *
 * Rationale for the chosen approach (recorded for S-5e gating + analytics):
 *   pdf-lib has no first-class Optional Content Group (OCG) API. Building
 *   true PDF layers means hand-crafting `/OCProperties` and `/OC` dicts
 *   via low-level PDFRef manipulation, and the result renders inconsistently
 *   across viewers (Acrobat shows the toggle, free viewers often ignore it
 *   and flatten the visible default state). The trade-off is brittle to
 *   author, brittle to consume.
 *
 *   This file ships the documented fallback from the S-5d brief: a single
 *   colour-coded flat overlay with a legend. Each size's pattern goes
 *   onto the same page(s) in a distinct stroke colour. The user reads the
 *   nest the same way they would read a commercial multi-size PDF — by
 *   following the colour they need. A future S-5e++ pass can swap this
 *   for OCG-backed true layers if the engine churn becomes worth it.
 *
 * Each size is rendered by the freesewing wrapper independently. The
 * builder accepts the rendered SVGs (parsed into polylines) and composes
 * them onto an A0 sheet with a legend. Single page only — tiled multi-
 * sheet nested output is out of scope for v1 because the colour-coded
 * stroke convention is what users expect on a single big sheet.
 */

import { PDFDocument, StandardFonts, rgb, type PDFPage } from 'pdf-lib'

import { parseFreesewingSvg } from '@/lib/sewing/grading/svg-to-polylines'
import { mmToPt, PAPER } from './page-tiles'

export interface NestedSizeInput {
  /** Display label shown in the legend (e.g. "Your size", "M", "L"). */
  label: string
  /** Rendered SVG from the freesewing wrapper at this size. */
  svg: string
}

interface BuildNestedPdfArgs {
  /** Pattern name printed at the top of the legend. */
  patternName: string
  /** Footer credit (freesewing attribution). */
  attributionText: string | null
  /** Sizes to overlay in order. First entry is rendered last (top). */
  sizes: NestedSizeInput[]
}

// Five-colour rota convention (red / blue / green / orange / purple +
// a sixth for any extra entry). Order matters: the first entry usually
// represents the user's personalised size and is drawn on top.
const COLOURS: { r: number; g: number; b: number; name: string }[] = [
  { r: 0.79, g: 0.36, b: 0.22, name: 'terracotta' },
  { r: 0.17, g: 0.36, b: 0.67, name: 'blue' },
  { r: 0.21, g: 0.55, b: 0.32, name: 'green' },
  { r: 0.85, g: 0.55, b: 0.18, name: 'orange' },
  { r: 0.45, g: 0.27, b: 0.55, name: 'purple' },
  { r: 0.4, g: 0.4, b: 0.4, name: 'grey' },
]

export async function buildNestedSizePdf(
  args: BuildNestedPdfArgs,
): Promise<Uint8Array> {
  const dims = PAPER['A0']
  const pdf = await PDFDocument.create()
  pdf.setTitle(`${args.patternName} - nested sizes`)
  pdf.setCreator('homemade')

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  // Compute the overall bounds across every size so the page draws them
  // all at the same coordinate origin (left-aligned, top-aligned). The
  // legend sits below the bounds.
  const parsed = args.sizes.map((s) => parseFreesewingSvg(s.svg))
  let unionMinX = Infinity
  let unionMinY = Infinity
  let unionMaxX = -Infinity
  let unionMaxY = -Infinity
  for (const p of parsed) {
    if (p.bounds.minX < unionMinX) unionMinX = p.bounds.minX
    if (p.bounds.minY < unionMinY) unionMinY = p.bounds.minY
    if (p.bounds.minX + p.widthMm > unionMaxX) {
      unionMaxX = p.bounds.minX + p.widthMm
    }
    if (p.bounds.minY + p.heightMm > unionMaxY) {
      unionMaxY = p.bounds.minY + p.heightMm
    }
  }
  if (!Number.isFinite(unionMinX)) {
    unionMinX = 0
    unionMinY = 0
    unionMaxX = 800
    unionMaxY = 800
  }

  const marginMm = 25
  const legendHeightMm = 18 + args.sizes.length * 8 // legend block
  const contentWidthMm = dims.widthMm - marginMm * 2
  const contentHeightMm = dims.heightMm - marginMm * 2 - legendHeightMm

  const unionWidth = unionMaxX - unionMinX
  const unionHeight = unionMaxY - unionMinY
  const scale = Math.min(
    contentWidthMm / Math.max(unionWidth, 1),
    contentHeightMm / Math.max(unionHeight, 1),
    1, // never scale up past 1:1
  )

  const page = pdf.addPage([mmToPt(dims.widthMm), mmToPt(dims.heightMm)])
  drawHeader(page, args, font, fontBold, dims)
  drawLegend(page, args, font, fontBold, dims, marginMm, legendHeightMm)
  drawSizes(page, parsed, scale, marginMm, unionMinX, unionMinY, dims)
  drawTestSquare(page, font, fontBold, dims, marginMm, legendHeightMm)
  drawFooter(page, args, font, dims)

  return pdf.save()
}

function drawHeader(
  page: PDFPage,
  args: BuildNestedPdfArgs,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>,
  dims: { widthMm: number; heightMm: number },
) {
  const pageDims = page.getSize()
  page.drawText(args.patternName, {
    x: mmToPt(20),
    y: pageDims.height - mmToPt(15),
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0),
  })
  page.drawText(
    'Nested sizes. Each size is drawn in its own colour. Follow the colour you need.',
    {
      x: mmToPt(20),
      y: pageDims.height - mmToPt(22),
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    },
  )
  // Suppress unused-vars (dims is reserved for paper-size dispatch).
  void dims
}

function drawLegend(
  page: PDFPage,
  args: BuildNestedPdfArgs,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>,
  dims: { widthMm: number; heightMm: number },
  marginMm: number,
  legendHeightMm: number,
) {
  const pageDims = page.getSize()
  const baseYMm = dims.heightMm - marginMm - legendHeightMm
  page.drawText('Colour key', {
    x: mmToPt(marginMm),
    y: pageDims.height - mmToPt(baseYMm + 6),
    size: 11,
    font: fontBold,
    color: rgb(0, 0, 0),
  })
  args.sizes.forEach((size, i) => {
    const c = COLOURS[i % COLOURS.length]!
    const yMm = baseYMm + 12 + i * 7
    page.drawRectangle({
      x: mmToPt(marginMm),
      y: pageDims.height - mmToPt(yMm + 4),
      width: mmToPt(5),
      height: mmToPt(4),
      color: rgb(c.r, c.g, c.b),
    })
    page.drawText(`${size.label} (${c.name})`, {
      x: mmToPt(marginMm + 8),
      y: pageDims.height - mmToPt(yMm + 1),
      size: 9,
      font,
      color: rgb(0, 0, 0),
    })
  })
}

function drawSizes(
  page: PDFPage,
  parsed: ReturnType<typeof parseFreesewingSvg>[],
  scale: number,
  marginMm: number,
  unionMinX: number,
  unionMinY: number,
  dims: { widthMm: number; heightMm: number },
) {
  const pageDims = page.getSize()
  // Draw in reverse so the first entry (the user's size) sits on top.
  for (let i = parsed.length - 1; i >= 0; i--) {
    const c = COLOURS[i % COLOURS.length]!
    const p = parsed[i]!
    for (const part of p.parts) {
      for (const poly of part.paths) {
        for (let j = 0; j < poly.length - 1; j++) {
          const a = poly[j]!
          const b = poly[j + 1]!
          page.drawLine({
            start: {
              x: mmToPt(marginMm + (a.x - unionMinX) * scale),
              y: pageDims.height - mmToPt(40 + (a.y - unionMinY) * scale),
            },
            end: {
              x: mmToPt(marginMm + (b.x - unionMinX) * scale),
              y: pageDims.height - mmToPt(40 + (b.y - unionMinY) * scale),
            },
            thickness: 0.9,
            color: rgb(c.r, c.g, c.b),
          })
        }
      }
    }
  }
  void dims
}

function drawTestSquare(
  page: PDFPage,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>,
  dims: { widthMm: number; heightMm: number },
  marginMm: number,
  legendHeightMm: number,
) {
  const pageDims = page.getSize()
  const xMm = dims.widthMm - marginMm - 60
  const yMm = dims.heightMm - marginMm - legendHeightMm + 4
  const sizeMm = 50
  page.drawRectangle({
    x: mmToPt(xMm),
    y: pageDims.height - mmToPt(yMm + sizeMm),
    width: mmToPt(sizeMm),
    height: mmToPt(sizeMm),
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  })
  page.drawText('5 cm test square', {
    x: mmToPt(xMm),
    y: pageDims.height - mmToPt(yMm + sizeMm + 4),
    size: 7,
    font: fontBold,
    color: rgb(0, 0, 0),
  })
  page.drawText('Measure with a ruler before cutting.', {
    x: mmToPt(xMm),
    y: pageDims.height - mmToPt(yMm + sizeMm + 7.5),
    size: 6,
    font,
    color: rgb(0, 0, 0),
  })
}

function drawFooter(
  page: PDFPage,
  args: BuildNestedPdfArgs,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  dims: { widthMm: number; heightMm: number },
) {
  if (!args.attributionText) return
  const pageDims = page.getSize()
  page.drawText(args.attributionText, {
    x: mmToPt(20),
    y: mmToPt(8),
    size: 7,
    font,
    color: rgb(0, 0, 0),
  })
  void dims
  void pageDims
}
