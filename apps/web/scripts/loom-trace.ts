/**
 * Trace a pattern's technical-chart line drawing into vector polylines and dump
 * a debug image (each traced path a different colour) so we can verify the
 * vectorisation before mapping stitches onto it.
 *
 *   cd apps/web && npx tsx scripts/loom-trace.ts
 */

import { resolve } from 'node:path'
import sharp from 'sharp'
import { inkMask, clearBorder, thin } from '../src/lib/loom/trace/skeleton'
import { trace, simplify, describe } from '../src/lib/loom/trace/vectorize'

const PAGE = resolve(process.cwd(), '../../.loom-scratch/pattern/page2.png')
const OUT = resolve(process.cwd(), '../../.loom-scratch/pattern')

// Design area within page2 (normalised), inside the printed frame.
const DESIGN = { x0: 0.07, y0: 0.13, x1: 0.93, y1: 0.62 }

async function main() {
  const meta = await sharp(PAGE).metadata()
  const W = meta.width!
  const H = meta.height!
  const left = Math.round(DESIGN.x0 * W)
  const top = Math.round(DESIGN.y0 * H)
  const cw = Math.round((DESIGN.x1 - DESIGN.x0) * W)
  const ch = Math.round((DESIGN.y1 - DESIGN.y0) * H)
  const targetW = 760
  const scale = targetW / cw

  const { data, info } = await sharp(PAGE)
    .extract({ left, top, width: cw, height: ch })
    .resize(targetW)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  console.log(`design crop ${cw}x${ch} -> ${w}x${h}`)

  const mask = inkMask(data, w, h, { lumaMax: 0.6 })
  clearBorder(mask, 2)
  let inkCount = 0
  for (const v of mask.data) inkCount += v
  console.log(`ink pixels: ${inkCount}`)
  const skel = thin(mask)
  const polys = trace(skel).map((p) => ({ ...p, pts: simplify(p.pts, 1.2) }))
  const shapes = polys.map(describe)
  const loops = shapes.filter((s) => s.loop).length
  console.log(`traced ${polys.length} polylines (${loops} loops)`)

  // Debug render: each polyline a distinct colour over a faint original.
  const dbg = Buffer.alloc(w * h * 4, 255)
  // faint original ink
  for (let i = 0; i < w * h; i++) {
    if (mask.data[i]) {
      dbg[i * 4] = 220
      dbg[i * 4 + 1] = 220
      dbg[i * 4 + 2] = 230
    }
  }
  const palette = [
    [200, 30, 30], [30, 130, 30], [30, 60, 200], [200, 120, 0],
    [160, 30, 160], [0, 150, 150], [120, 90, 30], [220, 60, 120],
  ]
  polys.forEach((p, k) => {
    const c = palette[k % palette.length]!
    for (let i = 1; i < p.pts.length; i++) drawLine(dbg, w, h, p.pts[i - 1]!, p.pts[i]!, c)
  })
  const dbgPath = resolve(OUT, 'trace-debug.png')
  await sharp(dbg, { raw: { width: w, height: h, channels: 4 } }).png().toFile(dbgPath)
  console.log(`debug -> ${dbgPath}`)
  console.log(`scale px->cropPx: ${(1 / scale).toFixed(3)}`)
}

function drawLine(buf: Buffer, w: number, h: number, a: [number, number], b: [number, number], c: number[]) {
  const steps = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1])))
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(a[0] + ((b[0] - a[0]) * s) / steps)
    const y = Math.round(a[1] + ((b[1] - a[1]) * s) / steps)
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1]] as [number, number][]) {
      const px = x + ox
      const py = y + oy
      if (px < 0 || py < 0 || px >= w || py >= h) continue
      const i = (py * w + px) * 4
      buf[i] = c[0]!
      buf[i + 1] = c[1]!
      buf[i + 2] = c[2]!
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
