'use client'

/**
 * The word art while it is being placed: a ghost of the lettering floating over
 * the chart, on the chart's own grid, that the maker drags where they want it.
 *
 * It reads the same viewport the chart viewport draws with, so the ghost pans
 * and zooms with the work under it. Nothing here touches the pattern; the
 * squares only become stitches when the panel says so.
 */

import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { PatternData } from '@homemade/db/pattern'
import { DEFAULT_CELL_PX } from '../chart/render-helpers'
import { useChartStore } from '../chart/chart-store'
import { useWordArtStore } from './word-art-store'
import './word-art.css'

export function WordArtOverlay({ pattern }: { pattern: PatternData }) {
  const open = useWordArtStore((s) => s.open)
  const mask = useWordArtStore((s) => s.mask)
  const symbol = useWordArtStore((s) => s.symbol)
  const x = useWordArtStore((s) => s.x)
  const y = useWordArtStore((s) => s.y)
  const moveTo = useWordArtStore((s) => s.moveTo)
  const viewport = useChartStore((s) => s.viewport)

  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  if (!open || !mask || mask.cells.length === 0) return null

  const rgb = pattern.palette.find((p) => p.symbol === symbol)?.rgb ?? '#3c3c3c'
  const px = DEFAULT_CELL_PX * viewport.scale
  const left = viewport.panX + x * px
  const top = viewport.panY + y * px
  const width = mask.width * px
  const height = mask.height * px

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startX: e.clientX, startY: e.clientY, originX: x, originY: y }
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || px <= 0) return
    moveTo(
      d.originX + Math.round((e.clientX - d.startX) / px),
      d.originY + Math.round((e.clientY - d.startY) / px),
    )
  }
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div
      className="word-art-ghost"
      style={{ left, top, width, height }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="presentation"
    >
      <svg viewBox={`0 0 ${mask.width} ${mask.height}`} preserveAspectRatio="none" aria-hidden="true">
        <g fill={rgb}>
          {mask.cells.map(([cx, cy]) => (
            <rect key={`${cx},${cy}`} x={cx} y={cy} width={1.02} height={1.02} />
          ))}
        </g>
      </svg>
    </div>
  )
}
