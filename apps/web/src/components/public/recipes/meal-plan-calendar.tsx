'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  addMealPlanEntry,
  removeMealPlanEntry,
} from '@/lib/recipes/meal-plan-actions'
import type { MealPlanEntryView, MealTypeValue } from '@/lib/recipes/meal-plan'

interface DayCol {
  dayOfWeek: number
  iso: string
  dayNum: number
  monthShort: string
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEALS: Array<{ key: MealTypeValue; label: string }> = [
  { key: 'BREAKFAST', label: 'Breakfast' },
  { key: 'LUNCH', label: 'Lunch' },
  { key: 'DINNER', label: 'Dinner' },
]

interface SearchResult {
  slug: string
  title: string
}

export function MealPlanCalendar({
  weekStartIso,
  weekLabel,
  prevIso,
  nextIso,
  days,
  entries,
}: {
  weekStartIso: string
  weekLabel: string
  prevIso: string
  nextIso: string
  days: DayCol[]
  entries: MealPlanEntryView[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  // Which cell's add-picker is open, as "day:meal".
  const [openCell, setOpenCell] = useState<string | null>(null)

  const planSlugs = Array.from(
    new Set(entries.map((e) => e.tutorialSlug).filter((s): s is string => Boolean(s))),
  )
  const shoppingHref = `/shopping-list?recipes=${encodeURIComponent(planSlugs.join(','))}`

  function entriesFor(day: number, meal: MealTypeValue): MealPlanEntryView[] {
    return entries.filter((e) => e.dayOfWeek === day && e.mealType === meal)
  }

  function remove(entryId: string) {
    startTransition(async () => {
      await removeMealPlanEntry(entryId)
      router.refresh()
    })
  }

  function add(day: number, meal: MealTypeValue, slug: string) {
    startTransition(async () => {
      await addMealPlanEntry({
        weekStartIso,
        dayOfWeek: day,
        mealType: meal,
        tutorialSlug: slug,
      })
      setOpenCell(null)
      router.refresh()
    })
  }

  return (
    <div className="meal-plan">
      <header className="meal-plan-header">
        <div className="meal-plan-week-nav">
          <Link href={`/meal-plan?week=${prevIso}`} className="meal-plan-nav-arrow" aria-label="Previous week">
            ‹
          </Link>
          <h1 className="meal-plan-title">{weekLabel}</h1>
          <Link href={`/meal-plan?week=${nextIso}`} className="meal-plan-nav-arrow" aria-label="Next week">
            ›
          </Link>
        </div>
        {planSlugs.length > 0 && (
          <Link href={shoppingHref} className="meal-plan-shop">
            Make shopping list ({planSlugs.length})
          </Link>
        )}
      </header>

      <div className="meal-plan-grid" data-pending={pending ? '' : undefined}>
        <div className="meal-plan-corner" />
        {days.map((d) => (
          <div key={d.iso} className="meal-plan-day-head">
            <span className="meal-plan-day-name">{DAY_NAMES[d.dayOfWeek]}</span>
            <span className="meal-plan-day-num">{d.dayNum} {d.monthShort}</span>
          </div>
        ))}

        {MEALS.map((meal) => (
          <FragmentRow
            key={meal.key}
            meal={meal}
            days={days}
            entriesFor={entriesFor}
            openCell={openCell}
            setOpenCell={setOpenCell}
            onAdd={add}
            onRemove={remove}
          />
        ))}
      </div>

      <p className="meal-plan-hint">
        Tap a slot to add a recipe. The same recipe across the week is combined
        into one shopping list.
      </p>
    </div>
  )
}

function FragmentRow({
  meal,
  days,
  entriesFor,
  openCell,
  setOpenCell,
  onAdd,
  onRemove,
}: {
  meal: { key: MealTypeValue; label: string }
  days: DayCol[]
  entriesFor: (day: number, meal: MealTypeValue) => MealPlanEntryView[]
  openCell: string | null
  setOpenCell: (v: string | null) => void
  onAdd: (day: number, meal: MealTypeValue, slug: string) => void
  onRemove: (entryId: string) => void
}) {
  return (
    <>
      <div className="meal-plan-meal-label">{meal.label}</div>
      {days.map((d) => {
        const cellKey = `${d.dayOfWeek}:${meal.key}`
        const items = entriesFor(d.dayOfWeek, meal.key)
        const isOpen = openCell === cellKey
        return (
          <div key={cellKey} className="meal-plan-cell">
            {items.map((e) => (
              <div key={e.id} className="meal-plan-entry">
                {e.tutorialSlug && e.categorySlug ? (
                  <Link
                    href={`/${e.categorySlug}/${e.tutorialSlug}`}
                    className="meal-plan-entry-name"
                  >
                    {e.tutorialTitle ?? e.tutorialSlug}
                  </Link>
                ) : e.tutorialTitle ? (
                  <span className="meal-plan-entry-name">{e.tutorialTitle}</span>
                ) : (
                  <span className="meal-plan-entry-name">{e.note ?? 'Recipe'}</span>
                )}
                <button
                  type="button"
                  className="meal-plan-entry-remove"
                  aria-label="Remove"
                  onClick={() => onRemove(e.id)}
                >
                  ×
                </button>
              </div>
            ))}
            {isOpen ? (
              <AddPicker
                onPick={(slug) => onAdd(d.dayOfWeek, meal.key, slug)}
                onCancel={() => setOpenCell(null)}
              />
            ) : (
              <button
                type="button"
                className="meal-plan-add"
                onClick={() => setOpenCell(cellKey)}
              >
                + Add
              </button>
            )}
          </div>
        )
      })}
    </>
  )
}

function AddPicker({
  onPick,
  onCancel,
}: {
  onPick: (slug: string) => void
  onCancel: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Debounced title search. setState-in-effect is the accepted pattern here
  // (same as cookie-banner.tsx); the fetch resolves async after the debounce.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(q)}`)
        const data = (await res.json()) as { results: SearchResult[] }
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="meal-plan-picker">
      <input
        type="text"
        className="meal-plan-picker-input"
        placeholder="Search recipes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {loading && <p className="meal-plan-picker-status">searching…</p>}
      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <p className="meal-plan-picker-status">no matches</p>
      )}
      {results.length > 0 && (
        <ul className="meal-plan-picker-results">
          {results.map((r) => (
            <li key={r.slug}>
              <button type="button" onClick={() => onPick(r.slug)}>
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="meal-plan-picker-cancel" onClick={onCancel}>
        cancel
      </button>
    </div>
  )
}
