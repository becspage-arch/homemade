'use client'

/**
 * CrochetWrittenView — the row-by-row written instructions surface.
 *
 *   - Each row is a tap-to-mark target. Tap the row body to mark complete
 *     and auto-advance to the next row. Tap the row number to make a
 *     row the current row without marking it.
 *   - The current row is highlighted (sage band).
 *   - Completed rows soft-grey with a checkmark.
 *   - Long-press / right-click a row to reveal "Frog to here" and "Add note".
 *
 * Sections (Body, Head, Arms, etc.) collapse into headers — the active
 * section auto-scrolls to centre the current row.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Undo2, MessageSquarePlus } from 'lucide-react'

import { applyTerminology } from './terminology'
import type { PatternRow, TerminologyMode } from './types'

interface Props {
  rows: PatternRow[]
  sections: string[]
  terminology: TerminologyMode
  completedRows: Record<string, number[]>
  currentSection: string | null
  currentRow: number
  perRowNotes: Record<string, string>
  onMarkComplete: (section: string, rowNumber: number) => void
  onUnmark: (section: string, rowNumber: number) => void
  onFrogToRow: (section: string, rowNumber: number) => void
  onSetCurrentSection: (section: string) => void
  onUpdatePerRowNote: (rowKey: string, note: string) => void
}

export function CrochetWrittenView({
  rows,
  sections,
  terminology,
  completedRows,
  currentSection,
  currentRow,
  perRowNotes,
  onMarkComplete,
  onUnmark,
  onFrogToRow,
  onSetCurrentSection,
  onUpdatePerRowNote,
}: Props) {
  const [openNoteRowKey, setOpenNoteRowKey] = useState<string | null>(null)
  const currentRowRef = useRef<HTMLLIElement | null>(null)

  // Group rows by section for rendering. Order preserved from the
  // sections array (which itself preserves the rowsStructured order).
  const grouped = useMemo(() => {
    const map = new Map<string, PatternRow[]>()
    for (const section of sections) map.set(section, [])
    for (const row of rows) {
      const list = map.get(row.section)
      if (list) list.push(row)
    }
    return map
  }, [rows, sections])

  useEffect(() => {
    if (currentRowRef.current) {
      currentRowRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [currentRow, currentSection])

  const rowKey = useCallback((section: string, rowNumber: number) => `${section}:${rowNumber}`, [])

  const handleRowToggle = useCallback(
    (section: string, rowNumber: number) => {
      const isComplete = (completedRows[section] ?? []).includes(rowNumber)
      if (isComplete) onUnmark(section, rowNumber)
      else onMarkComplete(section, rowNumber)
    },
    [completedRows, onMarkComplete, onUnmark],
  )

  return (
    <div className="crochet-studio-written">
      {sections.length > 1 && (
        <nav className="crochet-studio-written-section-nav" aria-label="Sections">
          {sections.map((section) => {
            const sectionCompleted = (completedRows[section] ?? []).length
            const sectionTotal = grouped.get(section)?.length ?? 0
            return (
              <button
                key={section}
                type="button"
                className={`crochet-studio-written-section-tab${section === currentSection ? ' is-active' : ''}`}
                onClick={() => onSetCurrentSection(section)}
              >
                <span className="crochet-studio-written-section-name">{section}</span>
                <span className="crochet-studio-written-section-count">
                  {sectionCompleted} / {sectionTotal}
                </span>
              </button>
            )
          })}
        </nav>
      )}

      {sections.map((section) => {
        const sectionRows = grouped.get(section) ?? []
        const sectionCompletedSet = new Set(completedRows[section] ?? [])
        if (sectionRows.length === 0) return null
        return (
          <section key={section} className="crochet-studio-written-section">
            {sections.length > 1 && (
              <h2 className="crochet-studio-written-section-heading">{section}</h2>
            )}
            <ol className="crochet-studio-written-list">
              {sectionRows.map((row) => {
                const key = rowKey(section, row.rowNumber)
                const isComplete = sectionCompletedSet.has(row.rowNumber)
                const isCurrent = section === currentSection && row.rowNumber === currentRow
                const note = perRowNotes[key] ?? ''
                const noteOpen = openNoteRowKey === key
                const label =
                  row.rowLabel ?? (row.isRoundNotRow ? `Round ${row.rowNumber}` : `Row ${row.rowNumber}`)
                return (
                  <li
                    key={key}
                    ref={isCurrent ? currentRowRef : null}
                    className={[
                      'crochet-studio-written-row',
                      isComplete ? 'is-complete' : '',
                      isCurrent ? 'is-current' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className="crochet-studio-written-row-mark"
                      aria-label={isComplete ? 'Mark row not done' : 'Mark row complete'}
                      onClick={() => handleRowToggle(section, row.rowNumber)}
                    >
                      <Check size={14} strokeWidth={2} aria-hidden />
                    </button>

                    <div className="crochet-studio-written-row-body">
                      <span className="crochet-studio-written-row-label">{label}.</span>{' '}
                      <span className="crochet-studio-written-row-instruction">
                        {applyTerminology(row.instruction, terminology)}
                      </span>
                      {(row.stitchCount !== undefined || row.stitchCountAsCluster !== undefined) && (
                        <span className="crochet-studio-written-row-count">
                          {' ('}
                          {row.stitchCount !== undefined ? `${row.stitchCount} sts` : ''}
                          {row.stitchCount !== undefined && row.stitchCountAsCluster !== undefined ? ', ' : ''}
                          {row.stitchCountAsCluster !== undefined
                            ? `${row.stitchCountAsCluster} clusters`
                            : ''}
                          {')'}
                        </span>
                      )}
                      {note && !noteOpen && (
                        <p className="crochet-studio-written-row-note-preview">{note}</p>
                      )}
                      {noteOpen && (
                        <PerRowNoteEditor
                          initial={note}
                          onSave={(value) => {
                            onUpdatePerRowNote(key, value)
                            setOpenNoteRowKey(null)
                          }}
                          onCancel={() => setOpenNoteRowKey(null)}
                        />
                      )}
                    </div>

                    <div className="crochet-studio-written-row-actions">
                      <button
                        type="button"
                        className="crochet-studio-written-row-action"
                        title="Add or edit a note for this row"
                        onClick={() => setOpenNoteRowKey(noteOpen ? null : key)}
                      >
                        <MessageSquarePlus size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        className="crochet-studio-written-row-action"
                        title="Frog back to this row (clear everything after)"
                        onClick={() => onFrogToRow(section, row.rowNumber)}
                      >
                        <Undo2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}

      {rows.length === 0 && (
        <p className="crochet-studio-written-empty">
          This pattern has no row-by-row instructions yet. Switch to the chart view if a chart is
          available, or open the source tutorial for the prose.
        </p>
      )}
    </div>
  )
}

function PerRowNoteEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string
  onSave: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <div className="crochet-studio-written-row-note-editor">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What did you change, where did you mark a stitch, what went wrong?"
        rows={3}
        autoFocus
      />
      <div className="crochet-studio-written-row-note-actions">
        <button type="button" onClick={() => onSave(value.trim())} className="primary">
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
