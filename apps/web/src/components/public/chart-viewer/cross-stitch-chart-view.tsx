'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import type { CrossStitchChart } from '@/lib/chart-renderers/cross-stitch'
import { ChartViewerShell } from './chart-viewer-shell'

interface CrossStitchChartViewProps {
  /** Chart definition pulled from the TipTap node attrs. */
  definition: CrossStitchChart

  /** Tutorial the chart belongs to. Drives the progress key. */
  tutorialId: string

  /** 0-based ordinal of the chart inside the tutorial body. */
  chartIndex: number
}

type ViewMode = 'symbol-on-colour' | 'symbol-only' | 'colour-only'
type DisplayMode = 'all' | 'stitched' | 'remaining'
type PaletteFamily = 'authored' | 'anchor'

interface ProgressState {
  markedCells: Set<string>
  viewMode: ViewMode
  displayMode: DisplayMode
  paletteFamily: PaletteFamily
  /** Magic-markers highlight — when set, every cell of the named palette
   *  key glows. Click a cell to enter; click again or hit Escape to clear. */
  highlightKey: string | null
}

const CELL_PX = 22
const PADDING_TOP = 12
const PADDING_LEFT = 28
const PADDING_RIGHT = 12
const STROKE_LIGHT = '#302a24'

const FALLBACK_SYMBOLS = [
  '×', '●', '▲', '◆', '■', '○', '△', '◇', '□', '✚',
  '✦', '✱', '⬟', '⬢', '✕', '◐', '◑', '◒', '◓', '⬣',
]

