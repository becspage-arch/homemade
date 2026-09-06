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
import { lineBounds } from '@/lib/studio/parking'
import { useChartStore, type ChartMode } from './chart-store'
import { readStoredViewport, writeStoredViewport } from './viewport-memory'
import {
  backstitchStrokeWidth,
  buildBucketCrossPath,
  buildBucketHighlightPath,
  buildPaletteIndex,
  DEFAULT_CELL_PX,
  fractionalAreaPath,
  fractionalThreadPath,
  frenchKnotRadius,
  groupCellsBySymbol,
  LOW_ZOOM_THRESHOLD,
  RENDER_PRECISION,
  screenToCell,
  shiftColour,
  symbolOnFill,
} from './render-helpers'

/** Pointer travel (px) past which a view-mode press becomes a pan rather
 *  than a mark-stitched tap. Small enough that a deliberate tap still
 *  marks, large enough that a drag scrolls the pattern. */
const PAN_THRESHOLD_PX = 4

/** How long the view has to sit still before it is worth remembering. */
const VIEW_MEMORY_DEBOUNCE_MS = 400

interface ChartViewportProps {
  pattern: PatternData
  mode: ChartMode
  /**
   * Pattern this canvas is showing. When given, where the Maker had the
   * chart panned and zoomed to is remembered on this device and restored
   * next time they open it. Left out by transient previews, which should
   * always open at the fitted view.
   */
  patternId?: string | null
  /** Mark-stitched cells if persisted externally; defaults to store state. */
  initialStitched?: Set<string>
  /** Called when the user opens the floss-key isolate (right-click cell → isolate). */
  onRequestIsolate?: (symbol: string) => void
  /** Called when an editor wants the colour-picker tool to set a colour from a cell. */
  onPickColour?: (symbol: string) => void
  /**
   * When false, every pointer-down — inside or outside the grid — starts
   * a pan. No mark-stitched, no painting. Used by the photo-to-chart
   * preview, where the chart is a transient render the user is just
   * inspecting, not editing.
   */
  interactive?: boolean
  /**
   * Force the centre crosshairs on or off, overriding the layers toggle
   * in the chart store. Used by the photo-to-chart preview where the
   * crosshair is visual noise obscuring the user's photo and we want a
   * local default of OFF without disturbing the user's stored
   * preference for the actual stitching Studio. Leave undefined to
   * use the store's layer toggle (the normal in-Studio behaviour).
   */
  centreCrosshairsOverride?: boolean
}

