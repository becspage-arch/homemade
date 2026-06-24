/**
 * HYBRID render test: take the loom's EXACT-pattern render (accurate structure,
 * but reads as CGI) and run it through Flux image-to-image so the model repaints
 * it as photoreal hand embroidery WITHOUT moving the design. Low/mid strength =
 * the composition, flower placement and colours stay locked by our init image;
 * the model only supplies real thread/fabric texture, lighting and depth.
 *
 *   cd apps/web && npx tsx scripts/loom-hybrid-fal.ts <initPng> <outPng> [strength]
 *
 * Costs ~£0.03/image on Fal. One image per run; the session judges it visually.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const IS_MAIN = import.meta.url === pathToFileURL(process.argv[1] ?? '').href

/** Walk up from `start` to find + load `.env.credentials` (FAL_KEY etc.). */
export function loadCredentials(start: string = __dirname): void {
  let envDir = start
  for (let depth = 0; depth < 8; depth++) {
    const c = resolve(envDir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); return }
    const p = dirname(envDir); if (p === envDir) break; envDir = p
  }
}
loadCredentials()

const INIT = process.argv[2] ?? '../../.loom-scratch/blender/countryside-hero.png'
const OUT = process.argv[3] ?? '../../.loom-scratch/blender/countryside-hybrid.png'
const STRENGTH = Number(process.argv[4] ?? 0.6)
// mode: 'img2img' (strength dial) | 'canny' (edge-lock) | 'depth' (relief-lock)
const MODE = process.argv[5] ?? 'img2img'
const GUIDANCE = Number(process.argv[6] ?? (MODE === 'img2img' ? 3.5 : 10))
const ENDPOINTS: Record<string, string> = {
  img2img: 'https://fal.run/fal-ai/flux/dev/image-to-image',
  canny: 'https://fal.run/fal-ai/flux-control-lora-canny/image-to-image',
  depth: 'https://fal.run/fal-ai/flux-control-lora-depth/image-to-image',
  // Creative upscaler: adds fine photoreal detail/texture while keeping the
  // composition pixel-locked. STRENGTH = creativity, GUIDANCE = resemblance.
  upscale: 'https://fal.run/fal-ai/clarity-upscaler',
}
const FAL_API: string = ENDPOINTS[MODE] ?? ENDPOINTS.img2img!

const PROMPT = [
  'A close-up photograph of a finished hand embroidery hoop.',
  'Delicate wildflowers hand-stitched in stranded cotton floss on natural beige linen fabric.',
  'Real visible thread texture: satin stitch petals with sheen, French knots, stem stitch, fern stitch leaves, lazy daisy flowers.',
  'The threads sit raised and proud of the woven linen, casting soft shadows in the fabric weave.',
  'Soft natural window light, shallow depth of field, extremely detailed macro photograph, photorealistic, looks like a real stitched piece.',
].join(' ')

const NEG = 'cartoon, illustration, vector art, flat colours, plastic, 3d render, cgi, digital art, painting, clip art'

interface FalImage { url: string; width?: number; height?: number }
interface FalResponse { images?: FalImage[]; image?: FalImage; seed?: number }

export interface UpscaleResult { outPath: string; width?: number; height?: number; bytes: number; seed?: number }

/**
 * The LOCKED creative-upscale finish, callable in-process by `renderHero`. Takes
 * the deterministic Blender base and adds real thread micro-texture/relief while
 * keeping the composition PIXEL-LOCKED. creativity = how much new texture (lower
 * = more faithful), resemblance = how hard to hold the input. Defaults are the
 * proven lock (0.5 / 0.85). Returns where it wrote + image metadata.
 */