export function CrossStitchChartView({
  definition,
  tutorialId,
  chartIndex,
}: CrossStitchChartViewProps) {
  const { width, height, palette, cells } = definition

  const paletteIndex = useMemo(() => {
    const map = new Map<string, { hex: string; symbol: string; name: string; index: number }>()
    palette.forEach((entry, i) => {
      const symbol = entry.symbol ?? FALLBACK_SYMBOLS[i % FALLBACK_SYMBOLS.length] ?? '?'
      map.set(entry.key, { hex: entry.hex, symbol, name: entry.name, index: i })
    })
    return map
  }, [palette])

  const totalCellsByKey = useMemo(() => {
    const counts = new Map<string, number>()
    for (const cell of cells) {
      counts.set(cell.paletteKey, (counts.get(cell.paletteKey) ?? 0) + 1)
    }
    return counts
  }, [cells])

  const totalStitches = cells.length

  const [progress, setProgress] = useState<ProgressState>({
    markedCells: new Set(),
    viewMode: 'symbol-on-colour',
    displayMode: 'all',
    paletteFamily: 'authored',
    highlightKey: null,
  })
  const [loaded, setLoaded] = useState(false)

  // Load persisted progress on first mount.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/me/chart-progress/${tutorialId}/${chartIndex}`)
        if (!res.ok) return
        const data = (await res.json()) as {
          markedCells?: string[]
          viewMode?: string
          displayMode?: string
          paletteOverride?: { family?: string } | null
        }
        if (cancelled) return
        setProgress((p) => ({
          ...p,
          markedCells: new Set(Array.isArray(data.markedCells) ? data.markedCells : []),
          viewMode: validateViewMode(data.viewMode) ?? p.viewMode,
          displayMode: validateDisplayMode(data.displayMode) ?? p.displayMode,
          paletteFamily:
            data.paletteOverride?.family === 'anchor' ? 'anchor' : 'authored',
        }))
      } catch {
        // Silent: an unloaded progress row is equivalent to a fresh chart.
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tutorialId, chartIndex])

  // Sync persisted progress after every state change. Debounced so a quick
  // run of taps coalesces into a single PATCH.
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!loaded) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      void fetch(`/api/me/chart-progress/${tutorialId}/${chartIndex}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          markedCells: Array.from(progress.markedCells),
          viewMode: progress.viewMode,
          displayMode: progress.displayMode,
          paletteOverride:
            progress.paletteFamily === 'anchor' ? { family: 'anchor' } : null,
        }),
      }).catch(() => {
        // Network failure here is non-fatal; the next mutation re-tries.
      })
    }, 400)
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [progress, loaded, tutorialId, chartIndex])

  // Pointer-based mark-stitch. Dragging across cells marks a run; clicking
  // a single cell toggles it. We track whether the gesture started by
  // marking or unmarking (whichever the initial cell becomes) and apply the
  // same operation to every cell the pointer crosses.
  const dragModeRef = useRef<'mark' | 'unmark' | null>(null)
  const lastCellRef = useRef<string | null>(null)

  const cellCoordsFromEvent = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>): { x: number; y: number } | null => {
      const svg = e.currentTarget
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const ctm = svg.getScreenCTM()
      if (!ctm) return null
      const localPt = pt.matrixTransform(ctm.inverse())
      const cellX = Math.floor((localPt.x - PADDING_LEFT) / CELL_PX)
      const cellY = Math.floor((localPt.y - PADDING_TOP) / CELL_PX)
      if (cellX < 0 || cellX >= width || cellY < 0 || cellY >= height) return null
      return { x: cellX, y: cellY }
    },
    [width, height],
  )

  const cellExistsAt = useCallback(
    (x: number, y: number): boolean => {
      // Only let the user mark cells that actually carry a stitch — empty
      // fabric cells are a no-op.
      return cells.some((c) => c.x === x && c.y === y)
    },
    [cells],
  )

  const applyMark = useCallback((key: string, mode: 'mark' | 'unmark') => {
    setProgress((p) => {
      const next = new Set(p.markedCells)
      if (mode === 'mark') next.add(key)
      else next.delete(key)
      return { ...p, markedCells: next }
    })
  }, [])

  const onPointerDownChart = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      // Two-finger pinch is the shell's job — ignore multi-pointer.
      if (e.pointerType === 'touch' && e.isPrimary === false) return
      const coord = cellCoordsFromEvent(e)
      if (!coord) return
      if (!cellExistsAt(coord.x, coord.y)) return
      const key = `${coord.x},${coord.y}`
      const wasMarked = progress.markedCells.has(key)
      const mode = wasMarked ? 'unmark' : 'mark'
      dragModeRef.current = mode
      lastCellRef.current = key
      applyMark(key, mode)
    },
    [cellCoordsFromEvent, cellExistsAt, progress.markedCells, applyMark],
  )

  const onPointerMoveChart = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (!dragModeRef.current) return
      const coord = cellCoordsFromEvent(e)
      if (!coord) return
      const key = `${coord.x},${coord.y}`
      if (key === lastCellRef.current) return
      if (!cellExistsAt(coord.x, coord.y)) return
      lastCellRef.current = key
      applyMark(key, dragModeRef.current)
    },
    [cellCoordsFromEvent, cellExistsAt, applyMark],
  )

  const onPointerUpChart = useCallback(() => {
    dragModeRef.current = null
    lastCellRef.current = null
  }, [])

  // Escape clears the magic-markers highlight.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && progress.highlightKey) {
        setProgress((p) => ({ ...p, highlightKey: null }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [progress.highlightKey])

  const setViewMode = useCallback((mode: ViewMode) => {
    setProgress((p) => ({ ...p, viewMode: mode }))
  }, [])

  const setDisplayMode = useCallback((mode: DisplayMode) => {
    setProgress((p) => ({ ...p, displayMode: mode }))
  }, [])

  const setPaletteFamily = useCallback((family: PaletteFamily) => {
    setProgress((p) => ({ ...p, paletteFamily: family }))
  }, [])

  const toggleHighlight = useCallback((key: string) => {
    setProgress((p) => ({ ...p, highlightKey: p.highlightKey === key ? null : key }))
  }, [])

  const markedCount = progress.markedCells.size
  const percentComplete = totalStitches > 0
    ? Math.round((markedCount / totalStitches) * 100)
    : 0

  // Build the SVG dimensions.
  const gridWidthPx = width * CELL_PX
  const gridHeightPx = height * CELL_PX
  const totalWidth = PADDING_LEFT + gridWidthPx + PADDING_RIGHT
  const totalHeight = PADDING_TOP + gridHeightPx + 16

  const toolbar = (
    <>
      <div className="cross-stitch-toolbar-group" role="group" aria-label="View mode">
        <ToolbarToggle
          active={progress.viewMode === 'symbol-on-colour'}
          onClick={() => setViewMode('symbol-on-colour')}
          label="Colour + symbol"
        />
        <ToolbarToggle
          active={progress.viewMode === 'symbol-only'}
          onClick={() => setViewMode('symbol-only')}
          label="Symbol only"
        />
        <ToolbarToggle
          active={progress.viewMode === 'colour-only'}
          onClick={() => setViewMode('colour-only')}
          label="Colour only"
        />
      </div>
      <div className="cross-stitch-toolbar-group" role="group" aria-label="Display mode">
        <ToolbarToggle
          active={progress.displayMode === 'all'}
          onClick={() => setDisplayMode('all')}
          label="All"
        />
        <ToolbarToggle
          active={progress.displayMode === 'stitched'}
          onClick={() => setDisplayMode('stitched')}
          label="Stitched"
        />
        <ToolbarToggle
          active={progress.displayMode === 'remaining'}
          onClick={() => setDisplayMode('remaining')}
          label="Remaining"
        />
      </div>
      <div className="cross-stitch-toolbar-group" role="group" aria-label="Palette">
        <ToolbarToggle
          active={progress.paletteFamily === 'authored'}
          onClick={() => setPaletteFamily('authored')}
          label="DMC"
        />
        <ToolbarToggle
          active={progress.paletteFamily === 'anchor'}
          onClick={() => setPaletteFamily('anchor')}
          label="Anchor"
        />
      </div>
      <span className="cross-stitch-status">
        {markedCount} / {totalStitches} ({percentComplete}%)
      </span>
    </>
  )

  const legend = (
    <div className="cross-stitch-legend">
      {palette.map((entry, i) => {
        const indexed = paletteIndex.get(entry.key)
        const symbol = indexed?.symbol ?? '?'
        const total = totalCellsByKey.get(entry.key) ?? 0
        const stitchedOfThisColour = countMarkedForKey(progress.markedCells, cells, entry.key)
        const remaining = total - stitchedOfThisColour
        const code = progress.paletteFamily === 'anchor'
          ? entry.anchorCode
            ? `Anchor ${entry.anchorCode}`
            : entry.dmcCode
              ? `DMC ${entry.dmcCode}`
              : ''
          : entry.dmcCode
            ? `DMC ${entry.dmcCode}`
            : entry.anchorCode
              ? `Anchor ${entry.anchorCode}`
              : ''
        const isHighlighted = progress.highlightKey === entry.key
        return (
          <button
            type="button"
            key={entry.key ?? i}
            className="cross-stitch-legend__item"
            aria-pressed={isHighlighted}
            onClick={() => toggleHighlight(entry.key)}
            title={`Click to ${isHighlighted ? 'clear' : 'highlight'} every ${entry.name} cell`}
          >
            <span className="cross-stitch-legend__swatch" style={{ background: entry.hex }} />
            <span className="cross-stitch-legend__symbol">{symbol}</span>
            <span className="cross-stitch-legend__name">
              {entry.name}
              {code ? ` · ${code}` : ''}
            </span>
            <span className="cross-stitch-legend__count">
              {remaining}/{total}
            </span>
          </button>
        )
      })}
    </div>
  )

  return (
    <ChartViewerShell
      toolbar={toolbar}
      legend={legend}
      ariaLabel={definition.title ?? 'Cross-stitch chart'}
      className="chart-viewer-shell--cross-stitch"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        width={totalWidth}
        style={{ maxWidth: '100%', display: 'block' }}
        onPointerDown={onPointerDownChart}
        onPointerMove={onPointerMoveChart}
        onPointerUp={onPointerUpChart}
        onPointerCancel={onPointerUpChart}
        onPointerLeave={onPointerUpChart}
      >
        {/* Grid background */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP}
          width={gridWidthPx}
          height={gridHeightPx}
          fill="var(--chart-bg)"
          stroke="var(--chart-fg)"
          strokeWidth={1.4}
        />
        {/* Coloured cells with overlaid symbol */}
        {cells.map((cell, i) => {
          if (cell.x < 0 || cell.x >= width || cell.y < 0 || cell.y >= height) return null
          const indexed = paletteIndex.get(cell.paletteKey)
          if (!indexed) return null
          const key = `${cell.x},${cell.y}`
          const isMarked = progress.markedCells.has(key)
          const px = PADDING_LEFT + cell.x * CELL_PX
          const py = PADDING_TOP + cell.y * CELL_PX
          const showFill =
            progress.viewMode !== 'symbol-only' &&
            (progress.displayMode !== 'remaining' || !isMarked)
          const showSymbol =
            progress.viewMode !== 'colour-only' &&
            (progress.displayMode !== 'remaining' || !isMarked)
          if (progress.displayMode === 'stitched' && !isMarked) return null
          const isHighlighted = progress.highlightKey === cell.paletteKey
          return (
            <g key={i} className="cross-stitch-cell">
              {showFill ? (
                <rect
                  x={px}
                  y={py}
                  width={CELL_PX}
                  height={CELL_PX}
                  fill={indexed.hex}
                  stroke="none"
                />
              ) : (
                <rect
                  x={px}
                  y={py}
                  width={CELL_PX}
                  height={CELL_PX}
                  fill="var(--chart-bg)"
                  stroke="none"
                />
              )}
              {showSymbol ? (
                <text
                  x={px + CELL_PX / 2}
                  y={py + CELL_PX / 2}
                  fontSize={CELL_PX * 0.62}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={
                    progress.viewMode === 'symbol-only'
                      ? 'var(--chart-fg)'
                      : textOnFill(indexed.hex)
                  }
                  pointerEvents="none"
                >
                  {indexed.symbol}
                </text>
              ) : null}
              {isHighlighted ? (
                <rect
                  x={px}
                  y={py}
                  width={CELL_PX}
                  height={CELL_PX}
                  fill="var(--chart-search-overlay)"
                  pointerEvents="none"
                />
              ) : null}
              {isMarked && progress.displayMode !== 'stitched' ? (
                <rect
                  x={px + 1}
                  y={py + 1}
                  width={CELL_PX - 2}
                  height={CELL_PX - 2}
                  fill="var(--chart-marked-overlay)"
                  stroke="var(--chart-fg)"
                  strokeWidth={0.6}
                  pointerEvents="none"
                />
              ) : null}
            </g>
          )
        })}
        {/* Grid lines */}
        <g stroke="var(--chart-fg)" fill="none">
          {Array.from({ length: width + 1 }).map((_, c) => {
            const x = PADDING_LEFT + c * CELL_PX
            const weight =
              c === 0 || c === width ? 1.4 : c % 25 === 0 ? 1.2 : c % 10 === 0 ? 0.85 : 0.35
            return (
              <line
                key={`v${c}`}
                x1={x}
                y1={PADDING_TOP}
                x2={x}
                y2={PADDING_TOP + gridHeightPx}
                strokeWidth={weight}
              />
            )
          })}
          {Array.from({ length: height + 1 }).map((_, r) => {
            const y = PADDING_TOP + r * CELL_PX
            const weight =
              r === 0 || r === height ? 1.4 : r % 25 === 0 ? 1.2 : r % 10 === 0 ? 0.85 : 0.35
            return (
              <line
                key={`h${r}`}
                x1={PADDING_LEFT}
                y1={y}
                x2={PADDING_LEFT + gridWidthPx}
                y2={y}
                strokeWidth={weight}
              />
            )
          })}
        </g>
        {/* Ruler labels every 10 stitches */}
        <g fontSize={9} fill="var(--chart-fg)" fillOpacity={0.7}>
          {Array.from({ length: Math.floor((width - 1) / 10) }).map((_, i) => {
            const c = (i + 1) * 10
            const x = PADDING_LEFT + c * CELL_PX
            return (
              <text key={`cx${c}`} x={x} y={PADDING_TOP - 4} textAnchor="middle">
                {c}
              </text>
            )
          })}
          {Array.from({ length: Math.floor((height - 1) / 10) }).map((_, i) => {
            const r = (i + 1) * 10
            const y = PADDING_TOP + r * CELL_PX
            return (
              <text key={`ry${r}`} x={PADDING_LEFT - 4} y={y + 3} textAnchor="end">
                {r}
              </text>
            )
          })}
        </g>
      </svg>
    </ChartViewerShell>
  )
}

function ToolbarToggle({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      className="chart-viewer-shell__button"
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function countMarkedForKey(
  marked: Set<string>,
  cells: { x: number; y: number; paletteKey: string }[],
  paletteKey: string,
): number {
  let count = 0
  for (const cell of cells) {
    if (cell.paletteKey !== paletteKey) continue
    if (marked.has(`${cell.x},${cell.y}`)) count++
  }
  return count
}

function textOnFill(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return STROKE_LIGHT
  const v = m[1]
  if (!v) return STROKE_LIGHT
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.58 ? STROKE_LIGHT : '#ffffff'
}

function validateViewMode(value: unknown): ViewMode | null {
  if (value === 'symbol-on-colour' || value === 'symbol-only' || value === 'colour-only') {
    return value
  }
  return null
}

function validateDisplayMode(value: unknown): DisplayMode | null {
  if (value === 'all' || value === 'stitched' || value === 'remaining') return value
  return null
}
