'use server'

import { revalidatePath } from 'next/cache'
import { prisma, PatternType, UGCPhotoStatus } from '@homemade/db'
import { requireAdminRole } from '@/lib/get-current-user'
import { audit } from '@/lib/audit'

type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * Curation on the unified photo page: Feature puts a photo in the parent
 * pattern's gallery, Hero makes it the pattern's hero image. Both only apply to
 * an approved, visible pattern photo.
 */

async function loadPatternPhoto(photoId: string) {
  const photo = await prisma.uGCPhoto.findUnique({
    where: { id: photoId },
    select: {
      id: true,
      mediaId: true,
      patternId: true,
      patternType: true,
      status: true,
      removedAt: true,
    },
  })
  if (!photo) return { photo: null, error: 'Photo not found.' as const }
  if (!photo.patternId || !photo.patternType) {
    return { photo: null, error: 'That photo does not belong to a pattern.' as const }
  }
  if (photo.status !== UGCPhotoStatus.APPROVED || photo.removedAt) {
    return { photo: null, error: 'Only a photo that is live can be featured.' as const }
  }
  return { photo, error: null }
}

/** Add (or remove) a photo from the parent pattern's gallery. */
export async function toggleFeaturePhoto(input: {
  photoId: string
  featured: boolean
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })
  const { photo, error } = await loadPatternPhoto(input.photoId)
  if (!photo) return { ok: false, error }

  await prisma.uGCPhoto.update({
    where: { id: photo.id },
    data: { isFeatured: input.featured },
  })

  // galleryMediaIds only exists on the two models that carry a gallery.
  const patternId = photo.patternId!
  if (photo.patternType === PatternType.CROSS_STITCH) {
    const row = await prisma.pattern.findUnique({
      where: { id: patternId },
      select: { galleryMediaIds: true },
    })
    if (row) {
      await prisma.pattern.update({
        where: { id: patternId },
        data: { galleryMediaIds: nextGallery(row.galleryMediaIds, photo.mediaId, input.featured) },
      })
    }
  } else if (photo.patternType === PatternType.NEEDLEWORK) {
    const row = await prisma.needleworkPattern.findUnique({
      where: { id: patternId },
      select: { galleryMediaIds: true },
    })
    if (row) {
      await prisma.needleworkPattern.update({
        where: { id: patternId },
        data: { galleryMediaIds: nextGallery(row.galleryMediaIds, photo.mediaId, input.featured) },
      })
    }
  }

  await audit({
    actorId: actor.id,
    action: input.featured ? 'maker_photo.featured' : 'maker_photo.unfeatured',
    resource: `UGCPhoto:${photo.id}`,
    metadata: {},
  })
  revalidatePath('/admin/ugc-photos')
  return { ok: true }
}

function nextGallery(current: unknown, mediaId: string, add: boolean): string[] {
  const ids = Array.isArray(current)
    ? current.filter((v): v is string => typeof v === 'string')
    : []
  const without = ids.filter((id) => id !== mediaId)
  return add ? [...without, mediaId] : without
}

/**
 * Make this photo the pattern's hero. Only the models that carry
 * `preferUserPhotoForHero` can take one.
 */
export async function setPhotoAsHero(input: { photoId: string }): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })
  const { photo, error } = await loadPatternPhoto(input.photoId)
  if (!photo) return { ok: false, error }

  const patternId = photo.patternId!
  const patternType = photo.patternType!

  await prisma.uGCPhoto.updateMany({
    where: { patternId, patternType, isHero: true, NOT: { id: photo.id } },
    data: { isHero: false },
  })
  await prisma.uGCPhoto.update({
    where: { id: photo.id },
    data: { isHero: true, isFeatured: true },
  })

  switch (patternType) {
    case PatternType.CROSS_STITCH:
      await prisma.pattern.update({
        where: { id: patternId },
        data: { preferUserPhotoForHero: true },
      })
      break
    case PatternType.CROCHET_CHART:
      await prisma.crochetPattern.update({
        where: { id: patternId },
        data: { preferUserPhotoForHero: true },
      })
      break
    case PatternType.KNITTING_CHART:
      await prisma.knittingPattern.update({
        where: { id: patternId },
        data: { preferUserPhotoForHero: true },
      })
      break
    case PatternType.SEWING:
      await prisma.sewingPattern.update({
        where: { id: patternId },
        data: { preferUserPhotoForHero: true },
      })
      break
    case PatternType.NEEDLEWORK:
      // NeedleworkPattern has no preferUserPhotoForHero column; the photo is
      // flagged and shows in the gallery instead.
      break
  }

  await audit({
    actorId: actor.id,
    action: 'maker_photo.set_hero',
    resource: `UGCPhoto:${photo.id}`,
    metadata: { patternId, patternType },
  })
  revalidatePath('/admin/ugc-photos')
  return { ok: true }
}
