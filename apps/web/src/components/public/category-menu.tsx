'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface MenuCategory {
  slug: string
  name: string
}

interface CategoryMenuProps {
  spine: MenuCategory[]
  other: MenuCategory[]
}

/**
 * Header category menu — five spine links on desktop, "All categories"
 * overflow dropdown for the remaining 12 categories, hamburger-into-sheet on
 * mobile. The component owns its open / close state so the server header can
 * stay a static render.
 */
export function CategoryMenu({ spine, other }: CategoryMenuProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!moreRef.current) return
      if (e.target instanceof Node && moreRef.current.contains(e.target)) return
      setMoreOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMoreOpen(false)
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

  return (
    <>
      <nav className="header-nav-desktop" aria-label="Categories">
        {spine.map((cat) => (
          <Link key={cat.slug} href={`/${cat.slug}`} className="header-nav-link">
            {cat.name}
          </Link>
        ))}
        {other.length > 0 && (
          <div className="header-nav-more" ref={moreRef}>
            <button
              type="button"
              className="header-nav-link header-nav-more-trigger"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((o) => !o)}
            >
              All categories
            </button>
            {moreOpen && (
              <div className="header-nav-more-panel" role="menu">
                {[...spine, ...other].map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/${cat.slug}`}
                    role="menuitem"
                    className="header-nav-more-item"
                    onClick={() => setMoreOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
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
          <line
            x1="4"
            y1="7"
            x2="20"
            y2="7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <line
            x1="4"
            y1="13"
            x2="20"
            y2="13"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <line
            x1="4"
            y1="19"
            x2="20"
            y2="19"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
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
            <nav className="header-nav-sheet-list" aria-label="All categories">
              {[...spine, ...other].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="header-nav-sheet-link"
                  onClick={() => setSheetOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/search"
                className="header-nav-sheet-link"
                onClick={() => setSheetOpen(false)}
              >
                Search
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
