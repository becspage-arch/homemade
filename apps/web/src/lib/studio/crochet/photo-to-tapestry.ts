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
import { matchYarnShades } from './yarn-shades'
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
  /**
   * Raise the colour ceiling above the Studio's own
   * `TAPESTRY_MAX_COLOURS`.
   *
   * The Studio caps a maker's own piece at eight yarns because carrying more
   * than that by hand is miserable and a maker is buying the yarn. The
   * CATALOGUE has no such ceiling and must not invent one: the dense,
   * many-colour end of the range is a first-class target, not over-engineering
   * ([[feedback_pattern_complexity_range]]), and the engine resolves colour per
   * stitch with no count limit — the signed-off cottage tapestry carries
   * fifteen. A bulk lane may pass its own number here (the wall-hanging
   * poster-motif lane passes eight, its own legibility cap, see
   * `generation/bulk/crochet.ts`); every other caller leaves it unset and gets
   * the Studio cap exactly as before.
   */
  maxColours?: number
  /** Lift saturation and flatten a plain background before quantising. */
  backgroundRemoval: boolean
  /** How hard to smooth single-stitch islands (they are fiddly to carry). */
  smoothing: 'low' | 'medium' | 'high'
  /**
   * Trim the near-uniform border sharp finds around the source's top-left
   * pixel before quantising, so a subject drawn small on a plain ground fills
   * the frame it is actually measured against rather than carrying that
   * ground into the stitch grid as dead space. Off by default: a customer's
   * own photo rarely has a plain border to trim, so the Studio path behaves
   * exactly as before. The bulk pictorial lane turns this on because its
   * source illustration IS drawn on a plain ground on purpose
   * (`generation/bulk/crochet.ts`).
   */
  cropToSubject?: boolean
  /**
   * With `cropToSubject` on, refuse (`TapestrySubjectTooSmallError`) an
   * illustration whose trimmed subject covers less than this fraction of the
   * original frame, rather than quietly rendering a border no one asked for.
   * The first published cottage showpiece was killed for exactly this — a
   * third of the panel was empty ground above the scene
   * (`apps/web/scripts/crochet-first-batch-verdicts.json`).
   */
  minSubjectCoverage?: number
  /**
   * With `cropToSubject` on, REFRAME rather than trim-and-cover: take the
   * subject's trimmed bounds, add this margin (a fraction of the subject's
   * longer side) all round, grow the box to the grid's own aspect, and cut that
   * box out of the original picture. The subject then fills the panel with an
   * even, deliberate margin instead of a dead border on one side, and `cover`
   * never crops into the motif itself (a tall mushroom in a square grid keeps
   * its cap and its stalk). Unset keeps the old trim-then-cover behaviour.
   */
  frameMargin?: number
  /**
   * Merge any quantised colour that ends up on fewer than this share of the
   * stitches into its nearest surviving colour, never going below `minColours`
   * (default `TAPESTRY_MIN_COLOURS`). A yarn carried for a handful of stitches
   * is a whole extra ball for the maker and reads as noise at thumbnail size.
   * Unset means no merging, exactly as before.
   */
  minColourShare?: number
  /** Floor for `minColourShare` merging. */
  minColours?: number
  /**
   * Quantise at `majority` times the grid resolution, then give each stitch
   * the MAJORITY colour of the pixels under it, instead of resizing straight
   * to the grid and quantising that. A straight resize averages across every
   * edge, so flat artwork comes back ringed with in-between colours (a brown
   * rim round a red cap on green) that then eat palette slots; quantising
   * first keeps those edges a hairline the minor-colour merge folds away, and
   * the majority vote gives crisp flat regions. Unset (or 1) keeps the
   * original resize-then-quantise path exactly.
   */
  majority?: number
  /**
   * With `majority`, quantise to this many colours first and only then fold
   * down to `colours` (smallest share first, into its nearest colour). An
   * eight-colour quantise of a flat picture spends slots on edge pixels and
   * can merge two large, gently contrasting regions (a cream stalk on a cream
   * ground); quantising wider and folding by SHARE keeps every real region.
   * Defaults to `colours`.
   */
  quantiseColours?: number
}

