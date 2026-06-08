'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface MenuCategory {
  slug: string
  name: string
  archetype: 'RECIPE' | 'PATTERN' | 'SKILL' | 'PRACTICE' | 'PLANT' | 'FIX'
}

interface CategoryMenuProps {
  spine: MenuCategory[]
  /** All categories — used to build the archetype mega-menu. */
  all: MenuCategory[]
}

interface ArchetypeGroup {
  archetype: MenuCategory['archetype']
  title: string
  lede: string
  cta: { label: string; href: string }
  categories: MenuCategory[]
}

const ARCHETYPE_ORDER: MenuCategory['archetype'][] = [
  'RECIPE',
  'PATTERN',
  'SKILL',
  'PRACTICE',
  'PLANT',
  'FIX',
]

const ARCHETYPE_META: Record<MenuCategory['archetype'], { title: string; lede: string; cta: { label: string; href: string } }> = {
  RECIPE: {
    title: 'Make food & remedies',
    lede: 'Recipe-led: cook, bake, brew, blend.',
    cta: { label: 'What are you cooking? →', href: '/cooking' },
  },
  PATTERN: {
    title: 'Make things',
    lede: 'Pattern + Studio: stitch, knit, sew.',
    cta: { label: 'Open the Studio →', href: '/cross-stitch' },
  },
  SKILL: {
    title: 'Build a skill',
    lede: 'Craft + technique: hands, tools, time.',
    cta: { label: 'Start with foundations →', href: '/fibre-arts' },
  },
  PRACTICE: {
    title: 'Daily practice',
    lede: 'Mood + habit-led: turn up regularly.',
    cta: { label: 'How are you feeling? →', href: '/mindset' },
  },
  PLANT: {
    title: 'Grow',
    lede: 'Plant + season-aware: what to sow now.',
    cta: { label: 'What can I sow this month? →', href: '/garden' },
  },
  FIX: {
    title: 'Fix it',
    lede: 'Search-first: something is broken.',
    cta: { label: 'What needs fixing? →', href: '/home-repair' },
  },
}

function groupByArchetype(all: MenuCategory[]): ArchetypeGroup[] {
  const buckets = new Map<MenuCategory['archetype'], MenuCategory[]>()
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
 * Header category menu — five spine links on desktop, "Browse" mega-menu
 * grouped by archetype for the full library, hamburger-into-sheet on mobile.
 * The mega-menu makes the depth of the site visible: users can see at a
 * glance that the site has six families of things to do, what each one
 * leads with, and where the categories live underneath.
 */
export function CategoryMenu({ spine, all }: CategoryMenuProps) {
  const [browseOpen, setBrowseOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const browseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!browseRef.current) return
      if (e.target instanceof Node && browseRef.current.contains(e.target)) return
      setBrowseOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setBrowseOpen(false)
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
      <nav className="header-nav-desktop" aria-label="Categories">
        {spine.map((cat) => (
          <Link key={cat.slug} href={`/${cat.slug}`} className="header-nav-link">
            {cat.name}
          </Link>
        ))}
        <div className="header-nav-more" ref={browseRef}>
          <button
            type="button"
            className="header-nav-link header-nav-more-trigger"
            aria-haspopup="menu"
            aria-expanded={browseOpen}
            onClick={() => setBrowseOpen((o) => !o)}
          >
            Browse {browseOpen ? '▴' : '▾'}
          </button>
          {browseOpen && (
            <div className="header-mega-panel" role="menu" aria-label="All categories">
              {groups.map((group) => (
                <section key={group.archetype} className="header-mega-column">
                  <header className="header-mega-column-header">
                    <h3 className="header-mega-column-title">{group.title}</h3>
                    <p className="header-mega-column-lede">{group.lede}</p>
                  </header>
                  <ul className="header-mega-column-list">
                    {group.categories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/${cat.slug}`}
                          role="menuitem"
                          className="header-mega-column-link"
                          onClick={() => setBrowseOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={group.cta.href}
                    className="header-mega-column-cta"
                    onClick={() => setBrowseOpen(false)}
                  >
                    {group.cta.label}
                  </Link>
                </section>
              ))}
            </div>
          )}
        </div>
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
