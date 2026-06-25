/**
 * Printable line-art template — derived from the SAME stitchedElements the loom
 * renders, so the traceable outline and the stitched hero can never disagree
 * (one source of truth). This is a required deliverable of every pattern: the
 * clean drawing the stitcher transfers onto cloth.
 *
 * Output is an SVG in millimetre units (viewBox = the finished size), so it
 * prints at true scale and a later layout step can tile it across A4 / US Letter
 * / A0 pages the way a sewing pattern does. Fills become their region outline,
 * lines become their path, knots a small ring, wheels a circle.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'

export interface LineArtOptions {
  /** Stroke width in mm. */ strokeMm?: number
  /** Ink colour. */ ink?: string
}

export function patternToLineArtSvg(
  elements: StitchedElement[],
  finishedSizeMm: { width: number; height: number },
  opts: LineArtOptions = {},
): string {
  const sw = opts.strokeMm ?? 0.35
  const ink = opts.ink ?? '#1b2a4a'
  const W = round(finishedSizeMm.width)
  const H = round(finishedSizeMm.height)
  const parts: string[] = []
  for (const el of elements) {
    const g = el.geometry
    if (g.kind === 'point') {
      parts.push(`<circle cx="${round(g.at[0])}" cy="${round(g.at[1])}" r="${sw * 2}" />`)
    } else if (g.kind === 'disc') {
      parts.push(`<circle cx="${round(g.at[0])}" cy="${round(g.at[1])}" r="${round(g.radiusMm)}" fill="none" />`)
    } else if (g.kind === 'path') {
      const pts = g.points.map((p) => `${round(p[0])},${round(p[1])}`).join(' ')
      // A fill carries a stitch direction; draw it CLOSED (a region outline). A
      // line has no direction; draw it OPEN (the stitched path).
      const closed = el.directionDeg != null
      parts.push(
        closed
          ? `<polygon points="${pts}" fill="none" />`
          : `<polyline points="${pts}" fill="none" />`,
      )
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">` +
    `<rect width="${W}" height="${H}" fill="#ffffff"/>` +
    `<g stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" fill="none">` +
    parts.join('') +
    `</g></svg>`
  )
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
