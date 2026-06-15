import 'server-only'
import { prisma } from '@homemade/db'

export type MealTypeValue =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACK'
  | 'DESSERT'
  | 'DRINK'
  | 'SIDE'
  | 'OTHER'

export interface MealPlanEntryView {
  id: string
  dayOfWeek: number
  mealType: MealTypeValue
  tutorialSlug: string | null
  tutorialTitle: string | null
  /** Category slug for the recipe link, resolved at load time. Null when the
   *  recipe is no longer published or this is a free-text entry. */
  categorySlug: string | null
  /** Full href to the recipe: a library recipe links to its category page, a
   *  Maker's recipe to /recipes/[slug]. Null when not linkable. */
  recipeHref: string | null
  note: string | null
}

export interface MealPlanView {
  planId: string | null
  weekStartIso: string
  entries: MealPlanEntryView[]
}

/** Midnight-UTC Monday of the week containing `d`. */
export function mondayOf(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay() // 0 = Sun ... 6 = Sat
  const shift = day === 0 ? -6 : 1 - day
  date.setUTCDate(date.getUTCDate() + shift)
  return date
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function addDays(d: Date, n: number): Date {
  const date = new Date(d)
  date.setUTCDate(date.getUTCDate() + n)
  return date
}

/** Parse a `YYYY-MM-DD` week param to its normalised Monday, or fall back to
 *  the current week when missing or malformed. */
export function parseWeekStart(iso: string | null | undefined, now: Date): Date {
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const d = new Date(`${iso}T00:00:00Z`)
    if (!Number.isNaN(d.getTime())) return mondayOf(d)
  }
  return mondayOf(now)
}

/** Load the user's plan for a given Monday, returning an empty view when none
 *  exists yet (the plan row is created lazily on the first added entry). */
export async function getWeekPlan(
  userId: string,
  weekStart: Date,
): Promise<MealPlanView> {
  const plan = await prisma.mealPlan.findUnique({
    where: { ownerUserId_weekStartDate: { ownerUserId: userId, weekStartDate: weekStart } },
    include: { entries: { orderBy: [{ dayOfWeek: 'asc' }, { position: 'asc' }] } },
  })
  const entries = plan?.entries ?? []

  // Resolve the category slug for each library-recipe link in one query. Entries
  // backed by a Maker's UserRecipe (userRecipeId set) link to /recipes/[slug]
  // and don't need a category lookup.
  const tutorialSlugs = Array.from(
    new Set(
      entries
        .filter((e) => !e.userRecipeId && e.tutorialSlug)
        .map((e) => e.tutorialSlug as string),
    ),
  )
  const categoryBySlug = new Map<string, string>()
  if (tutorialSlugs.length > 0) {
    const rows = await prisma.tutorial.findMany({
      where: { slug: { in: tutorialSlugs }, status: 'PUBLISHED' },
      select: { slug: true, category: { select: { slug: true } } },
    })
    for (const r of rows) categoryBySlug.set(r.slug, r.category.slug)
  }

  return {
    planId: plan?.id ?? null,
    weekStartIso: isoDate(weekStart),
    entries: entries.map((e) => {
      const categorySlug =
        !e.userRecipeId && e.tutorialSlug ? categoryBySlug.get(e.tutorialSlug) ?? null : null
      const recipeHref = e.userRecipeId
        ? e.tutorialSlug
          ? `/recipes/${e.tutorialSlug}`
          : null
        : categorySlug && e.tutorialSlug
          ? `/${categorySlug}/${e.tutorialSlug}`
          : null
      return {
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        mealType: e.mealType as MealTypeValue,
        tutorialSlug: e.tutorialSlug,
        tutorialTitle: e.tutorialTitle,
        categorySlug,
        recipeHref,
        note: e.note,
      }
    }),
  }
}
