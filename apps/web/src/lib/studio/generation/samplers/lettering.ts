/**
 * DETERMINISTIC LETTERING FOR CHARTS.
 *
 * No model ever draws a letter here. A string is turned into glyph outlines by
 * fontkit, laid out at a known scale, rasterised at eight samples per chart
 * cell, and each cell is stitched when the outline covers enough of it. The
 * same words produce the same cells on a laptop, in a script, and on the
 * server, because nothing in the path depends on a font being installed:
 * the faces are files in `apps/web/public/fonts`, read straight off disk.
 *
 * This is the locked principle the sampler work inherits from
 * `generation/quote-engine.ts`: art can come from an illustrator, words never
 * do. Flux cannot spell, and a misspelt name on a birth sampler is the one
 * mistake a customer can never forgive.
 *
 * Sizes are given as CAP HEIGHT IN CELLS, not as a font size. A capital letter
 * eight cells tall is eight cells tall in every face, which is the only
 * measurement that means anything on squared paper, and it is what makes the
 * face picker in the word-art tool behave: swapping the face keeps the words
 * the same size.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import fontkit, { type Font } from '@pdf-lib/fontkit'
import sharp from 'sharp'

import {
  LETTERING_FACES,
  minCapFor,
  thresholdFor,
  type LetteringFace,
} from './faces'

export { LETTERING_FACES, LETTERING_FACE_IDS, isLetteringFace, minCapFor, thresholdFor } from './faces'
export type { LetteringFace } from './faces'

// Same lookup the PDF export uses: the repo root when a script runs from there,
// `public/fonts` when the server runs from inside apps/web.
const FONT_DIR_CANDIDATES = ['apps/web/public/fonts', 'public/fonts', '../../apps/web/public/fonts']

const fontCache = new Map<LetteringFace, Font>()

function loadFace(face: LetteringFace): Font {
  const cached = fontCache.get(face)
  if (cached) return cached
  const { file } = LETTERING_FACES[face]
  let bytes: Buffer | null = null
  for (const dir of FONT_DIR_CANDIDATES) {
    try {
      bytes = readFileSync(join(process.cwd(), dir, file))
      break
    } catch {
      // try the next candidate
    }
  }
  if (!bytes) {
    throw new Error(
      `lettering: could not find ${file}. Looked in ${FONT_DIR_CANDIDATES.join(', ')} relative to ${process.cwd()}.`,
    )
  }
  const font = fontkit.create(bytes)
  fontCache.set(face, font)
  return font
}

/** Cap height in font units, with a sane fallback for a face that omits it. */
function capHeightUnits(font: Font): number {
  if (font.capHeight && font.capHeight > 0) return font.capHeight
  return font.ascent * 0.7
}

// ───────────────────────────── layout model ─────────────────────────────

export interface TextLine {
  text: string
  face: LetteringFace
  /** Cap height in chart cells. */
  size: number
  /** Extra space between letters, in cells. Negative tightens. */
  tracking?: number
  /** Force upper case before setting. Sampler dates and titles use it. */
  upper?: boolean
  /** Extra blank cells above this line, on top of the block's line gap. */
  spaceAbove?: number
  /**
   * May this line be broken across two or three, when the words are too long
   * for the slot? True for anything a maker types. False for a line that only
   * makes sense whole, like an alphabet row.
   */
  wrap?: boolean
}

export interface TextBlockSpec {
  lines: TextLine[]
  align?: 'left' | 'centre' | 'right'
  /** Blank cells between the ink of one line and the ink of the next. */
  lineGap?: number
  /**
   * How much of a cell the outline must cover before the cell is stitched.
   * 0.42 keeps thin strokes joined up; raise it to thin heavy type down.
   */
  threshold?: number
}

/** A rasterised block of type: a cell mask with its own local origin. */
export interface TextMask {
  width: number
  height: number
  cells: Array<{ x: number; y: number }>
}

/** Samples per cell edge when the outline is rasterised. 8 is 64 per cell. */
const SUPERSAMPLE = 8

const DEFAULT_THRESHOLD = 0.42
const DEFAULT_LINE_GAP = 3

/** Guard rail: a single block never rasterises bigger than this many cells. */
const MAX_BLOCK_CELLS = 600

interface PlacedGlyph {
  d: string
  /** Pen position in font units. */
  penX: number
  penY: number
}

interface LaidLine {
  glyphs: PlacedGlyph[]
  /** Cells per font unit. */
  scale: number
  /** Ink bounding box in font units. */
  inkMinX: number
  inkMaxY: number
  /** Ink size in cells. */
  widthCells: number
  heightCells: number
  spaceAbove: number
}

const EMPTY_MASK: TextMask = { width: 0, height: 0, cells: [] }

