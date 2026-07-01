/**
 * Needlework illustration-guided engine — driver.
 *
 * Flux illustration -> `bitmapToStitches` (src/lib/needlework/illustration-engine, the
 * reusable pure core) -> loom `renderHero`. With `--publish` it persists end-to-end
 * through the SAME pipeline as needlework-seed-pattern.ts (Media + buildPatternDocument
 * + toStoredVectorData + NeedleworkPattern) so the design goes live on its page.
 *
 *   cd apps/web && npx tsx scripts/needlework-paint.ts <slug ...> [--none] [--publish] [--rerender]
 *
 * --none = frameless (else round->hoop). --publish = write to DB + R2 (UNLISTED house
 * pattern). Run from the MAIN checkout (needs node_modules + @homemade/db). Build-time
 * tooling: tsconfig-excluded. See NEEDLEWORK_ENGINE.md for the full process.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
function loadEnv(path: string): void {
  try { for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
    if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
  } } catch { /* shell env */ }
}
loadEnv('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')

import sharp from 'sharp'
import { fluxIllustration } from '../src/lib/studio/generation/sources'
import { bitmapToStitches } from '../src/lib/needlework/illustration-engine'
import { buildPatternDocument } from '../src/lib/needlework/engine/document'
import { toStoredVectorData, type NeedleworkSurfacePattern } from '../src/lib/needlework/pattern'
import { renderHero } from './loom-render-hero'
import { r2UploadScript } from './import-lib/r2-script'

const OUT = resolve(process.cwd(), '../../.loom-scratch/needlework/paint')
const FABRIC = '#ece4d2'

