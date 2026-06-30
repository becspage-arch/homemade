'use client'

/**
 * NeedleworkSurfaceView — the annotation canvas for surface-embroidery
 * disciplines (SURFACE_EMBROIDERY, CREWEL, GOLDWORK, RIBBON, STUMPWORK,
 * CANDLEWICKING).
 *
 * v1 shape: render the SVG outline from vectorData, list region annotations
 * in a side panel, let the user mark regions complete by clicking the
 * checklist. The SVG is display-only; region highlight on hover shows
 * which annotation corresponds to which area.
 *
 * "Upload your own design" is the premium path; in v1 we show a notice
 * that the feature is coming and direct to the library.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { NeedleworkPatternData, NeedleworkProjectProgressData, NeedleworkRegionAnnotation } from './types'

/** "embroidery-straight" → "Straight" for the stitch checklist. */
function prettyStitch(s: string): string {
  return s.replace(/^embroidery-/, '').replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

interface NeedleworkSurfaceViewProps {
  pattern: NeedleworkPatternData
  progress: NeedleworkProjectProgressData | null
  notesOpen: boolean
  onRegionToggle?: (regionId: string, completed: boolean) => void
}

export function NeedleworkSurfaceView({
  pattern,
  progress,
  notesOpen: _notesOpen,
  onRegionToggle,
}: NeedleworkSurfaceViewProps) {
  const [, setHoveredRegion] = useState<string | null>(null)
  // zoom is a multiplier on the FIT size (1 = fit the canvas), so the design is
  // always sized relative to whatever space the screen gives it — no fixed width.
  const [zoom, setZoom] = useState(1)
  const [view, setView] = useState<'outline' | 'colour'>('outline')
  const zoomIn = useCallback(() => setZoom((z) => Math.min(6, +(z * 1.25).toFixed(2))), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(1, +(z / 1.25).toFixed(2))), [])

  const completedRegions = useMemo(() => progress?.completedRegions ?? {}, [progress])
  const annotations: NeedleworkRegionAnnotation[] = pattern.regionAnnotations ?? []
  const vectorData = pattern.vectorData
  const colourMapSvg = vectorData?.colourMapSvg ?? null
  // Which design to show in the canvas: the clean outline (the transfer template)
  // or the colour / stitch-direction map. Only offered when a colour map exists.
  const designSvg = view === 'colour' && colourMapSvg ? colourMapSvg : vectorData?.svgContent

  // Responsive fit: measure the canvas and scale the design to CONTAIN within it
  // (fit both width and height, centred), recomputed on resize. The on-screen
  // design size is then fit × zoom, so Fit fills any screen and zoom pans via scroll.
  const canvasRef = useRef<HTMLDivElement>(null)
  const aspect =
    vectorData && vectorData.width && vectorData.height ? vectorData.width / vectorData.height : 1
  const [fitW, setFitW] = useState(0)
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const compute = () => {
      const cs = getComputedStyle(el)
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      const availW = Math.max(0, el.clientWidth - padX)
      const availH = Math.max(0, el.clientHeight - padY)
      // contain: the largest width whose height (w/aspect) still fits availH.
      const w = Math.min(availW, availH * aspect)
      setFitW(w)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [aspect])
  const designW = fitW > 0 ? Math.round(fitW * zoom) : undefined

  const completedCount = Object.keys(completedRegions).length
  const totalCount = annotations.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleRegionClick = useCallback(
    (regionId: string) => {
      const isCompleted = Boolean(completedRegions[regionId])
      onRegionToggle?.(regionId, !isCompleted)
    },
    [completedRegions, onRegionToggle],
  )

  if (!vectorData && annotations.length === 0) {
    return (
      <div className="needlework-surface-view">
        <div className="needlework-surface-upload-prompt">
          <div className="needlework-surface-upload-title">No design loaded</div>
          <p className="needlework-surface-upload-body">
            This pattern does not have a surface design attached yet. Browse the library to find
            a pattern with a full design, or add your own line drawing (premium feature, coming soon).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="needlework-surface-view">
      <div className="needlework-surface-main">
        <div className="needlework-surface-zoombar">
          {colourMapSvg && (
            <div className="needlework-surface-viewtoggle" role="group" aria-label="Design view">
              <button
                type="button"
                className={`needlework-surface-zoom-btn${view === 'outline' ? ' is-active' : ''}`}
                onClick={() => setView('outline')}
              >
                Outline
              </button>
              <button
                type="button"
                className={`needlework-surface-zoom-btn${view === 'colour' ? ' is-active' : ''}`}
                onClick={() => setView('colour')}
              >
                Colour map
              </button>
              <span className="needlework-surface-zoom-divider" aria-hidden="true" />
            </div>
          )}
          <button type="button" className="needlework-surface-zoom-btn" onClick={zoomOut} aria-label="Zoom out">−</button>
          <button type="button" className="needlework-surface-zoom-btn" onClick={() => setZoom(1)}>Fit</button>
          <button type="button" className="needlework-surface-zoom-btn" onClick={zoomIn} aria-label="Zoom in">+</button>
          <span className="needlework-surface-zoom-pct">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="needlework-surface-canvas-area" ref={canvasRef}>
          <div className="needlework-surface-stage">
            {designSvg ? (
              // At Fit the design is sized to contain the canvas (any screen);
              // zooming widens it past the canvas so it scrolls (pan) for detail.
              <div
                key={view}
                className="needlework-surface-svg-wrapper"
                style={{ width: designW }}
                dangerouslySetInnerHTML={{ __html: designSvg }}
              />
            ) : (
              <div style={{ padding: '2rem', color: 'var(--colour-text-muted)', fontSize: '0.875rem' }}>
                Design outline not available for this pattern. Follow the printed transfer sheet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="needlework-surface-annotations">
        <div className="needlework-surface-annotations-heading">
          Stitches — {completedCount}/{totalCount}
          {totalCount > 0 && (
            <span style={{ marginLeft: '0.5rem', fontWeight: 400 }}>{progressPct}%</span>
          )}
        </div>

        {annotations.length === 0 ? (
          <p style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--colour-text-muted)' }}>
            No stitch annotations for this pattern.
          </p>
        ) : (
          <ul className="needlework-surface-annotation-list">
            {annotations.map((annotation) => {
              const isCompleted = Boolean(completedRegions[annotation.id])
              return (
                <li key={annotation.id}>
                  <button
                    type="button"
                    className={`needlework-surface-annotation-item${isCompleted ? ' completed' : ''}`}
                    onClick={() => handleRegionClick(annotation.id)}
                    onMouseEnter={() => setHoveredRegion(annotation.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  >
                    <span
                      className="needlework-surface-annotation-swatch"
                      style={{ background: annotation.colourHex }}
                    />
                    <div className="needlework-surface-annotation-body">
                      <div className="needlework-surface-annotation-stitch">
                        {prettyStitch(annotation.stitchType)}
                      </div>
                      <div className="needlework-surface-annotation-thread">
                        {annotation.threadRef}
                      </div>
                      {annotation.notes && (
                        <div className="needlework-surface-annotation-thread" style={{ fontStyle: 'italic' }}>
                          {annotation.notes}
                        </div>
                      )}
                    </div>
                    <div className="needlework-surface-annotation-check">
                      {isCompleted && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
