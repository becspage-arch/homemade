/**
 * SAMPLER CHART ASSEMBLY.
 *
 * Turns a design (a frame, some motifs, and a few slots of type) into validated
 * `PatternData`, and puts the recipe for the type back on the row so the same
 * chart can be re-lettered later with somebody else's name in it.
 *
 * The re-lettering is the whole point. A published sampler carries its art in
 * its cells and its wording in a small block of JSON beside them; personalising
 * lifts the lettering out, sets the new words into the same reserved slots, and
 * puts them back. The art is never regenerated, so a name change costs a few
 * milliseconds of font work and nothing else. That is why the illustrated
 * motifs can be paid for once.
 */

import {
  parsePatternData,
  type PatternData,
  type PaletteEntry,
  type FlossBrand,
} from '@homemade/db'
import { PATTERN_SYMBOLS } from '@/lib/studio/photo-to-pattern'
import { nearestFloss, pickBrandTable } from '@/lib/floss/nearest-floss'
import { newArt, paint, type Art } from './art'
import {
  fitTextBlock,
  measureTextBlock,
  minCapFor,
  type LetteringFace,
  type TextLine,
  type TextMask,
} from './lettering'
import {
  SAMPLER_KINDS,
  fillTemplate,
  formatSamplerDate,
  joinValues,
  samplerYear,
  type SamplerKind,
} from './kinds'

// ───────────────────────────── the stored recipe ─────────────────────────────

export interface SamplerRegion {
  x: number
  y: number
  w: number
  h: number
}

export interface SamplerLineSpec {
  /**
   * `{name}`, `Born {date}`, `{nameOne} and {nameTwo}`, with `[...]` round any
   * part that should vanish when its value is blank. Either this or `join`.
   */
  template?: string
  /**
   * Run several values together with a separator, dropping the empty ones:
   * "3.4 kg · 51 cm" when both boxes were filled, "51 cm" when only one was.
   */
  join?: { keys: string[]; separator: string }
  face: LetteringFace
  /** Cap height in cells. */
  size: number
  tracking?: number
  upper?: boolean
  spaceAbove?: number
  /** May this line break across two or three when the words are long? */
  wrap?: boolean
}

export interface SamplerBlockSpec {
  region: SamplerRegion
  align: 'left' | 'centre' | 'right'
  vAlign: 'top' | 'middle' | 'bottom'
  lineGap: number
  /** The palette symbol this block's lettering is worked in. */
  inkSymbol: string
  lines: SamplerLineSpec[]
}

/**
 * What a published sampler carries in `Pattern.generationMeta.sampler`.
 *
 * Small on purpose: the art is already in the chart, so this holds only what it
 * takes to lift the words out and set new ones. `inkSymbol` is reserved — no
 * part of the art is ever worked in it — which is what makes "remove every cell
 * in this colour" a safe way to clear the lettering.
 */
export interface SamplerChartMeta {
  version: 1
  kind: SamplerKind
  designSlug: string
  blocks: SamplerBlockSpec[]
  /** The words the catalogue copy is charted with. */
  values: Record<string, string>
}

export function isSamplerChartMeta(value: unknown): value is SamplerChartMeta {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<SamplerChartMeta>
  return (
    v.version === 1 &&
    typeof v.kind === 'string' &&
    Array.isArray(v.blocks) &&
    v.blocks.every((b) => b && typeof b.inkSymbol === 'string' && Array.isArray(b.lines))
  )
}

// ───────────────────────────── palette ─────────────────────────────

export interface PaintedPalette {
  entries: PaletteEntry[]
  /** hex → symbol. */
  symbolFor: Map<string, string>
}

/**
 * Give every colour in a design a symbol and a real floss.
 *
 * The lettering threads are chosen FIRST and then held back from the art.
 * A sampler's words have to be liftable as a whole — that is what makes
 * personalising it a matter of a few milliseconds rather than a re-draw — and
 * that only works while no part of the design is worked in the same thread. So
 * an art colour that would have landed on a lettering thread is matched to the
 * next nearest instead: a shade or two along on a wreath petal, invisible on the
 * cloth, and the lettering keeps a skein of its own.
 *
 * Art colours that land on the SAME thread as each other are merged, so the
 * floss key never lists one skein twice under two symbols.
 */