/** Thrown by `photoToTapestryGrid` when `minSubjectCoverage` is set and the
 *  trimmed subject does not clear it. Carries the measured coverage so the
 *  caller can log it, and so a re-roll can tell how close it came. */
export class TapestrySubjectTooSmallError extends Error {
  constructor(
    public readonly coverage: number,
    public readonly minCoverage: number,
  ) {
    super(
      `the illustration's subject fills only ${Math.round(coverage * 100)}% of the frame after ` +
        `trimming the background (need at least ${Math.round(minCoverage * 100)}%)`,
    )
    this.name = 'TapestrySubjectTooSmallError'
  }
}

export interface SubjectCrop {
  /** The image, cropped to the trimmed bounding box. Unchanged if there was
   *  nothing to trim. */
  buffer: Buffer
  /** Trimmed area over original area, 0 to 1. */
  coverage: number
}

/**
 * Trim the near-uniform border sharp finds around the top-left pixel's colour
 * and report how much of the original frame survives. A photo with no plain
 * border (an ordinary snapshot) simply reports a coverage at or near 1, so
 * this is safe to run unconditionally on any source.
 *
 * With `frame` set, the result is not the bare trimmed box but the box grown
 * by `frame.margin` (a fraction of the subject's longer side) on every side and
 * then to `frame.aspect` (width / height), cut from the ORIGINAL picture so the
 * margin is the illustration's own ground rather than painted-in padding. Only
 * when the grown box is larger than the picture itself is the shortfall padded,
 * in the top-left (background) colour. `coverage` is always the bare subject's
 * share of the original frame.
 */