interface Job {
  slug: string
  prompt: string
  name?: string
  description?: string
  widthMm?: number
  mode?: 'dense' | 'line'
  frame?: 'round' | 'square' | 'rect'
  tameWarm?: boolean
  detail?: boolean
  bleed?: boolean
}
const PLAIN = ', centered, filling the frame, plain pale cream background, no text, no border'
const DELICATE = ', thin clean dark outlines, soft watercolour colours, centered, plain off-white background, lots of negative space, no text'
const JOBS: Record<string, Job> = {
  fox: { slug: 'fox', name: 'Red Fox', description: 'A red fox sitting alert, worked in bold directional long-and-short fur.', prompt: 'a highly detailed naturalistic illustration of a single red fox sitting and facing forward, fluffy fur, bright amber eyes, bushy tail, soft woodland colours' + PLAIN, frame: 'rect', widthMm: 250 },
  peacock: { slug: 'peacock', name: 'Peacock in Full Display', description: 'A peacock with its tail fanned in iridescent blue, teal and gold — a symmetrical showpiece.', prompt: 'a stunning highly detailed illustration of a peacock with its tail fanned out, iridescent blue and teal and gold feathers with eye spots, ornate, symmetrical' + PLAIN, frame: 'round', widthMm: 280 },
  cat: { slug: 'cat', name: 'Sleeping Cat', description: 'A cosy ginger cat curled asleep, worked in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a fluffy ginger cat curled up asleep, soft fur, cosy' + PLAIN, frame: 'square', widthMm: 240 },
  hare: { slug: 'hare', name: 'Brown Hare', description: 'A brown hare sitting alert in profile, with soft directional fur and whiskers.', prompt: 'a highly detailed naturalistic illustration of a brown hare sitting alert in profile, soft fur, long ears' + PLAIN, frame: 'round', widthMm: 200 },
  robin: { slug: 'robin', name: 'Robin & Berries', description: 'A plump robin on a berried twig, in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a plump European robin perched on a twig with a few red berries, orange-red breast' + PLAIN, frame: 'round', widthMm: 165 },
  kingfisher: { slug: 'kingfisher', name: 'Kingfisher', description: 'A kingfisher in jewel-bright plumage — electric blue and copper, in fine thread painting.', prompt: 'a highly detailed naturalistic illustration of a kingfisher bird perched, vivid electric blue back and bright orange belly' + PLAIN, frame: 'rect', widthMm: 230 },
  cottage: { slug: 'cottage', name: 'Thatched Cottage Garden', description: 'A thatched English cottage with a lush flower garden — a full stitched scene.', prompt: 'a highly detailed naturalistic illustration of a thatched english cottage with a lush cottage flower garden, path and trees under a soft blue sky' + PLAIN, frame: 'rect', widthMm: 320 },
  peony: { slug: 'peony', name: 'Peony Bloom', description: 'A single blush-pink peony in soft, layered long-and-short shading on a hoop.', prompt: 'a highly detailed naturalistic illustration of a single large blush-pink peony bloom with soft layered petals and green leaves' + PLAIN, frame: 'round', widthMm: 150 },
  jar: { slug: 'jar', name: 'Wildflower Jar', description: 'A little jar of mixed wildflowers — poppies, cornflowers and daisies — in delicate thread painting on bare linen.', prompt: 'a simple delicate botanical illustration of a small glass mason jar holding a little bunch of mixed wildflowers, poppies cornflowers daisies' + DELICATE, mode: 'line', frame: 'rect', widthMm: 200 },
  sprig: { slug: 'sprig', name: 'Lavender Sprig', description: 'A few lavender stems and small wildflowers tied with twine — a delicate line motif on bare linen.', prompt: 'a simple delicate botanical illustration of three lavender stems and two small wildflowers tied with twine' + DELICATE, mode: 'line', frame: 'round', widthMm: 150 },
  facecrown: { slug: 'facecrown', name: 'Flower Crown', description: 'A fine-art portrait crowned with roses and poppies, in soft thread painting.', prompt: "a beautiful fine-art portrait illustration of a young woman's face looking forward, adorned with a lush crown of colourful flowers - roses, poppies and blooms - woven into her hair, soft painterly naturalistic style, warm skin tones, delicate facial features, gentle even lighting" + PLAIN, frame: 'rect', widthMm: 210, tameWarm: true, detail: true },
  dogwine: { slug: 'dogwine', name: 'Rosé Dachshund', description: 'A chic dachshund in heart sunglasses with a glass of rosé — a full stitched scene.', prompt: 'a whimsical fashionable painterly illustration of a dachshund dog wearing pink heart-shaped sunglasses, sitting at a little table with a glass of rosé wine and a stack of colourful books, hot pink room, bold and stylish, highly detailed, full scene filling the whole frame, no text', frame: 'rect', widthMm: 230, tameWarm: true, detail: true, bleed: true },
  // ---- 2026-06-30 batch: fresh subjects, new themes (generate + gate + cull) ----
  bee: { slug: 'bee', name: 'Bumblebee & Lavender', description: 'A fuzzy bumblebee resting on a lavender sprig, in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a single fuzzy bumblebee resting on a sprig of purple lavender, soft striped velvety body, delicate translucent wings' + PLAIN, frame: 'round', widthMm: 165, detail: true },
  mushroomscene: { slug: 'mushroomscene', name: 'Toadstool Glade', description: 'A cluster of red-capped toadstools among moss and ferns — a dense woodland thread-painting.', prompt: 'a highly detailed naturalistic illustration of a cluster of red toadstool mushrooms with white spots, growing among soft green moss, ferns and tiny woodland flowers on the forest floor, rich and lush' + PLAIN, frame: 'round', widthMm: 190, tameWarm: true, detail: true },
  seaturtle: { slug: 'seaturtle', name: 'Sea Turtle', description: 'A green sea turtle gliding through teal water, worked in flowing long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a green sea turtle swimming, intricately patterned shell, flippers spread, soft teal and aqua water tones' + PLAIN, frame: 'round', widthMm: 200, detail: true },
  hollywreath: { slug: 'hollywreath', name: 'Holly Wreath', description: 'A festive wreath of holly, red berries and pinecones — a rich circular composition.', prompt: 'a highly detailed naturalistic illustration of a round christmas wreath made of glossy green holly leaves, clusters of red berries, pinecones and sprigs of eucalyptus, lush and full, circular' + PLAIN, frame: 'round', widthMm: 200, tameWarm: true, detail: true },
  bluetit: { slug: 'bluetit', name: 'Blue Tit', description: 'A single blue tit perched on a twig — a simple, bright garden-bird motif.', prompt: 'a highly detailed naturalistic illustration of a single blue tit bird perched on a small twig, bright blue cap and wings, yellow breast, white cheeks' + PLAIN, frame: 'round', widthMm: 150 },
  // ---- 2026-06-30 batch 2: new themes across the full range ----
  highlandcow: { slug: 'highlandcow', name: 'Highland Cow', description: 'A shaggy Highland cow with a flower crown — a rich, characterful showpiece.', prompt: 'a highly detailed naturalistic illustration of a highland cow with a long shaggy ginger fringe over its eyes, big curved horns, wearing a small crown of wildflowers' + PLAIN, frame: 'round', widthMm: 240, detail: true },
  whale: { slug: 'whale', name: 'Humpback Whale', description: 'A humpback whale gliding through sunlit ocean — a full underwater scene.', prompt: 'a beautiful painterly illustration of a humpback whale gliding through deep blue-green ocean water with rays of sunlight from above, small fish, full underwater scene filling the frame, no text', frame: 'rect', widthMm: 260, detail: true, bleed: true },
  goldenretriever: { slug: 'goldenretriever', name: 'Golden Retriever', description: 'A golden retriever head portrait in soft golden long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a golden retriever dog head and shoulders portrait, soft golden fur, warm brown eyes, gentle happy expression' + PLAIN, frame: 'round', widthMm: 200, detail: true, tameWarm: true },
  dragon: { slug: 'dragon', name: 'Baby Dragon', description: 'A cute baby dragon curled around a flower, in jewel-toned scales.', prompt: 'a cute friendly baby dragon curled up around a single flower, smooth jewel-toned green and teal scales, big friendly eyes, tiny wings, whimsical' + PLAIN, frame: 'round', widthMm: 180, detail: true },
  fairymushroom: { slug: 'fairymushroom', name: 'Toadstool Fairy', description: 'A little fairy resting on a red toadstool in a glowing woodland.', prompt: 'a whimsical illustration of a small delicate fairy with translucent wings sitting on a red toadstool with white spots in a glowing woodland clearing with tiny flowers and ferns' + PLAIN, frame: 'round', widthMm: 200, detail: true, tameWarm: true },
  lighthouse: { slug: 'lighthouse', name: 'Cliffside Lighthouse', description: 'A red-and-white lighthouse on a cliff at dusk — a full coastal scene.', prompt: 'a painterly illustration of a red and white striped lighthouse on a rocky cliff at golden dusk, calm sea and a dramatic warm sky, full scene filling the frame, no text', frame: 'rect', widthMm: 240, detail: true, bleed: true },
  monstera: { slug: 'monstera', name: 'Monstera in a Pot', description: 'A potted monstera with glossy split leaves — a fresh houseplant motif.', prompt: 'a highly detailed illustration of a potted monstera deliciosa houseplant in a terracotta pot, large glossy split green leaves' + PLAIN, frame: 'round', widthMm: 200, detail: true },
  pumpkins: { slug: 'pumpkins', name: 'Autumn Pumpkins', description: 'A cluster of autumn pumpkins and gourds with leaves and berries.', prompt: 'a highly detailed naturalistic illustration of a cluster of autumn pumpkins and gourds in orange, cream and pale green, with autumn leaves, rosehips and berries' + PLAIN, frame: 'round', widthMm: 210, detail: true },
  cupcake: { slug: 'cupcake', name: 'Frosted Cupcake', description: 'A single frosted cupcake with sprinkles — a simple, sweet motif.', prompt: 'a cute illustration of a single cupcake with swirled pink frosting, colourful sprinkles and a cherry on top' + PLAIN, frame: 'round', widthMm: 150, tameWarm: true },
  fernstem: { slug: 'fernstem', name: 'Fern Frond', description: 'A single fern frond worked in delicate line stitching on bare linen.', prompt: 'a simple delicate botanical illustration of a single green fern frond with fine leaflets' + DELICATE, mode: 'line', frame: 'round', widthMm: 150 },
}

