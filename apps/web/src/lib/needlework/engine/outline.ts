/**
 * Clean transfer-template renderer for the DENSE illustration-guided engine.
 *
 * A dense thread-painting pattern stores thousands of tiny individual stitches —
 * great as the photoreal hero and as a colour/direction MAP, but useless as a
 * transfer template (it's a stitch-density cloud, not a traceable line). So the
 * engine also derives a clean `OutlinePath[]` of the MAJOR shapes (silhouette +
 * key internal boundaries), in the SAME finished-mm space as the stitches. This
 * module draws that outline as the clean line the stitcher irons / traces onto
 * fabric, and as a thin overlay that registers exactly over the dense map.
 *
 * Both ship in the pattern: the outline is the transfer, the dense map is the
 * working guide, and because they share coordinates they line up when overlaid.
 */

import type { OutlinePath } from '../illustration-engine'

export interface OutlineSvgOptions {
  /** Outline ink. Default a deep indigo. */ stroke?: string
  /** Background fill. Default white (template); pass a linen for an overlay base. */
  background?: string
  /** Silhouette stroke weight (mm). Default scales with the design. */ silhouetteMm?: number
  /** Internal-boundary stroke weight (mm). Default ~0.6× the silhouette. */ internalMm?: number
}

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

/** The outline strokes only (no <svg> wrapper) — reused by the printable template
 *  and the dense-map overlay so the same lines register everywhere. */
export function outlineBody(
  outline: OutlinePath[],
  sizeMm: { width: number; height: number },
  opts: OutlineSvgOptions = {},
): string {
  const ink = opts.stroke ?? '#1b2a4a'
  const swSil = opts.silhouetteMm ?? Math.max(0.5, sizeMm.width / 320)
  const swInt = opts.internalMm ?? swSil * 0.62
  let body = ''
  for (const path of outline) {
    const pts = path.points
    if (!pts || pts.length < 3) continue
    const d = pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' ')
    const sw = path.kind === 'silhouette' ? swSil : swInt
    body += `<polygon points="${d}" fill="none" stroke="${ink}" stroke-width="${r2(sw)}" stroke-linejoin="round" stroke-linecap="round"/>`
  }
  return body
}

/** A clean, traceable line drawing of the major shapes — the transfer template. */
export function outlineToSvg(
  outline: OutlinePath[],
  sizeMm: { width: number; height: number },
  opts: OutlineSvgOptions = {},
): string {
  const bg = opts.background ?? '#ffffff'
  const w = r2(sizeMm.width)
  const h = r2(sizeMm.height)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">` +
    `<rect width="100%" height="100%" fill="${bg}"/>${outlineBody(outline, sizeMm, opts)}</svg>`
  )
}

/** Overlay the clean outline ON TOP of an already-rendered SVG (e.g. the dense
 *  colour/stitch map), before </svg>. Proves they register: the boundary lines
 *  sit exactly on the colour regions. */
export function overlayOutline(
  svg: string,
  outline: OutlinePath[],
  sizeMm: { width: number; height: number },
  opts: OutlineSvgOptions = {},
): string {
  return svg.replace('</svg>', `${outlineBody(outline, sizeMm, opts)}</svg>`)
}
