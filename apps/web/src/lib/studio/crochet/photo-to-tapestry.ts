import 'server-only'

/**
 * Photo → tapestry colour grid.
 *
 * The same shape of pipeline the cross-stitch converter runs (sharp downscale →
 * image-q quantise → island smoothing), stopping one step earlier: cross-stitch
 * resolves each quantised colour to a floss code, tapestry crochet resolves it
 * to a YARN SHADE, because yarn has no cross-brand code to resolve against.
 * `apps/web/src/lib/studio/photo-to-pattern.ts` is the sibling; the settings
 * (size in stitches, colour count, background removal, smoothing) match it so a
 * maker moving between the two Studios meets the same controls.
 *
 * Output is a `TapestryGrid` — one palette key per stitch, read from the top of
 * the picture down. `buildTapestryProgram` turns that into the stitch program.
 */

import sharp from 'sharp'
import { utils as iqUtils, buildPaletteSync, applyPaletteSync } from 'image-q'
import { nameYarnColours } from './yarn-shades'
import {
  TAPESTRY_MAX_COLOURS,
  TAPESTRY_MIN_COLOURS,
  type TapestryColour,
  type TapestryGrid,
} from './tapestry-program'

export interface PhotoToTapestrySettings {
  /** Stitches across. */
  width: number
  /** Rows up. */
  height: number
  /** How many yarns the finished piece uses. */
  colours: number
  /** Lift saturation and flatten a plain background before quantising. */
  backgroundRemoval: boolean
  /** How hard to smooth single-stitch islands (they are fiddly to carry). */
  smoothing: 'low' | 'medium' | 'high'
}

export async function photoToTapestryGrid(
  imageBytes: Buffer,
  settings: PhotoToTapestrySettings,
): Promise<TapestryGrid> {
  const width = Math.round(settings.width)
  const height = Math.round(settings.height)
  const colours = Math.max(
    TAPESTRY_MIN_COLOURS,
    Math.min(TAPESTRY_MAX_COLOURS, Math.round(settings.colours)),
  )

  let pipeline = sharp(imageBytes).removeAlpha().resize(width, height, {
    fit: 'cover',
    position: 'attention',
  })
  if (settings.backgroundRemoval) {
    pipeline = pipeline.modulate({ saturation: 1.15 }).normalise()
  }
  const { data: raw } = await pipeline.raw().toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(width * height * 4)
  for (let i = 0, j = 0; i < raw.length; i += 3, j += 4) {
    rgba[j] = raw[i]!
    rgba[j + 1] = raw[i + 1]!
    rgba[j + 2] = raw[i + 2]!
    rgba[j + 3] = 255
  }

  const inPC = iqUtils.PointContainer.fromUint8Array(new Uint8Array(rgba), width, height)
  const palette = await buildPaletteSync([inPC], {
    colors: colours,
    paletteQuantization: 'wuquant',
    colorDistanceFormula: 'euclidean',
  })
  const outPC = await applyPaletteSync(inPC, palette, {
    colorDistanceFormula: 'euclidean',
    imageQuantization: 'nearest',
  })
  const out = outPC.toUint8Array()

  // Quantised colour → a temporary key, in first-seen order. The real keys are
  // the yarn shade names, assigned after smoothing once the stitch counts are
  // known: naming the palette after the yarn means the stored program's palette
  // reads as a yarn list on its own, with nothing to keep in step alongside it.
  const keyByHex = new Map<string, string>()
  const hexByKey = new Map<string, string>()
  let cells: string[] = new Array(width * height)
  for (let i = 0, c = 0; c < width * height; i += 4, c++) {
    const hex = `#${[out[i]!, out[i + 1]!, out[i + 2]!]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')}`
    let key = keyByHex.get(hex)
    if (!key) {
      key = `c${keyByHex.size}`
      keyByHex.set(hex, key)
      hexByKey.set(key, hex)
    }
    cells[c] = key
  }

  cells = smoothIslands(cells, width, height, settings.smoothing)

  // Count what survived, drop anything smoothed away, and order the key by use
  // so the main yarn heads the list.
  const counts = new Map<string, number>()
  for (const k of cells) counts.set(k, (counts.get(k) ?? 0) + 1)
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const names = nameYarnColours(ordered.map(([k]) => hexByKey.get(k)!))
  const rename = new Map<string, string>()
  const paletteOut: TapestryColour[] = ordered.map(([tempKey, stitches], i) => {
    const name = names[i]!
    const key = shadeKey(name)
    rename.set(tempKey, key)
    return { key, name, hex: hexByKey.get(tempKey)!, stitches }
  })

  return {
    width,
    height,
    cells: cells.map((k) => rename.get(k) ?? k),
    palette: paletteOut,
  }
}

/** "Duck egg" → "duck-egg": the palette key a shade name becomes. */
function shadeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/**
 * Neighbour-majority smoothing. A lone stitch of a colour with no same-colour
 * neighbour is a colour change in and out for one stitch, which is miserable to
 * work and barely reads in the finished fabric, so it takes the majority colour
 * around it. Same pass the cross-stitch converter runs on confetti.
 */
function smoothIslands(
  cells: string[],
  width: number,
  height: number,
  smoothing: 'low' | 'medium' | 'high',
): string[] {
  const passes = smoothing === 'low' ? 1 : smoothing === 'high' ? 4 : 2
  let current = cells.slice()
  for (let pass = 0; pass < passes; pass++) {
    const next = current.slice()
    const at = (x: number, y: number): string | undefined => {
      if (x < 0 || y < 0 || x >= width || y >= height) return undefined
      return current[y * width + x]
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const me = current[idx]!
        const counts = new Map<string, number>()
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const s = at(x + dx, y + dy)
            if (!s) continue
            counts.set(s, (counts.get(s) ?? 0) + 1)
          }
        }
        if ((counts.get(me) ?? 0) > 0) continue
        let best = me
        let bestN = 0
        for (const [s, n] of counts) {
          if (n > bestN) {
            best = s
            bestN = n
          }
        }
        next[idx] = best
      }
    }
    current = next
  }
  return current
}