function flag(name: string): boolean { return process.argv.includes(`--${name}`) }
function titleCase(s: string): string { return s.replace(/(^|-)([a-z])/g, (_, p, c) => (p ? ' ' : '') + c.toUpperCase()) }

async function fluxCached(job: Job): Promise<Buffer> {
  mkdirSync(OUT, { recursive: true })
  const p = resolve(OUT, `${job.slug}.flux.png`)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(job.prompt, { imageSize: 'square_hd' })
  writeFileSync(p, src.buffer)
  return src.buffer
}

async function run(job: Job): Promise<void> {
  const publish = flag('publish')
  const refreshDoc = flag('refresh-doc')
  const frameless = flag('none')
  const img = await fluxCached(job)
  const WORK = 460
  const { data, info } = await sharp(img).resize(WORK, WORK, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })

  const engineFrame = frameless ? 'none' : (job.frame === 'round' ? 'round' : job.frame ?? 'round')
  const { stitchedElements, frameType, finishedSizeMm, outline } = bitmapToStitches(data, info.width, info.height, {
    mode: job.mode, frame: engineFrame, bleed: job.bleed, detail: job.detail, widthMm: job.widthMm,
  })
  console.log(`[${job.slug}] ${job.mode ?? 'dense'} · ${frameType} · ${stitchedElements.length} stitches · ${outline.length} outline paths · ${Math.round(finishedSizeMm.width)}x${Math.round(finishedSizeMm.height)}mm`)

  // --refresh-doc: rebuild the document + outline + vectorData on the EXISTING
  // row and re-store, WITHOUT re-rendering the hero. The engine is deterministic
  // from the cached Flux image, so the stored hero still matches these elements.
  if (refreshDoc) {
    const { prisma } = await import('@homemade/db')
    const existing = await prisma.needleworkPattern.findUnique({ where: { slug: job.slug }, select: { id: true } })
    if (!existing) throw new Error(`no NeedleworkPattern row for slug "${job.slug}" — publish it first`)
    const name = job.name ?? titleCase(job.slug)
    const canonical: NeedleworkSurfacePattern = {
      stitchedElements, finishedSizeMm, fabricSpec: { material: 'linen', colourHex: FABRIC, count: null },
      defaultThread: { type: 'stranded-cotton', weight: '3-strand' }, frameType, outline,
    }
    const document = buildPatternDocument(stitchedElements, finishedSizeMm, { title: name, outline })
    const { vectorData, regionAnnotations } = toStoredVectorData(canonical, { document })
    await prisma.needleworkPattern.update({
      where: { id: existing.id },
      data: {
        vectorData: vectorData as unknown as object,
        regionAnnotations: regionAnnotations as unknown as object,
        colourCount: document.flossKey.length,
      },
    })
    console.log(`[${job.slug}] REFRESHED doc on NeedleworkPattern ${existing.id} — ${document.flossKey.length} colours, ${outline.length} outline paths (hero untouched)`)
    await prisma.$disconnect()
    return
  }

  const hero = await renderHero(
    { name: job.slug, stitchedElements, finishedSizeMm, fabricHex: FABRIC, frameType,
      defaultThread: { type: 'stranded-cotton', weight: '3-strand' }, strands: 3 },
    { persist: publish, tameWarm: job.tameWarm ?? false, r2Prefix: 'patterns/needlework' },
  )

  if (!publish) {
    const { publicUrl } = await r2UploadScript(readFileSync(hero.localHeroPath), 'image/png', { prefix: 'scratch-review' })
    console.log(`[${job.slug}] preview: ${publicUrl}`)
    return
  }

  // ---- publish: persist through the proven NeedleworkPattern pipeline ----
  const { prisma, Visibility } = await import('@homemade/db')
  if (!hero.r2) throw new Error('renderHero did not persist to R2')
  // File into the surface-embroidery shelf. The live needlework category grid
  // only shows rows with a sub-category in the needlework category
  // (pattern-layout.tsx needleworkWhere) — an unfiled row is invisible on-site.
  const nwCat = await prisma.category.findUnique({ where: { slug: 'needlework' }, select: { id: true } })
  const nwSub = nwCat ? await prisma.subCategory.findFirst({ where: { categoryId: nwCat.id, slug: 'surface-embroidery' }, select: { id: true } }) : null
  if (!nwSub) throw new Error('surface-embroidery sub-category not found for needlework')
  const name = job.name ?? titleCase(job.slug)
  const meta = await sharp(hero.localHeroPath).metadata()
  const media = await prisma.media.create({
    data: {
      type: 'PHOTO', mimeType: 'image/png', filename: `${job.slug}-hero.png`,
      alt: `${name} — finished embroidery`, width: meta.width ?? hero.width, height: meta.height ?? hero.height,
      bytes: readFileSync(hero.localHeroPath).length, status: 'READY', r2Key: hero.r2.key,
      source: 'loom-render', requiresAttribution: false,
    },
    select: { id: true },
  })
  const canonical: NeedleworkSurfacePattern = {
    stitchedElements, finishedSizeMm, fabricSpec: { material: 'linen', colourHex: FABRIC, count: null },
    defaultThread: { type: 'stranded-cotton', weight: '3-strand' }, frameType, outline,
  }
  const document = buildPatternDocument(stitchedElements, finishedSizeMm, { title: name, outline })
  const { vectorData, regionAnnotations } = toStoredVectorData(canonical, { document })
  const data2 = {
    slug: job.slug, name, description: job.description ?? null,
    discipline: 'SURFACE_EMBROIDERY' as never, patternFormat: 'SURFACE_VECTOR' as never,
    vectorData: vectorData as unknown as object, regionAnnotations: regionAnnotations as unknown as object,
    fabricSpec: canonical.fabricSpec as unknown as object,
    frameType: (frameType === 'NONE' ? null : frameType) as never,
    threadTypes: ['stranded-cotton'], colourCount: document.flossKey.length,
    difficulty: 'INTERMEDIATE' as never, heroMediaId: media.id, thumbnailMediaId: media.id,
    subCategoryId: nwSub.id,
    visibility: Visibility.UNLISTED, publishedAt: new Date(),
  }
  const pattern = await prisma.needleworkPattern.upsert({ where: { slug: job.slug }, create: data2, update: data2, select: { id: true } })
  console.log(`[${job.slug}] PUBLISHED NeedleworkPattern ${pattern.id} (UNLISTED) — ${document.flossKey.length} colours`)
  console.log(`[${job.slug}] live at /needlework/patterns/${job.slug}`)
  await prisma.$disconnect()
}

async function main(): Promise<void> {
  const want = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  for (const slug of (want.length ? want : ['fox'])) { const j = JOBS[slug]; if (!j) { console.error('no job', slug); continue } await run(j) }
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
