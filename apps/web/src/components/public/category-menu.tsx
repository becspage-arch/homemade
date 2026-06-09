'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

interface MenuCategory {
  slug: string
  name: string
  /** Archetype is still used downstream for layout routing; we don't surface
   *  it in the nav, but we keep it on the interface so the wiring is honest. */
  archetype: string
}

interface CategoryMenuProps {
  /** All public categories. The menu picks which group each one belongs to
   *  via NAV_GROUPS below. Anything not listed is hidden from the nav. */
  all: MenuCategory[]
}

type GroupKey = 'food' | 'make' | 'skills' | 'practice' | 'grow' | 'home'

interface NavGroup {
  key: GroupKey
  /** Short top-line label (Food / Make / Skills / Practice / Grow / Home). */
  label: string
  /** Per-group anchor CTA in the dropdown footer. */
  cta: { label: string; href: string }
  /** Ordered list of category slugs that belong to this group. */
  slugs: string[]
}

/**
 * Top-line nav groups. Decoupled from `Category.archetype` so the nav
 * grouping is an editorial decision, not a side effect of the layout
 * router. Categories not listed here are hidden from the nav.
 *
 * Order of `slugs` is the visible order inside each dropdown.
 */
const NAV_GROUPS: NavGroup[] = [
  {
    key: 'food',
    label: 'Food',
    cta: { label: 'What are you cooking? →', href: '/cooking' },
    slugs: ['cooking', 'baking', 'herbal-medicine'],
  },
  {
    key: 'make',
    label: 'Make',
    cta: { label: 'Open the Studio →', href: '/cross-stitch' },
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
    cta: { label: 'Start with foundations →', href: '/pottery-ceramics' },
    slugs: ['wood-natural-craft', 'paper-word', 'pottery-ceramics'],
  },
  {
    key: 'practice',
    label: 'Practice',
    cta: { label: 'How are you feeling? →', href: '/mindset' },
    slugs: ['mindset'],
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
    cta: { label: 'What needs fixing? →', href: '/home-repair' },
    slugs: [
      'home-repair',
      'animals-smallholding',
      'sustainability',
      'natural-home',
    ],
  },
]

interface ResolvedGroup extends NavGroup {
  categories: MenuCategory[]
}

function resolveGroups(all: MenuCategory[]): ResolvedGroup[] {
  const bySlug = new Map<string, MenuCategory>()
  for (const c of all) bySlug.set(c.slug, c)
  return NAV_GROUPS.map((g) => ({
    ...g,
    categories: g.slugs
      .map((slug) => bySlug.get(slug))
      .filter((c): c is MenuCategory => c !== undefined),
  })).filter((g) => g.categories.length > 0)
}

/**
 * Header category menu — six top-line nav groups on desktop, each opening
 * its own focused dropdown with the categories underneath. Hamburger-into-
 * sheet on mobile (accordion of the same groups).
 *
 * No archetype titles or ledes in the panels: the group name is the only
 * label the user needs.
 */
export function CategoryMenu({ all }: CategoryMenuProps) {
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

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
                    {group.categories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/${cat.slug}`}
                          role="menuitem"
                          className="header-archetype-panel-link"
                          onClick={() => setOpenGroup(null)}
                        >
                          {cat.name}
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

      {sheetOpen && (
        <div
          className="header-nav-sheet-backdrop"
          onClick={() => setSheetOpen(false)}
          role="presentation"
        >
          <div
            className="header-nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Browse"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="header-nav-sheet-header">
              <span className="header-nav-sheet-eyebrow">Browse</span>
              <button
                type="button"
                className="header-nav-sheet-close"
                onClick={() => setSheetOpen(false)}
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
                      {group.categories.length}
                    </span>
                  </summary>
                  <div className="header-nav-sheet-group-body">
                    <nav className="header-nav-sheet-group-list" aria-label={group.label}>
                      {group.categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/${cat.slug}`}
                          className="header-nav-sheet-group-link"
                          onClick={() => setSheetOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </nav>
                    <Link
                      href={group.cta.href}
                      className="header-nav-sheet-group-cta"
                      onClick={() => setSheetOpen(false)}
                    >
                      {group.cta.label}
                    </Link>
                  </div>
                </details>
              ))}
              <Link
                href="/search"
                className="header-nav-sheet-search-link"
                onClick={() => setSheetOpen(false)}
              >
                Search everything →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
