/**
 * SVG composer — turns a LayoutResult into a final SVG document string.
 *
 * Each stitch placement is stamped as one or more `<path>` elements with a
 * transform that translates → rotates → scales the unit-space path. The
 * yarn look is built from:
 *
 *   - Outer rim stroke at slightly darker shade.
 *   - Body stroke at the palette colour.
 *   - Inner highlight stroke at slightly lighter shade.
 *   - Optional fill region for blob stitches (bobble, popcorn, puff).
 *
 * The background is the palette's `background` colour with a subtle weave
 * pattern (fine cross-hatch via `<pattern>`) that hints at fabric without
 * dominating.
 */

import { shiftColour } from '../palette/apply-colours'
import type { RendererPalette, StitchPlacement } from '../types'

interface ComposeOptions {
  width: number
  height: number
  placements: StitchPlacement[]
  palette: RendererPalette
  /** If true, surround the rendered area with a thin border. */
  border?: boolean
  /** Optional title in the top-left corner. */
  title?: string
  /** Show centre crosshairs (debug). */
  showCentreCrosshair?: boolean
}

/** Build the transform string for one placement. */
function placementTransform(p: StitchPlacement): string {
  const tx = p.cx.toFixed(2)
  const ty = p.cy.toFixed(2)
  const rot = ((p.rotationRad * 180) / Math.PI).toFixed(2)
  const s = p.scalePx.toFixed(3)
  return `translate(${tx} ${ty}) rotate(${rot}) scale(${s})`
}

/**
 * Compose the placement's SVG fragment. Builds 3 strokes (rim + body +
 * inner sheen) plus an optional fill for blob shapes.
 */
