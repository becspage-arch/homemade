'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { ShoppingListGroup } from '@/lib/recipes/shopping-list'

const TICK_KEY = 'homemade-shopping-ticks'

/**
 * Renders the aggregated shopping list with tick-off checkboxes. Ticks persist
 * in localStorage (keyed by ingredientId) so they survive a refresh while the
 * Maker shops, and never leave the device. Server-rendered groups come in via
 * props; this layer only owns the ticked state, print and clear.
 */
export function ShoppingListView({
  groups,
  itemCount,
  unknownSlugs,
}: {
  groups: ShoppingListGroup[]
  itemCount: number
  unknownSlugs: string[]
}) {
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  // First render is SSR with no localStorage, so the ticked state is synced in
  // an effect after mount. Same accepted pattern as cookie-banner.tsx.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TICK_KEY)
      if (raw) setTicked(new Set(JSON.parse(raw) as string[]))
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggle(id: string) {
    setTicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(TICK_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // ignore
      }
      return next
    })
  }

  function clearTicks() {
    setTicked(new Set())
    try {
      localStorage.removeItem(TICK_KEY)
    } catch {
      // ignore
    }
  }

  if (itemCount === 0) {
    return (
      <div className="shopping-list-empty">
        <p>Your list is empty.</p>
        <p className="shopping-list-empty-hint">
          Open a recipe and choose <strong>Add to shopping list</strong>. Add as
          many as you like; the same ingredient from different recipes is
          combined for you.
        </p>
        <Link href="/cooking" className="shopping-list-browse">
          Browse recipes
        </Link>
      </div>
    )
  }

  const tickedCount = hydrated ? groups.reduce((n, g) => n + g.items.filter((i) => ticked.has(i.ingredientId)).length, 0) : 0

  return (
    <div className="shopping-list">
      <div className="shopping-list-toolbar">
        <span className="shopping-list-count">
          {itemCount} item{itemCount === 1 ? '' : 's'}
          {tickedCount > 0 && ` · ${tickedCount} ticked`}
        </span>
        <div className="shopping-list-actions">
          {tickedCount > 0 && (
            <button type="button" className="shopping-list-action" onClick={clearTicks}>
              Clear ticks
            </button>
          )}
          <button
            type="button"
            className="shopping-list-action"
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>
      </div>

      {unknownSlugs.length > 0 && (
        <p className="shopping-list-note">
          {unknownSlugs.length} recipe{unknownSlugs.length === 1 ? '' : 's'} could
          not be found and {unknownSlugs.length === 1 ? 'was' : 'were'} skipped.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.aisle} className="shopping-list-group">
          <h2 className="shopping-list-aisle">{group.label}</h2>
          <ul className="shopping-list-items">
            {group.items.map((item) => {
              const isTicked = ticked.has(item.ingredientId)
              return (
                <li
                  key={item.ingredientId}
                  className={`shopping-list-item${isTicked ? ' is-ticked' : ''}`}
                >
                  <label className="shopping-list-check">
                    <input
                      type="checkbox"
                      checked={isTicked}
                      onChange={() => toggle(item.ingredientId)}
                    />
                    <span className="shopping-list-item-amount">{item.display}</span>
                    <span className="shopping-list-item-name">{item.name}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
