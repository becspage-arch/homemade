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

import { useState, useCallback, useMemo } from 'react'
import type { NeedleworkPatternData, NeedleworkProjectProgressData, NeedleworkRegionAnnotation } from './types'

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

  const completedRegions = useMemo(() => progress?.completedRegions ?? {}, [progress])
  const annotations: NeedleworkRegionAnnotation[] = pattern.regionAnnotations ?? []
  const vectorData = pattern.vectorData

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
      <div className="needlework-surface-canvas-area">
        {vectorData ? (
          <div className="needlework-surface-svg-wrapper">
            {/* Render the SVG outline */}
            <div
              dangerouslySetInnerHTML={{ __html: vectorData.svgContent }}
              style={{ maxWidth: vectorData.width, width: '100%' }}
            />
          </div>
        ) : (
          <div style={{ padding: '2rem', color: 'var(--colour-text-muted)', fontSize: '0.875rem' }}>
            Design outline not available for this pattern. Follow the printed transfer sheet.
          </div>
        )}
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
                        {annotation.stitchType}
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
