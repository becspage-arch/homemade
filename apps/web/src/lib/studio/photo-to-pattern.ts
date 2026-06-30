/**
 * Photo-to-pattern core. Shared between the API route (live preview
 * for users) and the photographic-seed script (server-side library
 * import). Takes raw image bytes + settings, returns validated
 * PatternData. Pure server-side — uses sharp + image-q + the floss
 * tables; no Next.js / React dependencies.
 */

import sharp from 'sharp'
import { utils as iqUtils, buildPaletteSync, applyPaletteSync } from 'image-q'
import {
  parsePatternData,
  SCHEMA_VERSION as PATTERN_SCHEMA_VERSION,
  type PaletteEntry,
  type PatternData,
} from '@homemade/db/pattern'
import { nearestFloss } from '@/lib/floss/nearest-floss'
import { nearestDmcFull } from '@/lib/floss/dmc-full'

// One distinct glyph per palette colour. The pattern schema rejects a chart
// with two palette entries sharing a symbol, so this set has to be at least as
// large as the densest chart we ever emit (the 100+ colour showpiece tier).
// Every glyph is in the Geometric Shapes / Block Elements / suits ranges that
// the chart render font (DejaVu Sans) covers fully, so none render as tofu.
export const PATTERN_SYMBOLS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '×','●','▲','◆','■','○','△','◇','□','✚','✦','✱','⬟','⬢','✕','◐','◑','◒','◓','⬣',
  'a','b','c','d','e','f','g','h','j','k','m','n','p','q','r','s','t','u','v','w','y','z',
  // ── extended set (keeps 100+ colour charts unique-symbolled) ──
  '▢','▣','▤','▥','▦','▧','▨','▩','▬','▭','▮','▯','▰','▱',
  '▴','▵','▸','▹','▾','▿','◂','◃','◄','►','◅','▻',
  '◍','◎','◉','◌','◔','◕','◖','◗','◘','◙',
  '◧','◨','◩','◪','◫','◰','◱','◲','◳',
  '◴','◵','◶','◷','◢','◣','◤','◥','◯',
  '▖','▗','▘','▙','▚','▛','▜','▝','▞','▟',
  '★','☆','♠','♣','♥','♦','♤','♧','♡','♢','✧','✜',
]

export interface PhotoToPatternSettings {
  width: number
  height: number
  colours: number
  fabricCount: number
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
  confettiMin: 'low' | 'medium' | 'high'
  backgroundRemoval: boolean
  /**
   * Hard ceiling on the quantiser palette. Defaults to 96 — the live-preview
   * Studio ceiling, kept low so the 300ms slider budget holds and so charts
   * stay readable for ordinary use. The dense showpiece tier opts into a
   * higher ceiling. Always clamped to the number of distinct chart symbols
   * available (a chart can't have more colours than unique symbols), so a
   * caller can pass a generous number without risking a duplicate-symbol
   * schema failure.
   */
  maxColours?: number
  /**
   * Which DMC table the chart's colours resolve against. `'curated'` (default)
   * uses the 140-entry working set every existing caller relies on — keeps
   * Studio + brand-equivalence behaviour identical. `'full'` resolves against
   * the complete ~458-colour DMC range so a 100+ colour showpiece can hit
   * 100+ genuinely-distinct stands instead of collapsing onto the sparse
   * curated set. DMC only (ignored for ANCHOR / MADEIRA).
   */
  flossRange?: 'curated' | 'full'
}

export interface PhotoToPatternOutput {
  data: PatternData
  /** Cached downscaled RGBA buffer the API route may keep for slider
   *  re-runs against the same image. */
  rgba: Buffer
}

/**
 * Downscale + quantise + map to floss + confetti-minimise. Returns
 * validated PatternData ready to insert.
 *
 * `cachedRgba` is an optimisation hook for the API route: when the
 * user only changes a colour-count or confetti slider, the caller can
 * pass the previously-computed downscaled buffer instead of running
 * sharp again. Pass undefined when you don't have one.
 */
