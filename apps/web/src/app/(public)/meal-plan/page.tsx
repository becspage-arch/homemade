import type { Metadata } from 'next'
import { RecipeComingSoon } from '@/components/public/recipes/recipe-coming-soon'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Meal plan | Homemade',
  description: 'Plan your week from the Homemade recipe library.',
  path: '/meal-plan',
  ogType: 'website',
})

export default function MealPlanStubPage() {
  return <RecipeComingSoon feature="MEAL_PLANNING" heading="Meal plan" />
}
