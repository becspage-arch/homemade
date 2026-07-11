import 'server-only'
import sharp from 'sharp'
import {
  prisma,
  computePatternMetrics,
  Visibility,
  ImageGenerationStatus,
  r2Upload,
  ensureHouseDesigner,
  type PatternData,
} from '@homemade/db'
import { generatePatternImage, imageToPattern } from '@/lib/studio/generation/pattern-engine'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'
import {
  buildPrompt,
  SRC_SAT,
  FABRIC,
  POST_SAT,
  DENSE_COLOUR_THRESHOLD,
  difficultyFor,
} from './cross-stitch-style'
import type { CrossStitchBrief } from './planner'

/**
 * Cross-stitch bulk pipeline — the generate + render + publish half of the
 * catalogue routine, ported out of the retired scripts (xs-volume-gen.ts +
 * xs-volume-publish.ts) INTO the shared engine. It calls the SAME server engine
 * the customer create-your-own path uses (`generatePatternImage` + `imageToPattern`
 * in pattern-engine.ts); the only bulk-specific parts are the proven colour
 * treatment (cross-stitch-style.ts), the beauty thumbnail, and publishing the
 * gem PUBLIC to the house catalogue.
 *
 * The ruthless vision gate is applied by the runner (run.ts) BETWEEN generate and
 * publish — nothing here ships un-judged.
 */

const THUMB_TARGET = 1000
const CROSS_STITCH_CATEGORY = 'cross-stitch'

export interface CrossStitchCandidate {
  data: PatternData
  /** The finished beauty render — the exact thumbnail that would ship, gated as-is. */
  renderPng: Buffer
  colourCount: number
  widthCells: number
  heightCells: number
}

function imageSizeFor(w: number, h: number): 'square_hd' | 'portrait_4_3' | 'landscape_4_3' {
  const r = w / h
  if (r > 1.15) return 'landscape_4_3'
  if (r < 0.87) return 'portrait_4_3'
  return 'square_hd'
}

/**
 * A repair tweak from the vision gate — applied on a re-roll to fix a fixable
 * fault (mirrors GATE_CHECKLIST's repair table). Every re-roll also re-rolls the
 * stochastic Flux generation, which fixes most cut-off / garbled / off-subject
 * faults on its own.
 */
export interface CandidateTweak {
  /** Multiply the source saturation (gate said washed-out). */
  satMul?: number
  /** Adjust the colour count (gate said too sparse / too mushy). */
  colourDelta?: number
}

/**
 * Generate one candidate: shared-engine Flux image → per-lane pre-saturation →
 * shared-engine convert (rigorous photoToPatternData) → ivory aida → beauty
 * thumbnail with the post-saturation boost. Returns the render for the gate.
 */
export async function generateCrossStitchCandidate(
  brief: CrossStitchBrief,
  tweak: CandidateTweak = {},
): Promise<CrossStitchCandidate> {
  const colours = Math.max(6, Math.min(160, brief.colours + (tweak.colourDelta ?? 0)))
  const dense = colours > DENSE_COLOUR_THRESHOLD
  const prompt = buildPrompt(brief.subject, brief.style)

  // Shared engine — the same call the customer idea→pattern flow makes.
  const generated = await generatePatternImage(prompt, {
    detailed: dense,
    imageSize: imageSizeFor(brief.w, brief.h),
  })

  // Per-lane source pre-saturation before the quantiser (the vivid-colour fix).
  const srcSat = (brief.sat ?? SRC_SAT[brief.style]) * (tweak.satMul ?? 1)
  const satImage = await sharp(generated.buffer).modulate({ saturation: srcSat }).png().toBuffer()

  // Shared engine convert — dense tier lifts the floss ceiling + full DMC range.
  const { data, metrics } = await imageToPattern(satImage, {
    width: brief.w,
    height: brief.h,
    colours,
    fabricCount: 14,
    brand: 'DMC',
    confettiMin: dense ? 'high' : 'medium',
    backgroundRemoval: false,
    ...(dense ? { maxColours: brief.colours, flossRange: 'full' as const } : {}),
  })
  data.fabric.colourRgb = FABRIC

  const renderPng = await renderThumbnail(data, brief.sat != null ? 1 : POST_SAT)
  return {
    data,
    renderPng,
    colourCount: metrics.colourCount,
    widthCells: metrics.widthCells,
    heightCells: metrics.heightCells,
  }
}

