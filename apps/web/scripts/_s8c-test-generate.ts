/**
 * S-8c — technical fashion flat generator for the 19 garment patterns.
 *
 * Mirrors S-8b's shape: one attempt per invocation, PNG + sidecar JSON
 * saved to disk, Claude Code session judges visually and either accepts
 * or re-runs with the next style variant.
 *
 *   tsx scripts/_s8c-test-generate.ts --slug freesewing-bella-body-block --attempt 1
 *
 * Different from S-8b in two ways:
 *   1. The prompt template asks for a technical fashion flat
 *      illustration (black line art, white background, front + back side
 *      by side), not a studio product photograph.
 *   2. Image size 1024x1024 — square so front + back read at equal
 *      width with breathing room. Flux Pro v1.1.
 *
 * No SDK calls from this script. Self-judging happens inside the session.
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
const OUTPUT_DIR = resolve(__dirname, 's8c-test-output')

interface PickConfig {
  slug: string
  /** Short subject for the headline (e.g. "a fitted bodice"). */
  subject: string
  /** Detailed description of the finished garment silhouette. */
  silhouetteDescription: string
  /** Construction lines that should be visible (collar, darts, pockets). */
  constructionHints: string[]
  /** Gender / body shape hint. */
  fitHint: string
}

const PICKS: PickConfig[] = [
  {
    slug: 'freesewing-bella-body-block',
    subject: 'a fitted bodice block',
    silhouetteDescription:
      "a women's fitted bodice block, sleeveless, ending at the natural waist, with a V-neck front and a rounded jewel neckline at the back",
    constructionHints: ['centre back seam', 'side seam from armhole to waist', 'shoulder seam'],
    fitHint: "women's fitted woven bodice",
  },
  {
    slug: 'freesewing-brian-body-block',
    subject: "a men's body block",
    silhouetteDescription:
      "a men's fitted body block top, hip-length, with set-in long sleeves, a small round crew neckline at the front and back",
    constructionHints: ['centre back seam', 'shoulder seam', 'set-in sleeve seam at the armhole', 'side seam'],
    fitHint: "men's fitted woven body block",
  },
  {
    slug: 'freesewing-aaron-knit-a-shirt',
    subject: 'a knit A-shirt',
    silhouetteDescription:
      'a unisex knit A-shirt with narrow shoulder straps, a wide scooped front neckline that comfortably clears the head, a lower scoop at the back, deep armholes, and a softly drapey hip-length body',
    constructionHints: ['narrow hem at the bottom', 'armhole binding', 'neckline binding'],
    fitHint: 'unisex knit jersey tank A-shirt',
  },
  {
    slug: 'freesewing-bee-bikini-top',
    subject: 'a bikini top',
    silhouetteDescription:
      "a women's bikini top with two triangular cups joined at the centre front, a band running around the underbust, and tie straps going up over the shoulders and around the back",
    constructionHints: ['band seam', 'centre front seam', 'neck tie straps'],
    fitHint: "women's swim bikini top",
  },
  {
    slug: 'freesewing-bent-body-block',
    subject: "a men's tailored body block",
    silhouetteDescription:
      "a men's tailored body block top, hip-length, with structured set-in long sleeves shaped at the elbow, a small round crew neckline",
    constructionHints: ['centre back seam', 'shoulder seam', 'two-piece tailored sleeve seam', 'side seam'],
    fitHint: "men's tailored woven body block",
  },
  {
    slug: 'freesewing-carlita-coat',
    subject: "a women's tailored coat",
    silhouetteDescription:
      "a women's long tailored coat, ending mid-thigh, with notched lapel collar, double-breasted button front, set-in long sleeves, two welt chest pockets and two larger hip welt pockets, and a back belt",
    constructionHints: ['lapel notch', 'double row of buttons', 'welt pockets at chest and hip', 'back belt', 'centre back seam'],
    fitHint: "women's long tailored coat",
  },
  {
    slug: 'freesewing-carlton-coat',
    subject: "a men's tailored coat",
    silhouetteDescription:
      "a men's long tailored coat, ending mid-thigh, with notched lapel collar, double-breasted button front, set-in long sleeves, welt chest pockets and hip welt pockets, and a back belt",
    constructionHints: ['lapel notch', 'double row of buttons', 'welt pockets', 'back belt', 'centre back seam'],
    fitHint: "men's long tailored coat",
  },
  {
    slug: 'freesewing-cathrin-corset',
    subject: 'an underbust corset',
    silhouetteDescription:
      "a women's underbust corset, sitting from just under the bust line down to the hip line, with eleven curved vertical panel seams visible on the front, and back lacing with eyelets on the back",
    constructionHints: ['curved panel seams', 'back lacing with eyelets', 'top and bottom binding'],
    fitHint: "women's panelled underbust corset",
  },
  {
    slug: 'freesewing-charlie-chinos',
    subject: "men's chino trousers",
    silhouetteDescription:
      "men's chino trousers, straight legs from waist to ankle, with belt loops at the waistband, a fly front with one button, in-seam side pockets at the front, and two welt back pockets",
    constructionHints: ['belt loops', 'fly-front zip', 'in-seam front pockets', 'welt back pockets', 'side seam', 'centre back seam'],
    fitHint: "men's woven chinos",
  },
  {
    slug: 'freesewing-diana-draped-top',
    subject: "a women's draped knit top",
    silhouetteDescription:
      "a women's drapey knit top, hip-length, with set-in long sleeves and a low draped scoop neckline at the front, a higher neckline at the back",
    constructionHints: ['set-in sleeve seam', 'narrow hem at body and sleeves'],
    fitHint: "women's drapey knit top",
  },
  {
    slug: 'freesewing-huey-hoodie',
    subject: 'a zip-up hoodie',
    silhouetteDescription:
      "a unisex zip-up hoodie with an attached hood, set-in long sleeves with ribbed cuffs, a kangaroo pocket across the front, ribbed waistband, and a full-length centre front zip",
    constructionHints: ['hood seam at the centre top', 'centre front zip', 'kangaroo pocket', 'ribbed cuffs', 'ribbed waistband'],
    fitHint: 'unisex sweatshirt-fleece zip-up hoodie',
  },
  {
    slug: 'freesewing-noble-bodice',
    subject: 'a princess seam bodice',
    silhouetteDescription:
      "a women's fitted princess seam bodice block, sleeveless, ending at the natural waist, with a rounded scoop neckline at the front and a jewel neckline at the back, and curved princess seams running from the shoulder down through the bust to the waist",
    constructionHints: ['princess seams front and back', 'centre back seam', 'shoulder seam', 'side seam'],
    fitHint: "women's fitted woven bodice with princess seams",
  },
  {
    slug: 'freesewing-onyx-one-piece',
    subject: 'a one-piece jumpsuit',
    silhouetteDescription:
      'a unisex one-piece jumpsuit, full long-sleeved top joined at the waist to full-length straight-leg trousers, with a flat neckband at the neckline and a front zip from collar to waist',
    constructionHints: ['waist seam joining bodice and trousers', 'front zip from neck to waist', 'set-in sleeves', 'inseam', 'centre back seam'],
    fitHint: 'unisex one-piece jumpsuit',
  },
  {
    slug: 'freesewing-penelope-pencil-skirt',
    subject: 'a fitted pencil skirt',
    silhouetteDescription:
      "a women's fitted knee-length pencil skirt, narrow at the hem with a clean straight silhouette, with shaped darts at the waist front and back, and a centre back seam with a small kick vent at the hem",
    constructionHints: ['waistband', 'front and back darts', 'centre back seam', 'back vent at the hem'],
    fitHint: "women's fitted woven pencil skirt",
  },
  {
    slug: 'freesewing-sandy-circle-skirt',
    subject: 'a circle skirt',
    silhouetteDescription:
      "a women's flared circle skirt, knee-length, with a wide A-line silhouette that flares dramatically from a fitted waistband, the hem curving gently in a soft sweep at the side seams",
    constructionHints: ['waistband', 'centre back seam with zip', 'sweep curve at the hem'],
    fitHint: "women's flared woven circle skirt",
  },
  {
    slug: 'freesewing-simon-button-down-shirt',
    subject: "a men's button-down shirt",
    silhouetteDescription:
      "a men's tailored woven button-down shirt, hip-length, with a stand collar with collar points, a full button placket down the centre front with six buttons, set-in long sleeves with buttoned cuffs, a chest patch pocket, and a yoke seam across the upper back",
    constructionHints: ['stand collar with points', 'button placket with buttons', 'buttoned cuffs', 'back yoke seam', 'chest patch pocket'],
    fitHint: "men's tailored woven button-down shirt",
  },
  {
    slug: 'freesewing-titan-trouser-block',
    subject: 'a trouser block',
    silhouetteDescription:
      'a unisex trouser block, straight legs from the natural waist to the floor with a clean tailored silhouette, with shaped darts at the waist front and back, in-seam side pockets, a fly front, and a centre back seam',
    constructionHints: ['waistband', 'fly front', 'front and back darts', 'side seam', 'centre back seam', 'inseam'],
    fitHint: 'unisex tailored woven trousers',
  },
  {
    slug: 'freesewing-waralee-wrap-pants',
    subject: 'wrap pants',
    silhouetteDescription:
      'unisex wrap pants with wide flowing legs, a wrap-front waistband with long ties at the side, and a softly draped silhouette that overlaps at the front',
    constructionHints: ['wrap overlap at the front', 'long waistband ties at the side', 'wide leg silhouette'],
    fitHint: 'unisex flowing woven wrap pants',
  },
  {
    slug: 'sewing-kids-tshirt-nested-sizes',
    subject: "a children's t-shirt",
    silhouetteDescription:
      "a children's classic crew-neck t-shirt, short set-in sleeves, hip-length straight body, a small round crew neckline at the front and back",
    constructionHints: ['ribbed crew neck binding', 'set-in short sleeves', 'narrow hem at body and sleeves'],
    fitHint: "children's knit jersey crew-neck t-shirt",
  },
]

