'use client'

/**
 * CrochetMidRowCounter — small +/- counter for the current row. Lets
 * the maker tick off individual stitches (or clusters, when the
 * pattern is cluster-counted) as she works through the row. Pure
 * local state — no autosave; the counter resets when the row changes
 * or when the user marks the row complete.
 *
 * The teacher's argument for this: "you count as you work, and you
 * want to verify you got 12 trebles before you join the round."
 */

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface Props {
  target: number
  unit: 'sts' | 'clusters'
  resetKey: string
}

interface CounterState {
  resetKey: string
  count: number
}

export function CrochetMidRowCounter({ target, unit, resetKey }: Props) {
  const [state, setState] = useState<CounterState>({ resetKey, count: 0 })
  // Reset when the row changes — `resetKey` is the row identifier; we
  // detect change in render rather than in a setState-in-effect to keep
  // the lint rule happy.
  const count = state.resetKey === resetKey ? state.count : 0
  if (state.resetKey !== resetKey && state.count !== 0) {
    setState({ resetKey, count: 0 })
  }

  const reached = target > 0 && count >= target

  return (
    <div className={`crochet-studio-mid-row-counter${reached ? ' is-reached' : ''}`}>
      <button
        type="button"
        className="crochet-studio-mid-row-counter-button"
        onClick={() => setState((s) => ({ resetKey, count: Math.max(0, s.count - 1) }))}
        aria-label={`Subtract one ${unit === 'sts' ? 'stitch' : 'cluster'}`}
        disabled={count === 0}
      >
        <Minus size={14} strokeWidth={2} />
      </button>
      <span className="crochet-studio-mid-row-counter-value">
        <strong>{count}</strong> <span className="crochet-studio-mid-row-counter-target">of {target}</span>
      </span>
      <button
        type="button"
        className="crochet-studio-mid-row-counter-button"
        onClick={() => setState((s) => ({ resetKey, count: s.count + 1 }))}
        aria-label={`Add one ${unit === 'sts' ? 'stitch' : 'cluster'}`}
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
