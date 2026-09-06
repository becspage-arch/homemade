import 'server-only'
import { prisma, UGCPhotoStatus, PatternType } from '@homemade/db'
import { mediaUrl } from './media'

/**
 * The one place that decides what a maker photo attaches to, and the one place
 * that decides whether a photo is allowed on a public surface.
 */

/** The made thing a photo belongs to. Exactly one shape, never both. */
export type PhotoTarget =
  | { kind: 'tutorial'; tutorialId: string }
  | { kind: 'pattern'; patternId: string; patternType: PatternType }

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

/** Plain-English label for a pattern type, used in the gate prompt and headings. */
export const PATTERN_TYPE_LABEL: Record<PatternType, string> = {
  CROSS_STITCH: 'cross-stitch pattern',
  KNITTING_CHART: 'knitting pattern',
  CROCHET_CHART: 'crochet pattern',
  NEEDLEWORK: 'needlework pattern',
  SEWING: 'sewing pattern',
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

/**
 * Whether one photo may be shown on a public surface. The single rule every
 * surface goes through, so "removed and rejected never show" is decided once.
 */
export function isPubliclyVisible(photo: {
  status: UGCPhotoStatus | string
  removedAt: Date | null
}): boolean {
  return photo.status === UGCPhotoStatus.APPROVED && photo.removedAt === null
}

/** The `where` fragment that scopes a query to one target. */
export function targetWhere(target: PhotoTarget) {
  return target.kind === 'tutorial'
    ? { tutorialId: target.tutorialId }
    : { patternId: target.patternId, patternType: target.patternType }
}

/** The fields written on a new photo row for one target. */
export function targetData(target: PhotoTarget) {
  return target.kind === 'tutorial'
    ? { tutorialId: target.tutorialId, patternId: null, patternType: null }
    : {
        tutorialId: null,
        patternId: target.patternId,
        patternType: target.patternType,
      }
}

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
