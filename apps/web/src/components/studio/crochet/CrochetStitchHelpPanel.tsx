'use client'

/**
 * CrochetStitchHelpPanel — collapsible side panel listing every stitch
 * the open pattern uses, with a one-click "Learn this stitch" link to
 * the foundation tutorial. Surfaces the answer to "how do I do that
 * stitch I don't know yet?" without making the maker leave the Studio
 * surface mid-row.
 *
 * Loads lazily on first open: the foundation tutorials don't change
 * during a session, so one fetch per pattern is enough.
 */

import { useEffect, useState } from 'react'
import { LifeBuoy, ExternalLink } from 'lucide-react'

interface StitchHelpEntry {
  stitchSlug: string
  canonicalName: string
  tutorial: {
    slug: string
    title: string
    categorySlug: string
  } | null
}

interface Props {
  craftStitchSlugs: string[]
}

export function CrochetStitchHelpPanel({ craftStitchSlugs }: Props) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<StitchHelpEntry[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (entries || craftStitchSlugs.length === 0) return
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      setLoading(true)
      void (async () => {
        try {
          const params = new URLSearchParams({ slugs: craftStitchSlugs.join(',') })
          const res = await fetch(`/api/studio/crochet/stitch-help?${params.toString()}`)
          if (cancelled) return
          if (res.ok) {
            const data = (await res.json()) as StitchHelpEntry[]
            setEntries(data)
          } else {
            setEntries([])
          }
        } catch {
          if (!cancelled) setEntries([])
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    }
    const id = setTimeout(tick, 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [open, entries, craftStitchSlugs])

  if (craftStitchSlugs.length === 0) return null

  return (
    <div className={`crochet-studio-stitch-help${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="crochet-studio-stitch-help-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <LifeBuoy size={16} strokeWidth={1.5} />
        <span>Stitches in this pattern</span>
        <span className="crochet-studio-stitch-help-count">{craftStitchSlugs.length}</span>
      </button>

      {open && (
        <div className="crochet-studio-stitch-help-drawer">
          <p className="crochet-studio-stitch-help-help">
            Tap any stitch to open its tutorial in a new tab. The pattern stays right where you
            left it.
          </p>
          {loading && <p className="crochet-studio-stitch-help-loading">Looking these up…</p>}
          {entries && (
            <ul className="crochet-studio-stitch-help-list">
              {entries.map((entry) => (
                <li key={entry.stitchSlug} className="crochet-studio-stitch-help-item">
                  {entry.tutorial ? (
                    <a
                      href={`/${entry.tutorial.categorySlug}/${entry.tutorial.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="crochet-studio-stitch-help-link"
                    >
                      <span className="crochet-studio-stitch-help-name">
                        {entry.canonicalName}
                      </span>
                      <ExternalLink size={12} strokeWidth={1.5} aria-hidden />
                    </a>
                  ) : (
                    <span className="crochet-studio-stitch-help-orphan">
                      {entry.canonicalName}
                      <span className="crochet-studio-stitch-help-orphan-note"> · tutorial coming</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
