/**
 * SVG composer for knitting charts. Takes a ChartLayout and produces
 * an SVG string sized to fit:
 *   - the grid itself, scaled to `cellPx`,
 *   - an optional row-number column on each edge,
 *   - an optional stitch-count strip across the bottom,
 *   - an optional chart key (legend) below.
 *
 * Knitting charts read row-1-at-the-bottom; we flip the y-axis at
 * composition time so the internal y=0 row sits at the top of the
 * grid but row 1 (the bottom-most chart row) lands at the on-screen
 * bottom.
 */

import type { CableCrossingPlacement } from '../layout/cable-layout'
import type { ChartLayout } from '../chart-types/shared'
import type { CellPlacement } from '../layout/grid-layout'
import type { KnittingSymbol } from '../types'

const DEFAULT_CELL_PX = 28

export interface ComposeOptions {
  cellPx?: number
  showRowNumbers?: boolean
  showStitchCount?: boolean
  showChartKey?: boolean
  theme?: 'DEFAULT' | 'PRINT'
  title?: string
}

export interface ComposedSvg {
  svg: string
  width: number
  height: number
}

const TILE_BG = (theme: 'DEFAULT' | 'PRINT'): string =>
  theme === 'PRINT' ? '#ffffff' : '#fbf6ee'
const GRID_LINE = (theme: 'DEFAULT' | 'PRINT'): string =>
  theme === 'PRINT' ? '#1c1c1f' : '#3a2f24'
const FG = (theme: 'DEFAULT' | 'PRINT'): string =>
  theme === 'PRINT' ? '#0d0d11' : '#2a1f15'
const MUTED = (theme: 'DEFAULT' | 'PRINT'): string =>
  theme === 'PRINT' ? '#3a3a40' : '#5a4a3a'
const NO_STITCH_FILL = '#cfc7b9'

export function composeChartSvg(
  layout: ChartLayout,
  opts: ComposeOptions = {},
): ComposedSvg {
  const cellPx = opts.cellPx ?? DEFAULT_CELL_PX
  const theme = opts.theme ?? 'DEFAULT'
  const showRowNumbers = opts.showRowNumbers ?? true
  const showStitchCount = opts.showStitchCount ?? true
  const showChartKey = opts.showChartKey ?? true

  const gridW = layout.width * cellPx
  const gridH = layout.height * cellPx

  const rowNumberW = showRowNumbers ? cellPx * 1.6 : 0
  const stitchCountH = showStitchCount ? cellPx * 1.0 : 0
  const legendH = showChartKey ? legendHeightPx(layout, cellPx) : 0
  const titleH = opts.title ? cellPx * 1.2 : 0
  const margin = cellPx * 0.6

  const totalW = margin + rowNumberW + gridW + rowNumberW + margin
  const totalH =
    margin +
    titleH +
    gridH +
    stitchCountH +
    legendH +
    margin

  const gridOriginX = margin + rowNumberW
  const gridOriginY = margin + titleH

  const parts: string[] = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" role="img">`,
  )

  // ─── Defs: no-stitch stripe pattern ────────────────────────────────
  parts.push('<defs>')
  parts.push(
    `<pattern id="kn-nostitch" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">` +
      `<rect width="6" height="6" fill="${NO_STITCH_FILL}"/>` +
      `<path d="M -1 7 L 7 -1" stroke="${shiftColour(NO_STITCH_FILL, -0.18)}" stroke-width="0.9"/>` +
      `</pattern>`,
  )
  parts.push('</defs>')

  // ─── Background ────────────────────────────────────────────────────
  parts.push(
    `<rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${TILE_BG(theme)}"/>`,
  )

  // ─── Title ─────────────────────────────────────────────────────────
  if (opts.title) {
    parts.push(
      `<text x="${totalW / 2}" y="${margin + titleH * 0.7}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="${cellPx * 0.7}" font-weight="600" text-anchor="middle" fill="${FG(theme)}">${escapeXml(opts.title)}</text>`,
    )
  }

  // ─── Grid cells ────────────────────────────────────────────────────
  parts.push(`<g transform="translate(${gridOriginX} ${gridOriginY})">`)
  for (const p of layout.placements) {
    parts.push(composeCell(p, cellPx, layout.height, theme))
  }
  // ─── Cable crossings ───────────────────────────────────────────────
  for (const c of layout.cables) {
    parts.push(composeCable(c, cellPx, layout.height, theme))
  }
  // ─── Grid lines ────────────────────────────────────────────────────
  parts.push(composeGridLines(layout.width, layout.height, cellPx, theme))
  parts.push('</g>')

  // ─── Row number column ─────────────────────────────────────────────
  if (showRowNumbers) {
    parts.push(
      composeRowNumbers(layout, cellPx, gridOriginX, gridOriginY, rowNumberW, gridW, theme),
    )
  }

  // ─── Stitch count strip ────────────────────────────────────────────
  if (showStitchCount) {
    parts.push(
      composeStitchCount(layout, cellPx, gridOriginX, gridOriginY + gridH, stitchCountH, theme),
    )
  }

  // ─── Chart key ─────────────────────────────────────────────────────
  if (showChartKey) {
    const legendY = gridOriginY + gridH + stitchCountH
    parts.push(composeLegend(layout, cellPx, margin, legendY, totalW - margin * 2, theme))
  }

  parts.push('</svg>')
  return { svg: parts.join(''), width: totalW, height: totalH }
}

