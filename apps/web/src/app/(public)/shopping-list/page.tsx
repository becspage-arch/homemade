import type { Metadata } from 'next'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { resolveUserUnitPreferences } from '@/lib/recipes/user-unit-preferences'
import { aggregateShoppingList } from '@/lib/recipes/shopping-list'
import { checkRecipeGate, getRecipeGateCopy } from '@/lib/recipes/premium-gates'
import { ShoppingListView } from '@/components/public/recipes/shopping-list-view'
import { UpgradeBlock } from '@/components/premium/UpgradeBlock'

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

  // The shopping-list generator is premium. Free / anonymous users get the calm
  // upgrade block; premium users get the list. (Printing the list is also
  // premium, but only premium users reach the list at all, so it's covered.)
  const gate = checkRecipeGate('SHOPPING_LIST', {
    signedIn: Boolean(user),
    isPremium: hasPremium(user),
  })
  if (!gate.allowed) {
    const copy = getRecipeGateCopy('SHOPPING_LIST')
    return (
      <main className="shopping-list-page">
        <header className="shopping-list-head">
          <p className="shopping-list-eyebrow">Shopping list</p>
          <h1 className="shopping-list-title">Your list</h1>
        </header>
        <UpgradeBlock message={copy.message} rationale={copy.rationale} />
      </main>
    )
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
