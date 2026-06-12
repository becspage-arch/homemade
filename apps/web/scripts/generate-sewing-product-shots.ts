/**
 * Sewing S-8b — autonomous AI product-shot worker for bag / home /
 * accessory SewingPatterns. Generates a secondary studio-product hero
 * via Fal Flux 1.1 Pro, hands the candidate off to the Claude Code
 * session for self-judging against a 4-point rubric, and on a passing
 * verdict commits it as a Media row linked from
 * SewingPattern.heroProductShotMediaId.
 *
 * Self-judging happens inside the orchestrating Claude Code session
 * (Claude vision via the Read tool). No @anthropic-ai/sdk calls live in
 * this script per the no-api-spend memory.
 *
 * Modes
 *   list                                — print every pattern still pending a product shot
 *   generate --slug X --attempt N       — generate ONE attempt, save PNG + sidecar locally, exit
 *   commit   --slug X --attempt N       — upload the saved PNG to R2 + write the Media row + link the pattern
 *   commit-existing --slug X --png P    — commit an arbitrary local PNG (used to re-use S-8b Part 1 test passes)
 *   fallback --slug X                   — mark heroProductShotFallback=true, increment attempts to 5
 *   summary                             — print per-sub-cat completion + fallback counts
 *
 * Idempotent: re-runs skip patterns whose heroProductShotMediaId is
 * already set (unless heroProductShotScriptVersion was bumped on the row
 * since the linked Media was created).
 *
 * Output locations (intermediate, per-attempt):
 *   apps/web/scripts/s8b-out/<slug>/<slug>-attempt-N.png
 *   apps/web/scripts/s8b-out/<slug>/<slug>-attempt-N.json
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let envDir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(envDir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(envDir); if (p === envDir) break; envDir = p
}

import { prisma, r2Upload } from '@homemade/db'
import type { SewingGarmentCategory } from '@prisma/client'
import { generateWithFluxPro, FluxBillingError } from '../src/lib/image-sourcing/flux-pro'

const OUTPUT_DIR = resolve(__dirname, 's8b-out')
const SCRIPT_VERSION = 1
const MAX_ATTEMPTS = 5
const ELIGIBLE_CATEGORIES: SewingGarmentCategory[] = ['BAGS', 'HOME', 'ACCESSORIES']
const FAL_COST_PER_CALL_GBP = 0.032
const CATALOGUE_SPEND_CEILING_GBP = 5

interface PickConfig {
  subject: string
  garmentDescription: string
  fabricHints: string[]
  paletteHint: string
}

interface AttemptStyleHint {
  angleAndComposition: string
  lighting: string
  background: string
  notes: string
}

// Five style variants — one per attempt, pushing distinct prompt levers.
// Attempt 4's "object isolated" wording recovered the men's-tie pick in
// the S-8b Part 1 calibration after attempts 1-3 framed only part of the
// tie; keep that ordering.
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
    background: 'pure neutral white background, very faint floor-shadow only',
    notes: 'realistic product photograph, no AI-illustration look, accurate hardware and stitching',
  },
  {
    angleAndComposition:
      'centred composition, slight three-quarter angle, object isolated and clearly the single subject',
    lighting: 'bright clean key light from front, secondary fill from the left',
    background: 'pure white seamless background',
    notes: 'photorealistic, no melted seams, no warped hardware, no extra straps or duplicate parts',
  },
  {
    angleAndComposition:
      'centred composition, classic three-quarter studio product angle, object perfectly upright and clearly identifiable',
    lighting: 'soft umbrella-style studio lighting, no harsh highlights',
    background: 'pure white seamless background',
    notes: 'highly realistic studio catalogue photograph, accurate proportions, no anatomy or melted-fabric artefacts',
  },
]

// Hand-tuned per-slug overrides for picks where the auto-derived prompt
// fell short during S-8b Part 1 calibration, or where a specific styling
// note materially helps Flux nail the shape (long thin items, items with
// hardware, etc.). Slugs not listed fall through to derivePick().
const PICK_OVERRIDES: Record<string, Partial<PickConfig>> = {
  'sewing-hair-scrunchie': {
    subject: 'a hair scrunchie',
    garmentDescription:
      'a soft fabric hair scrunchie, the gathered tube formed into a circle with the elastic hidden inside',
    fabricHints: ['cotton lawn', 'jersey knit'],
    paletteHint: 'dusty pink with a small floral print',
  },
  'sewing-mens-tie-standard': {
    subject: 'a finished necktie shown in its entirety',
    garmentDescription:
      "a classic men's silk necktie photographed in its full length, the entire tie from the wider apron at the top to the pointed tip at the bottom completely visible within the frame with generous margin above and below, no cropping",
    fabricHints: ['silk'],
    paletteHint: 'deep navy blue with a subtle woven texture',
  },
  'sewing-tote-bag-interfaced-handles': {
    subject: 'a tote bag',
    garmentDescription:
      'a structured cotton-canvas tote bag standing upright with two sturdy interfaced handles above the bag body',
    fabricHints: ['cotton canvas', 'duck cloth'],
    paletteHint: 'natural off-white canvas',
  },
  'sewing-pencil-case-zip': {
    subject: 'a zip-top pencil case',
    garmentDescription:
      'a small rectangular zip-top pencil case with squared box corners, lying flat with the zip closed at the top',
    fabricHints: ['cotton quilting'],
    paletteHint: 'sage green',
  },
  'sewing-simple-backpack-drawstring': {
    subject: 'a drawstring backpack',
    garmentDescription:
      'a simple drawstring backpack with a gathered top closure, two canvas shoulder straps hanging from the bottom corners up through the casing at the top',
    fabricHints: ['cotton canvas'],
    paletteHint: 'natural beige canvas with brown leather-look reinforcement patches',
  },
  'sewing-cushion-cover-envelope-back': {
    subject: 'a square cushion',
    garmentDescription:
      'a plain square cushion, roughly 45 by 45 centimetres, with a clean front panel, slight loft from the pad inside, viewed from the front',
    fabricHints: ['linen blend'],
    paletteHint: 'warm oatmeal linen',
  },
  'sewing-tea-towel-mitred-corners': {
    subject: 'a folded tea towel',
    garmentDescription:
      'a single folded linen tea towel with clearly visible mitred corners at the hem',
    fabricHints: ['linen'],
    paletteHint: 'natural unbleached linen with a thin pale-blue woven stripe',
  },
  'sewing-drum-lampshade-cover': {
    subject: 'a drum lampshade',
    garmentDescription:
      'a cylindrical drum lampshade, perfectly upright, fabric-covered with a clean visible seam down one side and tidy bias-bound top and bottom edges',
    fabricHints: ['light linen'],
    paletteHint: 'soft ivory linen',
  },

  // The remaining 18 picks — hand-tuned subject + fabric hints.
  // Auto-derive would also produce something workable but the explicit
  // subject keeps the rendered object unambiguous.
  'sewing-belt-d-ring-closure': {
    subject: 'a fabric belt with D-ring closure',
    garmentDescription:
      'a long flat fabric belt photographed coiled into a loose oval on the surface, two metal D-rings clearly visible at one end',
    fabricHints: ['cotton webbing'],
    paletteHint: 'natural khaki canvas',
  },
  'sewing-bow-tie-self-tie': {
    subject: 'a self-tie bow tie',
    garmentDescription:
      'a finished self-tie bow tie in classic shape, tied with even wings, the full tied bow centred and the strap loop visible behind',
    fabricHints: ['silk'],
    paletteHint: 'deep burgundy with a subtle woven texture',
  },
  'sewing-knit-headband-twist-front': {
    subject: 'a knit headband with twist front',
    garmentDescription:
      'a stretchy knit headband with a deliberate twist at the front, photographed flat in a soft oval shape on the surface',
    fabricHints: ['cotton jersey'],
    paletteHint: 'soft heather grey',
  },
  'sewing-knit-infinity-scarf': {
    subject: 'an infinity scarf',
    garmentDescription:
      'a knit infinity scarf, looped once into a soft figure-of-eight, laid flat with even folds',
    fabricHints: ['cotton jersey'],
    paletteHint: 'warm camel',
  },
  'sewing-snood-ribbed-cuffs': {
    subject: 'a snood with ribbed cuffs',
    garmentDescription:
      'a tubular knit snood with visible ribbed cuffs at top and bottom, photographed standing upright in a soft cylinder shape',
    fabricHints: ['heavy knit'],
    paletteHint: 'soft cream',
  },
  'sewing-sun-hat-wide-brim': {
    subject: 'a wide-brim sun hat',
    garmentDescription:
      'a wide-brim sun hat with a structured crown, photographed at a slight three-quarter angle, both crown and full brim visible',
    fabricHints: ['cotton canvas'],
    paletteHint: 'natural straw-coloured canvas with a thin grosgrain band',
  },
  'sewing-bucket-bag-magnetic-closure': {
    subject: 'a bucket bag',
    garmentDescription:
      'a soft-sided bucket bag with a rounded base and gathered top, a single shoulder strap, magnetic closure tab visible at the top',
    fabricHints: ['leather-look canvas'],
    paletteHint: 'warm tan',
  },
  'sewing-drawstring-storage-bag': {
    subject: 'a drawstring storage bag',
    garmentDescription:
      'a simple cylindrical drawstring storage bag, gathered top closed with cord, the bag standing upright on a flat surface',
    fabricHints: ['cotton calico'],
    paletteHint: 'natural unbleached cotton',
  },
  'sewing-makeup-pouch-boxed-corners': {
    subject: 'a makeup pouch',
    garmentDescription:
      'a small rectangular zip-top makeup pouch with visible boxed corners at each end, standing upright with the zip closed at the top',
    fabricHints: ['cotton with interfacing'],
    paletteHint: 'soft blush pink',
  },
  'sewing-project-bag-drawstring-handle': {
    subject: 'a project bag',
    garmentDescription:
      'a craft project bag with a drawstring top closure and a single sturdy fabric handle at one side, standing upright',
    fabricHints: ['cotton canvas'],
    paletteHint: 'natural beige canvas',
  },
  'sewing-sling-bag-adjustable-strap': {
    subject: 'a sling bag',
    garmentDescription:
      'a compact crossbody sling bag with a single adjustable strap looped behind, zip closure across the top, photographed standing',
    fabricHints: ['cotton canvas'],
    paletteHint: 'forest green',
  },
  'sewing-eyelet-curtain-heading': {
    subject: 'a single curtain panel',
    garmentDescription:
      'a single curtain panel hanging from a slim rod, the eyelet heading at the top clearly visible with even metal rings, the panel falling in soft folds',
    fabricHints: ['linen blend'],
    paletteHint: 'soft natural linen',
  },
  'sewing-pillowcase-housewife-french-seam': {
    subject: 'a pillowcase',
    garmentDescription:
      'a housewife-style pillowcase, plump from the pillow inside, laid flat, the tucked envelope opening visible at one short end',
    fabricHints: ['cotton percale'],
    paletteHint: 'crisp white',
  },
  'sewing-kitchen-apron-cross-back': {
    subject: 'a kitchen apron',
    garmentDescription:
      'a cross-back kitchen apron with full body and angled cross straps at the back, photographed flat with the cross straps clearly visible behind the body',
    fabricHints: ['linen'],
    paletteHint: 'warm oatmeal linen',
  },
  'sewing-pot-holder-oven-mitt-set': {
    subject: 'a matching pot holder and oven mitt set',
    garmentDescription:
      'a square quilted pot holder beside a matching oven mitt, both items in the same fabric, laid flat on the surface',
    fabricHints: ['quilted cotton'],
    paletteHint: 'soft sage green',
  },
  'sewing-rod-pocket-curtain-panel': {
    subject: 'a single curtain panel',
    garmentDescription:
      'a single rod-pocket curtain panel hanging from a slim rod, soft gathered folds at the top, fabric falling in even pleats',
    fabricHints: ['cotton'],
    paletteHint: 'soft natural linen',
  },
  'sewing-table-runner-mitred-border': {
    subject: 'a table runner',
    garmentDescription:
      'a long rectangular table runner laid flat, with a contrasting mitred-corner border framing the central panel',
    fabricHints: ['linen'],
    paletteHint: 'natural unbleached linen with a darker mitred border',
  },
  'sewing-throw-blanket-binding': {
    subject: 'a throw blanket',
    garmentDescription:
      'a folded throw blanket with a clean binding-finished edge, neat folded stack on the surface',
    fabricHints: ['wool'],
    paletteHint: 'warm rust',
  },
}

function looseSlugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

interface FabricEntry {
  type?: string
  notes?: string
  weight?: string
}

function derivePick(pattern: {
  slug: string
  name: string
  description: string | null
  garmentType: string | null
  recommendedFabrics: unknown
}): PickConfig {
  const subject = pattern.garmentType ? `a ${pattern.garmentType}` : `a ${pattern.name.toLowerCase()}`
  const desc = (pattern.description ?? pattern.name).trim()
  const fabrics = Array.isArray(pattern.recommendedFabrics)
    ? (pattern.recommendedFabrics as FabricEntry[])
    : []
  const fabricHints = fabrics
    .map((f) => (f?.type ?? '').trim())
    .filter((s) => s.length > 0)
    .slice(0, 2)
  return {
    subject,
    garmentDescription: desc,
    fabricHints: fabricHints.length ? fabricHints : ['cotton'],
    paletteHint: 'natural neutral tone',
  }
}

function getPick(pattern: {
  slug: string
  name: string
  description: string | null
  garmentType: string | null
  recommendedFabrics: unknown
}): PickConfig {
  const derived = derivePick(pattern)
  const override = PICK_OVERRIDES[pattern.slug] ?? {}
  return { ...derived, ...override }
}

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
    .map((s) => s.trim())
    .join(' ')
}

interface CliArgs {
  mode: 'list' | 'generate' | 'commit' | 'commit-existing' | 'fallback' | 'summary'
  slug?: string
  attempt?: number
  png?: string
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  let mode: CliArgs['mode'] | undefined
  let slug: string | undefined
  let attempt: number | undefined
  let png: string | undefined
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode') mode = args[++i] as CliArgs['mode']
    else if (args[i] === '--slug') slug = args[++i]
    else if (args[i] === '--attempt') attempt = Number(args[++i])
    else if (args[i] === '--png') png = args[++i]
  }
  if (!mode) throw new Error('missing --mode')
  if (mode === 'generate' || mode === 'commit') {
    if (!slug) throw new Error(`--slug required for --mode ${mode}`)
    if (!attempt || attempt < 1 || attempt > MAX_ATTEMPTS) {
      throw new Error(`--attempt must be 1..${MAX_ATTEMPTS}`)
    }
  }
  if (mode === 'commit-existing') {
    if (!slug) throw new Error('--slug required for commit-existing')
    if (!png) throw new Error('--png required for commit-existing')
  }
  if (mode === 'fallback' && !slug) {
    throw new Error('--slug required for --mode fallback')
  }
  return { mode, slug, attempt, png }
}

function slugDir(slug: string): string {
  const d = resolve(OUTPUT_DIR, slug)
  if (!existsSync(d)) mkdirSync(d, { recursive: true })
  return d
}

interface PatternRow {
  id: string
  slug: string
  name: string
  description: string | null
  garmentType: string | null
  garmentCategory: SewingGarmentCategory
  recommendedFabrics: unknown
  heroProductShotMediaId: string | null
  heroProductShotFallback: boolean
  heroProductShotAttempts: number
  heroProductShotScriptVersion: number
}

async function fetchPattern(slug: string): Promise<PatternRow> {
  const row = await prisma.sewingPattern.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      garmentType: true,
      garmentCategory: true,
      recommendedFabrics: true,
      heroProductShotMediaId: true,
      heroProductShotFallback: true,
      heroProductShotAttempts: true,
      heroProductShotScriptVersion: true,
    },
  })
  if (!row) throw new Error(`Pattern not found: ${slug}`)
  if (!ELIGIBLE_CATEGORIES.includes(row.garmentCategory)) {
    throw new Error(
      `Pattern ${slug} has garmentCategory=${row.garmentCategory}; only ${ELIGIBLE_CATEGORIES.join('/')} are eligible.`,
    )
  }
  return row
}

async function listPending(): Promise<void> {
  const rows = await prisma.sewingPattern.findMany({
    where: {
      garmentCategory: { in: ELIGIBLE_CATEGORIES },
      heroProductShotMediaId: null,
      heroProductShotFallback: false,
    },
    select: {
      slug: true,
      name: true,
      garmentCategory: true,
      heroProductShotAttempts: true,
    },
    orderBy: [{ garmentCategory: 'asc' }, { name: 'asc' }],
  })
  const all = await prisma.sewingPattern.findMany({
    where: { garmentCategory: { in: ELIGIBLE_CATEGORIES } },
    select: {
      heroProductShotMediaId: true,
      heroProductShotFallback: true,
      garmentCategory: true,
    },
  })
  console.log(`Pending: ${rows.length} / ${all.length}`)
  for (const r of rows) {
    console.log(
      `  [${r.garmentCategory}] ${r.slug} (attempts so far: ${r.heroProductShotAttempts}) — ${r.name}`,
    )
  }
  const committed = all.filter((r) => r.heroProductShotMediaId).length
  const fallbacks = all.filter((r) => r.heroProductShotFallback).length
  console.log(`Committed: ${committed}. Fallbacks: ${fallbacks}.`)
}

async function summary(): Promise<void> {
  const rows = await prisma.sewingPattern.findMany({
    where: { garmentCategory: { in: ELIGIBLE_CATEGORIES } },
    select: {
      slug: true,
      garmentCategory: true,
      heroProductShotMediaId: true,
      heroProductShotFallback: true,
      heroProductShotAttempts: true,
    },
  })
  const byCat: Record<string, { total: number; committed: number; fallback: number }> = {}
  for (const r of rows) {
    const k = r.garmentCategory
    byCat[k] ??= { total: 0, committed: 0, fallback: 0 }
    byCat[k].total++
    if (r.heroProductShotMediaId) byCat[k].committed++
    if (r.heroProductShotFallback) byCat[k].fallback++
  }
  console.log('S-8b catalogue state:')
  for (const k of Object.keys(byCat).sort()) {
    const c = byCat[k]!
    console.log(`  ${k}: ${c.committed}/${c.total} committed, ${c.fallback} fallback`)
  }
  const fallbacks = rows.filter((r) => r.heroProductShotFallback).map((r) => r.slug)
  if (fallbacks.length) {
    console.log('Fallback slugs:')
    for (const s of fallbacks) console.log(`  ${s}`)
  }
}

async function generate(slug: string, attempt: number): Promise<void> {
  const pattern = await fetchPattern(slug)
  if (pattern.heroProductShotMediaId && pattern.heroProductShotScriptVersion >= SCRIPT_VERSION) {
    console.log(`[s8b] ${slug} already has a product shot at scriptVersion ${pattern.heroProductShotScriptVersion}. Skipping.`)
    return
  }
  if (pattern.heroProductShotFallback) {
    console.log(`[s8b] ${slug} marked fallback. Skipping.`)
    return
  }
  if (attempt > MAX_ATTEMPTS) throw new Error(`attempt ${attempt} exceeds max ${MAX_ATTEMPTS}`)

  const pick = getPick(pattern)
  const style = ATTEMPT_STYLES[attempt - 1]!
  const prompt = buildPrompt(pick, style)
  console.log(`[s8b] slug=${slug} attempt=${attempt}`)
  console.log(`[s8b] prompt: ${prompt}`)

  const t0 = Date.now()
  let result
  try {
    result = await generateWithFluxPro(prompt)
  } catch (err) {
    if (err instanceof FluxBillingError) {
      console.error('[s8b] Fal billing exhausted. Halting. Top up at https://fal.ai/dashboard/billing')
      process.exit(2)
    }
    throw err
  }
  const dl = await fetch(result.url, {
    headers: {
      'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
      Accept: 'image/*,*/*;q=0.8',
    },
  })
  if (!dl.ok) throw new Error(`Image download failed: ${dl.status}`)
  const buf = Buffer.from(await dl.arrayBuffer())
  const tookMs = Date.now() - t0

  const dir = slugDir(slug)
  const pngPath = resolve(dir, `${slug}-attempt-${attempt}.png`)
  const jsonPath = resolve(dir, `${slug}-attempt-${attempt}.json`)
  writeFileSync(pngPath, buf)
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        slug,
        attempt,
        prompt,
        style,
        pickResolvedFrom: PICK_OVERRIDES[slug] ? 'override' : 'derived',
        falUrl: result.url,
        falModel: 'fal-ai/flux-pro/v1.1',
        width: result.width,
        height: result.height,
        seed: result.seed,
        bytes: buf.length,
        tookMs,
        estCostGbp: FAL_COST_PER_CALL_GBP,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  )
  console.log(`[s8b] saved PNG: ${pngPath}`)
  console.log(`[s8b] sidecar: ${jsonPath}`)
  console.log(`[s8b] took=${tookMs}ms bytes=${buf.length} estCostGbp=${FAL_COST_PER_CALL_GBP}`)
}

