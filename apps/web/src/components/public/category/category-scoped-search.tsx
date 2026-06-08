import Link from 'next/link'

interface CategoryScopedSearchProps {
  categorySlug: string
  /** Placeholder text inside the input field. Category-flavoured. */
  placeholder: string
  /** Heading above the input. Voice-tuned per archetype. */
  heading?: string | null
  /** Optional body line under the heading. */
  lede?: string | null
  /** Suggested-search chips rendered below the input. */
  suggestions?: { label: string; q: string }[]
  /** Optional initial query (when arriving from /search). */
  defaultQuery?: string
}

/**
 * Category-scoped search affordance. Server-rendered form that submits
 * to /search with the categorySlug filter pre-applied. Suggested-search
 * chips render below the input to give the user a one-tap entry point
 * for the common questions the archetype knows about ("under 30 min",
 * "no equipment", "anxiety", etc.).
 */
export function CategoryScopedSearch({
  categorySlug,
  placeholder,
  heading,
  lede,
  suggestions,
  defaultQuery,
}: CategoryScopedSearchProps) {
  return (
    <section className="category-scoped-search">
      {heading && <h2 className="category-scoped-search-heading">{heading}</h2>}
      {lede && <p className="category-scoped-search-lede">{lede}</p>}
      <form className="category-scoped-search-form" method="GET" action="/search">
        <input type="hidden" name="category" value={categorySlug} />
        <label htmlFor={`scoped-search-${categorySlug}`} className="sr-only">
          {placeholder}
        </label>
        <input
          id={`scoped-search-${categorySlug}`}
          type="search"
          name="q"
          placeholder={placeholder}
          defaultValue={defaultQuery ?? ''}
          autoComplete="off"
          className="category-scoped-search-input"
        />
        <button type="submit" className="category-scoped-search-submit">
          Search
        </button>
      </form>
      {suggestions && suggestions.length > 0 && (
        <ul className="category-scoped-search-suggestions" aria-label="Suggested searches">
          {suggestions.map((s) => (
            <li key={s.q}>
              <Link
                href={`/search?category=${categorySlug}&q=${encodeURIComponent(s.q)}`}
                className="category-scoped-search-suggestion"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
