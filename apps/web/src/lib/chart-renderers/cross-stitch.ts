/**
 * Cross-stitch chart renderer.
 *
 * Cross-stitch charts are structurally different from crochet / knitting
 * charts: every cell is one stitch, every stitch is one floss colour, the
 * legend is a colour palette with DMC / Anchor cross-references rather
 * than a stitch-glyph glossary. This module owns that rendering. The
 * shared craft-charts SVG renderer (`apps/web/src/lib/craft-charts/`)
 * stays focused on stitch-glyph-based charts.
 *
 * Output is a self-contained SVG string. The Tutorial body's
 * `crossStitchChart` TipTap node serialises the `CrossStitchChart`
 * definition as JSON on the node attrs and the public renderer pipes it
 * through this function with `dangerouslySetInnerHTML`. Server-only — no
 * React hooks, no client state, no canvas.
 *
 * Accessibility: every palette colour carries a unique symbol (×, ●, ▲,
 * ◆, …) drawn inside its grid cells. Charts print legibly in monochrome
 * and remain followable by a stitcher who can't see colour. The legend
 * also lists each symbol so a reader can match the cell symbol back to a
 * row in the floss key.
 */

export interface CrossStitchPaletteEntry {
  /** Lookup key the chart cells reference. Lower-kebab. */
  key: string

  /** Plain-English colour name ("soft sage", "tea rose"). Never a brand. */
  name: string

  /** Six-digit hex. The fill colour drawn in the chart cell. */
  hex: string

  /** Nearest DMC stranded-cotton code ("522"). Optional but expected. */
  dmcCode?: string

  /** Nearest Anchor stranded-cotton code ("859"). Optional but expected. */
  anchorCode?: string

  /** Rough skein-count estimate the legend prints alongside the swatch. */
  skeinEstimate?: string

  /**
   * Optional override of the auto-assigned symbol. Skip in normal use —
   * the renderer hands out unique symbols from the fallback set in
   * palette order. Set only when a tutorial wants a specific assignment
   * (e.g. the published pattern book uses a particular symbol).
   */
  symbol?: string
}

export interface CrossStitchChart {
  title?: string
  caption?: string

  /** Total grid width in stitches. */
  width: number

  /** Total grid height in stitches. */
  height: number

  /** Aida / evenweave / linen count the chart was designed for. */
  fabricCount?: number

  /** Finished size — written verbatim into the chart's footer. */
  finishedSizeText?: string

  /** Palette — every key referenced by `cells` must exist here. */
  palette: CrossStitchPaletteEntry[]

  /**
   * Cell list. Cells may be sparse — any (x, y) not present in `cells`
   * renders as unstitched fabric (no fill, no symbol). Origin (0, 0) is
   * the top-left of the chart; x grows right, y grows down.
   */
  cells: CrossStitchCell[]
}

export interface CrossStitchCell {
  x: number
  y: number
  /** Must match a `palette[].key`. Unknown keys render as unstitched. */
  paletteKey: string
}

/**
 * Symbol fallback set — single-character glyphs assigned in palette order
 * when an entry doesn't set its own `symbol`. Picked for distinctness in
 * a small grid cell at print-resolution. Twenty entries covers the
 * vast majority of tutorial palettes; a pattern with more colours sets
 * `symbol` explicitly on the overflow entries.
 */
const FALLBACK_SYMBOLS = [
  '×', '●', '▲', '◆', '■', '○', '△', '◇', '□', '✚',
  '✦', '✱', '⬟', '⬢', '✕', '◐', '◑', '◒', '◓', '⬣',
]

const CELL_PX = 22
const PADDING_TOP = 12
const PADDING_LEFT = 28
const PADDING_RIGHT = 12
const LEGEND_ROW_HEIGHT = 24
const LEGEND_TOP_GAP = 16
const STROKE = '#302a24'

/**
 * Render the chart to a self-contained SVG string. Returns valid XML the
 * caller can drop into the DOM via `dangerouslySetInnerHTML`.
 */
