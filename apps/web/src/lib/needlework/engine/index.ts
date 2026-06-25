/**
 * The needlework pattern-maker engine — public surface.
 *
 * `bitmapToPattern` is the stable, deterministic boundary the whole product
 * rests on: hand it a flat-colour design bitmap (from a Flux brief render OR a
 * customer's flattened photo) and it returns the full pattern — stitchedElements
 * for the loom, the DMC floss list, the stitch legend and the written steps.
 *
 * Pipeline: downscale -> quantise colours (+ detect cloth) -> segment regions
 * -> classify each into a stitch + geometry -> bind to DMC floss + scale to mm
 * -> derive legend + steps. The ONLY non-deterministic step (the Flux design)
 * happens BEFORE this boundary, in the caller. See design-source.ts.
 */

import { quantise, type QuantResult } from './quantize'
import { segment } from './segment'
import { classifyAll } from './classify'
import { assemble } from './assemble'
import { buildLegend } from './legend'
import { buildSteps } from './steps'
import type { DesignBitmap, EmbroideryPattern, EngineOptions, PatternMeta } from './types'

export type {
  DesignBitmap,
  EmbroideryPattern,
  EngineOptions,
  PatternMeta,
  PatternSource,
  FlossUsage,
  LegendRow,
  PatternStep,
  StitchedElement,
} from './types'
export { briefToPrompt, referenceToPrompt, REFERENCE_IMG2IMG_STRENGTH } from './design-source'
export type { DesignBriefInput } from './design-source'
export { patternToLineArtSvg } from './lineart'
export type { LineArtOptions } from './lineart'
export { buildPatternDocument, expandShading } from './document'
export type { PatternDocument, FlossRow, StitchRow, ElementLabel, ShadedElement } from './document'

const DEFAULT_THREAD = { type: 'stranded-cotton', weight: '6-strand' }

/** Box-average downscale of an RGBA bitmap so the longest side === target px. */
function downscale(input: DesignBitmap, targetLong: number): DesignBitmap {
  const { rgba, width, height } = input
  const long = Math.max(width, height)
  if (long <= targetLong) return input
  const scale = targetLong / long
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))
  const out = new Uint8Array(w * h * 4)
  const sx = width / w
  const sy = height / h
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y * sy)
    const y1 = Math.min(height, Math.floor((y + 1) * sy))
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * sx)
      const x1 = Math.min(width, Math.floor((x + 1) * sx))
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        n = 0
      for (let yy = y0; yy < Math.max(y0 + 1, y1); yy++) {
        for (let xx = x0; xx < Math.max(x0 + 1, x1); xx++) {
          const o = (yy * width + xx) * 4
          r += rgba[o]!
          g += rgba[o + 1]!
          b += rgba[o + 2]!
          a += rgba[o + 3]!
          n++
        }
      }
      const o = (y * w + x) * 4
      out[o] = r / n
      out[o + 1] = g / n
      out[o + 2] = b / n
      out[o + 3] = a / n
    }
  }
  return { rgba: out, width: w, height: h }
}

/**
 * Crop a quantised result to the bounding box of its stitched (non-background)
 * pixels, padded by `padFrac` of the longer side. Lets the subject fill the
 * hoop. A design that already fills the frame is returned unchanged.
 */
function cropToContent(q: QuantResult, padFrac: number): QuantResult {
  const { labels, background, width, height } = q
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (labels[i]! < 0 || background[i] === 1) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  if (maxX < 0) return q // nothing stitched
  const pad = Math.round(Math.max(width, height) * padFrac)
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)
  const cw = maxX - minX + 1
  const ch = maxY - minY + 1
  // Already near-full-frame: not worth cropping.
  if (cw >= width * 0.92 && ch >= height * 0.92) return q
  const nl = new Int16Array(cw * ch)
  const nb = new Uint8Array(cw * ch)
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const si = (y + minY) * width + (x + minX)
      const di = y * cw + x
      nl[di] = labels[si]!
      nb[di] = background[si]!
    }
  }
  return { labels: nl, background: nb, clusters: q.clusters, width: cw, height: ch }
}

/** The deterministic boundary: flat-colour bitmap -> full embroidery pattern. */
export function bitmapToPattern(
  input: DesignBitmap,
  meta: PatternMeta,
  opts: EngineOptions = {},
): EmbroideryPattern {
  const workPx = opts.workPx ?? 320
  const maxColours = opts.maxColours ?? 10
  const strands = opts.strands ?? meta.strands ?? 6
  const brand = opts.brand ?? 'DMC'

  const work = downscale(input, workPx)
  const canvasArea = work.width * work.height
  // Keep small dots (knots/eyes/berries/stars); a 10px floor still kills speckle.
  const minArea = Math.max(10, Math.round(canvasArea * (opts.minRegionAreaFrac ?? 0.00022)))

  // A coloured ground soaks up colour slots (gradient variants), so give the
  // subject more boxes when one is set, or fine detail collapses.
  const colours = opts.groundHint ? maxColours + 6 : maxColours
  const full = quantise(work.rgba, work.width, work.height, colours, opts.groundHint)
  // Crop to the stitched content so the subject fills the hoop (Flux centres a
  // motif with margins; a full-frame design has no margin and is left as-is).
  const quant = cropToContent(full, 0.04)
  const regions = segment(quant, minArea)
  const classified = classifyAll(regions, quant.width, { workW: quant.width, workH: quant.height })

  // Uniform mm/px from the requested width keeps circles round; the true
  // finished height follows the cropped aspect.
  const mmPerPx = meta.finishedSizeMm.width / quant.width
  const finishedSizeMm = {
    width: quant.width * mmPerPx,
    height: quant.height * mmPerPx,
  }

  const { elements, palette, bound } = assemble(classified, quant, {
    mmPerPx,
    strands,
    brand,
    defaultThread: meta.defaultThread ?? DEFAULT_THREAD,
  })
  const legend = buildLegend(bound, strands)
  const steps = buildSteps(legend)

  const byStitch: Record<string, number> = {}
  for (const b of bound) byStitch[b.stitchSlug] = (byStitch[b.stitchSlug] ?? 0) + 1

  return {
    meta: { ...meta, finishedSizeMm, strands },
    palette,
    stitchedElements: elements,
    legend,
    steps,
    stats: {
      elements: elements.length,
      regions: regions.length,
      colours: palette.length,
      stitchTypes: Object.keys(byStitch).length,
      byStitch,
    },
  }
}
