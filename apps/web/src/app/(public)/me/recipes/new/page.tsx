import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/auth'
import { RecipeForm } from '@/components/public/recipes/recipe-form'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New recipe' }

export default async function NewRecipePage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  return (
    <div>
      <p className="me-section-label">Your recipes</p>
      <h2 className="me-section-title">Write a recipe</h2>
      <p className="me-section-description">
        Save it as a draft while you work, or send it for review when it is ready.{' '}
        <Link href="/me/recipes" className="recipe-back-link">
          Back to your recipes
        </Link>
      </p>
      <RecipeForm />
    </div>
  )
}
