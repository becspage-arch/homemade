/**
 * S-8b PART 1 — test-batch generator (8 patterns, max 5 attempts each).
 *
 * Generates ONE attempt for ONE pattern, saves the PNG + sidecar JSON, and
 * exits. The Claude Code session reads the PNG via its multimodal Read
 * tool, judges against the 4-point rubric, and either:
 *   - Accepts the image (writes <slug>.PASS.json, moves on)
 *   - Re-runs this script with --attempt N+1 (and a varied prompt)
 *   - After 5 fails: writes <slug>.FALLBACK.json
 *
 * No SDK calls from this script. Self-judging happens inside the session.
 *
 * Usage:
 *   tsx scripts/_s8b-test-generate.ts --slug sewing-hair-scrunchie --attempt 1
 *   tsx scripts/_s8b-test-generate.ts --slug sewing-tea-towel-mitred-corners --attempt 3
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let envDir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(envDir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(envDir); if (p === envDir) break; envDir = p
}

const FAL_API = 'https://fal.run/fal-ai/flux-pro/v1.1'
const OUTPUT_DIR = resolve(__dirname, 's8b-test-output')

interface PickConfig {
  slug: string
  subject: string
  garmentDescription: string
  fabricHints: string[]
  paletteHint: string
}

const PICKS: PickConfig[] = [
  {
    slug: 'sewing-hair-scrunchie',
    subject: 'a hair scrunchie',
    garmentDescription:
      'a soft fabric hair scrunchie, the gathered tube formed into a circle with the elastic hidden inside',
    fabricHints: ['cotton lawn', 'jersey knit'],
    paletteHint: 'dusty pink with a small floral print',
  },
  {
    slug: 'sewing-mens-tie-standard',
    subject: 'a finished necktie shown in its entirety',
    garmentDescription:
      "a classic men's silk necktie photographed in its full length, the entire tie from the wider apron at the top to the pointed tip at the bottom completely visible within the frame with generous margin above and below, no cropping",
    fabricHints: ['silk'],
    paletteHint: 'deep navy blue with a subtle woven texture',
  },
  {
    slug: 'sewing-tote-bag-interfaced-handles',
    subject: 'a tote bag',
    garmentDescription:
      'a structured cotton-canvas tote bag standing upright with two sturdy interfaced handles above the bag body',
    fabricHints: ['cotton canvas', 'duck cloth'],
    paletteHint: 'natural off-white canvas',
  },
  {
    slug: 'sewing-pencil-case-zip',
    subject: 'a zip-top pencil case',
    garmentDescription:
      'a small rectangular zip-top pencil case with squared box corners, lying flat with the zip closed at the top',
    fabricHints: ['cotton quilting'],
    paletteHint: 'sage green with a small geometric print',
  },
  {
    slug: 'sewing-simple-backpack-drawstring',
    subject: 'a drawstring backpack',
    garmentDescription:
      'a simple drawstring backpack with a gathered top closure, two canvas shoulder straps hanging from the bottom corners up through the casing at the top',
    fabricHints: ['cotton canvas'],
    paletteHint: 'natural beige canvas with brown leather-look reinforcement patches',
  },
  {
    slug: 'sewing-cushion-cover-envelope-back',
    subject: 'a square cushion',
    garmentDescription:
      'a plain square cushion, roughly 45 by 45 centimetres, with a clean front panel, slight loft from the pad inside, viewed from the front',
    fabricHints: ['linen blend'],
    paletteHint: 'warm oatmeal linen',
  },
  {
    slug: 'sewing-tea-towel-mitred-corners',
    subject: 'a folded tea towel',
    garmentDescription:
      'a single folded linen tea towel with clearly visible mitred corners at the hem',
    fabricHints: ['linen'],
    paletteHint: 'natural unbleached linen with a thin pale-blue woven stripe',
  },
  {
    slug: 'sewing-drum-lampshade-cover',
    subject: 'a drum lampshade',
    garmentDescription:
      'a cylindrical drum lampshade, perfectly upright, fabric-covered with a clean visible seam down one side and tidy bias-bound top and bottom edges',
    fabricHints: ['light linen'],
    paletteHint: 'soft ivory linen',
  },
]

interface AttemptStyleHint {
  angleAndComposition: string
  lighting: string
  background: string
  notes: string
}

// Five style variants — one per attempt. Each pushes a different prompt
// lever so we are not just re-rolling the same seed five times.
const ATTEMPT_STYLES: AttemptStyleHint[] = [
  {
    angleAndComposition:
      'centred composition, three-quarter view from slightly above, the object fully in frame with breathing room on all sides',
    lighting: 'soft even diffused studio lighting, gentle shadow beneath',
    background: 'pure clean neutral white seamless paper background, no texture',
    notes: 'editorial product photograph, sharp focus, realistic textile texture',
  },
  {
    angleAndComposition:
      'centred composition, direct overhead flat-lay view, object centred in the frame',
    lighting: 'soft top lighting with very subtle shadow',
    background: 'pure white seamless background',
    notes: 'modern e-commerce product photography, realistic, sharp focus, no styling props',
  },
  {
    angleAndComposition:
      'centred composition, straight-on front view at eye level, object filling roughly two-thirds of the frame',
    lighting: 'soft side-window lighting with a gentle gradient on the background',
    background:
      'pure neutral white background, very faint floor-shadow only',
    notes:
      'realistic product photograph, no AI-illustration look, accurate hardware and stitching',
  },
  {
    angleAndComposition:
      'centred composition, slight three-quarter angle, object isolated and clearly the single subject',
    lighting: 'bright clean key light from front, secondary fill from the left',
    background: 'pure white seamless background',
    notes:
      'photorealistic, no melted seams, no warped hardware, no extra straps or duplicate parts',
  },
  {
    angleAndComposition:
      'centred composition, classic three-quarter studio product angle, object perfectly upright and clearly identifiable',
    lighting: 'soft umbrella-style studio lighting, no harsh highlights',
    background: 'pure white seamless background',
    notes:
      'highly realistic studio catalogue photograph, accurate proportions, no anatomy or melted-fabric artefacts',
  },
]

function buildPrompt(pick: PickConfig, style: AttemptStyleHint): string {
  const fabric = pick.fabricHints.join(' or ')
  return [
    `Studio product photograph of ${pick.subject}.`,
    `${pick.garmentDescription}.`,
    `Fabric: ${fabric}, ${pick.paletteHint}.`,
    style.angleAndComposition + '.',
    style.lighting + '.',
    style.background + '.',
    style.notes + '.',
    'No model, no hands, no body parts, no text, no logos, no brand labels, no watermarks.',
  ]
    .filter(Boolean)
    .map((s) => s.trim())
    .join(' ')
}

function parseArgs(): { slug: string; attempt: number } {
  const args = process.argv.slice(2)
  let slug = ''
  let attempt = 1
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug') slug = args[++i] ?? ''
    else if (args[i] === '--attempt') attempt = Number(args[++i] ?? '1')
  }
  if (!slug) throw new Error('missing --slug')
  if (!Number.isFinite(attempt) || attempt < 1 || attempt > 5) {
    throw new Error('--attempt must be 1..5')
  }
  return { slug, attempt }
}

interface FalImage {
  url: string
  width: number
  height: number
  content_type?: string
}
interface FalResponse {
  images?: FalImage[]
  seed?: number
}

async function callFal(prompt: string, key: string): Promise<{ url: string; width: number; height: number; seed?: number }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 120_000)
  try {
    const res = await fetch(FAL_API, {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: { width: 1024, height: 1280 },
        num_images: 1,
        safety_tolerance: '2',
        output_format: 'png',
        enable_safety_checker: true,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Fal HTTP ${res.status}: ${body.slice(0, 240)}`)
    }
    const data = (await res.json()) as FalResponse
    const img = data.images?.[0]
    if (!img?.url) throw new Error('Fal returned no image')
    return { url: img.url, width: img.width, height: img.height, seed: data.seed }
  } finally {
    clearTimeout(timer)
  }
}

async function downloadPng(url: string): Promise<Buffer> {
  const dl = await fetch(url, {
    headers: {
      'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
      Accept: 'image/*,*/*;q=0.8',
    },
  })
  if (!dl.ok) throw new Error(`Image download failed: ${dl.status}`)
  return Buffer.from(await dl.arrayBuffer())
}

