/**
 * Seed ONE surface-embroidery pattern end-to-end, proving the wiring:
 *
 *   *.pattern.json (canonical StitchedElement[])
 *     -> renderHero()            photoreal hooped hero (Blender + Fal), -> R2
 *     -> Media row               persisted, same shape as the photo heroes
 *     -> buildPatternDocument()  floss key / stitch key / steps / SVG guides
 *     -> toStoredVectorData()    canonical dataset stored in vectorData (no migration)
 *     -> NeedleworkPattern       upserted, heroMediaId set, surfaced on the page
 *
 * The hero render is BUILD-TIME tooling (Blender + Fal on a generator box), like
 * the Fal photo-hero pipeline — never the live server.
 *
 * Re-runnable: an existing hero is reused unless `--rerender` is passed, so DB
 * fields can be corrected without re-spending Fal.
 *
 *   cd apps/web && npx tsx scripts/needlework-seed-pattern.ts \
 *     src/lib/loom/fixtures/countryside.pattern.json \
 *     --slug countryside --name "Countryside" --visibility UNLISTED [--rerender] [--dry]
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

import sharp from 'sharp'
import { prisma, Visibility } from '@homemade/db'
import { renderHero } from './loom-render-hero'
import type { StitchedElement } from '../src/lib/loom/render/renderPattern'
import { buildPatternDocument } from '../src/lib/needlework/engine/document'
import { toStoredVectorData, type NeedleworkSurfacePattern } from '../src/lib/needlework/pattern'

interface Fixture {
  name?: string
  designer?: string
  discipline?: string
  patternFormat?: string
  frameType?: string | null
  fabricSpec?: { material?: string; colourHex?: string | null; count?: number | null } | null
  threadTypes?: string[]
  defaultThread?: { type: string; weight: string } | null
  finishedSizeMm?: { width: number; height: number }
  /** Pull saturated warm hues down before AgX (toadstool reds). Default true;
   *  set false for designs whose warmth is the point (a fox's orange fur). */
  tameWarm?: boolean
  description?: string
  palette?: NeedleworkSurfacePattern['palette']
  stitchLegend?: NeedleworkSurfacePattern['stitchLegend']
  license?: {
    licenseType?: string
    attributionRequired?: boolean
    commercialUseAllowed?: boolean
    redistributionAllowed?: boolean
    attributionText?: string
  }
  stitchedElements: StitchedElement[]
}

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

