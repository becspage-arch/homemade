'use client'

/**
 * StudioStatusBar — the thin slab across the bottom of the Studio. Three
 * jobs: surface progress + dimensions at a glance, host the mobile-only
 * controls, and stay out of the way the rest of the time.
 *
 * The mobile controls carry zoom as well as the two panel triggers. A
 * phone has no wheel and no keyboard, so without them the only way to
 * change the zoom is the pinch, and a Maker holding a hoop in one hand has
 * one thumb free. Every one of them is a real button, so they answer to a
 * keyboard and to a screen reader as well as to a thumb.
 */

import { useMemo } from 'react'
import { Palette, ListChecks, Plus, Minus, Maximize2 } from 'lucide-react'
import { countStitchProgress, type PatternData } from '@homemade/db/pattern'
import { useChartStore } from '../chart/chart-store'

interface StudioStatusBarProps {
  pattern: PatternData
  onOpenPalette: () => void
  onOpenFlossKey: () => void
}

export function StudioStatusBar({ pattern, onOpenPalette, onOpenFlossKey }: StudioStatusBarProps) {
  const stitched = useChartStore((s) => s.stitchedCells)
  const zoomAtCentre = useChartStore((s) => s.zoomAtCentre)
  const fitViewportToScreen = useChartStore((s) => s.fitViewportToScreen)
  // Everything the needle has to go through, not just the full crosses:
  // part stitches count one each, French knots one each, and back-stitch in
  // CELLS OF LINE, which is the measure the floss key and the skein estimate
  // already print. A chart whose outline is half its work should not sit at
  // 100% with the outline untouched.
  const progress = useMemo(() => countStitchProgress(pattern, stitched), [pattern, stitched])
  const total = progress.total
  const done = progress.done
  const pct = progress.percent

  const finishedSize = describeFinishedSize(pattern)

  return (
    <footer className="studio-status-bar">
      <div className="studio-status-progress">
        <div className="studio-status-bar-fill" style={{ width: `${pct}%` }} aria-hidden />
        <span className="studio-status-stitch-count">
          {progress.complete
            ? `Finished — all ${total.toLocaleString()} stitched`
            : `${done.toLocaleString()} / ${total.toLocaleString()} stitched (${pct}%)`}
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
        <button
          type="button"
          onClick={() => zoomAtCentre(1 / 1.35)}
          className="studio-status-fab"
          aria-label="Zoom out"
        >
          <Minus size={18} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={() => zoomAtCentre(1.35)}
          className="studio-status-fab"
          aria-label="Zoom in"
        >
          <Plus size={18} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={() => fitViewportToScreen()}
          className="studio-status-fab"
          aria-label="Fit the whole chart on screen"
        >
          <Maximize2 size={16} strokeWidth={1.8} />
        </button>
        <span className="studio-status-fab-divider" aria-hidden="true" />
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
