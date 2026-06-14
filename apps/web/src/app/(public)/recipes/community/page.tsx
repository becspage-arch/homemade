import type { Metadata } from 'next'
import { RecipeComingSoon } from '@/components/public/recipes/recipe-coming-soon'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Community recipes | Homemade',
  description: 'Recipes shared by Homemade Makers.',
  path: '/recipes/community',
  ogType: 'website',
})

export default function CommunityRecipesStubPage() {
  return <RecipeComingSoon feature="COMMUNITY_RECIPES" heading="Community recipes" />
}
