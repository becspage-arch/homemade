/**
 * The cross-stitch beauty thumbnail — the hero.
 *
 * For cross-stitch the hero IS the chart: a deterministic render of the exact
 * pattern data, bbox-cropped to the stitching, on the same ivory aida the
 * pattern names, with the post-saturation boost that survives the trip through
 * the quantiser. There is no photoreal AI hero and none is wanted.
 *
 * Lifted out of `bulk/cross-stitch.ts` so the publisher and the bare-fabric
 * backfill render through the SAME function rather than two copies that drift.
 * The house rule is that the hero is the exact chart, so a script that rewrites
 * a chart must be able to produce the thumbnail the publisher would have
 * produced for it — byte-comparable, not merely similar.
 *
 * Pure enough to run from a script: sharp and the string SVG renderer, no
 * `server-only`, no Prisma.
 */

import sharp from 'sharp'
import type { PatternData } from '@homemade/db'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'

/** Longest side of the finished PNG. */
export const THUMB_TARGET = 1000

/**
 * Above this many stitched cells the thumbnail is composed a cell at a time
 * instead of drawn a stitch at a time.
 *
 * The beauty renderer draws every cell as three strand-shaded strokes over an
 * aida weave, which is what makes an ordinary chart look like finished work.
 * A 480-cell heirloom carries a quarter of a million cells, and at the 1000px
 * the thumbnail is served at, one cell is two pixels — the strokes and the
 * weave are sub-pixel and invisible, while the SVG to describe them runs to
 * tens of megabytes and minutes of rasterising. So past this size the hero is
 * built straight from the chart's own cells: one pixel per stitch in the
 * palette's colour, bare cloth where there is none, scaled up. It is the same
 * exact-chart hero — the same cells, the same flosses, the same crop — drawn
 * at the resolution the picture actually has.
 */
export const BEAUTY_CELL_LIMIT = 60_000

/** The beauty thumbnail — bbox-cropped, responsive cell size, post-saturated. */
export async function renderBeautyThumbnail(data: PatternData, postSat: number): Promise<Buffer> {
  const bbox = stitchedBoundingBox(data)
  const mg = 2
  const region = bbox
    ? {
        x: Math.max(0, bbox.minX - mg),
        y: Math.max(0, bbox.minY - mg),
        width: Math.min(data.grid.width, bbox.maxX + 1 + mg) - Math.max(0, bbox.minX - mg),
        height: Math.min(data.grid.height, bbox.maxY + 1 + mg) - Math.max(0, bbox.minY - mg),
      }
    : undefined
  const rw = region?.width ?? data.grid.width
  const rh = region?.height ?? data.grid.height
  if (rw * rh > BEAUTY_CELL_LIMIT) {
    return renderLargeChartThumbnail(data, { x: region?.x ?? 0, y: region?.y ?? 0, width: rw, height: rh }, postSat)
  }
  const cellPx = rw <= 70 ? 26 : rw <= 130 ? 16 : 10
  const svg = renderPatternSvgString(data, {
    mode: 'beauty',
    cellPx,
    showSymbols: false,
    showGrid: false,
    showCentreCrosshairs: false,
    padding: Math.round(cellPx * 0.8),
    region,
  })
  return sharp(Buffer.from(svg))
    .modulate({ saturation: postSat })
    .resize(THUMB_TARGET, THUMB_TARGET, { fit: 'inside' })
    .png({ quality: 90 })
    .toBuffer()
}


/**
 * The big-chart hero: one pixel per stitch, straight off the grid.
 *
 * Bare cloth takes the fabric colour so the crop reads the same way the stitch
 * renderer's does, and the upscale is nearest-neighbour so a stitch stays a
 * square rather than being smeared into its neighbours — a chart, enlarged,
 * not a photograph of one.
 */
async function renderLargeChartThumbnail(
  data: PatternData,
  region: { x: number; y: number; width: number; height: number },
  postSat: number,
): Promise<Buffer> {
  const { width, height } = region
  const rgbBySymbol = new Map(data.palette.map((p) => [p.symbol, hexToRgb(p.rgb)]))
  const cloth = hexToRgb(data.fabric.colourRgb)
  const raw = Buffer.alloc(width * height * 3)
  for (let i = 0; i < raw.length; i += 3) {
    raw[i] = cloth[0]
    raw[i + 1] = cloth[1]
    raw[i + 2] = cloth[2]
  }
  for (const cell of data.grid.cells) {
    const x = cell.x - region.x
    const y = cell.y - region.y
    if (x < 0 || y < 0 || x >= width || y >= height) continue
    const rgb = rgbBySymbol.get(cell.s)
    if (!rgb) continue
    const i = (y * width + x) * 3
    raw[i] = rgb[0]
    raw[i + 1] = rgb[1]
    raw[i + 2] = rgb[2]
  }
  return sharp(raw, { raw: { width, height, channels: 3 } })
    .modulate({ saturation: postSat })
    .resize(THUMB_TARGET, THUMB_TARGET, { fit: 'inside', kernel: 'nearest' })
    .png({ quality: 90 })
    .toBuffer()
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}
