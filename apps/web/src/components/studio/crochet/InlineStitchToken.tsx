'use client'

/**
 * InlineStitchToken — one tappable stitch abbreviation inside a row
 * instruction. Hover or tap opens a small popover with the canonical
 * stitch name + a link to the foundation tutorial that teaches it.
 *
 * Resolves the slug via the same stitch-help API the footer drawer
 * uses, so the same cache keys apply.
 */

import { useEffect, useRef, useState } from 'react'

interface StitchHelpEntry {
  stitchSlug: string
  canonicalName: string
  tutorial: {
    slug: string
    title: string
    categorySlug: string
  } | null
}

// Module-level cache so repeated taps don't re-fetch.
const cache = new Map<string, StitchHelpEntry>()

interface Props {
  slug: string
  displayText: string
}

export function InlineStitchToken({ slug, displayText }: Props) {
  const [open, setOpen] = useState(false)
  const [entry, setEntry] = useState<StitchHelpEntry | null>(() => cache.get(slug) ?? null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open || entry || cache.has(slug)) return
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      void (async () => {
        try {
          const params = new URLSearchParams({ slugs: slug })
          const res = await fetch(`/api/studio/crochet/stitch-help?${params.toString()}`)
          if (!res.ok) return
          const data = (await res.json()) as StitchHelpEntry[]
          const first = data[0]
          if (first) {
            cache.set(slug, first)
            if (!cancelled) setEntry(first)
          }
        } catch {
          // Silent — popover will say "stitch help unavailable" if needed.
        }
      })()
    }
    const id = setTimeout(tick, 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [open, entry, slug])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (popoverRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <span className="crochet-studio-inline-stitch-wrap">
      <button
        ref={triggerRef}
        type="button"
        className={`crochet-studio-inline-stitch${open ? ' is-open' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        aria-expanded={open}
      >
        {displayText}
      </button>
      {open && (
        <span ref={popoverRef} className="crochet-studio-inline-stitch-popover" role="dialog">
          <strong className="crochet-studio-inline-stitch-name">
            {entry?.canonicalName ?? slug}
          </strong>
          {entry?.tutorial ? (
            <a
              className="crochet-studio-inline-stitch-link"
              href={`/${entry.tutorial.categorySlug}/${entry.tutorial.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn this stitch
            </a>
          ) : entry ? (
            <span className="crochet-studio-inline-stitch-orphan">Tutorial coming</span>
          ) : (
            <span className="crochet-studio-inline-stitch-loading">Looking up…</span>
          )}
        </span>
      )}
    </span>
  )
}
