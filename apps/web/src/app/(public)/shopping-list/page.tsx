import type { Metadata } from 'next'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { resolveUserUnitPreferences } from '@/lib/recipes/user-unit-preferences'
import { aggregateShoppingList } from '@/lib/recipes/shopping-list'
import { checkRecipeGate, getRecipeGateCopy } from '@/lib/recipes/premium-gates'
import { ShoppingListView } from '@/components/public/recipes/shopping-list-view'
import { RecipeComingSoon } from '@/components/public/recipes/recipe-coming-soon'

import './shopping-list.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Shopping list | Homemade',
  description: 'Turn recipes into an aisle-sorted shopping list with quantities combined.',
  path: '/shopping-list',
  ogType: 'website',
})

interface PageProps {
  searchParams: Promise<{ recipes?: string | string[] }>
}

export default async function ShoppingListPage({ searchParams }: PageProps) {
  const user = await getCurrentDbUser()

  // The SHOPPING_LIST gate is off today, so this resolves allowed for everyone.
  // When a later worker flips RECIPE_PREMIUM_GATING_ENABLED, free users see the
  // calm upgrade block instead; the page below never has to change.
  const gate = checkRecipeGate('SHOPPING_LIST', {
    signedIn: Boolean(user),
    isPremium: false,
  })
  if (!gate.allowed) {
    const copy = getRecipeGateCopy('SHOPPING_LIST')
    return <RecipeComingSoon feature="SHOPPING_LIST" heading={copy.message} />
  }

  const params = await searchParams
  const raw = params.recipes
  const slugs = (Array.isArray(raw) ? raw.join(',') : (raw ?? ''))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const preferences = await resolveUserUnitPreferences(user)
  const list = await aggregateShoppingList(slugs, preferences)

  return (
    <main className="shopping-list-page">
      <header className="shopping-list-head">
        <p className="shopping-list-eyebrow">Shopping list</p>
        <h1 className="shopping-list-title">Your list</h1>
        {list.recipes.length > 0 && (
          <p className="shopping-list-from">
            From{' '}
            {list.recipes.map((r, i) => (
              <span key={r.slug}>
                {i > 0 && ', '}
                <span className="shopping-list-from-recipe">{r.title}</span>
              </span>
            ))}
            .
          </p>
        )}
      </header>
      <ShoppingListView
        groups={list.groups}
        itemCount={list.itemCount}
        unknownSlugs={list.unknownSlugs}
      />
    </main>
  )
}
