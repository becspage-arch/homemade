'use client'

import { useState, useTransition } from 'react'
import { toggleSupplyChecked } from '@/lib/user-state-actions'
import type { HarvestedSupply } from '@/lib/supplies'

interface ProjectSuppliesProps {
  projectId: string
  supplies: HarvestedSupply[]
  initialChecked: string[]
}

/**
 * Tick-list of supplies harvested from the tutorial's SuppliesCard blocks.
 * Ticks persist to `UserProject.suppliesChecked` via a server action.
 */
export function ProjectSupplies({
  projectId,
  supplies,
  initialChecked,
}: ProjectSuppliesProps) {
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(initialChecked),
  )
  const [, start] = useTransition()

  function toggle(key: string): void {
    const next = new Set(checked)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setChecked(next)
    start(async () => {
      await toggleSupplyChecked(projectId, key)
    })
  }

  return (
    <div className="me-project-supplies">
      {supplies.map((s) => {
        const isChecked = checked.has(s.key)
        return (
          <label key={s.key} className="me-project-supplies-row">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggle(s.key)}
            />
            <span style={{ flex: 1 }}>
              {s.qty && (
                <span style={{ color: 'var(--color-warm-taupe)', marginRight: 6 }}>
                  {s.qty}
                </span>
              )}
              <span
                style={{
                  textDecoration: isChecked ? 'line-through' : 'none',
                  color: isChecked
                    ? 'var(--color-warm-taupe)'
                    : 'var(--color-espresso)',
                }}
              >
                {s.name}
              </span>
              {s.substitutions && (
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-lora)',
                    fontStyle: 'italic',
                    fontSize: 12,
                    color: 'var(--color-warm-taupe)',
                    marginTop: 2,
                  }}
                >
                  or {s.substitutions}
                </span>
              )}
            </span>
          </label>
        )
      })}
    </div>
  )
}
