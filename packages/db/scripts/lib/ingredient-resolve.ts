/**
 * Resolve an authored ingredient name to a master Ingredient row, or create one.
 * Matching is by normalised name / pluralName / alias / slug so we reuse the
 * existing 1,000+ rows rather than minting duplicates. Shared by the recipe
 * repair scripts.
 */
import type { PrismaClient } from '../../src/index.js'
import { norm } from '../../src/recipe-consistency.js'

export interface ResolvedIngredient {
  id: string
  slug: string
  name: string
  defaultUnit: string
}

export interface CreateSpec {
  name: string
  category: string
  defaultUnit: string
  aisle?: string
  aliases?: string[]
  isStaple?: boolean
  isAllergen?: boolean
  allergenType?: string
}

function slugify(s: string): string {
  return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

/** Build a normalised lookup over the whole table once. */
export async function buildMasterLookup(prisma: PrismaClient): Promise<Map<string, ResolvedIngredient>> {
  const rows = await prisma.ingredient.findMany({
    select: { id: true, slug: true, name: true, pluralName: true, aliases: true, defaultUnit: true },
  })
  const map = new Map<string, ResolvedIngredient>()
  for (const r of rows) {
    const res: ResolvedIngredient = { id: r.id, slug: r.slug, name: r.name, defaultUnit: r.defaultUnit }
    for (const key of [r.name, r.pluralName ?? '', r.slug.replace(/-/g, ' '), ...r.aliases]) {
      const k = norm(key)
      if (k && !map.has(k)) map.set(k, res)
    }
  }
  return map
}

/** Find an existing master ingredient by name/alias, else null. */
export function findInLookup(
  lookup: Map<string, ResolvedIngredient>,
  name: string,
): ResolvedIngredient | null {
  const n = norm(name)
  if (lookup.has(n)) return lookup.get(n)!
  // singular fallback ("strawberries" → "strawberry")
  if (n.endsWith('ies') && lookup.has(`${n.slice(0, -3)}y`)) return lookup.get(`${n.slice(0, -3)}y`)!
  if (n.endsWith('es') && lookup.has(n.slice(0, -2))) return lookup.get(n.slice(0, -2))!
  if (n.endsWith('s') && lookup.has(n.slice(0, -1))) return lookup.get(n.slice(0, -1))!
  return null
}

/** Create a master ingredient row and register it in the lookup. */
export async function createIngredient(
  prisma: PrismaClient,
  lookup: Map<string, ResolvedIngredient>,
  spec: CreateSpec,
): Promise<ResolvedIngredient> {
  let slug = slugify(spec.name)
  // de-dupe slug if taken
  const existingSlug = await prisma.ingredient.findUnique({ where: { slug } })
  if (existingSlug) slug = `${slug}-${Math.floor(Date.now() % 100000)}`
  const created = await prisma.ingredient.create({
    data: {
      slug,
      name: spec.name,
      category: spec.category,
      defaultUnit: spec.defaultUnit,
      aisle: (spec.aisle as never) ?? null,
      aliases: spec.aliases ?? [],
      isStaple: spec.isStaple ?? false,
      isAllergen: spec.isAllergen ?? false,
      allergenType: spec.allergenType ?? null,
    },
    select: { id: true, slug: true, name: true, defaultUnit: true },
  })
  const res: ResolvedIngredient = created
  lookup.set(norm(spec.name), res)
  return res
}
