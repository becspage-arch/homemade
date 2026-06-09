'use client'

/**
 * KnittingCounterPanel — dockable bottom-right counter for the active
 * project surface. Owns four counters knitters track:
 *
 *   row    — current row number (or current round)
 *   round  — only shown when construction is IN_THE_ROUND
 *   repeat — only shown when the pattern has a repeat group (RS only)
 *   stitch — current stitch within the current row (auto-resets on
 *            row advance)
 *
 * RS / WS marker shows above the row counter for FLAT knitting only;
 * round patterns are always RS.
 *
 * Keyboard shortcuts (bound by parent surface, not here):
 *   Space         → advance row counter
 *   Right Arrow   → advance row counter
 *   Shift + Right → step stitch counter forward by 1
 *   Left Arrow    → step row counter back by 1
 *
 * Cable needle tracker sits below the counters when collapsed=false.
 *
 * The panel is collapsible to a compact row-counter chip so it stays
 * out of the way of the chart canvas.
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react'

import { KnittingCableTracker } from './KnittingCableTracker'
import type { CableNeedleEntry, KnittingConstruction } from './types'

interface Props {
  construction: KnittingConstruction | null
  rowNumber: number
  roundNumber: number
  repeatNumber: number
  stitchNumber: number
  rightSide: boolean
  totalRowsInRepeat: number | null
  cableNeedles: CableNeedleEntry[]
  onAdvanceRow: () => void
  onStepRowBack: () => void
  onAdvanceRound: () => void
  onStepRoundBack: () => void
  onAdvanceRepeat: () => void
  onStepRepeatBack: () => void
  onStepStitchForward: () => void
  onStepStitchBack: () => void
  onAddCableNeedle: (description: string, stitchCount: number, holdInFront: boolean) => void
  onClearCableNeedle: (id: string) => void
}

export function KnittingCounterPanel({
  construction,
  rowNumber,
  roundNumber,
  repeatNumber,
  stitchNumber,
  rightSide,
  totalRowsInRepeat,
  cableNeedles,
  onAdvanceRow,
  onStepRowBack,
  onAdvanceRound,
  onStepRoundBack,
  onAdvanceRepeat,
  onStepRepeatBack,
  onStepStitchForward,
  onStepStitchBack,
  onAddCableNeedle,
  onClearCableNeedle,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const isFlat = construction === 'FLAT'
  const isRound = construction === 'IN_THE_ROUND'
  const hasRepeat = totalRowsInRepeat !== null && totalRowsInRepeat > 0

  return (
    <div className={`knitting-counter-panel${collapsed ? ' is-collapsed' : ''}`}>
      <div className="knitting-counter-panel-header">
        {collapsed ? 'Row counter' : 'Counters'}
        <button
          type="button"
          className="knitting-counter-panel-collapse"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand counters' : 'Collapse counters'}
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {collapsed ? (
        <CompactRow
          label={isRound ? 'Rnd' : 'Row'}
          value={isRound ? roundNumber : rowNumber}
          onAdvance={isRound ? onAdvanceRound : onAdvanceRow}
          onBack={isRound ? onStepRoundBack : onStepRowBack}
        />
      ) : (
        <>
          {isFlat && (
            <div className="knitting-counter-row">
              <span className="knitting-counter-row-label">Side</span>
              <span className="knitting-counter-row-value" aria-live="polite">
                <span
                  className={`knitting-counter-rs-marker ${rightSide ? 'is-rs' : 'is-ws'}`}
                >
                  {rightSide ? 'RS' : 'WS'}
                </span>
              </span>
              <span aria-hidden />
              <span aria-hidden />
            </div>
          )}

          <CounterRow
            label={isRound ? 'Round' : 'Row'}
            value={isRound ? roundNumber : rowNumber}
            onAdvance={isRound ? onAdvanceRound : onAdvanceRow}
            onBack={isRound ? onStepRoundBack : onStepRowBack}
            primary
          />

          {isFlat && (
            <CounterRow label="Round" value={roundNumber} onAdvance={onAdvanceRound} onBack={onStepRoundBack} />
          )}

          {hasRepeat && (
            <CounterRow
              label={`Repeat (${totalRowsInRepeat} rows)`}
              value={repeatNumber}
              onAdvance={onAdvanceRepeat}
              onBack={onStepRepeatBack}
            />
          )}

          <CounterRow
            label="Stitch in row"
            value={stitchNumber}
            onAdvance={onStepStitchForward}
            onBack={onStepStitchBack}
          />

          <div className="knitting-counter-keyboard-hint">
            Space / → advance · Shift + → stitch · ← back
          </div>

          <KnittingCableTracker
            entries={cableNeedles}
            onAdd={onAddCableNeedle}
            onClear={onClearCableNeedle}
          />
        </>
      )}
    </div>
  )
}

function CounterRow({
  label,
  value,
  onAdvance,
  onBack,
  primary,
}: {
  label: string
  value: number
  onAdvance: () => void
  onBack: () => void
  primary?: boolean
}) {
  return (
    <div className="knitting-counter-row">
      <span className="knitting-counter-row-label">{label}</span>
      <span className="knitting-counter-row-value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="knitting-counter-step-button"
        onClick={onBack}
        aria-label={`${label} step back`}
        title="Back"
      >
        <Minus size={12} />
      </button>
      <button
        type="button"
        className={`knitting-counter-step-button${primary ? ' advance' : ''}`}
        onClick={onAdvance}
        aria-label={`${label} advance`}
        title="Advance"
      >
        <Plus size={12} />
      </button>
    </div>
  )
}

function CompactRow({
  label,
  value,
  onAdvance,
  onBack,
}: {
  label: string
  value: number
  onAdvance: () => void
  onBack: () => void
}) {
  return (
    <div className="knitting-counter-row">
      <span className="knitting-counter-row-label">{label}</span>
      <span className="knitting-counter-row-value">{value}</span>
      <button
        type="button"
        className="knitting-counter-step-button"
        onClick={onBack}
        aria-label="Step back"
      >
        <Minus size={12} />
      </button>
      <button
        type="button"
        className="knitting-counter-step-button advance"
        onClick={onAdvance}
        aria-label="Advance"
      >
        <Plus size={12} />
      </button>
    </div>
  )
}