export async function cropToSubject(
  imageBytes: Buffer,
  frame?: { aspect: number; margin: number },
): Promise<SubjectCrop> {
  const meta = await sharp(imageBytes).metadata()
  const W = meta.width ?? 0
  const H = meta.height ?? 0
  const originalArea = W * H
  if (!originalArea) return { buffer: imageBytes, coverage: 1 }
  let box: { left: number; top: number; width: number; height: number }
  let trimmed: Buffer
  try {
    const { data, info } = await sharp(imageBytes)
      .trim({ threshold: 24 })
      .toBuffer({ resolveWithObject: true })
    trimmed = data
    box = {
      left: -(info.trimOffsetLeft ?? 0),
      top: -(info.trimOffsetTop ?? 0),
      width: info.width,
      height: info.height,
    }
  } catch {
    // Nothing sharp will trim (a flat single-colour frame, or a shape trim
    // refuses) — that is not a small subject, it is no border at all.
    trimmed = imageBytes
    box = { left: 0, top: 0, width: W, height: H }
  }
  const coverage = (box.width * box.height) / originalArea
  if (!frame) return { buffer: trimmed, coverage }

  const m = Math.round(Math.max(box.width, box.height) * Math.max(0, frame.margin))
  let w = box.width + 2 * m
  let h = box.height + 2 * m
  if (w / h < frame.aspect) w = Math.round(h * frame.aspect)
  else h = Math.round(w / frame.aspect)
  const cx = box.left + box.width / 2
  const cy = box.top + box.height / 2
  // The part of the grown box that lies inside the picture, slid (not
  // shrunk) to stay inside it where it can.
  const cw = Math.min(w, W)
  const ch = Math.min(h, H)
  const left = Math.round(Math.min(Math.max(cx - cw / 2, 0), W - cw))
  const top = Math.round(Math.min(Math.max(cy - ch / 2, 0), H - ch))
  let out = sharp(imageBytes).extract({ left, top, width: cw, height: ch })
  if (cw < w || ch < h) {
    const { data } = await sharp(imageBytes).extract({ left: 0, top: 0, width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const background = { r: data[0] ?? 255, g: data[1] ?? 255, b: data[2] ?? 255 }
    const padX = w - cw
    const padY = h - ch
    out = sharp(await out.png().toBuffer()).extend({
      left: Math.floor(padX / 2),
      right: Math.ceil(padX / 2),
      top: Math.floor(padY / 2),
      bottom: Math.ceil(padY / 2),
      background,
    })
  }
  return { buffer: await out.png().toBuffer(), coverage }
}

/**
 * HOW MANY STITCHES A MOTIF NEEDS — the smallest grid that still carries it.
 *
 * A bold single motif (a mushroom, a heart) reads perfectly at a small grid and
 * only gets slower to make and harder to read at thumbnail size when it is
 * blown up; a motif with real detail (spots, a fence, a second subject) loses
 * it below a certain size. So rather than sizing every panel from the brief,
 * this measures the picture itself: quantise a high-resolution reference of
 * the framed picture to its palette, then for each candidate side `s` (from
 * `minSide` up, in steps of `step`) downsample to s x s exactly as the
 * converter will (majority colour per stitch), and count the reference pixels
 * that came back a different colour. The grid is the smallest side whose
 * mismatch is within `MOTIF_GRID_GAIN` of what the largest side manages (or
 * under the absolute `tolerance`): a bigger grid has to buy real detail to
 * earn its extra stitches.
 *
 * Deterministic and offline: no model, no Fal. Returns the per-side mismatch
 * so a caller can log why it chose what it chose.
 */
export async function motifGridSide(
  imageBytes: Buffer,
  opts: {
    minSide: number
    maxSide: number
    colours: number
    step?: number
    tolerance?: number
    /** Reframe exactly as the converter will (square), so the measure is of
     *  the picture that will actually be stitched. */
    frameMargin?: number
  },
): Promise<{ side: number; mismatch: Record<number, number> }> {
  const R = 192
  const step = Math.max(1, opts.step ?? 4)
  const tolerance = opts.tolerance ?? MOTIF_GRID_TOLERANCE
  let source = imageBytes
  if (opts.frameMargin != null) source = (await cropToSubject(imageBytes, { aspect: 1, margin: opts.frameMargin })).buffer

  const refRgb = (await sharp(source).removeAlpha().resize(R, R, { fit: 'cover' }).raw().toBuffer())
  const toPC = (rgb: Buffer, w: number, h: number) => {
    const rgba = new Uint8Array(w * h * 4)
    for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
      rgba[j] = rgb[i]!
      rgba[j + 1] = rgb[i + 1]!
      rgba[j + 2] = rgb[i + 2]!
      rgba[j + 3] = 255
    }
    return iqUtils.PointContainer.fromUint8Array(rgba, w, h)
  }
  const refPC = toPC(refRgb, R, R)
  const palette = await buildPaletteSync([refPC], {
    colors: Math.max(2, Math.round(opts.colours)),
    paletteQuantization: 'wuquant',
    colorDistanceFormula: 'euclidean',
  })
  const ref = (await applyPaletteSync(refPC, palette, { colorDistanceFormula: 'euclidean', imageQuantization: 'nearest' })).toUint8Array()
  // Pixel → a colour id, twins merged: a palette larger than the picture needs
  // splits one flat colour into near-identical entries, and a stitch landing on
  // the twin is not a lost detail.
  const FAR = MOTIF_COLOUR_DISTANCE ** 2
  const reps: [number, number, number][] = []
  const id = new Int32Array(R * R)
  for (let p = 0; p < R * R; p++) {
    const r = ref[p * 4]!
    const g = ref[p * 4 + 1]!
    const b = ref[p * 4 + 2]!
    let k = reps.findIndex(([r2, g2, b2]) => (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2 <= FAR)
    if (k < 0) {
      k = reps.length
      reps.push([r, g, b])
    }
    id[p] = k
  }

  // Each candidate grid cell takes the MAJORITY colour of the reference
  // pixels under it — the best any converter could do at that size — and every
  // reference pixel that disagrees with its cell is detail the grid lost.
  const mismatch: Record<number, number> = {}
  for (let s = opts.minSide; s <= opts.maxSide; s += step) {
    const cellOf = (v: number): number => Math.min(s - 1, Math.floor((v * s) / R))
    const tally = new Map<number, number>()
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < R; x++) {
        const key = (cellOf(y) * s + cellOf(x)) * 64 + id[y * R + x]!
        tally.set(key, (tally.get(key) ?? 0) + 1)
      }
    }
    const best = new Map<number, number>()
    for (const [key, n] of tally) {
      const cell = Math.floor(key / 64)
      if (n > (best.get(cell) ?? 0)) best.set(cell, n)
    }
    let kept = 0
    for (const n of best.values()) kept += n
    const wrong = R * R - kept
    const frac = wrong / (R * R)
    mismatch[s] = Number(frac.toFixed(4))
  }
  // Detail the LARGEST grid still loses (hairline gills, a fringe of grass, an
  // anti-aliased rim) is not detail any grid in range can carry, so it does not
  // count against the small ones: a side is enough once it is within
  // `MOTIF_GRID_GAIN` of the largest side's own mismatch, or under the
  // absolute `tolerance`, whichever is looser.
  const sides = Object.keys(mismatch).map(Number).sort((a, b) => a - b)
  const floor = mismatch[sides[sides.length - 1]!] ?? 0
  const enough = Math.max(tolerance, floor + MOTIF_GRID_GAIN)
  const side = sides.find((s) => mismatch[s]! <= enough) ?? opts.maxSide
  return { side, mismatch }
}

