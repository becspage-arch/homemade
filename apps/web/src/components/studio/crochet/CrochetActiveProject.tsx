'use client'

/**
 * CrochetActiveProject — the working surface for one open pattern. Owns
 * the per-project state (current row, completed rows, notes, etc.) and
 * the autosave loop that reconciles to the API.
 *
 * The three view modes (Written / Chart / Schematic) read the same
 * project state. Marking row N complete from the written view is the
 * same call as marking round N complete from the chart view.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CrochetWrittenView } from './CrochetWrittenView'
import { CrochetChartView } from './CrochetChartView'
import { CrochetSchematicView } from './CrochetSchematicView'
import { CrochetNotesPanel } from './CrochetNotesPanel'
import type {
  CrochetPatternData,
  CrochetProjectProgressData,
  PatternRow,
  TerminologyMode,
  ViewMode,
} from './types'

interface Props {
  pattern: CrochetPatternData
  initialProgress: CrochetProjectProgressData | null
  viewMode: ViewMode
  terminology: TerminologyMode
  leftHanded: boolean
  notesOpen: boolean
}

const SAVE_DEBOUNCE_MS = 700

interface ProgressState {
  currentRow: number
  currentSection: string | null
  completedRows: Record<string, number[]>
  notes: string | null
  perRowNotes: Record<string, string>
  completedAt: string | null
}

export function CrochetActiveProject({
  pattern,
  initialProgress,
  viewMode,
  terminology,
  leftHanded,
  notesOpen,
}: Props) {
  const rows = useMemo<PatternRow[]>(() => normaliseRows(pattern.rowsStructured), [pattern])
  const sections = useMemo<string[]>(() => {
    const seen = new Set<string>()
    const order: string[] = []
    for (const row of rows) {
      if (!seen.has(row.section)) {
        seen.add(row.section)
        order.push(row.section)
      }
    }
    return order
  }, [rows])

  const [state, setState] = useState<ProgressState>(() => ({
    currentRow: initialProgress?.currentRow ?? 0,
    currentSection: initialProgress?.currentSection ?? sections[0] ?? null,
    completedRows: initialProgress?.completedRows ?? {},
    notes: initialProgress?.notes ?? null,
    perRowNotes: initialProgress?.perRowNotes ?? {},
    completedAt: initialProgress?.completedAt ?? null,
  }))

  // Debounced autosave. Mirrors the cross-stitch Studio progress
  // autosave shape — coalesce fast taps, write at most once per
  // SAVE_DEBOUNCE_MS.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingState = useRef<ProgressState | null>(null)
  const pendingPrefs = useRef<{
    preferredView?: ViewMode
    terminologyOverride?: TerminologyMode | null
    leftHandedOverride?: boolean | null
  }>({})

  const flush = useCallback(async () => {
    if (!pendingState.current && Object.keys(pendingPrefs.current).length === 0) return
    const body = {
      ...(pendingState.current ?? {}),
      ...pendingPrefs.current,
    }
    pendingState.current = null
    pendingPrefs.current = {}
    try {
      await fetch(`/api/studio/crochet/progress/${pattern.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {
      // Silent — next change retries.
    }
  }, [pattern.id])

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void flush()
    }, SAVE_DEBOUNCE_MS)
  }, [flush])

  useEffect(() => {
    return () => {
      // Best-effort flush on unmount; sendBeacon would be ideal but
      // not all the payload fits in form-encoding; settle for fetch.
      if (saveTimer.current) clearTimeout(saveTimer.current)
      void flush()
    }
  }, [flush])

  // Mark the current view as preferred (debounced).
  useEffect(() => {
    pendingPrefs.current.preferredView = viewMode
    scheduleSave()
  }, [viewMode, scheduleSave])

  useEffect(() => {
    pendingPrefs.current.terminologyOverride = terminology
    scheduleSave()
  }, [terminology, scheduleSave])

  useEffect(() => {
    pendingPrefs.current.leftHandedOverride = leftHanded
    scheduleSave()
  }, [leftHanded, scheduleSave])

  const markRowComplete = useCallback(
    (section: string, rowNumber: number) => {
      setState((prev) => {
        const sectionRows = new Set(prev.completedRows[section] ?? [])
        sectionRows.add(rowNumber)
        const completedRows = {
          ...prev.completedRows,
          [section]: Array.from(sectionRows).sort((a, b) => a - b),
        }
        // Advance current row to the next unmarked row in this section
        const sectionAllRows = rows
          .filter((r) => r.section === section)
          .map((r) => r.rowNumber)
        const next = sectionAllRows.find((rn) => !sectionRows.has(rn))
        const newState: ProgressState = {
          ...prev,
          completedRows,
          currentSection: section,
          currentRow: next ?? rowNumber,
        }
        pendingState.current = newState
        return newState
      })
      scheduleSave()
    },
    [rows, scheduleSave],
  )

  const unmarkRow = useCallback(
    (section: string, rowNumber: number) => {
      setState((prev) => {
        const sectionRows = new Set(prev.completedRows[section] ?? [])
        sectionRows.delete(rowNumber)
        const completedRows = {
          ...prev.completedRows,
          [section]: Array.from(sectionRows).sort((a, b) => a - b),
        }
        const newState: ProgressState = {
          ...prev,
          completedRows,
          currentRow: rowNumber,
          currentSection: section,
        }
        pendingState.current = newState
        return newState
      })
      scheduleSave()
    },
    [scheduleSave],
  )

  const frogToRow = useCallback(
    (section: string, rowNumber: number) => {
      setState((prev) => {
        const sectionRows = (prev.completedRows[section] ?? []).filter(
          (rn) => rn < rowNumber,
        )
        const completedRows = {
          ...prev.completedRows,
          [section]: sectionRows,
        }
        const newState: ProgressState = {
          ...prev,
          completedRows,
          currentRow: rowNumber,
          currentSection: section,
        }
        pendingState.current = newState
        return newState
      })
      scheduleSave()
    },
    [scheduleSave],
  )

  const setCurrentSection = useCallback(
    (section: string) => {
      setState((prev) => {
        const completed = new Set(prev.completedRows[section] ?? [])
        const sectionRows = rows
          .filter((r) => r.section === section)
          .map((r) => r.rowNumber)
        const next = sectionRows.find((rn) => !completed.has(rn))
        const newState: ProgressState = {
          ...prev,
          currentSection: section,
          currentRow: next ?? sectionRows[0] ?? 0,
        }
        pendingState.current = newState
        return newState
      })
      scheduleSave()
    },
    [rows, scheduleSave],
  )

  const updateNotes = useCallback(
    (notes: string) => {
      setState((prev) => {
        const newState = { ...prev, notes: notes || null }
        pendingState.current = newState
        return newState
      })
      scheduleSave()
    },
    [scheduleSave],
  )

  const updatePerRowNote = useCallback(
    (rowKey: string, note: string) => {
      setState((prev) => {
        const perRowNotes = { ...prev.perRowNotes }
        if (note) perRowNotes[rowKey] = note
        else delete perRowNotes[rowKey]
        const newState = { ...prev, perRowNotes }
        pendingState.current = newState
        return newState
      })
      scheduleSave()
    },
    [scheduleSave],
  )

  const totalRows = rows.length
  const completedCount = Object.values(state.completedRows).reduce(
    (sum, arr) => sum + arr.length,
    0,
  )

  return (
    <div className={`crochet-studio-active${notesOpen ? ' notes-open' : ''}`}>
      <div className="crochet-studio-active-main">
        {viewMode === 'written' && (
          <CrochetWrittenView
            rows={rows}
            sections={sections}
            terminology={terminology}
            completedRows={state.completedRows}
            currentSection={state.currentSection}
            currentRow={state.currentRow}
            perRowNotes={state.perRowNotes}
            onMarkComplete={markRowComplete}
            onUnmark={unmarkRow}
            onFrogToRow={frogToRow}
            onSetCurrentSection={setCurrentSection}
            onUpdatePerRowNote={updatePerRowNote}
          />
        )}
        {viewMode === 'chart' && (
          <CrochetChartView
            chartData={pattern.chartData}
            terminology={terminology}
            leftHanded={leftHanded}
            completedRows={state.completedRows}
            currentSection={state.currentSection}
            onMarkComplete={markRowComplete}
            onUnmark={unmarkRow}
          />
        )}
        {viewMode === 'schematic' && (
          <CrochetSchematicView
            schematicMediaId={pattern.schematicMediaId}
            sizesGraded={pattern.sizesGraded}
            gradedSize={initialProgress?.gradedSize ?? null}
            finishedSizeText={pattern.finishedSizeText}
          />
        )}
      </div>

      <footer className="crochet-studio-active-footer">
        <div className="crochet-studio-active-progress">
          <span className="crochet-studio-active-progress-label">
            {state.currentSection && sections.length > 1 ? `${state.currentSection} · ` : ''}
            {totalRows > 0 ? `${completedCount} of ${totalRows} rows` : 'No rows authored yet'}
          </span>
          {pattern.gaugeText && (
            <span className="crochet-studio-active-gauge">{pattern.gaugeText}</span>
          )}
        </div>
      </footer>

      {notesOpen && (
        <aside className="crochet-studio-notes-drawer">
          <CrochetNotesPanel notes={state.notes ?? ''} onChange={updateNotes} />
        </aside>
      )}
    </div>
  )
}

/**
 * Validates and normalises the rowsStructured JSON into the shape the
 * views consume. Tolerant of older or partial data.
 */
function normaliseRows(raw: unknown): PatternRow[] {
  if (!Array.isArray(raw)) return []
  const out: PatternRow[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const section = typeof row.section === 'string' && row.section ? row.section : 'Pattern'
    const rowNumber = typeof row.rowNumber === 'number' ? row.rowNumber : null
    const instruction = typeof row.instruction === 'string' ? row.instruction : ''
    if (rowNumber === null || !instruction) continue
    out.push({
      section,
      rowNumber,
      rowLabel: typeof row.rowLabel === 'string' ? row.rowLabel : undefined,
      instruction,
      stitchCount: typeof row.stitchCount === 'number' ? row.stitchCount : undefined,
      stitchCountAsCluster:
        typeof row.stitchCountAsCluster === 'number' ? row.stitchCountAsCluster : undefined,
      sizeVariants:
        row.sizeVariants && typeof row.sizeVariants === 'object'
          ? (row.sizeVariants as PatternRow['sizeVariants'])
          : undefined,
      isRoundNotRow: row.isRoundNotRow === true,
    })
  }
  return out
}
