import Link from 'next/link'

interface WorldCuisineChipsProps {
  categorySlug: string
  /** cuisine slugs present in this category, already ordered by count. */
  cuisines: string[]
  activeCuisine: string | null
  /** Preserve other active filters (e.g. ?sub=, ?dietary=). */
  preserveQuery?: Record<string, string>
}

/**
 * World-cuisine browse chips for food categories (phase_dish_type_001).
 *
 * Makes the world-cuisine content browsable as discovery — one click to
 * /[categorySlug]?cuisine=indian — so it sits alongside the familiar dish-type
 * shelves rather than being the only thing the recency-ordered featuring
 * surfaced. Labels come from the controlled map below; unknown slugs fall back
 * to a title-cased label so a new cuisine still shows.
 */

const CUISINE_LABELS: Record<string, string> = {
  british: 'British', american: 'American', italian: 'Italian', french: 'French',
  indian: 'Indian', chinese: 'Chinese', thai: 'Thai', japanese: 'Japanese',
  mexican: 'Mexican', spanish: 'Spanish', greek: 'Greek', 'middle-eastern': 'Middle Eastern',
  caribbean: 'Caribbean', korean: 'Korean', vietnamese: 'Vietnamese', turkish: 'Turkish',
  moroccan: 'Moroccan', 'eastern-european': 'Eastern European', german: 'German',
  mediterranean: 'Mediterranean', persian: 'Persian', lebanese: 'Lebanese',
  'west-african': 'West African', 'north-african': 'North African', nigerian: 'Nigerian',
  ethiopian: 'Ethiopian', 'anglo-indian': 'Anglo-Indian', 'italian-american': 'Italian-American',
  polish: 'Polish', hungarian: 'Hungarian', portuguese: 'Portuguese', irish: 'Irish',
  scandinavian: 'Scandinavian', swedish: 'Swedish', danish: 'Danish', filipino: 'Filipino',
  malaysian: 'Malaysian', indonesian: 'Indonesian', peruvian: 'Peruvian', brazilian: 'Brazilian',
  argentinian: 'Argentinian', 'latin-american': 'Latin American', egyptian: 'Egyptian',
  jewish: 'Jewish', austrian: 'Austrian', russian: 'Russian', dutch: 'Dutch',
  australian: 'Australian', cuban: 'Cuban', jamaican: 'Jamaican', tunisian: 'Tunisian',
  colombian: 'Colombian', kenyan: 'Kenyan', taiwanese: 'Taiwanese', 'new-zealand': 'New Zealand',
  asian: 'Asian', european: 'European', international: 'International', welsh: 'Welsh',
  scottish: 'Scottish', romanian: 'Romanian', czech: 'Czech', ukrainian: 'Ukrainian',
  'south-asian': 'South Asian', 'central-asian': 'Central Asian', 'east-african': 'East African',
  belgian: 'Belgian', swiss: 'Swiss', norwegian: 'Norwegian', palestinian: 'Palestinian',
  israeli: 'Israeli', singaporean: 'Singaporean', ghanaian: 'Ghanaian', senegalese: 'Senegalese',
}

function labelFor(slug: string): string {
  return (
    CUISINE_LABELS[slug] ??
    slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  )
}

export function WorldCuisineChips({
  categorySlug,
  cuisines,
  activeCuisine,
  preserveQuery = {},
}: WorldCuisineChipsProps) {
  if (cuisines.length === 0) return null

  function hrefFor(cuisine: string | null): string {
    const params = new URLSearchParams(preserveQuery)
    params.delete('cuisine')
    if (cuisine) params.set('cuisine', cuisine)
    const q = params.toString()
    return q ? `/${categorySlug}?${q}` : `/${categorySlug}`
  }

  return (
    <div className="category-filter-row" aria-label="Cuisines">
      {cuisines.map((slug) => {
        const isActive = activeCuisine === slug
        const next = isActive ? null : slug
        return (
          <Link
            key={slug}
            href={hrefFor(next)}
            className={`category-filter-chip${isActive ? ' is-active' : ''}`}
          >
            {labelFor(slug)}
          </Link>
        )
      })}
    </div>
  )
}