async function commit(slug: string, attempt: number): Promise<void> {
  const pattern = await fetchPattern(slug)
  if (pattern.heroProductShotMediaId && pattern.heroProductShotScriptVersion >= SCRIPT_VERSION) {
    console.log(`[s8b] ${slug} already has heroProductShotMediaId. Refusing to overwrite without scriptVersion bump.`)
    return
  }
  const dir = slugDir(slug)
  const pngPath = resolve(dir, `${slug}-attempt-${attempt}.png`)
  const jsonPath = resolve(dir, `${slug}-attempt-${attempt}.json`)
  if (!existsSync(pngPath)) throw new Error(`No PNG at ${pngPath}; run --mode generate first.`)
  const sidecar = existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath, 'utf-8')) : null
  await commitImpl({
    pattern,
    pngPath,
    promptUsed: sidecar?.prompt ?? null,
    attemptsToRecord: attempt,
    sourceLabel: 'flux-product-shot',
  })
}

async function commitExisting(slug: string, pngPath: string): Promise<void> {
  const pattern = await fetchPattern(slug)
  if (pattern.heroProductShotMediaId && pattern.heroProductShotScriptVersion >= SCRIPT_VERSION) {
    console.log(`[s8b] ${slug} already has heroProductShotMediaId. Refusing to overwrite without scriptVersion bump.`)
    return
  }
  if (!existsSync(pngPath)) throw new Error(`No PNG at ${pngPath}`)
  // Try to pick up the prompt from the sibling sidecar (test-batch layout).
  const sibling = pngPath.replace(/\.png$/i, '.json')
  let promptUsed: string | null = null
  let attemptInferred = 1
  if (existsSync(sibling)) {
    const j = JSON.parse(readFileSync(sibling, 'utf-8'))
    promptUsed = j.prompt ?? null
    attemptInferred = typeof j.attempt === 'number' ? j.attempt : 1
  }
  await commitImpl({
    pattern,
    pngPath,
    promptUsed,
    attemptsToRecord: attemptInferred,
    sourceLabel: 'flux-product-shot',
  })
}

