/**
 * Shared gated DRAFT->PUBLISHED flip.
 *
 * The bulk "flip every DRAFT in these categories to PUBLISHED" scripts used a
 * blind `updateMany`, which is exactly how skeleton content reached the live
 * site. This helper replaces that: it loads each candidate row, runs the
 * unified publish gate (completeness AND per-type makeability), publishes ONLY
 * the rows that pass (clearing any prior qcBlockReason), and leaves the failing
 * rows at DRAFT with the structured failure recorded in qcBlockReason.
 *
 * Binary block / skip — no warning tier. AI-only; never a human queue.
 */
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { checkRowPublishable } from './qc-publish-gate.js'

export interface GatedPublishResult {
  candidates: number
  published: number
  blocked: number
  blockedSlugs: { slug: string; reasons: string[] }[]
}

/**
 * Publish every DRAFT row matching `where` that passes the unified publish gate
 * (completeness + makeability). `where` is merged with `{ status: 'DRAFT' }`.
 */
export async function gatedPublishDrafts(
  prisma: PrismaClient,
  where: Prisma.TutorialWhereInput,
  opts: { source: string } = { source: 'gatedPublishDrafts' },
): Promise<GatedPublishResult> {
  const rows = await prisma.tutorial.findMany({
    where: { ...where, status: 'DRAFT' },
    select: { id: true, slug: true },
  })

  const result: GatedPublishResult = {
    candidates: rows.length, published: 0, blocked: 0, blockedSlugs: [],
  }

  for (const r of rows) {
    const gate = await checkRowPublishable(prisma, r.id, opts.source)
    if (gate.publishable) {
      await prisma.tutorial.update({
        where: { id: r.id },
        data: { status: 'PUBLISHED', publishedAt: new Date(), qcBlockReason: Prisma.DbNull },
      })
      result.published++
    } else {
      await prisma.tutorial.update({
        where: { id: r.id },
        data: { qcBlockReason: gate.blockReason as Prisma.InputJsonValue },
      })
      result.blocked++
      result.blockedSlugs.push({ slug: r.slug, reasons: gate.reasons })
    }
  }
  return result
}
