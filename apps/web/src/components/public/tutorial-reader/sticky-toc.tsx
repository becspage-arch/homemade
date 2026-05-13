'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Sticky table of contents. Reads h2/h3 elements from inside `.tutorial-content`
 * after the body mounts, then highlights the currently-visible section using
 * an IntersectionObserver. On mobile collapses to a `<details>` dropdown.
 */
export function StickyToc() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.tutorial-content h2, .tutorial-content h3',
      ),
    )
    const collected: TocItem[] = []
    for (const h of headings) {
      if (!h.id) {
        const id = slugify(h.textContent ?? '')
        if (id) h.id = id
      }
      if (!h.id) continue
      collected.push({
        id: h.id,
        text: (h.textContent ?? '').trim(),
        level: h.tagName === 'H2' ? 2 : 3,
      })
    }
    // One-shot DOM measurement after the tutorial body has mounted; headings
    // don't change during the page lifetime, so the one cascading render is
    // intentional rather than a missed memoisation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(collected)

    if (collected.length === 0) return

    const observed = new Map<Element, string>()
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost heading that's currently above the fold.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({
            id: observed.get(e.target) ?? '',
            top: e.boundingClientRect.top,
          }))
          .sort((a, b) => a.top - b.top)
        const first = visible[0]
        if (first) setActiveId(first.id)
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    )

    for (const h of headings) {
      if (h.id) {
        observed.set(h, h.id)
        observer.observe(h)
      }
    }

    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null

  return (
    <>
      <nav className="toc toc-desktop" aria-label="On this page">
        <span className="toc-label">On this page</span>
        <ol className="toc-list">
          {items.map((item) => (
            <li
              key={item.id}
              className={`toc-item toc-item-l${item.level}${
                item.id === activeId ? ' active' : ''
              }`}
            >
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ol>
      </nav>

      <details className="toc toc-mobile">
        <summary>On this page</summary>
        <ol className="toc-list">
          {items.map((item) => (
            <li key={item.id} className={`toc-item toc-item-l${item.level}`}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ol>
      </details>
    </>
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
