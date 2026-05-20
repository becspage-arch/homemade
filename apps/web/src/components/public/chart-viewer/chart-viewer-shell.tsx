'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from 'react'

/**
 * Shared client-side chart-viewer shell. Wraps any chart renderer in:
 *
 *   - Pinch-zoom + one-finger pan on touch; ctrl+wheel zoom + drag pan on
 *     mouse
 *   - Fullscreen toggle via the Fullscreen API
 *   - Reset-view + zoom +/− buttons
 *   - A toolbar slot for craft-specific controls (mode toggles, etc.)
 *   - A legend slot beneath the chart
 *
 * Pure interaction-layer — does not know about cells, stitches, or
 * progress state. Inner renderers can subscribe to the imperative
 * `ChartViewerShellHandle` if they need the current viewport for hit
 * testing.
 */

export interface ChartViewerShellHandle {
  /** Recentre + zoom-to-fit. */
  resetView: () => void
  /** Bump zoom by a multiplier; clamped to MIN/MAX. */
  zoomBy: (factor: number) => void
  /** Current zoom level (1 = fit-to-shell). */
  getScale: () => number
}

interface ChartViewerShellProps {
  /** The rendered chart — typically an SVG inside a sized div. */
  children: ReactNode
  /** Optional toolbar slot rendered above the chart canvas. */
  toolbar?: ReactNode
  /** Optional legend slot rendered beneath the chart canvas. */
  legend?: ReactNode
  /** Accessible name announced for the chart canvas. */
  ariaLabel?: string
  /** Optional extra className for the outer container. */
  className?: string
}

const MIN_SCALE = 0.4
const MAX_SCALE = 8
const WHEEL_ZOOM_STEP = 0.15
const BUTTON_ZOOM_STEP = 1.25

