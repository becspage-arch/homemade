/**
 * Server-side SVG renderer for a Pattern.
 *
 * Two render modes:
 *
 *   - 'beauty'   — looks like finished cross-stitch on real Aida cloth.
 *                  Strand-shaded X stitches in 5 concentric strokes,
 *                  visible Aida weave underneath with the characteristic
 *                  corner holes, soft drop shadow under the whole
 *                  stitched area. Used for hero / thumbnail / PDF cover.
 *
 *   - 'chart'    — the readable working-chart view (current behaviour).
 *                  Used for PDF chart pages and any other surface where
 *                  the stitcher needs the chart to be readable rather
 *                  than pretty.
 *
 * Both modes share the back-stitch, French-knot, grid, crosshair, and
 * stitched-overlay layers. Beauty mode adds the fabric texture defs and
 * the filter; chart mode skips them.
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

export type SvgRenderMode = 'beauty' | 'chart'

export interface SvgRenderOptions {
  /** Pixel size of one cell in the output. Defaults to 32. */
  cellPx?: number
  /** Visual style. Defaults to 'chart' (readable). 'beauty' is the
   *  finished-piece look used for hero / PDF cover / thumbnails. */
  mode?: SvgRenderMode
  /** Render in symbol-only B&W mode (chart mode only). */
  monochrome?: boolean
  /** Render the centre crosshairs. Defaults to true in chart mode. */
  showCentreCrosshairs?: boolean
  /** Render the grid. Defaults to true in chart mode, false in beauty. */
  showGrid?: boolean
  /** Render the symbol overlay. Defaults to true in chart mode. */
  showSymbols?: boolean
  /** Optional sub-rectangle of the grid to render (used by tiled PDF). */
  region?: { x: number; y: number; width: number; height: number }
  /** Extra outer padding in px. */
  padding?: number
  /**
   * How a stitched cell is drawn. 'stitch' (the default, and what the
   * on-screen viewport uses) draws the three-stroke X. 'block' fills the whole
   * cell with the floss colour instead.
   *
   * 'block' is for the printed chart. An X leaves most of the cell showing
   * bare fabric, so a symbol chosen for contrast against the floss colour ends
   * up sitting half on the floss and half on the cloth, and on a dense chart
   * it vanishes. A filled cell is what every printed chart worth buying does,
   * and it is what makes the symbol readable at 3 mm.
   */
  cellStyle?: 'stitch' | 'block'
  /**
   * Print only. The part of `region` this page owns. Cells inside the region
   * but outside the core are the overlap shared with the neighbouring page:
   * they are drawn, then greyed back, so the join is obvious and nothing is
   * stitched twice.
   */
  core?: { x: number; y: number; width: number; height: number }
  /** Mark-stitched overlay set, sparse "x,y" keys. */
  stitched?: Set<string>
}

