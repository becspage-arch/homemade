import 'server-only'
import os from 'node:os'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { prisma, Visibility, r2Upload, ensureHouseDesigner } from '@homemade/db'
import { generatePatternImage } from '@/lib/studio/generation/pattern-engine'
import {
  convertImageToNeedleworkPattern,
  NEEDLEWORK_FABRIC_HEX,
  type NeedleworkConversion,
} from '@/lib/needlework/create-your-own'
import { NEEDLEWORK_SHELF, NEEDLEWORK_SHELF_NAME } from './subject-pool'
import type { NeedleworkBrief } from './planner'

/**
 * Needlework (thread-painting) bulk pipeline — ported out of the retired PC
 * script apps/web/scripts/needlework-paint.ts INTO the shared engine. It runs the
 * SAME converter the customer create-your-own path uses
 * (`convertImageToNeedleworkPattern`) and the SAME loom hero render the catalogue
 * uses (`renderHero`, on Fargate). The bulk-specific parts are only the ruthless
 * gate (applied by the runner) and publishing the gem PUBLIC to the house
 * catalogue.
 *
 * RENDER: the hero is rendered on AWS Fargate (LOOM_RENDER=fargate). We render
 * with persist:false so a KILLED candidate never leaves an orphan in R2 — only a
 * gate-passed gem is uploaded, on publish.
 */

/** The subset of the loom's renderHero surface we depend on (matches the Inngest job). */
interface RenderHeroModule {
  renderHero: (
    input: {
      name: string
      stitchedElements: unknown[]
      finishedSizeMm: { width: number; height: number }
      fabricHex?: string
      frameType?: string | null
      defaultThread?: { type: string; weight: string } | null
      strands?: number
    },
    options: { persist?: boolean; tameWarm?: boolean; r2Prefix?: string; outDir?: string },
  ) => Promise<{
    localHeroPath: string
    width: number
    height: number
    bytes: number
    pathTaken: string
    r2?: { key: string; publicUrl: string }
  }>
}

export function fargateRenderWired(): boolean {
  return process.env.LOOM_RENDER === 'fargate'
}

/**
 * Max stitch strokes we'll send to the loom. A ~200mm hoop piece sits well under
 * this; a full-bleed 240mm scene blew past it (~28k) and hung the renderer.
 */
const MAX_STITCHES = 16000

export interface NeedleworkCandidate {
  conversion: NeedleworkConversion
  /** The finished loom hero PNG — the exact image that would ship, gated as-is. */
  heroPng: Buffer
  width: number
  height: number
}

/**
 * Generate one candidate: shared-engine Flux illustration → shared needlework
 * converter → loom hero on Fargate (unpersisted). Returns the hero for the gate.
 * Throws if the Fargate render path isn't wired (bulk needlework requires it).
 */
export async function generateNeedleworkCandidate(brief: NeedleworkBrief): Promise<NeedleworkCandidate> {
  if (!fargateRenderWired()) {
    throw new Error('generateNeedleworkCandidate: LOOM_RENDER!=fargate — needlework bulk render is not wired')
  }

  // Shared engine — the same Flux call the customer idea→pattern flow makes.
  const generated = await generatePatternImage(brief.subject, { imageSize: 'square_hd' })

  // Shared needlework converter (bitmapToStitches + document + vector data).
  const conversion = await convertImageToNeedleworkPattern(generated.buffer, brief.name, {
    widthMm: brief.widthMm,
    frame: brief.frame,
    detail: brief.detail,
    fullScene: brief.fullScene,
  })

  // Density backstop: the loom (Blender) hangs on an over-dense scene. Skip
  // anything past a sane stroke budget rather than send it to a doomed render.
  if (conversion.stitchCount > MAX_STITCHES) {
    throw new Error(`needlework candidate too dense (${conversion.stitchCount} > ${MAX_STITCHES} strokes) — skipped before render`)
  }

  // Loom hero on Fargate — unpersisted; we upload only if it passes the gate.
  const outDir = path.join(os.tmpdir(), 'homemade-bulk-nw-heroes')
  const mod = (await import('../../../../../scripts/loom-render-hero')) as unknown as RenderHeroModule
  const hero = await mod.renderHero(
    {
      name: `nw-${brief.slug}`,
      stitchedElements: conversion.canonical.stitchedElements as unknown[],
      finishedSizeMm: conversion.finishedSizeMm,
      fabricHex: conversion.canonical.fabricSpec?.colourHex ?? NEEDLEWORK_FABRIC_HEX,
      frameType: conversion.frameType,
      defaultThread: conversion.canonical.defaultThread ?? { type: 'stranded-cotton', weight: '3-strand' },
      strands: 3,
    },
    { persist: false, tameWarm: brief.tameWarm, r2Prefix: 'patterns/needlework', outDir },
  )

  const heroPng = readFileSync(hero.localHeroPath)
  return { conversion, heroPng, width: hero.width, height: hero.height }
}

