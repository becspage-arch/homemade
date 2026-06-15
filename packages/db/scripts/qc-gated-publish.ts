/**
 * Shared gated DRAFT->PUBLISHED flip.
 *
 * The bulk "flip every DRAFT in these categories to PUBLISHED" scripts used a
 * blind `updateMany`, which is exactly how skeleton content reached the live
 * site. This helper replaces that: it loads each candidate row, runs the
 * per-category completeness gate, publishes ONLY the rows that pass (clearing
 * any prior qcBlockReason), and leaves the failing rows at DRAFT with the
 * structured failure recorded in qcBlockReason for the qc-fix pass.
 *
 * Binary block / skip — no warning tier. AI-only; never a human queue.
 */
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { buildQcBlockReason, checkCompleteness } from './qc-completeness-rules/index.js'

export interface GatedPublishResult {
  candidates: number
  published: number
  blocked: number
  blockedSlugs: { slug: string; reasons: string[] }[]
}

/**
 * Publish every DRAFT row matching `where` that passes its completeness gate.
 * `where` is merged with `{ status: 'DRAFT' }`.
 */
export async function gatedPublishDrafts(
  prisma: PrismaClient,
  where: Prisma.TutorialWhereInput,
  opts: { source: string } = { source: 'gatedPublishDrafts' },
): Promise<GatedPublishResult> {
  const rows = await prisma.tutorial.findMany({
    where: { ...where, status: 'DRAFT' },
    select: {
      id: true, slug: true, type: true, body: true,
      servings: true, yieldDescription: true, totalMinutes: true,
      timeMinutes: true, prepMinutes: true, cookMinutes: true,
      chartDefinition: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
    },
  })

  const checkedAt = new Date().toISOString()
  const result: GatedPublishResult = {
    candidates: rows.length, published: 0, blocked: 0, blockedSlugs: [],
  }

  for (const r of rows) {
    const completeness = checkCompleteness({
      slug: r.slug,
      categorySlug: r.category.slug,
      subCategorySlug: r.subCategory?.slug ?? null,
      type: r.type,
      body: r.body,
      servings: r.servings,
      yieldDescription: r.yieldDescription,
      totalMinutes: r.totalMinutes,
      timeMinutes: r.timeMinutes,
      prepMinutes: r.prepMinutes,
      cookMinutes: r.cookMinutes,
      hasChart: r.chartDefinition != null,
    })

    if (completeness.ok) {
      await prisma.tutorial.update({
        where: { id: r.id },
        data: { status: 'PUBLISHED', publishedAt: new Date(), qcBlockReason: Prisma.DbNull },
      })
      result.published++
    } else {
      await prisma.tutorial.update({
        where: { id: r.id },
        data: {
          qcBlockReason: buildQcBlockReason(completeness, {
            blockedFromStatus: 'PUBLISHED', checkedAt, source: opts.source,
          }) as Prisma.InputJsonValue,
        },
      })
      result.blocked++
      result.blockedSlugs.push({ slug: r.slug, reasons: completeness.reasons })
    }
  }
  return result
}
