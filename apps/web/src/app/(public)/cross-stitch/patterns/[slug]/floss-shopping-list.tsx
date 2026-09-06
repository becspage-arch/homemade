'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface FlossBuyLine {
  brand: string
  code: string
  name: string
  rgb: string
  skeins: number
}

interface Props {
  patternId: string
  patternName: string
  lines: FlossBuyLine[]
  /** True when this pattern is already in the maker's planner queue. */
  initialInPlan: boolean
}

function fmtSkeins(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}

/**
 * The short list of colours the maker's stash does not cover, with one tap to
 * copy it for the shop and one to put the pattern in the planner, where the
 * premium roll-up combines it with everything else in the queue.
 */
export function FlossShoppingList({ patternId, patternName, lines, initialInPlan }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [inPlan, setInPlan] = useState(initialInPlan)
  const [pending, start] = useTransition()

  const asText = () =>
    [
      `${patternName}: colours to buy`,
      ...lines.map(
        (l) => `${l.brand} ${l.code}  ${l.name}  ${fmtSkeins(l.skeins)} skein${l.skeins === 1 ? '' : 's'}`,
      ),
    ].join('\n')

  const copy = async () => {
    const text = asText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard access can be refused (an insecure context, a locked-down
      // browser). Fall back to a prompt so the list is still copyable by hand.
      window.prompt('Copy your list', text)
    }
  }

  const addToPlan = () => {
    start(async () => {
      const res = await fetch('/api/studio/planner/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ craft: 'CROSS_STITCH', patternId }),
      })
      // 409 means it is already there, which is the same outcome for the maker.
      if (res.ok || res.status === 409) {
        setInPlan(true)
        router.refresh()
      }
    })
  }

  return (
    <div className="pattern-detail-tobuy">
      <h3>Colours to buy</h3>
      <ul>
        {lines.map((line) => (
          <li key={`${line.brand}-${line.code}`}>
            <span className="pattern-detail-floss-swatch" style={{ background: line.rgb }} />
            <span className="pattern-detail-floss-detail">
              <span className="pattern-detail-floss-name">{line.name}</span>
              <span className="pattern-detail-floss-code">
                {line.brand} {line.code}
              </span>
            </span>
            <span className="pattern-detail-floss-counts">
              {fmtSkeins(line.skeins)} skein{line.skeins === 1 ? '' : 's'}
            </span>
          </li>
        ))}
      </ul>
      <div className="pattern-detail-tobuy-actions">
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy the list'}
        </button>
        {inPlan ? (
          <Link href="/me/planner">In your planner</Link>
        ) : (
          <button type="button" onClick={addToPlan} disabled={pending}>
            Add to your planner
          </button>
        )}
      </div>
    </div>
  )
}
