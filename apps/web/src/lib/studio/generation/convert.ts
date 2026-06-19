import sharp from 'sharp'
import { parsePatternData, type PatternData } from '@homemade/db'
import { photoToPatternData, PATTERN_SYMBOLS } from '@/lib/studio/photo-to-pattern'
import { nearestFloss } from '@/lib/floss/nearest-floss'

/**
 * Cross-stitch pattern generation — image → chart conversion.
 *
 * Two conversion paths, learned the hard way (see
 * `project_cross_stitch_pipeline` memory):
 *
 *   imageToChart  — for photos / painterly art / AI illustration. Runs the
 *                   Wu-quantiser pipeline (`photoToPatternData`) after a
 *                   preprocess pass (trim scan borders, stretch contrast,
 *                   boost saturation, optional crop of a text band). Flat,
 *                   bold, clean-background sources convert well; muted oil
 *                   paintings and busy photos turn to mush — pick sources
 *                   accordingly and let the vision gate reject the rest.
 *
 *   crispChart    — for TEXT and flat procedural art (sayings posters,
 *                   alphabets, samplers, geometric). The quantiser averages
 *                   sub-cell detail into noise (malformed letters, stray
 *                   dots, filled counters), so instead we render the SVG big,
 *                   downsample with NEAREST-neighbour (no averaging), and
 *                   snap each cell to a known flat palette. Background cells
 *                   are left as bare fabric. Letters stay fully formed.
 */

export interface PreprocessOptions {
  /** Saturation multiplier applied after contrast normalisation. */
  saturation?: number
  /** Fraction of height to crop off the bottom (removes fine-print bands). */
  cropBottom?: number
  /** Trim near-uniform scan borders. Default true. */
  trim?: boolean
}

/** Flatten to white, trim borders, stretch contrast, boost saturation,
 *  optionally crop a bottom band. Returns PNG bytes ready for the quantiser. */
export async function preprocessImage(buf: Buffer, opts: PreprocessOptions = {}): Promise<Buffer> {
  const { saturation = 1.25, cropBottom = 0, trim = true } = opts
  let b = await sharp(buf).flatten({ background: '#ffffff' }).png().toBuffer()
  if (trim) {
    try {
      b = await sharp(b).trim({ threshold: 18 }).png().toBuffer()
    } catch {
      // a uniform image can make trim throw — keep the untrimmed buffer
    }
  }
  if (cropBottom > 0) {
    const m = await sharp(b).metadata()
    const h = Math.max(1, Math.round((m.height ?? 1) * (1 - cropBottom)))
    b = await sharp(b).extract({ left: 0, top: 0, width: m.width ?? 1, height: h }).png().toBuffer()
  }
  return sharp(b).normalise().modulate({ saturation }).png().toBuffer()
}

export interface ImageToChartOptions {
  /** Longest side in cells. Aspect is preserved from the source. */
  longestCells: number
  /** Target colour count (palette size). */
  colours: number
  fabricCount?: number
  brand?: 'DMC' | 'ANCHOR' | 'MADEIRA'
  confettiMin?: 'low' | 'medium' | 'high'
  preprocess?: PreprocessOptions | false
}

/** Convert a photo / illustration buffer into validated PatternData. */
export async function imageToChart(buf: Buffer, opts: ImageToChartOptions): Promise<PatternData> {
  const { longestCells, colours, fabricCount = 14, brand = 'DMC', confettiMin = 'medium' } = opts
  const source = opts.preprocess === false ? buf : await preprocessImage(buf, opts.preprocess ?? {})
  const meta = await sharp(source).metadata()
  const ar = (meta.width ?? 1) / (meta.height ?? 1)
  const width = ar >= 1 ? longestCells : Math.max(24, Math.round(longestCells * ar))
  const height = ar >= 1 ? Math.max(24, Math.round(longestCells / ar)) : longestCells
  const { data } = await photoToPatternData(source, {
    width,
    height,
    colours,
    fabricCount,
    brand,
    confettiMin,
    backgroundRemoval: false,
  })
  return data
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex)
  if (!m) return [0, 0, 0]
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)]
}

export interface CrispChartOptions {
  width: number
  height: number
  /** Foreground palette hexes used in the SVG. */
  palette: string[]
  /** Background hex — these cells are left as bare fabric (no stitch). */
  background: string
  fabricCount?: number
  brand?: 'DMC' | 'ANCHOR' | 'MADEIRA'
}

/**
 * Crisp conversion for flat SVG art (text, posters, geometric). Renders the
 * SVG at high density, nearest-downsamples to the cell grid (no averaging),
 * and snaps each cell to the nearest known palette colour. Cells matching
 * the background are skipped (bare fabric).
 */
export async function crispChart(svg: string, opts: CrispChartOptions): Promise<PatternData> {
  const { width, height, palette, background, fabricCount = 14, brand = 'DMC' } = opts
  const raw = await sharp(Buffer.from(svg), { density: 320 })
    .resize(width, height, { kernel: 'nearest', fit: 'fill' })
    .flatten({ background })
    .removeAlpha()
    .raw()
    .toBuffer()
  const known = [background, ...palette].map((hex) => ({ hex, rgb: hexToRgb(hex) }))
  const used = new Map<string, { symbol: string; entry: PatternData['palette'][number] }>()
  let symIdx = 0
  const cells: PatternData['grid']['cells'] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3
      const r = raw[i]!, g = raw[i + 1]!, b = raw[i + 2]!
      let best = known[0]!
      let bd = Infinity
      for (const c of known) {
        const d = (r - c.rgb[0]) ** 2 + (g - c.rgb[1]) ** 2 + (b - c.rgb[2]) ** 2
        if (d < bd) { bd = d; best = c }
      }
      if (best.hex === background) continue
      let u = used.get(best.hex)
      if (!u) {
        const symbol = PATTERN_SYMBOLS[symIdx++ % PATTERN_SYMBOLS.length] ?? '?'
        const { entry } = nearestFloss(best.hex, { brand })
        u = {
          symbol,
          entry: { symbol, brand, code: entry.code, name: entry.name, rgb: entry.rgb, strandsFullCross: 2, strandsBackstitch: 1 },
        }
        used.set(best.hex, u)
      }
      cells.push({ x, y, s: u.symbol })
    }
  }
  return parsePatternData({
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [] },
    palette: [...used.values()].map((u) => u.entry),
    fabric: { count: fabricCount, colourRgb: background, type: 'Aida' },
    metadata: {},
  })
}
