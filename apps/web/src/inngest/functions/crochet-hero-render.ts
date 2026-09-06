import 'server-only'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '@homemade/db'
import { inngest } from '../client'
import { waitForRender } from '../loom-render-wait'
// Type-only: erased at compile, so the loom's Blender / AWS / Fal tooling never
// enters the request bundle. The values come in by dynamic import below.
import type { PatternRenderStart, RenderOnPublishResult } from '../../../scripts/render-pattern-on-publish'
import type { FargatePollResult } from '../../../scripts/loom-fargate-render'

/**
 * crochet/hero.render — the exact-pattern hero for a maker's own crochet
 * design, rendered on Fargate.
 *
 * The create-your-own route saves the pattern instantly (chart, written rounds,
 * the whole document) and emits this event; the render runs here, off the saved
 * row, so the maker is never held for the minutes a photoreal render takes. When
 * it lands, the finished-piece photo attaches to the pattern.
 *
 * The render is the SAME loom pipeline the catalogue uses
 * (`scripts/render-pattern-on-publish.ts`): compile the stored stitch program,
 * relax it, put it through the audit gate, render the deterministic base in
 * Blender on Fargate, finish it through the fidelity-gated photoreal pass, and
 * write the hero plus the regenerated chart and words back. Nothing about the
 * loom changes here; this job only invokes it.
 *
 * ── THREE STEPS, NOT ONE ──────────────────────────────────────────────────
 * A Blender render is seven to nine minutes and an Inngest step is one HTTP
 * request, which the proxy in front of the site ends at about a hundred
 * seconds. So the render is not awaited: `start` compiles, audits and launches
 * the ECS task, the run then SLEEPS and spends one `describe-tasks` call a
 * minute until it stops, and `finish` fetches the PNG, finishes it and persists
 * it. The idempotency check and the audit gate both live in `start`, so a
 * no-op publish still costs a compile rather than a render.
 *
 * Best-effort by design, exactly as needlework's is:
 *   - If LOOM_RENDER is not 'fargate' the render infrastructure is not wired in
 *     this environment and the job is a clean no-op. The pattern stays fully
 *     usable; only the finished-piece photo is absent.
 *   - The loom (Blender, the AWS CLI, Fal) is heavy build-time-style tooling, so
 *     it is imported dynamically and never enters the request-path bundle.
 */

interface RenderOnPublishModule {
  startPatternRender: (
    patternId: string,
    options?: { yr?: number; hero?: boolean; dryRun?: boolean; outDir?: string },
  ) => Promise<PatternRenderStart>
  pollPatternRender: (start: PatternRenderStart) => Promise<FargatePollResult>
  finishPatternRender: (
    start: PatternRenderStart,
    options?: { yr?: number; hero?: boolean; dryRun?: boolean; outDir?: string },
  ) => Promise<RenderOnPublishResult>
}

const OUT_DIR = (): string => path.join(os.tmpdir(), 'homemade-loom-crochet')

async function loom(): Promise<RenderOnPublishModule> {
  return (await import('../../../scripts/render-pattern-on-publish')) as unknown as RenderOnPublishModule
}

export const crochetHeroRender = inngest.createFunction(
  {
    id: 'crochet-hero-render',
    name: 'Crochet: render create-your-own hero (Fargate)',
    // A photoreal render is a 4-vCPU Blender task; keep a lid on how many run at
    // once and give the Fargate cold start and the render room before a retry.
    concurrency: { limit: 3 },
    retries: 2,
    triggers: [{ event: 'crochet/hero.render' }],
  },
  async ({ event, step, logger }) => {
    const crochetPatternId = String(event.data?.crochetPatternId ?? '')
    if (!crochetPatternId) return { skipped: 'no crochetPatternId' }

    if (process.env.LOOM_RENDER !== 'fargate') {
      logger.info('crochet hero render skipped — LOOM_RENDER is not "fargate"', { crochetPatternId })
      return { skipped: 'render not wired (LOOM_RENDER!=fargate)' }
    }

    // STEP 1 — read the row, compile, audit, launch the task. Everything that
    // can refuse the render refuses it here, before an ECS task is paid for.
    const started = await step.run(
      'start',
      async (): Promise<{ skipped: string } | { start: PatternRenderStart }> => {
        const row = await prisma.crochetPattern.findUnique({
          where: { id: crochetPatternId },
          select: { id: true, ownerUserId: true, loomProgram: true },
        })
        if (!row) return { skipped: 'pattern not found' }
        // Only a maker's own design is rendered this way; the catalogue renders
        // its own through the publish routine.
        if (!row.ownerUserId) return { skipped: 'not an owned pattern' }
        if (!row.loomProgram) return { skipped: 'no stitch program on pattern' }

        const mod = await loom()
        return { start: await mod.startPatternRender(crochetPatternId, { hero: true, outDir: OUT_DIR() }) }
      },
    )
    if ('skipped' in started) return started

    // Nothing was launched: no program, a failed audit, or geometry that has
    // not changed since the last successful render.
    const start = started.start as PatternRenderStart
    if (start.outcome) {
      if (start.outcome.status === 'AUDIT_FAILED') {
        logger.error('crochet hero render stopped at the audit gate', {
          crochetPatternId,
          problems: start.outcome.problems,
        })
      }
      return { crochetPatternId, status: start.outcome.status, problems: start.outcome.problems }
    }

    // STEP 2 — sleep and poll. The run is suspended between polls, so the web
    // container is free for the whole of the render.
    await waitForRender(step, 'crochet-hero', async () => (await loom()).pollPatternRender(start))

    // STEP 3 — the picture. Fetch, finish, persist, write back the faces.
    const result = await step.run('finish', async () =>
      (await loom()).finishPatternRender(start, { hero: true, outDir: OUT_DIR() }),
    )

    logger.info('crochet hero rendered on Fargate', {
      crochetPatternId,
      status: result.status,
      geometryHash: result.geometryHash,
    })
    return {
      crochetPatternId,
      status: result.status,
      fidelityScore: result.fidelityScore ?? null,
    }
  },
)
