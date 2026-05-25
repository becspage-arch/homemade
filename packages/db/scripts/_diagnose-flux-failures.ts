/**
 * Diagnostic: pick 10 tutorials currently stuck on procedural-card (i.e.
 * Tutorial.heroImageStrategy = PROCEDURAL_CARD with a REJECTED_USED_PROCEDURAL
 * Media row attached) and call fal.ai Flux Schnell directly for each.
 * Captures the full HTTP status + response body so we can see why these
 * specific titles fail.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
import { prisma } from '../src'

const API = 'https://fal.run/fal-ai/flux/schnell'

function buildPrompt(title: string, category: string, ingredients: string[]): string {
  const isMindset = category === 'mindset'
  if (isMindset) {
    return (
      'Quiet contemplative still life. ' +
      `${title} concept. Cream and sage palette. ` +
      'Single candle, open notebook, or hands in soft light as appropriate. ' +
      'No faces. Magazine-quality editorial photography. ' +
      'Natural soft light, linen textures, slow-living atmosphere.'
    )
  }
  const ingredientHint = ingredients.length ? ` Key ingredients: ${ingredients.slice(0, 3).join(', ')}.` : ''
  return (
    'Editorial slow-living food photography. ' +
    `${title}.${ingredientHint} ` +
    'Warm natural light. Cream and sage palette. ' +
    'Linen and parchment textures. Composed on a wooden surface. ' +
    'No people. Shot from above or three-quarter angle as appropriate. ' +
    'Magazine-quality.'
  )
}

async function tryFlux(title: string, category: string, ingredients: string[]): Promise<{ ok: boolean; status: number; body: string }> {
  const key = process.env.FAL_KEY
  if (!key) return { ok: false, status: 0, body: 'FAL_KEY unset' }
  const prompt = buildPrompt(title, category, ingredients)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60_000)
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
      signal: ctrl.signal,
    })
    const body = await res.text()
    return { ok: res.ok, status: res.status, body: body.slice(0, 400) }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, status: 0, body: `fetch-throw: ${msg}` }
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const stuck = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      heroImageStrategy: 'PROCEDURAL_CARD',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excludedImageSources: true,
      category: { select: { slug: true } },
    },
    take: 10,
    orderBy: { slug: 'asc' },
  })
  console.log(`Found ${stuck.length} tutorials stuck on procedural. Trying Flux directly...\n`)
  for (const t of stuck) {
    const ingredients = await prisma.recipeIngredient.findMany({
      where: { tutorialId: t.id },
      select: { ingredient: { select: { name: true } } },
      orderBy: { position: 'asc' },
      take: 3,
    })
    const ingNames = ingredients.map((r) => r.ingredient.name.toLowerCase())
    const r = await tryFlux(t.title, t.category.slug, ingNames)
    console.log(`[${t.slug}] (${t.category.slug})`)
    console.log(`  title: ${t.title}`)
    console.log(`  excluded sources: ${(t.excludedImageSources ?? []).join(', ') || '(none)'}`)
    console.log(`  flux: ok=${r.ok} status=${r.status}`)
    console.log(`  body: ${r.body}`)
    console.log('')
  }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
