'use client'

/**
 * ProjectorView - full-screen, high-contrast pattern render for fabric
 * projectors. No page boundaries; pieces drawn at 1:1 scale (1 unit =
 * 1mm) with thick white strokes on a black background.
 *
 * Calibration grid: 100mm × 100mm divisions, faint white. The user
 * sets their projector throw distance to match the on-screen grid to a
 * physical ruler, then projects the pattern onto the fabric and traces.
 *
 * Calibration path #3 from the locked sewing decisions.
 */

import { useEffect, useState } from 'react'
import type { SewingPatternData, SewingPiece } from '../types'

interface ProjectorViewProps {
  pattern: SewingPatternData
  selectedSize: string
  onExit: () => void
}

export function ProjectorView({ pattern, onExit }: ProjectorViewProps) {
  const [showGrid, setShowGrid] = useState(true)
  const [activePieceIdx, setActivePieceIdx] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit()
      else if (e.key === 'ArrowRight') {
        setActivePieceIdx((i) => Math.min(i + 1, pattern.pieces.length - 1))
      } else if (e.key === 'ArrowLeft') {
        setActivePieceIdx((i) => Math.max(i - 1, 0))
      } else if (e.key === 'g') {
        setShowGrid((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit, pattern.pieces.length])

  const piece = pattern.pieces[activePieceIdx]
  const bounds = piece ? bboxFor(piece) : { width: 600, height: 600 }
  // Add 50mm padding around the piece.
  const padding = 50
  const viewBox = `${-padding} ${-padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`

  return (
    <div className="sew-projector" role="region" aria-label="Projector view">
      <div className="sew-projector-toolbar">
        <button type="button" onClick={onExit} aria-label="Exit projector view">
          Exit
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>
          {piece?.name ?? 'No pieces to project'} - piece {activePieceIdx + 1} of{' '}
          {pattern.pieces.length}
        </div>
        <button
          type="button"
          onClick={() => setActivePieceIdx((i) => Math.max(i - 1, 0))}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() =>
            setActivePieceIdx((i) => Math.min(i + 1, pattern.pieces.length - 1))
          }
        >
          Next
        </button>
        <button type="button" onClick={() => setShowGrid((v) => !v)}>
          {showGrid ? 'Hide grid' : 'Show grid'}
        </button>
      </div>
      <div className="sew-projector-canvas">
        {piece ? (
          <svg
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="img"
            aria-label={`${piece.name} at 1:1 scale`}
          >
            {showGrid && (
              <g className="sew-projector-grid">
                {gridLines(bounds.width + padding * 2, bounds.height + padding * 2, padding)}
              </g>
            )}
            <path
              className="sew-projector-piece-outline"
              d={buildPath(piece.pathPoints)}
              transform={`translate(${-bboxMinX(piece)}, ${-bboxMinY(piece)})`}
            />
            {piece.onFoldEdge && (
              <line
                className="sew-projector-fold-edge"
                x1={piece.onFoldEdge.from.x - bboxMinX(piece)}
                y1={piece.onFoldEdge.from.y - bboxMinY(piece)}
                x2={piece.onFoldEdge.to.x - bboxMinX(piece)}
                y2={piece.onFoldEdge.to.y - bboxMinY(piece)}
              />
            )}
            <line
              className="sew-projector-grain-line"
              x1={piece.grainline.from.x - bboxMinX(piece)}
              y1={piece.grainline.from.y - bboxMinY(piece)}
              x2={piece.grainline.to.x - bboxMinX(piece)}
              y2={piece.grainline.to.y - bboxMinY(piece)}
            />
            <text
              className="sew-projector-label"
              x={(bounds.width) / 2}
              y={bounds.height + 30}
              textAnchor="middle"
            >
              {piece.label ?? piece.name} (1:1 scale, grid = 100mm)
            </text>
          </svg>
        ) : (
          <div style={{ color: '#fff' }}>No pattern pieces to project.</div>
        )}
      </div>
    </div>
  )
}

function bboxFor(piece: SewingPiece): { width: number; height: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of piece.pathPoints) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { width: maxX - minX, height: maxY - minY }
}

function bboxMinX(piece: SewingPiece): number {
  let min = Infinity
  for (const p of piece.pathPoints) if (p.x < min) min = p.x
  return min
}

function bboxMinY(piece: SewingPiece): number {
  let min = Infinity
  for (const p of piece.pathPoints) if (p.y < min) min = p.y
  return min
}

function buildPath(points: { x: number; y: number }[]): string {
  const first = points[0]
  if (!first) return ''
  const head = `M ${first.x} ${first.y}`
  const tail = points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
  return `${head} ${tail} Z`
}

function gridLines(width: number, height: number, padding: number) {
  const step = 100 // 100mm grid
  const lines: React.ReactElement[] = []
  for (let x = -padding; x <= width - padding; x += step) {
    lines.push(<line key={`v-${x}`} x1={x} y1={-padding} x2={x} y2={height - padding} />)
  }
  for (let y = -padding; y <= height - padding; y += step) {
    lines.push(<line key={`h-${y}`} x1={-padding} y1={y} x2={width - padding} y2={y} />)
  }
  return lines
}