/**
 * How much detail (as a share of the reference picture) a bigger grid has to
 * buy before it is worth the extra stitches. See `motifGridSide`.
 */
export const MOTIF_GRID_GAIN = 0.03

/**
 * The share of a reference picture allowed to come back a different colour at
 * the chosen grid (`motifGridSide`). Calibrated on synthetic shapes in
 * `photo-to-tapestry.test.ts`: a single bold disc clears it at the smallest
 * side, a fine many-shape picture never does.
 */
export const MOTIF_GRID_TOLERANCE = 0.04

/** RGB distance under which two quantised colours count as the same yarn. */
const MOTIF_COLOUR_DISTANCE = 48

export async function photoToTapestryGrid(
  imageBytes: Buffer,
  settings: PhotoToTapestrySettings,
): Promise<TapestryGrid> {
  const width = Math.round(settings.width)
  const height = Math.round(settings.height)
  const ceiling = Math.max(TAPESTRY_MIN_COLOURS, Math.round(settings.maxColours ?? TAPESTRY_MAX_COLOURS))
  const colours = Math.max(TAPESTRY_MIN_COLOURS, Math.min(ceiling, Math.round(settings.colours)))

  let source = imageBytes
  if (settings.cropToSubject) {
    const cropped = await cropToSubject(
      imageBytes,
      settings.frameMargin != null ? { aspect: width / height, margin: settings.frameMargin } : undefined,
    )
    if (settings.minSubjectCoverage != null && cropped.coverage < settings.minSubjectCoverage) {
      throw new TapestrySubjectTooSmallError(cropped.coverage, settings.minSubjectCoverage)
    }
    source = cropped.buffer
  }

  // Cropped to the subject's own bounds (or the whole frame, if there was
  // nothing to trim), so 'cover' + 'attention' is now filling the target grid
  // from the picture that matters rather than centring it inside dead space.
  const k = Math.max(1, Math.round(settings.majority ?? 1))
  const qw = width * k
  const qh = height * k
  let pipeline = sharp(source).removeAlpha().resize(qw, qh, {
    fit: 'cover',
    position: 'attention',
  })
  if (settings.backgroundRemoval) {
    pipeline = pipeline.modulate({ saturation: 1.15 }).normalise()
  }
  const { data: raw } = await pipeline.raw().toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(qw * qh * 4)
  for (let i = 0, j = 0; i < raw.length; i += 3, j += 4) {
    rgba[j] = raw[i]!
    rgba[j + 1] = raw[i + 1]!
    rgba[j + 2] = raw[i + 2]!
    rgba[j + 3] = 255
  }

  const inPC = iqUtils.PointContainer.fromUint8Array(new Uint8Array(rgba), qw, qh)
  const palette = await buildPaletteSync([inPC], {
    colors: k > 1 ? Math.max(colours, Math.round(settings.quantiseColours ?? colours)) : colours,
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
  let cells: string[] = new Array(qw * qh)
  for (let i = 0, c = 0; c < qw * qh; i += 4, c++) {
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

  const floor = settings.minColours ?? TAPESTRY_MIN_COLOURS
  if (k > 1) {
    cells = mergeMinorColours(cells, hexByKey, settings.minColourShare ?? 0, floor, colours)
    cells = majorityDownsample(cells, qw, k)
  }
  if (settings.minColourShare) {
    cells = mergeMinorColours(cells, hexByKey, settings.minColourShare, floor, colours)
  }
  cells = smoothIslands(cells, width, height, settings.smoothing)

  // Count what survived, drop anything smoothed away, and order the key by use
  // so the main yarn heads the list.
  const counts = new Map<string, number>()
  for (const k of cells) counts.set(k, (counts.get(k) ?? 0) + 1)
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1])
  // Snap every quantised colour to an actual, buyable yarn shade rather than
  // keeping the arbitrary averaged RGB the quantiser produced: the pattern
  // NAMES a shade ("Sage", "Terracotta") and the rendered hero has to be that
  // shade, not a nearby colour no yarn on the shelf actually makes.
  const shades = matchYarnShades(ordered.map(([k]) => hexByKey.get(k)!))
  const rename = new Map<string, string>()
  const paletteOut: TapestryColour[] = ordered.map(([tempKey, stitches], i) => {
    const shade = shades[i]!
    const key = shadeKey(shade.name)
    rename.set(tempKey, key)
    return { key, name: shade.name, hex: shade.hex, stitches }
  })

  return {
    width,
    height,
    cells: cells.map((k) => rename.get(k) ?? k),
    palette: paletteOut,
  }
}

/** Each k x k block of a `qw`-wide key grid → the block's most common key. */
function majorityDownsample(cells: string[], qw: number, k: number): string[] {
  const w = qw / k
  const h = cells.length / qw / k
  const out: string[] = new Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tally = new Map<string, number>()
      for (let dy = 0; dy < k; dy++) {
        const row = (y * k + dy) * qw + x * k
        for (let dx = 0; dx < k; dx++) {
          const key = cells[row + dx]!
          tally.set(key, (tally.get(key) ?? 0) + 1)
        }
      }
      let best = ''
      let bestN = -1
      for (const [key, n] of tally) {
        if (n > bestN) {
          best = key
          bestN = n
        }
      }
      out[y * w + x] = best
    }
  }
  return out
}

/**
 * Fold every colour used on fewer than `minShare` of the stitches — and then
 * any colour past `cap` — into its nearest (RGB) surviving colour, smallest
 * first, stopping at `floor` colours.
 */
function mergeMinorColours(
  cells: string[],
  hexByKey: Map<string, string>,
  minShare: number,
  floor: number,
  cap = Infinity,
): string[] {
  const rgb = (k: string): [number, number, number] => {
    const h = hexByKey.get(k)!.slice(1)
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  let out = cells
  for (;;) {
    const counts = new Map<string, number>()
    for (const k of out) counts.set(k, (counts.get(k) ?? 0) + 1)
    if (counts.size <= floor) return out
    const [minor, n] = [...counts.entries()].sort((a, b) => a[1] - b[1])[0]!
    if (n / out.length >= minShare && counts.size <= cap) return out
    const [r, g, b] = rgb(minor)
    let best = minor
    let bestD = Infinity
    for (const k of counts.keys()) {
      if (k === minor) continue
      const [r2, g2, b2] = rgb(k)
      const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2
      if (d < bestD) {
        bestD = d
        best = k
      }
    }
    out = out.map((k) => (k === minor ? best : k))
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
