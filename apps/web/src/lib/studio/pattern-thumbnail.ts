import 'server-only'

import sharp from 'sharp'
import { prisma, parsePatternData, Visibility, type PatternData } from '@homemade/db'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'
import { r2Upload, r2Delete } from '@/lib/r2'

/**
 * Persisted pattern thumbnails.
 *
 * The library card / detail hero used to call the on-demand thumbnail route
 * (`/api/studio/patterns/[id]/thumbnail`), which re-rendered the chart to PNG
 * on every request. Cloudflare returns DYNAMIC for that route (it isn't
 * cached), so a grid of ~100 cards meant ~100 origin renders — slow, and not
 * scalable to thousands of patterns.
 *
 * Instead we render each chart ONCE, store the PNG in R2, and record it on
 * `Pattern.thumbnailMediaId`. The card resolver (`patternHeroUrl`) then serves
 * the static CDN asset. This module is the single place that renders + saves.
 *
 * It never touches `heroMediaId` — that slot is for a finished-piece
 * photograph (e.g. the Stitching Mama listing images), which always wins over
 * the rendered thumbnail and must not be overwritten.
 */

const TARGET_W = 960
const TARGET_H = 720
const BG = { r: 245, g: 240, b: 232 }

/** Render a chart to the canonical 960×720 thumbnail PNG. Matches the
 *  on-demand route byte-for-byte so saved and live renders are identical. */
export async function renderPatternThumbnailPng(data: PatternData): Promise<Buffer> {
  const bbox = stitchedBoundingBox(data)
  const margin = 2
  const region = bbox
    ? {
        x: Math.max(0, bbox.minX - margin),
        y: Math.max(0, bbox.minY - margin),
        width: Math.min(data.grid.width, bbox.maxX + 1 + margin) - Math.max(0, bbox.minX - margin),
        height: Math.min(data.grid.height, bbox.maxY + 1 + margin) - Math.max(0, bbox.minY - margin),
      }
    : undefined
  const regionW = region?.width ?? data.grid.width
  const cellPx = regionW <= 60 ? 30 : regionW <= 120 ? 18 : 12
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
    .resize(TARGET_W, TARGET_H, { fit: 'contain', background: BG })
    .png({ quality: 88 })
    .toBuffer()
}

/**
 * Render (if needed), upload to R2, and link a Media row to
 * `Pattern.thumbnailMediaId`. Idempotent and non-destructive:
 *
 * - Only acts on shared library patterns (ownerUserId null, not private).
 * - Skips patterns that already have a saved thumbnail unless `force`.
 * - Sets the id with a conditional write (thumbnailMediaId still null), so a
 *   concurrent request can't produce a double-link; the loser cleans up its
 *   orphan upload.
 * - Never reads or writes `heroMediaId`.
 *
 * Pass a pre-rendered `png` to avoid re-rendering (the route already has one).
 */
export async function persistPatternThumbnail(
  patternId: string,
  opts: { png?: Buffer; force?: boolean } = {},
): Promise<{ mediaId: string; created: boolean } | null> {
  const row = await prisma.pattern.findUnique({
    where: { id: patternId },
    select: { id: true, data: true, ownerUserId: true, visibility: true, thumbnailMediaId: true },
  })
  if (!row) return null

  const isLibrary = row.ownerUserId === null && row.visibility !== Visibility.PRIVATE
  if (!isLibrary) return null
  if (row.thumbnailMediaId && !opts.force) return { mediaId: row.thumbnailMediaId, created: false }

  let data: PatternData
  try {
    data = parsePatternData(row.data)
  } catch {
    return null
  }

  const png = opts.png ?? (await renderPatternThumbnailPng(data))
  const { key } = await r2Upload(png, 'image/png', { prefix: 'pattern-thumbnails', filename: `${patternId}.png` })

  const media = await prisma.media.create({
    data: {
      type: 'ILLUSTRATION',
      mimeType: 'image/png',
      r2Key: key,
      width: TARGET_W,
      height: TARGET_H,
      bytes: png.byteLength,
      status: 'READY',
      source: 'original',
      alt: 'Pattern chart preview',
    },
    select: { id: true },
  })

  const where = opts.force ? { id: patternId } : { id: patternId, thumbnailMediaId: null }
  const upd = await prisma.pattern.updateMany({ where, data: { thumbnailMediaId: media.id } })
  if (upd.count === 0) {
    // Lost a race (another request linked first) — drop the orphan upload.
    await prisma.media.delete({ where: { id: media.id } }).catch(() => {})
    await r2Delete(key).catch(() => {})
    return null
  }
  return { mediaId: media.id, created: true }
}