export function buildPalette(
  artColours: string[],
  inkColours: string[],
  brand: FlossBrand = 'DMC',
): PaintedPalette {
  const entries: PaletteEntry[] = []
  const symbolFor = new Map<string, string>()
  const byCode = new Map<string, string>()
  let next = 0

  const push = (hex: string, entry: { code: string; name: string; rgb: string }): void => {
    const existing = byCode.get(entry.code)
    if (existing) {
      symbolFor.set(hex, existing)
      return
    }
    const symbol = PATTERN_SYMBOLS[next++ % PATTERN_SYMBOLS.length] ?? '?'
    entries.push({
      symbol,
      brand,
      code: entry.code,
      name: entry.name,
      rgb: entry.rgb,
      strandsFullCross: 2,
      strandsBackstitch: 1,
    })
    symbolFor.set(hex, symbol)
    byCode.set(entry.code, symbol)
  }

  const inkIndices = new Set<number>()
  for (const hex of inkColours) {
    if (symbolFor.has(hex)) continue
    const { entry, index } = nearestFloss(hex, { brand })
    inkIndices.add(index)
    push(hex, entry)
  }

  const artCandidates = pickBrandTable(brand)
    .map((_, i) => i)
    .filter((i) => !inkIndices.has(i))

  for (const hex of artColours) {
    if (symbolFor.has(hex)) continue
    const { entry } = nearestFloss(hex, { brand, candidates: artCandidates })
    push(hex, entry)
  }

  return { entries, symbolFor }
}

// ───────────────────────────── setting the words ─────────────────────────────

/**
 * Expand a kind's values into everything a template may reference: the raw
 * value, plus a locale-formatted date and its year on their own keys.
 */
export function templateValues(
  kind: SamplerKind,
  values: Record<string, string>,
  locale = 'en-GB',
): Record<string, string> {
  const out: Record<string, string> = { ...values }
  for (const field of SAMPLER_KINDS[kind].fields) {
    const raw = (values[field.key] ?? '').trim()
    if (!raw || field.type !== 'date') continue
    out[field.key] = formatSamplerDate(raw, locale)
    out[`${field.key}Year`] = samplerYear(raw)
    out[`${field.key}Iso`] = raw
  }
  return out
}

/** One block of set type, positioned in chart coordinates. */
export interface PlacedText {
  inkSymbol: string
  cells: Array<{ x: number; y: number }>
}

/**
 * Set every block's words into its slot.
 *
 * A block that ends up with nothing to say (every optional line left blank)
 * contributes no cells at all, which is how a birth sampler loses its weight
 * line rather than stitching an empty band. A block whose words genuinely will
 * not fit, even shrunk to the smallest size its face still reads at, throws:
 * the maker gets told the name is too long for that design, which is a much
 * better outcome than a chart with the last three letters missing.
 */
export async function setSamplerText(
  blocks: SamplerBlockSpec[],
  kind: SamplerKind,
  values: Record<string, string>,
  locale = 'en-GB',
): Promise<PlacedText[]> {
  const filled = templateValues(kind, values, locale)
  const out: PlacedText[] = []

  for (const block of blocks) {
    const lines: TextLine[] = []
    for (const spec of block.lines) {
      const text = spec.join
        ? joinValues(spec.join.keys, spec.join.separator, filled)
        : fillTemplate(spec.template ?? '', filled)
      if (!text) continue
      lines.push({
        text,
        face: spec.face,
        size: spec.size,
        ...(spec.tracking !== undefined ? { tracking: spec.tracking } : {}),
        ...(spec.upper !== undefined ? { upper: spec.upper } : {}),
        ...(spec.wrap !== undefined ? { wrap: spec.wrap } : {}),
        // The first line that survives never carries space above it: the gap
        // belongs between lines, and keeping it would push a one-line block off
        // centre whenever the line above was left blank.
        ...(lines.length > 0 && spec.spaceAbove !== undefined ? { spaceAbove: spec.spaceAbove } : {}),
      })
    }
    if (lines.length === 0) {
      out.push({ inkSymbol: block.inkSymbol, cells: [] })
      continue
    }

    const mask = await fitTextBlock(
      { lines, align: block.align, lineGap: block.lineGap },
      { width: block.region.w, height: block.region.h },
    )
    if (!mask) {
      throw new SamplerTextTooLongError(lines.map((l) => l.text))
    }
    out.push({ inkSymbol: block.inkSymbol, cells: placeMask(mask, block) })
  }
  return out
}

