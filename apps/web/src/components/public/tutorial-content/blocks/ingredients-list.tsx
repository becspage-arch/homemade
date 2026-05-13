'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { captureClientEvent } from '@/lib/client-analytics'
import { useScale } from '../scale-context'

export interface IngredientsListItem {
  ingredientId: string
  ingredientSlug: string
  name: string
  amount: number | null
  unit: string | null
  prepNote: string | null
  isOptional: boolean
  groupLabel: string | null
}

interface IngredientsListProps {
  /** Tutorial id — used for the `ingredients_scaled` analytics event. */
  tutorialId: string
  tutorialSlug: string
  items: IngredientsListItem[]
  defaultServings: number | null
  /**
   * Whether amounts can scale linearly. When false the selector is hidden
   * and a tooltip explains why (bakery percentages, sourdough timing, etc.).
   */
  scalable: boolean
}

type Scale =
  | { kind: 'preset'; multiplier: 1 | 2 | 4; label: string }
  | { kind: 'servings'; servings: number; label: string }

const PRESETS: Array<Scale & { kind: 'preset' }> = [
  { kind: 'preset', multiplier: 1, label: '1×' },
  { kind: 'preset', multiplier: 2, label: '2×' },
  { kind: 'preset', multiplier: 4, label: '4×' },
]

const SCALE_DEFAULT: Scale = { kind: 'preset', multiplier: 1, label: '1×' }

export function IngredientsList({
  tutorialId,
  tutorialSlug,
  items,
  defaultServings,
  scalable,
}: IngredientsListProps) {
  const [scale, setScale] = useState<Scale>(SCALE_DEFAULT)
  const [customOpen, setCustomOpen] = useState(false)
  const [customServings, setCustomServings] = useState<string>(
    defaultServings ? String(defaultServings) : '',
  )

  const multiplier = useMemo(() => {
    if (scale.kind === 'preset') return scale.multiplier
    if (!defaultServings || defaultServings <= 0) return 1
    return scale.servings / defaultServings
  }, [scale, defaultServings])

  // Mirror the multiplier into the page-level ScaleProvider so {{slug}}
  // tokens in method prose update alongside the ingredients list. The
  // hook returns null on technique pages, where this is a no-op.
  const scaleCtx = useScale()
  useEffect(() => {
    if (scaleCtx) scaleCtx.setMultiplier(multiplier)
  }, [scaleCtx, multiplier])

  function changeScale(next: Scale): void {
    if (scale.label === next.label && scale.kind === next.kind) return
    captureClientEvent('ingredients_scaled', {
      tutorialId,
      tutorialSlug,
      fromScale: scale.label,
      toScale: next.label,
    })
    setScale(next)
  }

  function applyCustom(): void {
    const n = Number.parseInt(customServings, 10)
    if (!Number.isFinite(n) || n <= 0) return
    changeScale({ kind: 'servings', servings: n, label: `${n} servings` })
    setCustomOpen(false)
  }

  const grouped = useMemo(() => groupItems(items), [items])

  if (items.length === 0) return null

  return (
    <section className="ingredients-list" aria-labelledby={`ingredients-${tutorialSlug}`}>
      <div className="ingredients-list-header">
        <h2 id={`ingredients-${tutorialSlug}`} className="ingredients-list-heading">
          Ingredients
        </h2>

        {scalable ? (
          <div
            className="ingredients-list-scaler"
            role="radiogroup"
            aria-label="Scale ingredient amounts"
          >
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                role="radio"
                aria-checked={
                  scale.kind === 'preset' && scale.multiplier === preset.multiplier
                }
                onClick={() => changeScale(preset)}
                className={`ingredients-list-scale-chip${
                  scale.kind === 'preset' && scale.multiplier === preset.multiplier
                    ? ' is-active'
                    : ''
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomOpen((o) => !o)}
              className={`ingredients-list-scale-chip${
                scale.kind === 'servings' ? ' is-active' : ''
              }`}
              aria-expanded={customOpen}
            >
              {scale.kind === 'servings' ? scale.label : 'Custom'}
            </button>
            {customOpen && (
              <div className="ingredients-list-custom">
                <label className="ingredients-list-custom-label">
                  Servings
                  <input
                    type="number"
                    min={1}
                    value={customServings}
                    onChange={(e) => setCustomServings(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        applyCustom()
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={applyCustom}
                  className="ingredients-list-custom-apply"
                >
                  apply
                </button>
              </div>
            )}
          </div>
        ) : (
          <span
            className="ingredients-list-no-scale"
            title="Bakery recipes work by ratios — scaling changes the result."
          >
            Scaling off · ratios fixed
          </span>
        )}
      </div>

      {defaultServings && scalable && (
        <p className="ingredients-list-yield">
          {scale.kind === 'servings'
            ? `Scaled for ${scale.servings} (${formatMultiplier(multiplier)}× original)`
            : `For ${defaultServings} servings`}
        </p>
      )}

      {grouped.map((group) => (
        <div key={group.label ?? '__main__'} className="ingredients-list-group">
          {group.label && (
            <h3 className="ingredients-list-group-heading">{group.label}</h3>
          )}
          <ul className="ingredients-list-rows">
            {group.items.map((item, i) => (
              <IngredientRow
                key={`${item.ingredientId || item.name}-${i}`}
                item={item}
                multiplier={multiplier}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function IngredientRow({
  item,
  multiplier,
}: {
  item: IngredientsListItem
  multiplier: number
}) {
  const scaled = item.amount !== null ? item.amount * multiplier : null
  const link =
    item.ingredientSlug && item.ingredientSlug.length > 0 ? (
      <Link
        href={`/ingredients/${item.ingredientSlug}`}
        className="ingredients-list-name-link"
      >
        {item.name}
      </Link>
    ) : (
      <span className="ingredients-list-name-link">{item.name}</span>
    )

  return (
    <li className="ingredients-list-row">
      <span className="ingredients-list-amount">
        {scaled === null ? (
          <span aria-hidden="true">·</span>
        ) : (
          <>
            {formatAmount(scaled)}
            {item.unit && <span className="ingredients-list-unit">{item.unit}</span>}
          </>
        )}
      </span>
      <span className="ingredients-list-name">
        {link}
        {item.prepNote && (
          <em className="ingredients-list-prep">, {item.prepNote}</em>
        )}
        {item.isOptional && (
          <span className="ingredients-list-optional"> · optional</span>
        )}
      </span>
    </li>
  )
}

interface Group {
  label: string | null
  items: IngredientsListItem[]
}

function groupItems(items: IngredientsListItem[]): Group[] {
  const groups: Group[] = []
  const byLabel = new Map<string | null, Group>()
  for (const item of items) {
    const label = item.groupLabel?.trim() ? item.groupLabel.trim() : null
    let group = byLabel.get(label)
    if (!group) {
      group = { label, items: [] }
      byLabel.set(label, group)
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return ''
  // Whole numbers stay whole. Decimals trim to two places and drop trailing
  // zeros so 1.50 → "1.5" and 1.0 → "1".
  if (Math.abs(value - Math.round(value)) < 0.01) {
    return String(Math.round(value))
  }
  return value
    .toFixed(2)
    .replace(/\.?0+$/, '')
}

function formatMultiplier(value: number): string {
  if (Math.abs(value - Math.round(value)) < 0.01) return String(Math.round(value))
  return value.toFixed(2).replace(/\.?0+$/, '')
}
