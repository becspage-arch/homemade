'use client'

/**
 * KnittingWrittenView — the written-instruction view, mirroring the
 * crochet equivalent's UX. Renders rowsStructured as grouped sections;
 * each row has a tick button to mark complete. The current row is
 * highlighted; completed rows fade.
 *
 * RS / WS indicator surfaces beside each row label for FLAT knitting
 * patterns. Round patterns suppress the marker.
 */

import { Check, Undo2 } from 'lucide-react'

import type { KnittingConstruction, PatternRow } from './types'

interface Props {
  rows: PatternRow[]
  sections: string[]
  construction: KnittingConstruction | null
  patternName: string
  completedRows: Record<string, number[]>
  currentSection: string | null
  currentRow: number
  onMarkComplete: (section: string, rowNumber: number) => void
  onUnmark: (section: string, rowNumber: number) => void
}

export function KnittingWrittenView({
  rows,
  sections,
  construction,
  patternName,
  completedRows,
  currentSection,
  currentRow,
  onMarkComplete,
  onUnmark,
}: Props) {
  const isFlat = construction === 'FLAT'

  return (
    <div className="knitting-written-view">
      {rows.length === 0 ? (
        <p style={{ color: 'var(--studio-ink-mute)', fontStyle: 'italic' }}>
          {patternName} has no structured row data yet. Use the chart, or open
          the source tutorial for the prose pattern.
        </p>
      ) : (
        sections.map((section) => {
          const sectionRows = rows.filter((r) => r.section === section)
          if (sectionRows.length === 0) return null
          const completed = new Set(completedRows[section] ?? [])
          return (
            <section key={section}>
              {sections.length > 1 && (
                <h3 className="knitting-written-section-heading">{section}</h3>
              )}
              {sectionRows.map((row) => {
                const isCurrent =
                  section === currentSection && row.rowNumber === currentRow
                const isComplete = completed.has(row.rowNumber)
                const label =
                  row.rowLabel ?? (row.isRoundNotRow ? `Rnd ${row.rowNumber}` : `Row ${row.rowNumber}`)
                const showRs = isFlat && !row.isRoundNotRow
                return (
                  <div
                    key={`${section}-${row.rowNumber}`}
                    className={`knitting-written-row${isCurrent ? ' is-current' : ''}${
                      isComplete ? ' is-complete' : ''
                    }`}
                  >
                    <span className="knitting-written-row-label">
                      {label}
                      {showRs && (
                        <span
                          className={`knitting-written-row-rs ${
                            row.rightSide === false ? 'is-ws' : 'is-rs'
                          }`}
                        >
                          {row.rightSide === false ? 'WS' : 'RS'}
                        </span>
                      )}
                    </span>
                    <span className="knitting-written-row-instruction">
                      {row.instruction}
                      {row.stitchCount != null && (
                        <span className="knitting-written-row-stitchcount">
                          {' '}
                          · {row.stitchCount} sts
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      className={`knitting-written-row-toggle${
                        isComplete ? ' is-complete' : ''
                      }`}
                      onClick={() =>
                        isComplete
                          ? onUnmark(section, row.rowNumber)
                          : onMarkComplete(section, row.rowNumber)
                      }
                      aria-pressed={isComplete}
                      aria-label={isComplete ? `Unmark ${label}` : `Mark ${label} complete`}
                    >
                      {isComplete ? <Undo2 size={12} /> : <Check size={12} />}
                      <span style={{ marginLeft: '0.3rem' }}>
                        {isComplete ? 'Undo' : 'Done'}
                      </span>
                    </button>
                  </div>
                )
              })}
            </section>
          )
        })
      )}
    </div>
  )
}