async function main(): Promise<void> {
  const { slug, attempt } = parseArgs()
  const pick = PICKS.find((p) => p.slug === slug)
  if (!pick) throw new Error(`Unknown slug: ${slug}. Known: ${PICKS.map((p) => p.slug).join(', ')}`)
  const style = ATTEMPT_STYLES[attempt - 1]!
  const prompt = buildPrompt(pick, style)

  const key = process.env.FAL_KEY
  if (!key) {
    console.error('FAL_KEY not set in env. Aborting.')
    process.exit(1)
  }

  const slugDir = resolve(OUTPUT_DIR, slug)
  if (!existsSync(slugDir)) mkdirSync(slugDir, { recursive: true })
  const pngPath = resolve(slugDir, `${slug}-attempt-${attempt}.png`)
  const jsonPath = resolve(slugDir, `${slug}-attempt-${attempt}.json`)

  console.log(`[s8b-test] slug=${slug} attempt=${attempt}`)
  console.log(`[s8b-test] prompt: ${prompt}`)

  const t0 = Date.now()
  const fal = await callFal(prompt, key)
  const buf = await downloadPng(fal.url)
  const tookMs = Date.now() - t0
  writeFileSync(pngPath, buf)
  const sidecar = {
    slug,
    attempt,
    prompt,
    style,
    falUrl: fal.url,
    width: fal.width,
    height: fal.height,
    seed: fal.seed ?? null,
    bytes: buf.length,
    tookMs,
    estCostGbp: 0.032,
    falModel: 'fal-ai/flux-pro/v1.1',
    generatedAt: new Date().toISOString(),
  }
  writeFileSync(jsonPath, JSON.stringify(sidecar, null, 2))
  console.log(`[s8b-test] saved: ${pngPath}`)
  console.log(`[s8b-test] sidecar: ${jsonPath}`)
  console.log(`[s8b-test] took=${tookMs}ms bytes=${buf.length} estCostGbp=0.032`)
}

main().catch((e) => {
  console.error('[s8b-test] FAILED:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})
