import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { isPremiumContent, canAccessPremiumContent } from '@/lib/entitlements'
import { PremiumBadge, UpgradeBlock } from '@/components/premium'
import { resolveUserUnitPreferences } from '@/lib/recipes/user-unit-preferences'
import { formatIngredientQuantity, formatTemperature } from '@/lib/recipes/units'
import { mediaUrl } from '@/lib/media'
import { TutorialContent } from '@/components/public/tutorial-content/tutorial-content'
import { AddToShoppingList } from '@/components/public/recipes/add-to-shopping-list'
import { AddToMealPlan } from '@/components/public/recipes/add-to-meal-plan'
import { SaveRecipeButton } from '@/components/public/recipes/save-recipe-button'
import { DIETARY_LABEL, cuisineLabel } from '@/lib/recipes/recipe-vocab'
import type { TipTapNode } from '@/components/public/tutorial-content/types'

import './user-recipe.css'

export const dynamic = 'force-dynamic'

async function loadRecipe(slug: string) {
  return prisma.userRecipe.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true, displayHandle: true } },
      ingredients: {
        orderBy: { order: 'asc' },
        include: {
          ingredient: { select: { name: true, pluralName: true, densityGPerMl: true } },
        },
      },
    },
  })
}

function dietaryLabelOf(flag: string): string {
  return (DIETARY_LABEL as Record<string, string>)[flag] ?? flag.replace(/([A-Z])/g, ' $1').toLowerCase()
}

