'use client'

/**
 * CrochetWrittenView — the row-by-row written instructions surface.
 *
 * For each row:
 *   - Tap-to-mark target with a current-row sage band.
 *   - Completed rows soft-grey with a checkmark.
 *   - Long-press / right-click reveals "Frog to here" and "Add note".
 *   - Inline stitch tokens (ch, tr, sl st, MR) are tappable to open a
 *     popover with the canonical name + a "Learn this stitch" link.
 *   - Colour pip beside the row label when the row declares a colour.
 *   - Help note panel beside the row when authoring provides one
 *     (e.g. round 1's magic ring tip).
 *   - Reference photo beneath the row when one is attached.
 *   - Current row gets a +/- mid-row counter when stitchCount is known.
 *
 * Sections (Body, Head, Arms, etc.) auto-scroll to centre the current
 * row in view.
 *
 * When every row in every section is complete the surface flips to
 * the CompletionCard.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Undo2, MessageSquarePlus, Calculator, BookOpen, X } from 'lucide-react'

import { tokeniseInstruction, type InstructionToken } from './stitch-tokens'
import { InlineStitchToken } from './InlineStitchToken'
import { CrochetMidRowCounter } from './CrochetMidRowCounter'
import { CrochetCompletionCard } from './CrochetCompletionCard'
import type { PatternRow, TerminologyMode } from './types'

interface Props {
  rows: PatternRow[]
  sections: string[]
  terminology: TerminologyMode
  sourceTerminology: TerminologyMode
  patternName: string
  completedRows: Record<string, number[]>
  currentSection: string | null
  currentRow: number
  perRowNotes: Record<string, string>
  countByCluster: boolean
  onMarkComplete: (section: string, rowNumber: number) => void
  onUnmark: (section: string, rowNumber: number) => void
  onFrogToRow: (section: string, rowNumber: number) => void
  onSetCurrentSection: (section: string) => void
  onUpdatePerRowNote: (rowKey: string, note: string) => void
  onMarkProjectComplete: () => void
  onClose: () => void
}

export function CrochetWrittenView({
  rows,
  sections,
  terminology,
  sourceTerminology,
  patternName,
  completedRows,
  currentSection,
  currentRow,
  perRowNotes,
  countByCluster,
  onMarkComplete,
  onUnmark,
  onFrogToRow,
  onSetCurrentSection,
  onUpdatePerRowNote,
  onMarkProjectComplete,
  onClose,
}: Props) {
  const [openNoteRowKey, setOpenNoteRowKey] = useState<string | null>(null)
  const [openCounterRowKey, setOpenCounterRowKey] = useState<string | null>(null)
  const currentRowRef = useRef<HTMLLIElement | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, PatternRow[]>()
    for (const section of sections) map.set(section, [])
    for (const row of rows) {
      const list = map.get(row.section)
      if (list) list.push(row)
    }
    return map
  }, [rows, sections])

  const totalRows = rows.length
  const completedCount = Object.values(completedRows).reduce((sum, arr) => sum + arr.length, 0)
  const allComplete = totalRows > 0 && completedCount >= totalRows

  useEffect(() => {
    if (allComplete) return
    if (currentRowRef.current) {
      currentRowRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [currentRow, currentSection, allComplete])

  const rowKey = useCallback((section: string, rowNumber: number) => `${section}:${rowNumber}`, [])

  const handleRowToggle = useCallback(
    (section: string, rowNumber: number) => {
      const isComplete = (completedRows[section] ?? []).includes(rowNumber)
      if (isComplete) onUnmark(section, rowNumber)
      else onMarkComplete(section, rowNumber)
    },
    [completedRows, onMarkComplete, onUnmark],
  )

  if (allComplete) {
    return (
      <CrochetCompletionCard
        patternName={patternName}
        totalRows={totalRows}
        onMarkComplete={onMarkProjectComplete}
        onClose={onClose}
      />
    )
  }

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
                const counterOpen = openCounterRowKey === key
                const label =
                  row.rowLabel ?? (row.isRoundNotRow ? `Round ${row.rowNumber}` : `Row ${row.rowNumber}`)

                const tokens = tokeniseInstruction(row.instruction, sourceTerminology, terminology)

                const counterAvailable =
                  isCurrent &&
                  ((countByCluster && row.stitchCountAsCluster !== undefined) ||
                    (!countByCluster && row.stitchCount !== undefined))
                const counterTarget = countByCluster
                  ? row.stitchCountAsCluster ?? 0
                  : row.stitchCount ?? 0
                const counterUnit: 'sts' | 'clusters' = countByCluster ? 'clusters' : 'sts'

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
                      <div className="crochet-studio-written-row-headline">
                        {row.colourLabel && (
                          <ColourPip label={row.colourLabel} hex={row.colourHex} />
                        )}
                        <span className="crochet-studio-written-row-label">{label}.</span>
                      </div>

                      <p className="crochet-studio-written-row-instruction">
                        {renderInstructionTokens(tokens)}
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
                      </p>

                      {row.helpNote && (
                        <aside className="crochet-studio-written-row-help">
                          <p className="crochet-studio-written-row-help-text">{row.helpNote}</p>
                          {row.helpTroubleshooterTutorialSlug && (
                            <a
                              className="crochet-studio-written-row-help-link"
                              href={`/crochet/${row.helpTroubleshooterTutorialSlug}#common-mistakes`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <BookOpen size={12} strokeWidth={1.6} />
                              See troubleshooting
                            </a>
                          )}
                        </aside>
                      )}

                      {counterOpen && counterAvailable && (
                        <CrochetMidRowCounter
                          target={counterTarget}
                          unit={counterUnit}
                          resetKey={key}
                        />
                      )}

                      {row.referencePhotoMediaId && (
                        <figure className="crochet-studio-written-row-reference">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/media/${row.referencePhotoMediaId}`}
                            alt={`Your work should look like this after ${label}`}
                          />
                          <figcaption>What your work should look like after this row.</figcaption>
                        </figure>
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
                      {counterAvailable && (
                        <button
                          type="button"
                          className={`crochet-studio-written-row-action${counterOpen ? ' is-active' : ''}`}
                          title={counterOpen ? 'Hide stitch counter' : 'Count stitches in this row'}
                          onClick={() => setOpenCounterRowKey(counterOpen ? null : key)}
                          aria-pressed={counterOpen}
                        >
                          {counterOpen ? (
                            <X size={14} strokeWidth={1.5} />
                          ) : (
                            <Calculator size={14} strokeWidth={1.5} />
                          )}
                        </button>
                      )}
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

function renderInstructionTokens(tokens: InstructionToken[]) {
  return tokens.map((token, i) => {
    if (token.kind === 'text') {
      return <span key={i}>{token.text}</span>
    }
    return (
      <InlineStitchToken key={i} slug={token.slug} displayText={token.displayText} />
    )
  })
}

function ColourPip({ label, hex }: { label: string; hex?: string | null }) {
  const style: React.CSSProperties | undefined = hex
    ? { background: hex, borderColor: hex }
    : undefined
  return (
    <span className="crochet-studio-colour-pip" title={label}>
      <span className="crochet-studio-colour-pip-dot" style={style} />
      <span className="crochet-studio-colour-pip-label">{label}</span>
    </span>
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
