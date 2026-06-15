'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { captureClientEvent } from '@/lib/client-analytics'

const RECIPES_KEY = 'homemade-shopping-recipes'

function readSlugs(): string[] {
  try {
    const raw = localStorage.getItem(RECIPES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeSlugs(slugs: string[]): void {
  try {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(slugs))
  } catch {
    // ignore
  }
}

/**
 * Adds the current recipe to the device's shopping-list set (localStorage) and
 * links through to /shopping-list with every saved recipe. Anonymous-friendly:
 * the list lives on the device, no account needed. Server-side sync for
 * signed-in Makers is a later free sign-in carrot.
 */
export function AddToShoppingList({
  tutorialSlug,
  tutorialId,
}: {
  tutorialSlug: string
  tutorialId: string
}) {
  const [slugs, setSlugs] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  // First render is SSR with no localStorage; sync after mount. Same accepted
  // pattern as cookie-banner.tsx. For signed-in Makers, merge the server-synced
  // list in (union) so the list follows them across devices; anonymous Makers
  // stay purely local. Free sign-in carrot, not a premium gate.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const local = readSlugs()
    setSlugs(local)
    setHydrated(true)
    void fetch('/api/me/shopping-list')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { recipeSlugs?: string[] } | null) => {
        if (!data?.recipeSlugs) return
        const merged = Array.from(new Set([...local, ...data.recipeSlugs]))
        setSlugs(merged)
        writeSlugs(merged)
        if (merged.length !== local.length) syncServer(merged)
      })
      .catch(() => {})
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  function syncServer(next: string[]) {
    void fetch('/api/me/shopping-list', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipeSlugs: next }),
    }).catch(() => {})
  }

  const added = slugs.includes(tutorialSlug)

  function toggle() {
    const next = added
      ? slugs.filter((s) => s !== tutorialSlug)
      : [...slugs, tutorialSlug]
    setSlugs(next)
    writeSlugs(next)
    syncServer(next)
    if (!added) {
      captureClientEvent('shopping_list_recipe_added', { tutorialId, tutorialSlug })
    }
  }

  const href = `/shopping-list?recipes=${encodeURIComponent(slugs.join(','))}`

  return (
    <div className="add-to-shopping" suppressHydrationWarning>
      <button
        type="button"
        className={`add-to-shopping-btn${added ? ' is-added' : ''}`}
        onClick={toggle}
        aria-pressed={added}
      >
        {added ? 'Added to shopping list' : 'Add to shopping list'}
      </button>
      {hydrated && slugs.length > 0 && (
        <Link href={href} className="add-to-shopping-view">
          View list ({slugs.length})
        </Link>
      )}
    </div>
  )
}
