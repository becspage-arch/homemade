'use client'

/**
 * CrochetStitchHelpPanel — collapsible panel listing every stitch the
 * open pattern uses. For each stitch it shows the chart symbol, the
 * abbreviation and name (in the maker's chosen UK/US terminology), and a
 * one-line reminder of how it's worked — so "wait, what's dc2tog again?"
 * is answered without leaving the row. Each stitch links to its full
 * lesson, and the panel links out to the complete stitch guide.
 *
 * Loads lazily on first open: the foundation data doesn't change during a
 * session, so one fetch per pattern is enough.
 */

import { useEffect, useState } from 'react'
import { LifeBuoy, ExternalLink, BookOpen } from 'lucide-react'
import { StitchGlyph } from '@/components/public/stitch-glyph'
import { getChartSymbol } from '@/lib/craft-charts/chart-symbols'
import type { TerminologyMode } from './types'

interface StitchHelpEntry {
  stitchSlug: string
  canonicalName: string
  ukName: string | null
  usName: string | null
  ukAbbreviation: string | null
  usAbbreviation: string | null
  chartSymbol: string | null
  notes: string | null
  tutorial: {
    slug: string
    title: string
    categorySlug: string
  } | null
}

interface Props {
  craftStitchSlugs: string[]
  terminology: TerminologyMode
}

export function CrochetStitchHelpPanel({ craftStitchSlugs, terminology }: Props) {
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

  const nameFor = (e: StitchHelpEntry) =>
    (terminology === 'uk' ? e.ukName : e.usName) ?? e.canonicalName
  const abbrFor = (e: StitchHelpEntry) =>
    (terminology === 'uk' ? e.ukAbbreviation : e.usAbbreviation) ??
    e.ukAbbreviation ??
    e.usAbbreviation

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
            A quick reminder of every stitch this pattern uses. Tap one to open its full lesson in a
            new tab — the pattern stays where you left it.
          </p>
          {loading && <p className="crochet-studio-stitch-help-loading">Looking these up…</p>}
          {entries && (
            <ul className="crochet-studio-stitch-help-list">
              {entries.map((entry) => {
                const abbr = abbrFor(entry)
                const hasGlyph = Boolean(
                  entry.chartSymbol && getChartSymbol('crochet', entry.chartSymbol),
                )
                return (
                  <li key={entry.stitchSlug} className="crochet-studio-stitch-help-item">
                    <div className="crochet-studio-stitch-help-symbol" aria-hidden="true">
                      {hasGlyph ? (
                        <StitchGlyph craft="crochet" symbol={entry.chartSymbol} size={26} />
                      ) : (
                        <span className="crochet-studio-stitch-help-symbol-none">—</span>
                      )}
                    </div>
                    <div className="crochet-studio-stitch-help-detail">
                      <div className="crochet-studio-stitch-help-headline">
                        <span className="crochet-studio-stitch-help-name">{nameFor(entry)}</span>
                        {abbr && (
                          <code className="crochet-studio-stitch-help-abbr">{abbr}</code>
                        )}
                      </div>
                      {entry.notes && (
                        <p className="crochet-studio-stitch-help-note">{entry.notes}</p>
                      )}
                      {entry.tutorial && (
                        <a
                          href={`/${entry.tutorial.categorySlug}/${entry.tutorial.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="crochet-studio-stitch-help-link"
                        >
                          <span>How to work it</span>
                          <ExternalLink size={12} strokeWidth={1.5} aria-hidden />
                        </a>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <a
            href="/stitches/crochet"
            target="_blank"
            rel="noopener noreferrer"
            className="crochet-studio-stitch-help-all"
          >
            <BookOpen size={14} strokeWidth={1.5} aria-hidden />
            <span>See all crochet stitches</span>
          </a>
        </div>
      )}
    </div>
  )
}
