'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Archetype = 'RECIPE' | 'PATTERN' | 'SKILL' | 'PRACTICE' | 'PLANT' | 'FIX'

interface MenuCategory {
  slug: string
  name: string
  archetype: Archetype
}

interface CategoryMenuProps {
  /** All categories — used to populate each archetype dropdown. */
  all: MenuCategory[]
}

interface ArchetypeGroup {
  archetype: Archetype
  /** Top-line nav label — short noun verb-ish. */
  label: string
  /** Dropdown panel title — slightly fuller phrasing. */
  title: string
  /** One-line lede inside the panel. */
  lede: string
  /** Per-archetype CTA — points at the most representative entry. */
  cta: { label: string; href: string }
  categories: MenuCategory[]
}

const ARCHETYPE_ORDER: Archetype[] = [
  'RECIPE',
  'PATTERN',
  'SKILL',
  'PRACTICE',
  'PLANT',
  'FIX',
]

const ARCHETYPE_META: Record<
  Archetype,
  Pick<ArchetypeGroup, 'label' | 'title' | 'lede' | 'cta'>
> = {
  RECIPE: {
    label: 'Food',
    title: 'Make food & remedies',
    lede: 'Recipe-led: cook, bake, brew, blend.',
    cta: { label: 'What are you cooking? →', href: '/cooking' },
  },
  PATTERN: {
    label: 'Make',
    title: 'Make things',
    lede: 'Pattern + Studio: stitch, knit, sew.',
    cta: { label: 'Open the Studio →', href: '/cross-stitch' },
  },
  SKILL: {
    label: 'Skills',
    title: 'Build a skill',
    lede: 'Craft + technique: hands, tools, time.',
    cta: { label: 'Start with foundations →', href: '/fibre-arts' },
  },
  PRACTICE: {
    label: 'Practice',
    title: 'Daily practice',
    lede: 'Mood + habit-led: turn up regularly.',
    cta: { label: 'How are you feeling? →', href: '/mindset' },
  },
  PLANT: {
    label: 'Grow',
    title: 'Grow',
    lede: 'Plant + season-aware: what to sow now.',
    cta: { label: 'What can I sow this month? →', href: '/garden' },
  },
  FIX: {
    label: 'Fix',
    title: 'Fix it',
    lede: 'Search-first: something is broken.',
    cta: { label: 'What needs fixing? →', href: '/home-repair' },
  },
}

function groupByArchetype(all: MenuCategory[]): ArchetypeGroup[] {
  const buckets = new Map<Archetype, MenuCategory[]>()
  for (const cat of all) {
    const list = buckets.get(cat.archetype) ?? []
    list.push(cat)
    buckets.set(cat.archetype, list)
  }
  return ARCHETYPE_ORDER.map((arch) => ({
    archetype: arch,
    ...ARCHETYPE_META[arch],
    categories: buckets.get(arch) ?? [],
  })).filter((g) => g.categories.length > 0)
}

/**
 * Header category menu — six archetype top-line items on desktop, each
 * opening its own focused dropdown panel with the categories underneath.
 * Hamburger-into-sheet on mobile (still archetype-grouped accordion).
 */
export function CategoryMenu({ all }: CategoryMenuProps) {
  const [openArchetype, setOpenArchetype] = useState<Archetype | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!navRef.current) return
      if (e.target instanceof Node && navRef.current.contains(e.target)) return
      setOpenArchetype(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenArchetype(null)
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

  const groups = groupByArchetype(all)

  return (
    <>
      <nav className="header-nav-desktop" aria-label="Categories" ref={navRef}>
        {groups.map((group) => {
          const isOpen = openArchetype === group.archetype
          return (
            <div key={group.archetype} className="header-nav-archetype">
              <button
                type="button"
                className={`header-nav-link header-nav-archetype-trigger${isOpen ? ' is-open' : ''}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenArchetype(isOpen ? null : group.archetype)
                }
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
                  aria-label={group.title}
                >
                  <p className="header-archetype-panel-eyebrow">{group.title}</p>
                  <p className="header-archetype-panel-lede">{group.lede}</p>
                  <ul className="header-archetype-panel-list">
                    {group.categories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/${cat.slug}`}
                          role="menuitem"
                          className="header-archetype-panel-link"
                          onClick={() => setOpenArchetype(null)}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={group.cta.href}
                    className="header-archetype-panel-cta"
                    onClick={() => setOpenArchetype(null)}
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
                <details key={group.archetype} className="header-nav-sheet-group">
                  <summary className="header-nav-sheet-group-summary">
                    <span className="header-nav-sheet-group-title">{group.title}</span>
                    <span className="header-nav-sheet-group-count">
                      {group.categories.length}
                    </span>
                  </summary>
                  <div className="header-nav-sheet-group-body">
                    <p className="header-nav-sheet-group-lede">{group.lede}</p>
                    <nav className="header-nav-sheet-group-list" aria-label={group.title}>
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
