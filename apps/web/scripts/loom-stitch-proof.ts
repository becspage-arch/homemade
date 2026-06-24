/**
 * Loom stitch-library proof harness.
 *
 * Renders each embroidery stitch primitive as its own swatch PNG so we can LOOK
 * at it (Claude vision) against a real reference photo of that worked stitch and
 * iterate until it genuinely reads as that stitch. Phase 1 of the loom build:
 * the whole vocabulary must be solid before any pattern.
 *
 *   cd apps/web && npx tsx scripts/loom-stitch-proof.ts [name]
 *
 * Output: ../../.loom-scratch/stitches/<name>.png  (+ contact-sheet.png)
 */

import { resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'
import type { Vec2 } from '../src/lib/loom/core/vec'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import type { ThreadStroke } from '../src/lib/loom/render/thread'
import type { StitchContext } from '../src/lib/loom/stitches/types'
import { straightStitch, runningStitch, backStitch, stemStitch, splitStitch, couching } from '../src/lib/loom/stitches/line'
import { satinBlock, satinBand } from '../src/lib/loom/stitches/satin'
import { longAndShort, fishbone } from '../src/lib/loom/stitches/fill'
import { frenchKnot, lazyDaisy, seed } from '../src/lib/loom/stitches/detached'
import { chainStitch, flyStitch, featherStitch } from '../src/lib/loom/stitches/chain'

const OUT = resolve(process.cwd(), '../../.loom-scratch/stitches')
mkdirSync(OUT, { recursive: true })

const SS = Number(process.env.LOOM_SS ?? 2)
const PPM = Number(process.env.LOOM_PPM ?? 20)
const W = 28
const H = 22
const FABRIC = { hex: '#f3efe6', threadsPerCm: 9, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 3 }

function ctx(hex: string, strands = 4, seed = 1): StitchContext {
  return { kind: 'stranded-cotton', hex, strands, seed }
}

const RED = '#bb3322'
const TEAL = '#1f7a70'
const GOLD = '#caa23a'
const LEAF = '#5d8a3a'

/** A smooth S / arc curve across the swatch, for the line-stitch swatches. */
function curve(): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i <= 24; i++) {
    const u = i / 24
    pts.push({ x: 5 + u * (W - 10), y: H / 2 + Math.sin(u * Math.PI * 1.3) * 4.5 })
  }
  return pts
}

function leafEdges(): { a: Vec2[]; b: Vec2[] } {
  const a: Vec2[] = []
  const b: Vec2[] = []
  const cx = W / 2
  const cy = H / 2
  const half = 9
  for (let i = 0; i <= 20; i++) {
    const u = i / 20
    const x = cx - half + u * 2 * half
    const bulge = Math.sin(u * Math.PI) * 4.2
    a.push({ x, y: cy - bulge })
    b.push({ x, y: cy + bulge })
  }
  return { a, b }
}

