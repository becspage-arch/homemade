'use client'

/**
 * Browse-mode viewer for freesewing-rendered patterns. The S-1 viewer
 * (SewingPatternViewer) walks polyline pieces; this one renders the
 * SVG string produced by the apps/web/src/lib/sewing/grading wrapper.
 *
 * Controls:
 *  - Zoom in / out / fit (matches the S-1 viewer surface)
 *  - 1:1 toggle: applies the credit-card calibration scale from
 *    localStorage so the inline preview matches a physical ruler held
 *    against the screen
 *  - Footer credit (freesewing attribution) below the canvas
 *
 * No drag-to-pan on this viewer yet — freesewing parts are laid out
 * automatically by the engine and fit the default viewport. S-5d's
 * personalisation flow will swap this for a pan-aware editor.
 */

import { useCallback, useMemo, useState } from 'react'

const STORAGE_KEY = 'sewing-studio:card-scale'
const MIN_SCALE = 0.3
const MAX_SCALE = 4

interface FreesewingPatternViewerProps {
  svg: string
  patternName: string
  attribution: string | null
}

function readCardScale(): number {
  if (typeof window === 'undefined') return 1
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return 1
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) return n
  } catch {
    // ignore
  }
  return 1
}

export function FreesewingPatternViewer({
  svg,
  patternName,
  attribution,
}: FreesewingPatternViewerProps) {
  const [scale, setScale] = useState(1)
  const [oneToOne, setOneToOne] = useState(false)
  const [cardScale] = useState<number>(() => readCardScale())

  const effectiveScale = oneToOne ? cardScale : scale

  const dimensions = useMemo(() => extractSvgViewBox(svg), [svg])

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => clamp(s * delta, MIN_SCALE, MAX_SCALE))
  }, [])

  const fit = useCallback(() => setScale(1), [])

  return (
    <div className="sew-viewer" aria-label="Pattern viewer">
      <div className="sew-viewer-toolbar">
        <div
          className="sew-panel-label"
          style={{ marginRight: '0.5rem', fontWeight: 500 }}
        >
          {patternName}
        </div>
        <button
          type="button"
          className={`sew-viewer-toggle ${oneToOne ? 'active' : ''}`}
          onClick={() => setOneToOne((v) => !v)}
          title="Render at 1:1 using the saved credit-card calibration"
        >
          1:1 scale
        </button>
        <div className="sew-viewer-zoom-group">
          <button
            type="button"
            className="sew-viewer-zoom-button"
            onClick={() => zoomBy(0.87)}
            aria-label="Zoom out"
            disabled={oneToOne}
          >
            −
          </button>
          <div className="sew-viewer-zoom-readout">
            {Math.round(effectiveScale * 100)}%
            {oneToOne && (
              <span style={{ marginLeft: 4, fontSize: '0.75rem', opacity: 0.7 }}>
                (calibrated)
              </span>
            )}
          </div>
          <button
            type="button"
            className="sew-viewer-zoom-button"
            onClick={() => zoomBy(1.15)}
            aria-label="Zoom in"
            disabled={oneToOne}
          >
            +
          </button>
          <button
            type="button"
            className="sew-viewer-zoom-button"
            onClick={fit}
            aria-label="Fit to screen"
            title="Fit to screen"
            disabled={oneToOne}
          >
            ⤢
          </button>
        </div>
      </div>

      <div className="sew-viewer-canvas">
        <div
          className="sew-viewer-svg-wrap"
          style={{
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'center',
            maxWidth: '95%',
            maxHeight: '92%',
          }}
        >
          <FreesewingSvg svg={svg} dimensions={dimensions} />
        </div>
      </div>

      {attribution && (
        <div className="sew-freesewing-attribution">{attribution}</div>
      )}
    </div>
  )
}

/**
 * Render the freesewing SVG inline. Uses `dangerouslySetInnerHTML`
 * because the SVG comes from a trusted server-side render (the wrapper
 * inside our own codebase) — never from user input. The wrapping div
 * sets aria attributes so screen readers can describe the canvas.
 *
 * The freesewing SVG already includes width / height / viewBox so it
 * scales cleanly inside a flex parent.
 */
function FreesewingSvg({
  svg,
  dimensions,
}: {
  svg: string
  dimensions: { width: number; height: number } | null
}) {
  return (
    <div
      role="img"
      aria-label="Freesewing pattern render"
      className="sew-freesewing-svg"
      style={
        dimensions
          ? {
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              maxWidth: '100%',
            }
          : { maxWidth: '100%' }
      }
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function extractSvgViewBox(
  svg: string,
): { width: number; height: number } | null {
  const widthMatch = /<svg[^>]*\bwidth="([^"]+)"/i.exec(svg)
  const heightMatch = /<svg[^>]*\bheight="([^"]+)"/i.exec(svg)
  if (widthMatch && heightMatch) {
    const w = parseFloat(widthMatch[1] ?? '')
    const h = parseFloat(heightMatch[1] ?? '')
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      // Freesewing emits mm as width / height. Display at ~3 px/mm so
      // the canvas isn't postage-stamp sized; the 1:1 toggle applies the
      // calibration on top.
      const PX_PER_MM = 3
      return { width: w * PX_PER_MM, height: h * PX_PER_MM }
    }
  }
  return null
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