/** Lay one line out in font units and measure its ink. */
function layLine(line: TextLine): LaidLine | null {
  const text = (line.upper ? line.text.toUpperCase() : line.text).replace(/\s+/g, ' ').trim()
  if (!text) return null
  const font = loadFace(line.face)
  const scale = line.size / capHeightUnits(font)
  const trackingUnits = (line.tracking ?? 0) / scale
  const run = font.layout(text)

  const glyphs: PlacedGlyph[] = []
  let penX = 0
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (let i = 0; i < run.glyphs.length; i++) {
    const glyph = run.glyphs[i]
    const pos = run.positions[i]
    if (!glyph || !pos) continue
    const gx = penX + (pos.xOffset ?? 0)
    const gy = pos.yOffset ?? 0
    const bbox = glyph.bbox
    // A space has an advance and no outline; it must move the pen without
    // stretching the ink box, or every centred line drifts by half a space.
    if (bbox && bbox.maxX > bbox.minX && bbox.maxY > bbox.minY) {
      glyphs.push({ d: glyph.path.toSVG(), penX: gx, penY: gy })
      minX = Math.min(minX, gx + bbox.minX)
      maxX = Math.max(maxX, gx + bbox.maxX)
      minY = Math.min(minY, gy + bbox.minY)
      maxY = Math.max(maxY, gy + bbox.maxY)
    }
    penX += (pos.xAdvance ?? 0) + trackingUnits
  }

  if (glyphs.length === 0 || !Number.isFinite(minX)) return null

  return {
    glyphs,
    scale,
    inkMinX: minX,
    inkMaxY: maxY,
    widthCells: (maxX - minX) * scale,
    heightCells: (maxY - minY) * scale,
    spaceAbove: line.spaceAbove ?? 0,
  }
}

/**
 * Measure a block without rasterising it. Cheap enough to call in a fitting
 * loop, which is what `fitTextBlock` does when it shrinks type to fit a slot.
 */
export function measureTextBlock(spec: TextBlockSpec): { width: number; height: number } {
  const gap = spec.lineGap ?? DEFAULT_LINE_GAP
  const laid = spec.lines.map(layLine).filter((l): l is LaidLine => l !== null)
  if (laid.length === 0) return { width: 0, height: 0 }
  let height = 0
  let width = 0
  laid.forEach((l, i) => {
    if (i > 0) height += gap
    height += l.spaceAbove + l.heightCells
    width = Math.max(width, l.widthCells)
  })
  return { width: Math.ceil(width), height: Math.ceil(height) }
}

/**
 * Set a block of type as chart cells.
 *
 * The whole block is rasterised in one pass so the lines share a raster grid;
 * rasterising line by line and stacking the masks lets rounding put a one-cell
 * stagger between two lines that should share a stem.
 */
export async function renderTextBlock(spec: TextBlockSpec): Promise<TextMask> {
  const gap = spec.lineGap ?? DEFAULT_LINE_GAP
  // One raster pass sets the whole block, so one coverage bar has to serve
  // every line in it. The lightest face wins: setting a hairline script at the
  // bar a bold sans wants breaks its strokes into dashes, and the reverse only
  // fattens the bold face by a cell here and there.
  const threshold =
    spec.threshold ??
    spec.lines.reduce((low, l) => Math.min(low, thresholdFor(l.face)), DEFAULT_THRESHOLD)
  const align = spec.align ?? 'centre'
  const laid = spec.lines.map(layLine).filter((l): l is LaidLine => l !== null)
  if (laid.length === 0) return EMPTY_MASK

  let blockW = 0
  let blockH = 0
  const tops: number[] = []
  laid.forEach((l, i) => {
    if (i > 0) blockH += gap
    blockH += l.spaceAbove
    tops.push(blockH)
    blockH += l.heightCells
    blockW = Math.max(blockW, l.widthCells)
  })

  const width = Math.max(1, Math.ceil(blockW))
  const height = Math.max(1, Math.ceil(blockH))
  if (width > MAX_BLOCK_CELLS || height > MAX_BLOCK_CELLS) {
    throw new Error(`lettering: block is ${width}×${height} cells, over the ${MAX_BLOCK_CELLS} limit`)
  }

  const S = SUPERSAMPLE
  const pxW = width * S
  const pxH = height * S

  const groups = laid.map((l, i) => {
    const slack = blockW - l.widthCells
    const xCells = align === 'left' ? 0 : align === 'right' ? slack : slack / 2
    const k = l.scale * S
    const tx = xCells * S
    const ty = (tops[i] ?? 0) * S
    // font space is y-up; scale(k, -k) flips it and the inner translate puts
    // the ink box's top-left corner on the group's origin.
    const open = `<g transform="translate(${round(tx)} ${round(ty)}) scale(${round(k, 6)} ${round(-k, 6)}) translate(${round(-l.inkMinX)} ${round(-l.inkMaxY)})">`
    const paths = l.glyphs
      .map((g) => `<path transform="translate(${round(g.penX)} ${round(g.penY)})" d="${g.d}"/>`)
      .join('')
    return `${open}${paths}</g>`
  })

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 ${pxW} ${pxH}">` +
    `<rect width="${pxW}" height="${pxH}" fill="#ffffff"/><g fill="#000000">${groups.join('')}</g></svg>`

  const raw = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer()

  const cells: Array<{ x: number; y: number }> = []
  const per = S * S
  const cut = threshold * 255 * per
  for (let cy = 0; cy < height; cy++) {
    for (let cx = 0; cx < width; cx++) {
      let sum = 0
      for (let sy = 0; sy < S; sy++) {
        const rowStart = (cy * S + sy) * pxW + cx * S
        for (let sx = 0; sx < S; sx++) sum += 255 - (raw[rowStart + sx] ?? 255)
      }
      if (sum >= cut) cells.push({ x: cx, y: cy })
    }
  }
  return { width, height, cells }
}