/** Words that will not fit their slot however small the type is set. */
export class SamplerTextTooLongError extends Error {
  readonly lines: string[]
  constructor(lines: string[]) {
    super(
      `That is too long for this design: ${lines.join(' / ')}. Try a shorter version, or pick a sampler with more room.`,
    )
    this.name = 'SamplerTextTooLongError'
    this.lines = lines
  }
}

function placeMask(mask: TextMask, block: SamplerBlockSpec): Array<{ x: number; y: number }> {
  const slackX = block.region.w - mask.width
  const slackY = block.region.h - mask.height
  const dx =
    block.region.x + (block.align === 'left' ? 0 : block.align === 'right' ? slackX : Math.round(slackX / 2))
  const dy =
    block.region.y +
    (block.vAlign === 'top' ? 0 : block.vAlign === 'bottom' ? slackY : Math.round(slackY / 2))
  return mask.cells.map((c) => ({ x: c.x + dx, y: c.y + dy }))
}

// ───────────────────────────── assembly ─────────────────────────────

export interface AssembleOptions {
  width: number
  height: number
  fabricCount?: number
  brand?: FlossBrand
  /** Bright ivory aida, the same ground the rest of the catalogue is on. */
  fabricRgb?: string
}

/** The ivory the catalogue renders on. A dull oatmeal greys every colour. */
export const SAMPLER_FABRIC = '#FCFAF6'

export function assembleChart(
  art: Art,
  text: PlacedText[],
  palette: PaintedPalette,
  opts: AssembleOptions,
): PatternData {
  const { width, height, fabricCount = 14, fabricRgb = SAMPLER_FABRIC } = opts
  const cells = new Map<string, { x: number; y: number; s: string }>()

  for (const [key, hex] of art) {
    const [x, y] = key.split(',').map(Number)
    if (x === undefined || y === undefined) continue
    if (x < 0 || y < 0 || x >= width || y >= height) continue
    const s = palette.symbolFor.get(hex)
    if (s) cells.set(key, { x, y, s })
  }
  // Lettering goes on last so it always sits over the art, never under it.
  for (const block of text) {
    for (const c of block.cells) {
      if (c.x < 0 || c.y < 0 || c.x >= width || c.y >= height) continue
      cells.set(`${c.x},${c.y}`, { x: c.x, y: c.y, s: block.inkSymbol })
    }
  }

  return parsePatternData({
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: {
      width,
      height,
      cells: [...cells.values()],
      backstitch: [],
      frenchKnots: [],
      beads: [],
      fractional: [],
    },
    palette: prunePalette(palette.entries, new Set([...cells.values()].map((c) => c.s))),
    fabric: { count: fabricCount, colourRgb: fabricRgb, type: 'Aida' },
    metadata: {},
  })
}

/**
 * Drop palette entries nothing is worked in. A sampler charted with a weight
 * line and stitched without one would otherwise ship a floss key listing a
 * colour the maker never has to buy.
 */
export function prunePalette(entries: PaletteEntry[], used: Set<string>): PaletteEntry[] {
  const kept = entries.filter((e) => used.has(e.symbol))
  return kept.length > 0 ? kept : entries.slice(0, 1)
}

// ───────────────────────────── re-lettering ─────────────────────────────

/**
 * Put somebody else's words on a published sampler.
 *
 * Pure apart from reading the font files: no model, no network, no image work.
 * Every cell of the art comes straight off the stored chart, so the personal
 * copy is the same piece with a different name on it, down to the square.
 */
