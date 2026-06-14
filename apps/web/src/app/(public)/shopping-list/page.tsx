import type { Metadata } from 'next'
import { RecipeComingSoon } from '@/components/public/recipes/recipe-coming-soon'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Shopping list | Homemade',
  description: 'Turn recipes and meal plans into an aisle-sorted shopping list.',
  path: '/shopping-list',
  ogType: 'website',
})

export default function ShoppingListStubPage() {
  return <RecipeComingSoon feature="SHOPPING_LIST" heading="Shopping list" />
}
