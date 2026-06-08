'use client'

/**
 * PalettePanel — the floating palette overlay. Each entry is a paint
 * chip; clicking sets the active brush colour. The active entry pulses
 * a softer ring around its swatch. Click "isolate" in the chip's hover
 * menu to fade every other colour on the chart.
 *
 * Visible by default on desktop; collapses to a tab on click of the
 * close handle. On mobile, slides up from the bottom as a sheet.
 */

import { useState, useEffect } from 'react'
import type { PatternData } from '@homemade/db'
import { X, EyeOff, Eye, Palette } from 'lucide-react'
import { useChartStore } from '../chart/chart-store'

interface PalettePanelProps {
  pattern: PatternData
  open: boolean
  onClose: () => void
  onOpen: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function PalettePanel({ pattern, open, onClose, onOpen, mobileOpen, onMobileClose }: PalettePanelProps) {
  const currentSymbol = useChartStore((s) => s.currentSymbol)
  const isolate = useChartStore((s) => s.isolateSymbol)
  const setCurrentSymbol = useChartStore((s) => s.setCurrentSymbol)
  const setIsolate = useChartStore((s) => s.setIsolate)

  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null)

  // ESC closes the mobile sheet.
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onMobileClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onMobileClose])

  return (
    <>
      {!open && (
        <button type="button" className="studio-panel-tab studio-panel-tab-left" onClick={onOpen} aria-label="Open palette">
          <Palette size={16} strokeWidth={1.6} />
          <span>Palette</span>
        </button>
      )}

      <aside
        className={[
          'studio-panel studio-palette-panel',
          open ? 'is-open' : '',
          mobileOpen ? 'is-mobile-open' : '',
        ].join(' ')}
        aria-label="Palette"
      >
        <header className="studio-panel-header">
          <div className="studio-panel-title">
            <Palette size={14} strokeWidth={1.6} />
            <span>Palette</span>
          </div>
          <button type="button" className="studio-icon-button" onClick={() => {
            onClose()
            onMobileClose()
          }} aria-label="Close palette">
            <X size={16} strokeWidth={1.6} />
          </button>
        </header>

        <ul className="studio-palette-list" role="listbox">
          {pattern.palette.map((entry) => {
            const isActive = entry.symbol === currentSymbol
            const isIsolated = entry.symbol === isolate
            return (
              <li
                key={entry.symbol}
                className={[
                  'studio-palette-chip',
                  isActive ? 'is-active' : '',
                  isolate && !isIsolated ? 'is-dimmed' : '',
                ].join(' ')}
                onMouseEnter={() => setHoveredSymbol(entry.symbol)}
                onMouseLeave={() => setHoveredSymbol(null)}
              >
                <button
                  type="button"
                  className="studio-palette-chip-button"
                  onClick={() => setCurrentSymbol(entry.symbol)}
                >
                  <span
                    className="studio-palette-swatch"
                    style={{ background: entry.rgb }}
                  >
                    <span className="studio-palette-symbol">{entry.symbol}</span>
                  </span>
                  <span className="studio-palette-meta">
                    <span className="studio-palette-name">{entry.name}</span>
                    <span className="studio-palette-code">{entry.brand} {entry.code}</span>
                  </span>
                </button>
                {hoveredSymbol === entry.symbol && (
                  <button
                    type="button"
                    className="studio-icon-button studio-palette-isolate"
                    onClick={() => setIsolate(isIsolated ? null : entry.symbol)}
                    aria-label={isIsolated ? 'Stop isolating' : 'Isolate this colour'}
                    title={isIsolated ? 'Stop isolating' : 'Isolate this colour'}
                  >
                    {isIsolated ? <Eye size={14} strokeWidth={1.6} /> : <EyeOff size={14} strokeWidth={1.6} />}
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <footer className="studio-panel-footer subtle">
          {pattern.palette.length} colours
        </footer>
      </aside>
    </>
  )
}
