'use client'

/**
 * ChartViewport — the canvas at the heart of every chart-based Studio.
 *
 * Renders a Pattern as an interactive SVG. View-mode supports pan / zoom
 * / mark-stitched / isolate-colour / centre-crosshairs. Edit-mode adds
 * paint / erase / select / back-stitch / French knots / undo / redo
 * via the chart store's command pattern.
 *
 * Rendering strategy: one <g> per colour (batched cell crosses), one <g>
 * for back-stitch, one for French knots, one for stitched-overlay, one
 * for grid + crosshairs, one for symbols. At low zoom the cell crosses
 * collapse to filled rects so a 100×140 pattern still pans at 60fps.
 *
 * The viewport itself stays mostly neutral — fabric warmth, faint grid,
 * the stitches read as the hero. The chrome (palette + floss-key) lives
 * outside this component in overlay drawers, Figma-style.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { cellKey, type PatternData } from '@homemade/db/pattern'
import { useChartStore, type ChartMode } from './chart-store'
import {
  buildBucketCrossPath,
  buildBucketHighlightPath,
  buildPaletteIndex,
  DEFAULT_CELL_PX,
  groupCellsBySymbol,
  LOW_ZOOM_THRESHOLD,
  RENDER_PRECISION,
  screenToCell,
  shiftColour,
  symbolOnFill,
} from './render-helpers'

interface ChartViewportProps {
  pattern: PatternData
  mode: ChartMode
  /** Mark-stitched cells if persisted externally; defaults to store state. */
  initialStitched?: Set<string>
  /** Called when the user opens the floss-key isolate (right-click cell → isolate). */
  onRequestIsolate?: (symbol: string) => void
  /** Called when an editor wants the colour-picker tool to set a colour from a cell. */
  onPickColour?: (symbol: string) => void
}

