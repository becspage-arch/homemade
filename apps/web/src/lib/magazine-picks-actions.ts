'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@homemade/db'
import { audit } from './audit'
import { requireAdminRole } from './get-current-user'
import { isoWeekStartUtc } from './editorial-picks'

interface SetMagazinePickInput {
  categoryId: string
  /** Monday of the target week, ISO string. */
  weekStartingIso: string
  /** 1 = feature, 2..4 = supporting. */
  position: number
  tutorialId: string
  reason?: string | null
}

/**
 * Pin (or replace) a per-category magazine pick for a given week + position.
 * Idempotent: re-running with the same args updates the row in place.
 */
export async function setMagazinePickAction(
  input: SetMagazinePickInput,
): Promise<void> {
  const admin = await requireAdminRole({ minimum: 'EDITOR' })
  const weekStarting = isoWeekStartUtc(new Date(input.weekStartingIso))

  if (input.position < 1 || input.position > 4) {
    throw new Error(`position must be 1..4, got ${input.position}`)
  }

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true, slug: true, archetype: true },
  })
  if (!category) throw new Error(`Category ${input.categoryId} not found`)
  if (category.archetype !== 'RECIPE') {
    throw new Error(
      `Magazine picks are only used on RECIPE categories; ${category.slug} is ${category.archetype}.`,
    )
  }

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: input.tutorialId },
    select: { id: true, status: true, categoryId: true },
  })
  if (!tutorial) throw new Error(`Tutorial ${input.tutorialId} not found`)
  if (tutorial.categoryId !== input.categoryId) {
    throw new Error('Tutorial is not in the target category')
  }

  await prisma.categoryMagazinePick.upsert({
    where: {
      categoryId_weekStarting_position: {
        categoryId: input.categoryId,
        weekStarting,
        position: input.position,
      },
    },
    update: {
      tutorialId: input.tutorialId,
      selectedBy: admin.id,
      selectedAt: new Date(),
      reason: input.reason ?? null,
    },
    create: {
      categoryId: input.categoryId,
      weekStarting,
      position: input.position,
      tutorialId: input.tutorialId,
      selectedBy: admin.id,
      selectedAt: new Date(),
      reason: input.reason ?? null,
    },
  })

  await audit({
    actorId: admin.id,
    action: 'magazine_pick.set',
    resource: `CategoryMagazinePick:${input.categoryId}:${weekStarting.toISOString()}:${input.position}`,
    metadata: {
      categoryId: input.categoryId,
      weekStarting: weekStarting.toISOString(),
      position: input.position,
      tutorialId: input.tutorialId,
    },
  })

  revalidatePath('/admin/categories/magazine-picks')
  revalidatePath(`/${category.slug}`)
}

interface ClearMagazinePickInput {
  categoryId: string
  weekStartingIso: string
  position: number
}

export async function clearMagazinePickAction(
  input: ClearMagazinePickInput,
): Promise<void> {
  const admin = await requireAdminRole({ minimum: 'EDITOR' })
  const weekStarting = isoWeekStartUtc(new Date(input.weekStartingIso))

  const existing = await prisma.categoryMagazinePick.findUnique({
    where: {
      categoryId_weekStarting_position: {
        categoryId: input.categoryId,
        weekStarting,
        position: input.position,
      },
    },
    select: { id: true, category: { select: { slug: true } } },
  })
  if (!existing) return

  await prisma.categoryMagazinePick.delete({
    where: { id: existing.id },
  })

  await audit({
    actorId: admin.id,
    action: 'magazine_pick.clear',
    resource: `CategoryMagazinePick:${existing.id}`,
    metadata: {
      categoryId: input.categoryId,
      weekStarting: weekStarting.toISOString(),
      position: input.position,
    },
  })

  revalidatePath('/admin/categories/magazine-picks')
  if (existing.category) revalidatePath(`/${existing.category.slug}`)
}