/**
 * Break a line into `parts` roughly equal pieces at word boundaries.
 *
 * Balanced rather than greedy: "Bartholomew Fitzgerald-Whitmore" set as
 * "Bartholomew" over "Fitzgerald-Whitmore" looks set; the same words filled
 * greedily to the margin look like a paragraph that ran out of room. Measured
 * at a nominal size, because relative widths do not depend on the size.
 */
export function splitBalanced(text: string, face: LetteringFace, parts: number): string[] {
  const words = text.split(' ').filter(Boolean)
  if (parts <= 1 || words.length < 2) return [text]
  const n = Math.min(parts, words.length)
  const width = (t: string): number => measureTextBlock({ lines: [{ text: t, face, size: 10 }] }).width

  let best: { parts: string[]; worst: number } | null = null
  const cuts: number[] = []
  const walk = (start: number, remaining: number): void => {
    if (remaining === 1) {
      const pieces: string[] = []
      let prev = 0
      for (const c of cuts) {
        pieces.push(words.slice(prev, c).join(' '))
        prev = c
      }
      pieces.push(words.slice(prev).join(' '))
      if (pieces.some((p) => !p)) return
      const worst = Math.max(...pieces.map(width))
      if (!best || worst < best.worst) best = { parts: pieces, worst }
      return
    }
    for (let c = start + 1; c <= words.length - remaining + 1; c++) {
      cuts.push(c)
      walk(c, remaining - 1)
      cuts.pop()
    }
  }
  walk(0, n)
  return best ? (best as { parts: string[] }).parts : [text]
}

/**
 * Set a block so it fits a slot: break the long lines, then shrink what is
 * left until it fits.
 *
 * A birth sampler charted for "Amelia Rose" has to survive "Bartholomew
 * Fitzgerald" without the name running off the linen. Breaking it over two
 * lines is what a designer would do and what the counted samplers in every
 * needlework book do; shrinking to a size nobody can read is not. So the
 * fitting tries one line, then two, then three, and only shrinks inside each.
 * A line that reaches the smallest size its face still reads at stops there
 * while the rest carry on down, so a long name never drags the date under the
 * size it can be read at.
 *
 * Returns null only when three lines at their floor still will not fit, which
 * is the point at which the maker has to be told.
 */
export async function fitTextBlock(
  spec: TextBlockSpec,
  box: { width: number; height: number },
): Promise<TextMask | null> {
  for (let parts = 1; parts <= 3; parts++) {
    let factor = 1
    for (let attempt = 0; attempt < 12; attempt++) {
      let allAtFloor = true
      const lines: TextLine[] = []
      for (const l of spec.lines) {
        const floor = minCapFor(l.face)
        const wanted = l.size * factor
        if (wanted > floor) allAtFloor = false
        const sized: TextLine = { ...l, size: Math.max(floor, wanted) }
        if (parts === 1 || l.wrap === false) {
          lines.push(sized)
          continue
        }
        const w = measureTextBlock({ lines: [sized] }).width
        if (w <= box.width) {
          lines.push(sized)
          continue
        }
        for (const [i, piece] of splitBalanced(sized.text, sized.face, parts).entries()) {
          lines.push({ ...sized, text: piece, ...(i > 0 ? { spaceAbove: 0 } : {}) })
        }
      }
      const scaled: TextBlockSpec = {
        ...spec,
        lines,
        lineGap: Math.max(1, Math.round((spec.lineGap ?? DEFAULT_LINE_GAP) * Math.max(factor, 0.5))),
      }
      const measured = measureTextBlock(scaled)
      if (measured.width <= box.width && measured.height <= box.height) {
        return renderTextBlock(scaled)
      }
      if (allAtFloor) break
      const need = Math.min(
        measured.width > 0 ? box.width / measured.width : 1,
        measured.height > 0 ? box.height / measured.height : 1,
      )
      // Step down a little harder than the measurement suggests: rounding the
      // line gap back up can eat the headroom the ratio just bought.
      factor *= Math.max(0.6, need * 0.96)
    }
  }
  return null
}

function round(n: number, dp = 2): string {
  return Number.isFinite(n) ? n.toFixed(dp).replace(/\.?0+$/, '') || '0' : '0'
}
