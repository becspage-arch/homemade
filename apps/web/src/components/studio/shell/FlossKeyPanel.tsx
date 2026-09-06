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
import { ListChecks, X, ArrowUpDown } from 'lucide-react'
import { estimateSkeinCount, cellKey, type PatternData } from '@homemade/db/pattern'
import { useChartStore } from '../chart/chart-store'

type SortKey = 'palette' | 'most' | 'alpha' | 'next'

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

  const [sortKey, setSortKey] = useState<SortKey>('palette')

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
      const skein = estimateSkeinCount(pattern, entry.symbol)
      return {
        entry,
        paletteIndex,
        totalStitches,
        stitchedCount,
        remaining: totalStitches - stitchedCount,
        lineCells: Math.round(lineCells),
        knots,
        skein,
      }
    })
    if (sortKey === 'most') out.sort((a, b) => b.totalStitches - a.totalStitches)
    else if (sortKey === 'alpha') out.sort((a, b) => a.entry.name.localeCompare(b.entry.name))
    else if (sortKey === 'next') {
      out.sort((a, b) => {
        if (a.remaining === 0 && b.remaining > 0) return 1
        if (b.remaining === 0 && a.remaining > 0) return -1
        return a.remaining - b.remaining
      })
    }
    return out
  }, [pattern, stitched, sortKey])

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
          {rows.map(({ entry, totalStitches, stitchedCount, remaining, lineCells, knots, skein }) => {
            const isIsolated = entry.symbol === isolate
            return (
              <li
                key={entry.symbol}
                className={['studio-flosskey-row', isIsolated ? 'is-isolated' : ''].join(' ')}
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
                    <span className="studio-flosskey-total">
                      {totalStitches.toLocaleString()} st
                      {lineCells > 0 && ` · ${lineCells.toLocaleString()} back-stitch`}
                      {knots > 0 && ` · ${knots} knot${knots === 1 ? '' : 's'}`}
                    </span>
                    {stitchedCount > 0 && (
                      <span className="studio-flosskey-progress">{stitchedCount} done · {remaining} left</span>
                    )}
                    <span className="studio-flosskey-skein">~{formatSkein(skein)} skein{skein > 1 ? 's' : ''}</span>
                  </span>
                </button>
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