export interface PublishedNeedleworkGem {
  patternId: string
  slug: string
  publicUrl: string
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
async function r2UploadRetry(png: Buffer, opts: { prefix: string; filename: string }): Promise<{ key: string; publicUrl: string }> {
  let lastErr: unknown
  for (let i = 0; i < 4; i++) {
    try {
      return await r2Upload(png, 'image/png', opts)
    } catch (e) {
      lastErr = e
      await sleep(1500 * (i + 1))
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('r2Upload failed')
}

/**
 * Publish a gate-passed needlework gem to the live catalogue: upload the hero,
 * create its Media, upsert a PUBLIC NeedleworkPattern filed on the
 * surface-embroidery shelf, attributed to the house designer.
 */
export async function publishNeedleworkGem(
  brief: NeedleworkBrief,
  candidate: NeedleworkCandidate,
): Promise<PublishedNeedleworkGem> {
  const designer = await ensureHouseDesigner()
  const cat = await prisma.category.findUnique({ where: { slug: 'needlework' }, select: { id: true } })
  if (!cat) throw new Error('no needlework category')
  const sub = await prisma.subCategory.upsert({
    where: { categoryId_slug: { categoryId: cat.id, slug: NEEDLEWORK_SHELF } },
    create: { categoryId: cat.id, slug: NEEDLEWORK_SHELF, name: NEEDLEWORK_SHELF_NAME, order: 50 },
    update: {},
    select: { id: true },
  })

  const { conversion } = candidate
  const { key, publicUrl } = await r2UploadRetry(candidate.heroPng, { prefix: 'patterns/needlework', filename: `${brief.slug}-hero.png` })
  const meta = await sharp(candidate.heroPng).metadata()
  const media = await prisma.media.create({
    data: {
      type: 'PHOTO',
      mimeType: 'image/png',
      filename: `${brief.slug}-hero.png`,
      alt: `${brief.name} — finished embroidery`,
      width: meta.width ?? candidate.width,
      height: meta.height ?? candidate.height,
      bytes: candidate.heroPng.byteLength,
      status: 'READY',
      r2Key: key,
      source: 'loom-render',
      requiresAttribution: false,
    },
    select: { id: true },
  })

  const frameType = conversion.frameType === 'NONE' ? null : conversion.frameType
  const common = {
    name: brief.name,
    description: `${brief.name}, an original Homemade thread-painting design.`,
    discipline: 'SURFACE_EMBROIDERY' as never,
    patternFormat: 'SURFACE_VECTOR' as never,
    vectorData: conversion.vectorData as unknown as object,
    regionAnnotations: conversion.regionAnnotations as unknown as object,
    fabricSpec: conversion.canonical.fabricSpec as unknown as object,
    frameType: frameType as never,
    threadTypes: ['stranded-cotton'],
    colourCount: conversion.colourCount,
    difficulty: 'INTERMEDIATE' as never,
    designerId: designer.id,
    subCategoryId: sub.id,
    heroMediaId: media.id,
    thumbnailMediaId: media.id,
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
  }
  const pattern = await prisma.needleworkPattern.upsert({
    where: { slug: brief.slug },
    create: { slug: brief.slug, ...common },
    update: common,
    select: { id: true },
  })

  return { patternId: pattern.id, slug: brief.slug, publicUrl }
}

/** Most-recent published needlework names (feeds the planner's dedupe). */
export async function recentNeedleworkSlugs(limit = 40): Promise<string[]> {
  const rows = await prisma.needleworkPattern.findMany({
    where: { ownerUserId: null, visibility: Visibility.PUBLIC },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { name: true },
  })
  return rows.map((r) => r.name)
}
