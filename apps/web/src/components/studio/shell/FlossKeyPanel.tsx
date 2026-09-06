'use client'

/**
 * FlossKeyPanel — the right-edge overlay drawer. Lists every palette
 * entry with its stitch count, skein estimate, and brand code. Clicking
 * a row sets isolate mode (mirrors the palette panel's per-chip isolate
 * button so users have two paths to the same action).
 *
 * Sort options: stitched-first (the "next colour" workflow), most
 * stitches, palette order, alphabetical.
 *
 * Colours already in the maker's floss stash are ticked, the same match the
 * pattern page and the library card use (exact code first, then the published
 * brand conversions). The stash fetch is best-effort: a signed-out stitcher,
 * or one with an empty stash, simply sees no ticks.
 */

import { useMemo, useState, useEffect } from 'react'
import { ListChecks, X, ArrowUpDown, Check, Pin } from 'lucide-react'
import { estimateSkeinCount, cellKey, type PatternData } from '@homemade/db/pattern'
import {
  buildStashIndex,
  matchStashColour,
  type StashFlossItem,
} from '@/lib/floss/stash-ownership'
import { useChartStore } from '../chart/chart-store'
import { cellLabel, nextColourUp } from '@/lib/studio/parking'

type SortKey = 'palette' | 'most' | 'alpha' | 'next' | 'park'

interface FlossKeyPanelProps {
  pattern: PatternData
  open: boolean
  onClose: () => void
  onOpen: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function FlossKeyPanel({ pattern, open, onClose, onOpen, mobileOpen, onMobileClose }: FlossKeyPanelProps) {
  const isolate = useChartStore((s) => s.isolateSymbol)
  const setIsolate = useChartStore((s) => s.setIsolate)
  const setCurrentSymbol = useChartStore((s) => s.setCurrentSymbol)
  const stitched = useChartStore((s) => s.stitchedCells)
  const parkingEnabled = useChartStore((s) => s.parkingEnabled)
  const parked = useChartStore((s) => s.parkedCells)
  const centreOnCell = useChartStore((s) => s.centreOnCell)

  const [sortKey, setSortKey] = useState<SortKey>('palette')
  const [stash, setStash] = useState<StashFlossItem[]>([])

  // The stash is free for any signed-in maker, so this is a plain fetch with
  // no gate. A 401 or a network wobble just means no ticks.
  useEffect(() => {
    let cancelled = false
    fetch('/api/studio/planner/stash?craft=CROSS_STITCH')
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { entries?: StashFlossItem[] } | null) => {
        if (cancelled || !body?.entries) return
        setStash(body.entries)
      })
      .catch(() => {
        /* no stash, no ticks */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const ownedSymbols = useMemo(() => {
    const owned = new Set<string>()
    if (stash.length === 0) return owned
    const index = buildStashIndex(stash)
    for (const entry of pattern.palette) {
      if (matchStashColour(entry.brand, entry.code, index).quantityOwned > 0) {
        owned.add(entry.symbol)
      }
    }
    return owned
  }, [pattern, stash])

  // The colour to pick up next in the current working order. Only meaningful
  // while parking is on; the parked map is empty otherwise.
  const nextUpSymbol = useMemo(
    () => (parkingEnabled ? nextColourUp(parked) : null),
    [parkingEnabled, parked],
  )

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onMobileClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onMobileClose])

  const rows = useMemo(() => {
    const out = pattern.palette.map((entry, paletteIndex) => {
      let totalStitches = 0
      let stitchedCount = 0
      for (const cell of pattern.grid.cells) {
        if (cell.s !== entry.symbol) continue
        totalStitches++
        if (stitched.has(cellKey(cell.x, cell.y))) stitchedCount++
      }
      // Cells of back-stitch line and knots in this colour. An outline floss can
      // carry no full crosses at all, and a row reading "0 st" beside a skein
      // estimate looks like a mistake rather than the colour you buy for the
      // line work.
      let lineCells = 0
      for (const seg of pattern.grid.backstitch) {
        if (seg.s !== entry.symbol) continue
        lineCells += Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1)
      }
      let knots = 0
      for (const knot of pattern.grid.frenchKnots) {
        if (knot.s === entry.symbol) knots++
      }
      let fractionals = 0
      for (const f of pattern.grid.fractional) {
        if (f.s === entry.symbol) fractionals++
      }
      const skein = estimateSkeinCount(pattern, entry.symbol)
      return {
        entry,
        paletteIndex,
        totalStitches,
        stitchedCount,
        remaining: totalStitches - stitchedCount,
        lineCells: Math.round(lineCells),
        knots,
        fractionals,
        skein,
      }
    })
    if (sortKey === 'park') {
      // Working order: the colour parked earliest comes first, finished
      // colours drop to the bottom.
      out.sort((a, b) => {
        const ra = parked.get(a.entry.symbol)?.rank ?? Infinity
        const rb = parked.get(b.entry.symbol)?.rank ?? Infinity
        return ra - rb
      })
    } else if (sortKey === 'most') out.sort((a, b) => b.totalStitches - a.totalStitches)
    else if (sortKey === 'alpha') out.sort((a, b) => a.entry.name.localeCompare(b.entry.name))
    else if (sortKey === 'next') {
      out.sort((a, b) => {
        if (a.remaining === 0 && b.remaining > 0) return 1
        if (b.remaining === 0 && a.remaining > 0) return -1
        return a.remaining - b.remaining
      })
    }
    return out
  }, [pattern, stitched, sortKey, parked])

