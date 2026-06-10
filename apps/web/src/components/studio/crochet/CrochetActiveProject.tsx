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

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAutosave } from '@/lib/studio/use-autosave'

import { CrochetWrittenView } from './CrochetWrittenView'
import { CrochetChartView } from './CrochetChartView'
import { CrochetSchematicView } from './CrochetSchematicView'
import { CrochetNotesPanel } from './CrochetNotesPanel'
import { CrochetStitchHelpPanel } from './CrochetStitchHelpPanel'
import { CrochetProjectSetupCard } from './CrochetProjectSetupCard'
import { CrochetExtrasDrawer } from './CrochetExtrasDrawer'
import { CrochetSubstitutionBanner } from './CrochetSubstitutionBanner'
import { ErrataLink } from '@/components/public/ugc/errata-link'
import type {
  CrochetPatternData,
  CrochetProjectProgressData,
  PatternRow,
  ProjectSetup,
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
  yarnWeights: Array<{ slug: string; canonicalName: string; standardCategory: number }>
  onClose: () => void
}

const SAVE_DEBOUNCE_MS = 700

interface ProgressState {
  currentRow: number
  currentSection: string | null
  completedRows: Record<string, number[]>
  notes: string | null
  perRowNotes: Record<string, string>
  completedAt: string | null
  projectSetup: ProjectSetup | null
}

export function CrochetActiveProject({
  pattern,
  initialProgress,
  viewMode,
  terminology,
  leftHanded,
  notesOpen,
  yarnWeights,
  onClose,
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
    projectSetup: initialProgress?.projectSetup ?? null,
  }))
  // Setup card visible once at project start. Skipping hides it for
  // this session; opening Studio fresh later will prompt again until
  // the user fills it in.
  const [setupSkipped, setSetupSkipped] = useState(false)
  const projectIsBlank =
    state.currentRow === 0 &&
    Object.keys(state.completedRows).length === 0 &&
    !state.completedAt
  const setupVisible = !state.projectSetup && projectIsBlank && !setupSkipped

  type CrochetPrefs = {
    preferredView?: ViewMode
    terminologyOverride?: TerminologyMode | null
    leftHandedOverride?: boolean | null
  }

  const { pendingState, pendingPrefs, scheduleSave } = useAutosave<ProgressState, CrochetPrefs>({
    url: `/api/studio/crochet/progress/${pattern.id}`,
    debounceMs: SAVE_DEBOUNCE_MS,
  })

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

  const markProjectComplete = useCallback(() => {
    setState((prev) => {
      const newState = { ...prev, completedAt: new Date().toISOString() }
      pendingState.current = newState
      return newState
    })
    scheduleSave()
  }, [scheduleSave])

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

  const totalRows = rows.length
  const completedCount = Object.values(state.completedRows).reduce(
    (sum, arr) => sum + arr.length,
    0,
  )

  if (setupVisible) {
    return (
      <div className="crochet-studio-active">
        <div className="crochet-studio-active-main">
          <CrochetProjectSetupCard
            patternName={pattern.name}
            suggestedYarnWeight={pattern.primaryYarnWeightName}
            suggestedHookMm={pattern.primaryHookMm}
            patternGaugeText={pattern.gaugeText}
            initial={state.projectSetup}
            yarnWeights={yarnWeights}
            onSave={saveProjectSetup}
            onSkip={() => setSetupSkipped(true)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`crochet-studio-active${notesOpen ? ' notes-open' : ''}`}>
      <div className="crochet-studio-active-main">
        {viewMode === 'written' && (
          <CrochetWrittenView
            rows={rows}
            sections={sections}
            terminology={terminology}
            sourceTerminology={pattern.terminologyConvention === 'us' ? 'us' : 'uk'}
            patternName={pattern.name}
            completedRows={state.completedRows}
            currentSection={state.currentSection}
            currentRow={state.currentRow}
            perRowNotes={state.perRowNotes}
            countByCluster={initialProgress?.countByCluster ?? false}
            onMarkComplete={markRowComplete}
            onUnmark={unmarkRow}
            onFrogToRow={frogToRow}
            onSetCurrentSection={setCurrentSection}
            onUpdatePerRowNote={updatePerRowNote}
            onMarkProjectComplete={markProjectComplete}
            onClose={onClose}
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
          {state.projectSetup ? (
            <>
              <ProjectSetupReadout setup={state.projectSetup} />
              <CrochetSubstitutionBanner
                inputs={{
                  patternYarnCategory: pattern.primaryYarnWeightCategory,
                  patternHookMm: pattern.primaryHookMm,
                  userYarnCategory: lookupYarnCategory(
                    state.projectSetup.yarn?.weightSlug,
                    yarnWeights,
                  ),
                  userHookMm: state.projectSetup.hook?.mmSize ?? null,
                }}
              />
            </>
          ) : pattern.gaugeText ? (
            <span className="crochet-studio-active-gauge">{pattern.gaugeText}</span>
          ) : null}
        </div>
        <div className="crochet-studio-active-footer-actions">
          <CrochetExtrasDrawer
            crochetPatternId={pattern.id}
            sections={sections}
            projectSetup={state.projectSetup}
          />
          <CrochetStitchHelpPanel craftStitchSlugs={pattern.craftStitchSlugs} />
          {pattern.sourceTutorialId && (
            <div className="crochet-studio-active-errata">
              <ErrataLink tutorialId={pattern.sourceTutorialId} />
            </div>
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
function lookupYarnCategory(
  weightSlug: string | undefined,
  yarnWeights: Array<{ slug: string; standardCategory: number }>,
): number | null {
  if (!weightSlug) return null
  const match = yarnWeights.find((w) => w.slug === weightSlug)
  return match?.standardCategory ?? null
}

function ProjectSetupReadout({ setup }: { setup: ProjectSetup }) {
  const yarn = setup.yarn
  const hook = setup.hook
  const swatch = setup.swatch
  const parts: string[] = []
  if (yarn?.label) parts.push(`${yarn.colourName ? `${yarn.colourName} ` : ''}${yarn.label}`)
  if (hook?.mmSize) parts.push(`${hook.mmSize} mm hook`)
  if (swatch?.stitchesPer10cm) parts.push(`${swatch.stitchesPer10cm} sts / 10 cm`)
  if (parts.length === 0) return null
  return (
    <span className="crochet-studio-active-setup-readout">
      {yarn?.colourHex && (
        <span
          className="crochet-studio-active-setup-pip"
          style={{ background: yarn.colourHex }}
          aria-hidden
        />
      )}
      <span>{parts.join(' · ')}</span>
    </span>
  )
}

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
      colourLabel: typeof row.colourLabel === 'string' ? row.colourLabel : undefined,
      colourHex: typeof row.colourHex === 'string' ? row.colourHex : null,
      referencePhotoMediaId:
        typeof row.referencePhotoMediaId === 'string' ? row.referencePhotoMediaId : null,
      helpNote: typeof row.helpNote === 'string' ? row.helpNote : undefined,
      helpTroubleshooterTutorialSlug:
        typeof row.helpTroubleshooterTutorialSlug === 'string'
          ? row.helpTroubleshooterTutorialSlug
          : undefined,
    })
  }
  return out
}
