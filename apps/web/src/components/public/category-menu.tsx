'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, TouchEvent as ReactTouchEvent } from 'react'

interface MenuSubCategory {
  slug: string
  name: string
}

interface MenuCategory {
  slug: string
  name: string
  /** Archetype is still used downstream for layout routing; we don't surface
   *  it in the nav, but we keep it on the interface so the wiring is honest. */
  archetype: string
  subCategories: MenuSubCategory[]
}

interface CategoryMenuProps {
  /** All public categories. The menu picks which group each one belongs to
   *  via NAV_GROUPS below. Anything not listed is hidden from the nav. */
  all: MenuCategory[]
}

type GroupKey = 'food' | 'make' | 'skills' | 'mindset' | 'grow' | 'home'

interface NavGroup {
  key: GroupKey
  /** Short top-line label (Food / Make / Skills / Mindset / Grow / Home). */
  label: string
  /** Per-group anchor CTA in the dropdown footer. */
  cta: { label: string; href: string }
  /** Ordered list of category slugs that belong to this group. Ignored when
   *  `expandSubsOf` is set. */
  slugs: string[]
  /** Optional: when set, the dropdown shows the sub-categories of this
   *  category as the menu items, each linking to /{slug}?sub={subSlug}. The
   *  `slugs` array is ignored. The category's own page is reachable via
   *  the dropdown CTA. */
  expandSubsOf?: string
}

/**
 * Top-line nav groups. Decoupled from `Category.archetype` so the nav
 * grouping is an editorial decision, not a side effect of the layout
 * router. Categories not listed here are hidden from the nav.
 */
const NAV_GROUPS: NavGroup[] = [
  {
    key: 'food',
    label: 'Food',
    cta: { label: 'See all food →', href: '/food' },
    slugs: ['cooking', 'baking', 'herbal-medicine'],
  },
  {
    key: 'make',
    label: 'Make',
    cta: { label: 'See all make →', href: '/make' },
    slugs: [
      'cross-stitch',
      'knitting',
      'crochet',
      'needlework',
      'sewing',
      'fibre-arts',
    ],
  },
  {
    key: 'skills',
    label: 'Skills',
    cta: { label: 'See all skills →', href: '/skills' },
    slugs: ['wood-natural-craft', 'paper-word', 'pottery-ceramics'],
  },
  {
    key: 'mindset',
    label: 'Mindset',
    cta: { label: 'How are you feeling? →', href: '/mindset' },
    slugs: ['mindset'],
    expandSubsOf: 'mindset',
  },
  {
    key: 'grow',
    label: 'Grow',
    cta: { label: 'What can I sow this month? →', href: '/garden' },
    slugs: ['garden'],
  },
  {
    key: 'home',
    label: 'Home',
    cta: { label: 'See all home →', href: '/home' },
    slugs: [
      'home-repair',
      'animals-smallholding',
      'sustainability',
      'natural-home',
    ],
  },
]

interface MenuItem {
  /** Display label. */
  name: string
  /** Resolved href (/cooking, /mindset?sub=tapping, etc.). */
  href: string
  /** Stable key for React. */
  key: string
}

interface ResolvedGroup {
  key: GroupKey
  label: string
  cta: { label: string; href: string }
  items: MenuItem[]
}

function resolveGroups(all: MenuCategory[]): ResolvedGroup[] {
  const bySlug = new Map<string, MenuCategory>()
  for (const c of all) bySlug.set(c.slug, c)

  return NAV_GROUPS.map((g): ResolvedGroup => {
    let items: MenuItem[] = []
    if (g.expandSubsOf) {
      const parent = bySlug.get(g.expandSubsOf)
      if (parent) {
        items = parent.subCategories.map((sc) => ({
          name: sc.name,
          href: `/${parent.slug}?sub=${sc.slug}`,
          key: `${parent.slug}:${sc.slug}`,
        }))
      }
    } else {
      items = g.slugs
        .map((slug) => bySlug.get(slug))
        .filter((c): c is MenuCategory => c !== undefined)
        .map((c) => ({ name: c.name, href: `/${c.slug}`, key: c.slug }))
    }
    return { key: g.key, label: g.label, cta: g.cta, items }
  }).filter((g) => g.items.length > 0)
}

/**
 * Header category menu — six top-line nav groups on desktop, each opening
 * its own focused dropdown with the categories (or sub-categories)
 * underneath. Hamburger-into-sheet on mobile (accordion of the same groups).
 */
