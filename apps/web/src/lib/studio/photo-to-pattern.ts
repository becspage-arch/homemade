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

export const PATTERN_SYMBOLS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '×','●','▲','◆','■','○','△','◇','□','✚','✦','✱','⬟','⬢','✕','◐','◑','◒','◓','⬣',
  'a','b','c','d','e','f','g','h','j','k','m','n','p','q','r','s','t','u','v','w','y','z',
]

export interface PhotoToPatternSettings {
  width: number
  height: number
  colours: number
  fabricCount: number
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
  confettiMin: 'low' | 'medium' | 'high'
  backgroundRemoval: boolean
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
    colors: Math.min(colours, 96),
    paletteQuantization: 'wuquant',
    colorDistanceFormula: 'euclidean',
  })
  const outPC = await applyPaletteSync(inPC, palette, {
    colorDistanceFormula: 'euclidean',
    imageQuantization: 'nearest',
  })
  const outU8 = outPC.toUint8Array()

  const colourToSymbol = new Map<string, string>()
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
        const sym = PATTERN_SYMBOLS[symIdx % PATTERN_SYMBOLS.length] ?? '?'
        symIdx++
        symbol = sym
        colourToSymbol.set(key, symbol)
        const { entry } = nearestFloss(key, { brand })
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
