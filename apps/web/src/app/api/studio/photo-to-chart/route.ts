import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { utils as iqUtils, buildPaletteSync, applyPaletteSync } from 'image-q'
import {
  parsePatternData,
  computePatternMetrics,
  PATTERN_SCHEMA_VERSION,
  type PatternData,
  type PaletteEntry,
} from '@homemade/db'
import { nearestFloss, pickBrandTable } from '@/lib/floss/nearest-floss'
import {
  downscaleCacheKey,
  getDownscale,
  putDownscale,
} from '@/lib/studio/downscale-cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SYMBOLS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '×','●','▲','◆','■','○','△','◇','□','✚','✦','✱','⬟','⬢','✕','◐','◑','◒','◓','⬣',
  'a','b','c','d','e','f','g','h','j','k','m','n','p','q','r','s','t','u','v','w','y','z',
]

/**
 * POST /api/studio/photo-to-chart — image → pattern data.
 *
 * Accepts multipart/form-data:
 *   image                — File (PNG / JPEG / WEBP / HEIC, up to ~20MB)
 *   width                — target cells across
 *   height               — target cells down
 *   colours              — colour count cap (6-80)
 *   fabricCount          — Aida count
 *   brand                — DMC | ANCHOR | MADEIRA
 *   confettiMin          — low | medium | high
 *   backgroundRemoval    — '1' | '0'
 *
 * Returns the validated PatternData. The client renders this in the
 * live-preview viewport and POSTs it to /api/studio/patterns (source:
 * prebuilt) when the user saves.
 *
 * No row is created at this endpoint — quantising is a pure read.
 * Saves happen on a separate endpoint, so the slider can fire as fast
 * as the user can drag without bloating the database.
 */
export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('image')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'image is required' }, { status: 400 })
  }
  const arrBuf = await file.arrayBuffer()
  const buf = Buffer.from(arrBuf)

  const width = Number(form.get('width') ?? 80)
  const height = Number(form.get('height') ?? 100)
  const colours = Number(form.get('colours') ?? 18)
  const fabricCount = Number(form.get('fabricCount') ?? 14)
  const brandStr = String(form.get('brand') ?? 'DMC')
  const confettiMin = String(form.get('confettiMin') ?? 'medium') as 'low' | 'medium' | 'high'
  const removeBackground = String(form.get('backgroundRemoval') ?? '0') === '1'

  const brand = brandStr === 'ANCHOR' || brandStr === 'MADEIRA' ? (brandStr as 'ANCHOR' | 'MADEIRA') : 'DMC'

  if (!Number.isInteger(width) || width < 6 || width > 400) {
    return NextResponse.json({ error: 'width must be 6-400 cells' }, { status: 400 })
  }
  if (!Number.isInteger(height) || height < 6 || height > 400) {
    return NextResponse.json({ error: 'height must be 6-400 cells' }, { status: 400 })
  }
  if (!Number.isInteger(colours) || colours < 4 || colours > 96) {
    return NextResponse.json({ error: 'colours must be 4-96' }, { status: 400 })
  }

  // 1) Downscale + sharpen — or pull from the LRU cache if this user has
  //    already POSTed the same image at the same target size (typical
  //    pattern when the colour-count slider fires N times in a row).
  const imageHash = createHash('sha1').update(buf).digest('hex')
  const cacheKey = downscaleCacheKey({
    imageHash,
    width,
    height,
    backgroundRemoval: removeBackground,
  })
  let rgba: Buffer
  const cached = getDownscale(cacheKey)
  if (cached) {
    rgba = cached.rgba
  } else {
    let pipeline = sharp(buf)
      .removeAlpha()
      .resize(width, height, { fit: 'cover', position: 'attention' })
    if (removeBackground) {
      // Coarse background-removal — bump saturation then auto-level so a
      // plain backdrop gets pushed out of the dominant colour cluster.
      // Real masking lives in a follow-up; v1 covers the common
      // "subject on a flat backdrop" case.
      pipeline = pipeline.modulate({ saturation: 1.1 }).normalise()
    }
    const { data: raw } = await pipeline.raw().toBuffer({ resolveWithObject: true })
    // sharp .raw() gives RGB bytes when there's no alpha; pad to RGBA for image-q.
    rgba = Buffer.alloc(width * height * 4)
    for (let i = 0, j = 0; i < raw.length; i += 3, j += 4) {
      rgba[j] = raw[i]!
      rgba[j + 1] = raw[i + 1]!
      rgba[j + 2] = raw[i + 2]!
      rgba[j + 3] = 255
    }
    putDownscale(cacheKey, rgba, width, height)
  }

  // 2) Quantise via image-q (Wu by default; iqUtils handles selection).
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

  // 3) Read the quantised grid into a cell list, build a colour → symbol map.
  const colourToSymbol = new Map<string, string>()
  const symbolToFloss = new Map<string, { entry: PaletteEntry; rgb: string; sourceCount: number }>()
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
        const sym = SYMBOLS[symIdx % SYMBOLS.length] ?? '?'
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
          rgb: entry.rgb,
          sourceCount: 0,
        })
      }
      cells.push({ x, y, s: symbol })
      symbolToFloss.get(symbol)!.sourceCount++
    }
  }

  // 4) Confetti minimisation: any cell isolated (no same-colour 4-neighbour)
  //    is replaced by its dominant 8-neighbour colour, recursively for the
  //    requested strength. "low" = 1 pass, "medium" = 2 passes, "high" = 4.
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
        // Find the dominant neighbour colour.
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

  // 5) Drop any palette entries that ended with 0 cells (a confetti pass
  //    may have eaten an entire micro-colour).
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

  // Order palette by descending stitch count so the floss-key reads
  // dominant-colour-first.
  const orderedSymbols = [...surviving.entries()]
    .sort((a, b) => b[1].sourceCount - a[1].sourceCount)
    .map(([s]) => s)
  const paletteEntries: PaletteEntry[] = orderedSymbols.map((s) => surviving.get(s)!.entry)

  // Trim leading symbols when too few colours survived — re-pack 'A'..
  // No: keep symbols as-is so re-renders are stable across passes.
  void pickBrandTable

  const data = parsePatternData({
    schemaVersion: PATTERN_SCHEMA_VERSION,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [] },
    palette: paletteEntries,
    fabric: { count: fabricCount, colourRgb: '#F5EBD8', type: 'Aida' },
    metadata: {},
  } satisfies PatternData)

  return NextResponse.json({ pattern: data, metrics: computePatternMetrics(data) })
}
