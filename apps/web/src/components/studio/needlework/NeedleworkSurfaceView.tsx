'use client'

/**
 * NeedleworkSurfaceView — the working canvas for surface-embroidery patterns.
 *
 * Two design views: the clean OUTLINE (the transfer template) and the COLOUR MAP
 * (the dense stitch/colour guide). On a dense pattern the colour map is
 * interactive: selecting a colour OR a colour-family "area" lights up exactly
 * where it goes and dims the rest — the same locate-and-isolate idea the
 * cross-stitch chart uses, so a stitcher never has to guess. Mark a colour/area
 * done as you go. The canvas fits any screen and zooms/pans.
 */

import { useState, useCallback, useMemo, useEffect, useRef, useId } from 'react'
import type { NeedleworkPatternData, NeedleworkProjectProgressData, NeedleworkRegionAnnotation } from './types'

/** "embroidery-straight" → "Straight" for the (fallback) stitch checklist. */
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
  const vectorData = pattern.vectorData
  const locate = pattern.locate ?? null
  const outlineSvg = vectorData?.svgContent ?? null
  const colourMapSvg = locate?.mapSvg ?? vectorData?.colourMapSvg ?? null
  const hasColour = Boolean(colourMapSvg)

  const [zoom, setZoom] = useState(1)
  // Open on the colour map — it's the finished-look guide customers expect; the
  // bare outline read as "broken" to first-time users. Fall back to outline only
  // when there's no colour map to show.
  const [view, setView] = useState<'outline' | 'colour'>(hasColour ? 'colour' : 'outline')
  const [tab, setTab] = useState<'colours' | 'areas'>('colours')
  const [sel, setSel] = useState<{ axis: 'f' | 'r'; id: number } | null>(null)
  const rawId = useId()
  const uid = 'nw' + rawId.replace(/[^a-zA-Z0-9]/g, '')
  const zoomIn = useCallback(() => setZoom((z) => Math.min(6, +(z * 1.25).toFixed(2))), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(1, +(z / 1.25).toFixed(2))), [])

  const completedRegions = useMemo(() => progress?.completedRegions ?? {}, [progress])
  const annotations: NeedleworkRegionAnnotation[] = pattern.regionAnnotations ?? []

  // Which design to show. Selecting a colour/area forces the colour map.
  const designSvg = view === 'colour' ? colourMapSvg ?? outlineSvg : outlineSvg

  // Responsive fit: measure the canvas, size the design to CONTAIN it (fit both
  // axes, centred), recompute on resize. On-screen size = fit × zoom.
  const canvasRef = useRef<HTMLDivElement>(null)
  const aspect =
    vectorData && vectorData.width && vectorData.height ? vectorData.width / vectorData.height : 1
  const [fitW, setFitW] = useState(0)
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const compute = () => {
      const cs = getComputedStyle(el)
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
      const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0)
      const availW = Math.max(0, el.clientWidth - padX)
      const availH = Math.max(0, el.clientHeight - padY)
      const w = Math.min(availW, availH * aspect)
      if (w > 0) setFitW(w)
    }
    compute()
    const raf = requestAnimationFrame(compute)
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [aspect])
  const designW = fitW > 0 ? Math.round(fitW * zoom) : undefined

  // ── Locate selection ──────────────────────────────────────────────────────
  const selectColour = useCallback((n: number) => {
    setView('colour')
    setSel((p) => (p && p.axis === 'f' && p.id === n ? null : { axis: 'f', id: n }))
  }, [])
  const selectArea = useCallback((r: number) => {
    setView('colour')
    setSel((p) => (p && p.axis === 'r' && p.id === r ? null : { axis: 'r', id: r }))
  }, [])
  const toggleDone = useCallback(
    (key: string) => onRegionToggle?.(key, !completedRegions[key]),
    [completedRegions, onRegionToggle],
  )
  // Click a stitch on the colour map → select that colour.
  const onMapClick = useCallback(
    (e: React.MouseEvent) => {
      const f = (e.target as Element)?.getAttribute?.('data-f')
      if (f) selectColour(Number(f))
    },
    [selectColour],
  )

  // The highlight is a tiny injected CSS rule keyed on data-f / data-r, so a
  // selection never re-renders the thousands of stitches.
  const highlightCss = useMemo(() => {
    const base = `#${uid} .nw-stitches>*`
    if (sel) {
      return `${base}{opacity:0.07;}${base}[data-${sel.axis}="${sel.id}"]{opacity:1;}`
    }
    // No selection → softly dim anything marked done (progress at a glance).
    const dim = Object.keys(completedRegions)
      .map((k) => {
        const i = k.indexOf(':')
        const ax = k.slice(0, i)
        const id = k.slice(i + 1)
        return ax === 'f' || ax === 'r' ? `${base}[data-${ax}="${id}"]{opacity:0.2;}` : ''
      })
      .join('')
    return dim
  }, [sel, uid, completedRegions])

  const floss = useMemo(() => locate?.floss ?? [], [locate])
  const areas = useMemo(() => locate?.areas ?? [], [locate])
  const flossHex = useMemo(() => new Map(floss.map((f) => [f.number, f.hex])), [floss])
  const familySwatch = (nums: number[]): string => {
    const hexes = nums.slice(0, 4).map((n) => flossHex.get(n) ?? '#ccc')
    if (hexes.length === 1) return hexes[0]!
    const stops = hexes.map((h, i) => `${h} ${Math.round((i / (hexes.length - 1)) * 100)}%`).join(', ')
    return `linear-gradient(135deg, ${stops})`
  }

  if (!vectorData && annotations.length === 0 && !locate) {
    return (
      <div className="needlework-surface-view">
        <div className="needlework-surface-upload-prompt">
          <div className="needlework-surface-upload-title">No design loaded</div>
          <p className="needlework-surface-upload-body">
            This pattern does not have a surface design attached yet. Browse the library to find a
            pattern with a full design, or add your own line drawing (premium feature, coming soon).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="needlework-surface-view">
      <div className="needlework-surface-main">
        <div className="needlework-surface-zoombar">
          {hasColour && (
            <div className="needlework-surface-viewtoggle" role="group" aria-label="Design view">
              <button
                type="button"
                className={`nw-seg${view === 'outline' ? ' is-active' : ''}`}
                onClick={() => setView('outline')}
              >
                Outline
              </button>
              <button
                type="button"
                className={`nw-seg${view === 'colour' ? ' is-active' : ''}`}
                onClick={() => setView('colour')}
              >
                Colour map
              </button>
            </div>
          )}
          <span className="needlework-surface-zoom-spacer" />
          <button type="button" className="needlework-surface-zoom-btn" onClick={zoomOut} aria-label="Zoom out">−</button>
          <button type="button" className="needlework-surface-zoom-btn" onClick={() => setZoom(1)}>Fit</button>
          <button type="button" className="needlework-surface-zoom-btn" onClick={zoomIn} aria-label="Zoom in">+</button>
          <span className="needlework-surface-zoom-pct">{Math.round(zoom * 100)}%</span>
          {sel && (
            <button type="button" className="needlework-surface-clearsel" onClick={() => setSel(null)}>
              Clear highlight
            </button>
          )}
        </div>
        <div className="needlework-surface-canvas-area" ref={canvasRef}>
          <style>{highlightCss}</style>
          <div className="needlework-surface-stage">
            {designSvg ? (
              <div
                id={uid}
                key={view}
                className={`needlework-surface-svg-wrapper${view === 'colour' && locate ? ' is-locatable' : ''}`}
                style={{ width: designW }}
                onClick={view === 'colour' && locate ? onMapClick : undefined}
                dangerouslySetInnerHTML={{ __html: designSvg }}
              />
            ) : (
              <div style={{ padding: '2rem', color: 'var(--studio-ink-mute)', fontSize: '0.875rem' }}>
                Design outline not available for this pattern. Follow the printed transfer sheet.
              </div>
            )}
          </div>
        </div>
      </div>

      {locate ? (
        <div className="needlework-surface-annotations">
          <div className="nw-panel-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className={`nw-panel-tab${tab === 'colours' ? ' is-active' : ''}`}
              onClick={() => setTab('colours')}
            >
              Colours <span>{floss.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              className={`nw-panel-tab${tab === 'areas' ? ' is-active' : ''}`}
              onClick={() => setTab('areas')}
            >
              Areas <span>{areas.length}</span>
            </button>
          </div>
          <p className="nw-panel-hint">
            {tab === 'colours'
              ? 'Tap a colour to light up where it goes. Tick it off as you stitch.'
              : 'Tap an area (a colour family) to see its part of the design.'}
          </p>
          <ul className="nw-locate-list">
            {tab === 'colours'
              ? floss.map((f) => {
                  const key = `f:${f.number}`
                  const done = Boolean(completedRegions[key])
                  const active = sel?.axis === 'f' && sel.id === f.number
                  return (
                    <li key={f.number} className="nw-locate-li">
                      <button
                        type="button"
                        className={`nw-locate-row${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                        onClick={() => selectColour(f.number)}
                      >
                        <span className="nw-locate-swatch" style={{ background: f.hex }} />
                        <span className="nw-locate-body">
                          <span className="nw-locate-name">{f.name}</span>
                          <span className="nw-locate-sub">DMC {f.code} · {f.count} stitches</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`nw-locate-check${done ? ' is-done' : ''}`}
                        onClick={() => toggleDone(key)}
                        aria-label={done ? 'Mark not done' : 'Mark done'}
                        title={done ? 'Done' : 'Mark done'}
                      >
                        <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </li>
                  )
                })
              : areas.map((a) => {
                  const key = `r:${a.id}`
                  const done = Boolean(completedRegions[key])
                  const active = sel?.axis === 'r' && sel.id === a.id
                  return (
                    <li key={a.id} className="nw-locate-li">
                      <button
                        type="button"
                        className={`nw-locate-row${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                        onClick={() => selectArea(a.id)}
                      >
                        <span className="nw-locate-swatch" style={{ background: familySwatch(a.flossNumbers) }} />
                        <span className="nw-locate-body">
                          <span className="nw-locate-name">{a.label}</span>
                          <span className="nw-locate-sub">{a.flossNumbers.length} colours · {a.count} stitches</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`nw-locate-check${done ? ' is-done' : ''}`}
                        onClick={() => toggleDone(key)}
                        aria-label={done ? 'Mark not done' : 'Mark done'}
                        title={done ? 'Done' : 'Mark done'}
                      >
                        <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </li>
                  )
                })}
          </ul>
        </div>
      ) : (
        <div className="needlework-surface-annotations">
          <div className="needlework-surface-annotations-heading">Stitches</div>
          {annotations.length === 0 ? (
            <p style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--studio-ink-mute)' }}>
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
                      onClick={() => onRegionToggle?.(annotation.id, !isCompleted)}
                    >
                      <span className="needlework-surface-annotation-swatch" style={{ background: annotation.colourHex }} />
                      <div className="needlework-surface-annotation-body">
                        <div className="needlework-surface-annotation-stitch">{prettyStitch(annotation.stitchType)}</div>
                        <div className="needlework-surface-annotation-thread">{annotation.threadRef}</div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
