import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/auth'
import { mediaUrl } from '@/lib/media'
import {
  RecipeForm,
  type RecipeFormInitial,
} from '@/components/public/recipes/recipe-form'
import type { RecipePhoto } from '@/components/public/recipes/recipe-photo-fields'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit recipe' }

async function resolvePhotos(ids: string[]): Promise<Map<string, RecipePhoto>> {
  const clean = ids.filter(Boolean)
  if (clean.length === 0) return new Map()
  const rows = await prisma.media.findMany({
    where: { id: { in: clean } },
    select: { id: true, r2Key: true },
  })
  const out = new Map<string, RecipePhoto>()
  for (const row of rows) {
    const url = mediaUrl({ r2Key: row.r2Key }, 'public')
    if (url) out.set(row.id, { mediaId: row.id, previewUrl: url })
  }
  return out
}

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const { id } = await params
  const recipe = await prisma.userRecipe.findUnique({
    where: { id },
    include: {
      ingredients: {
        orderBy: { order: 'asc' },
        include: { ingredient: { select: { slug: true, name: true } } },
      },
    },
  })
  if (!recipe || recipe.ownerUserId !== user.id) notFound()

  const photos = await resolvePhotos([
    ...(recipe.heroPhotoMediaId ? [recipe.heroPhotoMediaId] : []),
    ...recipe.galleryMediaIds,
  ])

  const initial: RecipeFormInitial = {
    id: recipe.id,
    title: recipe.title,
    summary: recipe.summary,
    body: recipe.body,
    hero: recipe.heroPhotoMediaId ? photos.get(recipe.heroPhotoMediaId) ?? null : null,
    gallery: recipe.galleryMediaIds
      .map((mid) => photos.get(mid))
      .filter((p): p is RecipePhoto => Boolean(p)),
    ingredients: recipe.ingredients.map((ri, i) => ({
      key: `row-${i}`,
      ingredientId: ri.ingredientId,
      ingredientSlug: ri.ingredient.slug,
      name: ri.ingredient.name,
      quantity: ri.quantity ? Number(ri.quantity) : null,
      unit: ri.unit,
      notes: ri.notes,
      isOptional: ri.isOptional,
    })),
    servings: recipe.servings,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    temperatureCelsius: recipe.temperatureCelsius,
    cuisineTags: recipe.cuisineTags,
    dietaryTags: recipe.dietaryTags,
    mealType: recipe.mealType,
    categorySlug: recipe.categorySlug,
    originalityType: recipe.originalityType,
    attribution: recipe.attribution,
    visibility: recipe.visibility,
  }

  return (
    <div>
      <p className="me-section-label">Your recipes</p>
      <h2 className="me-section-title">Edit recipe</h2>
      <p className="me-section-description">
        Changes are saved when you choose. Sending it for review again starts a fresh review pass.{' '}
        <Link href="/me/recipes" className="recipe-back-link">
          Back to your recipes
        </Link>
      </p>
      <RecipeForm initial={initial} />
    </div>
  )
}
