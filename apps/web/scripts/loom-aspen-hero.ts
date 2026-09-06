/**
 * Step 4 (per RENDER_PROCESS.md, Crochet) — RENDER the photoreal yarn hero, only
 * AFTER the stitches are signed off (Step 3).
 *
 * Chain: the signed-off exact stitches -> deterministic Blender base (already
 * rendered by loom-aspen.ts) -> LOCKED Fal creative-upscale (structure-locked;
 * adds real yarn fibre/fuzz/relief without moving the stitches) -> fidelity gate
 * (confirms no drift) -> photoreal hero.
 *
 * `finishHero()` (exported) is the in-process entry point: `photorealHero` in
 * loom-pattern.ts imports it directly (dynamic import — see the Inngest
 * functions' `loom()` helpers) instead of shelling out to this file, so the
 * finish runs equally on a worker box and inside the deployed server, which has
 * no `scripts/` directory or `tsx` to shell out to.
 *
 *   cd apps/web && npx tsx scripts/loom-aspen-hero.ts <basePng> [creativity] [resemblance]
 *
 * Costs ~£0.03-0.05/image on Fal (the locked creative-upscale finish).
 */

import { resolve, basename } from 'node:path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadCredentials } from './loom-hybrid-fal'
import { fidelityGate, type FidelityVerdict } from './loom-fidelity-gate'
import type { YarnFibre } from '../src/lib/loom/crochet/engine/program'

const IS_MAIN = import.meta.url === pathToFileURL(process.argv[1] ?? '').href

// Local-tooling convenience only: on the deployed server this looks for
// `.env.credentials` and finds nothing (there is no repo checkout), which is
// harmless — `finishHero` reads `process.env.FAL_KEY` at CALL time, where the
// server's mounted secret is already in the environment.
loadCredentials()

const UPSCALE_ENDPOINT = 'https://fal.run/fal-ai/clarity-upscaler'

// Crochet-specific guidance: the upscaler must read the base as CHUNKY CROCHET
// (not embroidery), so it repaints the ribs as real bulky wool yarn. The stitch
// description must MATCH the base's stitch or the upscale fights the structure.
const STITCH_PROMPTS: Record<string, string> = {
  sc: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in single crochet.',
    'Neat, even, dense rows of small V-shaped single-crochet stitches in fluffy wool yarn.',
  ].join(' '),
  amigurumi: [
    'A photograph of a finished hand-crocheted amigurumi toy, a small stuffed ball creature, sitting on a plain white surface.',
    'Made of dense single-crochet stitches worked in the round in soft wool yarn — the whole surface is a tidy spiral of small V-shaped stitches, firm and stuffed round.',
  ].join(' '),
  hdc: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in half double crochet.',
    'Even rows of half-double-crochet stitches with the distinctive horizontal third-loop ridge between rows, in fluffy wool yarn.',
  ].join(' '),
  dc: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in double crochet.',
    'Tall, distinct vertical double-crochet posts standing in even columns, each topped by a small chain V, with the characteristic small open spaces between posts, in fluffy wool yarn.',
  ].join(' '),
  tr: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in treble crochet.',
    'Very tall vertical treble-crochet posts in open even columns, each topped by a small chain V, airy and open, in fluffy wool yarn.',
  ].join(' '),
  dtr: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in double treble crochet.',
    'Extra-tall slender vertical posts in open airy columns, each topped by a small chain V, in fluffy wool yarn.',
  ].join(' '),
  slst: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in slip stitch.',
    'Dense, very flat, tight rows of small slip-stitch loops forming neat horizontal ridges, low relief, in fluffy wool yarn.',
  ].join(' '),
  ch: [
    'An extreme close-up macro photograph of a single soft wool crochet foundation chain.',
    'A neat row of interlocking V-shaped chain loops forming a braid, in fluffy wool yarn, on a plain background.',
  ].join(' '),
  scblo: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in single crochet through the back loop only.',
    'Dense even rows of single crochet with a pronounced raised horizontal ridge between every row (the unworked front loops), in fluffy wool yarn.',
  ].join(' '),
  scflo: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in single crochet through the front loop only.',
    'Dense even rows of single crochet with a soft raised horizontal ridge line per row (the unworked loops), in fluffy wool yarn.',
  ].join(' '),
  fpdc: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in front-post and back-post double crochet ribbing.',
    'Bold, smooth, rounded vertical cabled ribs standing proud of the fabric, alternating with cleanly recessed vertical valleys, dense and dimensional, lit from the side so the ribs cast soft shadows, in fluffy wool yarn.',
  ].join(' '),
  bpdc: [
    'An extreme close-up macro photograph of a soft wool crochet swatch worked in back-post double crochet.',
    'Vertical post columns set back into the fabric in even recessed ribs, in fluffy wool yarn.',
  ].join(' '),
  bobble: [
    'An extreme close-up macro photograph of a crochet bobble-stitch swatch in soft wool.',
    'Distinct round raised bobble berries (little balls of yarn) popping up in a neat offset polka-dot pattern on a flat, calm single-crochet background, each bobble a tight rounded bump, in fluffy wool yarn.',
  ].join(' '),
  scinc: [
    'An extreme close-up macro photograph of a shaped soft wool crochet swatch worked in single crochet with increases.',
    'Dense rows of small V-shaped single-crochet stitches; the piece widens row by row, with pairs of stitches fanning out from a shared base at the increase points along the edges, in fluffy wool yarn.',
  ].join(' '),
  scdec: [
    'An extreme close-up macro photograph of a shaped soft wool crochet swatch worked in single crochet with decreases.',
    'Dense rows of small V-shaped single-crochet stitches; the piece narrows row by row, with two stitch legs drawn together under a single top V at the decrease points, in fluffy wool yarn.',
  ].join(' '),
  mrdisc: [
    'An extreme close-up top-down macro photograph of a flat circle crocheted in the round in soft wool, started from a magic ring.',
    'A neat flat disc of dense single-crochet stitches worked in a continuous spiral: small V stitches radiating in rounds from a tight closed centre, evenly increasing outward, in fluffy wool yarn.',
  ].join(' '),
}

