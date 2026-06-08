/**
 * Server-side SVG renderer for a Pattern. Produces a self-contained
 * SVG string the thumbnail endpoint then rasterises via `sharp` and
 * the PDF export embeds directly.
 *
 * The output mirrors what ChartViewport draws on screen but without
 * any interactive state: no selection rect, no pan/zoom transform, no
 * mark-stitched overlay (callers can opt in for the "in-progress"
 * thumbnail flavour). The grid + centre crosshairs render at the same
 * weights, so a chart printed on paper reads the same as the chart
 * viewed on screen.
 */

import type { PatternData } from '@homemade/db'
import {
  buildBucketCrossPath,
  buildBucketHighlightPath,
  buildPaletteIndex,
  groupCellsBySymbol,
  shiftColour,
  symbolOnFill,
} from './render-helpers'

export interface SvgRenderOptions {
  /** Pixel size of one cell in the output. Defaults to 32. */
  cellPx?: number
  /** Render in symbol-only B&W mode (for monochrome PDF chart pages). */
  monochrome?: boolean
  /** Render the centre crosshairs. */
  showCentreCrosshairs?: boolean
  /** Render the grid. */
  showGrid?: boolean
  /** Render the symbol overlay. */
  showSymbols?: boolean
  /** Optional sub-rectangle of the grid to render (used by tiled PDF). */
  region?: { x: number; y: number; width: number; height: number }
  /** Extra outer padding in px. */
  padding?: number
  /** Mark-stitched overlay set, sparse "x,y" keys. */
  stitched?: Set<string>
}