async function commitImpl(args: {
  pattern: PatternRow
  pngPath: string
  promptUsed: string | null
  attemptsToRecord: number
  sourceLabel: string
}): Promise<void> {
  const { pattern, pngPath, promptUsed, attemptsToRecord, sourceLabel } = args
  const buf = readFileSync(pngPath)
  const filename = `${pattern.slug}-product-shot.png`
  const { key, publicUrl } = await r2Upload(buf, 'image/png', {
    filename,
    prefix: 'sewing/product-shots',
  })
  console.log(`[s8b] uploaded to R2: ${publicUrl}`)

  await prisma.$transaction(async (tx) => {
    const media = await tx.media.create({
      data: {
        r2Key: key,
        type: 'PHOTO',
        kind: 'HERO_PRODUCT_SHOT',
        status: 'READY',
        filename: basename(pngPath),
        mimeType: 'image/png',
        width: 1024,
        height: 1280,
        bytes: buf.length,
        source: sourceLabel,
        sourceUrl: null,
        creatorName: null,
        licenceCode: 'PROPRIETARY',
        licenceUrl: null,
        requiresAttribution: false,
        verificationStatus: 'VERIFIED',
        verificationReason: 'Claude vision judged pass against 4-point rubric (S-8b).',
        verifiedAt: new Date(),
      },
    })
    await tx.sewingPattern.update({
      where: { id: pattern.id },
      data: {
        heroProductShotMediaId: media.id,
        heroProductShotPrompt: promptUsed,
        heroProductShotAttempts: attemptsToRecord,
        heroProductShotFallback: false,
        heroProductShotScriptVersion: SCRIPT_VERSION,
      },
    })
    console.log(`[s8b] committed ${pattern.slug} -> Media ${media.id}`)
  })
}

async function fallback(slug: string): Promise<void> {
  const pattern = await fetchPattern(slug)
  await prisma.sewingPattern.update({
    where: { id: pattern.id },
    data: {
      heroProductShotFallback: true,
      heroProductShotAttempts: MAX_ATTEMPTS,
      heroProductShotScriptVersion: SCRIPT_VERSION,
    },
  })
  console.log(`[s8b] ${slug} marked fallback`)
}

async function main(): Promise<void> {
  const args = parseArgs()
  switch (args.mode) {
    case 'list':
      await listPending()
      break
    case 'summary':
      await summary()
      break
    case 'generate':
      await generate(args.slug!, args.attempt!)
      break
    case 'commit':
      await commit(args.slug!, args.attempt!)
      break
    case 'commit-existing':
      await commitExisting(args.slug!, args.png!)
      break
    case 'fallback':
      await fallback(args.slug!)
      break
    default:
      throw new Error(`Unknown mode: ${args.mode}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().then(() => process.exit(1))
  })
