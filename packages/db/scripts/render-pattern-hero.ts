/**
 * Anchored-hero pipeline runner — for one craft PATTERN tutorial that
 * already has `chartDefinition`, produce BOTH images Rebecca signed off on:
 *
 *   1. CHART  — faithful finished-piece render from chartData (chart engine,
 *               stitch-exact, £0, no AI). This is also the img2img anchor.
 *   2. HERO   — that render laid into a shape-aware object base (folded
 *               stole / garment flat-lay / motif) then repainted photoreal
 *               by Flux dev img2img at strength 0.72 (Rebecca's pick).
 *
 * The HERO is gated: the orchestrating worker session Reads the candidate
 * and judges it against the render (right object? motif preserved? no
 * artefacts?). On a pass -> `commit`. On a fail or a Fal billing halt ->
 * `commit-fallback`, which uses the faithful render itself as the hero. No
 * procedural cards, no guesses.
 *
 * Modes (attempt-by-attempt, like sewing S-8b):
 *   list                      patterns with a chart + no anchored hero yet
 *   generate --slug X         render chart + base + img2img candidate -> local PNGs + sidecar
 *   commit   --slug X         upload HERO photo -> Media + tutorial.heroMediaId
 *   commit-fallback --slug X  upload faithful RENDER -> Media + tutorial.heroMediaId
 *
 * Idempotent: re-running skips rows whose hero Media is already from this
 * pipeline unless --force. Output PNGs: scripts/hero-out/<slug>/.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 12; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

import { r2Upload } from '../src/r2.js'
import { renderPattern, rasterise, defaultPalette } from '../../../apps/web/src/lib/crochet/renderer/index.js'
import { buildObjectBaseSvg, shapeFor, type HeroShape } from '../../../apps/web/src/lib/crochet/hero/object-base.js'
import { generateWithFluxImg2Img, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-img2img.js'
import type { ChartDefinition } from '../../../apps/web/src/lib/craft-charts/types.js'

const STRENGTH = 0.72
const SCRIPT_VERSION = 1
const OUT = resolve(__dirname, 'hero-out')
const HERO_PX = 1080
const HERO_SOURCE = 'flux-img2img-anchored'
const RENDER_SOURCE = 'in-house-chart-engine'

interface PatternMeta {
  id: string
  slug: string
  title: string
  category: string
  projectShape: string | null
  subCategory: string | null
  chartDefinition: unknown
  heroMediaId: string | null
  heroSource: string | null
}

function craftWord(category: string): string {
  if (category === 'knitting') return 'hand-knitted'
  if (category === 'needlework') return 'finished hand-embroidered'
  return 'hand-crocheted'
}

function colourWord(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('baby')) return 'soft pastel'
  if (/aran|oatmeal|natural|undyed|cream/.test(t)) return 'natural cream'
  if (/navy|blue/.test(t)) return 'denim blue'
  if (/grey|gray|charcoal/.test(t)) return 'heather grey'
  if (/rust|terracotta|autumn/.test(t)) return 'warm rust'
  if (/sage|green|forest/.test(t)) return 'sage green'
  if (/mustard|ochre|gold/.test(t)) return 'soft mustard'
  return 'dusky rose'
}

function heroPrompt(m: PatternMeta, shape: HeroShape): string {
  const craft = craftWord(m.category)
  const item = m.title.replace(/\s*\(.*$/, '').trim()
  const colour = colourWord(m.title)
  const tail =
    'on a clean pale neutral background. Soft natural daylight, gentle shadows. ' +
    'Realistic wool yarn and visible stitch texture. Photorealistic, sharp focus, no people, no hands, no text, no logos.'
  if (shape === 'garment-flatlay') {
    return `Professional flat-lay product photograph of a ${craft} ${item} in ${colour}, shown flat with sleeves spread, neckline and front edge visible. ${tail}`
  }
  if (shape === 'motif-flat') {
    return `Professional product photograph of a single finished ${craft} ${item} motif in ${colour}, blocked flat and centred. ${tail}`
  }
  return `Professional product photograph of a folded ${craft} ${item} in ${colour}, with the finished stitch pattern and edging clearly visible. ${tail}`
}

function slugDir(slug: string): string {
  const d = resolve(OUT, slug)
  if (!existsSync(d)) mkdirSync(d, { recursive: true })
  return d
}

async function loadPattern(slug: string): Promise<PatternMeta> {
  const { prisma } = await import('../src/index.js')
  const t = await prisma.tutorial.findFirst({
    where: { slug },
    select: {
      id: true, slug: true, title: true, projectShape: true,
      chartDefinition: true, heroMediaId: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
      hero: { select: { source: true } },
    },
  })
  if (!t) throw new Error(`Tutorial not found: ${slug}`)
  return {
    id: t.id, slug: t.slug ?? slug, title: t.title,
    category: t.category.slug, projectShape: t.projectShape,
    subCategory: t.subCategory?.slug ?? null,
    chartDefinition: t.chartDefinition, heroMediaId: t.heroMediaId,
    heroSource: t.hero?.source ?? null,
  }
}

/** Render chart PNG + object base PNG. Returns buffers + the prompt. */
async function renderAssets(m: PatternMeta) {
  if (!m.chartDefinition) throw new Error(`${m.slug} has no chartDefinition — generate the chart first`)
  const chart = m.chartDefinition as unknown as ChartDefinition
  const rendered = renderPattern(chart, { unitPx: 64, palette: defaultPalette() })
  if (!rendered.verify.ok) {
    console.warn(`[hero] ${m.slug} render verify issues: ${rendered.verify.issues.join('; ')}`)
  }
  const chartPng = await rasterise(rendered.svg, { width: HERO_PX, height: Math.round((rendered.height / rendered.width) * HERO_PX) })
  const tile = await rasterise(rendered.svg, { width: 260, height: 260 })
  const tileDataUri = `data:image/png;base64,${tile.toString('base64')}`

  const shape = shapeFor(m.projectShape, m.subCategory)
  const baseSvg = buildObjectBaseSvg({ shape, tileDataUri, accent: '#c98a99' })
  const basePng = await rasterise(baseSvg, { width: HERO_PX, height: HERO_PX })
  const prompt = heroPrompt(m, shape)
  return { chartPng, basePng, prompt, shape }
}