function minutesLabel(mins: number | null): string | null {
  if (mins == null) return null
  if (mins < 60) return `${mins} mins`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} mins`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const recipe = await loadRecipe(slug)
  if (!recipe) return { title: 'Recipe' }
  return {
    title: recipe.title,
    description: recipe.summary ?? undefined,
    // Community recipes are not indexed until the public collection opens.
    robots: { index: false, follow: false },
  }
}

export default async function UserRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [recipe, user] = await Promise.all([loadRecipe(slug), getCurrentDbUser()])
  if (!recipe) notFound()

  const isOwner = user?.id === recipe.ownerUserId
  const isLive = recipe.status === 'APPROVED'
  const isViewable =
    isOwner || (isLive && (recipe.visibility === 'PUBLIC' || recipe.visibility === 'UNLISTED'))
  if (!isViewable) notFound()

  // Cross-craft content gate: a community recipe is independent-creator content
  // — premium by the same rule the pattern crafts use. The owner always reads
  // their own; everyone else gets the head + hero preview, badged, with the
  // ingredients + method held behind premium. (Printing / downloading stays the
  // separate universal premium action.)
  const recipeContent = { premium: true }
  const premiumContent = isPremiumContent(recipeContent)
  const canAccess = isOwner || canAccessPremiumContent(user, recipeContent)

  // Count a view for non-owners on a live recipe (best effort, never blocks).
  if (!isOwner && isLive) {
    void prisma.userRecipe
      .update({ where: { id: recipe.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {})
  }

  const prefs = await resolveUserUnitPreferences(user)

  // Make-it-list save state. Anonymous readers see the Save button too;
  // tapping it routes them through sign-in.
  const savedRecipe = user
    ? Boolean(
        await prisma.savedRecipe.findUnique({
          where: { userId_userRecipeId: { userId: user.id, userRecipeId: recipe.id } },
          select: { id: true },
        }),
      )
    : false

  // Resolve hero + gallery media keys.
  const mediaIds = [
    ...(recipe.heroPhotoMediaId ? [recipe.heroPhotoMediaId] : []),
    ...recipe.galleryMediaIds,
  ]
  const media = mediaIds.length
    ? await prisma.media.findMany({
        where: { id: { in: mediaIds } },
        select: { id: true, r2Key: true, alt: true },
      })
    : []
  const mediaById = new Map(media.map((m) => [m.id, m]))
  const hero = recipe.heroPhotoMediaId ? mediaById.get(recipe.heroPhotoMediaId) : null
  const heroSrc = hero ? mediaUrl({ r2Key: hero.r2Key }, 'hero') : null
  const gallery = recipe.galleryMediaIds
    .map((id) => mediaById.get(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))

  const temperatureLabel =
    recipe.temperatureCelsius != null ? formatTemperature(recipe.temperatureCelsius, prefs.oven) : null

  const metaBits = [
    recipe.servings ? `Serves ${recipe.servings}` : null,
    minutesLabel(recipe.prepTimeMinutes) ? `Prep ${minutesLabel(recipe.prepTimeMinutes)}` : null,
    minutesLabel(recipe.cookTimeMinutes) ? `Cook ${minutesLabel(recipe.cookTimeMinutes)}` : null,
    temperatureLabel ? `Oven ${temperatureLabel}` : null,
  ].filter(Boolean) as string[]

  return (
    <main className="user-recipe">
      {!isLive && (
        <p className="user-recipe-preview-note">
          This is a preview of your recipe. Only you can see it until it passes review.
        </p>
      )}

      <header className="user-recipe-head">
        <p className="user-recipe-eyebrow">
          {recipe.owner.displayHandle ? (
            <>
              Shared by{' '}
              <Link href={`/m/${recipe.owner.displayHandle}`} className="user-recipe-byline">
                {recipe.owner.name?.trim() || `@${recipe.owner.displayHandle}`}
              </Link>
            </>
          ) : (
            'Shared by a Homemade Maker'
          )}
        </p>
        <h1 className="user-recipe-title">{recipe.title}</h1>
        {premiumContent && <PremiumBadge className="user-recipe-premium-badge" />}
        {recipe.summary && <p className="user-recipe-summary">{recipe.summary}</p>}
        {metaBits.length > 0 && (
          <p className="user-recipe-meta">{metaBits.join('  ·  ')}</p>
        )}
        <div className="user-recipe-tags">
          {recipe.cuisineTags.map((t) => (
            <span key={`c-${t}`} className="user-recipe-tag">
              {cuisineLabel(t)}
            </span>
          ))}
          {recipe.dietaryTags.map((t) => (
            <span key={`d-${t}`} className="user-recipe-tag is-dietary">
              {dietaryLabelOf(t)}
            </span>
          ))}
        </div>
      </header>

      {heroSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="user-recipe-hero" src={heroSrc} alt={hero?.alt ?? recipe.title} />
      )}

      {isLive && canAccess && (
        <div className="tutorial-content user-recipe-actions">
          <div className="recipe-actions-row">
            <AddToShoppingList tutorialSlug={recipe.slug} tutorialId={recipe.id} />
            <AddToMealPlan tutorialSlug={recipe.slug} tutorialId={recipe.id} />
            <SaveRecipeButton userRecipeId={recipe.id} initialSaved={savedRecipe} />
          </div>
        </div>
      )}

      {!canAccess ? (
        <div className="user-recipe-body">
          <UpgradeBlock
            message="This recipe is part of Homemade Premium."
            rationale="Premium opens the recipes shared by independent Homemade creators; the full Homemade library stays free for everyone."
          />
        </div>
      ) : (
      <div className="user-recipe-body">
        <section className="user-recipe-ingredients">
          <h2>Ingredients</h2>
          <ul>
            {recipe.ingredients.map((ri) => {
              const qty = formatIngredientQuantity(
                ri.quantity ? Number(ri.quantity) : null,
                ri.unit,
                prefs,
                ri.ingredient.densityGPerMl ? Number(ri.ingredient.densityGPerMl) : null,
              )
              return (
                <li key={ri.id}>
                  {qty && <span className="user-recipe-qty">{qty}</span>}{' '}
                  {ri.ingredient.name}
                  {ri.notes && <span className="user-recipe-ing-note">, {ri.notes}</span>}
                  {ri.isOptional && <span className="user-recipe-ing-opt"> (optional)</span>}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="user-recipe-method tutorial-content">
          <h2>Method</h2>
          <TutorialContent
            content={recipe.body as TipTapNode}
            glossary={[]}
            subTutorials={[]}
            recipeContext={null}
          />
        </section>
      </div>
      )}

      {recipe.originalityType &&
        recipe.originalityType !== 'own' &&
        recipe.attribution && (
          <p className="user-recipe-attribution">
            {recipe.originalityType === 'adapted-from'
              ? 'Adapted from'
              : recipe.originalityType === 'inspired-by'
                ? 'Inspired by'
                : 'A family recipe from'}{' '}
            {recipe.attribution}.
          </p>
        )}

      {gallery.length > 0 && (
        <section className="user-recipe-gallery">
          {gallery.map((g) => {
            const src = mediaUrl({ r2Key: g.r2Key }, 'card')
            return src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={g.id} src={src} alt={g.alt ?? recipe.title} />
            ) : null
          })}
        </section>
      )}
    </main>
  )
}
