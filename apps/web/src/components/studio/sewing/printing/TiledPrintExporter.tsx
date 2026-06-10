'use client'

/**
 * TiledPrintExporter - client-side PDF builder for tiled sewing prints.
 *
 * Runs in the browser: it calls into the pure `buildSewingPatternPdf`
 * helper (pdf-lib) to assemble a Uint8Array, wraps it in a Blob, and
 * hands the user a download link. No server round-trip.
 *
 * Paper sizes wired in S-1: A4 + Letter. The page-tiles module already
 * carries A3 + Legal but those are gated behind S-5c per the lock.
 *
 * Calibration path #1 from the locked sewing decisions.
 */

import { useCallback, useMemo, useState } from 'react'
import type { SewingPatternData } from '../types'
import {
  buildTileMap,
  PAPER,
  type PaperSize,
} from '@/lib/sewing/printing/page-tiles'
import { parseFreesewingSvg } from '@/lib/sewing/grading/svg-to-polylines'

interface TiledPrintExporterProps {
  pattern: SewingPatternData
}

type PaperChoice = 'A4' | 'LETTER' | 'A3' | 'LEGAL' | 'A0'

export function TiledPrintExporter({ pattern }: TiledPrintExporterProps) {
  const [paper, setPaper] = useState<PaperChoice>('A4')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tileMap = useMemo(() => {
    const bounds = computeBounds(pattern)
    return buildTileMap({ bounds, paper })
  }, [pattern, paper])

  const onGenerate = useCallback(async () => {
    setError(null)
    setGenerating(true)
    try {
      const { buildSewingPatternPdf } = await import('@/lib/sewing/printing/build-pdf')
      const bytes = await buildSewingPatternPdf({ pattern, paper })
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pattern.slug}-${paper.toLowerCase()}-tiled.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the PDF.')
    } finally {
      setGenerating(false)
    }
  }, [pattern, paper])

  return (
    <div className="sew-tiled-print">
      <div className="sew-tiled-print-controls">
        <label htmlFor="paper-size" className="sew-panel-label">
          Paper size
        </label>
        <select
          id="paper-size"
          className="sew-panel-select"
          value={paper}
          onChange={(e) => setPaper(e.target.value as PaperChoice)}
        >
          <option value="A4">A4 (210 × 297 mm)</option>
          <option value="LETTER">Letter (216 × 279 mm)</option>
          <option value="A3">A3 (297 × 420 mm)</option>
          <option value="LEGAL">Legal (216 × 356 mm)</option>
          <option value="A0">A0 single-sheet (841 × 1189 mm)</option>
        </select>
        <button
          type="button"
          className="sew-tiled-print-action"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? 'Building PDF…' : 'Download tiled PDF'}
        </button>
      </div>

      <div className="sew-tiled-print-warning">
        Print at 100% scale. Do not select &ldquo;Fit to page&rdquo;. Page 1
        carries a 5 cm × 5 cm test square so you can check your printer.
      </div>

      <div className="sew-tiled-print-preview">
        <div className="sew-tiled-print-meta">
          <strong>{pattern.name}</strong> - {tileMap.tiles.length} pages,{' '}
          {tileMap.cols} across × {tileMap.rows} down, on {paperDisplay(paper)}.
        </div>
        <PreviewGrid tileMap={tileMap} />
      </div>

      {error && (
        <div
          className="sew-tiled-print-warning"
          style={{ background: 'rgba(168, 91, 58, 0.15)' }}
        >
          {error}
        </div>
      )}
    </div>
  )
}

function PreviewGrid({ tileMap }: { tileMap: ReturnType<typeof buildTileMap> }) {
  const cell = 32
  return (
    <svg
      width={tileMap.cols * cell + 20}
      height={tileMap.rows * cell + 20}
      viewBox={`0 0 ${tileMap.cols * cell + 20} ${tileMap.rows * cell + 20}`}
    >
      {tileMap.tiles.map((tile) => (
        <g key={tile.pageNumber}>
          <rect
            x={10 + (tile.col - 1) * cell}
            y={10 + (tile.row - 1) * cell}
            width={cell}
            height={cell}
            fill="#fdfaf3"
            stroke="#a85b3a"
            strokeWidth={0.6}
          />
          <text
            x={10 + (tile.col - 1) * cell + cell / 2}
            y={10 + (tile.row - 1) * cell + cell / 2 + 4}
            textAnchor="middle"
            fontSize={11}
            fill="#463126"
            fontFamily="monospace"
          >
            {tile.pageNumber}
          </text>
        </g>
      ))}
    </svg>
  )
}

function paperDisplay(paper: PaperSize): string {
  const dims = PAPER[paper]
  return `${paper} (${dims.widthMm} × ${dims.heightMm} mm)`
}

function computeBounds(pattern: SewingPatternData): {
  minX: number
  minY: number
  widthMm: number
  heightMm: number
} {
  if (
    pattern.isFreesewingDesign &&
    typeof pattern.freesewingShowcaseSvg === 'string' &&
    pattern.freesewingShowcaseSvg.length > 0
  ) {
    const parsed = parseFreesewingSvg(pattern.freesewingShowcaseSvg)
    if (parsed.parts.length > 0 && parsed.widthMm > 0) {
      return {
        minX: parsed.bounds.minX,
        minY: parsed.bounds.minY,
        widthMm: parsed.widthMm,
        heightMm: parsed.heightMm,
      }
    }
  }
  if (pattern.pieces.length === 0) return { minX: 0, minY: 0, widthMm: 200, heightMm: 200 }
  let cursorX = 0
  let maxY = 0
  let maxX = 0
  for (const piece of pattern.pieces) {
    const w = pieceBboxWidth(piece)
    const h = pieceBboxHeight(piece)
    if (cursorX + w > maxX) maxX = cursorX + w
    if (h > maxY) maxY = h
    cursorX += w + 40
  }
  return { minX: 0, minY: 0, widthMm: maxX, heightMm: maxY }
}

function pieceBboxWidth(piece: { pathPoints: { x: number; y: number }[] }): number {
  let min = Infinity
  let max = -Infinity
  for (const p of piece.pathPoints) {
    if (p.x < min) min = p.x
    if (p.x > max) max = p.x
  }
  return max - min
}

function pieceBboxHeight(piece: { pathPoints: { x: number; y: number }[] }): number {
  let min = Infinity
  let max = -Infinity
  for (const p of piece.pathPoints) {
    if (p.y < min) min = p.y
    if (p.y > max) max = p.y
  }
  return max - min
}
