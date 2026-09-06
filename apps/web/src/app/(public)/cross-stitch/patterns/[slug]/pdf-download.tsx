'use client'

import { useState } from 'react'

/**
 * The printed-chart download, with the two choices that change what comes out
 * of the printer: the paper it is laid out for, and whether the cells are
 * printed large.
 *
 * The paper default follows where the reader is (A4 nearly everywhere, US
 * Letter across North America and the Philippines), worked out on the server
 * so the first render is already right.
 */
const PAPER_OPTIONS = [
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'US Letter' },
  { value: 'a3', label: 'A3' },
  { value: 'legal', label: 'US Legal' },
] as const

type PaperValue = (typeof PAPER_OPTIONS)[number]['value']

interface PdfDownloadProps {
  patternId: string
  defaultPaper: PaperValue
}

export function PdfDownload({ patternId, defaultPaper }: PdfDownloadProps) {
  const [paper, setPaper] = useState<PaperValue>(defaultPaper)
  const [largePrint, setLargePrint] = useState(false)

  const href = `/api/studio/patterns/${patternId}/pdf?paper=${paper}${largePrint ? '&large=1' : ''}`

  return (
    <div className="pattern-detail-pdf">
      <a href={href} className="pattern-detail-action ghost">
        Download the printed chart
      </a>
      <div className="pattern-detail-pdf-options">
        <label>
          <span>Paper</span>
          <select
            value={paper}
            onChange={(e) => setPaper(e.target.value as PaperValue)}
            aria-label="Paper size"
          >
            {PAPER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="pattern-detail-pdf-large">
          <input
            type="checkbox"
            checked={largePrint}
            onChange={(e) => setLargePrint(e.target.checked)}
          />
          <span>Large print</span>
        </label>
      </div>
    </div>
  )
}