function composePlacement(p: StitchPlacement): string {
  const colour = p.colour
  const rim = shiftColour(colour, -0.18)
  const sheen = shiftColour(colour, 0.20)
  const flavour = p.shape.flavour ?? 'stroke'
  const t = placementTransform(p)

  // Stroke widths are expressed in unit space (paths are drawn in -1..+1).
  // After the scale, the rendered stroke width is `unit-stroke * scalePx`.
  const wRim = 0.46
  const wBody = 0.36
  const wSheen = 0.18
  const wFlat = 0.22

  const parts: string[] = [`<g transform="${t}">`]

  if (p.shape.marker) {
    // Markers are scaffolding — fainter, single stroke, no rim.
    parts.push(
      `<path d="${p.shape.path}" fill="none" stroke="${rim}" stroke-width="${wFlat}" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`,
    )
  } else if (flavour === 'flat') {
    // Low-profile yarn — chain, sl st, joining stitches.
    parts.push(
      `<path d="${p.shape.path}" fill="${colour}" stroke="${rim}" stroke-width="0.05" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
  } else {
    // Stroked yarn body with rim + sheen layers. fillPath, if present, is
    // composited last so the blob sits proud of the post.
    if (flavour === 'stroke' || flavour === 'stroke-and-fill') {
      parts.push(
        `<path d="${p.shape.path}" fill="none" stroke="${rim}" stroke-width="${wRim}" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      parts.push(
        `<path d="${p.shape.path}" fill="none" stroke="${colour}" stroke-width="${wBody}" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      parts.push(
        `<path d="${p.shape.path}" fill="none" stroke="${sheen}" stroke-width="${wSheen}" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`,
      )
    }
    if ((flavour === 'fill' || flavour === 'stroke-and-fill') && p.shape.fillPath) {
      parts.push(
        `<path d="${p.shape.fillPath}" fill="${colour}" stroke="${rim}" stroke-width="0.08" stroke-linejoin="round"/>`,
      )
      // Tiny highlight crescent for dimension.
      parts.push(
        `<path d="${p.shape.fillPath}" fill="${sheen}" opacity="0.32"/>`,
      )
    }
  }

  parts.push('</g>')
  return parts.join('')
}

/** Escape a string for inclusion as XML text. */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function composeSvg(opts: ComposeOptions): string {
  const fabric = opts.palette.background
  const fabricShadow = shiftColour(fabric, -0.06)
  const fabricHighlight = shiftColour(fabric, 0.04)
  const parts: string[] = []

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${opts.width} ${opts.height}" width="${opts.width}" height="${opts.height}" role="img">`,
  )

  // Defs: subtle weave + soft drop-shadow for the stitched area.
  parts.push('<defs>')
  parts.push(
    `<pattern id="cr-weave" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">` +
      `<rect width="10" height="10" fill="${fabric}"/>` +
      `<path d="M 0 5 L 10 5" stroke="${fabricShadow}" stroke-width="0.4" opacity="0.35"/>` +
      `<path d="M 5 0 L 5 10" stroke="${fabricShadow}" stroke-width="0.4" opacity="0.35"/>` +
      `<circle cx="0" cy="0" r="0.6" fill="${fabricHighlight}" opacity="0.6"/>` +
      `<circle cx="10" cy="0" r="0.6" fill="${fabricHighlight}" opacity="0.6"/>` +
      `<circle cx="0" cy="10" r="0.6" fill="${fabricHighlight}" opacity="0.6"/>` +
      `<circle cx="10" cy="10" r="0.6" fill="${fabricHighlight}" opacity="0.6"/>` +
      `</pattern>`,
  )
  parts.push(
    `<filter id="cr-shadow" x="-5%" y="-5%" width="110%" height="110%">` +
      `<feGaussianBlur in="SourceAlpha" stdDeviation="2.4"/>` +
      `<feOffset dx="0" dy="1.6" result="offsetblur"/>` +
      `<feComponentTransfer><feFuncA type="linear" slope="0.42"/></feComponentTransfer>` +
      `<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>` +
      `</filter>`,
  )
  parts.push('</defs>')

  // Fabric background.
  parts.push(
    `<rect x="0" y="0" width="${opts.width}" height="${opts.height}" fill="${fabric}"/>`,
  )
  parts.push(
    `<rect x="0" y="0" width="${opts.width}" height="${opts.height}" fill="url(#cr-weave)"/>`,
  )

  // Optional border.
  if (opts.border) {
    parts.push(
      `<rect x="6" y="6" width="${opts.width - 12}" height="${opts.height - 12}" fill="none" stroke="${shiftColour(fabric, -0.18)}" stroke-width="1" opacity="0.4"/>`,
    )
  }

  // Stitched area: group with drop-shadow filter so the work lifts off
  // the fabric. Render placements in order — round 1 first (innermost),
  // outer rounds last so they sit on top of inner.
  parts.push(`<g filter="url(#cr-shadow)">`)
  // Sort placements by roundNumber ascending so inner rounds render first.
  const sorted = opts.placements
    .slice()
    .sort((a, b) => a.roundNumber - b.roundNumber || a.indexInRound - b.indexInRound)
  for (const p of sorted) {
    parts.push(composePlacement(p))
  }
  parts.push(`</g>`)

  if (opts.showCentreCrosshair && opts.placements.length > 0) {
    // Centre point inferred as the centroid of all placements.
    let sx = 0
    let sy = 0
    for (const p of opts.placements) {
      sx += p.cx
      sy += p.cy
    }
    const cx = sx / opts.placements.length
    const cy = sy / opts.placements.length
    parts.push(
      `<g stroke="#c4856b" stroke-width="1" opacity="0.5">` +
        `<line x1="${cx - 12}" y1="${cy}" x2="${cx + 12}" y2="${cy}"/>` +
        `<line x1="${cx}" y1="${cy - 12}" x2="${cx}" y2="${cy + 12}"/>` +
        `</g>`,
    )
  }

  if (opts.title) {
    parts.push(
      `<text x="${opts.width / 2}" y="${opts.height - 14}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14" text-anchor="middle" fill="#5a4a3a" opacity="0.85">${escapeXml(opts.title)}</text>`,
    )
  }

  parts.push('</svg>')
  return parts.join('')
}
