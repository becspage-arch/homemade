'use server'

import { revalidatePath } from 'next/cache'
import {
  prisma,
  Prisma,
  UserRecipeStatus,
  UserRecipeVisibility,
  MealType,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { captureServerEvent } from '@/lib/posthog'
import { isValidSlug, slugify } from '@/lib/slug'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  DIETARY_FLAGS as ING_DIETARY_FLAGS,
  type IngredientSearchResult,
} from '@/app/admin/tutorials/ingredient-constants'
import {
  RECIPE_CATEGORY_SLUGS,
  MEAL_TYPE_VALUES,
  ORIGINALITY_VALUES,
  ORIGINALITY_NEEDS_ATTRIBUTION,
  VISIBILITY_VALUES,
  DIETARY_FLAGS,
} from './recipe-vocab'
import {
  syncUserRecipeIngredients,
  type UserRecipeIngredientInput,
} from './user-recipe-ingredients'

// ── Ingredient typeahead + inline create (creator-facing) ──────────────────
//
// The admin editor's `searchIngredients` / `createIngredientFromEditor` are
// admin-gated. Makers authoring their own recipes need the same affordances,
// so these signed-in variants read the same master table and create rows the
// same way. A new ingredient a Maker adds is a plain master row; the recipe it
// sits in still goes through AI moderation before it can be seen by anyone.

export async function searchIngredientsForCreator(
  q: string,
  limit = 12,
): Promise<IngredientSearchResult[]> {
  const user = await getCurrentDbUser()
  if (!user) throw new Error('Please sign in.')

  const take = Math.min(Math.max(limit, 1), 40)
  const query = q.trim()
  const select = {
    id: true,
    slug: true,
    name: true,
    pluralName: true,
    defaultUnit: true,
    dietaryFlags: true,
    category: true,
  } as const

  if (!query) {
    return prisma.ingredient.findMany({ orderBy: { name: 'asc' }, take, select })
  }

  return prisma.ingredient.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
        { aliases: { has: query.toLowerCase() } },
      ],
    },
    orderBy: { name: 'asc' },
    take,
    select,
  })
}

interface CreateIngredientInput {
  name: string
  slug?: string | null
  category: string
  defaultUnit: string
  dietaryFlags?: string[]
}

export async function createIngredientForCreator(
  input: CreateIngredientInput,
): Promise<IngredientSearchResult> {
  const user = await getCurrentDbUser()
  if (!user) throw new Error('Please sign in.')

  const name = input.name.trim()
  if (!name) throw new Error('Ingredient name is required.')

  const slug = (input.slug?.trim() || slugify(name)).toLowerCase()
  if (!isValidSlug(slug)) {
    throw new Error('Slug must be lowercase letters, numbers, and hyphens only.')
  }

  const category = input.category.trim().toLowerCase()
  if (!(INGREDIENT_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error(`Unknown ingredient category: ${category}.`)
  }
  const defaultUnit = input.defaultUnit.trim()
  if (!(INGREDIENT_UNITS as readonly string[]).includes(defaultUnit)) {
    throw new Error(`Unknown default unit: ${defaultUnit}.`)
  }
  const dietaryFlags = (input.dietaryFlags ?? [])
    .map((f) => f.trim())
    .filter((f) => (ING_DIETARY_FLAGS as readonly string[]).includes(f))

  const existing = await prisma.ingredient.findUnique({ where: { slug } })
  if (existing) {
    return {
      id: existing.id,
      slug: existing.slug,
      name: existing.name,
      pluralName: existing.pluralName,
      defaultUnit: existing.defaultUnit,
      dietaryFlags: existing.dietaryFlags,
      category: existing.category,
    }
  }

  const created = await prisma.ingredient.create({
    data: { slug, name, category, defaultUnit, dietaryFlags },
    select: {
      id: true,
      slug: true,
      name: true,
      pluralName: true,
      defaultUnit: true,
      dietaryFlags: true,
      category: true,
    },
  })

  await audit({
    actorId: user.id,
    action: 'ingredient.create_from_recipe_form',
    resource: `Ingredient:${created.id}`,
    metadata: { slug: created.slug, name: created.name, category: created.category },
  })

  return created
}

// ── Save / submit / manage a user recipe ───────────────────────────────────

export interface UserRecipeFormInput {
  /** Present when editing an existing recipe; absent when creating. */
  id?: string | null
  title: string
  summary: string | null
  /** TipTap JSON for the method body. */
  body: unknown
  heroPhotoMediaId: string | null
  galleryMediaIds: string[]
  ingredients: UserRecipeIngredientInput[]
  servings: number
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  temperatureCelsius: number | null
  cuisineTags: string[]
  dietaryTags: string[]
  mealType: string | null
  categorySlug: string
  originalityType: string | null
  attribution: string | null
  visibility: string
}

export interface SaveRecipeResult {
  ok: boolean
  id?: string
  slug?: string
  error?: string
}

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }

