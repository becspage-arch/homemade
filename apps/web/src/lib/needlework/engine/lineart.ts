/**
 * Printable LINE-ART template from a pattern's elements — the clean outline a
 * stitcher transfers to fabric. It is derived from the SAME structured dataset
 * the loom renders as the hero, so the template can never diverge from the
 * finished piece: a fill becomes its outline, a worked line its centre-line, a
 * knot a small ring. Output is an SVG in real millimetres.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'

export interface LineArtOptions {
  /** Stroke colour. Default a deep indigo. */ stroke?: string
  /** Outline weight (mm). Default 0.5. */ strokeWidthMm?: number
  /** Background fill. Default white. */ background?: string
}

/** Stitch slugs that are worked as a LINE (drawn as a centre-line, not a fill). */
const LINE_SLUGS = new Set([
  'embroidery-stem', 'embroidery-outline', 'embroidery-back', 'embroidery-split',
  'embroidery-running', 'embroidery-straight', 'embroidery-fern', 'embroidery-couching',
])

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

export function patternToLineArtSvg(
  elements: StitchedElement[],
  sizeMm: { width: number; height: number },
  opts: LineArtOptions = {},
): string {
  const stroke = opts.stroke ?? '#1b2a4a'
  const sw = opts.strokeWidthMm ?? 0.5
  const bg = opts.background ?? '#ffffff'
  let body = ''
  for (const el of elements) {
    const g = el.geometry
    if (g.kind === 'point' && g.at) {
      body += `<circle cx="${r2(g.at[0])}" cy="${r2(g.at[1])}" r="${r2(sw * 2.6)}" fill="none" stroke="${stroke}" stroke-width="${r2(sw * 0.8)}"/>`
      continue
    }
    const pts = g.points
    if (pts && pts.length >= 2) {
      const d = pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' ')
      if (LINE_SLUGS.has(el.stitchType)) {
        body += `<polyline points="${d}" fill="none" stroke="${stroke}" stroke-width="${r2(sw * 1.3)}" stroke-linecap="round" stroke-linejoin="round"/>`
      } else {
        body += `<polygon points="${d}" fill="none" stroke="${stroke}" stroke-width="${r2(sw)}" stroke-linejoin="round"/>`
      }
    }
  }
  const w = r2(sizeMm.width)
  const h = r2(sizeMm.height)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${bg}"/>${body}</svg>`
}
