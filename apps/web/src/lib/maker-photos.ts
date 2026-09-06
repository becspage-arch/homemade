import 'server-only'
import { prisma, UGCPhotoStatus, PatternType } from '@homemade/db'
import { mediaUrl } from './media'
import {
  isPubliclyVisible,
  PATTERN_TYPE_LABEL,
  targetData,
  targetWhere,
  tutorialTakesMakerPhotos,
  type PhotoTarget,
} from './maker-photo-rules'

export {
  isPubliclyVisible,
  PATTERN_TYPE_LABEL,
  targetData,
  targetWhere,
  tutorialTakesMakerPhotos,
  type PhotoTarget,
}

/**
 * The one place that decides what a maker photo attaches to, and the one place
 * that decides whether a photo is allowed on a public surface.
 */

export interface MakerPhotoView {
  id: string
  thumbUrl: string | null
  fullUrl: string | null
  caption: string | null
  /** The handle credited beside the photo. */
  handle: string
  /** Set when the maker has a public profile, so the credit can link. */
  handleHref: string | null
  alt: string
  createdAt: string
}

/**
 * The Prisma `where` that a photo must match to appear anywhere public.
 * Approved, not removed. Pending and rejected photos are invisible, and a
 * removed photo is invisible whatever its status says.
 */
export const PUBLIC_PHOTO_WHERE = {
  status: UGCPhotoStatus.APPROVED,
  removedAt: null,
} as const

function handleOf(u: {
  displayHandle: string | null
  name: string | null
  email: string
}): string {
  return u.displayHandle ?? u.name ?? u.email.split('@')[0] ?? 'A maker'
}

/**
 * Approved, non-removed photos for one made thing, newest first. Featured
 * photos float to the front so an admin can put the best one at the head of the
 * strip.
 */
export async function loadMakerPhotos(
  target: PhotoTarget,
  opts: { take?: number } = {},
): Promise<MakerPhotoView[]> {
  const rows = await prisma.uGCPhoto.findMany({
    where: { ...targetWhere(target), ...PUBLIC_PHOTO_WHERE },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: opts.take ?? 24,
    select: {
      id: true,
      caption: true,
      createdAt: true,
      user: {
        select: {
          displayHandle: true,
          name: true,
          email: true,
          isPublicMakerProfile: true,
        },
      },
      media: { select: { cloudflareId: true, r2Key: true, alt: true } },
    },
  })

  return rows.map((r) => {
    const handle = handleOf(r.user)
    return {
      id: r.id,
      thumbUrl: mediaUrl(r.media, 'card'),
      fullUrl: mediaUrl(r.media, 'public'),
      caption: r.caption,
      handle,
      handleHref:
        r.user.isPublicMakerProfile && r.user.displayHandle
          ? `/m/${r.user.displayHandle}`
          : null,
      alt: r.media.alt ?? r.caption ?? `Photo by ${handle}`,
      createdAt: r.createdAt.toISOString(),
    }
  })
}

