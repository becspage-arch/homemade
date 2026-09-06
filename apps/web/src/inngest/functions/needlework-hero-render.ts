import 'server-only'
import os from 'node:os'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { prisma } from '@homemade/db'
import { inngest } from '../client'
import { waitForRender } from '../loom-render-wait'
import { fromStoredVectorData } from '@/lib/needlework/pattern'
import { NEEDLEWORK_FABRIC_HEX } from '@/lib/needlework/create-your-own'
// Type-only: erased at compile, so the loom's Blender / AWS / Fal tooling never
// enters the request bundle. The values come in by dynamic import below.
import type { HeroRenderJob } from '../../../scripts/loom-render-hero'
import type { FargatePollResult } from '../../../scripts/loom-fargate-render'

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
 * ── THREE STEPS, NOT ONE ──────────────────────────────────────────────────
 * A Blender render is seven to nine minutes and an Inngest step is one HTTP
 * request, which the proxy in front of the site ends at about a hundred
 * seconds. So the render is not awaited: `start` puts the scene in S3 and
 * launches the ECS task, the run then SLEEPS and spends one `describe-tasks`
 * call a minute until it stops, and `finish` fetches the PNG and does the
 * upscale, the fidelity gate and the persist. Nothing local is carried between
 * them — the web service runs two tasks, so the finish is very likely a
 * different container from the start, and only plain JSON survives that.
 *
 * Best-effort by design:
 *   - If LOOM_RENDER is not 'fargate' (the render infra isn't wired in this
 *     environment) the job is a clean no-op — the pattern stays fully usable
 *     from its document; only the finished-piece preview is absent.
 *   - The loom (Blender + Fal + AWS CLI) is heavy, build-time-style tooling, so
 *     it is imported dynamically — it never enters the request-path bundle.
 */

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

/** The subset of the loom's renderHero surface this job depends on. */
interface RenderHeroModule {
  startHeroRender: (input: HeroInput, options: HeroOptions) => Promise<HeroRenderJob>
  pollHeroRender: (job: HeroRenderJob) => Promise<FargatePollResult>
  finishHeroRender: (job: HeroRenderJob, options: HeroOptions) => Promise<HeroResult>
}

const OUT_DIR = (): string => path.join(os.tmpdir(), 'homemade-loom-heroes')

async function loom(): Promise<RenderHeroModule> {
  return (await import('../../../scripts/loom-render-hero')) as unknown as RenderHeroModule
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
  async ({ event, step, logger }) => {
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

    // STEP 1 — read the row, build the scene, launch the task. Everything here
    // is quick; the eight minutes that follow are ECS's, not this request's.
    const started = await step.run('start', async (): Promise<{ skipped: string } | { job: HeroRenderJob }> => {
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

      const mod = await loom()
      const job = await mod.startHeroRender(
        {
          name: `nw-${row.id}`,
          stitchedElements: canonical.stitchedElements as unknown[],
          finishedSizeMm: canonical.finishedSizeMm,
          fabricHex: canonical.fabricSpec?.colourHex ?? NEEDLEWORK_FABRIC_HEX,
          frameType: canonical.frameType,
          defaultThread: canonical.defaultThread ?? { type: 'stranded-cotton', weight: '3-strand' },
          strands: 3,
        },
        { persist: true, tameWarm: false, r2Prefix: 'patterns/needlework', outDir: OUT_DIR() },
      )
      return { job }
    })
    if ('skipped' in started) return started
    const { job } = started

    // STEP 2 — sleep and poll. The run is suspended between polls, so the web
    // container is free for the whole of the render.
    await waitForRender(step, 'needlework-hero', async () => (await loom()).pollHeroRender(job))

    // STEP 3 — the picture. Fetch, upscale, gate, persist, attach.
    const done = await step.run('finish', async () => {
      const mod = await loom()
      const hero = await mod.finishHeroRender(job, {
        persist: true,
        tameWarm: false,
        r2Prefix: 'patterns/needlework',
        outDir: OUT_DIR(),
      })
      if (!hero.r2) throw new Error('finishHeroRender did not persist the hero to R2')

      const row = await prisma.needleworkPattern.findUnique({
        where: { id: needleworkPatternId },
        select: { id: true, name: true },
      })
      if (!row) return { skipped: 'pattern disappeared mid-render' }

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
      return { needleworkPatternId: row.id, mediaId: media.id, pathTaken: hero.pathTaken }
    })

    logger.info('needlework hero rendered on Fargate', { needleworkPatternId, ...done })
    return done
  },
)

function safeBytes(p: string): number {
  try {
    return readFileSync(p).length
  } catch {
    return 0
  }
}
