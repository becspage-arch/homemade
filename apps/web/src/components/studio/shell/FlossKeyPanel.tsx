'use client'

/**
 * FlossKeyPanel — the right-edge overlay drawer. Lists every palette
 * entry with its stitch count, skein estimate, and brand code. Clicking
 * a row sets isolate mode (mirrors the palette panel's per-chip isolate
 * button so users have two paths to the same action).
 *
 * Sort options: stitched-first (the "next colour" workflow), most
 * stitches, palette order, alphabetical.
 */

import { useMemo, useState, useEffect } from 'react'
import { ListChecks, X, ArrowUpDown, Pin } from 'lucide-react'
import { estimateSkeinCount, cellKey, type PatternData } from '@homemade/db/pattern'
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
      const skein = estimateSkeinCount(pattern, entry.symbol)
      return {
        entry,
        paletteIndex,
        totalStitches,
        stitchedCount,
        remaining: totalStitches - stitchedCount,
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
          {rows.map(({ entry, totalStitches, stitchedCount, remaining, skein }) => {
            const isIsolated = entry.symbol === isolate
            const parkedAt = parkingEnabled ? parked.get(entry.symbol) ?? null : null
            const isNextUp = parkingEnabled && entry.symbol === nextUpSymbol
            return (
              <li
                key={entry.symbol}
                className={[
                  'studio-flosskey-row',
                  isIsolated ? 'is-isolated' : '',
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
                    <span className="studio-flosskey-name">{entry.name}</span>
                    <span className="studio-flosskey-code">{entry.brand} {entry.code}</span>
                  </span>
                  <span className="studio-flosskey-counts">
                    <span className="studio-flosskey-total">{totalStitches.toLocaleString()} st</span>
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
