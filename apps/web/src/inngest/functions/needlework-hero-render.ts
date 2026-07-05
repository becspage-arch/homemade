import 'server-only'
import os from 'node:os'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { prisma } from '@homemade/db'
import { inngest } from '../client'
import { fromStoredVectorData } from '@/lib/needlework/pattern'
import { NEEDLEWORK_FABRIC_HEX } from '@/lib/needlework/create-your-own'

/**
 * needlework/hero.render — the photoreal loom hero for a customer's own
 * needlework pattern, rendered on Fargate.
 *
 * The create-your-own route saves the pattern instantly (full stitchable
 * document) and emits this event; the render runs here, off the saved row, so
 * the customer is never held for the minutes a photoreal render takes. When it
 * lands, the hero + thumbnail attach to the pattern.
 *
 * The render is the SAME loom pipeline our catalogue uses — `renderHero`
 * (scripts/loom-render-hero): scene → Blender base on Fargate (LOOM_RENDER=
 * fargate) → Fal creative-upscale → fidelity gate → R2. Nothing about the loom
 * is changed here; this job only invokes it and stores the result.
 *
 * Best-effort by design:
 *   - If LOOM_RENDER is not 'fargate' (the render infra isn't wired in this
 *     environment) the job is a clean no-op — the pattern stays fully usable
 *     from its document; only the finished-piece preview is absent.
 *   - The loom (Blender + Fal + AWS CLI) is heavy, build-time-style tooling, so
 *     it is imported dynamically — it never enters the request-path bundle.
 */

/** The subset of the loom's renderHero surface this job depends on. */
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
    options: {
      persist?: boolean
      tameWarm?: boolean
      r2Prefix?: string
      outDir?: string
    },
  ) => Promise<{
    localHeroPath: string
    width: number
    height: number
    bytes: number
    pathTaken: string
    r2?: { key: string; publicUrl: string }
  }>
}

export const needleworkHeroRender = inngest.createFunction(
  {
    id: 'needlework-hero-render',
    name: 'Needlework: render create-your-own hero (Fargate)',
    // A photoreal render is a 4-vCPU Blender task; keep a lid on how many run at
    // once and give the Fargate cold-start + render room before a retry.
    concurrency: { limit: 3 },
    retries: 2,
    triggers: [{ event: 'needlework/hero.render' }],
  },
  async ({ event, logger }) => {
    const needleworkPatternId = String(event.data?.needleworkPatternId ?? '')
    if (!needleworkPatternId) return { skipped: 'no needleworkPatternId' }

    // The render only runs where the loom's Fargate path is wired (the six
    // LOOM_RENDER_* env vars + the AWS CLI). Elsewhere this is a clean no-op.
    if (process.env.LOOM_RENDER !== 'fargate') {
      logger.info('needlework hero render skipped — LOOM_RENDER is not "fargate"', {
        needleworkPatternId,
      })
      return { skipped: 'render not wired (LOOM_RENDER!=fargate)' }
    }

    const row = await prisma.needleworkPattern.findUnique({
      where: { id: needleworkPatternId },
      select: { id: true, name: true, ownerUserId: true, vectorData: true, heroMediaId: true },
    })
    if (!row) return { skipped: 'pattern not found' }
    // Only owned create-your-own patterns get their hero rendered this way; the
    // catalogue routine renders its own.
    if (!row.ownerUserId) return { skipped: 'not an owned pattern' }
    if (row.heroMediaId) return { skipped: 'hero already rendered' }

    const canonical = fromStoredVectorData(row.vectorData)
    if (!canonical || canonical.stitchedElements.length === 0) {
      return { skipped: 'no stitch data on pattern' }
    }

    // Render on Fargate via the loom's production entrypoint (imported lazily so
    // the loom's Blender/AWS/Fal deps never enter the request bundle).
    const outDir = path.join(os.tmpdir(), 'homemade-loom-heroes')
    const mod = (await import('../../../scripts/loom-render-hero')) as unknown as RenderHeroModule
    const hero = await mod.renderHero(
      {
        name: `nw-${row.id}`,
        stitchedElements: canonical.stitchedElements as unknown[],
        finishedSizeMm: canonical.finishedSizeMm,
        fabricHex: canonical.fabricSpec?.colourHex ?? NEEDLEWORK_FABRIC_HEX,
        frameType: canonical.frameType,
        defaultThread: canonical.defaultThread ?? { type: 'stranded-cotton', weight: '3-strand' },
        strands: 3,
      },
      { persist: true, tameWarm: false, r2Prefix: 'patterns/needlework', outDir },
    )
    if (!hero.r2) throw new Error('renderHero did not persist the hero to R2')

    const bytes = hero.bytes || safeBytes(hero.localHeroPath)
    const media = await prisma.media.create({
      data: {
        type: 'PHOTO',
        mimeType: 'image/png',
        filename: `${row.id}-hero.png`,
        alt: `${row.name} — finished embroidery`,
        width: hero.width,
        height: hero.height,
        bytes,
        status: 'READY',
        r2Key: hero.r2.key,
        source: 'loom-render',
        requiresAttribution: false,
      },
      select: { id: true },
    })

    await prisma.needleworkPattern.update({
      where: { id: row.id },
      data: { heroMediaId: media.id, thumbnailMediaId: media.id },
    })

    logger.info('needlework hero rendered on Fargate', {
      needleworkPatternId: row.id,
      pathTaken: hero.pathTaken,
      r2Key: hero.r2.key,
    })
    return { needleworkPatternId: row.id, mediaId: media.id, pathTaken: hero.pathTaken }
  },
)

function safeBytes(p: string): number {
  try {
    return readFileSync(p).length
  } catch {
    return 0
  }
}
