/**
 * SCRATCH PRE-FLIGHT (not shipped, not a gate): draw the SETTLED strand of a
 * swatch straight to a PNG, top-down, at the rendered yarn thickness — a few
 * seconds locally instead of a ~7 minute Fargate Blender task.
 *
 *   cd apps/web && npx tsx scripts/loom-strand-preflight.ts [stitch=sc] [yr=2.4] [out.png]
 *
 * It is NOT a look judgement (no material, no light, no depth) — it exists only
 * to catch a construction that has obviously tangled before paying for a render.
 * Depth is drawn as painter's order (back to front) so the over/under layering
 * is at least legible.
 */

import { resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { SWATCH_RECIPES } from '../src/lib/loom/crochet/engine/dictionary'
import { smooth, type V3 } from '../src/lib/loom/crochet/yarnLoop'

async function main(): Promise<void> {
  const arg = process.argv[2] ?? 'sc'
  if (!isSwatchArg(arg)) {
    console.error(`unknown stitch '${arg}'`)
    process.exit(2)
  }
  const yr = Number(process.argv[3] ?? 2.4)
  const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet')
  mkdirSync(OUT, { recursive: true })
  const out = process.argv[4] ?? resolve(OUT, `preflight-${arg}-yr${yr}.png`)

  const { built } = buildRelaxedSwatch(arg, SWATCH_RECIPES[arg].auditW, yr)
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((i) => ({ x: nodes[i]!.x, y: nodes[i]!.y, z: nodes[i]!.z }))
  const pts = smooth(ctrl, 4)

  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const pad = yr * 3
  const x0 = Math.min(...xs) - pad
  const x1 = Math.max(...xs) + pad
  const y0 = Math.min(...ys) - pad
  const y1 = Math.max(...ys) + pad
  const Wpx = 1400
  const k = Wpx / (x1 - x0)
  const Hpx = Math.round((y1 - y0) * k)
  const px = (p: V3): [number, number] => [(p.x - x0) * k, Hpx - (p.y - y0) * k]

  // Painter's order: split the strand into short segments and draw them back to
  // front by depth, so what is in front covers what is behind.
  const segs: { d: number; p: string; shade: number }[] = []
  const zs = pts.map((p) => p.z)
  const zlo = Math.min(...zs)
  const zhi = Math.max(...zs)
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    const [ax, ay] = px(a)
    const [bx, by] = px(b)
    const z = (a.z + b.z) / 2
    segs.push({
      d: z,
      p: `M${ax.toFixed(1)},${ay.toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)}`,
      shade: zhi > zlo ? (z - zlo) / (zhi - zlo) : 0.5,
    })
  }
  segs.sort((a, b) => a.d - b.d)
  const stroke = Math.max(1, yr * 1.7 * k) // the RENDERED yarn diameter
  const body = segs
    .map((s) => {
      const v = Math.round(70 + s.shade * 150)
      return `<path d="${s.p}" stroke="rgb(${v},${Math.round(v * 0.72)},${Math.round(v * 0.5)})" stroke-width="${stroke.toFixed(2)}" stroke-linecap="round" fill="none"/>`
    })
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wpx}" height="${Hpx}"><rect width="100%" height="100%" fill="#2a2320"/>${body}</svg>`
  await sharp(Buffer.from(svg)).png().toFile(out)
  console.log(`${arg} yr=${yr}: ${pts.length} samples → ${out}`)
}

void main()
