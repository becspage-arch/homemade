import 'server-only'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '@homemade/db'
import { inngest } from '../client'

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
 * (`scripts/render-pattern-on-publish.ts` → `renderProgram` /
 * `renderComposition`): compile the stored stitch program, relax it, put it
 * through the audit gate, render the deterministic base in Blender on Fargate,
 * finish it through the fidelity-gated photoreal pass, and write the hero plus
 * the regenerated chart and words back. Nothing about the loom changes here;
 * this job only invokes it.
 *
 * Best-effort by design, exactly as needlework's is:
 *   - If LOOM_RENDER is not 'fargate' the render infrastructure is not wired in
 *     this environment and the job is a clean no-op. The pattern stays fully
 *     usable; only the finished-piece photo is absent.
 *   - The loom (Blender, the AWS CLI, Fal) is heavy build-time-style tooling, so
 *     it is imported dynamically and never enters the request-path bundle.
 */

interface RenderOnPublishModule {
  renderPatternOnPublish: (
    patternId: string,
    options?: { yr?: number; hero?: boolean; dryRun?: boolean; outDir?: string },
  ) => Promise<{
    patternId: string
    status: 'RENDERED' | 'SKIPPED_UNCHANGED' | 'AUDIT_FAILED' | 'NO_PROGRAM'
    geometryHash?: string
    fidelityScore?: number | null
    heroUrl?: string
    problems?: string[]
  }>
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
  async ({ event, logger }) => {
    const crochetPatternId = String(event.data?.crochetPatternId ?? '')
    if (!crochetPatternId) return { skipped: 'no crochetPatternId' }

    if (process.env.LOOM_RENDER !== 'fargate') {
      logger.info('crochet hero render skipped — LOOM_RENDER is not "fargate"', { crochetPatternId })
      return { skipped: 'render not wired (LOOM_RENDER!=fargate)' }
    }

    const row = await prisma.crochetPattern.findUnique({
      where: { id: crochetPatternId },
      select: { id: true, ownerUserId: true, loomProgram: true },
    })
    if (!row) return { skipped: 'pattern not found' }
    // Only a maker's own design is rendered this way; the catalogue renders its
    // own through the publish routine.
    if (!row.ownerUserId) return { skipped: 'not an owned pattern' }
    if (!row.loomProgram) return { skipped: 'no stitch program on pattern' }

    const outDir = path.join(os.tmpdir(), 'homemade-loom-crochet')
    const mod = (await import('../../../scripts/render-pattern-on-publish')) as unknown as RenderOnPublishModule
    const result = await mod.renderPatternOnPublish(crochetPatternId, { hero: true, outDir })

    if (result.status === 'AUDIT_FAILED') {
      logger.error('crochet hero render stopped at the audit gate', {
        crochetPatternId,
        problems: result.problems,
      })
      return { crochetPatternId, status: result.status, problems: result.problems }
    }

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