export function renderPatternSvgString(pattern: PatternData, opts: SvgRenderOptions = {}): string {
  const cellPx = opts.cellPx ?? 32
  const showSymbols = opts.showSymbols ?? true
  const showGrid = opts.showGrid ?? true
  const showCentreCrosshairs = opts.showCentreCrosshairs ?? true
  const padding = opts.padding ?? 0
  const monochrome = opts.monochrome ?? false

  const region =
    opts.region ?? {
      x: 0,
      y: 0,
      width: pattern.grid.width,
      height: pattern.grid.height,
    }

  const paletteIndex = buildPaletteIndex(pattern)
  const buckets = groupCellsBySymbol(pattern)
  const regionMaxX = region.x + region.width
  const regionMaxY = region.y + region.height

  const totalW = region.width * cellPx + padding * 2
  const totalH = region.height * cellPx + padding * 2
  const offX = padding - region.x * cellPx
  const offY = padding - region.y * cellPx

  const parts: string[] = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" role="img">`,
  )

  // Fabric background.
  if (!monochrome) {
    parts.push(
      `<rect x="${padding}" y="${padding}" width="${region.width * cellPx}" height="${region.height * cellPx}" fill="${pattern.fabric.colourRgb}"/>`,
    )
  } else {
    parts.push(
      `<rect x="${padding}" y="${padding}" width="${region.width * cellPx}" height="${region.height * cellPx}" fill="#ffffff"/>`,
    )
  }

  // One <g> per colour bucket.
  for (const [symbol, cells] of buckets) {
    if (cells.length === 0) continue
    const entry = paletteIndex.bySymbol.get(symbol)
    if (!entry) continue
    const inRegion = cells.filter(
      (c) => c.x >= region.x && c.x < regionMaxX && c.y >= region.y && c.y < regionMaxY,
    )
    if (inRegion.length === 0) continue
    parts.push(`<g transform="translate(${offX} ${offY})">`)
    if (monochrome) {
      // B&W: fill is white, symbol overlay carries the colour identity.
      for (const { x, y } of inRegion) {
        parts.push(
          `<rect x="${x * cellPx}" y="${y * cellPx}" width="${cellPx}" height="${cellPx}" fill="#ffffff" stroke="#1a1410" stroke-width="0.6"/>`,
        )
      }
    } else {
      parts.push(
        `<path d="${buildBucketCrossPath(inRegion, cellPx)}" stroke="${shiftColour(entry.rgb, -0.18)}" stroke-width="${cellPx * 0.22}" stroke-linecap="round" fill="none" opacity="0.85"/>`,
      )
      parts.push(
        `<path d="${buildBucketCrossPath(inRegion, cellPx)}" stroke="${entry.rgb}" stroke-width="${cellPx * 0.16}" stroke-linecap="round" fill="none"/>`,
      )
      parts.push(
        `<path d="${buildBucketHighlightPath(inRegion, cellPx)}" stroke="${shiftColour(entry.rgb, 0.32)}" stroke-width="${cellPx * 0.06}" stroke-linecap="round" fill="none" opacity="0.55"/>`,
      )
    }
    parts.push(`</g>`)
  }

  // Back-stitch.
  if (pattern.grid.backstitch.length > 0) {
    parts.push(`<g transform="translate(${offX} ${offY})" stroke-linecap="round">`)
    for (const seg of pattern.grid.backstitch) {
      const entry = paletteIndex.bySymbol.get(seg.s)
      if (!entry) continue
      const colour = monochrome ? '#1a1410' : shiftColour(entry.rgb, -0.22)
      parts.push(
        `<line x1="${seg.x1 * cellPx}" y1="${seg.y1 * cellPx}" x2="${seg.x2 * cellPx}" y2="${seg.y2 * cellPx}" stroke="${colour}" stroke-width="${Math.max(1.2, cellPx * 0.08)}"/>`,
      )
    }
    parts.push(`</g>`)
  }

  // French knots.
  if (pattern.grid.frenchKnots.length > 0) {
    parts.push(`<g transform="translate(${offX} ${offY})">`)
    for (const k of pattern.grid.frenchKnots) {
      const entry = paletteIndex.bySymbol.get(k.s)
      if (!entry) continue
      const cx = k.x * cellPx + cellPx / 2
      const cy = k.y * cellPx + cellPx / 2
      const r = cellPx * 0.26
      const base = monochrome ? '#1a1410' : shiftColour(entry.rgb, -0.18)
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${base}"/>`)
      if (!monochrome) {
        parts.push(
          `<circle cx="${cx - r * 0.3}" cy="${cy - r * 0.3}" r="${r * 0.35}" fill="${shiftColour(entry.rgb, 0.4)}"/>`,
        )
      }
    }
    parts.push(`</g>`)
  }

  // Stitched overlay.
  if (opts.stitched && opts.stitched.size > 0) {
    parts.push(`<g transform="translate(${offX} ${offY})">`)
    for (const k of opts.stitched) {
      const [xs, ys] = k.split(',')
      const x = Number(xs)
      const y = Number(ys)
      if (
        !Number.isInteger(x) ||
        !Number.isInteger(y) ||
        x < region.x ||
        y < region.y ||
        x >= regionMaxX ||
        y >= regionMaxY
      )
        continue
      parts.push(
        `<rect x="${x * cellPx}" y="${y * cellPx}" width="${cellPx}" height="${cellPx}" fill="${pattern.fabric.colourRgb}" opacity="0.72"/>`,
      )
    }
    parts.push(`</g>`)
  }

  // Grid lines.
  if (showGrid) {
    parts.push(`<g transform="translate(${offX} ${offY})" stroke="#3d2f22" fill="none">`)
    const startX = Math.max(0, region.x)
    const endX = Math.min(pattern.grid.width, regionMaxX)
    const startY = Math.max(0, region.y)
    const endY = Math.min(pattern.grid.height, regionMaxY)
    for (let c = startX; c <= endX; c++) {
      const isEdge = c === 0 || c === pattern.grid.width
      const isMajor = c % 10 === 0
      const w = isEdge ? 1.4 : isMajor ? 0.9 : 0.3
      const o = isEdge ? 0.9 : isMajor ? 0.55 : 0.2
      parts.push(
        `<line x1="${c * cellPx}" y1="${startY * cellPx}" x2="${c * cellPx}" y2="${endY * cellPx}" stroke-width="${w}" opacity="${o}"/>`,
      )
    }
    for (let r = startY; r <= endY; r++) {
      const isEdge = r === 0 || r === pattern.grid.height
      const isMajor = r % 10 === 0
      const w = isEdge ? 1.4 : isMajor ? 0.9 : 0.3
      const o = isEdge ? 0.9 : isMajor ? 0.55 : 0.2
      parts.push(
        `<line x1="${startX * cellPx}" y1="${r * cellPx}" x2="${endX * cellPx}" y2="${r * cellPx}" stroke-width="${w}" opacity="${o}"/>`,
      )
    }
    parts.push(`</g>`)
  }

  // Centre crosshairs.
  if (showCentreCrosshairs) {
    const cx = pattern.grid.width / 2
    const cy = pattern.grid.height / 2
    if (cx >= region.x && cx <= regionMaxX && cy >= region.y && cy <= regionMaxY) {
      parts.push(
        `<g transform="translate(${offX} ${offY})" stroke="#c4856b" stroke-width="1.6" opacity="0.72">`,
      )
      parts.push(
        `<line x1="${cx * cellPx}" y1="${Math.max(region.y, 0) * cellPx}" x2="${cx * cellPx}" y2="${Math.min(pattern.grid.height, regionMaxY) * cellPx}"/>`,
      )
      parts.push(
        `<line x1="${Math.max(region.x, 0) * cellPx}" y1="${cy * cellPx}" x2="${Math.min(pattern.grid.width, regionMaxX) * cellPx}" y2="${cy * cellPx}"/>`,
      )
      parts.push(`</g>`)
    }
  }

  // Symbol overlay.
  if (showSymbols && cellPx >= 14) {
    parts.push(`<g transform="translate(${offX} ${offY})" font-family="ui-monospace,monospace" text-anchor="middle" dominant-baseline="central">`)
    for (const [symbol, cells] of buckets) {
      const entry = paletteIndex.bySymbol.get(symbol)
      if (!entry) continue
      const fill = monochrome ? '#1a1410' : symbolOnFill(entry.rgb)
      const fontSize = cellPx * 0.5
      const inRegion = cells.filter(
        (c) => c.x >= region.x && c.x < regionMaxX && c.y >= region.y && c.y < regionMaxY,
      )
      for (const { x, y } of inRegion) {
        parts.push(
          `<text x="${x * cellPx + cellPx / 2}" y="${y * cellPx + cellPx / 2}" font-size="${fontSize}" fill="${fill}">${escapeXml(symbol)}</text>`,
        )
      }
    }
    parts.push(`</g>`)
  }

  parts.push('</svg>')
  return parts.join('')
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
