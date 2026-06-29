'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'

/**
 * Faceted filter controls for the recipe FILTERED view (phase_dish_type_002).
 *
 * Deliberately mirrors the cross-stitch PatternLibraryGrid sidebar so selection
 * works the same across the site: a left rail of grouped, individually-
 * toggleable filter buttons (click an active one to clear it), a "Clear all",
 * a result count and a sort select. The results grid is server-rendered and
 * passed in as `children` — this client wrapper never sees the recipe data.
 *
 * This is shown ONLY when a filter is active; the unfiltered landing (hero,
 * magazine, rails) is untouched.
 */

export interface RecipeFacetOption {
  value: string
  label: string
  count?: number
}

export interface RecipeFacetGroup {
  /** the URL query param this group writes (e.g. "sub", "cuisine"). */
  key: string
  title: string
  /** optional "All …" reset label; when set, a reset button leads the group. */
  allLabel?: string
  options: RecipeFacetOption[]
}

interface RecipeFilterSidebarProps {
  groups: RecipeFacetGroup[]
  current: Record<string, string | null>
  count: number
  sort: string
  basePath: string
  children: React.ReactNode
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'popular', label: 'Most loved' },
  { value: 'newest', label: 'Newest' },
  { value: 'quick', label: 'Quickest' },
]

export function RecipeFilterSidebar({
  groups,
  current,
  count,
  sort,
  basePath,
  children,
}: RecipeFilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
  }

  const anyActive = groups.some((g) => current[g.key])

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    for (const g of groups) params.delete(g.key)
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
  }

  return (
    <div className="recipe-library-content">
      <aside className="recipe-library-sidebar" aria-label="Filter recipes">
        <div className="recipe-library-sidebar-head">
          <h2>
            <Filter size={14} strokeWidth={1.6} /> Filter
          </h2>
          {anyActive && (
            <button type="button" className="recipe-library-clear" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        {groups.map((group) => {
          const selected = current[group.key]
          return (
            <div key={group.key} className="recipe-library-filter-group">
              <h3>{group.title}</h3>
              <div className="recipe-library-filter-stack">
                {group.allLabel && (
                  <FilterButton
                    label={group.allLabel}
                    active={!selected}
                    onClick={() => update(group.key, null)}
                  />
                )}
                {group.options.map((opt) => (
                  <FilterButton
                    key={opt.value}
                    label={opt.label}
                    count={opt.count}
                    active={selected === opt.value}
                    onClick={() => update(group.key, selected === opt.value ? null : opt.value)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </aside>

      <section className="recipe-library-main">
        <div className="recipe-library-sortbar">
          <span className="recipe-library-result-count">
            {count} recipe{count === 1 ? '' : 's'}
          </span>
          <label className="recipe-library-sort">
            <span>Sort</span>
            <select value={sort} onChange={(e) => update('sort', e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {children}
      </section>
    </div>
  )
}

function FilterButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string
  active: boolean
  onClick: () => void
  count?: number
}) {
  return (
    <button
      type="button"
      className={`recipe-library-filter-button${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {typeof count === 'number' && <span className="recipe-library-filter-count">{count}</span>}
    </button>
  )
}
