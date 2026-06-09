'use client'

/**
 * KnittingCableTracker — small tracker for cables held mid-row. Cable
 * knitters often have one or more groups of stitches slipped to a
 * cable needle while they work an adjacent group. Losing track of
 * which cn is which (and how many stitches are on it) is a routine
 * frustration the Studio can solve.
 *
 * Each entry has a free-text description, a stitch count, and a
 * hold-in-front / hold-in-back flag. Entries clear when the user
 * confirms the cable is worked.
 *
 * Backed by parent state — the panel only emits add / clear events.
 */

import { useState } from 'react'
import { X, Plus } from 'lucide-react'

import type { CableNeedleEntry } from './types'

interface Props {
  entries: CableNeedleEntry[]
  onAdd: (description: string, stitchCount: number, holdInFront: boolean) => void
  onClear: (id: string) => void
}

export function KnittingCableTracker({ entries, onAdd, onClear }: Props) {
  const [desc, setDesc] = useState('')
  const [stitchCount, setStitchCount] = useState<string>('2')
  const [holdInFront, setHoldInFront] = useState(true)

  const submit = () => {
    const count = Number(stitchCount)
    if (!desc.trim() || !Number.isFinite(count) || count <= 0) return
    onAdd(desc.trim(), count, holdInFront)
    setDesc('')
    setStitchCount('2')
    setHoldInFront(true)
  }

  return (
    <div className="knitting-cable-tracker">
      <div className="knitting-cable-tracker-heading">
        <span>Cable needles ({entries.length})</span>
      </div>
      {entries.length === 0 ? (
        <p className="knitting-cable-tracker-empty">No cables held right now.</p>
      ) : (
        <ul className="knitting-cable-tracker-list">
          {entries.map((entry) => (
            <li key={entry.id} className="knitting-cable-tracker-item">
              <span className="knitting-cable-tracker-item-desc">{entry.description}</span>
              <span className="knitting-cable-tracker-item-position">
                {entry.stitchCount} sts · {entry.holdInFront ? 'front' : 'back'}
              </span>
              <button
                type="button"
                className="knitting-cable-tracker-item-clear"
                onClick={() => onClear(entry.id)}
                aria-label={`Clear ${entry.description}`}
                title="Cable worked"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="knitting-cable-tracker-add">
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g. C4F — 2 sts in front"
          aria-label="Cable description"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
        <input
          type="number"
          min="1"
          max="20"
          value={stitchCount}
          onChange={(e) => setStitchCount(e.target.value)}
          aria-label="Stitches on needle"
          style={{ width: '3.5rem' }}
        />
        <select
          value={holdInFront ? 'front' : 'back'}
          onChange={(e) => setHoldInFront(e.target.value === 'front')}
          aria-label="Hold in front or back"
          style={{
            background: 'var(--studio-surface)',
            border: '1px solid var(--studio-line)',
            borderRadius: 'var(--studio-radius-s)',
            padding: '0.3rem',
            fontFamily: 'inherit',
            fontSize: '0.78rem',
          }}
        >
          <option value="front">Front</option>
          <option value="back">Back</option>
        </select>
        <button type="button" onClick={submit} aria-label="Add cable needle">
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}