/** The beauty thumbnail — bbox-cropped, responsive cell size, post-saturated. */
async function renderThumbnail(data: PatternData, postSat: number): Promise<Buffer> {
  const bbox = stitchedBoundingBox(data)
  const mg = 2
  const region = bbox
    ? {
        x: Math.max(0, bbox.minX - mg),
        y: Math.max(0, bbox.minY - mg),
        width: Math.min(data.grid.width, bbox.maxX + 1 + mg) - Math.max(0, bbox.minX - mg),
        height: Math.min(data.grid.height, bbox.maxY + 1 + mg) - Math.max(0, bbox.minY - mg),
      }
    : undefined
  const rw = region?.width ?? data.grid.width
  const cellPx = rw <= 70 ? 26 : rw <= 130 ? 16 : 10
  const svg = renderPatternSvgString(data, {
    mode: 'beauty',
    cellPx,
    showSymbols: false,
    showGrid: false,
    showCentreCrosshairs: false,
    padding: Math.round(cellPx * 0.8),
    region,
  })
  return sharp(Buffer.from(svg))
    .modulate({ saturation: postSat })
    .resize(THUMB_TARGET, THUMB_TARGET, { fit: 'inside' })
    .png({ quality: 90 })
    .toBuffer()
}

export interface PublishedGem {
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
 * Publish a gate-passed gem to the live cross-stitch catalogue: house designer,
 * real shelf, PUBLIC Pattern, persisted beauty thumbnail, search sync. Idempotent
 * on slug (the planner mints unique slugs, so this creates).
 */
export async function publishCrossStitchGem(
  brief: CrossStitchBrief,
  candidate: CrossStitchCandidate,
): Promise<PublishedGem> {
  const designer = await ensureHouseDesigner()
  const cat = await prisma.category.findUnique({ where: { slug: CROSS_STITCH_CATEGORY }, select: { id: true } })
  if (!cat) throw new Error('no cross-stitch category')

  const sub = await prisma.subCategory.upsert({
    where: { categoryId_slug: { categoryId: cat.id, slug: brief.shelf } },
    create: { categoryId: cat.id, slug: brief.shelf, name: brief.shelfName, order: 50 },
    update: {},
    select: { id: true },
  })

  const data = candidate.data
  const m = computePatternMetrics(data)
  const name = titleFromSubject(brief.subject)
  const common = {
    name,
    description: `${name}, an original Homemade cross-stitch design.`,
    data: data as unknown as object,
    designerId: designer.id,
    subCategoryId: sub.id,
    difficulty: difficultyFor(m.colourCount),
    visibility: Visibility.PUBLIC,
    publishedAt: new Date(),
    // The cross-stitch hero IS the deterministic beauty chart render (persisted as
    // thumbnailMediaId) — the exact pattern, and the correct final hero by design
    // (there is no photoreal AI hero, and none is wanted). SUCCESS is the honest
    // terminal value: the hero was produced and passed the gate. It is NOT a
    // fallback — the render is the intended hero. (The renderer reads
    // thumbnailMediaId; this flag is informational only.)
    heroGenerationStatus: ImageGenerationStatus.SUCCESS,
    widthCells: m.widthCells,
    heightCells: m.heightCells,
    colourCount: m.colourCount,
    totalStitches: m.totalStitches,
    hasBackstitch: m.hasBackstitch,
    hasFrenchKnots: m.hasFrenchKnots,
    hasBeads: m.hasBeads,
    hasQuarterStitches: m.hasQuarterStitches,
    fabricCountSuggested: data.fabric.count,
  }
  const pattern = await prisma.pattern.upsert({
    where: { slug: brief.slug },
    create: { slug: brief.slug, type: 'CROSS_STITCH', ...common },
    update: common,
    select: { id: true },
  })

  const meta = await sharp(candidate.renderPng).metadata()
  const { key, publicUrl } = await r2UploadRetry(candidate.renderPng, { prefix: 'pattern-thumbnails', filename: `${pattern.id}.png` })
  const media = await prisma.media.create({
    data: {
      type: 'ILLUSTRATION',
      mimeType: 'image/png',
      r2Key: key,
      width: meta.width ?? THUMB_TARGET,
      height: meta.height ?? THUMB_TARGET,
      bytes: candidate.renderPng.byteLength,
      status: 'READY',
      source: 'original',
      alt: `${name} cross-stitch chart`,
    },
    select: { id: true },
  })
  await prisma.pattern.update({ where: { id: pattern.id }, data: { thumbnailMediaId: media.id } })

  // Search sync (dynamic import mirrors the retired publish script).
  const { buildPatternDoc } = await import('@homemade/db/search-docs')
  const { syncPatternDoc } = await import('@homemade/search')
  const doc = await buildPatternDoc(pattern.id)
  if (doc) await syncPatternDoc(doc)

  return { patternId: pattern.id, slug: brief.slug, publicUrl }
}

/** Most-recent published bulk slugs (feeds the planner's dedupe). */
export async function recentCrossStitchSlugs(limit = 40): Promise<string[]> {
  const rows = await prisma.pattern.findMany({
    where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { name: true },
  })
  return rows.map((r) => r.name)
}

function titleFromSubject(subject: string): string {
  const s = subject.replace(/^an?\s+/i, '').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}
