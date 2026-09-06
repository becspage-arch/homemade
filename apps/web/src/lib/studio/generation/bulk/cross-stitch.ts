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
import { sha256Hex } from './similarity'
import { subjectKey } from './subject-key'
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
import { CROSS_STITCH_SHELF_BY_SLUG } from '../categories'
import type { CandidateFingerprints } from './dedupe-guard'
import type { GateResult } from '../vision-gate'
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
  /** sha256 of the Flux PNG this chart was converted from — the "same generation"
   *  signal, stored on the published row so a re-conversion of one source image
   *  can never quietly become a second pattern. */
  sourceSha256: string
  /** True when this candidate used the Flux 1.1 Pro (dense) tier — the expensive
   *  lane, counted and capped separately from schnell. */
  pro: boolean
  /** Provenance for `generationMeta`. */
  model: string
  imageSize: string
  credit: string
  /** The colour ceiling actually asked of the converter (after any gate tweak). */
  requestedColours: number
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
  const imageSize = imageSizeFor(brief.w, brief.h)
  const generated = await generatePatternImage(prompt, {
    detailed: dense,
    imageSize,
  })
  // Fingerprint the SOURCE before anything downstream touches it.
  const sourceSha256 = sha256Hex(generated.buffer)

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
    sourceSha256,
    pro: dense,
    model: dense ? 'flux-1.1-pro' : 'flux-schnell',
    imageSize,
    credit: generated.credit,
    requestedColours: colours,
  }
}

/**
 * Would this brief + tweak generate on the expensive Flux 1.1 Pro tier? The
 * spend guard needs to know BEFORE it generates, so this mirrors the colour
 * arithmetic at the top of `generateCrossStitchCandidate` exactly.
 */
export function candidateIsPro(brief: CrossStitchBrief, tweak: CandidateTweak = {}): boolean {
  const colours = Math.max(6, Math.min(160, brief.colours + (tweak.colourDelta ?? 0)))
  return colours > DENSE_COLOUR_THRESHOLD
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

/** Everything the publisher records about HOW this gem came to exist. */
export interface PublishContext {
  /** The fingerprints the duplicate guard just computed and cleared. */
  fingerprints: CandidateFingerprints
  /** The gate verdict that let it through. */
  gate: Pick<GateResult, 'verdict' | 'reasons'>
  /** The BulkRun this gem belongs to, when it came from a bulk run. */
  bulkRunId?: string | null
  /** Which best-of-N attempt produced it. */
  attempt?: number
  /** The repair tweak in force on that attempt. */
  tweak?: CandidateTweak
}

/**
 * Publish a gate-passed gem to the live cross-stitch catalogue: house designer,
 * real shelf, PUBLIC Pattern, persisted beauty thumbnail, search sync. Idempotent
 * on slug (the planner mints unique slugs, so this creates).
 *
 * SHELF DISCIPLINE: every published pattern gets exactly one shelf from the
 * canonical list in `categories.ts`, and this function refuses anything else.
 * The catalogue previously grew a fragmented `florals` beside `floral` and a
 * `home-cosy` beside `scenes` because the publisher upserted whatever slug it
 * was handed; it cannot happen again. `nursery` is the one shelf row this may
 * create — it is on the canonical list and simply has no patterns yet.
 */
export async function publishCrossStitchGem(
  brief: CrossStitchBrief,
  candidate: CrossStitchCandidate,
  ctx?: PublishContext,
): Promise<PublishedGem> {
  const shelf = CROSS_STITCH_SHELF_BY_SLUG[brief.shelf]
  if (!shelf) {
    throw new Error(
      `publishCrossStitchGem: “${brief.shelf}” is not a canonical cross-stitch shelf — refusing to publish (allowed: ${Object.keys(CROSS_STITCH_SHELF_BY_SLUG).join(', ')})`,
    )
  }

  const designer = await ensureHouseDesigner()
  const cat = await prisma.category.findUnique({ where: { slug: CROSS_STITCH_CATEGORY }, select: { id: true } })
  if (!cat) throw new Error('no cross-stitch category')

  const sub = await prisma.subCategory.upsert({
    where: { categoryId_slug: { categoryId: cat.id, slug: shelf.slug } },
    create: { categoryId: cat.id, slug: shelf.slug, name: shelf.name, order: 50 },
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
    // ── duplicate-guard fingerprints of the artifact that is shipping ──────
    // Written at publish so the NEXT candidate can be compared against this one.
    // Without them a row is invisible to the image half of the guard (the text
    // half still sees it), which is exactly the hole the backfill closes.
    ...(ctx?.fingerprints
      ? {
          thumbnailSha256: ctx.fingerprints.sha256,
          imageHash64: ctx.fingerprints.dhash64,
          imageHash256: ctx.fingerprints.dhash256,
          chartFingerprint: ctx.fingerprints.chart as unknown as object,
        }
      : {}),
    sourceImageSha256: candidate.sourceSha256,
    subjectKey: ctx?.fingerprints.subjectKey ?? subjectKey(brief.subject),
    bulkRunId: ctx?.bulkRunId ?? null,
    generationMeta: {
      brief: {
        subject: brief.subject,
        themeId: brief.themeId,
        shelf: shelf.slug,
        lane: brief.lane,
        // Who wrote this brief: the planner model, or the pool sampler fallback.
        source: brief.source,
        // Which planner wrote it: free invention, or a dressed pool subject.
        plannerMode: brief.plannerMode,
        // Whether the pool subject was actually re-dressed or copied verbatim.
        dressed: brief.dressed,
        w: brief.w,
        h: brief.h,
        colours: brief.colours,
        ...(brief.sat != null ? { sat: brief.sat } : {}),
      },
      style: brief.style,
      model: candidate.model,
      imageSize: candidate.imageSize,
      requestedColours: candidate.requestedColours,
      pro: candidate.pro,
      attempt: ctx?.attempt ?? 1,
      tweak: ctx?.tweak ?? {},
      gate: { verdict: ctx?.gate.verdict ?? 'keep', reasons: ctx?.gate.reasons ?? [] },
      bulkRunId: ctx?.bulkRunId ?? null,
      credit: candidate.credit,
      publishedBy: 'bulk-cross-stitch',
      at: new Date().toISOString(),
    } as unknown as object,
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
