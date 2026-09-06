import 'server-only'
import os from 'node:os'
import path from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
// Type-only: erased at compile, so the loom's Blender / AWS / Fal tooling still
// never enters the request bundle. The values come in by dynamic import below.
import type { HeroRenderJob } from '../../../../../scripts/loom-render-hero'
import type { FargatePollResult } from '../../../../../scripts/loom-fargate-render'

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
    input: HeroInput,
    options: { persist?: boolean; tameWarm?: boolean; r2Prefix?: string; outDir?: string },
  ) => Promise<HeroResult>
  /** The same render, split so the Fargate task runs BETWEEN two requests. */
  startHeroRender: (input: HeroInput, options: HeroOptions) => Promise<HeroRenderJob>
  pollHeroRender: (job: HeroRenderJob) => Promise<FargatePollResult>
  finishHeroRender: (job: HeroRenderJob, options: HeroOptions) => Promise<HeroResult>
}

interface HeroInput {
  name: string
  stitchedElements: unknown[]
  finishedSizeMm: { width: number; height: number }
  fabricHex?: string
  frameType?: string | null
  defaultThread?: { type: string; weight: string } | null
  strands?: number
}

interface HeroOptions {
  persist?: boolean
  tameWarm?: boolean
  r2Prefix?: string
  outDir?: string
}

interface HeroResult {
  localHeroPath: string
  width: number
  height: number
  bytes: number
  pathTaken: string
  r2?: { key: string; publicUrl: string }
}

/** The scratch bucket, used here to hand large values between Inngest steps. */
interface FargateScratchModule {
  putFargateScratch: (localPath: string, key: string, options?: { contentType?: string; bucket?: string; region?: string }) => Promise<void>
  getFargateScratch: (key: string, localPath: string, options?: { bucket?: string; region?: string }) => Promise<void>
  scratchSibling: (outKey: string, filename: string) => string
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

// ── The candidate, generated ASYNCHRONOUSLY ─────────────────────────────────
//
// `generateNeedleworkCandidate` above waits out the Fargate hero — seven to
// nine minutes — which is the whole reason the needlework autopilot is paused:
// inside an Inngest step that is one HTTP request, and the proxy in front of the
// site ends a request at about a hundred seconds. These four do the same work in
// stages short enough to survive it, with the render happening between them.
//
// Two things travel through the render's own scratch bucket rather than in the
// step results: the converted pattern (thousands of stitched elements — far too
// big to serialise through a queue) and the finished hero. The web service runs
// two tasks, so the step that gates is very likely a different container from
// the one that rendered, and nothing on local disk survives that. Scratch
// objects expire after a day, so a killed candidate still leaves nothing behind.

/** What a started needlework candidate carries between steps. Small JSON. */
export interface PendingNeedleworkCandidate {
  slug: string
  /** Scratch-bucket key of the converted pattern, parked beside its render. */
  conversionKey: string
  stitchCount: number
  colourCount: number
  job: HeroRenderJob
}

/** A pending candidate whose hero has landed and been parked in the bucket. */
export interface RenderedNeedleworkCandidate extends PendingNeedleworkCandidate {
  heroKey: string
  width: number
  height: number
}

async function scratchModule(): Promise<FargateScratchModule> {
  return (await import('../../../../../scripts/loom-fargate-render')) as unknown as FargateScratchModule
}

/**
 * STEP 1: the Flux illustration, the needlework conversion, and the START of
 * the hero render. Everything expensive that is NOT the render happens here,
 * and the density backstop still refuses an over-dense scene before a task is
 * launched rather than after.
 */
export async function startNeedleworkCandidate(brief: NeedleworkBrief): Promise<PendingNeedleworkCandidate> {
  if (!fargateRenderWired()) {
    throw new Error('startNeedleworkCandidate: LOOM_RENDER!=fargate — needlework bulk render is not wired')
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

  const outDir = path.join(os.tmpdir(), 'homemade-bulk-nw-heroes')
  mkdirSync(outDir, { recursive: true })
  const mod = (await import('../../../../../scripts/loom-render-hero')) as unknown as RenderHeroModule
  const job = await mod.startHeroRender(
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

  // Park the conversion beside its own render. It is what the publisher writes
  // to the row, and it is far too large to carry through a step result.
  const scratch = await scratchModule()
  const conversionKey = scratch.scratchSibling(job.render.outKey, 'conversion.json')
  const conversionPath = path.join(outDir, `${brief.slug}.conversion.json`)
  writeFileSync(conversionPath, JSON.stringify(conversion))
  await scratch.putFargateScratch(conversionPath, conversionKey, { contentType: 'application/json' })

  return {
    slug: brief.slug,
    conversionKey,
    stitchCount: conversion.stitchCount,
    colourCount: conversion.colourCount,
    job,
  }
}

/** STEP 2: has the hero render finished, and did it work? One AWS call. */
export async function pollNeedleworkCandidate(pending: PendingNeedleworkCandidate): Promise<FargatePollResult> {
  const mod = (await import('../../../../../scripts/loom-render-hero')) as unknown as RenderHeroModule
  return mod.pollHeroRender(pending.job)
}

/**
 * STEP 3: fetch the base render, run the same upscale and fidelity gate the
 * synchronous path runs (unpersisted — nothing reaches R2 before the gate), and
 * park the chosen hero for whichever container gates it.
 */
export async function renderNeedleworkCandidate(
  pending: PendingNeedleworkCandidate,
): Promise<RenderedNeedleworkCandidate> {
  const outDir = path.join(os.tmpdir(), 'homemade-bulk-nw-heroes')
  const mod = (await import('../../../../../scripts/loom-render-hero')) as unknown as RenderHeroModule
  const hero = await mod.finishHeroRender(pending.job, {
    persist: false,
    r2Prefix: 'patterns/needlework',
    outDir,
  })
  const scratch = await scratchModule()
  const heroKey = scratch.scratchSibling(pending.job.render.outKey, 'hero.png')
  await scratch.putFargateScratch(hero.localHeroPath, heroKey, { contentType: 'image/png' })
  return { ...pending, heroKey, width: hero.width, height: hero.height }
}

/**
 * STEP 4: the hero and the converted pattern back off the scratch bucket as the
 * same candidate object the synchronous path builds, so the gate and the
 * publisher are unchanged.
 */
export async function loadNeedleworkCandidate(
  rendered: RenderedNeedleworkCandidate,
): Promise<NeedleworkCandidate> {
  const outDir = path.join(os.tmpdir(), 'homemade-bulk-nw-heroes')
  mkdirSync(outDir, { recursive: true })
  const scratch = await scratchModule()
  const heroPath = path.join(outDir, `${rendered.slug}-hero.png`)
  const conversionPath = path.join(outDir, `${rendered.slug}.conversion.json`)
  await scratch.getFargateScratch(rendered.heroKey, heroPath)
  await scratch.getFargateScratch(rendered.conversionKey, conversionPath)
  const conversion = JSON.parse(readFileSync(conversionPath, 'utf8')) as NeedleworkConversion
  return { conversion, heroPng: readFileSync(heroPath), width: rendered.width, height: rendered.height }
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
