import type { Metadata } from 'next'
import { RecipeComingSoon } from '@/components/public/recipes/recipe-coming-soon'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Upload a recipe | Homemade',
  description: 'Save your own recipes to Homemade.',
  path: '/recipes/upload',
  ogType: 'website',
})

export default function RecipeUploadStubPage() {
  return <RecipeComingSoon feature="RECIPE_UPLOAD" heading="Upload a recipe" />
}
