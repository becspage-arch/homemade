'use server'

import { prisma } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { captureServerEvent } from '@/lib/posthog'
import { isValidSlug, slugify } from '@/lib/slug'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  DIETARY_FLAGS,
  type IngredientSearchResult,
} from './ingredient-constants'

/**
 * Type-ahead lookup for the structured-ingredients TipTap block. Matches on
 * name + aliases + slug, case-insensitive. Admin-only — anonymous reads of
 * the master ingredient table happen via the public renderer.
 */
export async function searchIngredients(
  q: string,
  limit = 12,
): Promise<IngredientSearchResult[]> {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) throw new Error('Not authorised.')

  const query = q.trim()
  if (!query) {
    return prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      take: Math.min(Math.max(limit, 1), 40),
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
  }

  const rows = await prisma.ingredient.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
        { aliases: { has: query.toLowerCase() } },
      ],
    },
    orderBy: { name: 'asc' },
    take: Math.min(Math.max(limit, 1), 40),
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
  return rows
}

interface CreateIngredientInput {
  name: string
  slug?: string | null
  category: string
  defaultUnit: string
  dietaryFlags?: string[]
}

/**
 * Inline "Create new ingredient" affordance the structured-ingredients block
 * uses when an author types a name that isn't in the master table. Admin only.
 */
export async function createIngredientFromEditor(
  input: CreateIngredientInput,
): Promise<IngredientSearchResult> {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) throw new Error('Not authorised.')

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
    .filter((f) => (DIETARY_FLAGS as readonly string[]).includes(f))

  const existing = await prisma.ingredient.findUnique({ where: { slug } })
  if (existing) {
    // Treat as idempotent — return the row rather than failing, so re-clicking
    // "create" in a flaky session doesn't trap the author.
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
    data: {
      slug,
      name,
      category,
      defaultUnit,
      dietaryFlags,
    },
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
    action: 'ingredient.create_from_editor',
    resource: `Ingredient:${created.id}`,
    metadata: { slug: created.slug, name: created.name, category: created.category },
  })

  void captureServerEvent({
    event: 'ingredient_created_inline',
    distinctId: user.clerkId,
    properties: {
      ingredientSlug: created.slug,
      category: created.category,
    },
  })

  return created
}
