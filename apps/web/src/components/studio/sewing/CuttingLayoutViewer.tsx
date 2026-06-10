'use client'

/**
 * CuttingLayoutViewer - renders the planned cutting layout as an SVG.
 * Fabric rectangle as the base; pieces drawn on top with grain arrows
 * and fold-edge hatch.
 *
 * Reads pattern.cuttingLayouts[size]. Filters layouts by chosen fabric
 * width and nap mode. If no layout matches, renders a calm placeholder
 * per the locked image policy.
 */

import { useMemo, useState } from 'react'
import type { SewingPatternData, SewingPiece } from './types'

interface CuttingLayoutViewerProps {
  pattern: SewingPatternData
  selectedSize: string
}

export function CuttingLayoutViewer({
  pattern,
  selectedSize,
}: CuttingLayoutViewerProps) {
  const layouts = useMemo(
    () => pattern.cuttingLayouts[selectedSize] ?? [],
    [pattern.cuttingLayouts, selectedSize],
  )
  const widths = useMemo(() => {
    const set = new Set(layouts.map((l) => l.widthCm))
    return Array.from(set).sort((a, b) => a - b)
  }, [layouts])

  const [width, setWidth] = useState<number>(widths[0] ?? 140)
  const [withNap, setWithNap] = useState(false)

  const layout = useMemo(() => {
    const matches = layouts.filter((l) => l.widthCm === width)
    if (matches.length === 0) return null
    return matches.find((l) => l.withNap === withNap) ?? matches[0]
  }, [layouts, width, withNap])

  return (
    <div className="sew-panel-section">
      <h3 className="sew-panel-heading">Cutting layout</h3>

      {layouts.length === 0 ? (
        <p style={{ color: 'var(--studio-ink-soft)' }}>
          Cutting layout not available for this pattern yet.
        </p>
      ) : (
        <>
          <div className="sew-panel-row">
            <label className="sew-panel-label" htmlFor="layout-width">
              Fabric width
            </label>
            <select
              id="layout-width"
              className="sew-panel-select"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            >
              {widths.map((w) => (
                <option key={w} value={w}>
                  {w} cm
                </option>
              ))}
            </select>
          </div>

          <div className="sew-panel-toggle-row">
            <input
              type="checkbox"
              id="layout-nap"
              checked={withNap}
              onChange={(e) => setWithNap(e.target.checked)}
            />
            <label htmlFor="layout-nap">With nap</label>
          </div>

          {layout ? (
            <>
              <LayoutSvg layout={layout} pieces={pattern.pieces} />
              <div className="sew-layout-readout">
                Total length: {layout.totalLengthCm} cm
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--studio-ink-soft)' }}>
              No cutting layout matches this combination. Try a different fabric
              width.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function LayoutSvg({
  layout,
  pieces,
}: {
  layout: { widthCm: number; totalLengthCm: number; placements: { pieceIndex: number; x: number; y: number; rotation: number; onFold: boolean }[] }
  pieces: SewingPiece[]
}) {
  // SVG units: 1 unit = 1 cm. Fabric runs horizontally; the width is the
  // svg's height and the total length is the svg's width.
  const svgW = layout.totalLengthCm
  const svgH = layout.widthCm

  return (
    <svg
      className="sew-layout-viewer"
      viewBox={`0 0 ${svgW} ${svgH}`}
      preserveAspectRatio="xMinYMin meet"
      width="100%"
      style={{ maxWidth: '100%' }}
      role="img"
      aria-label={`Cutting layout for ${layout.widthCm}cm wide fabric`}
    >
      <rect className="sew-layout-fabric" x={0} y={0} width={svgW} height={svgH} />

      {layout.placements.map((placement, i) => {
        const piece = pieces[placement.pieceIndex]
        if (!piece) return null
        return (
          <g
            key={i}
            transform={`translate(${placement.x}, ${placement.y}) rotate(${placement.rotation}) scale(${0.1})`}
          >
            <path
              className="sew-layout-piece"
              d={buildPath(piece.pathPoints)}
            />
            {piece.onFoldEdge && (
              <line
                className="sew-layout-fold-edge"
                x1={piece.onFoldEdge.from.x}
                y1={piece.onFoldEdge.from.y}
                x2={piece.onFoldEdge.to.x}
                y2={piece.onFoldEdge.to.y}
              />
            )}
            <text
              className="sew-layout-piece-label"
              x={pieceCentre(piece).x}
              y={pieceCentre(piece).y}
              textAnchor="middle"
            >
              {piece.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function buildPath(points: { x: number; y: number }[]): string {
  const first = points[0]
  if (!first) return ''
  const head = `M ${first.x} ${first.y}`
  const tail = points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
  return `${head} ${tail} Z`
}

function pieceCentre(piece: SewingPiece): { x: number; y: number } {
  let x = 0
  let y = 0
  for (const p of piece.pathPoints) {
    x += p.x
    y += p.y
  }
  return { x: x / piece.pathPoints.length, y: y / piece.pathPoints.length }
}