export function CategoryMenu({ all }: CategoryMenuProps) {
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  // Drag-to-dismiss state for the mobile sheet.
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStartY = useRef<number | null>(null)
  const dragYRef = useRef(0)

  // createPortal needs a DOM target, so only render the sheet portal after
  // the client has mounted. One-shot mount flag — the cascading render is
  // intentional (same pattern as StickyToc).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!sheetOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheetOpen])

  function closeSheet() {
    setSheetOpen(false)
    setDragY(0)
    dragYRef.current = 0
    setDragging(false)
  }

  function onGripTouchStart(e: ReactTouchEvent) {
    dragStartY.current = e.touches[0]?.clientY ?? null
    setDragging(true)
  }
  function onGripTouchMove(e: ReactTouchEvent) {
    if (dragStartY.current === null) return
    const dy = (e.touches[0]?.clientY ?? 0) - dragStartY.current
    const next = Math.max(0, dy)
    dragYRef.current = next
    setDragY(next)
  }
  function onGripTouchEnd() {
    dragStartY.current = null
    setDragging(false)
    if (dragYRef.current > 90) {
      closeSheet()
    } else {
      dragYRef.current = 0
      setDragY(0)
    }
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!navRef.current) return
      if (e.target instanceof Node && navRef.current.contains(e.target)) return
      setOpenGroup(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenGroup(null)
        setSheetOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const groups = useMemo(() => resolveGroups(all), [all])

  return (
    <>
      <nav className="header-nav-desktop" aria-label="Categories" ref={navRef}>
        {groups.map((group) => {
          const isOpen = openGroup === group.key
          return (
            <div key={group.key} className="header-nav-archetype">
              <button
                type="button"
                className={`header-nav-link header-nav-archetype-trigger${isOpen ? ' is-open' : ''}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setOpenGroup(isOpen ? null : group.key)}
              >
                {group.label}
                <span className="header-nav-archetype-chev" aria-hidden="true">
                  {isOpen ? '▴' : '▾'}
                </span>
              </button>
              {isOpen && (
                <div
                  className="header-archetype-panel"
                  role="menu"
                  aria-label={group.label}
                >
                  <ul className="header-archetype-panel-list">
                    {group.items.map((item) => (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          role="menuitem"
                          className="header-archetype-panel-link"
                          onClick={() => setOpenGroup(null)}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={group.cta.href}
                    className="header-archetype-panel-cta"
                    onClick={() => setOpenGroup(null)}
                  >
                    {group.cta.label}
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <button
        type="button"
        className="header-nav-mobile-trigger"
        aria-haspopup="menu"
        aria-expanded={sheetOpen}
        aria-label="Open menu"
        onClick={() => setSheetOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="4" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="4" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {sheetOpen &&
        mounted &&
        createPortal(
          <div
            className="header-nav-sheet-backdrop"
            onClick={closeSheet}
            role="presentation"
          >
            <div
              className="header-nav-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Browse"
              onClick={(e) => e.stopPropagation()}
              style={
                {
                  '--sheet-drag': `${dragY}px`,
                  transition: dragging
                    ? 'none'
                    : 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                } as CSSProperties
              }
            >
              <div
                className="header-nav-sheet-grip"
                onTouchStart={onGripTouchStart}
                onTouchMove={onGripTouchMove}
                onTouchEnd={onGripTouchEnd}
              />
              <div className="header-nav-sheet-header">
                <span className="header-nav-sheet-eyebrow">Browse</span>
                <button
                  type="button"
                  className="header-nav-sheet-close"
                  onClick={closeSheet}
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>
              <div className="header-nav-sheet-groups">
                {groups.map((group) => (
                  <details key={group.key} className="header-nav-sheet-group">
                    <summary className="header-nav-sheet-group-summary">
                      <span className="header-nav-sheet-group-title">{group.label}</span>
                      <span className="header-nav-sheet-group-count">
                        {group.items.length}
                      </span>
                    </summary>
                    <div className="header-nav-sheet-group-body">
                      <nav className="header-nav-sheet-group-list" aria-label={group.label}>
                        {group.items.map((item) => (
                          <Link
                            key={item.key}
                            href={item.href}
                            className="header-nav-sheet-group-link"
                            onClick={closeSheet}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </nav>
                      <Link
                        href={group.cta.href}
                        className="header-nav-sheet-group-cta"
                        onClick={closeSheet}
                      >
                        {group.cta.label}
                      </Link>
                    </div>
                  </details>
                ))}
                <Link
                  href="/search"
                  className="header-nav-sheet-search-link"
                  onClick={closeSheet}
                >
                  Search everything →
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
