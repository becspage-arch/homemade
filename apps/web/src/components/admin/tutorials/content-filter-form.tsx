'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'

interface Option {
  value: string
  label: string
}

interface CategoryOption {
  slug: string
  name: string
}

interface ContentFilterFormProps {
  q: string
  statuses: string[]
  types: string[]
  categorySlugs: string[]
  cuisines: string[]
  mealTypes: string[]
  moods: string[]
  dietaries: string[]
  difficulties: string[]
  seasons: string[]
  hero: string
  author: string
  sort: string
  view: string
  pageSize: number

  statusOptions: Option[]
  typeOptions: Option[]
  categoryOptions: CategoryOption[]
  cuisineOptions: Option[]
  mealTypeOptions: Option[]
  moodOptions: Option[]
  dietaryOptions: Option[]
  difficultyOptions: Option[]
  seasonOptions: Option[]
  heroOptions: Option[]
  authorOptions: Option[]
  sortOptions: Option[]
  pageSizeOptions: number[]

  canFilterAuthor: boolean
}

type MultiKey =
  | 'status'
  | 'type'
  | 'category'
  | 'cuisine'
  | 'mealType'
  | 'mood'
  | 'dietary'
  | 'difficulty'
  | 'season'

export function ContentFilterForm(props: ContentFilterFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [q, setQ] = useState(props.q)
  const [moreOpen, setMoreOpen] = useState(false)

  const initialMulti: Record<MultiKey, string[]> = useMemo(
    () => ({
      status: props.statuses,
      type: props.types,
      category: props.categorySlugs,
      cuisine: props.cuisines,
      mealType: props.mealTypes,
      mood: props.moods,
      dietary: props.dietaries,
      difficulty: props.difficulties,
      season: props.seasons,
    }),
    [props],
  )
  const [multi, setMulti] = useState<Record<MultiKey, string[]>>(initialMulti)
  const [hero, setHero] = useState(props.hero)
  const [author, setAuthor] = useState(props.author)
  const [sort, setSort] = useState(props.sort)
  const [view, setView] = useState(props.view)
  const [pageSize, setPageSize] = useState(props.pageSize)

  const toggle = (key: MultiKey, value: string) => {
    setMulti((prev) => {
      const next = { ...prev }
      next[key] = prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value]
      return next
    })
  }

  const apply = () => {
    const sp = new URLSearchParams()
    if (q.trim()) sp.set('q', q.trim())
    for (const v of multi.status) sp.append('status', v)
    for (const v of multi.type) sp.append('type', v)
    for (const v of multi.category) sp.append('category', v)
    for (const v of multi.cuisine) sp.append('cuisine', v)
    for (const v of multi.mealType) sp.append('mealType', v)
    for (const v of multi.mood) sp.append('mood', v)
    for (const v of multi.dietary) sp.append('dietary', v)
    for (const v of multi.difficulty) sp.append('difficulty', v)
    for (const v of multi.season) sp.append('season', v)
    if (hero && hero !== 'any') sp.set('hero', hero)
    if (author && author !== 'any') sp.set('author', author)
    if (sort && sort !== 'updated_desc') sp.set('sort', sort)
    if (view && view !== 'table') sp.set('view', view)
    if (pageSize && pageSize !== 50) sp.set('pageSize', String(pageSize))
    const str = sp.toString()
    startTransition(() => {
      router.push(str ? `${pathname}?${str}` : pathname)
    })
  }

  const clear = () => {
    startTransition(() => {
      router.push(pathname)
    })
  }

  const onPrimarySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    apply()
  }

  return (
    <form className="content-filter-form" onSubmit={onPrimarySubmit}>
      <div className="content-filter-search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, slug, subtitle, excerpt"
          aria-label="Search content"
          className="content-filter-search-input"
        />
        <button type="submit" className="content-filter-search-submit" disabled={pending}>
          Search
        </button>
      </div>

      <div className="content-filter-chips">
        <ChipMulti
          label="Status"
          options={props.statusOptions}
          selected={multi.status}
          onToggle={(v) => toggle('status', v)}
        />
        <ChipMulti
          label="Type"
          options={props.typeOptions}
          selected={multi.type}
          onToggle={(v) => toggle('type', v)}
        />
        <ChipMulti
          label="Category"
          options={props.categoryOptions.map((c) => ({ value: c.slug, label: c.name }))}
          selected={multi.category}
          onToggle={(v) => toggle('category', v)}
        />
        <button
          type="button"
          className="content-filter-more"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          {moreOpen ? '− More filters' : '+ More filters'}
        </button>

        <div className="content-filter-actions">
          <label className="content-filter-sort">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {props.sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="content-filter-sort">
            View
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option value="table">Table</option>
              <option value="grid">Grid</option>
            </select>
          </label>
          <label className="content-filter-sort">
            Per page
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number.parseInt(e.target.value, 10))}
            >
              {props.pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="content-filter-apply" onClick={apply}>
            Apply
          </button>
          <button type="button" className="content-filter-clear" onClick={clear}>
            Clear all
          </button>
        </div>
      </div>

      {moreOpen && (
        <div className="content-filter-more-panel">
          <ChipMulti
            label="Cuisine"
            options={props.cuisineOptions}
            selected={multi.cuisine}
            onToggle={(v) => toggle('cuisine', v)}
          />
          <ChipMulti
            label="Meal type"
            options={props.mealTypeOptions}
            selected={multi.mealType}
            onToggle={(v) => toggle('mealType', v)}
          />
          <ChipMulti
            label="Mood"
            options={props.moodOptions}
            selected={multi.mood}
            onToggle={(v) => toggle('mood', v)}
          />
          <ChipMulti
            label="Dietary"
            options={props.dietaryOptions}
            selected={multi.dietary}
            onToggle={(v) => toggle('dietary', v)}
          />
          <ChipMulti
            label="Difficulty"
            options={props.difficultyOptions}
            selected={multi.difficulty}
            onToggle={(v) => toggle('difficulty', v)}
          />
          <ChipMulti
            label="Season"
            options={props.seasonOptions}
            selected={multi.season}
            onToggle={(v) => toggle('season', v)}
          />
          <label className="content-filter-radio-group">
            <span>Hero</span>
            <select value={hero} onChange={(e) => setHero(e.target.value)}>
              {props.heroOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {props.canFilterAuthor && (
            <label className="content-filter-radio-group">
              <span>Author</span>
              <select value={author} onChange={(e) => setAuthor(e.target.value)}>
                {props.authorOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
    </form>
  )
}

function ChipMulti({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: Option[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <fieldset className="content-chip-group">
      <legend>{label}</legend>
      <div className="content-chip-row">
        {options.map((o) => {
          const active = selected.includes(o.value)
          return (
            <button
              type="button"
              key={o.value}
              className={`content-chip ${active ? 'active' : ''}`}
              onClick={() => onToggle(o.value)}
              aria-pressed={active}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
