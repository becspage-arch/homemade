'use client'

import { useScale } from './scale-context'

interface ServingsCellProps {
  /** Default servings at 1× (from `tutorial.servings`). */
  defaultServings: number | null
  /** Free-text yield override (e.g. "Makes one 1L jar"). Takes precedence. */
  yieldDescription: string | null
  /** Drives the dt label — "Makes" for drinks, "Yield" otherwise. */
  mealType: string | null
}

/**
 * Info-bar "Yield / Makes" cell. Reads the page-level scale context so that
 * scaling the ingredients list also updates the servings line ("For 4
 * servings" → "For 8 servings" when the reader hits 2×). Falls back to the
 * static yield label when there's no scale context (technique page) or when
 * the recipe is non-scalable (bakery percentages — multiplier stays 1).
 */
export function ServingsCell({
  defaultServings,
  yieldDescription,
  mealType,
}: ServingsCellProps) {
  const scale = useScale()
  const multiplier = scale?.multiplier ?? 1

  // Free-text yield (e.g. "Makes 12 cookies") wins over numeric servings,
  // since we can't reliably scale arbitrary prose. Show it verbatim.
  if (yieldDescription) {
    return (
      <div>
        <dt>{mealType === 'drink' ? 'Makes' : 'Yield'}</dt>
        <dd>{yieldDescription}</dd>
      </div>
    )
  }

  if (defaultServings == null) return null

  const scaled = defaultServings * multiplier
  const scaledDisplay = formatServings(scaled)

  return (
    <div>
      <dt>{mealType === 'drink' ? 'Makes' : 'Yield'}</dt>
      <dd>Serves {scaledDisplay}</dd>
    </div>
  )
}

function formatServings(value: number): string {
  if (!Number.isFinite(value)) return ''
  if (Math.abs(value - Math.round(value)) < 0.01) return String(Math.round(value))
  return value.toFixed(1).replace(/\.0$/, '')
}