interface AttemptStyleHint {
  /** Which leg of the style space this variant pushes. */
  leverDescription: string
  /** Stroke / line treatment notes appended to the prompt. */
  lineNotes: string
  /** Layout notes (front + back arrangement). */
  layoutNotes: string
  /** Sanity guardrails per attempt. */
  guardrails: string
}

// Five style variants per attempt. Each pushes a different lever so we
// are not just re-rolling the same prompt with five seeds.
const ATTEMPT_STYLES: AttemptStyleHint[] = [
  {
    leverDescription: 'clean indie sewing pattern flat',
    lineNotes:
      'pure black lines on pure white background, uniform line weight, no shading, no fill, no colour, no texture',
    layoutNotes:
      'front view on the left, back view on the right, both views at the same scale, centred in the frame with generous white space around them',
    guardrails:
      'do not draw a body or mannequin, no model, no hands, no face, no text, no measurements, no labels, no logos',
  },
  {
    leverDescription: 'Big 4 pattern company line-art tab style',
    lineNotes:
      'clean technical drawing in pure black ink on white paper, consistent stroke weight, simple closed silhouette, no shading or hatching',
    layoutNotes:
      'two views side by side, front then back, both garments stand upright with the hem at the bottom, symmetrical and balanced',
    guardrails:
      'no fashion illustration figure, no body outline, no head, no arms, no legs visible separately, no text annotations',
  },
  {
    leverDescription: 'tech pack style technical flat',
    lineNotes:
      'minimalist black line drawing, clean 1.5px stroke weight, no gradient, no fill, no colour, no shadow',
    layoutNotes:
      'front and back of the same garment placed side by side, both views same height, both views proportionally accurate',
    guardrails:
      'never include a person or any body part, do not add text or numbers, do not add a colour fill or shading inside the garment outline',
  },
  {
    leverDescription: 'crisp vector illustration in fashion-flat style',
    lineNotes:
      'pure black vector lines, clean smooth bezier curves, even uniform line weight, no shading',
    layoutNotes:
      'two-up composition with front view left, back view right, equal scale, gentle vertical alignment',
    guardrails:
      'no model, no figure, no human anatomy at all, no text, no watermarks, no patterns or fabrics drawn inside',
  },
  {
    leverDescription: 'flat lay garment illustration',
    lineNotes:
      'black ink line drawing only, equal stroke weight throughout, closed clean silhouette, no inner shading',
    layoutNotes:
      'front view and back view shown side by side at identical scale, both centred vertically, plenty of white space',
    guardrails:
      'no person, no body parts, no model, no annotation text, no rulers or scales, no logos or labels',
  },
]

function buildPrompt(pick: PickConfig, style: AttemptStyleHint): string {
  const construction = pick.constructionHints.join(', ')
  return [
    `Technical fashion flat illustration of ${pick.subject}.`,
    `${pick.silhouetteDescription}.`,
    `Visible construction lines: ${construction}.`,
    `Garment type: ${pick.fitHint}.`,
    `Style: ${style.leverDescription}.`,
    `Line treatment: ${style.lineNotes}.`,
    `Layout: ${style.layoutNotes}.`,
    `${style.guardrails}.`,
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
        image_size: { width: 1024, height: 1024 },
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

  console.log(`[s8c-test] slug=${slug} attempt=${attempt}`)
  console.log(`[s8c-test] prompt: ${prompt}`)

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
  console.log(`[s8c-test] saved: ${pngPath}`)
  console.log(`[s8c-test] sidecar: ${jsonPath}`)
  console.log(`[s8c-test] took=${tookMs}ms bytes=${buf.length} estCostGbp=0.032`)
}

main().catch((e) => {
  console.error('[s8c-test] FAILED:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})
