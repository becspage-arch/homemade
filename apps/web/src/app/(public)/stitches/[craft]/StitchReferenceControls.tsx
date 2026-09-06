'use client'

/**
 * Client controls for the stitch-reference page: a UK/US terminology
 * toggle and a "Print / Save as PDF" button.
 *
 * The stitch list is server-rendered with both UK and US wording present;
 * the toggle just flips a `data-terminology` attribute on the page root
 * and CSS shows the matching one. That keeps the page a single server
 * render — no re-fetch, and it still reads correctly (UK) with JS off.
 */

import { useState } from 'react'
import { Printer } from 'lucide-react'

type Mode = 'uk' | 'us'

const ROOT_ID = 'stitch-reference-root'

export function StitchReferenceControls({
  craft,
  initial = 'uk',
  showTerminologyToggle = true,
}: {
  craft: string
  initial?: Mode
  /** Hidden for crafts whose stitches carry one name on both sides of the
   *  Atlantic (cross-stitch), where the toggle would change nothing. */
  showTerminologyToggle?: boolean
}) {
  const [mode, setMode] = useState<Mode>(initial)

  const choose = (next: Mode) => {
    setMode(next)
    if (typeof document !== 'undefined') {
      document.getElementById(ROOT_ID)?.setAttribute('data-terminology', next)
    }
  }

  return (
    <div className="stitches-controls no-print">
      {showTerminologyToggle && (
      <div className="stitches-term-toggle" role="group" aria-label="Terminology">
        <button
          type="button"
          className={`stitches-term-btn${mode === 'uk' ? ' is-active' : ''}`}
          aria-pressed={mode === 'uk'}
          onClick={() => choose('uk')}
        >
          UK terms
        </button>
        <button
          type="button"
          className={`stitches-term-btn${mode === 'us' ? ' is-active' : ''}`}
          aria-pressed={mode === 'us'}
          onClick={() => choose('us')}
        >
          US terms
        </button>
      </div>
      )}
      <a
        className="stitches-print-btn"
        href={`/stitches/${craft}/print?terminology=${mode}`}
      >
        <Printer size={16} strokeWidth={1.5} aria-hidden />
        <span>Print / Save as PDF</span>
      </a>
    </div>
  )
}