async function main(): Promise<void> {
  const fixtureArg = process.argv[2]
  if (!fixtureArg || fixtureArg.startsWith('--')) {
    console.error('usage: needlework-seed-pattern.ts <fixture.json> --slug <slug> [--name ..] [--visibility PUBLIC|UNLISTED] [--rerender] [--dry]')
    process.exit(2)
  }
  const fixturePath = isAbsolute(fixtureArg) ? fixtureArg : resolve(process.cwd(), fixtureArg)
  const fx = JSON.parse(readFileSync(fixturePath, 'utf8')) as Fixture
  const slug = arg('slug') ?? 'countryside'
  const name = arg('name') ?? fx.name ?? 'Pattern'
  const visibility = (arg('visibility') ?? 'UNLISTED').toUpperCase() as Visibility
  const dry = flag('dry')
  const rerender = flag('rerender')

  const finishedSizeMm = fx.finishedSizeMm ?? { width: 150, height: 150 }
  const canonical: NeedleworkSurfacePattern = {
    stitchedElements: fx.stitchedElements,
    finishedSizeMm,
    fabricSpec: fx.fabricSpec ?? null,
    defaultThread: fx.defaultThread ?? null,
    frameType: fx.frameType ?? null,
    palette: fx.palette,
    stitchLegend: fx.stitchLegend,
  }

  const document = buildPatternDocument(fx.stitchedElements, finishedSizeMm, { title: name })
  const { vectorData, regionAnnotations } = toStoredVectorData(canonical, { document })
  console.log(
    `[seed:${slug}] ${fx.stitchedElements.length} elements · ${document.flossKey.length} colours · ` +
      `${document.stitchKey.length} stitch types · ${document.steps.length} steps`,
  )

  if (dry) {
    console.log('[seed] --dry: skipping render + DB write')
    return
  }

  // Reuse an existing hero unless --rerender (Fal costs money).
  const existing = await prisma.needleworkPattern.findUnique({
    where: { slug },
    select: { id: true, heroMediaId: true },
  })

  let heroMediaId: string | null = existing?.heroMediaId ?? null
  if (!heroMediaId || rerender) {
    console.log(`[seed:${slug}] rendering hero (Blender + Fal)…`)
    const hero = await renderHero(
      {
        name: slug,
        stitchedElements: fx.stitchedElements,
        finishedSizeMm,
        fabricHex: fx.fabricSpec?.colourHex ?? undefined,
        frameType: fx.frameType ?? null,
        defaultThread: fx.defaultThread ?? null,
        strands: fx.defaultThread?.type === 'perle' ? 1 : 6,
      },
      { persist: true, tameWarm: fx.tameWarm ?? true, r2Prefix: 'patterns/needlework' },
    )
    if (!hero.r2) throw new Error('renderHero did not persist to R2 (no r2 result)')
    const meta = await sharp(hero.localHeroPath).metadata()
    const bytes = readFileSync(hero.localHeroPath).length
    const media = await prisma.media.create({
      data: {
        type: 'PHOTO',
        mimeType: 'image/png',
        filename: `${slug}-hero.png`,
        alt: `${name} — finished embroidery in a hoop`,
        width: meta.width ?? hero.width,
        height: meta.height ?? hero.height,
        bytes,
        status: 'READY',
        r2Key: hero.r2.key,
        source: 'loom-render',
        requiresAttribution: false,
      },
      select: { id: true },
    })
    heroMediaId = media.id
    console.log(`[seed:${slug}] hero -> ${hero.r2.publicUrl} (Media ${heroMediaId}, ${hero.pathTaken.kind})`)
  } else {
    console.log(`[seed:${slug}] reusing existing hero Media ${heroMediaId} (pass --rerender to redo)`)
  }

  const data = {
    slug,
    name,
    description: fx.description ?? null,
    discipline: (fx.discipline ?? 'SURFACE_EMBROIDERY') as never,
    patternFormat: (fx.patternFormat ?? 'SURFACE_VECTOR') as never,
    vectorData: vectorData as unknown as object,
    regionAnnotations: regionAnnotations as unknown as object,
    fabricSpec: (fx.fabricSpec ?? undefined) as unknown as object | undefined,
    frameType: (fx.frameType ?? undefined) as never,
    threadTypes: fx.threadTypes ?? [],
    colourCount: document.flossKey.length,
    difficulty: 'INTERMEDIATE' as never,
    heroMediaId,
    thumbnailMediaId: heroMediaId,
    visibility,
    publishedAt: new Date(),
  }

  const pattern = await prisma.needleworkPattern.upsert({
    where: { slug },
    create: data,
    update: data,
    select: { id: true, slug: true },
  })

  // License row — records provenance (the Countryside fixture is © DMC, internal).
  if (fx.license) {
    await prisma.needleworkPatternLicense.upsert({
      where: { needleworkPatternId: pattern.id },
      create: {
        needleworkPatternId: pattern.id,
        licenseType: (fx.license.licenseType ?? 'ALL_RIGHTS_RESERVED') as never,
        attributionRequired: fx.license.attributionRequired ?? true,
        commercialUseAllowed: fx.license.commercialUseAllowed ?? false,
        redistributionAllowed: fx.license.redistributionAllowed ?? false,
        attributionText: fx.license.attributionText ?? null,
      },
      update: {
        licenseType: (fx.license.licenseType ?? 'ALL_RIGHTS_RESERVED') as never,
        attributionText: fx.license.attributionText ?? null,
      },
    })
  }

  console.log(`[seed:${slug}] upserted NeedleworkPattern ${pattern.id} (${visibility})`)
  console.log(`[seed:${slug}] live at /needlework/patterns/${slug}`)
}

main()
  .catch((e) => {
    console.error('[needlework-seed] FAILED:', e instanceof Error ? e.stack ?? e.message : String(e))
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