const SWATCHES: Record<string, () => ThreadStroke[]> = {
  straight: () => {
    const out: ThreadStroke[] = []
    for (let i = 0; i < 6; i++) {
      const x = 6 + i * 3.2
      out.push(...straightStitch({ x, y: 4 }, { x: x + (i - 2.5) * 0.8, y: H - 4 }, ctx(RED)))
    }
    return out
  },
  running: () => runningStitch({ x: 4, y: H / 2 }, { x: W - 4, y: H / 2 }, ctx(TEAL)),
  back: () => backStitch(curve(), ctx(RED)),
  stem: () => stemStitch(curve(), ctx(GOLD, 4)),
  split: () => splitStitch(curve(), ctx(TEAL)),
  'satin-block': () => satinBlock(W / 2, H / 2, 12, 9, 90, ctx(RED, 6)),
  'satin-leaf': () => {
    const { a, b } = leafEdges()
    return satinBand(a, b, ctx(LEAF, 6))
  },
  'french-knot': () => {
    const out: ThreadStroke[] = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        out.push(...frenchKnot({ x: 7 + i * 5, y: 6 + j * 5 }, ctx(GOLD, 6), { wraps: 2 }))
      }
    }
    return out
  },
  'lazy-daisy': () => {
    const out: ThreadStroke[] = []
    const cx = W / 2
    const cy = H / 2
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      out.push(...lazyDaisy({ x: cx, y: cy }, { x: cx + Math.cos(a) * 7, y: cy + Math.sin(a) * 7 }, ctx(TEAL, 4)))
    }
    out.push(...frenchKnot({ x: cx, y: cy }, ctx(GOLD, 6), { wraps: 3 }))
    return out
  },
  seed: () => {
    const out: ThreadStroke[] = []
    for (let i = 0; i < 22; i++) {
      const x = 5 + ((i * 137) % 1000) / 1000 * (W - 10)
      const y = 4 + ((i * 911) % 1000) / 1000 * (H - 8)
      const ang = (i * 53) % 180
      out.push(...seed({ x, y }, ctx(RED, 3), { angleDeg: ang }))
    }
    return out
  },
  chain: () => chainStitch(curve(), ctx(TEAL, 4)),
  fly: () => {
    const out: ThreadStroke[] = []
    for (let i = 0; i < 4; i++) {
      const y = 4 + i * 4.6
      out.push(...flyStitch({ x: W / 2 - 5, y }, { x: W / 2 + 5, y }, { x: W / 2, y: y + 3 }, ctx(LEAF, 4)))
    }
    return out
  },
  feather: () => featherStitch(
    Array.from({ length: 16 }, (_, i) => ({ x: W / 2, y: 4 + (i / 15) * (H - 8) })),
    ctx(LEAF, 4),
  ),
  'long-and-short': () => longAndShort(W / 2, H / 2, 14, 12, 0, ctx(RED, 6), { rowMm: 3.2 }),
  fishbone: () => fishbone({ x: W / 2, y: 3 }, { x: W / 2, y: H - 3 }, 9, ctx(LEAF, 4)),
  couching: () => couching(curve(), ctx(GOLD, 6), ctx(RED, 2), { tackEveryMm: 2.6 }),
}

async function renderOne(name: string, strokes: ThreadStroke[]): Promise<string> {
  const img = renderEmbroidery({ widthMm: W, heightMm: H, pxPerMm: PPM, ss: SS, fabric: FABRIC, strokes })
  const path = resolve(OUT, `${name}.png`)
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(path)
  return path
}

async function main() {
  const only = process.argv[2]
  const names = only ? [only] : Object.keys(SWATCHES)
  const tiles: { name: string; buf: Buffer; w: number; h: number }[] = []
  for (const name of names) {
    const factory = SWATCHES[name]
    if (!factory) {
      throw new Error(`unknown swatch: ${name}. known: ${Object.keys(SWATCHES).join(', ')}`)
    }
    const t0 = Date.now()
    const strokes = factory()
    const img = renderEmbroidery({ widthMm: W, heightMm: H, pxPerMm: PPM, ss: SS, fabric: FABRIC, strokes })
    const path = resolve(OUT, `${name}.png`)
    await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(path)
    tiles.push({ name, buf: Buffer.from(img.data), w: img.width, h: img.height })
    console.log(`${name}: ${strokes.length} strokes -> ${path} (${Date.now() - t0}ms)`)
  }

  // Contact sheet: tile all swatches in a grid for one-glance review.
  if (!only && tiles.length > 1) {
    const cols = 4
    const rows = Math.ceil(tiles.length / cols)
    const tw = tiles[0]!.w
    const th = tiles[0]!.h
    const gap = 8
    const sheetW = cols * tw + (cols + 1) * gap
    const sheetH = rows * th + (rows + 1) * gap
    const composites = tiles.map((t, i) => {
      const cx = i % cols
      const cy = Math.floor(i / cols)
      return {
        input: t.buf,
        raw: { width: t.w, height: t.h, channels: 4 as const },
        left: gap + cx * (tw + gap),
        top: gap + cy * (th + gap),
      }
    })
    const sheetPath = resolve(OUT, 'contact-sheet.png')
    await sharp({ create: { width: sheetW, height: sheetH, channels: 4, background: { r: 232, g: 228, b: 221, alpha: 1 } } })
      .composite(composites)
      .png()
      .toFile(sheetPath)
    console.log(`contact sheet -> ${sheetPath}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

export { renderOne }