async function uniqueRecipeSlug(title: string, ignoreId: string | null): Promise<string> {
  const base = slugify(title).slice(0, 80) || 'recipe'
  let candidate = base
  for (let n = 0; n < 50; n++) {
    if (n > 0) candidate = `${base}-${n + 1}`
    const clash = await prisma.userRecipe.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!clash || clash.id === ignoreId) return candidate
  }
  // Extremely unlikely; fall back to a time-free random-ish suffix from the title length.
  return `${base}-${base.length}${title.length}`
}

function validateCore(input: UserRecipeFormInput): string | null {
  if (!input.title.trim()) return 'Give your recipe a title.'
  if (input.title.trim().length > 160) return 'Title is too long.'
  if (!Number.isFinite(input.servings) || input.servings < 1 || input.servings > 200) {
    return 'Servings should be a whole number between 1 and 200.'
  }
  if (!RECIPE_CATEGORY_SLUGS.includes(input.categorySlug)) {
    return 'Pick a category for your recipe.'
  }
  if (input.mealType && !MEAL_TYPE_VALUES.includes(input.mealType)) {
    return 'That meal type is not one of the options.'
  }
  if (input.originalityType && !ORIGINALITY_VALUES.includes(input.originalityType)) {
    return 'That originality choice is not one of the options.'
  }
  if (!VISIBILITY_VALUES.includes(input.visibility)) {
    return 'That visibility choice is not one of the options.'
  }
  if (input.galleryMediaIds.length > 6) {
    return 'Up to six gallery photos.'
  }
  if (
    input.originalityType &&
    ORIGINALITY_NEEDS_ATTRIBUTION.has(input.originalityType) &&
    !input.attribution?.trim()
  ) {
    return 'When a recipe is adapted from or inspired by another source, name the source.'
  }
  return null
}

function cleanTags(tags: string[], allowed?: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags) {
    const tag = raw.trim().toLowerCase()
    if (!tag) continue
    if (allowed && !allowed.includes(tag)) continue
    if (seen.has(tag)) continue
    seen.add(tag)
    out.push(tag)
  }
  return out
}

/**
 * Build the data payload shared by create + update. `submit` decides whether
 * the recipe enters the moderation queue (PENDING_AI_MODERATION) or stays a
 * DRAFT. Visibility is the Maker's choice either way; the moderation pass is
 * what actually flips a PUBLIC recipe live.
 */
function buildData(
  input: UserRecipeFormInput,
  ownerUserId: string,
  slug: string,
  submit: boolean,
): Prisma.UserRecipeUncheckedCreateInput {
  const prep = input.prepTimeMinutes
  const cook = input.cookTimeMinutes
  const total =
    prep != null || cook != null ? (prep ?? 0) + (cook ?? 0) : null

  return {
    slug,
    ownerUserId,
    title: input.title.trim(),
    summary: input.summary?.trim() || null,
    body: (input.body ?? EMPTY_DOC) as Prisma.InputJsonValue,
    heroPhotoMediaId: input.heroPhotoMediaId || null,
    galleryMediaIds: input.galleryMediaIds.slice(0, 6),
    cuisineTags: cleanTags(input.cuisineTags),
    dietaryTags: cleanTags(input.dietaryTags, DIETARY_FLAGS as readonly string[]),
    mealType: input.mealType ? (input.mealType as MealType) : null,
    servings: Math.round(input.servings),
    prepTimeMinutes: prep,
    cookTimeMinutes: cook,
    totalTimeMinutes: total,
    temperatureCelsius: input.temperatureCelsius,
    categorySlug: input.categorySlug,
    originalityType: input.originalityType || null,
    attribution: input.attribution?.trim() || null,
    visibility: input.visibility as UserRecipeVisibility,
    status: submit ? UserRecipeStatus.PENDING_AI_MODERATION : UserRecipeStatus.DRAFT,
  }
}

