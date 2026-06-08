/**
 * Low-level PDF content-stream parser.
 *
 * Iterates the inflated content streams of every page in a PDF and emits
 * two kinds of events the designer-pattern importers care about:
 *   - cell rectangles: `r g b rg  x y w h re  f` sequences (the fill ops
 *     used for every chart cell + colour swatch in counted-thread PDFs
 *     exported from Ursa MacStitch / WinStitch and most other chart
 *     authoring tools).
 *   - text shows: `Tj` / `TJ` operators with current text-matrix position.
 *     Pdfjs's getTextContent() does this better with proper CMap decoding,
 *     so the importers use pdfjs for text — this parser only needs to
 *     surface positions reliably for `re/f` cells.
 *
 * Knows just enough PDF state to give a faithful per-cell (x, y, w, h,
 * rgb) stream. Tracks the graphics-state stack (q / Q), the current
 * transformation matrix (cm) and the non-stroking colour (rg / g / k).
 * Ignores stroking, clipping, shading, text matrices — none of which
 * matter for cell-fill extraction.
 */

import { PDFDocument, PDFRawStream, PDFArray, type PDFRef } from 'pdf-lib'
import { inflateSync } from 'node:zlib'

export interface RgbCell {
  /** Top-left x in PDF user-space points (origin bottom-left). */
  x: number
  /** Top-left y in PDF user-space points (origin bottom-left). */
  y: number
  w: number
  h: number
  /** [r, g, b] each in 0..1. */
  rgb: [number, number, number]
}

export interface PageCells {
  pageIndex: number
  widthPt: number
  heightPt: number
  cells: RgbCell[]
}

type Mat = [number, number, number, number, number, number]

const IDENTITY: Mat = [1, 0, 0, 1, 0, 0]

function multiply(a: Mat, b: Mat): Mat {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ]
}

function applyMatrix(m: Mat, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
}

/** Cheap PDF content-stream tokeniser. Operators are alpha; everything
 *  else is a number, name, string, or array literal. */
function tokenize(src: string): string[] {
  const out: string[] = []
  let i = 0
  const n = src.length
  while (i < n) {
    const c = src.charCodeAt(i)
    // Whitespace
    if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d || c === 0x0c) { i++; continue }
    // Comment
    if (c === 0x25 /* % */) {
      while (i < n && src.charCodeAt(i) !== 0x0a && src.charCodeAt(i) !== 0x0d) i++
      continue
    }
    // String literal (...)
    if (c === 0x28 /* ( */) {
      const start = i
      let depth = 1
      i++
      while (i < n && depth > 0) {
        const cc = src.charCodeAt(i)
        if (cc === 0x5c /* \ */) { i += 2; continue }
        if (cc === 0x28) depth++
        else if (cc === 0x29) depth--
        i++
      }
      out.push(src.slice(start, i))
      continue
    }
    // Hex string <..>
    if (c === 0x3c /* < */) {
      const start = i
      i++
      while (i < n && src.charCodeAt(i) !== 0x3e) i++
      i++
      out.push(src.slice(start, i))
      continue
    }
    // Array literal [...]
    if (c === 0x5b /* [ */) {
      const start = i
      let depth = 1
      i++
      while (i < n && depth > 0) {
        const cc = src.charCodeAt(i)
        if (cc === 0x5b) depth++
        else if (cc === 0x5d) depth--
        i++
      }
      out.push(src.slice(start, i))
      continue
    }
    // Name /foo or number or operator
    const start = i
    while (i < n) {
      const cc = src.charCodeAt(i)
      if (cc === 0x20 || cc === 0x09 || cc === 0x0a || cc === 0x0d || cc === 0x0c) break
      if (cc === 0x5b || cc === 0x28 || cc === 0x3c || cc === 0x25) break
      i++
    }
    if (i > start) out.push(src.slice(start, i))
  }
  return out
}

function isNumber(tok: string): boolean {
  return /^[+-]?\d*\.?\d+([eE][+-]?\d+)?$/.test(tok)
}

interface GState {
  ctm: Mat
  fillRgb: [number, number, number]
}

/**
 * Execute one content stream's drawing ops, calling `onCell` for every
 * filled rectangle. Page units are still user-space points (no flip);
 * the caller decides what the coordinate frame means.
 */
