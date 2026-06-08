import Link from 'next/link'

interface RecipeDietaryChipsProps {
  categorySlug: string
  activeFlag: string | null
  /** Preserve other active filters (e.g. ?sub=) when toggling. */
  preserveQuery?: Record<string, string>
}

interface DietaryOption {
  value: string
  label: string
}

const FLAGS_BY_CATEGORY: Record<string, DietaryOption[]> = {
  cooking: [
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'glutenFree', label: 'Gluten-free' },
    { value: 'dairyFree', label: 'Dairy-free' },
    { value: 'nutFree', label: 'Nut-free' },
  ],
  baking: [
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'glutenFree', label: 'Gluten-free' },
    { value: 'dairyFree', label: 'Dairy-free' },
  ],
  'herbal-medicine': [
    { value: 'vegan', label: 'Plant-based' },
    { value: 'glutenFree', label: 'Gluten-free' },
  ],
  'natural-home': [
    { value: 'vegan', label: 'Vegan' },
    { value: 'nutFree', label: 'Nut-free' },
  ],
}

/**
 * Dietary chip row for Recipe-archetype landings. Replaces the legacy
 * difficulty chips, because for recipes "vegan" or "gluten-free" is a
 * far more useful axis than skill level.
 */
export function RecipeDietaryChips({
  categorySlug,
  activeFlag,
  preserveQuery = {},
}: RecipeDietaryChipsProps) {
  const options = FLAGS_BY_CATEGORY[categorySlug] ?? []
  if (options.length === 0) return null

  function hrefFor(flag: string | null): string {
    const params = new URLSearchParams(preserveQuery)
    params.delete('dietary')
    if (flag) params.set('dietary', flag)
    const q = params.toString()
    return q ? `/${categorySlug}?${q}` : `/${categorySlug}`
  }

  return (
    <div className="category-filter-row" aria-label="Dietary">
      {options.map((opt) => {
        const isActive = activeFlag === opt.value
        const next = isActive ? null : opt.value
        return (
          <Link
            key={opt.value}
            href={hrefFor(next)}
            className={`category-filter-chip${isActive ? ' is-active' : ''}`}
          >
            {opt.label}
          </Link>
        )
      })}
    </div>
  )
}