async function loadOwnedRecipe(id: string, ownerUserId: string) {
  const row = await prisma.userRecipe.findUnique({
    where: { id },
    select: { id: true, ownerUserId: true, slug: true },
  })
  if (!row || row.ownerUserId !== ownerUserId) return null
  return row
}

async function saveRecipe(
  input: UserRecipeFormInput,
  submit: boolean,
): Promise<SaveRecipeResult> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Please sign in.' }

  const problem = validateCore(input)
  if (problem) return { ok: false, error: problem }

  // Editing: confirm ownership and keep the existing slug.
  let recipeId = input.id?.trim() || null
  let slug: string
  if (recipeId) {
    const owned = await loadOwnedRecipe(recipeId, user.id)
    if (!owned) return { ok: false, error: 'That recipe could not be found.' }
    slug = owned.slug
  } else {
    slug = await uniqueRecipeSlug(input.title, null)
  }

  const data = buildData(input, user.id, slug, submit)

  if (recipeId) {
    const { slug: _slug, ownerUserId: _owner, ...updatable } = data
    await prisma.userRecipe.update({ where: { id: recipeId }, data: updatable })
  } else {
    const created = await prisma.userRecipe.create({ data, select: { id: true } })
    recipeId = created.id
  }

  await syncUserRecipeIngredients(recipeId, input.ingredients)

  void captureServerEvent({
    event: submit ? 'user_recipe_submitted' : 'user_recipe_draft_saved',
    distinctId: user.clerkId,
    properties: { categorySlug: input.categorySlug, visibility: input.visibility },
  })

  revalidatePath('/me/recipes')
  return { ok: true, id: recipeId, slug }
}

export async function saveUserRecipeDraft(
  input: UserRecipeFormInput,
): Promise<SaveRecipeResult> {
  return saveRecipe(input, false)
}

export async function submitUserRecipeForReview(
  input: UserRecipeFormInput,
): Promise<SaveRecipeResult> {
  return saveRecipe(input, true)
}

export async function deleteUserRecipe(id: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Please sign in.' }
  const owned = await loadOwnedRecipe(id, user.id)
  if (!owned) return { ok: false, error: 'That recipe could not be found.' }
  await prisma.userRecipe.delete({ where: { id } })
  revalidatePath('/me/recipes')
  return { ok: true }
}

export async function setUserRecipeVisibility(
  id: string,
  visibility: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Please sign in.' }
  if (!VISIBILITY_VALUES.includes(visibility)) {
    return { ok: false, error: 'That visibility choice is not one of the options.' }
  }
  const owned = await loadOwnedRecipe(id, user.id)
  if (!owned) return { ok: false, error: 'That recipe could not be found.' }
  await prisma.userRecipe.update({
    where: { id },
    data: { visibility: visibility as UserRecipeVisibility },
  })
  revalidatePath('/me/recipes')
  return { ok: true }
}

/** Move a DRAFT or REJECTED recipe back into the moderation queue. */
export async function resubmitUserRecipe(id: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: false, error: 'Please sign in.' }
  const owned = await loadOwnedRecipe(id, user.id)
  if (!owned) return { ok: false, error: 'That recipe could not be found.' }
  await prisma.userRecipe.update({
    where: { id },
    data: {
      status: UserRecipeStatus.PENDING_AI_MODERATION,
      aiModerationVerdict: null,
      aiModerationNotes: Prisma.DbNull,
      moderatedAt: null,
    },
  })
  revalidatePath('/me/recipes')
  return { ok: true }
}