  return (
    <>
      {!open && (
        <button type="button" className="studio-panel-tab studio-panel-tab-right" onClick={onOpen} aria-label="Open floss key">
          <ListChecks size={16} strokeWidth={1.6} />
          <span>Floss key</span>
        </button>
      )}

      <aside
        className={[
          'studio-panel studio-flosskey-panel',
          open ? 'is-open' : '',
          mobileOpen ? 'is-mobile-open' : '',
        ].join(' ')}
        aria-label="Floss key"
      >
        <header className="studio-panel-header">
          <div className="studio-panel-title">
            <ListChecks size={14} strokeWidth={1.6} />
            <span>Floss key</span>
          </div>
          <div className="studio-flosskey-sort">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort"
            >
              <option value="palette">Palette order</option>
              <option value="most">Most stitches</option>
              <option value="next">Next colour</option>
              {parkingEnabled && <option value="park">Parking order</option>}
              <option value="alpha">Alphabetical</option>
            </select>
            <ArrowUpDown size={13} strokeWidth={1.6} />
          </div>
          <button type="button" className="studio-icon-button" onClick={() => {
            onClose()
            onMobileClose()
          }} aria-label="Close floss key">
            <X size={16} strokeWidth={1.6} />
          </button>
        </header>

        <ul className="studio-flosskey-list">
          {rows.map(({ entry, totalStitches, stitchedCount, remaining, lineCells, knots, fractionals, skein }) => {
            const isIsolated = entry.symbol === isolate
            const owned = ownedSymbols.has(entry.symbol)
            const parkedAt = parkingEnabled ? parked.get(entry.symbol) ?? null : null
            const isNextUp = parkingEnabled && entry.symbol === nextUpSymbol
            return (
              <li
                key={entry.symbol}
                className={[
                  'studio-flosskey-row',
                  isIsolated ? 'is-isolated' : '',
                  owned ? 'is-owned' : '',
                  isNextUp ? 'is-next-up' : '',
                ].join(' ')}
              >
                <button
                  type="button"
                  className="studio-flosskey-button"
                  onClick={() => {
                    setCurrentSymbol(entry.symbol)
                    setIsolate(isIsolated ? null : entry.symbol)
                  }}
                >
                  <span
                    className="studio-flosskey-swatch"
                    style={{ background: entry.rgb }}
                  >
                    <span className="studio-flosskey-symbol">{entry.symbol}</span>
                  </span>
                  <span className="studio-flosskey-detail">
                    <span className="studio-flosskey-name">
                      {owned && (
                        <span
                          className="studio-flosskey-owned"
                          role="img"
                          aria-label="In your stash"
                          title="In your stash"
                        >
                          <Check size={12} strokeWidth={2.4} aria-hidden="true" />
                        </span>
                      )}
                      {entry.name}
                    </span>
                    <span className="studio-flosskey-code">{entry.brand} {entry.code}</span>
                  </span>
                  <span className="studio-flosskey-counts">
                    <span className="studio-flosskey-total">
                      {totalStitches.toLocaleString()} st
                      {fractionals > 0 && ` · ${fractionals.toLocaleString()} part`}
                      {lineCells > 0 && ` · ${lineCells.toLocaleString()} back-stitch`}
                      {knots > 0 && ` · ${knots} knot${knots === 1 ? '' : 's'}`}
                    </span>
                    {stitchedCount > 0 && (
                      <span className="studio-flosskey-progress">{stitchedCount} done · {remaining} left</span>
                    )}
                    <span className="studio-flosskey-skein">~{formatSkein(skein)} skein{skein > 1 ? 's' : ''}</span>
                  </span>
                </button>
                {parkingEnabled && (
                  <div className="studio-flosskey-park">
                    {parkedAt ? (
                      <button
                        type="button"
                        className="studio-flosskey-park-jump"
                        onClick={() => centreOnCell(parkedAt.x, parkedAt.y)}
                        title={`Go to the parked square for ${entry.name}`}
                      >
                        <Pin size={12} strokeWidth={1.8} aria-hidden="true" />
                        <span>Parked at {cellLabel(parkedAt)}</span>
                      </button>
                    ) : (
                      <span className="studio-flosskey-park-done">Finished</span>
                    )}
                    {isNextUp && <span className="studio-flosskey-park-nextup">Next up</span>}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <footer className="studio-panel-footer subtle">
          Skein estimates include a 25% safety margin.
        </footer>
      </aside>
    </>
  )
}

function formatSkein(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}