// Knit swatches (same engine, different craft): the upscaler must read the base
// as KNITTING, so the crochet wording — and the crochet negative — must swap.
const KNIT_PROMPTS: Record<string, string> = {
  k: [
    'An extreme close-up macro photograph of a hand-knitted stockinette stitch swatch in soft wool.',
    'Neat, even vertical columns of small interlocking V-shaped knit stitches, smooth classic stocking stitch fabric, in fluffy wool yarn.',
  ].join(' '),
  stockinette: [
    'An extreme close-up macro photograph of a hand-knitted stockinette stitch swatch in soft wool.',
    'Neat, even vertical columns of small interlocking V-shaped knit stitches, smooth classic stocking stitch fabric, in fluffy wool yarn.',
  ].join(' '),
  garter: [
    'An extreme close-up macro photograph of a hand-knitted garter stitch swatch in soft wool.',
    'Even horizontal ridges of plump purl bumps alternating with recessed valley rows, squashy classic garter stitch fabric, in fluffy wool yarn.',
  ].join(' '),
}

// The background clause is common to every prompt (no per-pattern flag) so
// every hero — flat swatch, finished-object flatlay/loop, or amigurumi
// composition — asks the upscaler for the same crisp e-commerce backdrop the
// Blender base now renders (loom_render_crochet.py's camera-ray ground boost,
// surface_material). Without this the base's own near-white ground was the
// only cue, and the upscaler's "soft natural window light" phrasing pulled it
// back toward a lifestyle-photo grey/mottled surface at creativity 0.55.
const WHITE_BG =
  'Photographed on a clean, seamless, pure white studio background — a plain solid white surface with no visible texture, pattern, mottling, colour cast, or vignette.'

const COMMON =
  `Real visible yarn: soft plied fibres, a gentle fuzzy halo, cosy hand-crocheted wool texture, each stitch tidy and uniform. ${WHITE_BG} Soft even studio light, shallow depth of field, extremely detailed, photorealistic, looks like a real crocheted swatch.`
