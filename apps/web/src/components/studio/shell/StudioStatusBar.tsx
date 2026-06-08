'use client'

/**
 * StudioStatusBar — the thin slab across the bottom of the Studio. Three
 * jobs: surface progress + dimensions at a glance, host the mobile-only
 * panel triggers, and stay out of the way the rest of the time.
 */

import { Palette, ListChecks } from 'lucide-react'
import type { PatternData } from '@homemade/db'
import { useChartStore } from '../chart/chart-store'

interface StudioStatusBarProps {
  pattern: PatternData
  onOpenPalette: () => void
  onOpenFlossKey: () => void
}

export function StudioStatusBar({ pattern, onOpenPalette, onOpenFlossKey }: StudioStatusBarProps) {
  const stitched = useChartStore((s) => s.stitchedCells)
  const total = pattern.grid.cells.length
  const done = stitched.size
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const finishedSize = describeFinishedSize(pattern)

  return (
    <footer className="studio-status-bar">
      <div className="studio-status-progress">
        <div className="studio-status-bar-fill" style={{ width: `${pct}%` }} aria-hidden />
        <span className="studio-status-stitch-count">
          {done.toLocaleString()} / {total.toLocaleString()} stitched ({pct}%)
        </span>
      </div>
      <div className="studio-status-meta">
        <span>{pattern.fabric.count}-count {pattern.fabric.type}</span>
        <span className="studio-status-dot">·</span>
        <span>{pattern.grid.width} × {pattern.grid.height} cells</span>
        <span className="studio-status-dot">·</span>
        <span>{finishedSize}</span>
      </div>
      <div className="studio-status-mobile-actions">
        <button type="button" onClick={onOpenPalette} className="studio-status-fab" aria-label="Palette">
          <Palette size={18} strokeWidth={1.6} />
        </button>
        <button type="button" onClick={onOpenFlossKey} className="studio-status-fab" aria-label="Floss key">
          <ListChecks size={18} strokeWidth={1.6} />
        </button>
      </div>
    </footer>
  )
}

function describeFinishedSize(pattern: PatternData): string {
  const inchesW = pattern.grid.width / pattern.fabric.count
  const inchesH = pattern.grid.height / pattern.fabric.count
  const cmW = inchesW * 2.54
  const cmH = inchesH * 2.54
  return `${cmW.toFixed(1)} × ${cmH.toFixed(1)} cm`
}
