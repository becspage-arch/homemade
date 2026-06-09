'use client'

/**
 * NeedleworkCountedView — the grid-based view for counted-thread disciplines.
 *
 * Wraps ChartViewport in view-only / mark-stitched mode, identical to the
 * cross-stitch Studio's active-pattern view but adapted for needlework
 * discipline metadata.
 *
 * Discipline-specific overlays:
 *   - HARDANGER: a notice reminding the user not to cut until Kloster
 *     blocks are complete. Passive — no validation yet.
 *   - SASHIKO: cultural attribution line if the pattern has one.
 *   - BLACKWORK / NEEDLEPOINT: no extra overlay in v1.
 */

import { useState, useCallback, useMemo } from 'react'
import { parsePatternData } from '@homemade/db/pattern'
import { ChartViewport } from '@/components/studio/chart/ChartViewport'
import type { NeedleworkPatternData, NeedleworkProjectProgressData } from './types'

interface NeedleworkCountedViewProps {
  pattern: NeedleworkPatternData
  progress: NeedleworkProjectProgressData | null
  notesOpen: boolean
  onProgressChange?: (completedCells: Record<string, true>) => void
}

export function NeedleworkCountedView({
  pattern,
  progress,
  notesOpen,
  onProgressChange,
}: NeedleworkCountedViewProps) {
  const parsedPattern = useMemo(() => {
    if (!pattern.gridData) return null
    try {
      return parsePatternData(pattern.gridData)
    } catch {
      return null
    }
  }, [pattern.gridData])

  const initialStitched = useMemo<Set<string>>(
    () => new Set(Object.keys(progress?.completedCells ?? {})),
    [progress],
  )

  const totalCells = parsedPattern?.grid?.cells?.length ?? 0
  const completedCount = Object.keys(progress?.completedCells ?? {}).length
  const progressPct = totalCells > 0 ? Math.round((completedCount / totalCells) * 100) : 0

  const isHardanger = pattern.discipline === 'HARDANGER'
  const hasCulturalAttribution =
    pattern.discipline === 'SASHIKO' && pattern.culturalAttribution

  const fabricSpec = pattern.fabricSpec as { weaveCount?: number; countUnit?: string; fabric?: string } | null

  return (
    <div className="needlework-grid-view">
      <div className="needlework-grid-info-bar">
        <span>
          <strong>{completedCount}</strong> of <strong>{totalCells}</strong> stitches
        </span>
        <div className="needlework-progress-bar-track">
          <div
            className="needlework-progress-bar-fill"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span>{progressPct}%</span>
        {fabricSpec?.weaveCount && (
          <span style={{ marginLeft: 'auto' }}>
            {fabricSpec.weaveCount}-count{fabricSpec.fabric ? ` ${fabricSpec.fabric}` : ''}
          </span>
        )}
      </div>

      {isHardanger && (
        <div className="needlework-hardanger-notice">
          <strong>Hardanger reminder:</strong> Complete all Kloster blocks before making any cuts.
          The cut lines are valid only once every surrounding block is stitched.
        </div>
      )}

      {hasCulturalAttribution && (
        <div className="needlework-cultural-notice">
          {pattern.culturalAttribution}
        </div>
      )}

      {parsedPattern ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChartViewport
            pattern={parsedPattern}
            mode="view"
            initialStitched={initialStitched}
          />
        </div>
      ) : (
        <div style={{ padding: '2rem', color: 'var(--colour-text-muted)', flex: 1 }}>
          <p>This pattern has no chart data. Open the tutorial to follow written instructions.</p>
        </div>
      )}
    </div>
  )
}
