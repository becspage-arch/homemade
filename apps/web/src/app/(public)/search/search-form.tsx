import Link from 'next/link'

interface CategoryOption {
  slug: string
  name: string
}

interface SearchFormProps {
  defaultQuery: string
  defaultCategory: string | null
  defaultDifficulty: string | null
  defaultSeason: string | null
  categories: CategoryOption[]
}

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
]

const SEASONS = [
  { value: 'SPRING', label: 'Spring' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'AUTUMN', label: 'Autumn' },
  { value: 'WINTER', label: 'Winter' },
  { value: 'YEAR_ROUND', label: 'Year-round' },
]

/**
 * Plain GET form for the query input; filters are rendered as anchor links
 * that carry the other filter state so toggling one chip leaves the rest
 * intact. URL is the source of truth — back / forward / share all work.
 */
export function SearchForm({
  defaultQuery,
  defaultCategory,
  defaultDifficulty,
  defaultSeason,
  categories,
}: SearchFormProps) {
  return (
    <div>
      <form method="GET" action="/search" className="search-form">
        <input
          type="search"
          name="q"
          defaultValue={defaultQuery}
          placeholder="Search tutorials, glossary, categories…"
          className="search-input"
          aria-label="Search"
        />
        <button type="submit" className="search-submit">
          Search
        </button>

        {defaultCategory && (
          <input type="hidden" name="category" value={defaultCategory} />
        )}
        {defaultDifficulty && (
          <input type="hidden" name="difficulty" value={defaultDifficulty} />
        )}
        {defaultSeason && (
          <input type="hidden" name="season" value={defaultSeason} />
        )}
      </form>

      <div className="search-filters">
        <FilterGroup label="Category">
          <ChipLink
            href={buildHref({
              q: defaultQuery,
              category: null,
              difficulty: defaultDifficulty,
              season: defaultSeason,
            })}
            active={!defaultCategory}
          >
            any
          </ChipLink>
          {categories.map((c) => (
            <ChipLink
              key={c.slug}
              href={buildHref({
                q: defaultQuery,
                category: c.slug,
                difficulty: defaultDifficulty,
                season: defaultSeason,
              })}
              active={defaultCategory === c.slug}
            >
              {c.name}
            </ChipLink>
          ))}
        </FilterGroup>

        <FilterGroup label="Difficulty">
          <ChipLink
            href={buildHref({
              q: defaultQuery,
              category: defaultCategory,
              difficulty: null,
              season: defaultSeason,
            })}
            active={!defaultDifficulty}
          >
            any
          </ChipLink>
          {DIFFICULTIES.map((d) => (
            <ChipLink
              key={d.value}
              href={buildHref({
                q: defaultQuery,
                category: defaultCategory,
                difficulty: d.value,
                season: defaultSeason,
              })}
              active={defaultDifficulty === d.value}
            >
              {d.label}
            </ChipLink>
          ))}
        </FilterGroup>

        <FilterGroup label="Season">
          <ChipLink
            href={buildHref({
              q: defaultQuery,
              category: defaultCategory,
              difficulty: defaultDifficulty,
              season: null,
            })}
            active={!defaultSeason}
          >
            any
          </ChipLink>
          {SEASONS.map((s) => (
            <ChipLink
              key={s.value}
              href={buildHref({
                q: defaultQuery,
                category: defaultCategory,
                difficulty: defaultDifficulty,
                season: s.value,
              })}
              active={defaultSeason === s.value}
            >
              {s.label}
            </ChipLink>
          ))}
        </FilterGroup>
      </div>
    </div>
  )
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="search-filter-group">
      <span className="search-filter-label">{label}</span>
      <div className="search-chips">{children}</div>
    </div>
  )
}

function ChipLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`search-chip${active ? ' search-chip-active' : ''}`}
    >
      {children}
    </Link>
  )
}

interface BuildHref {
  q: string
  category: string | null
  difficulty: string | null
  season: string | null
}

function buildHref(state: BuildHref): string {
  const params = new URLSearchParams()
  if (state.q) params.set('q', state.q)
  if (state.category) params.set('category', state.category)
  if (state.difficulty) params.set('difficulty', state.difficulty)
  if (state.season) params.set('season', state.season)
  const qs = params.toString()
  return qs ? `/search?${qs}` : '/search'
}