export function ChartViewport({
  pattern,
  mode,
  patternId = null,
  initialStitched,
  onRequestIsolate,
  onPickColour,
  interactive = true,
  centreCrosshairsOverride,
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
  const setViewport = useChartStore((s) => s.setViewport)
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
  const renderStyle = useChartStore((s) => s.renderStyle)
  const parkingEnabled = useChartStore((s) => s.parkingEnabled)
  const parkingDirection = useChartStore((s) => s.parkingDirection)
  const parkingLine = useChartStore((s) => s.parkingLine)
  const parkedCells = useChartStore((s) => s.parkedCells)
  const setParkingEnabled = useChartStore((s) => s.setParkingEnabled)

  // ───── one-time pattern install + container measure
  useEffect(() => {
    setPattern(pattern)
    if (initialStitched) setStitchedCells(initialStitched)
  }, [pattern, initialStitched, setPattern, setStitchedCells])

  useEffect(() => {
    setMode(mode)
  }, [mode, setMode])

  // ───── view memory
  //
  // Where the chart was panned and zoomed to belongs to the screen it was
  // looked at on, not to the project, so it lives on the device. Restored
  // once the container has a real size (before that there is nothing
  // sensible to restore into), and saved on a short settle so a pinch does
  // not write on every frame.
  const containerWidth = useChartStore((s) => s.containerWidth)
  const containerHeight = useChartStore((s) => s.containerHeight)
  const restoredFor = useRef<string | null>(null)
  useEffect(() => {
    if (!patternId || restoredFor.current === patternId) return
    if (containerWidth <= 0 || containerHeight <= 0) return
    restoredFor.current = patternId
    const stored = readStoredViewport(patternId)
    if (stored) setViewport(stored)
  }, [patternId, containerWidth, containerHeight, setViewport])

  useEffect(() => {
    if (!patternId) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsub = useChartStore.subscribe((state, prev) => {
      if (state.viewport === prev.viewport) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        writeStoredViewport(patternId, useChartStore.getState().viewport)
      }, VIEW_MEMORY_DEBOUNCE_MS)
    })
    return () => {
      unsub()
      if (timer) clearTimeout(timer)
    }
  }, [patternId])

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
      if (e.key === 'p' && !e.metaKey && !e.ctrlKey) {
        const s = useChartStore.getState()
        setParkingEnabled(!s.parkingEnabled)
        return
      }
      if ((e.key === '[' || e.key === ']') && !e.metaKey && !e.ctrlKey) {
        const s = useChartStore.getState()
        if (s.parkingEnabled) {
          s.stepParkingLine(e.key === ']' ? 1 : -1)
          return
        }
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
  }, [applyZoom, fitViewportToScreen, undo, redo, setTool, setIsolate, setSelection, setParkingEnabled])

  // ───── pointer interaction (pan / paint / mark / pinch)
  const dragRef = useRef<
    | null
    | {
        mode: 'pan' | 'paint' | 'erase' | 'mark' | 'select' | 'maybe-mark'
        lastX: number
        lastY: number
        downX: number
        downY: number
        touched: Set<string>
        markValue?: boolean
        startCellX?: number
        startCellY?: number
        /** The square a mark-stitched press toggled on pointer-down, so a
         *  second finger arriving can put it back. */
        markedOnDown?: { x: number; y: number; value: boolean }
      }
  >(null)

  /**
   * Every pointer currently down on the canvas. A touchscreen has no wheel
   * and no modifier keys, so the two-finger gesture is the only zoom it can
   * make on its own; the container sets `touch-action: none`, which means
   * the browser hands us the raw pointers and expects us to do the work.
   */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<null | { distance: number; midX: number; midY: number }>(null)

  /** Midpoint and separation of the two active pointers. */
  const readPinch = useCallback(() => {
    const pts = [...pointersRef.current.values()]
    if (pts.length < 2) return null
    const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }]
    return {
      distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
    }
  }, [])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (e.button !== 0 && e.button !== 1) return
      svgRef.current?.setPointerCapture(e.pointerId)
      const rect = svgRef.current!.getBoundingClientRect()
      const lx = e.clientX - rect.left
      const ly = e.clientY - rect.top
      pointersRef.current.set(e.pointerId, { x: lx, y: ly })

      // A second finger turns the gesture into a pinch. Anything the first
      // finger started is abandoned, and a square the mark-stitched tool
      // toggled on the way down is put back, so reaching in to zoom never
      // costs the Maker a stitch they did not make.
      if (pointersRef.current.size >= 2) {
        const drag = dragRef.current
        if (drag?.markedOnDown) {
          const { x, y, value } = drag.markedOnDown
          markStitchedBatch([{ x, y }], !value)
        }
        dragRef.current = null
        pinchRef.current = readPinch()
        return
      }

      const base = { lastX: lx, lastY: ly, downX: lx, downY: ly }
      if (spacePanning || e.button === 1 || !interactive) {
        dragRef.current = { mode: 'pan', ...base, touched: new Set() }
        return
      }
      const s = useChartStore.getState()
      const cell = screenToCell(lx, ly, s.viewport)
      if (cell.x < 0 || cell.y < 0 || cell.x >= pattern.grid.width || cell.y >= pattern.grid.height) {
        dragRef.current = { mode: 'pan', ...base, touched: new Set() }
        return
      }
      // Explicit mark-stitched tool: toggle on press, mark across a drag.
      if (s.tool === 'mark-stitched') {
        const k = cellKey(cell.x, cell.y)
        const currently = s.stitchedCells.has(k)
        toggleStitched(cell.x, cell.y)
        dragRef.current = {
          mode: 'mark',
          ...base,
          touched: new Set([k]),
          markValue: !currently,
          markedOnDown: { x: cell.x, y: cell.y, value: !currently },
        }
        return
      }
      // Default view interaction: a tap toggles the cell stitched, a drag
      // pans the canvas so the user can scroll around large patterns. The
      // tap-vs-drag decision is deferred to pointer-move / -up.
      if (mode === 'view') {
        dragRef.current = {
          mode: 'maybe-mark',
          ...base,
          touched: new Set(),
          startCellX: cell.x,
          startCellY: cell.y,
        }
        return
      }
      if (s.tool === 'brush' && s.currentSymbol) {
        paintCell(cell.x, cell.y, s.currentSymbol)
        dragRef.current = { mode: 'paint', ...base, touched: new Set([cellKey(cell.x, cell.y)]) }
        return
      }
      if (s.tool === 'erase') {
        eraseCell(cell.x, cell.y)
        dragRef.current = { mode: 'erase', ...base, touched: new Set([cellKey(cell.x, cell.y)]) }
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
        dragRef.current = { mode: 'select', ...base, touched: new Set(), startCellX: cell.x, startCellY: cell.y }
        setSelection({ x1: cell.x, y1: cell.y, x2: cell.x, y2: cell.y })
        return
      }
      dragRef.current = { mode: 'pan', ...base, touched: new Set() }
    },
    [
      spacePanning,
      interactive,
      mode,
      pattern,
      paintCell,
      eraseCell,
      toggleStitched,
      markStitchedBatch,
      setSelection,
      setCurrentSymbol,
      onPickColour,
      readPinch,
    ],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      const rect = svgRef.current!.getBoundingClientRect()
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY - rect.top })
      }

      // Pinch: the separation drives the zoom and the midpoint drives the
      // pan, so two fingers zoom and scroll the chart in one movement. The
      // zoom is anchored on the midpoint and clamped by the same limits the
      // wheel uses, so a phone cannot reach a zoom a desktop cannot.
      if (pointersRef.current.size >= 2) {
        const now = readPinch()
        const prev = pinchRef.current
        if (now && prev) {
          const delta = now.distance / prev.distance
          if (delta !== 1) applyZoom(delta, now.midX, now.midY)
          const panDx = now.midX - prev.midX
          const panDy = now.midY - prev.midY
          if (panDx !== 0 || panDy !== 0) applyPan(panDx, panDy)
        }
        pinchRef.current = now
        return
      }

      const drag = dragRef.current
      if (!drag) return
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
      // A view-mode press becomes a pan once it travels past the
      // threshold; below it, it stays a candidate tap (handled on up).
      if (drag.mode === 'maybe-mark') {
        if (Math.abs(lx - drag.downX) + Math.abs(ly - drag.downY) > PAN_THRESHOLD_PX) {
          drag.mode = 'pan'
          applyPan(dx, dy)
        }
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
    [pattern, paintCell, eraseCell, markStitchedBatch, applyPan, applyZoom, setSelection, readPinch],
  )

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      svgRef.current?.releasePointerCapture(e.pointerId)
      const wasPinching = pointersRef.current.size >= 2
      pointersRef.current.delete(e.pointerId)
      // Lifting one finger out of a pinch must not turn the other into a
      // tap or a pan: the gesture ends when the last finger leaves.
      if (wasPinching) {
        pinchRef.current = pointersRef.current.size >= 2 ? readPinch() : null
        dragRef.current = null
        return
      }
      const drag = dragRef.current
      // A view-mode press that never crossed the pan threshold is a tap:
      // toggle the cell stitched.
      if (
        drag &&
        drag.mode === 'maybe-mark' &&
        drag.startCellX !== undefined &&
        drag.startCellY !== undefined
      ) {
        toggleStitched(drag.startCellX, drag.startCellY)
      }
      dragRef.current = null
    },
    [toggleStitched, readPinch],
  )

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

  // Symbols only render once a cell is big enough on screen to read the
  // glyph (and the layer is on). Below that, symbol-only mode would draw
  // blank white cells with no symbols — an empty grid. So when symbols
  // can't show at the current zoom, fall back to colour so the design
  // stays visible: colour when zoomed out, symbols when zoomed in (the
  // standard cross-stitch-software behaviour).
  const symbolsVisible = layers.symbols && scaledCellPx >= 14
  const effectiveStyle =
    renderStyle === 'symbol-only' && !symbolsVisible ? 'colour-block' : renderStyle

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

  // Parking layers. Both are derived, not stored: the parked squares come
  // from the chart store's index (progress plus the working order) and the
  // band is pure geometry off the current line.
  const parkMarkers = useMemo(() => {
    if (!parkingEnabled) return []
    const out: Array<{ symbol: string; rgb: string; x: number; y: number }> = []
    for (const [symbol, cell] of parkedCells) {
      // Isolating a colour hides the rest of the chart, so its park markers
      // go with it. The parked positions themselves are untouched.
      if (isolate && symbol !== isolate) continue
      const entry = paletteIndex.bySymbol.get(symbol)
      if (!entry) continue
      out.push({ symbol, rgb: entry.rgb, x: cell.x, y: cell.y })
    }
    return out
  }, [parkingEnabled, parkedCells, isolate, paletteIndex])

  const parkingBand = useMemo(() => {
    if (!parkingEnabled) return null
    return lineBounds(parkingLine, parkingDirection, pattern.grid.width, pattern.grid.height)
  }, [parkingEnabled, parkingLine, parkingDirection, pattern.grid.width, pattern.grid.height])

  // Render the centre crosshairs as a + that crosses the whole grid.
  const gridW = pattern.grid.width
  const gridH = pattern.grid.height
  const totalW = gridW * cellPx
  const totalH = gridH * cellPx

  // The viewport transform applied to the world-space content.
  const transform = `translate(${viewport.panX} ${viewport.panY}) scale(${viewport.scale})`

  const cursorStyle = (() => {
    if (spacePanning) return 'grab'
    if (!interactive) return 'grab'
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
          if (!interactive) return
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

          {/* Stitches — one <g> per colour. Branches on renderStyle:
              colour-block (filled rect, the working-chart default),
              x-stitch (current X-shape), symbol-only (white cells, the
              symbol overlay below carries identity). Low-zoom always
              collapses to filled rects for performance regardless of
              style. */}
          {renderedBuckets.map(({ symbol, rgb, cross, highlight, cellList }) => (
            <g key={`bucket-${symbol}`} className="chart-bucket">
              {useLowZoom ? (
                cellList.map(({ x, y }) => (
                  <rect
                    key={`r-${x}-${y}`}
                    x={x * cellPx}
                    y={y * cellPx}
                    width={cellPx}
                    height={cellPx}
                    fill={effectiveStyle === 'symbol-only' ? '#ffffff' : rgb}
                  />
                ))
              ) : effectiveStyle === 'colour-block' ? (
                cellList.map(({ x, y }) => (
                  <rect
                    key={`r-${x}-${y}`}
                    x={x * cellPx}
                    y={y * cellPx}
                    width={cellPx}
                    height={cellPx}
                    fill={rgb}
                    stroke={shiftColour(rgb, -0.18)}
                    strokeWidth={0.5}
                  />
                ))
              ) : effectiveStyle === 'symbol-only' ? (
                cellList.map(({ x, y }) => (
                  <rect
                    key={`r-${x}-${y}`}
                    x={x * cellPx}
                    y={y * cellPx}
                    width={cellPx}
                    height={cellPx}
                    fill="#ffffff"
                    stroke="#3d2f22"
                    strokeWidth={0.6}
                    opacity={0.95}
                  />
                ))
              ) : (
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

          {/* Quarter and three-quarter stitches — the area they cover, with the
              thread over it, so a fractional cell never reads as a whole one. */}
          {layers.fractional && pattern.grid.fractional.length > 0 && (
            <g className="chart-fractional">
              {pattern.grid.fractional.map((f, i) => {
                if (isolate && f.s !== isolate) return null
                const entry = paletteIndex.bySymbol.get(f.s)
                if (!entry) return null
                const area = fractionalAreaPath(f, cellPx)
                return (
                  <g key={`fr-${i}`}>
                    <path
                      d={area}
                      fill={effectiveStyle === 'symbol-only' ? '#ffffff' : entry.rgb}
                      stroke={effectiveStyle === 'symbol-only' ? '#3d2f22' : shiftColour(entry.rgb, -0.18)}
                      strokeWidth={0.5}
                      opacity={effectiveStyle === 'x-stitch' ? 0.42 : 1}
                    />
                    {effectiveStyle === 'x-stitch' && !useLowZoom && (
                      <path
                        d={fractionalThreadPath(f, cellPx)}
                        stroke={entry.rgb}
                        strokeWidth={cellPx * 0.16}
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}
                  </g>
                )
              })}
            </g>
          )}

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
                    strokeWidth={backstitchStrokeWidth(cellPx)}
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
                const r = frenchKnotRadius(cellPx)
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

          {/* Parking band — the row, column or block being worked now. Sits
              over the stitches so the stitcher can find their place at a
              glance, light enough to read the colours straight through. */}
          {parkingBand && (
            <g className="chart-parking-band" pointerEvents="none">
              <rect
                x={parkingBand.x0 * cellPx}
                y={parkingBand.y0 * cellPx}
                width={(parkingBand.x1 - parkingBand.x0 + 1) * cellPx}
                height={(parkingBand.y1 - parkingBand.y0 + 1) * cellPx}
                fill="rgba(196, 133, 107, 0.14)"
                stroke="#a86547"
                strokeWidth={2.5 / viewport.scale}
              />
            </g>
          )}

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

          {/* Centre crosshairs - confident, no-doubt-where-the-centre-is.
              The photo-to-chart preview passes centreCrosshairsOverride
              to keep crosshairs off by default; everywhere else the
              chart store's layer toggle wins. */}
          {(centreCrosshairsOverride ?? layers.centreCrosshairs) && (
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

          {/* Symbol overlay — drawn over the colour layer at high zoom.
              Size bumped from 0.5 to 0.66 of cell width so the letter
              sits firmly on top of the rendering rather than competing
              with it. In symbol-only mode the cell is white, so the
              symbol always renders dark; in colour-block / x-stitch
              modes we pick black-or-white per cell based on the colour
              brightness for legibility. */}
          {symbolsVisible &&
            renderedBuckets.map(({ symbol, rgb, cellList }) => (
              <g
                key={`sym-${symbol}`}
                fill={renderStyle === 'symbol-only' ? '#1a1410' : symbolOnFill(rgb)}
                fontSize={cellPx * 0.66}
                fontWeight={600}
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

          {/* Park markers — a needle in the floss colour sitting in the next
              square that colour appears in, one per unfinished colour.
              Drawn last so a needle is never half-hidden behind the symbol
              overlay: while parking, the needle is the thing being read. */}
          {parkMarkers.length > 0 && (
            <g className="chart-park-markers" pointerEvents="none">
              {parkMarkers.map(({ symbol, rgb, x, y }) => (
                <ParkMarker key={`park-${symbol}`} x={x} y={y} rgb={rgb} cellPx={cellPx} compact={scaledCellPx < 16} />
              ))}
            </g>
          )}

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

/**
 * One parked needle. Drawn inside the cell box in the floss colour with a
 * dark casing so it stays readable on a pale thread, and collapsed to a
 * ringed dot once the cell is too small on screen to draw a needle into.
 */
function ParkMarker({
  x,
  y,
  rgb,
  cellPx,
  compact,
}: {
  x: number
  y: number
  rgb: string
  cellPx: number
  compact: boolean
}) {
  const c = cellPx
  const cx = x * c + c / 2
  const cy = y * c + c / 2
  if (compact) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={c * 0.3} fill="#fffdf7" stroke="#2b2119" strokeWidth={c * 0.08} />
        <circle cx={cx} cy={cy} r={c * 0.17} fill={rgb} />
      </g>
    )
  }
  // Needle laid bottom-left to top-right, eye at the top, a short thread
  // tail curling away from it.
  const x1 = x * c + c * 0.2
  const y1 = y * c + c * 0.82
  const x2 = x * c + c * 0.76
  const y2 = y * c + c * 0.24
  return (
    <g>
      <rect
        x={x * c + c * 0.06}
        y={y * c + c * 0.06}
        width={c * 0.88}
        height={c * 0.88}
        rx={c * 0.14}
        fill="rgba(255, 253, 247, 0.8)"
        stroke="#a86547"
        strokeWidth={c * 0.08}
      />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2b2119" strokeWidth={c * 0.17} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={rgb} strokeWidth={c * 0.09} strokeLinecap="round" />
      <circle cx={x * c + c * 0.7} cy={y * c + c * 0.3} r={c * 0.09} fill="none" stroke="#2b2119" strokeWidth={c * 0.055} />
      <path
        d={`M${x * c + c * 0.7} ${y * c + c * 0.3} Q${x * c + c * 0.94} ${y * c + c * 0.36} ${x * c + c * 0.86} ${y * c + c * 0.56}`}
        fill="none"
        stroke={rgb}
        strokeWidth={c * 0.07}
        strokeLinecap="round"
      />
    </g>
  )
}