const COMMON_KNIT =
  `Real visible yarn: soft plied fibres, a gentle fuzzy halo, cosy hand-knitted wool texture, each stitch tidy and uniform. ${WHITE_BG} Soft even studio light, shallow depth of field, extremely detailed, photorealistic, looks like a real knitted swatch.`

const BG_NEG =
  'grey background, gray background, beige background, tan background, wood background, fabric background, textured background, mottled background, patterned background, vignette, dark corners, coloured backdrop, studio backdrop paper texture, table, surface texture, hand, fingers, person, human, holding'
const NEG =
  `embroidery, cross stitch, knitting, woven fabric, basket weave, smooth plastic, dough, cartoon, illustration, vector art, flat colours, 3d render, cgi, digital art, ${BG_NEG}`
const NEG_KNIT =
  `embroidery, cross stitch, crochet, woven fabric, basket weave, smooth plastic, dough, cartoon, illustration, vector art, flat colours, 3d render, cgi, digital art, ${BG_NEG}`

// Per-fibre prompt clauses (STITCH_ENGINE yarn-fibre pass): the Blender base
// already carries the fibre in its geometry/shader (loom_render_crochet.py),
// but the STITCH_PROMPTS/COMMON wording above always says "wool" — an
// upscaler asked for wool on a chenille/velvet base fights the base's own
// dense fuzzy-pile halo and tries to repaint it back into smooth plied yarn.
// 'cotton'/unset add nothing, so every existing call (no `fibre` option) gets
// the exact prompt string it always has. Appended AFTER the stitch + COMMON
// text, so it reads as extra guidance rather than replacing the stitch shape
// description.
const FIBRE_CLAUSE: Partial<Record<YarnFibre, string>> = {
  wool: 'Soft brushed wool yarn with a gentle halo of loose fibres and the odd stray hair, matte and cosy, not glossy.',
  chenille: 'Thick plush chenille yarn: a dense short furry pile completely covering every stitch, like a chenille plushie toy — soft, matte, rounded and fuzzy, no visible individual plies or yarn strand structure.',
  velvet: 'Thick plush chenille-style yarn with a soft directional sheen, like brushed velvet catching the light — dense short pile, plump and rounded, matte everywhere except a gentle brushed-fibre gloss.',
}
const FIBRE_NEG: Partial<Record<YarnFibre, string>> = {
  chenille: 'smooth yarn, visible individual plies, glossy plastic, wet look, embroidery floss',
  velvet: 'smooth yarn, visible individual plies, glossy plastic, wet look, embroidery floss',
}

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

