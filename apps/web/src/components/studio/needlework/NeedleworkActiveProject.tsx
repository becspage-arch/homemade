'use client'

/**
 * NeedleworkActiveProject — the active-project body.
 *
 * Routes to either the counted view (grid-based disciplines) or the surface
 * view (freehand disciplines) based on pattern.discipline. Manages autosave
 * for progress changes.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { isCountedDiscipline } from './types'
import { NeedleworkCountedView } from './NeedleworkCountedView'
import { NeedleworkSurfaceView } from './NeedleworkSurfaceView'
import type { NeedleworkPatternData, NeedleworkProjectProgressData } from './types'

interface NeedleworkActiveProjectProps {
  pattern: NeedleworkPatternData
  initialProgress: NeedleworkProjectProgressData | null
  notesOpen: boolean
  onClose: () => void
}

export function NeedleworkActiveProject({
  pattern,
  initialProgress,
  notesOpen,
  onClose,
}: NeedleworkActiveProjectProps) {
  const [progress, setProgress] = useState<NeedleworkProjectProgressData>(() => ({
    currentPhase: initialProgress?.currentPhase ?? 'STITCHING',
    completedCells: initialProgress?.completedCells ?? {},
    completedRegions: initialProgress?.completedRegions ?? {},
    notes: initialProgress?.notes ?? null,
    lastWorkedAt: initialProgress?.lastWorkedAt ?? new Date().toISOString(),
    completedAt: initialProgress?.completedAt ?? null,
  }))

  const [notes, setNotes] = useState(initialProgress?.notes ?? '')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCounted = isCountedDiscipline(pattern.discipline)

  const persist = useCallback(
    async (update: Partial<NeedleworkProjectProgressData>) => {
      try {
        await fetch(`/api/studio/needlework/progress/${pattern.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        })
      } catch {
        // Autosave failure is silent — the user hasn't lost anything yet.
      }
    },
    [pattern.id],
  )

  const handleCellsChange = useCallback(
    (completedCells: Record<string, true>) => {
      setProgress((prev) => {
        const next = { ...prev, completedCells }
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => persist({ completedCells }), 800)
        return next
      })
    },
    [persist],
  )

  const handleRegionToggle = useCallback(
    (regionId: string, completed: boolean) => {
      setProgress((prev) => {
        const completedRegions = { ...prev.completedRegions }
        if (completed) {
          completedRegions[regionId] = true
        } else {
          delete completedRegions[regionId]
        }
        const next = { ...prev, completedRegions }
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => persist({ completedRegions }), 400)
        return next
      })
    },
    [persist],
  )

  // Save notes on blur / debounce
  const handleNotesBlur = useCallback(() => {
    persist({ notes: notes || null })
  }, [notes, persist])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  return (
    <div className="needlework-studio-active-surface" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {isCounted ? (
        <NeedleworkCountedView
          pattern={pattern}
          progress={progress}
          notesOpen={notesOpen}
          onProgressChange={handleCellsChange}
        />
      ) : (
        <NeedleworkSurfaceView
          pattern={pattern}
          progress={progress}
          notesOpen={notesOpen}
          onRegionToggle={handleRegionToggle}
        />
      )}

      {notesOpen && (
        <div className="needlework-notes-panel">
          <textarea
            className="needlework-notes-textarea"
            placeholder="Notes for this project..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
          />
        </div>
      )}
    </div>
  )
}