export async function photoToPatternData(
  imageBytes: Buffer,
  settings: PhotoToPatternSettings,
  cachedRgba?: Buffer | null,
): Promise<PhotoToPatternOutput> {
  const { width, height, colours, fabricCount, brand, confettiMin, backgroundRemoval } = settings
  // The quantiser ceiling: caller-controlled, defaulting to the live-preview
  // 96, and never more than the number of distinct symbols a chart can carry.
  const cap = Math.min(settings.maxColours ?? 96, PATTERN_SYMBOLS.length)
  const useFullRange = settings.flossRange === 'full' && brand === 'DMC'

  let rgba: Buffer
  if (cachedRgba) {
    rgba = cachedRgba
  } else {
    let pipeline = sharp(imageBytes)
      .removeAlpha()
      .resize(width, height, { fit: 'cover', position: 'attention' })
    if (backgroundRemoval) {
      pipeline = pipeline.modulate({ saturation: 1.1 }).normalise()
    }
    const { data: raw } = await pipeline.raw().toBuffer({ resolveWithObject: true })
    rgba = Buffer.alloc(width * height * 4)
    for (let i = 0, j = 0; i < raw.length; i += 3, j += 4) {
      rgba[j] = raw[i]!
      rgba[j + 1] = raw[i + 1]!
      rgba[j + 2] = raw[i + 2]!
      rgba[j + 3] = 255
    }
  }

  const inPC = iqUtils.PointContainer.fromUint8Array(new Uint8Array(rgba), width, height)
  const palette = await buildPaletteSync([inPC], {
    colors: Math.min(colours, cap),
    paletteQuantization: 'wuquant',
    colorDistanceFormula: 'euclidean',
  })
  const outPC = await applyPaletteSync(inPC, palette, {
    colorDistanceFormula: 'euclidean',
    imageQuantization: 'nearest',
  })
  const outU8 = outPC.toUint8Array()

  // Symbols are keyed by FLOSS CODE, not by the raw quantised colour: several
  // quantiser swatches routinely resolve to the same stand, and giving each its
  // own symbol/entry would inflate the palette with duplicate-colour rows (and,
  // past 78 swatches, blow the symbol budget). Keying by code means the palette
  // size IS the true distinct-floss count, one symbol per stand, and adjacent
  // cells that share a stand share a symbol — which also feeds the confetti pass
  // fewer false islands. The first stand encountered claims the next symbol.
  const colourToSymbol = new Map<string, string>() // quantised hex → symbol (caches nearestFloss)
  const codeToSymbol = new Map<string, string>() // floss code → symbol
  const symbolToFloss = new Map<string, { entry: PaletteEntry; sourceCount: number }>()
  let symIdx = 0
  let cells: { x: number; y: number; s: string }[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = outU8[i]!
      const g = outU8[i + 1]!
      const b = outU8[i + 2]!
      const key = `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
      let symbol = colourToSymbol.get(key)
      if (!symbol) {
        const entry = useFullRange
          ? ((e) => ({ code: e.code, name: e.name, rgb: e.hex }))(nearestDmcFull(key))
          : nearestFloss(key, { brand }).entry
        symbol = codeToSymbol.get(entry.code)
        if (!symbol) {
          symbol = PATTERN_SYMBOLS[symIdx] ?? '?'
          symIdx++
          codeToSymbol.set(entry.code, symbol)
          symbolToFloss.set(symbol, {
            entry: {
              symbol,
              brand,
              code: entry.code,
              name: entry.name,
              rgb: entry.rgb,
              strandsFullCross: 2,
              strandsBackstitch: 1,
            },
            sourceCount: 0,
          })
        }
        colourToSymbol.set(key, symbol)
      }
      cells.push({ x, y, s: symbol })
      symbolToFloss.get(symbol)!.sourceCount++
    }
  }

  const passes = confettiMin === 'low' ? 1 : confettiMin === 'high' ? 4 : 2
  const passCells = cells.slice()
  for (let pass = 0; pass < passes; pass++) {
    const next = passCells.slice()
    const at = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return undefined
      return passCells[y * width + x]?.s
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const me = passCells[idx]!
        const counts = new Map<string, number>()
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const s = at(x + dx, y + dy)
            if (!s) continue
            counts.set(s, (counts.get(s) ?? 0) + 1)
          }
        }
        const same = counts.get(me.s) ?? 0
        if (same > 0) continue
        let best = me.s
        let bestN = 0
        for (const [s, n] of counts) {
          if (n > bestN) {
            best = s
            bestN = n
          }
        }
        next[idx] = { ...me, s: best }
      }
    }
    for (let i = 0; i < next.length; i++) passCells[i] = next[i]!
  }
  cells = passCells

  const surviving = new Map<string, { entry: PaletteEntry; sourceCount: number }>()
  for (const c of cells) {
    let row = surviving.get(c.s)
    if (!row) {
      const floss = symbolToFloss.get(c.s)
      if (!floss) continue
      row = { entry: floss.entry, sourceCount: 0 }
      surviving.set(c.s, row)
    }
    row.sourceCount++
  }

  const orderedSymbols = [...surviving.entries()]
    .sort((a, b) => b[1].sourceCount - a[1].sourceCount)
    .map(([s]) => s)
  const paletteEntries: PaletteEntry[] = orderedSymbols.map((s) => surviving.get(s)!.entry)

  const data = parsePatternData({
    schemaVersion: PATTERN_SCHEMA_VERSION,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [] },
    palette: paletteEntries,
    fabric: { count: fabricCount, colourRgb: '#F5EBD8', type: 'Aida' },
    metadata: {},
  } satisfies PatternData)

  return { data, rgba }
}
