import 'server-only'
import { prisma, PatternType } from '@homemade/db'
import { mediaUrl } from './media'
import { PATTERN_TYPE_LABEL, type PhotoTarget } from './maker-photos'

/**
 * Resolves a photo target to the few facts the gate and the surfaces need:
 * what the thing is called, what kind of thing it is, where its page lives,
 * and (for a pattern) the chart or design image the gate compares against.
 *
 * Patterns live in five tables. This is the only switch over them.
 */

export interface ResolvedTarget {
  title: string
  /** Plain words for the gate prompt: "cross-stitch pattern", "recipe". */
  kind: string
  /** The public page to revalidate after a write. Null when there isn't one. */
  path: string | null
  /** Chart or design image URL, passed to the gate as a second image. */
  referenceImageUrl: string | null
  /** How many makers have finished it, where the count exists. */
  finishedCount: number | null
}

export async function resolveTarget(target: PhotoTarget): Promise<ResolvedTarget | null> {
  if (target.kind === 'tutorial') {
    const t = await prisma.tutorial.findUnique({
      where: { id: target.tutorialId },
      select: {
        title: true,
        slug: true,
        type: true,
        category: { select: { slug: true } },
      },
    })
    if (!t) return null
    return {
      title: t.title,
      kind: t.type === 'RECIPE' ? 'dish' : 'project',
      path: `/${t.category.slug}/${t.slug}`,
      referenceImageUrl: null,
      finishedCount: null,
    }
  }

  const kind = PATTERN_TYPE_LABEL[target.patternType]

  switch (target.patternType) {
    case PatternType.CROSS_STITCH: {
      const p = await prisma.pattern.findUnique({
        where: { id: target.patternId },
        select: {
          name: true,
          slug: true,
          completionCount: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
          thumbnail: { select: { cloudflareId: true, r2Key: true } },
        },
      })
      if (!p) return null
      return {
        title: p.name,
        kind,
        path: p.slug ? `/cross-stitch/patterns/${p.slug}` : null,
        // The chart thumbnail, not the styled hero: it is the design itself.
        referenceImageUrl: mediaUrl(p.thumbnail ?? p.hero, 'card'),
        finishedCount: p.completionCount,
      }
    }
    case PatternType.NEEDLEWORK: {
      const p = await prisma.needleworkPattern.findUnique({
        where: { id: target.patternId },
        select: {
          name: true,
          slug: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
          thumbnail: { select: { cloudflareId: true, r2Key: true } },
        },
      })
      if (!p) return null
      return {
        title: p.name,
        kind,
        path: p.slug ? `/needlework/patterns/${p.slug}` : null,
        referenceImageUrl: mediaUrl(p.thumbnail ?? p.hero, 'card'),
        // NeedleworkPattern carries no completionCount, so there is no count
        // to show rather than a made-up zero.
        finishedCount: null,
      }
    }
    case PatternType.CROCHET_CHART: {
      const p = await prisma.crochetPattern.findUnique({
        where: { id: target.patternId },
        select: {
          name: true,
          slug: true,
          completionCount: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
          thumbnail: { select: { cloudflareId: true, r2Key: true } },
        },
      })
      if (!p) return null
      return {
        title: p.name,
        kind,
        path: p.slug ? `/studio/crochet/${p.slug}` : null,
        referenceImageUrl: mediaUrl(p.hero ?? p.thumbnail, 'card'),
        finishedCount: p.completionCount,
      }
    }
    case PatternType.KNITTING_CHART: {
      const p = await prisma.knittingPattern.findUnique({
        where: { id: target.patternId },
        select: {
          name: true,
          slug: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
          thumbnail: { select: { cloudflareId: true, r2Key: true } },
        },
      })
      if (!p) return null
      return {
        title: p.name,
        kind,
        path: null,
        referenceImageUrl: mediaUrl(p.hero ?? p.thumbnail, 'card'),
        finishedCount: null,
      }
    }
    case PatternType.SEWING: {
      const p = await prisma.sewingPattern.findUnique({
        where: { id: target.patternId },
        select: {
          name: true,
          slug: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      })
      if (!p) return null
      return {
        title: p.name,
        kind,
        path: null,
        referenceImageUrl: mediaUrl(p.hero, 'card'),
        finishedCount: null,
      }
    }
    default:
      return null
  }
}
