'use client'

/**
 * KnittingActiveProject — the working surface for one open knitting
 * pattern. Owns the counters (row / round / repeat / stitch),
 * RS / WS toggle, completedRows, and cable-needle entries. Persists
 * progress via the /api/studio/knitting/progress route when the user
 * is signed in (server-side sync is a free-tier carrot per the
 * locked memory policy); the same shape persists to localStorage
 * for signed-out makers.
 *
 * v1 status note: server-side sync hits the same client persistence
 * shape; the underlying API persists per-user once the K-4
 * KnittingPattern model + KnittingProjectProgress migration land.
 * Until then the PATCH endpoint short-circuits to 204 No Content —
 * the Studio behaves as if sync succeeded so the maker isn't blocked.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ErrataLink } from '@/components/public/ugc/errata-link'

import { KnittingWrittenView } from './KnittingWrittenView'
import { KnittingChartViewport } from './KnittingChartViewport'
import { KnittingSchematicView } from './KnittingSchematicView'
import { KnittingCounterPanel } from './KnittingCounterPanel'
import { KnittingProjectSetupCard } from './KnittingProjectSetupCard'
import { KnittingYarnSubstitution } from './KnittingYarnSubstitution'
import type {
  CableNeedleEntry,
  KnittingPatternData,
  KnittingProjectProgressData,
  PatternRow,
  ProjectSetup,
  ViewMode,
} from './types'

interface Props {
  pattern: KnittingPatternData
  initialProgress: KnittingProjectProgressData | null
  viewMode: ViewMode
  substitutionOpen: boolean
  yarnWeights: Array<{ slug: string; canonicalName: string; standardCategory: number }>
  signedIn: boolean
  onClose?: () => void
}

const SAVE_DEBOUNCE_MS = 700

interface ProgressState {
  currentRow: number
  currentSection: string | null
  completedRows: Record<string, number[]>
  notes: string | null
  perRowNotes: Record<string, string>
  currentRound: number
  currentRepeat: number
  currentStitch: number
  rightSide: boolean
  cableNeedles: CableNeedleEntry[]
  completedAt: string | null
  projectSetup: ProjectSetup | null
}

function localStorageKey(patternId: string) {
  return `knitting-studio:progress:${patternId}`
}

export function KnittingActiveProject({
  pattern,
  initialProgress,
  viewMode,
  substitutionOpen,
  yarnWeights,
  signedIn,
}: Props) {
  const rows = useMemo<PatternRow[]>(() => pattern.rowsStructured, [pattern])
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

  const [state, setState] = useState<ProgressState>(() => loadInitialState(pattern, initialProgress, sections))

  const [setupSkipped, setSetupSkipped] = useState(false)
  const projectIsBlank =
    state.currentRow === 0 &&
    Object.keys(state.completedRows).length === 0 &&
    !state.completedAt
  const setupVisible = !state.projectSetup && projectIsBlank && !setupSkipped

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingState = useRef<ProgressState | null>(null)

  const flush = useCallback(async () => {
    if (!pendingState.current) return
    const snapshot = pendingState.current
    pendingState.current = null

    // Mirror progress to localStorage — works for signed-out makers
    // and acts as a local cache while server sync catches up.
    try {
      window.localStorage.setItem(localStorageKey(pattern.id), JSON.stringify(snapshot))
    } catch {
      // ignore
    }

    if (!signedIn) return
    try {
      await fetch(`/api/studio/knitting/progress/${pattern.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(snapshot),
      })
    } catch {
      // silent — next change retries
    }
  }, [pattern.id, signedIn])

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void flush()
    }, SAVE_DEBOUNCE_MS)
  }, [flush])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      void flush()
    }
  }, [flush])

  // ───── Counter logic ─────

  const advanceRow = useCallback(() => {
    setState((prev) => {
      const nextRow = prev.currentRow + 1
      const nextSide = !prev.rightSide
      const sectionRows = new Set(prev.completedRows[prev.currentSection ?? sections[0] ?? 'Pattern'] ?? [])
      sectionRows.add(prev.currentRow || 1)
      const completedRows = {
        ...prev.completedRows,
        [prev.currentSection ?? sections[0] ?? 'Pattern']: Array.from(sectionRows).sort((a, b) => a - b),
      }
      const next: ProgressState = {
        ...prev,
        currentRow: nextRow,
        rightSide: nextSide,
        currentStitch: 1,
        completedRows,
      }
      pendingState.current = next
      return next
    })
    scheduleSave()
  }, [scheduleSave, sections])

  const stepRowBack = useCallback(() => {
    setState((prev) => {
      const nextRow = Math.max(0, prev.currentRow - 1)
      const next: ProgressState = {
        ...prev,
        currentRow: nextRow,
        rightSide: !prev.rightSide,
        currentStitch: 1,
      }
      pendingState.current = next
      return next
    })
    scheduleSave()
  }, [scheduleSave])

  const advanceRound = useCallback(() => {
    setState((prev) => {
      const next: ProgressState = { ...prev, currentRound: prev.currentRound + 1 }
      pendingState.current = next
      return next
    })
    scheduleSave()
  }, [scheduleSave])

  const stepRoundBack = useCallback(() => {
    setState((prev) => {
      const next: ProgressState = {
        ...prev,
        currentRound: Math.max(0, prev.currentRound - 1),
      }
      pendingState.current = next
      return next
    })
    scheduleSave()
  }, [scheduleSave])

  const advanceRepeat = useCallback(() => {
    setState((prev) => {
      const next: ProgressState = { ...prev, currentRepeat: prev.currentRepeat + 1 }
      pendingState.current = next
      return next
    })
    scheduleSave()
  }, [scheduleSave])

  const stepRepeatBack = useCallback(() => {
    setState((prev) => {
      const next: ProgressState = {
        ...prev,
        currentRepeat: Math.max(0, prev.currentRepeat - 1),
      }
      pendingState.current = next
      return next
    })
    scheduleSave()
  }, [scheduleSave])

  const stepStitchForward = useCallback(() => {
    setState((prev) => {
      const next: ProgressState = { ...prev, currentStitch: prev.currentStitch + 1 }
      pendingState.current = next
      return next
    })
    scheduleSave()
  }, [scheduleSave])

  const stepStitchBack = useCallback(() => {
    setState((prev) => {
      const next: ProgressState = {
        ...prev,
        currentStitch: Math.max(1, prev.currentStitch - 1),
      }
      pendingState.current = next
      return next
    })
    scheduleSave()
  }, [scheduleSave])

  const markRowComplete = useCallback(
    (section: string, rowNumber: number) => {
      setState((prev) => {
        const sectionRows = new Set(prev.completedRows[section] ?? [])
        sectionRows.add(rowNumber)
        const completedRows = {
          ...prev.completedRows,
          [section]: Array.from(sectionRows).sort((a, b) => a - b),
        }
        const sectionAllRows = rows.filter((r) => r.section === section).map((r) => r.rowNumber)
        const next = sectionAllRows.find((rn) => !sectionRows.has(rn))
        const newState: ProgressState = {
          ...prev,
          completedRows,
          currentSection: section,
          currentRow: next ?? rowNumber,
          rightSide: prev.rightSide,
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

  const addCableNeedle = useCallback(
    (description: string, stitchCount: number, holdInFront: boolean) => {
      setState((prev) => {
        const entry: CableNeedleEntry = {
          id: `cn-${prev.cableNeedles.length + 1}-${prev.currentRow}`,
          description,
          stitchCount,
          holdInFront,
          addedAt: new Date().toISOString(),
        }
        const next: ProgressState = {
          ...prev,
          cableNeedles: [...prev.cableNeedles, entry],
        }
        pendingState.current = next
        return next
      })
      scheduleSave()
    },
    [scheduleSave],
  )

  const clearCableNeedle = useCallback(
    (id: string) => {
      setState((prev) => {
        const next: ProgressState = {
          ...prev,
          cableNeedles: prev.cableNeedles.filter((c) => c.id !== id),
        }
        pendingState.current = next
        return next
      })
      scheduleSave()
    },
    [scheduleSave],
  )

  const saveProjectSetup = useCallback(
    (setup: ProjectSetup) => {
      setState((prev) => {
        const newState = { ...prev, projectSetup: setup }
        pendingState.current = newState
        return newState
      })
      scheduleSave()
    },
    [scheduleSave],
  )

  // ───── Keyboard shortcuts (Spacebar / Right Arrow advance row; Left
  // Arrow back; Shift+Right step stitch) ─────

  useEffect(() => {
    if (setupVisible) return
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      // Ignore when typing into inputs.
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        advanceRow()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (e.shiftKey) stepStitchForward()
        else advanceRow()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (e.shiftKey) stepStitchBack()
        else stepRowBack()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advanceRow, stepRowBack, stepStitchForward, stepStitchBack, setupVisible])

  // ───── Render ─────

  const totalRows = rows.length
  const completedCount = Object.values(state.completedRows).reduce(
    (sum, arr) => sum + arr.length,
    0,
  )

  if (setupVisible) {
    return (
      <div className="knitting-studio-active">
        <div className="knitting-studio-active-main">
          <KnittingProjectSetupCard
            patternName={pattern.name}
            suggestedYarnWeight={pattern.primaryYarnWeightName}
            suggestedNeedleMm={pattern.primaryNeedleMm}
            patternGaugeText={pattern.gaugeText}
            patternConstruction={pattern.construction}
            patternCastOn={pattern.castOnMethod}
            initial={state.projectSetup}
            yarnWeights={yarnWeights}
            onSave={saveProjectSetup}
            onSkip={() => setSetupSkipped(true)}
          />
        </div>
      </div>
    )
  }

  const repeatGroup = pattern.repeatRowGroups?.[0] ?? null
  const totalRowsInRepeat = repeatGroup
    ? repeatGroup.endRow - repeatGroup.startRow + 1
    : null

  return (
    <div className="knitting-studio-active">
      <div className="knitting-studio-active-main">
        {substitutionOpen && (
          <KnittingYarnSubstitution
            yarnWeights={yarnWeights}
            patternYarnCategory={pattern.primaryYarnWeightCategory}
            patternTotalYardage={
              pattern.yardageBySize
                ? Object.values(pattern.yardageBySize)[0] ?? null
                : null
            }
          />
        )}

        {viewMode === 'written' && (
          <KnittingWrittenView
            rows={rows}
            sections={sections}
            construction={pattern.construction}
            patternName={pattern.name}
            completedRows={state.completedRows}
            currentSection={state.currentSection}
            currentRow={state.currentRow}
            onMarkComplete={markRowComplete}
            onUnmark={unmarkRow}
          />
        )}
        {viewMode === 'chart' && (
          <KnittingChartViewport
            chartData={pattern.chartData}
            currentRow={state.currentRow}
            rightSide={state.rightSide}
            isFlatKnitting={pattern.construction === 'FLAT'}
          />
        )}
        {viewMode === 'schematic' && (
          <KnittingSchematicView
            schematicMediaId={pattern.schematicMediaId}
            sizesGraded={pattern.sizesGraded}
            gradedSize={null}
            finishedSizeText={pattern.finishedSizeText}
            projectShape={pattern.projectShape}
            needleBySection={pattern.needleBySection}
            shawlStyle={pattern.shawlStyle}
          />
        )}

        <KnittingCounterPanel
          construction={pattern.construction}
          rowNumber={state.currentRow}
          roundNumber={state.currentRound}
          repeatNumber={state.currentRepeat}
          stitchNumber={state.currentStitch}
          rightSide={state.rightSide}
          totalRowsInRepeat={totalRowsInRepeat}
          cableNeedles={state.cableNeedles}
          onAdvanceRow={advanceRow}
          onStepRowBack={stepRowBack}
          onAdvanceRound={advanceRound}
          onStepRoundBack={stepRoundBack}
          onAdvanceRepeat={advanceRepeat}
          onStepRepeatBack={stepRepeatBack}
          onStepStitchForward={stepStitchForward}
          onStepStitchBack={stepStitchBack}
          onAddCableNeedle={addCableNeedle}
          onClearCableNeedle={clearCableNeedle}
        />
      </div>

      <footer className="knitting-studio-active-footer">
        <div className="knitting-studio-active-progress">
          <span className="knitting-studio-active-progress-label">
            {state.currentSection && sections.length > 1 ? `${state.currentSection} · ` : ''}
            {totalRows > 0 ? `${completedCount} of ${totalRows} rows` : 'No rows authored yet'}
          </span>
          {pattern.gaugeText && (
            <span className="knitting-studio-active-progress-label">
              Gauge: {pattern.gaugeText}
            </span>
          )}
        </div>
        <div className="knitting-studio-active-footer-actions">
          {pattern.sourceTutorialId && (
            <div className="knitting-studio-active-errata">
              <ErrataLink tutorialId={pattern.sourceTutorialId} />
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}

function loadInitialState(
  pattern: KnittingPatternData,
  initialProgress: KnittingProjectProgressData | null,
  sections: string[],
): ProgressState {
  // Fall back to localStorage on the client so signed-out makers
  // pick up where they left off. SSR pass always uses server data
  // (initialProgress).
  let stored: ProgressState | null = null
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(localStorageKey(pattern.id))
      if (raw) stored = JSON.parse(raw) as ProgressState
    } catch {
      stored = null
    }
  }

  const source = initialProgress ?? stored

  return {
    currentRow: source?.currentRow ?? 0,
    currentSection:
      (source as KnittingProjectProgressData | null)?.currentSection ??
      sections[0] ??
      null,
    completedRows: source?.completedRows ?? {},
    notes: source?.notes ?? null,
    perRowNotes: source?.perRowNotes ?? {},
    currentRound: (source as ProgressState | null)?.currentRound ?? 0,
    currentRepeat: (source as ProgressState | null)?.currentRepeat ?? 0,
    currentStitch: (source as ProgressState | null)?.currentStitch ?? 1,
    rightSide: (source as ProgressState | null)?.rightSide ?? true,
    cableNeedles: (source as ProgressState | null)?.cableNeedles ?? [],
    completedAt: source?.completedAt ?? null,
    projectSetup: (source as KnittingProjectProgressData | null)?.projectSetup ?? null,
  }
}