async function generate(slug: string): Promise<void> {
  const m = await loadPattern(slug)
  if (m.heroSource === HERO_SOURCE && !process.argv.includes('--force')) {
    console.log(`[hero] ${slug} already has an anchored hero. Skipping (use --force).`)
    return
  }
  const { chartPng, basePng, prompt, shape } = await renderAssets(m)
  const dir = slugDir(slug)
  writeFileSync(resolve(dir, `${slug}-chart.png`), chartPng)
  writeFileSync(resolve(dir, `${slug}-base.png`), basePng)

  let heroSaved = false
  try {
    const dataUri = `data:image/png;base64,${basePng.toString('base64')}`
    const r = await generateWithFluxImg2Img(dataUri, prompt, { strength: STRENGTH })
    const dl = await fetch(r.url, { headers: { 'User-Agent': 'Homemade/1.0 (https://homemade.education)' } })
    if (!dl.ok) throw new Error(`download ${dl.status}`)
    writeFileSync(resolve(dir, `${slug}-hero.png`), Buffer.from(await dl.arrayBuffer()))
    heroSaved = true
  } catch (err) {
    if (err instanceof FluxBillingError) {
      console.error('[hero] Fal billing exhausted — commit-fallback uses the render. Top up: https://fal.ai/dashboard/billing')
    } else {
      console.error(`[hero] img2img failed for ${slug}: ${err instanceof Error ? err.message : err}`)
    }
  }
  writeFileSync(resolve(dir, `${slug}.sidecar.json`), JSON.stringify({ slug, shape, prompt, strength: STRENGTH, heroSaved, generatedAt: new Date().toISOString() }, null, 2))
  console.log(`[hero] generated ${slug} shape=${shape} hero=${heroSaved ? 'ok' : 'FALLBACK-TO-RENDER'}`)
  console.log(`[hero]   chart: ${resolve(dir, `${slug}-chart.png`)}`)
  if (heroSaved) console.log(`[hero]   hero:  ${resolve(dir, `${slug}-hero.png`)}`)
}

async function commitMedia(m: PatternMeta, pngPath: string, source: string, reason: string): Promise<void> {
  const { prisma } = await import('../src/index.js')
  if (!existsSync(pngPath)) throw new Error(`missing PNG ${pngPath} — run generate first`)
  const buf = readFileSync(pngPath)
  const { key } = await r2Upload(buf, 'image/png', { filename: `${m.slug}-hero.png`, prefix: `${m.category}-pattern-heroes` })
  await prisma.$transaction(async (tx) => {
    const media = await tx.media.create({
      data: {
        r2Key: key, type: 'PHOTO', status: 'READY',
        filename: `${m.slug}-hero.png`, mimeType: 'image/png',
        width: HERO_PX, height: HERO_PX, bytes: buf.length,
        alt: `${m.title} — finished piece`,
        source, licenceCode: 'PROPRIETARY', requiresAttribution: false,
        verificationStatus: 'VERIFIED', verificationReason: reason, verifiedAt: new Date(),
      },
    })
    await tx.tutorial.update({ where: { id: m.id }, data: { heroMediaId: media.id, heroImageStrategy: 'AI_GENERATED' } })
    console.log(`[hero] committed ${m.slug} -> Media ${media.id} (source=${source})`)
  })
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const mode = args[0]
  const slugIdx = args.indexOf('--slug')
  const slug = slugIdx >= 0 ? args[slugIdx + 1] : undefined

  if (mode === 'list') {
    const { prisma } = await import('../src/index.js')
    const cats = await prisma.category.findMany({ where: { slug: { in: ['crochet', 'knitting', 'needlework'] } }, select: { id: true, slug: true } })
    for (const c of cats) {
      const rows = await prisma.tutorial.findMany({
        where: { categoryId: c.id, status: 'PUBLISHED', type: 'PATTERN' },
        select: { slug: true, chartDefinition: true, hero: { select: { source: true } } },
      })
      const ready = rows.filter((r) => r.chartDefinition != null && r.hero?.source !== HERO_SOURCE)
      console.log(`${c.slug}: ${ready.length} patterns with a chart + no anchored hero`)
      for (const r of ready.slice(0, 40)) console.log(`  ${r.slug}`)
    }
    await prisma.$disconnect(); return
  }

  if (!slug) throw new Error('--slug required')
  if (mode === 'generate') { await generate(slug) }
  else if (mode === 'commit') {
    const m = await loadPattern(slug)
    await commitMedia(m, resolve(slugDir(slug), `${slug}-hero.png`), HERO_SOURCE, `Anchored img2img hero (strength ${STRENGTH}), worker-vision verified against the chart render (v${SCRIPT_VERSION}).`)
  }
  else if (mode === 'commit-fallback') {
    const m = await loadPattern(slug)
    await commitMedia(m, resolve(slugDir(slug), `${slug}-chart.png`), RENDER_SOURCE, `Faithful chart-engine render used as hero (img2img rejected or unavailable) (v${SCRIPT_VERSION}).`)
  }
  else throw new Error(`unknown mode: ${mode}`)

  const { prisma } = await import('../src/index.js')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
