/**
 * `renderSwatch` — render a small swatch SVG showing one stitch repeated
 * across a few rows. Used for the Stitch master-table preview heroes that
 * Pipeline C couldn't produce because the row has no `chartSymbol`
 * (joining methods) or because the symbol on its own doesn't read as the
 * finished stitch (textured / specialty stitches).
 *
 * The swatch builds a synthetic flat chart of `rows` × `columns` of the
 * given stitch key and feeds it through the row-layout / composer.
 */

import { buildRowLayout } from './layout/row-layout'
import { composeSvg } from './output/svg-composer'
import { getStitchShape } from './stitch-shapes'
import { singleColourPalette } from './palette/apply-colours'
import { rasterise } from './output/png-rasteriser'

export interface SwatchOptions {
  /** Stitch symbol key. Must exist in `stitch-shapes/index.ts`. */
  symbol: string
  /** Number of rows in the swatch. Defaults to 4. */
  rows?: number
  /** Number of stitches per row. Defaults to 6. */
  columns?: number
  /** Yarn colour for the swatch. Defaults to a soft sage. */
  yarnColour?: string
  /** Output pixel size — square. Defaults to 400. */
  pixelSize?: number
}

export interface SwatchResult {
  svg: string
  /** True when the requested stitch symbol resolved; false means the
   *  composer used the unknown-stitch fallback. */
  ok: boolean
  /** Reason the swatch isn't reliable, when ok=false. */
  reason?: string
}

const DEFAULT_YARN = '#9bb18a'

export function renderSwatch(opts: SwatchOptions): SwatchResult {
  const shape = getStitchShape(opts.symbol)
  if (!shape) {
    return {
      svg: '',
      ok: false,
      reason: `Stitch symbol "${opts.symbol}" not found in stitch-shapes registry.`,
    }
  }

  const rowsN = Math.max(1, Math.floor(opts.rows ?? 4))
  const colsN = Math.max(1, Math.floor(opts.columns ?? 6))
  const yarn = opts.yarnColour ?? DEFAULT_YARN

  const palette = singleColourPalette(yarn)
  // Pick unit-px so the swatch fits the requested pixel size roughly.
  // canvas width ~ cols * unitPx + 2 * margin; pick unitPx accordingly.
  const target = opts.pixelSize ?? 400
  const unitPx = Math.max(16, Math.floor((target - 40) / colsN))

  // Build a synthetic chart row.
  const rows = []
  for (let r = 1; r <= rowsN; r++) {
    rows.push({
      rowNumber: r,
      rightSide: r % 2 === 1,
      stitches: [{ symbol: opts.symbol, count: colsN }],
    })
  }

  const layout = buildRowLayout(rows, {
    unitPx,
    palette,
    marginPx: 18,
  })

  const svg = composeSvg({
    width: Math.round(layout.width),
    height: Math.round(layout.height),
    placements: layout.placements,
    palette,
    border: false,
  })

  return { svg, ok: true }
}

/** Convenience helper: render the swatch and rasterise to PNG. */
export async function renderSwatchToPng(
  opts: SwatchOptions,
): Promise<{ png: Buffer; svg: string; ok: boolean; reason?: string }> {
  const result = renderSwatch(opts)
  if (!result.ok) {
    return { png: Buffer.alloc(0), svg: '', ok: false, reason: result.reason }
  }
  const size = opts.pixelSize ?? 400
  const png = await rasterise(result.svg, { width: size, height: size })
  return { png, svg: result.svg, ok: true }
}