export const ChartViewerShell = forwardRef<ChartViewerShellHandle, ChartViewerShellProps>(
  function ChartViewerShell({ children, toolbar, legend, ariaLabel, className }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const [scale, setScale] = useState(1)
    const [tx, setTx] = useState(0)
    const [ty, setTy] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Pointer-state tracking. We support: single-pointer drag (pan), and
    // two-pointer pinch (zoom). React's synthetic event recycling means
    // pointer IDs stay valid only inside the handler, so we mirror them
    // into refs.
    const pointersRef = useRef(new Map<number, { x: number; y: number }>())
    const lastSinglePointerRef = useRef<{ x: number; y: number } | null>(null)
    const lastPinchDistanceRef = useRef<number | null>(null)

    const resetView = useCallback(() => {
      setScale(1)
      setTx(0)
      setTy(0)
    }, [])

    const zoomBy = useCallback((factor: number) => {
      setScale((s) => clamp(s * factor, MIN_SCALE, MAX_SCALE))
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        resetView,
        zoomBy,
        getScale: () => scale,
      }),
      [resetView, zoomBy, scale],
    )

    useEffect(() => {
      function onFullscreenChange() {
        setIsFullscreen(Boolean(document.fullscreenElement))
      }
      document.addEventListener('fullscreenchange', onFullscreenChange)
      return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
    }, [])

    const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.setPointerCapture(e.pointerId)
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointersRef.current.size === 1) {
        lastSinglePointerRef.current = { x: e.clientX, y: e.clientY }
      } else if (pointersRef.current.size === 2) {
        const [p1, p2] = Array.from(pointersRef.current.values())
        if (p1 && p2) {
          lastPinchDistanceRef.current = distance(p1, p2)
        }
        lastSinglePointerRef.current = null
      }
    }, [])

    const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.has(e.pointerId)) return
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointersRef.current.size === 1 && lastSinglePointerRef.current) {
        const dx = e.clientX - lastSinglePointerRef.current.x
        const dy = e.clientY - lastSinglePointerRef.current.y
        lastSinglePointerRef.current = { x: e.clientX, y: e.clientY }
        setTx((t) => t + dx)
        setTy((t) => t + dy)
      } else if (pointersRef.current.size === 2) {
        const [p1, p2] = Array.from(pointersRef.current.values())
        if (p1 && p2) {
          const d = distance(p1, p2)
          if (lastPinchDistanceRef.current != null && lastPinchDistanceRef.current > 0) {
            const factor = d / lastPinchDistanceRef.current
            setScale((s) => clamp(s * factor, MIN_SCALE, MAX_SCALE))
          }
          lastPinchDistanceRef.current = d
        }
      }
    }, [])

    const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
      pointersRef.current.delete(e.pointerId)
      if (pointersRef.current.size === 0) {
        lastSinglePointerRef.current = null
        lastPinchDistanceRef.current = null
      } else if (pointersRef.current.size === 1) {
        const remaining = Array.from(pointersRef.current.values())[0]
        lastSinglePointerRef.current = remaining ?? null
        lastPinchDistanceRef.current = null
      }
    }, [])

    const onWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
      // Only react to ctrl-wheel (mouse zoom convention on desktop); plain
      // wheel scrolls the page as normal. Pinch on a trackpad fires as a
      // ctrl-modified wheel event in every modern browser.
      if (!e.ctrlKey) return
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1 + WHEEL_ZOOM_STEP : 1 / (1 + WHEEL_ZOOM_STEP)
      setScale((s) => clamp(s * factor, MIN_SCALE, MAX_SCALE))
    }, [])

    const onToggleFullscreen = useCallback(() => {
      const el = containerRef.current
      if (!el) return
      if (document.fullscreenElement) {
        // Releasing landscape on exit — best-effort, browsers without
        // the Screen Orientation API silently noop.
        const orientation = (screen as Screen & {
          orientation?: { unlock?: () => void }
        }).orientation
        try {
          orientation?.unlock?.()
        } catch {
          // unlock can throw on browsers that don't support it
        }
        void document.exitFullscreen()
      } else if (el.requestFullscreen) {
        void el.requestFullscreen().then(() => {
          // Lock landscape on touch screens only — desktop users tend to
          // resent forced orientation. Detection: coarse-pointer media
          // query. Best-effort; the API is unavailable on iOS Safari and
          // some embedded browsers.
          const isCoarsePointer =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(pointer: coarse)').matches
          if (!isCoarsePointer) return
          const orientation = (screen as Screen & {
            orientation?: { lock?: (o: string) => Promise<void> }
          }).orientation
          try {
            void orientation?.lock?.('landscape').catch(() => {
              // user denied / not supported — silent
            })
          } catch {
            // not supported
          }
        })
      }
    }, [])

    const canvasStyle = useMemo<CSSProperties>(
      () => ({
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        transformOrigin: '0 0',
        touchAction: 'none',
      }),
      [tx, ty, scale],
    )

    const containerClassName = [
      'chart-viewer-shell',
      isFullscreen ? 'chart-viewer-shell--fullscreen' : '',
      isDarkMode ? 'chart-viewer-shell--dark' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={containerRef} className={containerClassName}>
        <div className="chart-viewer-shell__bar">
          <div className="chart-viewer-shell__bar-left">{toolbar}</div>
          <div className="chart-viewer-shell__bar-right">
            <button
              type="button"
              className="chart-viewer-shell__button"
              onClick={() => zoomBy(BUTTON_ZOOM_STEP)}
              aria-label="Zoom in"
              title="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="chart-viewer-shell__button"
              onClick={() => zoomBy(1 / BUTTON_ZOOM_STEP)}
              aria-label="Zoom out"
              title="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="chart-viewer-shell__button"
              onClick={resetView}
              aria-label="Reset view"
              title="Reset view"
            >
              ⤢
            </button>
            <button
              type="button"
              className="chart-viewer-shell__button"
              onClick={() => setIsDarkMode((d) => !d)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? '☀' : '☾'}
            </button>
            <button
              type="button"
              className="chart-viewer-shell__button"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
        <div
          ref={canvasRef}
          className="chart-viewer-shell__canvas"
          role="img"
          aria-label={ariaLabel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        >
          <div className="chart-viewer-shell__canvas-inner" style={canvasStyle}>
            {children}
          </div>
        </div>
        {legend ? <div className="chart-viewer-shell__legend">{legend}</div> : null}
      </div>
    )
  },
)

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}