export function renderCrossStitchChart(chart: CrossStitchChart): string {
  const { width, height, palette, cells } = chart
  if (width <= 0 || height <= 0) {
    return emptySvg('Chart has no grid.')
  }
  if (palette.length === 0) {
    return emptySvg('Chart has no palette.')
  }

  const paletteIndex = new Map<string, { entry: CrossStitchPaletteEntry; symbol: string }>()
  palette.forEach((entry, i) => {
    const symbol = entry.symbol ?? FALLBACK_SYMBOLS[i % FALLBACK_SYMBOLS.length] ?? '?'
    paletteIndex.set(entry.key, { entry, symbol })
  })

  const gridWidthPx = width * CELL_PX
  const gridHeightPx = height * CELL_PX
  const legendStartY = PADDING_TOP + gridHeightPx + LEGEND_TOP_GAP
  const legendHeightPx = (palette.length + 1) * LEGEND_ROW_HEIGHT
  const captionHeightPx = chart.caption ? 24 : 0
  const totalWidth = PADDING_LEFT + gridWidthPx + PADDING_RIGHT
  const totalHeight = legendStartY + legendHeightPx + captionHeightPx + 8

  const parts: string[] = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" style="max-width:${totalWidth}px;color:${STROKE};font-family:ui-sans-serif,system-ui,sans-serif" role="img" aria-label="${escapeAttr(chart.title ?? 'Cross-stitch chart')}">`,
  )

  if (chart.title) {
    parts.push(
      `<text x="${PADDING_LEFT}" y="${PADDING_TOP - 2}" font-size="13" font-weight="600" fill="${STROKE}">${escapeText(chart.title)}</text>`,
    )
  }

  // Grid background — unstitched cells render as plain white.
  parts.push(
    `<rect x="${PADDING_LEFT}" y="${PADDING_TOP}" width="${gridWidthPx}" height="${gridHeightPx}" fill="#ffffff" stroke="${STROKE}" stroke-width="1.4"/>`,
  )

  // Coloured cells with overlaid symbol.
  for (const cell of cells) {
    if (cell.x < 0 || cell.x >= width || cell.y < 0 || cell.y >= height) continue
    const indexed = paletteIndex.get(cell.paletteKey)
    if (!indexed) continue
    const px = PADDING_LEFT + cell.x * CELL_PX
    const py = PADDING_TOP + cell.y * CELL_PX
    parts.push(
      `<rect x="${px}" y="${py}" width="${CELL_PX}" height="${CELL_PX}" fill="${indexed.entry.hex}" stroke="none"/>`,
    )
    parts.push(
      `<text x="${px + CELL_PX / 2}" y="${py + CELL_PX / 2}" font-size="${CELL_PX * 0.62}" text-anchor="middle" dominant-baseline="central" fill="${textOnFill(indexed.entry.hex)}">${escapeText(indexed.symbol)}</text>`,
    )
  }

  // Light grid (every 1 stitch), bold ruled lines every 10, bolder every 25.
  parts.push(`<g stroke="${STROKE}" fill="none">`)
  for (let c = 0; c <= width; c++) {
    const x = PADDING_LEFT + c * CELL_PX
    const weight = c === 0 || c === width ? 1.4 : c % 25 === 0 ? 1.2 : c % 10 === 0 ? 0.85 : 0.35
    parts.push(
      `<line x1="${x}" y1="${PADDING_TOP}" x2="${x}" y2="${PADDING_TOP + gridHeightPx}" stroke-width="${weight}" />`,
    )
  }
  for (let r = 0; r <= height; r++) {
    const y = PADDING_TOP + r * CELL_PX
    const weight = r === 0 || r === height ? 1.4 : r % 25 === 0 ? 1.2 : r % 10 === 0 ? 0.85 : 0.35
    parts.push(
      `<line x1="${PADDING_LEFT}" y1="${y}" x2="${PADDING_LEFT + gridWidthPx}" y2="${y}" stroke-width="${weight}" />`,
    )
  }
  parts.push(`</g>`)

  // Row + column rulers — 10-stitch numbered labels on the top + left edge.
  parts.push(`<g font-size="9" fill="${STROKE}" fill-opacity="0.7">`)
  for (let c = 10; c < width; c += 10) {
    const x = PADDING_LEFT + c * CELL_PX
    parts.push(
      `<text x="${x}" y="${PADDING_TOP - 4}" text-anchor="middle">${c}</text>`,
    )
  }
  for (let r = 10; r < height; r += 10) {
    const y = PADDING_TOP + r * CELL_PX
    parts.push(
      `<text x="${PADDING_LEFT - 4}" y="${y + 3}" text-anchor="end">${r}</text>`,
    )
  }
  parts.push(`</g>`)

  // Legend.
  parts.push(
    `<g font-size="11" fill="${STROKE}" transform="translate(${PADDING_LEFT} ${legendStartY})">`,
  )
  parts.push(
    `<text x="0" y="0" font-weight="600">Floss key${chart.fabricCount ? ` — ${chart.fabricCount}-count cloth` : ''}${chart.finishedSizeText ? ` · ${escapeText(chart.finishedSizeText)}` : ''}</text>`,
  )
  palette.forEach((entry, i) => {
    const indexed = paletteIndex.get(entry.key)
    if (!indexed) return
    const y = LEGEND_ROW_HEIGHT + i * LEGEND_ROW_HEIGHT
    parts.push(
      `<rect x="0" y="${y - 14}" width="18" height="18" fill="${entry.hex}" stroke="${STROKE}" stroke-width="0.8"/>`,
    )
    parts.push(
      `<text x="22" y="${y}" font-family="ui-monospace,monospace" font-size="12">${escapeText(indexed.symbol)}</text>`,
    )
    const refs: string[] = []
    if (entry.dmcCode) refs.push(`DMC ${entry.dmcCode}`)
    if (entry.anchorCode) refs.push(`Anchor ${entry.anchorCode}`)
    const refStr = refs.length > 0 ? ` (${refs.join(' / ')})` : ''
    const skein = entry.skeinEstimate ? ` · ${entry.skeinEstimate}` : ''
    parts.push(
      `<text x="44" y="${y}">${escapeText(entry.name)}${escapeText(refStr)}${escapeText(skein)}</text>`,
    )
  })
  parts.push(`</g>`)

  // Caption beneath the legend.
  if (chart.caption) {
    const y = legendStartY + legendHeightPx + 14
    parts.push(
      `<text x="${PADDING_LEFT}" y="${y}" font-size="11" font-style="italic" fill="${STROKE}" fill-opacity="0.8">${escapeText(chart.caption)}</text>`,
    )
  }

  parts.push(`</svg>`)
  return parts.join('')
}

function emptySvg(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" role="img" aria-label="${escapeAttr(message)}"><text x="120" y="44" text-anchor="middle" font-size="12" fill="${STROKE}" fill-opacity="0.6">${escapeText(message)}</text></svg>`
}

/**
 * Pick a foreground text colour that stays legible against a given fill.
 * Black for light fills, white for dark fills. Uses sRGB-relative
 * luminance with the standard ITU-R BT.709 coefficients.
 */
function textOnFill(hex: string): string {
  const parsed = parseHex(hex)
  if (!parsed) return STROKE
  const { r, g, b } = parsed
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.58 ? STROKE : '#ffffff'
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const v = m[1]
  if (!v) return null
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  }
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
