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
import { rankedDmcFull } from '@/lib/floss/dmc-full'
import {
  assignChartSymbols,
  buildAdjacency,
  SYMBOL_GLYPHS,
} from '@/lib/studio/symbol-assignment'

/**
 * The chart symbol vocabulary — one distinct symbol per palette colour. The
 * pattern schema rejects a chart with two palette entries sharing a symbol, so
 * the catalogue has to be at least as large as the densest chart we ever emit
 * (the 200–300 colour showpiece tier).
 *
 * The list itself, along with each symbol's confusable group and ink weight,
 * lives in `symbol-assignment.ts`; it is ordered most-distinctive first. Every
 * glyph is inside the ranges the chart render font (DejaVu Sans) covers fully,
 * so none render as tofu, and past the plain glyphs the catalogue carries the
 * same glyphs with a rule under or over them — the second channel, which is
 * what puts the ceiling well past what a showpiece asks for.
 */
export const PATTERN_SYMBOLS = SYMBOL_GLYPHS


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
  /**
   * The number of DISTINCT FLOSS STANDS the finished chart should carry, as
   * opposed to `colours`, which is only what the RGB quantiser is asked for.
   *
   * The two are not the same number and the gap is large. The quantiser works
   * in RGB and knows nothing about DMC; every swatch it returns is then snapped
   * to its nearest stand, and several routinely land on one. Asking for 300
   * colours on a real Flux scene measured out at 122 stands — the heirloom
   * tier's headline number missed by more than a third — and raising the
   * quantiser request alone does not fix it: the extra swatches collapse onto
   * the same stands, so the curve flattens (measured: 300 → 122, 520 → 131).
   *
   * When this is set, three things change. The snap becomes capacity-aware:
   * swatches are assigned biggest-area-first, and one whose nearest stand is
   * already taken moves to the next stand along if there is one nearly as close
   * (`SPREAD_SLACK_DE` / `SPREAD_MAX_DE`), which un-collapses exactly the
   * separations the quantiser had made on purpose. The confetti pass is then
   * run INSIDE the attempt, so what is counted is the stands that survive it
   * rather than the stands going in — the pass absorbs whole small islands and
   * counting before it is counting a number the customer never sees. And the
   * attempt is repeated up the ladder until the surviving count reaches the
   * target.
   *
   * It is a no-op for every existing caller, and it is bounded: a subject whose
   * gamut simply has not got this many separable stands in it stops at whatever
   * it has rather than inventing any, which is the correct answer and is the
   * signal the showpiece lane's own guard reads.
   */
  flossTarget?: number
}

/**
 * The escalating quantiser requests tried for a `flossTarget`, as a multiple of
 * the target.
 *
 * Short and coarse on purpose: each rung costs a full quantise pass plus a full
 * confetti pass (about 6s together at 500×500), and with the capacity-aware
 * snap doing the real work the first rung usually lands already. The rungs
 * exist for the subject that does not — a narrow-gamut picture needs more
 * quantiser swatches before there are enough distinct near-neighbours to spread
 * onto.
 */
const FLOSS_TARGET_LADDER = [1.6, 2.6, 4] as const

/**
 * How many stands deep the capacity-aware snap looks for an alternative when a
 * swatch's nearest one is taken. The full range is 457 stands; twenty is past
 * the point where anything still inside the tolerances below could be hiding.
 */
const SPREAD_LOOKAHEAD = 20

/**
 * How much further than its true nearest stand a swatch may be moved, in
 * CIELAB ΔE, when the nearest is already taken.
 *
 * This is the fidelity dial and it is deliberately tight. Neighbouring stands
 * in the full DMC range sit roughly ΔE 4–7 apart, so a slack of 5 buys the next
 * shade along and nothing further; the hard ceiling of 12 stops a swatch in a
 * sparse corner of the range being dragged somewhere visibly wrong. A swatch
 * with no alternative inside both bounds collapses exactly as it always did.
 */
const SPREAD_SLACK_DE = 5
const SPREAD_MAX_DE = 12

/**
 * The distinct-stand count the snap spreads towards, as a multiple of the
 * target — headroom for the confetti pass, which then absorbs some of them.
 * Measured at 500×500 with four confetti passes the loss is around a sixth.
 */
const SPREAD_HEADROOM = 1.2

/**
 * The downscale kernel, by how small the chart is.
 *
 * Sharp's default lanczos3 rings: every hard edge in the source comes back with
 * a fringe of invented in-between colours a pixel or two wide. On a 200-cell
 * scene that fringe is a rounding error. On a 50-cell one-evening motif each
 * fringe cell is two per cent of the width, and the fringe is what the clarity
 * guard reads as scatter — measured on a flat sticker motif, lanczos3 gave 2.5
 * colour areas per floss where mitchell gave 1.3, on the same source image.
 * Mitchell is the standard low-ringing cubic; nothing above the small lanes
 * changes, so every existing chart converts exactly as before.
 */
