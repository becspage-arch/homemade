'use server'

import { revalidatePath } from 'next/cache'
import { prisma, UserPhotoStatus, PatternType } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import { UserRole } from '@homemade/db'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function reviewUserPatternPhoto(input: {
  photoId: string
  action: 'APPROVE' | 'REJECT' | 'FEATURE' | 'HERO'
  reviewNotes?: string
}): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.EDITOR)) {
    return { ok: false, error: 'Not authorised.' }
  }

  const photo = await prisma.userPatternPhoto.findUnique({
    where: { id: input.photoId },
  })
  if (!photo) return { ok: false, error: 'Photo not found.' }

  const now = new Date()

  if (input.action === 'REJECT') {
    await prisma.userPatternPhoto.update({
      where: { id: input.photoId },
      data: {
        status: UserPhotoStatus.REJECTED,
        reviewedAt: now,
        reviewedByUserId: user.id,
        reviewNotes: input.reviewNotes ?? null,
      },
    })
    revalidatePath('/admin/user-pattern-photos')
    return { ok: true }
  }

  if (input.action === 'APPROVE') {
    await prisma.userPatternPhoto.update({
      where: { id: input.photoId },
      data: {
        status: UserPhotoStatus.APPROVED,
        reviewedAt: now,
        reviewedByUserId: user.id,
        reviewNotes: input.reviewNotes ?? null,
      },
    })
    revalidatePath('/admin/user-pattern-photos')
    return { ok: true }
  }

  if (input.action === 'FEATURE') {
    await prisma.userPatternPhoto.update({
      where: { id: input.photoId },
      data: {
        status: UserPhotoStatus.APPROVED,
        isFeatured: true,
        reviewedAt: now,
        reviewedByUserId: user.id,
        reviewNotes: input.reviewNotes ?? null,
      },
    })
    revalidatePath('/admin/user-pattern-photos')
    return { ok: true }
  }

  if (input.action === 'HERO') {
    // Unset isHero on any previous hero for this patternId + patternType
    await prisma.userPatternPhoto.updateMany({
      where: {
        patternId: photo.patternId,
        patternType: photo.patternType,
        isHero: true,
        NOT: { id: input.photoId },
      },
      data: { isHero: false },
    })

    await prisma.userPatternPhoto.update({
      where: { id: input.photoId },
      data: {
        status: UserPhotoStatus.APPROVED,
        isFeatured: true,
        isHero: true,
        reviewedAt: now,
        reviewedByUserId: user.id,
        reviewNotes: input.reviewNotes ?? null,
      },
    })

    // Set preferUserPhotoForHero=true on the parent pattern
    if (photo.patternType === PatternType.CROSS_STITCH) {
      await prisma.pattern.update({
        where: { id: photo.patternId },
        data: { preferUserPhotoForHero: true },
      })
    } else {
      // CrochetPattern (CROCHET_CHART)
      await prisma.crochetPattern.update({
        where: { id: photo.patternId },
        data: { preferUserPhotoForHero: true },
      })
    }

    revalidatePath('/admin/user-pattern-photos')
    return { ok: true }
  }

  return { ok: false, error: 'Unknown action.' }
}
