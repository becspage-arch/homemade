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