export async function falCreativeUpscale(
  initPath: string,
  outPath: string,
  creativity = 0.5,
  resemblance = 0.85,
): Promise<UpscaleResult> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY not found (.env.credentials).')
  if (!existsSync(initPath)) throw new Error(`init not found: ${initPath}`)
  const b64 = readFileSync(initPath).toString('base64')
  const dataUri = `data:image/png;base64,${b64}`
  const body: Record<string, unknown> = {
    image_url: dataUri,
    prompt: PROMPT,
    negative_prompt: NEG,
    upscale_factor: 2,
    creativity,
    resemblance,
    num_inference_steps: 18,
    enable_safety_checker: false,
  }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 180_000)
  let data: FalResponse
  try {
    const res = await fetch(ENDPOINTS.upscale!, {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) { const b = await res.text().catch(() => ''); throw new Error(`Fal HTTP ${res.status}: ${b.slice(0, 300)}`) }
    data = (await res.json()) as FalResponse
  } finally { clearTimeout(timer) }
  const img = data.images?.[0] ?? data.image
  if (!img?.url) throw new Error('Fal returned no image. Raw keys: ' + Object.keys(data).join(','))
  const dl = await fetch(img.url)
  const buf = Buffer.from(await dl.arrayBuffer())
  const out = resolve(process.cwd(), outPath)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, buf)
  return { outPath: out, width: img.width, height: img.height, bytes: buf.length, seed: data.seed }
}

async function main(): Promise<void> {
  const key = process.env.FAL_KEY
  if (!key) { console.error('FAL_KEY not found (.env.credentials).'); process.exit(1) }

  const initPath = resolve(process.cwd(), INIT)
  if (!existsSync(initPath)) { console.error(`init not found: ${initPath}`); process.exit(1) }
  const b64 = readFileSync(initPath).toString('base64')
  const dataUri = `data:image/png;base64,${b64}`

  console.log(`[hybrid] mode=${MODE} init=${initPath} strength=${STRENGTH} -> ${FAL_API}`)
  const body: Record<string, unknown> =
    MODE === 'upscale'
      ? {
          image_url: dataUri,
          prompt: PROMPT,
          negative_prompt: NEG,
          upscale_factor: 2,
          creativity: STRENGTH, // ~0.3-0.5: how much new texture detail to add
          resemblance: GUIDANCE, // ~0.8-1.5: how hard to stay faithful to input
          num_inference_steps: 18,
          enable_safety_checker: false,
        }
      : MODE === 'canny' || MODE === 'depth'
      ? {
          // Structure-lock: the model must follow our render's edges/relief, so
          // the exact pattern geometry is held while it paints photoreal thread.
          // STRENGTH = control strength; lower lets it add more real texture.
          image_url: dataUri,
          control_lora_image_url: dataUri,
          control_lora_strength: STRENGTH,
          prompt: PROMPT,
          negative_prompt: NEG,
          num_inference_steps: 40,
          guidance_scale: GUIDANCE,
          num_images: 1,
          output_format: 'png',
          enable_safety_checker: false,
        }
      : {
          image_url: dataUri,
          prompt: PROMPT,
          negative_prompt: NEG,
          strength: STRENGTH,
          num_inference_steps: 40,
          guidance_scale: GUIDANCE,
          num_images: 1,
          output_format: 'png',
          enable_safety_checker: false,
        }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 180_000)
  let data: FalResponse
  try {
    const res = await fetch(FAL_API, {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) { const b = await res.text().catch(() => ''); throw new Error(`Fal HTTP ${res.status}: ${b.slice(0, 300)}`) }
    data = (await res.json()) as FalResponse
  } finally { clearTimeout(timer) }

  const img = data.images?.[0] ?? data.image
  if (!img?.url) { console.error('Fal returned no image. Raw keys: ' + Object.keys(data).join(',')); process.exit(1) }
  const dl = await fetch(img.url)
  const buf = Buffer.from(await dl.arrayBuffer())
  const outPath = resolve(process.cwd(), OUT)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
  console.log(`[hybrid] saved: ${outPath} (${img.width}x${img.height}, ${buf.length} bytes, seed=${data.seed ?? '?'})`)
}

if (IS_MAIN) {
  main().catch((e) => { console.error('[hybrid] FAILED:', e instanceof Error ? e.message : String(e)); process.exit(1) })
}
