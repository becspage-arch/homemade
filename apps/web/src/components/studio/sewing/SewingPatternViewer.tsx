'use client'

/**
 * SewingPatternViewer - SVG canvas that renders sewing pattern pieces
 * with zoom, pan, and per-layer toggles. Pieces come in millimetres
 * (canonical) and the viewer scales for display. Browse-only mode is
 * the default - no printer or projector required.
 *
 * Layer toggles per the locked controls:
 *   - Seam allowance lines (dashed inside outline)
 *   - Grain lines
 *   - Notches
 *   - Piece labels with cut counts
 *   - Show all / show piece N
 *
 * Controls live above the canvas; the canvas itself supports drag-to-pan
 * and wheel-to-zoom (with ctrl-wheel for finer steps).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SewingPatternData, SewingPiece } from './types'

interface SewingPatternViewerProps {
  pattern: SewingPatternData
  selectedSize: string
}

interface ViewState {
  scale: number
  panX: number
  panY: number
}

const MM_TO_PX = 2 // initial display scale: 2 px per mm
const MIN_SCALE = 0.4
const MAX_SCALE = 6

export function SewingPatternViewer({ pattern }: SewingPatternViewerProps) {
  const [view, setView] = useState<ViewState>({ scale: 1, panX: 0, panY: 0 })
  const [showSeam, setShowSeam] = useState(pattern.seamAllowanceIncluded)
  const [showGrain, setShowGrain] = useState(true)
  const [showNotches, setShowNotches] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [focusPieceIdx, setFocusPieceIdx] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const canvasRef = useRef<HTMLDivElement | null>(null)
  const dragOrigin = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const visiblePieces = useMemo<SewingPiece[]>(() => {
    if (focusPieceIdx === null) return pattern.pieces
    const piece = pattern.pieces[focusPieceIdx]
    return piece ? [piece] : []
  }, [pattern.pieces, focusPieceIdx])

  // Compute a viewBox that fits the visible pieces with 10mm padding.
  const bounds = useMemo(() => computeBounds(visiblePieces), [visiblePieces])

  const fitToScreen = useCallback(() => {
    setView({ scale: 1, panX: 0, panY: 0 })
  }, [])

  const zoomBy = useCallback((delta: number) => {
    setView((v) => {
      const nextScale = clamp(v.scale * delta, MIN_SCALE, MAX_SCALE)
      return { ...v, scale: nextScale }
    })
  }, [])

  // Wheel zoom.
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('button')) return
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.92 : 1.08
      setView((v) => ({ ...v, scale: clamp(v.scale * factor, MIN_SCALE, MAX_SCALE) }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      setDragging(true)
      dragOrigin.current = { x: e.clientX, y: e.clientY, panX: view.panX, panY: view.panY }
    },
    [view.panX, view.panY],
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !dragOrigin.current) return
      const dx = e.clientX - dragOrigin.current.x
      const dy = e.clientY - dragOrigin.current.y
      setView((v) => ({ ...v, panX: dragOrigin.current!.panX + dx, panY: dragOrigin.current!.panY + dy }))
    },
    [dragging],
  )

  const onMouseUp = useCallback(() => {
    setDragging(false)
    dragOrigin.current = null
  }, [])

  // Keyboard +/- zoom + 0 fit.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '+' || e.key === '=') zoomBy(1.15)
      else if (e.key === '-') zoomBy(0.87)
      else if (e.key === '0') fitToScreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomBy, fitToScreen])

  const widthMm = bounds.maxX - bounds.minX + 40
  const heightMm = bounds.maxY - bounds.minY + 40
  const viewBox = `${bounds.minX - 20} ${bounds.minY - 20} ${widthMm} ${heightMm}`

  return (
    <div className="sew-viewer" aria-label="Pattern viewer">
      <div className="sew-viewer-toolbar">
        <button
          type="button"
          className={`sew-viewer-toggle ${focusPieceIdx === null ? 'active' : ''}`}
          onClick={() => setFocusPieceIdx(null)}
        >
          Show all pieces
        </button>
        {pattern.pieces.map((p, idx) => (
          <button
            key={p.name}
            type="button"
            className={`sew-viewer-toggle ${focusPieceIdx === idx ? 'active' : ''}`}
            onClick={() => setFocusPieceIdx(idx)}
          >
            {p.name}
          </button>
        ))}
        <button
          type="button"
          className={`sew-viewer-toggle ${showSeam ? 'active' : ''}`}
          onClick={() => setShowSeam((v) => !v)}
        >
          Seam allowance
        </button>
        <button
          type="button"
          className={`sew-viewer-toggle ${showGrain ? 'active' : ''}`}
          onClick={() => setShowGrain((v) => !v)}
        >
          Grain
        </button>
        <button
          type="button"
          className={`sew-viewer-toggle ${showNotches ? 'active' : ''}`}
          onClick={() => setShowNotches((v) => !v)}
        >
          Notches
        </button>
        <button
          type="button"
          className={`sew-viewer-toggle ${showLabels ? 'active' : ''}`}
          onClick={() => setShowLabels((v) => !v)}
        >
          Labels
        </button>

        <div className="sew-viewer-zoom-group">
          <button type="button" className="sew-viewer-zoom-button" onClick={() => zoomBy(0.87)} aria-label="Zoom out">
            −
          </button>
          <div className="sew-viewer-zoom-readout">{Math.round(view.scale * 100)}%</div>
          <button type="button" className="sew-viewer-zoom-button" onClick={() => zoomBy(1.15)} aria-label="Zoom in">
            +
          </button>
          <button
            type="button"
            className="sew-viewer-zoom-button"
            onClick={fitToScreen}
            aria-label="Fit to screen"
            title="Fit to screen"
          >
            ⤢
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className={`sew-viewer-canvas ${dragging ? 'dragging' : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {pattern.pieces.length === 0 ? (
          <div className="sew-viewer-empty">No pattern pieces to render.</div>
        ) : (
          <div
            className="sew-viewer-svg-wrap"
            style={{
              transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.scale})`,
              transformOrigin: 'center',
            }}
          >
            <svg
              viewBox={viewBox}
              width={widthMm * MM_TO_PX}
              height={heightMm * MM_TO_PX}
              style={{ maxWidth: '95%', maxHeight: '92%' }}
              role="img"
              aria-label={`${pattern.name} pattern pieces`}
            >
              {visiblePieces.map((piece, idx) => (
                <PieceLayer
                  key={`${piece.name}-${idx}`}
                  piece={piece}
                  showSeam={showSeam}
                  showGrain={showGrain}
                  showNotches={showNotches}
                  showLabel={showLabels}
                  offset={idx * 420}
                />
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

function PieceLayer({
  piece,
  showSeam,
  showGrain,
  showNotches,
  showLabel,
  offset,
}: {
  piece: SewingPiece
  showSeam: boolean
  showGrain: boolean
  showNotches: boolean
  showLabel: boolean
  offset: number
}) {
  const pathD = useMemo(() => buildPath(piece.pathPoints), [piece.pathPoints])
  const seamD = useMemo(() => buildPath(insetPath(piece.pathPoints, 15)), [piece.pathPoints])
  const centroid = useMemo(() => polygonCentroid(piece.pathPoints), [piece.pathPoints])

  return (
    <g transform={`translate(${offset}, 0)`}>
      <path className="sew-viewer-piece-outline" d={pathD} />
      {showSeam && <path className="sew-viewer-seam-line" d={seamD} />}
      {piece.onFoldEdge && (
        <FoldHatch from={piece.onFoldEdge.from} to={piece.onFoldEdge.to} />
      )}
      {showGrain && (
        <Grainline from={piece.grainline.from} to={piece.grainline.to} />
      )}
      {showNotches &&
        piece.notchPoints.map((n, i) => (
          <circle key={i} className="sew-viewer-notch" cx={n.x} cy={n.y} r={2.5} />
        ))}
      {showLabel && piece.label && (
        <text
          className="sew-viewer-piece-label"
          x={centroid.x}
          y={centroid.y}
          textAnchor="middle"
        >
          {piece.label}
        </text>
      )}
    </g>
  )
}

function Grainline({
  from,
  to,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
}) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const arrowSize = 8
  const arrow1 = {
    x: to.x - arrowSize * Math.cos(angle - Math.PI / 6),
    y: to.y - arrowSize * Math.sin(angle - Math.PI / 6),
  }
  const arrow2 = {
    x: to.x - arrowSize * Math.cos(angle + Math.PI / 6),
    y: to.y - arrowSize * Math.sin(angle + Math.PI / 6),
  }
  const back1 = {
    x: from.x + arrowSize * Math.cos(angle - Math.PI / 6),
    y: from.y + arrowSize * Math.sin(angle - Math.PI / 6),
  }
  const back2 = {
    x: from.x + arrowSize * Math.cos(angle + Math.PI / 6),
    y: from.y + arrowSize * Math.sin(angle + Math.PI / 6),
  }
  return (
    <g>
      <line
        className="sew-viewer-grainline"
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
      />
      <polygon
        className="sew-viewer-grain-arrow"
        points={`${to.x},${to.y} ${arrow1.x},${arrow1.y} ${arrow2.x},${arrow2.y}`}
      />
      <polygon
        className="sew-viewer-grain-arrow"
        points={`${from.x},${from.y} ${back1.x},${back1.y} ${back2.x},${back2.y}`}
      />
    </g>
  )
}

function FoldHatch({
  from,
  to,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
}) {
  // Render double parallel lines along the fold edge, with hatched ticks
  // between them. Distance between the two parallel lines is 5mm.
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const offset = 5
  const offFrom = { x: from.x + nx * offset, y: from.y + ny * offset }
  const offTo = { x: to.x + nx * offset, y: to.y + ny * offset }
  return (
    <g className="sew-viewer-fold-hatch">
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
      <line x1={offFrom.x} y1={offFrom.y} x2={offTo.x} y2={offTo.y} />
    </g>
  )
}

function buildPath(points: { x: number; y: number }[]): string {
  const first = points[0]
  if (!first) return ''
  const head = `M ${first.x} ${first.y}`
  const tail = points
    .slice(1)
    .map((p) => `L ${p.x} ${p.y}`)
    .join(' ')
  return `${head} ${tail} Z`
}

function insetPath(
  points: { x: number; y: number }[],
  insetMm: number,
): { x: number; y: number }[] {
  // Naive inset: shrink toward the polygon's centroid by inset/diagonal.
  // Good enough for the seam-allowance preview. The real renderer in
  // S-5a will compute polygon offset properly.
  const c = polygonCentroid(points)
  const diag = points.reduce((acc, p) => {
    return Math.max(acc, Math.hypot(p.x - c.x, p.y - c.y))
  }, 1)
  const ratio = (diag - insetMm) / diag
  return points.map((p) => ({
    x: c.x + (p.x - c.x) * ratio,
    y: c.y + (p.y - c.y) * ratio,
  }))
}

function polygonCentroid(points: { x: number; y: number }[]): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 }
  let x = 0
  let y = 0
  for (const p of points) {
    x += p.x
    y += p.y
  }
  return { x: x / points.length, y: y / points.length }
}

function computeBounds(pieces: SewingPiece[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  if (pieces.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  pieces.forEach((piece, idx) => {
    const offset = idx * 420
    for (const p of piece.pathPoints) {
      if (p.x + offset < minX) minX = p.x + offset
      if (p.y < minY) minY = p.y
      if (p.x + offset > maxX) maxX = p.x + offset
      if (p.y > maxY) maxY = p.y
    }
  })
  return { minX, minY, maxX, maxY }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