export function executeContentStream(
  src: string,
  initialState: GState,
  onCell: (cell: RgbCell) => void,
): void {
  const tokens = tokenize(src)
  const stack: GState[] = []
  let st: GState = { ctm: [...initialState.ctm] as Mat, fillRgb: [...initialState.fillRgb] as [number, number, number] }
  const operands: string[] = []

  // Buffer the most recent `re` rectangle so we can emit it when `f`/`b`
  // is reached. PDFs can chain multiple `re` before one `f`; we keep the
  // entire path of pending rects.
  let pendingRects: { x: number; y: number; w: number; h: number }[] = []

  for (const tok of tokens) {
    if (isNumber(tok) || tok.startsWith('/') || tok.startsWith('(') || tok.startsWith('[') || tok.startsWith('<')) {
      operands.push(tok)
      continue
    }
    // Operator
    switch (tok) {
      case 'q':
        stack.push({ ctm: [...st.ctm] as Mat, fillRgb: [...st.fillRgb] as [number, number, number] })
        break
      case 'Q': {
        const restored = stack.pop()
        if (restored) st = restored
        // Reset path on graphics-state restore
        pendingRects = []
        break
      }
      case 'cm': {
        // a b c d e f cm — concat matrix
        if (operands.length >= 6) {
          const m: Mat = [
            parseFloat(operands[operands.length - 6]),
            parseFloat(operands[operands.length - 5]),
            parseFloat(operands[operands.length - 4]),
            parseFloat(operands[operands.length - 3]),
            parseFloat(operands[operands.length - 2]),
            parseFloat(operands[operands.length - 1]),
          ]
          st.ctm = multiply(st.ctm, m)
        }
        break
      }
      case 'rg': {
        // r g b rg — set non-stroking RGB
        if (operands.length >= 3) {
          st.fillRgb = [
            parseFloat(operands[operands.length - 3]),
            parseFloat(operands[operands.length - 2]),
            parseFloat(operands[operands.length - 1]),
          ]
        }
        break
      }
      case 'g': {
        // gray g — set gray non-stroking
        if (operands.length >= 1) {
          const v = parseFloat(operands[operands.length - 1])
          st.fillRgb = [v, v, v]
        }
        break
      }
      case 'k': {
        // c m y k k — set CMYK (rough convert to RGB)
        if (operands.length >= 4) {
          const c = parseFloat(operands[operands.length - 4])
          const m = parseFloat(operands[operands.length - 3])
          const y = parseFloat(operands[operands.length - 2])
          const kk = parseFloat(operands[operands.length - 1])
          st.fillRgb = [
            (1 - c) * (1 - kk),
            (1 - m) * (1 - kk),
            (1 - y) * (1 - kk),
          ]
        }
        break
      }
      case 'sc':
      case 'scn': {
        if (operands.length >= 3) {
          // Treat as RGB if 3 components (common in DeviceRGB colourspace).
          st.fillRgb = [
            parseFloat(operands[operands.length - 3]),
            parseFloat(operands[operands.length - 2]),
            parseFloat(operands[operands.length - 1]),
          ]
        }
        break
      }
      case 're': {
        // x y w h re — append rectangle to current path
        if (operands.length >= 4) {
          pendingRects.push({
            x: parseFloat(operands[operands.length - 4]),
            y: parseFloat(operands[operands.length - 3]),
            w: parseFloat(operands[operands.length - 2]),
            h: parseFloat(operands[operands.length - 1]),
          })
        }
        break
      }
      case 'f':
      case 'F':
      case 'f*':
      case 'b':
      case 'B':
      case 'b*':
      case 'B*': {
        for (const r of pendingRects) {
          // Apply CTM to the rect's bottom-left corner and to (w, h) as a
          // displacement so scale + translate both flow through.
          const [x0, y0] = applyMatrix(st.ctm, r.x, r.y)
          const [x1, y1] = applyMatrix(st.ctm, r.x + r.w, r.y + r.h)
          const x = Math.min(x0, x1)
          const y = Math.min(y0, y1)
          const w = Math.abs(x1 - x0)
          const h = Math.abs(y1 - y0)
          onCell({ x, y, w, h, rgb: [...st.fillRgb] as [number, number, number] })
        }
        pendingRects = []
        break
      }
      case 'n':
      case 'S':
      case 's': {
        // End path with no fill or stroke-only — discard
        pendingRects = []
        break
      }
      case 'W':
      case 'W*': {
        // Clipping path — discard any pending rects
        pendingRects = []
        break
      }
      default:
        // Ignore all other operators — we only care about rectangle fills.
        break
    }
    // Operators consume operands; clear the buffer either way to avoid
    // stale numbers leaking across statements.
    operands.length = 0
  }
}

/**
 * Per-page raw content streams. Returns inflated text for each page so
 * the caller can run the executor over them with the right initial CTM.
 * One PDF page can have its content split across multiple streams; we
 * concatenate them so the executor sees one continuous stream.
 */
export async function loadPageContentStreams(buffer: Buffer): Promise<{ pageIndex: number; widthPt: number; heightPt: number; src: string }[]> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const ctx = doc.context
  const out: { pageIndex: number; widthPt: number; heightPt: number; src: string }[] = []
  for (let i = 0; i < doc.getPageCount(); i++) {
    const page = doc.getPage(i)
    const { width, height } = page.getSize()
    const contents = page.node.Contents()
    const streams: PDFRawStream[] = []
    if (contents instanceof PDFRawStream) streams.push(contents)
    else if (contents instanceof PDFArray) {
      for (const item of contents.asArray()) {
        const s = ctx.lookup(item as PDFRef, PDFRawStream)
        if (s) streams.push(s)
      }
    }
    const chunks: string[] = []
    for (const s of streams) {
      const bytes = Buffer.from(s.contents)
      let decoded = bytes
      // Most authoring tools emit FlateDecode streams; try inflate and
      // fall back to raw bytes if it's not zlib-compressed.
      try { decoded = inflateSync(bytes) } catch { /* not flate */ }
      chunks.push(decoded.toString('latin1'))
    }
    out.push({ pageIndex: i, widthPt: width, heightPt: height, src: chunks.join('\n') })
  }
  return out
}

/**
 * Extract every filled rectangle (with its RGB fill colour) from every
 * page of a PDF. Convenience over the lower-level executor + loader.
 */
export async function extractAllPageCells(buffer: Buffer): Promise<PageCells[]> {
  const pages = await loadPageContentStreams(buffer)
  const result: PageCells[] = []
  for (const p of pages) {
    const cells: RgbCell[] = []
    executeContentStream(p.src, { ctm: [...IDENTITY] as Mat, fillRgb: [0, 0, 0] }, (cell) => {
      cells.push(cell)
    })
    result.push({ pageIndex: p.pageIndex, widthPt: p.widthPt, heightPt: p.heightPt, cells })
  }
  return result
}
