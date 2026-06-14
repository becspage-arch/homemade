'use server'

import { revalidatePath } from 'next/cache'
import { prisma, type MealType } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { mondayOf } from './meal-plan'

const MEAL_TYPES = new Set([
  'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'DRINK', 'SIDE', 'OTHER',
])

interface AddInput {
  weekStartIso: string
  dayOfWeek: number
  mealType: string
  tutorialSlug: string
}

/**
 * Slot a published library recipe into a (week, day, meal). Creates the week's
 * plan row lazily on first use. Signed-in only; the meal plan is saved per-user
 * state. Returns a small ok/error result the client surfaces inline.
 */
export async function addMealPlanEntry(
  input: AddInput,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Sign in to plan meals.' }

  if (input.dayOfWeek < 0 || input.dayOfWeek > 6) return { ok: false, error: 'Bad day.' }
  if (!MEAL_TYPES.has(input.mealType)) return { ok: false, error: 'Bad meal.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.weekStartIso)) return { ok: false, error: 'Bad week.' }

  const recipe = await prisma.tutorial.findFirst({
    where: { slug: input.tutorialSlug, status: 'PUBLISHED' },
    select: { id: true, slug: true, title: true },
  })
  if (!recipe) return { ok: false, error: 'Recipe not found.' }

  const weekStart = mondayOf(new Date(`${input.weekStartIso}T00:00:00Z`))
  const plan = await prisma.mealPlan.upsert({
    where: { ownerUserId_weekStartDate: { ownerUserId: user.id, weekStartDate: weekStart } },
    create: { ownerUserId: user.id, weekStartDate: weekStart },
    update: {},
  })

  await prisma.mealPlanEntry.create({
    data: {
      planId: plan.id,
      dayOfWeek: input.dayOfWeek,
      mealType: input.mealType as MealType,
      tutorialId: recipe.id,
      tutorialSlug: recipe.slug,
      tutorialTitle: recipe.title,
    },
  })

  revalidatePath('/meal-plan')
  return { ok: true }
}

/**
 * Remove an entry. Verifies the entry belongs to the signed-in user's plan
 * before deleting.
 */
export async function removeMealPlanEntry(
  entryId: string,
): Promise<{ ok: boolean }> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false }

  const entry = await prisma.mealPlanEntry.findUnique({
    where: { id: entryId },
    select: { plan: { select: { ownerUserId: true } } },
  })
  if (!entry || entry.plan.ownerUserId !== user.id) return { ok: false }

  await prisma.mealPlanEntry.delete({ where: { id: entryId } })
  revalidatePath('/meal-plan')
  return { ok: true }
}