async function upscale(
  initPath: string,
  outPath: string,
  creativity: number,
  resemblance: number,
  prompt: string,
  negativePrompt: string = NEG,
) {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY not found (.env.credentials).')
  const b64 = readFileSync(initPath).toString('base64')
  const body = {
    image_url: `data:image/png;base64,${b64}`,
    prompt,
    negative_prompt: negativePrompt,
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

export interface FinishHeroOptions {
  /** The deterministic Blender base PNG to finish. */
  basePng: string
  /** Where to write the finished hero. Defaults to `<basePng>` with `-hero` before `.png`. */
  outPng?: string
  /** Dictionary stitch (drives which prompt/negative pair is used). Default 'sc'. */
  stitch?: string
  /** The yarn fibre look the base was rendered in (STITCH_ENGINE yarn-fibre
   *  pass) — appends a fibre-matched clause so the upscale doesn't fight a
   *  chenille/velvet/wool base by repainting it back to smooth plied yarn.
   *  Default 'cotton' (no clause added — the historical prompt). */
  fibre?: YarnFibre
  /** Fal creative-upscale creativity. Default 0.5 (the lock). */
  creativity?: number
  /** Fal creative-upscale resemblance. Default 0.85 (the lock). */
  resemblance?: number
  /** Override the stitch's built-in prompt (rare — testing/tuning only). */
  promptOverride?: string
  /** Override the stitch's built-in negative prompt (rare — testing/tuning only). */
  negativePromptOverride?: string
}

export interface FinishHeroResult {
  /** The finished hero PNG on disk. */
  heroPng: string
  /** The fidelity gate's verdict comparing the hero back to the base. */
  fidelity: FidelityVerdict
  /** How many upscale calls this took. Always 1 — a single locked attempt,
   *  same as the CLI; the caller (photorealHero) decides what to do on a
   *  FAIL, same as it always has. */
  attempts: number
  /** 'upscale' always — kept for symmetry with the needlework hero's result
   *  shape (renderHero's HeroPath), where a FAILed gate falls back to the base
   *  one level up rather than inside this function. */
  pathTaken: 'upscale'
}

/**
 * THE photoreal finish, callable in process. Fal creative-upscale (structure-
 * locked to the deterministic base) + the fidelity gate, one attempt, same as
 * the CLI below has always done. Reads FAL_KEY from the environment at CALL
 * time (not at import), so it works equally from a worker box's
 * `.env.credentials` and from the deployed server's mounted secret.
 */
export async function finishHero(options: FinishHeroOptions): Promise<FinishHeroResult> {
  const base = resolve(process.cwd(), options.basePng)
  const creativity = options.creativity ?? 0.5
  const resemblance = options.resemblance ?? 0.85
  const stitch = (options.stitch ?? 'sc').toLowerCase()
  if (!existsSync(base)) throw new Error(`base not found: ${base}`)

  const knit = stitch in KNIT_PROMPTS
  const fibre = options.fibre ?? 'cotton'
  const fibreClause = FIBRE_CLAUSE[fibre]
  const fibreNeg = FIBRE_NEG[fibre]
  const prompt =
    options.promptOverride ??
    (knit ? `${KNIT_PROMPTS[stitch]} ${COMMON_KNIT}` : `${STITCH_PROMPTS[stitch] ?? STITCH_PROMPTS.sc} ${COMMON}`) +
      (fibreClause ? ` ${fibreClause}` : '')
  const negativePrompt =
    options.negativePromptOverride ?? (knit ? NEG_KNIT : NEG) + (fibreNeg ? `, ${fibreNeg}` : '')
  const out = options.outPng ?? base.replace(/\.png$/, '-hero.png')

  console.log(`[Step 4] upscale base=${basename(base)} stitch=${stitch} creativity=${creativity} resemblance=${resemblance}`)
  const meta = await upscale(base, out, creativity, resemblance, prompt, negativePrompt)
  console.log(`wrote ${out} (${(meta.bytes / 1024).toFixed(0)} KB, ${meta.width}x${meta.height})`)

  // Fidelity gate: confirm the upscale didn't move the stitches.
  const fidelity = await fidelityGate(base, out)
  console.log(
    `[gate] structure=${fidelity.structureScore.toFixed(3)} colour=${fidelity.colourDelta.toFixed(3)} -> ${fidelity.pass ? 'PASS' : 'FAIL'}`,
  )
  if (!fidelity.pass) {
    console.log('  (drift detected — retry at lower creativity, or fall back to the deterministic base)')
  }
  return { heroPng: out, fidelity, attempts: 1, pathTaken: 'upscale' }
}

async function main() {
  const base = process.argv[2] ?? '../../.loom-scratch/crochet/aspen-swatch.png'
  const creativity = Number(process.argv[3] ?? 0.5)
  const resemblance = Number(process.argv[4] ?? 0.85)
  // argv[5] = the swatch arg (preferred), argv[6] = its dictionary stitch as a
  // fallback — the first of the two with a prompt on file wins.
  const argName = (process.argv[5] ?? 'sc').toLowerCase()
  const fallback = (process.argv[6] ?? 'sc').toLowerCase()
  const stitch = argName in STITCH_PROMPTS || argName in KNIT_PROMPTS ? argName : fallback
  await finishHero({ basePng: base, creativity, resemblance, stitch })
}

if (IS_MAIN) {
  main().catch((e) => {
    console.error('[loom-aspen-hero] FAILED:', e instanceof Error ? e.message : String(e))
    process.exit(1)
  })
}
