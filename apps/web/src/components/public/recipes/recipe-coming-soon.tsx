import Link from 'next/link'
import { getRecipeGateCopy, type RecipeGateFeature } from '@/lib/recipes/premium-gates'

/**
 * Shared "Coming soon" surface for the recipe routes the upload / community /
 * meal-plan / shopping-list workers will build out. Renders the gate rationale
 * (read straight from the gate registry so it stays in sync) as a calm inline
 * block, not a popup, per the gating copy rule. These pages return 200 today so
 * the routes resolve and the navigation can already point at them.
 */
export function RecipeComingSoon({
  feature,
  heading,
}: {
  feature: RecipeGateFeature
  heading: string
}) {
  const copy = getRecipeGateCopy(feature)
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p
        className="text-xs uppercase text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.3em' }}
      >
        coming soon
      </p>
      <h1 className="mt-6 text-2xl text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-lora)' }}>
        {heading}
      </h1>
      <p className="mt-4 text-[var(--color-warm-taupe)]">{copy.message}</p>
      <p className="mt-2 text-sm text-[var(--color-warm-taupe)]">{copy.rationale}</p>
      <div className="mt-10">
        <Link
          href="/"
          className="text-sm uppercase text-[var(--color-sage)] hover:opacity-80 transition-opacity"
          style={{ letterSpacing: '0.2em' }}
        >
          back to the library
        </Link>
      </div>
    </main>
  )
}
