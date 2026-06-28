/**
 * Step 4 (per RENDER_PROCESS.md, Crochet) — RENDER the photoreal yarn hero, only
 * AFTER the stitches are signed off (Step 3).
 *
 * Chain: the signed-off exact stitches -> deterministic Blender base (already
 * rendered by loom-aspen.ts) -> LOCKED Fal creative-upscale (structure-locked;
 * adds real yarn fibre/fuzz/relief without moving the stitches) -> fidelity gate
 * (confirms no drift) -> photoreal hero.
 *
 *   cd apps/web && npx tsx scripts/loom-aspen-hero.ts <basePng> [creativity] [resemblance]
 *
 * Costs ~£0.03-0.05/image on Fal (the locked creative-upscale finish).
 */

import { resolve, basename } from 'node:path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { loadCredentials } from './loom-hybrid-fal'
import { fidelityGate } from './loom-fidelity-gate'

loadCredentials()

const UPSCALE_ENDPOINT = 'https://fal.run/fal-ai/clarity-upscaler'

// Crochet-specific guidance: the upscaler must read the base as CHUNKY CROCHET
// (not embroidery), so it repaints the ribs as real bulky wool yarn.
const PROMPT = [
  'An extreme close-up macro photograph of a soft cream wool crochet swatch worked in single crochet.',
  'Neat, even, dense rows of small V-shaped single-crochet stitches in fluffy cream wool yarn.',
  'Real visible yarn: soft plied fibres, a gentle fuzzy halo, cosy hand-crocheted wool texture, each stitch tidy and uniform.',
  'Soft natural window light, shallow depth of field, extremely detailed, photorealistic, looks like a real crocheted swatch.',
].join(' ')

const NEG =
  'embroidery, cross stitch, knitting, woven fabric, basket weave, smooth plastic, dough, cartoon, illustration, vector art, flat colours, 3d render, cgi, digital art'

interface FalImage {
  url: string
  width?: number
  height?: number
}
interface FalResponse {
  images?: FalImage[]
  image?: FalImage
  seed?: number
}

async function upscale(initPath: string, outPath: string, creativity: number, resemblance: number) {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY not found (.env.credentials).')
  const b64 = readFileSync(initPath).toString('base64')
  const body = {
    image_url: `data:image/png;base64,${b64}`,
    prompt: PROMPT,
    negative_prompt: NEG,
    upscale_factor: 2,
    creativity,
    resemblance,
    num_inference_steps: 20,
    enable_safety_checker: false,
  }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 180_000)
  let data: FalResponse
  try {
    const res = await fetch(UPSCALE_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const b = await res.text().catch(() => '')
      throw new Error(`Fal HTTP ${res.status}: ${b.slice(0, 300)}`)
    }
    data = (await res.json()) as FalResponse
  } finally {
    clearTimeout(timer)
  }
  const img = data.images?.[0] ?? data.image
  if (!img?.url) throw new Error('Fal returned no image. keys: ' + Object.keys(data).join(','))
  const dl = await fetch(img.url)
  const buf = Buffer.from(await dl.arrayBuffer())
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
  return { width: img.width, height: img.height, bytes: buf.length, seed: data.seed }
}

async function main() {
  const base = resolve(process.cwd(), process.argv[2] ?? '../../.loom-scratch/crochet/aspen-swatch.png')
  const creativity = Number(process.argv[3] ?? 0.5)
  const resemblance = Number(process.argv[4] ?? 0.85)
  if (!existsSync(base)) throw new Error(`base not found: ${base}`)

  const out = base.replace(/\.png$/, '-hero.png')
  console.log(`[Step 4] upscale base=${basename(base)} creativity=${creativity} resemblance=${resemblance}`)
  const meta = await upscale(base, out, creativity, resemblance)
  console.log(`wrote ${out} (${(meta.bytes / 1024).toFixed(0)} KB, ${meta.width}x${meta.height})`)

  // Fidelity gate: confirm the upscale didn't move the stitches.
  const verdict = await fidelityGate(base, out)
  console.log(
    `[gate] structure=${verdict.structureScore.toFixed(3)} colour=${verdict.colourDelta.toFixed(3)} -> ${verdict.pass ? 'PASS' : 'FAIL'}`,
  )
  if (!verdict.pass) {
    console.log('  (drift detected — retry at lower creativity, or fall back to the deterministic base)')
  }
}

main()
