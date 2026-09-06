'use client'

/**
 * Debounced autosave hook. Watches the chart store for `dirty` /
 * `progressDirty` flags and posts to the right endpoint:
 *
 *   - Logged-in owner of the pattern  → PATCH /api/studio/patterns/[id]
 *   - Logged-in viewer of a library   → POST  /api/studio/patterns/[id]/fork
 *                                         on first edit, then PATCH the fork
 *   - Logged-in, mark-stitched only   → PATCH /api/studio/patterns/[id]/progress
 *   - Logged-out                      → IndexedDB only (handled by use-local-progress)
 *
 * Debounce: 500ms for edits, 2000ms for progress-only (mark-stitched).
 * The shorter edit debounce keeps the undo stack from racing ahead of
 * the server view; the longer progress debounce keeps the network quiet
 * when someone fast-clicks through 50 cells in 10 seconds.
 *
 * Parking preferences (mode, working direction, current line) ride the
 * progress save. They change on the same beat as progress and belong to
 * the same per-project record, so folding them in keeps one write where
 * two would otherwise race each other.
 */

import { useEffect, useRef } from 'react'
import { useChartStore } from '../chart/chart-store'
import { putLocalProgress, putLocalPattern } from './local-progress'

interface AutosaveOptions {
  patternId: string | null
  ownerUserId: string | null
  signedIn: boolean
  onForked: (newId: string) => void
}

const EDIT_DEBOUNCE_MS = 500
const PROGRESS_DEBOUNCE_MS = 2000

export function useStudioAutosave({ patternId, ownerUserId, signedIn, onForked }: AutosaveOptions) {
  const editTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasForked = useRef(false)

  useEffect(() => {
    if (!patternId) return
    const unsub = useChartStore.subscribe((state, prev) => {
      // Pattern edit just landed?
      if (state.dirty && !prev.dirty) {
        if (editTimer.current) clearTimeout(editTimer.current)
        editTimer.current = setTimeout(async () => {
          const s = useChartStore.getState()
          if (!s.pattern) return

          // Silent fork: signed-in viewer of a library pattern → fork on
          // first edit, swap URL, then resume normal autosave under the
          // new id.
          if (signedIn && ownerUserId === null && !hasForked.current) {
            hasForked.current = true
            const res = await fetch(`/api/studio/patterns/${patternId}/fork`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ data: s.pattern }),
            })
            if (res.ok) {
              const body = await res.json()
              onForked(body.id)
              useChartStore.getState().clearDirty()
            } else {
              hasForked.current = false
            }
            return
          }

          if (signedIn && ownerUserId) {
            await fetch(`/api/studio/patterns/${patternId}`, {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ data: s.pattern }),
            })
            useChartStore.getState().clearDirty()
            return
          }

          // Logged-out — IndexedDB only.
          await putLocalPattern(patternId, s.pattern)
          useChartStore.getState().clearDirty()
        }, EDIT_DEBOUNCE_MS)
      }

      // Mark-stitched moved, or a parking preference changed?
      const progressMoved = state.progressDirty && !prev.progressDirty
      const parkingMoved = state.parkingDirty && !prev.parkingDirty
      if (progressMoved || parkingMoved) {
        if (progressTimer.current) clearTimeout(progressTimer.current)
        progressTimer.current = setTimeout(async () => {
          const s = useChartStore.getState()
          const obj: Record<string, true> = {}
          for (const k of s.stitchedCells) obj[k] = true
          const parking = {
            enabled: s.parkingEnabled,
            direction: s.parkingDirection,
            line: s.parkingLine,
          }
          if (signedIn && ownerUserId) {
            await fetch(`/api/studio/patterns/${patternId}/progress`, {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ stitchedCells: obj, parking }),
            })
            useChartStore.getState().clearProgressDirty()
            useChartStore.getState().clearParkingDirty()
            return
          }
          await putLocalProgress(patternId, obj, parking)
          useChartStore.getState().clearProgressDirty()
          useChartStore.getState().clearParkingDirty()
        }, PROGRESS_DEBOUNCE_MS)
      }
    })

    return () => {
      unsub()
      if (editTimer.current) clearTimeout(editTimer.current)
      if (progressTimer.current) clearTimeout(progressTimer.current)
    }
  }, [patternId, ownerUserId, signedIn, onForked])
}