export function renderPatternSvgString(pattern: PatternData, opts: SvgRenderOptions = {}): string {
  const mode: SvgRenderMode = opts.mode ?? 'chart'
  const cellPx = opts.cellPx ?? 32
  const monochrome = opts.monochrome ?? false
  const padding = opts.padding ?? 0

  // Mode-dependent defaults.
  const showGrid = opts.showGrid ?? mode === 'chart'
  const showSymbols = opts.showSymbols ?? mode === 'chart'
  const showCentreCrosshairs = opts.showCentreCrosshairs ?? mode === 'chart'

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

  const inset = padding

  const totalW = region.width * cellPx + inset * 2
  const totalH = region.height * cellPx + inset * 2
  const offX = inset - region.x * cellPx
  const offY = inset - region.y * cellPx

  const parts: string[] = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" role="img">`,
  )

  // ─── Defs: filters + fabric weave (beauty mode only) ────────────────────
  // Aida texture scales with pattern complexity: simple craft-style
  // patterns (< 20 colours) get a barely-there weave so they don't read
  // as twee; photographic patterns (≥ 20 colours) get the visible
  // weave + corner holes that imply real cloth.
  const richPalette = pattern.palette.length >= 20
  if (mode === 'beauty' && !monochrome) {
    const fabric = pattern.fabric.colourRgb
    const fabricDark = shiftColour(fabric, -0.08)
    const fabricMid = shiftColour(fabric, -0.03)
    const fabricHole = shiftColour(fabric, -0.16)
    parts.push(`<defs>`)
    parts.push(
      `<pattern id="aida-weave" x="0" y="0" width="${cellPx}" height="${cellPx}" patternUnits="userSpaceOnUse">`,
    )
    parts.push(`<rect width="${cellPx}" height="${cellPx}" fill="${fabric}"/>`)
    if (richPalette) {
      // Visible weave: warp + weft thread bundles + corner holes +
      // grain. Used for dense photographic patterns where the cloth
      // texture adds depth instead of fighting the subject.
      parts.push(
        `<rect x="0" y="0" width="${cellPx}" height="${cellPx * 0.08}" fill="${fabricMid}" opacity="0.6"/>`,
      )
      parts.push(
        `<rect x="0" y="${cellPx * 0.92}" width="${cellPx}" height="${cellPx * 0.08}" fill="${fabricMid}" opacity="0.6"/>`,
      )
      parts.push(
        `<rect x="0" y="0" width="${cellPx * 0.08}" height="${cellPx}" fill="${fabricMid}" opacity="0.6"/>`,
      )
      parts.push(
        `<rect x="${cellPx * 0.92}" y="0" width="${cellPx * 0.08}" height="${cellPx}" fill="${fabricMid}" opacity="0.6"/>`,
      )
      const holeR = cellPx * 0.06
      parts.push(`<circle cx="0" cy="0" r="${holeR}" fill="${fabricHole}" opacity="0.65"/>`)
      parts.push(`<circle cx="${cellPx}" cy="0" r="${holeR}" fill="${fabricHole}" opacity="0.65"/>`)
      parts.push(`<circle cx="0" cy="${cellPx}" r="${holeR}" fill="${fabricHole}" opacity="0.65"/>`)
      parts.push(`<circle cx="${cellPx}" cy="${cellPx}" r="${holeR}" fill="${fabricHole}" opacity="0.65"/>`)
      parts.push(
        `<path d="M0 ${cellPx * 0.5} L${cellPx} ${cellPx * 0.5}" stroke="${fabricDark}" stroke-width="0.4" opacity="0.32"/>`,
      )
      parts.push(
        `<path d="M${cellPx * 0.5} 0 L${cellPx * 0.5} ${cellPx}" stroke="${fabricDark}" stroke-width="0.4" opacity="0.32"/>`,
      )
    } else {
      // Subtle weave: just the warp + weft bundles at lower opacity.
      // Simple patterns look modern instead of craft-y. No corner holes,
      // no grain lines.
      parts.push(
        `<rect x="0" y="0" width="${cellPx}" height="${cellPx * 0.06}" fill="${fabricMid}" opacity="0.28"/>`,
      )
      parts.push(
        `<rect x="0" y="${cellPx * 0.94}" width="${cellPx}" height="${cellPx * 0.06}" fill="${fabricMid}" opacity="0.28"/>`,
      )
      parts.push(
        `<rect x="0" y="0" width="${cellPx * 0.06}" height="${cellPx}" fill="${fabricMid}" opacity="0.28"/>`,
      )
      parts.push(
        `<rect x="${cellPx * 0.94}" y="0" width="${cellPx * 0.06}" height="${cellPx}" fill="${fabricMid}" opacity="0.28"/>`,
      )
    }
    parts.push(`</pattern>`)
    // Drop-shadow filter for the stitched group. Soft, low, just enough
    // to lift the work off the fabric.
    parts.push(
      `<filter id="stitch-shadow" x="-5%" y="-5%" width="110%" height="110%">` +
        `<feGaussianBlur in="SourceAlpha" stdDeviation="${cellPx * 0.05}"/>` +
        `<feOffset dx="0" dy="${cellPx * 0.04}" result="offsetblur"/>` +
        `<feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>` +
        `<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>` +
        `</filter>`,
    )
    parts.push(`</defs>`)
  }

  // ─── Fabric background ──────────────────────────────────────────────────
  if (monochrome) {
    parts.push(
      `<rect x="${inset}" y="${inset}" width="${region.width * cellPx}" height="${region.height * cellPx}" fill="#ffffff"/>`,
    )
  } else if (mode === 'beauty') {
    parts.push(
      `<rect x="${inset}" y="${inset}" width="${region.width * cellPx}" height="${region.height * cellPx}" fill="${pattern.fabric.colourRgb}"/>`,
    )
    parts.push(
      `<rect x="${inset}" y="${inset}" width="${region.width * cellPx}" height="${region.height * cellPx}" fill="url(#aida-weave)"/>`,
    )
  } else {
    parts.push(
      `<rect x="${inset}" y="${inset}" width="${region.width * cellPx}" height="${region.height * cellPx}" fill="${pattern.fabric.colourRgb}"/>`,
    )
  }

  // ─── Stitches ───────────────────────────────────────────────────────────
  // Wrap all stitched buckets in one <g> so the drop-shadow filter
  // applies to the whole stitched area at once.
  if (mode === 'beauty' && !monochrome) {
    parts.push(`<g transform="translate(${offX} ${offY})" filter="url(#stitch-shadow)">`)
  }

  for (const [symbol, cells] of buckets) {
    if (cells.length === 0) continue
    const entry = paletteIndex.bySymbol.get(symbol)
    if (!entry) continue
    const inRegion = cells.filter(
      (c) => c.x >= region.x && c.x < regionMaxX && c.y >= region.y && c.y < regionMaxY,
    )
    if (inRegion.length === 0) continue

    if (mode === 'beauty' && !monochrome) {
      // Beauty mode: 4-layer concentric stroke build for each X.
      // Earlier draft had a dark base layer at -32% that was eating the
      // saturation of every colour. Dropped — body now sits directly
      // on the fabric, reads at the actual palette colour. Outer rim
      // softened from -16% to -10% so the silhouette is shaped without
      // dulling the edge.
      const path = buildBucketCrossPath(inRegion, cellPx)
      const highlightPath = buildBucketHighlightPath(inRegion, cellPx)
      const w = cellPx
      // 1. soft outer rim — shapes the silhouette, barely darker
      parts.push(
        `<path d="${path}" stroke="${shiftColour(entry.rgb, -0.10)}" stroke-width="${w * 0.26}" stroke-linecap="round" fill="none"/>`,
      )
      // 2. body — full saturation palette colour, slightly wider so it
      //    reads as the dominant colour of the stitch
      parts.push(
        `<path d="${path}" stroke="${entry.rgb}" stroke-width="${w * 0.22}" stroke-linecap="round" fill="none"/>`,
      )
      // 3. inner band — slightly lighter, gives the strand bundle look
      parts.push(
        `<path d="${path}" stroke="${shiftColour(entry.rgb, 0.20)}" stroke-width="${w * 0.10}" stroke-linecap="round" fill="none" opacity="0.85"/>`,
      )
      // 4. top sheen — offset along the highlight diagonal so the X has
      //    a raised, light-catching ridge.
      parts.push(
        `<path d="${highlightPath}" stroke="${shiftColour(entry.rgb, 0.45)}" stroke-width="${w * 0.06}" stroke-linecap="round" fill="none" opacity="0.7"/>`,
      )
    } else if (opts.cellStyle === 'block') {
      // Printed chart: the floss colour fills the cell, so the symbol drawn
      // over it has the contrast it was chosen for.
      parts.push(`<g transform="translate(${offX} ${offY})" fill="${entry.rgb}">`)
      for (const { x, y } of inRegion) {
        parts.push(
          `<rect x="${x * cellPx}" y="${y * cellPx}" width="${cellPx + 0.5}" height="${cellPx + 0.5}"/>`,
        )
      }
      parts.push(`</g>`)
    } else if (monochrome) {
      // B&W chart pages: white cells with crisp outline; the symbol
      // overlay (below) carries the colour identity.
      parts.push(`<g transform="translate(${offX} ${offY})">`)
      for (const { x, y } of inRegion) {
        parts.push(
          `<rect x="${x * cellPx}" y="${y * cellPx}" width="${cellPx}" height="${cellPx}" fill="#ffffff" stroke="#1a1410" stroke-width="0.6"/>`,
        )
      }
      parts.push(`</g>`)
    } else {
      // Chart mode: the readable 3-stroke X used in working charts.
      parts.push(`<g transform="translate(${offX} ${offY})">`)
      parts.push(
        `<path d="${buildBucketCrossPath(inRegion, cellPx)}" stroke="${shiftColour(entry.rgb, -0.18)}" stroke-width="${cellPx * 0.22}" stroke-linecap="round" fill="none" opacity="0.85"/>`,
      )
      parts.push(
        `<path d="${buildBucketCrossPath(inRegion, cellPx)}" stroke="${entry.rgb}" stroke-width="${cellPx * 0.16}" stroke-linecap="round" fill="none"/>`,
      )
      parts.push(
        `<path d="${buildBucketHighlightPath(inRegion, cellPx)}" stroke="${shiftColour(entry.rgb, 0.32)}" stroke-width="${cellPx * 0.06}" stroke-linecap="round" fill="none" opacity="0.55"/>`,
      )
      parts.push(`</g>`)
    }
  }

  if (mode === 'beauty' && !monochrome) {
    parts.push(`</g>`)
  }

  // ─── Back-stitch ────────────────────────────────────────────────────────
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

  // ─── French knots ───────────────────────────────────────────────────────
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

  // ─── Stitched overlay ───────────────────────────────────────────────────
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

  // ─── Grid lines ─────────────────────────────────────────────────────────
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

  // ─── Centre crosshairs ──────────────────────────────────────────────────
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

  // ─── Symbol overlay ─────────────────────────────────────────────────────
  // Bumped from 0.5 to 0.66 of cell size — at 0.5 the letter competed
  // visually with the X stroke pattern; 0.66 puts it firmly above.
  if (showSymbols && cellPx >= 14) {
    parts.push(`<g transform="translate(${offX} ${offY})" font-family="'DejaVu Sans',ui-monospace,monospace" font-weight="600" text-anchor="middle" dominant-baseline="central">`)
    for (const [symbol, cells] of buckets) {
      const entry = paletteIndex.bySymbol.get(symbol)
      if (!entry) continue
      const fill = monochrome ? '#1a1410' : symbolOnFill(entry.rgb)
      const fontSize = cellPx * 0.66
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

  // ─── Overlap wash ───────────────────────────────────────────────────────
  // Print only. Everything inside the region but outside the core belongs to
  // the neighbouring page; it is kept so the join can be matched by eye, and
  // washed back so it is plainly not this page's work. Drawn over the symbols
  // so they fade with the stitches.
  const core = opts.core
  if (core) {
    const bands: Array<[number, number, number, number]> = []
    if (core.x > region.x) bands.push([region.x, region.y, core.x - region.x, region.height])
    const coreMaxX = core.x + core.width
    if (coreMaxX < regionMaxX) bands.push([coreMaxX, region.y, regionMaxX - coreMaxX, region.height])
    if (core.y > region.y) bands.push([core.x, region.y, core.width, core.y - region.y])
    const coreMaxY = core.y + core.height
    if (coreMaxY < regionMaxY) bands.push([core.x, coreMaxY, core.width, regionMaxY - coreMaxY])
    if (bands.length > 0) {
      parts.push(`<g transform="translate(${offX} ${offY})">`)
      for (const [bx, by, bw, bh] of bands) {
        parts.push(
          `<rect x="${bx * cellPx}" y="${by * cellPx}" width="${bw * cellPx}" height="${bh * cellPx}" fill="#ffffff" opacity="0.66"/>`,
        )
      }
      // The page's own boundary, so the eye lands on it immediately.
      parts.push(
        `<rect x="${core.x * cellPx}" y="${core.y * cellPx}" width="${core.width * cellPx}" height="${core.height * cellPx}" fill="none" stroke="#8c5f4a" stroke-width="${Math.max(1, cellPx * 0.09)}" stroke-dasharray="${cellPx * 0.5} ${cellPx * 0.35}" opacity="0.85"/>`,
      )
      parts.push(`</g>`)
    }
  }

  parts.push('</svg>')
  return parts.join('')
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
