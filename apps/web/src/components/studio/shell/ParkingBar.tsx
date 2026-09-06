'use client'

/**
 * ParkingBar — the controls for parking mode, sat just under the toolbar
 * and above the chart.
 *
 * Parking is how a dense chart gets finished: work one row (or column, or
 * 10x10 block) at a time and leave each colour's needle hanging in the next
 * square that colour appears in. The bar carries the working direction, the
 * line the stitcher is on, the colour to pick up next, and a short
 * explainer for anyone meeting the method for the first time.
 *
 * Everything here is a real button or a real select, so the whole bar works
 * from the keyboard. The chart itself takes P to toggle parking and the
 * square brackets to step a line either way.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react'
import type { PatternData } from '@homemade/db/pattern'
import { useChartStore } from '../chart/chart-store'
import {
  lineLabel,
  nextColourUp,
  cellLabel,
  type ParkingDirection,
} from '@/lib/studio/parking'

/** `short` is what a phone shows: the bar has to hold a direction picker, a
 *  line stepper and the next colour on a 390px screen. */
const DIRECTIONS: Array<{
  value: ParkingDirection
  label: string
  short: string
  hint: string
}> = [
  { value: 'rows', label: 'Rows', short: 'Rows', hint: 'Work left to right, one row at a time' },
  { value: 'columns', label: 'Columns', short: 'Cols', hint: 'Work top to bottom, one column at a time' },
  {
    value: 'blocks',
    label: '10 × 10 blocks',
    short: 'Blocks',
    hint: 'Finish one ten-square block before the next',
  },
]

export function ParkingBar({ pattern }: { pattern: PatternData }) {
  const enabled = useChartStore((s) => s.parkingEnabled)
  const direction = useChartStore((s) => s.parkingDirection)
  const line = useChartStore((s) => s.parkingLine)
  const index = useChartStore((s) => s.parkingIndex)
  const parked = useChartStore((s) => s.parkedCells)
  const setEnabled = useChartStore((s) => s.setParkingEnabled)
  const setDirection = useChartStore((s) => s.setParkingDirection)
  const stepLine = useChartStore((s) => s.stepParkingLine)
  const centreOnCell = useChartStore((s) => s.centreOnCell)
  const setCurrentSymbol = useChartStore((s) => s.setCurrentSymbol)
  const stale = useChartStore((s) => s.parkingStale)
  const syncParkingIndex = useChartStore((s) => s.syncParkingIndex)

  const [helpOpen, setHelpOpen] = useState(false)

  // Editing the chart underneath parking mode invalidates the working
  // order, so the park markers step aside until it is rebuilt. Rebuilding
  // on a short settle means a brush drag across fifty squares costs one
  // rebuild at the end rather than fifty as it goes.
  useEffect(() => {
    if (!stale) return
    const t = setTimeout(() => syncParkingIndex(), 350)
    return () => clearTimeout(t)
  }, [stale, syncParkingIndex])

  if (!enabled) return null

  const nextSymbol = nextColourUp(parked)
  const nextEntry = nextSymbol ? pattern.palette.find((p) => p.symbol === nextSymbol) ?? null : null
  const nextCell = nextSymbol ? parked.get(nextSymbol) ?? null : null
  const lineTotal = index?.lineCount ?? 0

  return (
    <div className="studio-parking">
      <div className="studio-parking-bar">
        <span className="studio-parking-label">Parking</span>

        <div className="studio-parking-directions" role="radiogroup" aria-label="Working direction">
          {DIRECTIONS.map(({ value, label, short, hint }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={direction === value}
              className={['studio-parking-pill', direction === value ? 'is-active' : ''].join(' ')}
              onClick={() => setDirection(value)}
              title={hint}
              aria-label={label}
            >
              <span className="studio-parking-pill-wide">{label}</span>
              <span className="studio-parking-pill-narrow" aria-hidden="true">
                {short}
              </span>
            </button>
          ))}
        </div>

        <div className="studio-parking-line">
          <button
            type="button"
            className="studio-icon-button"
            onClick={() => stepLine(-1)}
            aria-label="Previous line with work left"
            title="Back a line ( [ )"
          >
            <ChevronLeft size={16} strokeWidth={1.8} />
          </button>
          <span className="studio-parking-line-label" aria-live="polite">
            {capitalise(lineLabel(line, direction))}
            {lineTotal > 0 && <span className="studio-parking-line-total"> of {lineTotal}</span>}
          </span>
          <button
            type="button"
            className="studio-icon-button"
            onClick={() => stepLine(1)}
            aria-label="Next line with work left"
            title="On a line ( ] )"
          >
            <ChevronRight size={16} strokeWidth={1.8} />
          </button>
        </div>

        {nextEntry && nextCell ? (
          <button
            type="button"
            className="studio-parking-next"
            onClick={() => {
              setCurrentSymbol(nextEntry.symbol)
              centreOnCell(nextCell.x, nextCell.y)
            }}
            title={`Go to ${cellLabel(nextCell)}`}
          >
            <span className="studio-parking-next-label">Next up</span>
            <span className="studio-parking-next-swatch" style={{ background: nextEntry.rgb }} aria-hidden="true">
              {nextEntry.symbol}
            </span>
            <span className="studio-parking-next-name">
              {nextEntry.brand} {nextEntry.code} {nextEntry.name}
            </span>
          </button>
        ) : (
          <span className="studio-parking-next is-done">Every colour is finished</span>
        )}

        <div className="studio-parking-actions">
          <button
            type="button"
            className="studio-icon-button"
            onClick={() => setHelpOpen((v) => !v)}
            aria-expanded={helpOpen}
            aria-controls="studio-parking-help"
            title="What is parking?"
          >
            <HelpCircle size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="studio-icon-button"
            onClick={() => setEnabled(false)}
            aria-label="Turn parking off"
            title="Turn parking off ( P )"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {helpOpen && (
        <div id="studio-parking-help" className="studio-parking-help">
          <p>
            Parking keeps every colour where you left it. Work along one line at a time, and when a
            colour runs out inside that line, leave its needle hanging in the next square the chart
            asks for that colour. The Studio marks each parked square for you, so a hundred-colour
            chart never turns into a hunt for the right needle.
          </p>
          <p className="studio-parking-help-links">
            <Link href="/stitches/cross-stitch#cross-stitch-parking">Parking in the stitch guide</Link>
          </p>
        </div>
      )}
    </div>
  )
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