export function ChartViewport({
  pattern,
  mode,
  initialStitched,
  onRequestIsolate,
  onPickColour,
}: ChartViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [spacePanning, setSpacePanning] = useState(false)

  // Zustand actions are stable refs across state changes, but
  // `useChartStore()` (no selector) returns a fresh state-object on every
  // tick — putting that whole object into effect dep arrays produces an
  // infinite-loop on the first setMode call. Use selectors for actions
  // (stable) and for the small set of state values the component
  // actually renders against; pointer / keyboard handlers read latest
  // state imperatively via `useChartStore.getState()` so they neither
  // resubscribe nor stale-close.
  const setPattern = useChartStore((s) => s.setPattern)
  const setMode = useChartStore((s) => s.setMode)
  const setContainerSize = useChartStore((s) => s.setContainerSize)
  const setStitchedCells = useChartStore((s) => s.setStitchedCells)
  const fitViewportToScreen = useChartStore((s) => s.fitViewportToScreen)
  const applyPan = useChartStore((s) => s.applyPan)
  const applyZoom = useChartStore((s) => s.applyZoom)
  const paintCell = useChartStore((s) => s.paintCell)
  const eraseCell = useChartStore((s) => s.eraseCell)
  const toggleStitched = useChartStore((s) => s.toggleStitched)
  const markStitchedBatch = useChartStore((s) => s.markStitchedBatch)
  const setSelection = useChartStore((s) => s.setSelection)
  const setCurrentSymbol = useChartStore((s) => s.setCurrentSymbol)
  const setTool = useChartStore((s) => s.setTool)
  const setIsolate = useChartStore((s) => s.setIsolate)
  const undo = useChartStore((s) => s.undo)
  const redo = useChartStore((s) => s.redo)

  // Render-affecting state slices.
  const viewport = useChartStore((s) => s.viewport)
  const isolate = useChartStore((s) => s.isolateSymbol)
  const stitchedSet = useChartStore((s) => s.stitchedCells)
  const displayMode = useChartStore((s) => s.displayMode)
  const layers = useChartStore((s) => s.layers)
  const selection = useChartStore((s) => s.selection)
  const tool = useChartStore((s) => s.tool)

  // ───── one-time pattern install + container measure
  useEffect(() => {
    setPattern(pattern)
    if (initialStitched) setStitchedCells(initialStitched)
  }, [pattern, initialStitched, setPattern, setStitchedCells])

  useEffect(() => {
    setMode(mode)
  }, [mode, setMode])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setContainerSize(width, height)
    })
    observer.observe(el)
    const r = el.getBoundingClientRect()
    setContainerSize(r.width, r.height)
    return () => observer.disconnect()
  }, [setContainerSize])

  // ───── keyboard: space-bar pan, undo/redo, tool shortcuts.
  // Reads latest state imperatively (getState()) so we don't reattach
  // the listener on every store tick.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.code === 'Space') {
        e.preventDefault()
        setSpacePanning(true)
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }
      if (e.key === 'b' && !e.metaKey && !e.ctrlKey) setTool('brush')
      else if (e.key === 'e' && !e.metaKey && !e.ctrlKey) setTool('erase')
      else if (e.key === 'm' && !e.metaKey && !e.ctrlKey) setTool('mark-stitched')
      else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) setTool('colour-picker')
      else if (e.key === 'v' && !e.metaKey && !e.ctrlKey) setTool('select')
      else if (e.key === 'i' && !e.metaKey && !e.ctrlKey) {
        const s = useChartStore.getState()
        const c = s.currentSymbol
        if (c) setIsolate(s.isolateSymbol === c ? null : c)
      } else if (e.key === '+' || e.key === '=') {
        const s = useChartStore.getState()
        applyZoom(1.2, s.containerWidth / 2, s.containerHeight / 2)
      } else if (e.key === '-' || e.key === '_') {
        const s = useChartStore.getState()
        applyZoom(1 / 1.2, s.containerWidth / 2, s.containerHeight / 2)
      } else if (e.key === '0') {
        fitViewportToScreen()
      } else if (e.key === 'Escape') {
        setSelection(null)
        setIsolate(null)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacePanning(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [applyZoom, fitViewportToScreen, undo, redo, setTool, setIsolate, setSelection])

  // ───── pointer interaction (pan / paint / mark)
  const dragRef = useRef<
    | null
    | {
        mode: 'pan' | 'paint' | 'erase' | 'mark' | 'select'
        lastX: number
        lastY: number
        touched: Set<string>
        markValue?: boolean
        startCellX?: number
        startCellY?: number
      }
  >(null)

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (e.button !== 0 && e.button !== 1) return
      svgRef.current?.setPointerCapture(e.pointerId)
      const rect = svgRef.current!.getBoundingClientRect()
      const lx = e.clientX - rect.left
      const ly = e.clientY - rect.top
      if (spacePanning || e.button === 1) {
        dragRef.current = { mode: 'pan', lastX: lx, lastY: ly, touched: new Set() }
        return
      }
      const s = useChartStore.getState()
      const cell = screenToCell(lx, ly, s.viewport)
      if (cell.x < 0 || cell.y < 0 || cell.x >= pattern.grid.width || cell.y >= pattern.grid.height) {
        dragRef.current = { mode: 'pan', lastX: lx, lastY: ly, touched: new Set() }
        return
      }
      if (mode === 'view' || s.tool === 'mark-stitched') {
        const k = cellKey(cell.x, cell.y)
        const currently = s.stitchedCells.has(k)
        toggleStitched(cell.x, cell.y)
        dragRef.current = {
          mode: 'mark',
          lastX: lx,
          lastY: ly,
          touched: new Set([k]),
          markValue: !currently,
        }
        return
      }
      if (s.tool === 'brush' && s.currentSymbol) {
        paintCell(cell.x, cell.y, s.currentSymbol)
        dragRef.current = {
          mode: 'paint',
          lastX: lx,
          lastY: ly,
          touched: new Set([cellKey(cell.x, cell.y)]),
        }
        return
      }
      if (s.tool === 'erase') {
        eraseCell(cell.x, cell.y)
        dragRef.current = {
          mode: 'erase',
          lastX: lx,
          lastY: ly,
          touched: new Set([cellKey(cell.x, cell.y)]),
        }
        return
      }
      if (s.tool === 'colour-picker') {
        const hit = pattern.grid.cells.find((c) => c.x === cell.x && c.y === cell.y)
        if (hit) {
          setCurrentSymbol(hit.s)
          onPickColour?.(hit.s)
        }
        return
      }
      if (s.tool === 'select') {
        dragRef.current = {
          mode: 'select',
          lastX: lx,
          lastY: ly,
          touched: new Set(),
          startCellX: cell.x,
          startCellY: cell.y,
        }
        setSelection({ x1: cell.x, y1: cell.y, x2: cell.x, y2: cell.y })
        return
      }
      dragRef.current = { mode: 'pan', lastX: lx, lastY: ly, touched: new Set() }
    },
    [spacePanning, mode, pattern, paintCell, eraseCell, toggleStitched, setSelection, setCurrentSymbol, onPickColour],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current
      if (!drag) return
      const rect = svgRef.current!.getBoundingClientRect()
      const lx = e.clientX - rect.left
      const ly = e.clientY - rect.top
      const dx = lx - drag.lastX
      const dy = ly - drag.lastY
      drag.lastX = lx
      drag.lastY = ly
      if (drag.mode === 'pan') {
        applyPan(dx, dy)
        return
      }
      const s = useChartStore.getState()
      const cell = screenToCell(lx, ly, s.viewport)
      if (cell.x < 0 || cell.y < 0 || cell.x >= pattern.grid.width || cell.y >= pattern.grid.height) return
      const k = cellKey(cell.x, cell.y)
      if (drag.mode === 'paint' && s.currentSymbol && !drag.touched.has(k)) {
        drag.touched.add(k)
        paintCell(cell.x, cell.y, s.currentSymbol)
        return
      }
      if (drag.mode === 'erase' && !drag.touched.has(k)) {
        drag.touched.add(k)
        eraseCell(cell.x, cell.y)
        return
      }
      if (drag.mode === 'mark' && !drag.touched.has(k)) {
        drag.touched.add(k)
        markStitchedBatch([{ x: cell.x, y: cell.y }], drag.markValue ?? true)
        return
      }
      if (drag.mode === 'select' && drag.startCellX !== undefined && drag.startCellY !== undefined) {
        setSelection({
          x1: Math.min(drag.startCellX, cell.x),
          y1: Math.min(drag.startCellY, cell.y),
          x2: Math.max(drag.startCellX, cell.x),
          y2: Math.max(drag.startCellY, cell.y),
        })
      }
    },
    [pattern, paintCell, eraseCell, markStitchedBatch, applyPan, setSelection],
  )

  const onPointerUp = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    svgRef.current?.releasePointerCapture(e.pointerId)
    dragRef.current = null
  }, [])

  const onWheel = useCallback(
    (e: ReactWheelEvent<SVGSVGElement>) => {
      e.preventDefault()
      const rect = svgRef.current!.getBoundingClientRect()
      const ax = e.clientX - rect.left
      const ay = e.clientY - rect.top
      const delta = e.deltaY < 0 ? 1.08 : 1 / 1.08
      applyZoom(delta, ax, ay)
    },
    [applyZoom],
  )

  // ───── rendering — buckets cached on pattern changes
  const paletteIndex = useMemo(() => buildPaletteIndex(pattern), [pattern])
  const cellBuckets = useMemo(() => groupCellsBySymbol(pattern), [pattern])
  const cellPx = DEFAULT_CELL_PX
  const scaledCellPx = cellPx * viewport.scale
  const useLowZoom = scaledCellPx < LOW_ZOOM_THRESHOLD

  const showStitchedOverlay = displayMode !== 'all' || stitchedSet.size > 0

  const renderedBuckets = useMemo(() => {
    const buckets: Array<{ symbol: string; rgb: string; cross: string; highlight: string; cellList: { x: number; y: number }[] }> = []
    for (const [symbol, cells] of cellBuckets) {
      if (cells.length === 0) continue
      if (isolate && symbol !== isolate) continue
      const entry = paletteIndex.bySymbol.get(symbol)
      if (!entry) continue
      const filtered = filterByDisplayMode(cells, stitchedSet, displayMode)
      if (filtered.length === 0) continue
      buckets.push({
        symbol,
        rgb: entry.rgb,
        cross: useLowZoom ? '' : buildBucketCrossPath(filtered, cellPx),
        highlight: useLowZoom ? '' : buildBucketHighlightPath(filtered, cellPx),
        cellList: filtered,
      })
    }
    return buckets
  }, [cellBuckets, paletteIndex, isolate, stitchedSet, displayMode, useLowZoom, cellPx])

  // Render the centre crosshairs as a + that crosses the whole grid.
  const gridW = pattern.grid.width
  const gridH = pattern.grid.height
  const totalW = gridW * cellPx
  const totalH = gridH * cellPx

  // The viewport transform applied to the world-space content.
  const transform = `translate(${viewport.panX} ${viewport.panY}) scale(${viewport.scale})`

  const cursorStyle = (() => {
    if (spacePanning) return 'grab'
    if (mode === 'view' || tool === 'mark-stitched') return 'pointer'
    if (tool === 'brush' || tool === 'erase' || tool === 'select') return 'crosshair'
    if (tool === 'colour-picker') return 'copy'
    return 'default'
  })()

  return (
    <div ref={containerRef} className="chart-viewport-container">
      <svg
        ref={svgRef}
        className="chart-viewport-svg"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onContextMenu={(e) => {
          e.preventDefault()
          const rect = svgRef.current!.getBoundingClientRect()
          const cell = screenToCell(e.clientX - rect.left, e.clientY - rect.top, viewport)
          if (cell.x < 0 || cell.y < 0 || cell.x >= gridW || cell.y >= gridH) return
          const hit = pattern.grid.cells.find((c) => c.x === cell.x && c.y === cell.y)
          if (hit && onRequestIsolate) onRequestIsolate(hit.s)
        }}
        style={{ cursor: cursorStyle }}
      >
        <defs>
          <pattern id="fabric-weave" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill={pattern.fabric.colourRgb} />
            <path d="M0 4 L8 4 M4 0 L4 8" stroke={shiftColour(pattern.fabric.colourRgb, -0.04)} strokeWidth="0.3" />
          </pattern>
          {/* Soft cross-hatch for stitched cells — fabric tone two steps
              darker, fine diagonal lines, scales with cell size via the
              parent g's transform. Reads "completed" without flat-greying
              the stitch underneath. */}
          <pattern
            id="stitched-hatch"
            x="0"
            y="0"
            width={cellPx}
            height={cellPx}
            patternUnits="userSpaceOnUse"
          >
            <rect width={cellPx} height={cellPx} fill={pattern.fabric.colourRgb} opacity={0.55} />
            <path
              d={`M0 ${cellPx} L${cellPx} 0`}
              stroke={shiftColour(pattern.fabric.colourRgb, -0.18)}
              strokeWidth={Math.max(0.6, cellPx * 0.04)}
              opacity={0.55}
            />
          </pattern>
        </defs>

        <g transform={transform}>
          {/* Fabric — the soft weave behind everything. */}
          <rect x={0} y={0} width={totalW} height={totalH} fill={pattern.fabric.colourRgb} />
          {scaledCellPx >= 18 && (
            <rect x={0} y={0} width={totalW} height={totalH} fill="url(#fabric-weave)" opacity={0.6} />
          )}

          {/* Stitches — one <g> per colour. Low-zoom collapses to filled rects. */}
          {layers.colours &&
            renderedBuckets.map(({ symbol, rgb, cross, highlight, cellList }) => (
              <g key={`bucket-${symbol}`} className="chart-bucket">
                {useLowZoom
                  ? cellList.map(({ x, y }) => (
                      <rect
                        key={`r-${x}-${y}`}
                        x={x * cellPx}
                        y={y * cellPx}
                        width={cellPx}
                        height={cellPx}
                        fill={rgb}
                      />
                    ))
                  : (
                      <>
                        <path
                          d={cross}
                          stroke={shiftColour(rgb, -0.18)}
                          strokeWidth={cellPx * 0.22}
                          strokeLinecap="round"
                          fill="none"
                          opacity={0.85}
                        />
                        <path
                          d={cross}
                          stroke={rgb}
                          strokeWidth={cellPx * 0.16}
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d={highlight}
                          stroke={shiftColour(rgb, 0.32)}
                          strokeWidth={cellPx * 0.06}
                          strokeLinecap="round"
                          fill="none"
                          opacity={0.55}
                        />
                      </>
                    )}
              </g>
            ))}

          {/* Back-stitch — drawn over the cells. */}
          {layers.backstitch && pattern.grid.backstitch.length > 0 && (
            <g className="chart-backstitch">
              {pattern.grid.backstitch.map((seg, i) => {
                if (isolate && seg.s !== isolate) return null
                const entry = paletteIndex.bySymbol.get(seg.s)
                if (!entry) return null
                return (
                  <line
                    key={`bs-${i}`}
                    x1={(seg.x1 * cellPx).toFixed(RENDER_PRECISION)}
                    y1={(seg.y1 * cellPx).toFixed(RENDER_PRECISION)}
                    x2={(seg.x2 * cellPx).toFixed(RENDER_PRECISION)}
                    y2={(seg.y2 * cellPx).toFixed(RENDER_PRECISION)}
                    stroke={shiftColour(entry.rgb, -0.22)}
                    strokeWidth={Math.max(1.2, cellPx * 0.08)}
                    strokeLinecap="round"
                  />
                )
              })}
            </g>
          )}

          {/* French knots — small filled discs with a highlight dot. */}
          {layers.frenchKnots && pattern.grid.frenchKnots.length > 0 && (
            <g className="chart-french-knots">
              {pattern.grid.frenchKnots.map((k, i) => {
                if (isolate && k.s !== isolate) return null
                const entry = paletteIndex.bySymbol.get(k.s)
                if (!entry) return null
                const cx = k.x * cellPx + cellPx / 2
                const cy = k.y * cellPx + cellPx / 2
                const r = cellPx * 0.26
                return (
                  <g key={`fk-${i}`}>
                    <circle cx={cx} cy={cy} r={r} fill={shiftColour(entry.rgb, -0.18)} />
                    <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill={shiftColour(entry.rgb, 0.4)} />
                  </g>
                )
              })}
            </g>
          )}

          {/* Stitched-overlay — soft cross-hatch lays over the X stitch
              so a finished cell reads "done" without erasing the colour
              underneath. */}
          {showStitchedOverlay &&
            Array.from(stitchedSet).map((k) => {
              const [xs, ys] = k.split(',')
              const x = Number(xs)
              const y = Number(ys)
              if (!Number.isInteger(x) || !Number.isInteger(y)) return null
              return (
                <rect
                  key={`st-${k}`}
                  x={x * cellPx}
                  y={y * cellPx}
                  width={cellPx}
                  height={cellPx}
                  fill="url(#stitched-hatch)"
                />
              )
            })}

          {/* Grid — faint at low zoom, sharper around the 10-cell rules. */}
          {layers.grid && scaledCellPx >= 4 && (
            <g className="chart-grid" stroke="#3d2f22" fill="none" pointerEvents="none">
              {Array.from({ length: gridW + 1 }, (_, c) => {
                const isEdge = c === 0 || c === gridW
                const isMajor = c % 10 === 0
                const w = isEdge ? 1.4 : isMajor ? 0.9 : 0.3
                const o = isEdge ? 0.9 : isMajor ? 0.55 : 0.18
                return (
                  <line
                    key={`gx-${c}`}
                    x1={c * cellPx}
                    y1={0}
                    x2={c * cellPx}
                    y2={totalH}
                    strokeWidth={w / viewport.scale}
                    opacity={o}
                  />
                )
              })}
              {Array.from({ length: gridH + 1 }, (_, r) => {
                const isEdge = r === 0 || r === gridH
                const isMajor = r % 10 === 0
                const w = isEdge ? 1.4 : isMajor ? 0.9 : 0.3
                const o = isEdge ? 0.9 : isMajor ? 0.55 : 0.18
                return (
                  <line
                    key={`gy-${r}`}
                    x1={0}
                    y1={r * cellPx}
                    x2={totalW}
                    y2={r * cellPx}
                    strokeWidth={w / viewport.scale}
                    opacity={o}
                  />
                )
              })}
            </g>
          )}

          {/* Centre crosshairs — confident, no-doubt-where-the-centre-is. */}
          {layers.centreCrosshairs && (
            <g
              className="chart-centre-crosshairs"
              stroke="#c4856b"
              strokeWidth={1.6 / viewport.scale}
              opacity={0.72}
              pointerEvents="none"
            >
              <line x1={totalW / 2} y1={0} x2={totalW / 2} y2={totalH} />
              <line x1={0} y1={totalH / 2} x2={totalW} y2={totalH / 2} />
            </g>
          )}

          {/* Symbol overlay — only at high zoom where the symbol fits. */}
          {layers.symbols && scaledCellPx >= 18 &&
            renderedBuckets.map(({ symbol, rgb, cellList }) => (
              <g
                key={`sym-${symbol}`}
                fill={symbolOnFill(rgb)}
                fontSize={cellPx * 0.5}
                fontFamily="ui-monospace, JetBrains Mono, Geist Mono, monospace"
                textAnchor="middle"
                dominantBaseline="central"
                pointerEvents="none"
              >
                {cellList.map(({ x, y }) => (
                  <text key={`tx-${x}-${y}`} x={x * cellPx + cellPx / 2} y={y * cellPx + cellPx / 2}>
                    {symbol}
                  </text>
                ))}
              </g>
            ))}

          {/* Selection rectangle. */}
          {selection && (
            <rect
              x={selection.x1 * cellPx}
              y={selection.y1 * cellPx}
              width={(selection.x2 - selection.x1 + 1) * cellPx}
              height={(selection.y2 - selection.y1 + 1) * cellPx}
              fill="rgba(196, 133, 107, 0.16)"
              stroke="#c4856b"
              strokeWidth={1.6 / viewport.scale}
              strokeDasharray={`${6 / viewport.scale} ${4 / viewport.scale}`}
              pointerEvents="none"
            />
          )}
        </g>
      </svg>
    </div>
  )
}

function filterByDisplayMode(
  cells: { x: number; y: number }[],
  stitched: Set<string>,
  mode: 'all' | 'stitched' | 'remaining',
): { x: number; y: number }[] {
  if (mode === 'all') return cells
  if (mode === 'stitched') return cells.filter(({ x, y }) => stitched.has(cellKey(x, y)))
  return cells.filter(({ x, y }) => !stitched.has(cellKey(x, y)))
}