/** How many approved, visible photos one made thing has. */
export async function countMakerPhotos(target: PhotoTarget): Promise<number> {
  return prisma.uGCPhoto.count({
    where: { ...targetWhere(target), ...PUBLIC_PHOTO_WHERE },
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Gallery walls
// ────────────────────────────────────────────────────────────────────────────

/**
 * Which pattern types belong to which category, so a category gallery can pull
 * pattern photos alongside tutorial photos. Categories with no pattern craft
 * simply have no entry.
 */
const CATEGORY_PATTERN_TYPES: Record<string, PatternType[]> = {
  'cross-stitch': [PatternType.CROSS_STITCH],
  crochet: [PatternType.CROCHET_CHART],
  knitting: [PatternType.KNITTING_CHART],
  needlework: [PatternType.NEEDLEWORK],
  sewing: [PatternType.SEWING],
}

export interface MakerPhotoTile {
  photoId: string
  href: string
  title: string
  makerHandle: string
  imageSource: { cloudflareId: string | null; r2Key: string | null }
  createdAt: Date
}

/**
 * Approved, visible photos for a gallery wall. Pass a `categorySlug` for a
 * category's own wall, or leave it out for the site-wide wall on the home page.
 *
 * The href is worked out from the target so a tile always lands on the thing
 * the photo is of.
 */
export async function loadMakerPhotoTiles(opts: {
  categorySlug?: string | null
  limit?: number
}): Promise<MakerPhotoTile[]> {
  const limit = opts.limit ?? 36
  const slug = opts.categorySlug ?? null
  const patternTypes = slug ? (CATEGORY_PATTERN_TYPES[slug] ?? []) : null

  const targetFilter = slug
    ? {
        OR: [
          { tutorial: { category: { slug } } },
          ...(patternTypes && patternTypes.length > 0
            ? [{ patternType: { in: patternTypes } }]
            : []),
        ],
      }
    : {}

  const rows = await prisma.uGCPhoto.findMany({
    where: {
      ...PUBLIC_PHOTO_WHERE,
      // A photo only credits a maker who has a handle to credit.
      user: { displayHandle: { not: null } },
      ...targetFilter,
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      createdAt: true,
      tutorialId: true,
      patternId: true,
      patternType: true,
      user: { select: { displayHandle: true } },
      media: { select: { cloudflareId: true, r2Key: true } },
      tutorial: {
        select: { title: true, slug: true, category: { select: { slug: true } } },
      },
    },
  })

  const tiles: MakerPhotoTile[] = []
  for (const r of rows) {
    if (r.tutorial) {
      tiles.push({
        photoId: r.id,
        href: `/${r.tutorial.category.slug}/${r.tutorial.slug}`,
        title: r.tutorial.title,
        makerHandle: r.user.displayHandle!,
        imageSource: r.media,
        createdAt: r.createdAt,
      })
      continue
    }
    if (!r.patternId || !r.patternType) continue
    const resolved = await resolvePatternTile(r.patternId, r.patternType)
    if (!resolved) continue
    tiles.push({
      photoId: r.id,
      href: resolved.href,
      title: resolved.title,
      makerHandle: r.user.displayHandle!,
      imageSource: r.media,
      createdAt: r.createdAt,
    })
  }
  return tiles
}

/** Name and page for one pattern, for a gallery tile. */
async function resolvePatternTile(
  patternId: string,
  patternType: PatternType,
): Promise<{ title: string; href: string } | null> {
  switch (patternType) {
    case PatternType.CROSS_STITCH: {
      const p = await prisma.pattern.findUnique({
        where: { id: patternId },
        select: { name: true, slug: true },
      })
      if (!p) return null
      return {
        title: p.name,
        href: p.slug
          ? `/cross-stitch/patterns/${p.slug}`
          : `/studio/cross-stitch?patternId=${patternId}`,
      }
    }
    case PatternType.NEEDLEWORK: {
      const p = await prisma.needleworkPattern.findUnique({
        where: { id: patternId },
        select: { name: true, slug: true },
      })
      if (!p?.slug) return null
      return { title: p.name, href: `/needlework/patterns/${p.slug}` }
    }
    case PatternType.CROCHET_CHART: {
      const p = await prisma.crochetPattern.findUnique({
        where: { id: patternId },
        select: { name: true, slug: true },
      })
      if (!p?.slug) return null
      return { title: p.name, href: `/studio/crochet/${p.slug}` }
    }
    case PatternType.KNITTING_CHART: {
      const p = await prisma.knittingPattern.findUnique({
        where: { id: patternId },
        select: { name: true },
      })
      // Knitting patterns have no public page yet, so the tile links to the
      // craft's landing page rather than nowhere.
      return p ? { title: p.name, href: '/knitting' } : null
    }
    case PatternType.SEWING: {
      const p = await prisma.sewingPattern.findUnique({
        where: { id: patternId },
        select: { name: true },
      })
      return p ? { title: p.name, href: '/sewing' } : null
    }
    default:
      return null
  }
}
