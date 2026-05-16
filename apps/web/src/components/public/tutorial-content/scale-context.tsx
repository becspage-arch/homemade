'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ScaleIngredient } from './scale-extract'

export type { ScaleIngredient } from './scale-extract'

/**
 * Recipe-scale context. Owns the current `multiplier` (1×, 2×, 4×, custom)
 * and exposes the ingredient slug → { amount, unit } lookup that
 * `{{slug}}` method-prose tokens use to render scaled amounts.
 *
 * The structured `IngredientsList` block (`./blocks/ingredients-list.tsx`)
 * writes to `setMultiplier` whenever the reader changes the scale chip;
 * the `ScaleToken` component reads `multiplier` + `ingredients` to render
 * the substituted amount inline in method paragraphs.
 *
 * On technique pages (no recipe) the provider is absent and `useScale()`
 * returns `null`, so `ScaleToken` falls back to its literal text.
 *
 * Note: the server-side `extractScaleIngredients()` extractor lives in
 * `./scale-extract.ts` rather than this file. Functions exported from a
 * `'use client'` module are treated as client functions by Next 16, so
 * server components can't invoke them; the extractor must stay in a
 * server-safe module.
 */

interface ScaleContextValue {
  multiplier: number
  setMultiplier: (next: number) => void
  defaultServings: number | null
  /** Map from slug → { amount, unit } at 1×. Built once on mount. */
  ingredients: Map<string, ScaleIngredient>
}

const ScaleCtx = createContext<ScaleContextValue | null>(null)

export interface ScaleProviderProps {
  defaultServings: number | null
  /** The ingredients-list rows server-extracted from the recipe body. */
  ingredients: ScaleIngredient[]
  children: ReactNode
}

export function ScaleProvider({
  defaultServings,
  ingredients,
  children,
}: ScaleProviderProps) {
  const [multiplier, setMultiplier] = useState(1)

  const value = useMemo<ScaleContextValue>(() => {
    const map = new Map<string, ScaleIngredient>()
    for (const ing of ingredients) {
      if (ing.slug) map.set(ing.slug, ing)
    }
    return { multiplier, setMultiplier, defaultServings, ingredients: map }
  }, [multiplier, defaultServings, ingredients])

  return <ScaleCtx.Provider value={value}>{children}</ScaleCtx.Provider>
}

/** Returns the active scale context, or `null` on technique pages. */
export function useScale(): ScaleContextValue | null {
  return useContext(ScaleCtx)
}

/**
 * Renders the scaled amount + unit for a given ingredient slug, used to
 * substitute `{{slug}}` tokens in method-prose text. Falls back to the
 * literal token text if the slug isn't in the recipe's ingredients (or
 * there's no scale context — i.e. a technique page accidentally carrying
 * a token).
 */
export function ScaleToken({
  slug,
  fallback,
}: {
  slug: string
  /** Rendered when the slug can't be resolved. Defaults to `{{slug}}`. */
  fallback?: string
}) {
  const scale = useScale()
  if (!scale) return <span className="scale-token-fallback">{fallback ?? `{{${slug}}}`}</span>
  const ing = scale.ingredients.get(slug)
  if (!ing) return <span className="scale-token-fallback">{fallback ?? `{{${slug}}}`}</span>
  if (ing.amount === null) {
    return (
      <span className="scale-token" data-slug={slug}>
        {ing.unit && ing.unit !== 'each' ? ing.unit : ''}
      </span>
    )
  }
  const scaled = ing.amount * scale.multiplier
  // `each` is a counting unit — drop the word in prose ("4 eggs", not "4
  // each eggs"). All other units (g, ml, tbsp, …) render after the number,
  // pluralised when the amount > 1 for words that take a plural form.
  const unitSuffix =
    ing.unit && ing.unit !== 'each' ? ` ${pluraliseUnit(ing.unit, scaled)}` : ''
  return (
    <span className="scale-token" data-slug={slug}>
      {formatAmount(scaled)}
      {unitSuffix}
    </span>
  )
}

// Countable units take a plural -s when the amount is anything other than 1.
// Mass / volume abbreviations (g, kg, ml, l, tsp, tbsp, cup) stay invariant
// because cooking convention uses them as both singular and plural.
const PLURALISE: Record<string, string> = {
  sprig: 'sprigs',
  clove: 'cloves',
  leaf: 'leaves',
  sheet: 'sheets',
  slice: 'slices',
  bunch: 'bunches',
  handful: 'handfuls',
  pinch: 'pinches',
}

function pluraliseUnit(unit: string, amount: number): string {
  if (Math.abs(amount - 1) < 0.01) return unit
  return PLURALISE[unit] ?? unit
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return ''
  if (Math.abs(value - Math.round(value)) < 0.01) return String(Math.round(value))
  return value.toFixed(2).replace(/\.?0+$/, '')
}

// `extractScaleIngredients` lives in `./scale-extract.ts` so server
// components can import it. Re-export it through that file's barrel so
// existing client-side imports keep working too.
export { extractScaleIngredients } from './scale-extract'
