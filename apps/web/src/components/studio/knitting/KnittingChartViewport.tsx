'use client'

/**
 * KnittingChartViewport — the chart-display surface. Consumes K-2's
 * `renderKnittingChart()` API, applies pan / zoom / fit-to-screen and
 * the show-row-numbers / show-key toggles. Reading direction toggle
 * highlights RS vs WS rows for flat knitting (suppressed in the
 * round).
 *
 * The viewport NEVER mutates chart data. All transforms are display-
 * only (transform: scale + translate on an inner wrapper). The svg
 * itself comes from the renderer as a static string and is dropped
 * into a div via dangerouslySetInnerHTML — server-rendered SVG, no
 * client React tree inside.
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ListOrdered,
  Eye,
  EyeOff,
  ArrowLeftRight,
} from 'lucide-react'

import { renderKnittingChartSvg } from '@/lib/knitting/renderer/client'
import type { KnittingChartData, KnittingChartType } from '@/lib/knitting/renderer/types'

interface KnittingChartViewportProps {
  chartData: KnittingChartData | null
  currentRow?: number
  rightSide?: boolean
  isFlatKnitting: boolean
}

const ZOOM_STEP = 0.15
const MIN_ZOOM = 0.4
const MAX_ZOOM = 4

export function KnittingChartViewport({
  chartData,
  currentRow,
  rightSide,
  isFlatKnitting,
}: KnittingChartViewportProps) {
  const initialZoom = useMemo(() => {
    if (!chartData) return 1
    return recommendedZoomFor(chartData.type)
  }, [chartData])
  // Track the chart identity so we can reset zoom / pan when the
  // chart switches. Comparing identity-as-state inside render is the
  // React-recommended alternative to setState-in-effect.
  const [lastChart, setLastChart] = useState(chartData)
  const [zoomOverride, setZoomOverride] = useState<number | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  if (lastChart !== chartData) {
    setLastChart(chartData)
    setZoomOverride(null)
    setPan({ x: 0, y: 0 })
  }
  const zoom = zoomOverride ?? initialZoom
  const setZoom = useCallback(
    (next: number | ((prev: number) => number)) => {
      setZoomOverride((prev) => {
        const current = prev ?? initialZoom
        return typeof next === 'function' ? next(current) : next
      })
    },
    [initialZoom],
  )
  const [panning, setPanning] = useState(false)
  const [showRowNumbers, setShowRowNumbers] = useState(true)
  const [showKey, setShowKey] = useState(true)
  const [showReadingDirection, setShowReadingDirection] = useState(false)
  const [mirrorLeftHanded, setMirrorLeftHanded] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{
    startX: number
    startY: number
    startPanX: number
    startPanY: number
  } | null>(null)

  const rendered = useMemo(() => {
    if (!chartData) return null
    // Left-handed mirror is a chart-data transform; K-2's renderer
    // takes the data as-is so we flip x-coordinates here when the
    // toggle is on. currentRow is highlighted client-side via a band
    // overlay (TODO when K-4 adds highlight-row to RenderOptions).
    void currentRow
    const data = mirrorLeftHanded ? mirrorChartHorizontal(chartData) : chartData
    return renderKnittingChartSvg(data, {
      showChartKey: showKey,
      showRowNumbers,
    })
  }, [chartData, showKey, showRowNumbers, currentRow, mirrorLeftHanded])

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
  }, [setZoom])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
  }, [setZoom])

  const fitToScreen = useCallback(() => {
    if (!canvasRef.current || !rendered) return
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const padding = 48
    const fitX = (canvasRect.width - padding) / rendered.width
    const fitY = (canvasRect.height - padding) / rendered.height
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(fitX, fitY)))
    setZoom(next)
    setPan({ x: 0, y: 0 })
  }, [rendered, setZoom])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      }
      setPanning(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [pan],
  )

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current
    if (!d) return
    setPan({
      x: d.startPanX + (e.clientX - d.startX),
      y: d.startPanY + (e.clientY - d.startY),
    })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current) {
      dragState.current = null
      setPanning(false)
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }
  }, [])

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Trackpad pinch / ctrl + wheel = zoom; plain wheel = scroll the
    // canvas (default), so we only intercept when ctrl / meta is held.
    if (!(e.ctrlKey || e.metaKey)) return
    e.preventDefault()
    const dir = e.deltaY < 0 ? 1 : -1
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + dir * ZOOM_STEP)))
  }, [setZoom])

  if (!chartData || !rendered) {
    return (
      <div className="knitting-chart-viewport">
        <div className="knitting-chart-viewport-empty">
          No chart yet. The written pattern is on the Written tab.
        </div>
      </div>
    )
  }

  return (
    <div className="knitting-chart-viewport">
      <div className="knitting-chart-viewport-controls">
        <div className="knitting-chart-viewport-control-group">
          <button
            type="button"
            className="knitting-chart-viewport-iconbutton"
            onClick={zoomOut}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="knitting-chart-viewport-zoom-readout">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="knitting-chart-viewport-iconbutton"
            onClick={zoomIn}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            className="knitting-chart-viewport-iconbutton"
            onClick={fitToScreen}
            aria-label="Fit to screen"
            title="Fit to screen"
          >
            <Maximize2 size={14} />
            <span>Fit</span>
          </button>
        </div>

        <div className="knitting-chart-viewport-control-group">
          <button
            type="button"
            className={`knitting-chart-viewport-iconbutton${showRowNumbers ? ' is-active' : ''}`}
            onClick={() => setShowRowNumbers((v) => !v)}
            aria-pressed={showRowNumbers}
            title="Toggle row numbers"
          >
            <ListOrdered size={14} />
            <span>Rows</span>
          </button>
          <button
            type="button"
            className={`knitting-chart-viewport-iconbutton${showKey ? ' is-active' : ''}`}
            onClick={() => setShowKey((v) => !v)}
            aria-pressed={showKey}
            title="Toggle stitch key"
          >
            {showKey ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>Key</span>
          </button>
          {isFlatKnitting && (
            <button
              type="button"
              className={`knitting-chart-viewport-iconbutton${showReadingDirection ? ' is-active' : ''}`}
              onClick={() => setShowReadingDirection((v) => !v)}
              aria-pressed={showReadingDirection}
              title="Highlight RS / WS reading direction"
            >
              <ArrowLeftRight size={14} />
              <span>RS/WS</span>
            </button>
          )}
          <button
            type="button"
            className={`knitting-chart-viewport-iconbutton${mirrorLeftHanded ? ' is-active' : ''}`}
            onClick={() => setMirrorLeftHanded((v) => !v)}
            aria-pressed={mirrorLeftHanded}
            title="Mirror chart for left-handed work"
          >
            <ArrowLeftRight size={14} />
            <span>LH</span>
          </button>
        </div>

        {showReadingDirection && isFlatKnitting && typeof rightSide === 'boolean' && (
          <div className="knitting-chart-viewport-control-group">
            <span
              className={`knitting-counter-rs-marker ${rightSide ? 'is-rs' : 'is-ws'}`}
            >
              {rightSide ? 'RS' : 'WS'}
            </span>
          </div>
        )}
      </div>

      <div
        ref={canvasRef}
        className={`knitting-chart-viewport-canvas${panning ? ' is-panning' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="knitting-chart-viewport-inner"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
          dangerouslySetInnerHTML={{ __html: rendered.svg }}
        />
      </div>
    </div>
  )
}

function recommendedZoomFor(type: KnittingChartType): number {
  switch (type) {
    case 'LACE':
      return 1.4
    case 'CABLE':
      return 1.2
    case 'BRIOCHE':
      return 1.3
    case 'COLOURWORK':
    default:
      return 1
  }
}

/**
 * Mirror chart cells horizontally for left-handed work. Lays each
 * cell at (width - 1 - x, y). Cables also flip their start / end
 * x-coordinates plus the crossDirection (LEFT becomes RIGHT and
 * vice versa).
 */
function mirrorChartHorizontal(data: KnittingChartData): KnittingChartData {
  const width = data.grid.width
  return {
    ...data,
    grid: {
      ...data.grid,
      cells: data.grid.cells.map((c) => ({ ...c, x: width - 1 - c.x })),
      cables: data.grid.cables?.map((cable) => ({
        ...cable,
        startX: width - 1 - cable.endX,
        endX: width - 1 - cable.startX,
        crossDirection: cable.crossDirection === 'LEFT' ? 'RIGHT' : 'LEFT',
      })),
    },
  }
}
