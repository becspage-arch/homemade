/**
 * Palette defaults for the crochet finished-piece renderer.
 *
 * A pattern's chartData may carry an explicit palette per stitch via
 * `ChartStitch.colourKey`. When it doesn't (the case for the seed motifs
 * Worker C published), the renderer cycles through a warm-natural yarn
 * palette per round so the output reads as a real piece of work instead
 * of a single-colour silhouette.
 */

import type { RendererPalette } from '../types'

/** Soft fabric cream — the default canvas colour behind the stitches. */
const FABRIC_CREAM = '#f6f0e6'

/**
 * Warm-natural yarn palette: muted naturals that read as wool / cotton.
 * Cycle goes:
 *   0. terracotta
 *   1. moss
 *   2. cream
 *   3. dusty rose
 *   4. denim slate
 *   5. honey
 *   6. mushroom taupe
 *   7. sage
 * Cycles repeat for rounds beyond 8.
 */
const WARM_NATURALS: string[] = [
  '#c47a55', // terracotta
  '#8f9c6f', // moss
  '#ece2c9', // cream
  '#c79085', // dusty rose
  '#7e8da0', // denim slate
  '#d6a45a', // honey
  '#a59685', // mushroom taupe
  '#9bb18a', // sage
]

/**
 * Build the default palette. Callers can override individual entries via
 * the `overrides` argument — useful when a designer has set a specific
 * colour scheme on the pattern (e.g. all-cream baby blanket).
 */
export function defaultPalette(overrides?: Partial<RendererPalette>): RendererPalette {
  return {
    byKey: overrides?.byKey ?? {},
    perRound: overrides?.perRound ?? WARM_NATURALS,
    background: overrides?.background ?? FABRIC_CREAM,
  }
}

/**
 * Single-colour palette — every round renders in one colour. Used for
 * stitch swatches (the stitch IS the focus; colour is neutral).
 */
export function singleColourPalette(colour: string): RendererPalette {
  return {
    byKey: {},
    perRound: [colour],
    background: FABRIC_CREAM,
  }
}

/**
 * Shift a hex colour by `amount` in [-1, 1] — used by the SVG composer
 * to derive the outer rim and inner sheen of each stitch from its base
 * yarn colour.
 */
export function shiftColour(hex: string, amount: number): string {
  const norm = hex.replace('#', '')
  const r = parseInt(norm.slice(0, 2), 16)
  const g = parseInt(norm.slice(2, 4), 16)
  const b = parseInt(norm.slice(4, 6), 16)
  const k = amount >= 0 ? 255 : 0
  const nr = Math.round(r + (k - r) * Math.abs(amount))
  const ng = Math.round(g + (k - g) * Math.abs(amount))
  const nb = Math.round(b + (k - b) * Math.abs(amount))
  const hh = (v: number): string => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')
  return `#${hh(nr)}${hh(ng)}${hh(nb)}`
}