export async function personaliseSampler(
  data: PatternData,
  meta: SamplerChartMeta,
  values: Record<string, string>,
  locale = 'en-GB',
): Promise<PatternData> {
  const inkSymbols = new Set(meta.blocks.map((b) => b.inkSymbol))
  const text = await setSamplerText(meta.blocks, meta.kind, values, locale)

  const cells = new Map<string, { x: number; y: number; s: string }>()
  for (const c of data.grid.cells) {
    if (inkSymbols.has(c.s)) continue
    cells.set(`${c.x},${c.y}`, { x: c.x, y: c.y, s: c.s })
  }
  for (const block of text) {
    for (const c of block.cells) {
      if (c.x < 0 || c.y < 0 || c.x >= data.grid.width || c.y >= data.grid.height) continue
      cells.set(`${c.x},${c.y}`, { x: c.x, y: c.y, s: block.inkSymbol })
    }
  }

  const used = new Set([...cells.values()].map((c) => c.s))
  // Back-stitch and knots worked in a lettering colour go with the lettering;
  // everything else on those layers is art and stays.
  const backstitch = data.grid.backstitch.filter((b) => !inkSymbols.has(b.s))
  const frenchKnots = data.grid.frenchKnots.filter((k) => !inkSymbols.has(k.s))
  const beads = data.grid.beads.filter((b) => !inkSymbols.has(b.s))
  const fractional = data.grid.fractional.filter((f) => !inkSymbols.has(f.s))
  for (const layer of [backstitch, frenchKnots, beads, fractional]) {
    for (const item of layer) used.add(item.s)
  }

  return parsePatternData({
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: {
      width: data.grid.width,
      height: data.grid.height,
      cells: [...cells.values()],
      backstitch,
      frenchKnots,
      beads,
      fractional,
    },
    palette: prunePalette(data.palette, used),
    fabric: data.fabric,
    metadata: data.metadata,
  })
}

// ───────────────────────────── small helpers ─────────────────────────────

/** Fill a solid rectangle. Used by designs that want a band behind the type. */
export function fillRegion(art: Art, region: SamplerRegion, colour: string): void {
  for (let y = region.y; y < region.y + region.h; y++) {
    for (let x = region.x; x < region.x + region.w; x++) paint(art, x, y, colour)
  }
}

/** An empty canvas, re-exported so a design file imports one module. */
export { newArt }


// ───────────────────────────── layout diagnostics ─────────────────────────────

/**
 * What each block would take at the size it asks for, and the least room it
 * could ever be squeezed into. A design whose slot is smaller than the second
 * number cannot set those words at all; a slot between the two sets them
 * smaller than intended. Both are worth knowing while laying a sampler out,
 * which is what `xs-samplers-build.ts --why` prints.
 */
export function measureSamplerBlocks(
  blocks: SamplerBlockSpec[],
  kind: SamplerKind,
  values: Record<string, string>,
  locale = 'en-GB',
): Array<{
  region: SamplerRegion
  wanted: { width: number; height: number }
  floor: { width: number; height: number }
  text: string[]
}> {
  const filled = templateValues(kind, values, locale)
  return blocks.map((block) => {
    const lines: TextLine[] = []
    for (const spec of block.lines) {
      const text = spec.join
        ? joinValues(spec.join.keys, spec.join.separator, filled)
        : fillTemplate(spec.template ?? '', filled)
      if (!text) continue
      lines.push({
        text,
        face: spec.face,
        size: spec.size,
        ...(spec.tracking !== undefined ? { tracking: spec.tracking } : {}),
        ...(spec.upper !== undefined ? { upper: spec.upper } : {}),
      })
    }
    const wanted = measureTextBlock({ lines, lineGap: block.lineGap })
    const floor = measureTextBlock({
      lines: lines.map((l) => ({ ...l, size: minCapFor(l.face) })),
      lineGap: 1,
    })
    return { region: block.region, wanted, floor, text: lines.map((l) => l.text) }
  })
}
