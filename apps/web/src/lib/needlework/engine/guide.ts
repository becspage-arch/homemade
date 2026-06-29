/**
 * Pattern GUIDE renderer — the industry-standard transfer template + colour
 * guide, derived from the same StitchedElement[] the loom renders. The ONE idea
 * that makes these readable (and that the naive outline dump got wrong) is
 * OCCLUSION: the design is drawn back-to-front as LAYERED artwork, each shape
 * filled so it hides the lines of whatever sits behind it, with a clean outline
 * drawn on top. A shape in front covers a shape behind — no see-through tangle.
 *
 * Two views from one dataset:
 *   - 'colour'   : each area in its thread colour with the outline on top (+ short
 *                  stitch-direction ticks) — the readable reference a stitcher works from.
 *   - 'template' : the same artwork with white fills — clean outlines only, for
 *                  tracing / iron-on / stick-and-stitch transfer.
 *
 * Reusable across every pattern craft (the tangle is a cross-craft problem).
 */

import type { StitchedElement } from '../../loom/render/renderPattern'

export interface GuideOptions {
  mode: 'colour' | 'template'
  /** Background (the linen colour for the colour guide; white for the template). */
  background?: string
  /** Outline ink. */
  outline?: string
  /** Draw short stitch-direction ticks inside shaded/satin fills (colour guide). */
  directionHints?: boolean
}

const LINE_BASE = new Set(['stem', 'outline', 'back', 'split', 'running', 'straight', 'fern', 'couching'])

function baseSlug(s: string): string {
  return s.replace(/^embroidery-/, '')
}
function r2(n: number): number {
  return Math.round(n * 100) / 100
}
function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function darken(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `#${[r, g, b].map((c) => Math.max(0, Math.round(c * f)).toString(16).padStart(2, '0')).join('')}`
}

/** Mid colour of a shaded ramp, else the element's flat colour. */
function fillOf(el: StitchedElement): string {
  if (el.shade?.ramp?.length) return el.shade.ramp[Math.floor(el.shade.ramp.length / 2)]!
  return el.colourHex
}

function centroid(pts: [number, number][]): [number, number] {
  let sx = 0
  let sy = 0
  for (const p of pts) {
    sx += p[0]
    sy += p[1]
  }
  return [sx / pts.length, sy / pts.length]
}

/** A teardrop petal outline from `base` (point) to `tip` (round end) — how a
 *  lazy-daisy loop should read on a template, not as a bare spike. */
function teardrop(base: [number, number], tip: [number, number], widthFrac = 0.34): [number, number][] {
  const dx = tip[0] - base[0]
  const dy = tip[1] - base[1]
  const len = Math.hypot(dx, dy) || 1e-6
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const w = len * widthFrac
  const along = (t: number): [number, number] => [base[0] + ux * len * t, base[1] + uy * len * t]
  const off = (p: [number, number], s: number): [number, number] => [p[0] + nx * s, p[1] + ny * s]
  const pts: [number, number][] = [base]
  for (let i = 1; i <= 5; i++) pts.push(off(along(i / 6), Math.sin((i / 6) * Math.PI) * w))
  pts.push(tip)
  for (let i = 5; i >= 1; i--) pts.push(off(along(i / 6), -Math.sin((i / 6) * Math.PI) * w))
  return pts
}

export function patternToGuideSvg(
  elements: StitchedElement[],
  sizeMm: { width: number; height: number },
  opts: GuideOptions,
): string {
  const colourMode = opts.mode === 'colour'
  const ink = opts.outline ?? '#2f2b34'
  const bg = opts.background ?? (colourMode ? '#ece4d2' : '#ffffff')
  const sw = Math.max(0.28, sizeMm.width / 520) // outline weight (mm)
  const knotR = Math.max(0.8, sizeMm.width / 150)
  let body = ''

  for (const el of elements) {
    const g = el.geometry
    const base = baseSlug(el.stitchType)
    const colour = fillOf(el)

    // French knot / seed -> a small dot
    if (g.kind === 'point' && g.at) {
      const fill = colourMode ? colour : '#ffffff'
      body += `<circle cx="${r2(g.at[0])}" cy="${r2(g.at[1])}" r="${r2(knotR)}" fill="${fill}" stroke="${ink}" stroke-width="${r2(sw)}"/>`
      continue
    }
    // Woven wheel / spider web -> filled disc with a few spokes
    if (g.kind === 'disc' && g.at) {
      const rad = g.radiusMm ?? knotR * 2
      const fill = colourMode ? colour : '#ffffff'
      body += `<circle cx="${r2(g.at[0])}" cy="${r2(g.at[1])}" r="${r2(rad)}" fill="${fill}" stroke="${ink}" stroke-width="${r2(sw)}"/>`
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2
        body += `<line x1="${r2(g.at[0])}" y1="${r2(g.at[1])}" x2="${r2(g.at[0] + Math.cos(a) * rad)}" y2="${r2(g.at[1] + Math.sin(a) * rad)}" stroke="${ink}" stroke-width="${r2(sw * 0.6)}"/>`
      }
      continue
    }

    const pts = g.points
    if (!pts || pts.length < 2) continue

    // Lazy daisy -> a petal outline (base = first point, tip = farthest point)
    if (base === 'detached-chain') {
      let tip = pts[1]!
      let best = -1
      for (const p of pts) {
        const d = (p[0] - pts[0]![0]) ** 2 + (p[1] - pts[0]![1]) ** 2
        if (d > best) {
          best = d
          tip = p
        }
      }
      const petal = teardrop(pts[0]!, tip)
      const fill = colourMode ? colour : '#ffffff'
      body += `<polygon points="${petal.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' ')}" fill="${fill}" stroke="${ink}" stroke-width="${r2(sw)}"/>`
      continue
    }

    // Worked LINE (stem/back/straight/fern…) -> a stroke (thread colour on the
    // colour guide, ink on the template). No fill, so it never blocks anything.
    if (LINE_BASE.has(base)) {
      const d = pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' ')
      const stroke = colourMode ? colour : ink
      body += `<polyline points="${d}" fill="none" stroke="${stroke}" stroke-width="${r2(sw * 1.5)}" stroke-linecap="round" stroke-linejoin="round"/>`
      continue
    }

    // Filled shape (satin / long-and-short) -> opaque fill (occludes what's
    // behind) + clean outline on top.
    if (pts.length >= 3) {
      const fill = colourMode ? colour : '#ffffff'
      const d = pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' ')
      body += `<polygon points="${d}" fill="${fill}" stroke="${ink}" stroke-width="${r2(sw)}" stroke-linejoin="round"/>`
      // short stitch-direction tick(s) for shaded fills on the colour guide
      if (colourMode && opts.directionHints && el.shade) {
        const [cx, cy] = centroid(pts)
        const a = ((el.shade.axisDeg ?? el.directionDeg ?? 90) * Math.PI) / 180
        const L = Math.min(sizeMm.width, sizeMm.height) * 0.018
        body += `<line x1="${r2(cx - Math.cos(a) * L)}" y1="${r2(cy - Math.sin(a) * L)}" x2="${r2(cx + Math.cos(a) * L)}" y2="${r2(cy + Math.sin(a) * L)}" stroke="${darken(colour, 0.5)}" stroke-width="${r2(sw * 0.7)}" stroke-linecap="round"/>`
      }
    }
  }

  const w = r2(sizeMm.width)
  const h = r2(sizeMm.height)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${bg}"/>${body}</svg>`
}