const SMALL_CHART_CELLS = 90
function resizeKernel(width: number, height: number): 'lanczos3' | 'mitchell' {
  return Math.max(width, height) <= SMALL_CHART_CELLS ? 'mitchell' : 'lanczos3'
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
      .resize(width, height, { fit: 'cover', position: 'attention', kernel: resizeKernel(width, height) })
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

  // A FRESH container per quantise pass, never a shared one: `applyPaletteSync`
  // writes the quantised result back into the container it was handed, so a
  // second pass over the same one is quantising the first pass's output rather
  // than the photograph. That is what made the floss-target ladder look flat —
  // every rung returned the same count because every rung after the first was
  // re-quantising an already-quantised image.
  const freshContainer = () => iqUtils.PointContainer.fromUint8Array(new Uint8Array(rgba), width, height)

  // The chart is built on FLOSS CODES, not on raw quantised colours: several
  // quantiser swatches routinely resolve to the same stand, and giving each its
  // own palette row would fill the key with duplicate-colour entries. Keying by
  // code means the palette size IS the true distinct-floss count, and adjacent
  // cells that share a stand share a cell value — which also feeds the confetti
  // pass fewer false islands.
  //
  // Symbols are assigned at the END, once the grid is final: which glyph a
  // colour gets depends on what it touches and how much of it there is, and
  // neither is known until the confetti pass has run. See symbol-assignment.ts.
  /** One quantise + snap-to-DMC pass. `spreadTo` is the distinct-stand target
   *  the capacity-aware assignment aims at; without it this is the plain
   *  nearest-stand snap the converter has always done. */
  async function quantiseToCodes(
    request: number,
    spreadTo?: number,
  ): Promise<{
    cells: { x: number; y: number; s: string }[]
    codeToFloss: Map<string, { code: string; name: string; rgb: string }>
  }> {
    const inPC = freshContainer()
    const palette = await buildPaletteSync([inPC], {
      colors: Math.max(2, Math.min(request, cap)),
      paletteQuantization: 'wuquant',
      colorDistanceFormula: 'euclidean',
    })
    const outPC = await applyPaletteSync(inPC, palette, {
      colorDistanceFormula: 'euclidean',
      imageQuantization: 'nearest',
    })
    const outU8 = outPC.toUint8Array()

    // Pass one over the pixels: the quantised hex of every cell, and how many
    // cells each distinct hex owns. The population is what decides the order
    // stands are handed out in below, so it has to be known before any is.
    const cellHex = new Array<string>(width * height)
    const population = new Map<string, number>()
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        const key = `#${[outU8[i]!, outU8[i + 1]!, outU8[i + 2]!]
          .map((c) => c.toString(16).padStart(2, '0'))
          .join('')}`
        cellHex[y * width + x] = key
        population.set(key, (population.get(key) ?? 0) + 1)
      }
    }

    const colourToCode = new Map<string, string>() // quantised hex → floss code
    const codeToFloss = new Map<string, { code: string; name: string; rgb: string }>()
    const claimed = new Set<string>()
    // Biggest areas first. A swatch that owns a lot of cloth always gets its
    // true nearest stand; only the small ones are ever moved along, which is
    // the right way round — a nudge on a two-hundred-cell highlight is
    // invisible, the same nudge across a sky is not.
    const byPopulation = [...population.keys()].sort(
      (a, b) => population.get(b)! - population.get(a)! || (a < b ? -1 : 1),
    )
    for (const key of byPopulation) {
      let entry: { code: string; name: string; rgb: string }
      if (useFullRange) {
        const ranked = rankedDmcFull(key, spreadTo ? SPREAD_LOOKAHEAD : 1)
        let pick = ranked[0]!
        // The collapse, and the repair for it: when this swatch's nearest stand
        // is already spoken for, the quantiser had deliberately separated two
        // colours and the snap is about to put them back together. Give it the
        // next stand along instead — but only one that is genuinely nearly as
        // close, so the chart still says what the picture says. A swatch with
        // no honest alternative collapses exactly as it always did.
        if (spreadTo && claimed.size < spreadTo && claimed.has(pick.entry.code)) {
          const alt = ranked.find(
            (r) =>
              !claimed.has(r.entry.code) &&
              r.deltaE <= pick.deltaE + SPREAD_SLACK_DE &&
              r.deltaE <= SPREAD_MAX_DE,
          )
          if (alt) pick = alt
        }
        entry = { code: pick.entry.code, name: pick.entry.name, rgb: pick.entry.hex }
      } else {
        const e = nearestFloss(key, { brand }).entry
        entry = { code: e.code, name: e.name, rgb: e.rgb }
      }
      claimed.add(entry.code)
      colourToCode.set(key, entry.code)
      if (!codeToFloss.has(entry.code)) codeToFloss.set(entry.code, entry)
    }

    const out: { x: number; y: number; s: string }[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        out.push({ x, y, s: colourToCode.get(cellHex[y * width + x]!)! })
      }
    }
    return { cells: out, codeToFloss }
  }

  /** The confetti-minimise pass, lifted out so a floss-target run can measure
   *  the count that SURVIVES it rather than the count going in. */
  function minimiseConfetti(input: { x: number; y: number; s: string }[]): { x: number; y: number; s: string }[] {
    const passes = confettiMin === 'low' ? 1 : confettiMin === 'high' ? 4 : 2
    const passCells = input.slice()
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
          let win = me.s
          let winN = 0
          for (const [s, n] of counts) {
            if (n > winN) {
              win = s
              winN = n
            }
          }
          next[idx] = { ...me, s: win }
        }
      }
      for (let i = 0; i < next.length; i++) passCells[i] = next[i]!
    }
    return passCells
  }

  /** How many distinct stands actually reach the palette — a stand whose every
   *  island was absorbed by the confetti pass is not on the chart. */
  function standsOnCloth(finished: { x: number; y: number; s: string }[]): number {
    const seen = new Set<string>()
    for (const c of finished) seen.add(c.s)
    return seen.size
  }

  const target = settings.flossTarget
  let cells: { x: number; y: number; s: string }[]
  let codeToFloss: Map<string, { code: string; name: string; rgb: string }>

  if (!target) {
    // Exactly the single pass this has always been.
    const only = await quantiseToCodes(colours)
    codeToFloss = only.codeToFloss
    cells = minimiseConfetti(only.cells)
  } else {
    // The ladder. Each rung asks the quantiser for more swatches, spreads them
    // across stands, runs the confetti pass, and counts what survived; the rung
    // nearest the target wins. Overshoot counts against a rung exactly as
    // undershoot does — a chart past the top of its band is not a better answer
    // than one inside it.
    let best: { cells: typeof cells; codeToFloss: typeof codeToFloss; stands: number } | null = null
    let lastRequest = 0
    for (const rung of FLOSS_TARGET_LADDER) {
      const request = Math.min(Math.max(colours, Math.round(target * rung)), cap)
      if (request <= lastRequest) continue // the ceiling has flattened the ladder
      lastRequest = request
      const attempt = await quantiseToCodes(request, Math.round(target * SPREAD_HEADROOM))
      const finished = minimiseConfetti(attempt.cells)
      const stands = standsOnCloth(finished)
      if (!best || Math.abs(stands - target) < Math.abs(best.stands - target)) {
        best = { cells: finished, codeToFloss: attempt.codeToFloss, stands }
      }
      if (best.stands >= target || request >= cap) break
    }
    cells = best!.cells
    codeToFloss = best!.codeToFloss
  }


  // Stitch counts per stand, after the confetti pass — a stand can vanish
  // entirely when every one of its islands is absorbed.
  const stitchCount = new Map<string, number>()
  for (const c of cells) {
    if (!codeToFloss.has(c.s)) continue
    stitchCount.set(c.s, (stitchCount.get(c.s) ?? 0) + 1)
  }

  // Symbols last: busiest colours take the most distinctive marks, and no two
  // colours that touch on the cloth (or look alike in the key) get glyphs from
  // the same confusable group. The catalogue runs to over five hundred plain
  // glyphs and three times that with the rule channel, so even a 300-colour
  // showpiece keeps a unique symbol per stand with plenty in hand.
  const symbolByCode = assignChartSymbols(
    [...stitchCount].map(([code, count]) => ({
      key: code,
      rgb: codeToFloss.get(code)!.rgb,
      count,
    })),
    buildAdjacency(cells, width, height),
  )
  for (const cell of cells) cell.s = symbolByCode.get(cell.s) ?? '?'

  const orderedCodes = [...stitchCount.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .map(([code]) => code)
  const paletteEntries: PaletteEntry[] = orderedCodes.map((code) => {
    const floss = codeToFloss.get(code)!
    return {
      symbol: symbolByCode.get(code)!,
      brand,
      code: floss.code,
      name: floss.name,
      rgb: floss.rgb,
      strandsFullCross: 2,
      strandsBackstitch: 1,
    }
  })

  const data = parsePatternData({
    schemaVersion: PATTERN_SCHEMA_VERSION,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [], fractional: [] },
    palette: paletteEntries,
    fabric: { count: fabricCount, colourRgb: '#F5EBD8', type: 'Aida' },
    metadata: {},
  } satisfies PatternData)

  return { data, rgba }
}