function composeCell(
  p: CellPlacement,
  cellPx: number,
  gridHeight: number,
  theme: 'DEFAULT' | 'PRINT',
): string {
  // Flip y: row 1 (internal y=gridHeight-1) sits at the bottom on screen.
  const screenY = (gridHeight - 1 - p.y) * cellPx
  const x = p.x * cellPx
  const parts: string[] = []
  const cellGroup = `<g transform="translate(${x} ${screenY})">`
  parts.push(cellGroup)

  const sym = p.symbol
  // Cell fill: colourwork / brioche use p.fill; mono charts use no fill.
  if (sym.noStitch) {
    parts.push(
      `<rect x="0" y="0" width="${cellPx}" height="${cellPx}" fill="url(#kn-nostitch)"/>`,
    )
  } else if (p.fill) {
    parts.push(
      `<rect x="0" y="0" width="${cellPx}" height="${cellPx}" fill="${p.fill}"/>`,
    )
  }

  // Symbol overlay — knit cells in colourwork charts skip the symbol
  // (the colour does the talking).
  const isPlainKnitInColour = p.fill !== null && sym.key === 'knit'
  if (!sym.noStitch && !isPlainKnitInColour) {
    const stroke = sym.strokeOverride ?? (p.fill ? contrastTo(p.fill) : FG(theme))
    const fill = sym.fillOverride === 'currentColor' ? stroke : (sym.fillOverride ?? 'none')
    const sw = (sym.strokeWidth ?? 0.08) * cellPx
    parts.push(
      `<path d="${scalePath(sym.path, cellPx)}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
  }

  parts.push('</g>')
  return parts.join('')
}

function composeCable(
  c: CableCrossingPlacement,
  cellPx: number,
  gridHeight: number,
  theme: 'DEFAULT' | 'PRINT',
): string {
  const screenY = (gridHeight - 1 - c.y) * cellPx
  const x = c.startX * cellPx
  const span = (c.endX - c.startX + 1) * cellPx
  const sw = cellPx * 0.14
  const fg = FG(theme)
  const inset = cellPx * 0.16
  const mid = cellPx * 0.5
  // Two diagonals crossing; the "front" pair is drawn last so it sits
  // visually above the back pair.
  const back =
    c.crossDirection === 'LEFT'
      ? `M ${inset} ${mid + inset} L ${span - inset} ${mid - inset}`
      : `M ${inset} ${mid - inset} L ${span - inset} ${mid + inset}`
  const front =
    c.crossDirection === 'LEFT'
      ? `M ${inset} ${mid - inset} L ${span - inset} ${mid + inset}`
      : `M ${inset} ${mid + inset} L ${span - inset} ${mid - inset}`
  return (
    `<g transform="translate(${x} ${screenY})">` +
    `<rect x="0" y="0" width="${span}" height="${cellPx}" fill="${shiftColour(TILE_BG(theme), -0.04)}" stroke="${shiftColour(fg, 0.5)}" stroke-width="0.4"/>` +
    `<path d="${back}" stroke="${fg}" stroke-width="${sw}" stroke-linecap="round" opacity="0.55"/>` +
    `<path d="${front}" stroke="${fg}" stroke-width="${sw}" stroke-linecap="round"/>` +
    `<text x="${span / 2}" y="${cellPx * 0.92}" font-family="ui-monospace,monospace" font-size="${cellPx * 0.28}" text-anchor="middle" fill="${fg}" opacity="0.7">${escapeXml(c.type)}</text>` +
    `</g>`
  )
}

function composeGridLines(
  width: number,
  height: number,
  cellPx: number,
  theme: 'DEFAULT' | 'PRINT',
): string {
  const stroke = shiftColour(GRID_LINE(theme), 0.45)
  const major = GRID_LINE(theme)
  const parts: string[] = [
    `<g stroke="${stroke}" stroke-width="0.6" fill="none">`,
  ]
  for (let x = 0; x <= width; x++) {
    const isMajor = x === 0 || x === width || x % 10 === 0
    parts.push(
      `<line x1="${x * cellPx}" y1="0" x2="${x * cellPx}" y2="${height * cellPx}" stroke="${isMajor ? major : stroke}" stroke-width="${isMajor ? 1.0 : 0.5}" opacity="${isMajor ? 0.85 : 0.55}"/>`,
    )
  }
  for (let y = 0; y <= height; y++) {
    const isMajor = y === 0 || y === height || y % 10 === 0
    parts.push(
      `<line x1="0" y1="${y * cellPx}" x2="${width * cellPx}" y2="${y * cellPx}" stroke="${isMajor ? major : stroke}" stroke-width="${isMajor ? 1.0 : 0.5}" opacity="${isMajor ? 0.85 : 0.55}"/>`,
    )
  }
  parts.push('</g>')
  return parts.join('')
}

function composeRowNumbers(
  layout: ChartLayout,
  cellPx: number,
  gridOriginX: number,
  gridOriginY: number,
  rowNumberW: number,
  gridW: number,
  theme: 'DEFAULT' | 'PRINT',
): string {
  const parts: string[] = [
    `<g font-family="ui-monospace,monospace" font-size="${cellPx * 0.42}" fill="${MUTED(theme)}">`,
  ]
  for (let i = 0; i < layout.height; i++) {
    const rowNumber = i + 1
    // Row 1 lives at screen bottom.
    const screenY = gridOriginY + (layout.height - rowNumber) * cellPx + cellPx * 0.62
    const marker = layout.markers.find((m) => m.rowFromBottom === i)
    if (marker?.edge === 'RIGHT') {
      parts.push(
        `<text x="${gridOriginX + gridW + rowNumberW * 0.5}" y="${screenY}" text-anchor="middle">${rowNumber}</text>`,
      )
      parts.push(
        `<text x="${gridOriginX + gridW + rowNumberW * 0.5}" y="${screenY + cellPx * 0.38}" text-anchor="middle" font-size="${cellPx * 0.28}" opacity="0.7">${marker.label}</text>`,
      )
    } else if (marker?.edge === 'LEFT') {
      parts.push(
        `<text x="${gridOriginX - rowNumberW * 0.5}" y="${screenY}" text-anchor="middle">${rowNumber}</text>`,
      )
      parts.push(
        `<text x="${gridOriginX - rowNumberW * 0.5}" y="${screenY + cellPx * 0.38}" text-anchor="middle" font-size="${cellPx * 0.28}" opacity="0.7">${marker.label}</text>`,
      )
    } else {
      // No marker (shouldn't happen) — fall through to a right-edge number.
      parts.push(
        `<text x="${gridOriginX + gridW + rowNumberW * 0.5}" y="${screenY}" text-anchor="middle">${rowNumber}</text>`,
      )
    }
  }
  parts.push('</g>')
  return parts.join('')
}

function composeStitchCount(
  layout: ChartLayout,
  cellPx: number,
  gridOriginX: number,
  startY: number,
  height: number,
  theme: 'DEFAULT' | 'PRINT',
): string {
  // Stitch column numbers along the bottom — only major divisions
  // (every 5 / 10) get labelled to avoid clutter.
  const parts: string[] = [
    `<g font-family="ui-monospace,monospace" font-size="${cellPx * 0.36}" fill="${MUTED(theme)}">`,
  ]
  for (let x = 0; x < layout.width; x++) {
    const col = layout.width - x // standard convention: column 1 at the right
    if (col === 1 || col === layout.width || col % 5 === 0) {
      parts.push(
        `<text x="${gridOriginX + x * cellPx + cellPx / 2}" y="${startY + height * 0.66}" text-anchor="middle">${col}</text>`,
      )
    }
  }
  parts.push('</g>')
  return parts.join('')
}

function legendHeightPx(layout: ChartLayout, cellPx: number): number {
  const rowH = cellPx * 1.0
  const colsPerRow = 3
  const rows = Math.ceil(layout.legend.length / colsPerRow)
  return rows * rowH + cellPx * 0.6
}

function composeLegend(
  layout: ChartLayout,
  cellPx: number,
  startX: number,
  startY: number,
  availableW: number,
  theme: 'DEFAULT' | 'PRINT',
): string {
  const rowH = cellPx * 1.0
  const colsPerRow = 3
  const colW = availableW / colsPerRow
  const parts: string[] = [
    `<g font-family="ui-sans-serif,system-ui,sans-serif" font-size="${cellPx * 0.40}" fill="${FG(theme)}">`,
  ]
  for (let i = 0; i < layout.legend.length; i++) {
    const entry = layout.legend[i]!
    const col = i % colsPerRow
    const row = Math.floor(i / colsPerRow)
    const x = startX + col * colW
    const y = startY + cellPx * 0.3 + row * rowH
    // Swatch — coloured square or symbol cell.
    if (entry.colour) {
      parts.push(
        `<rect x="${x}" y="${y}" width="${cellPx * 0.8}" height="${cellPx * 0.8}" fill="${entry.colour}" stroke="${shiftColour(GRID_LINE(theme), 0.3)}" stroke-width="0.6"/>`,
      )
    } else {
      parts.push(
        `<rect x="${x}" y="${y}" width="${cellPx * 0.8}" height="${cellPx * 0.8}" fill="none" stroke="${shiftColour(GRID_LINE(theme), 0.3)}" stroke-width="0.6"/>`,
      )
      // Small symbol — use the abbreviation as a glyph.
      parts.push(
        `<text x="${x + cellPx * 0.4}" y="${y + cellPx * 0.58}" font-family="ui-monospace,monospace" font-size="${cellPx * 0.30}" text-anchor="middle" fill="${FG(theme)}">${escapeXml(entry.abbreviation)}</text>`,
      )
    }
    // Label.
    parts.push(
      `<text x="${x + cellPx * 1.0}" y="${y + cellPx * 0.58}" fill="${FG(theme)}">${escapeXml(entry.label)}</text>`,
    )
  }
  parts.push('</g>')
  return parts.join('')
}

/** Scale a unit-space SVG path by cellPx. Multiplies every numeric
 *  argument; works for the M / L / Q / C / Z / sub-paths the symbol
 *  vocabulary uses. */
function scalePath(path: string, cellPx: number): string {
  return path.replace(/-?[0-9]*\.?[0-9]+/g, (m) => {
    const n = parseFloat(m)
    return (n * cellPx).toFixed(2)
  })
}

function shiftColour(hex: string, amount: number): string {
  const norm = hex.replace('#', '')
  const r = parseInt(norm.slice(0, 2), 16)
  const g = parseInt(norm.slice(2, 4), 16)
  const b = parseInt(norm.slice(4, 6), 16)
  const k = amount >= 0 ? 255 : 0
  const nr = Math.round(r + (k - r) * Math.abs(amount))
  const ng = Math.round(g + (k - g) * Math.abs(amount))
  const nb = Math.round(b + (k - b) * Math.abs(amount))
  const hh = (v: number): string => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')
  return `#${hh(nr)}${hh(ng)}${hh(nb)}`
}

/** Pick black or white based on the perceived luminance of a colour
 *  — used to render symbol overlays on top of colourwork cells so
 *  they read against both dark and light yarns. */
function contrastTo(hex: string): string {
  const norm = hex.replace('#', '')
  if (norm.length < 6) return '#0d0d11'
  const r = parseInt(norm.slice(0, 2), 16)
  const g = parseInt(norm.slice(2, 4), 16)
  const b = parseInt(norm.slice(4, 6), 16)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 140 ? '#0d0d11' : '#f6f0e6'
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Used by the verifier and helpers needing the same scaling logic. */
export { scalePath as _scalePathForTesting }

/**
 * Symbol helper exposed for higher-level diagnostics. Not used by the
 * composer itself but useful for the verifier when sanity-checking
 * an individual cell's rendered size.
 */
export function symbolBboxPx(sym: KnittingSymbol, cellPx: number): { w: number; h: number } {
  return { w: cellPx, h: cellPx }
}
