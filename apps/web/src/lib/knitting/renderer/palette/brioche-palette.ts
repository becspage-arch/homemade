/**
 * Brioche palette.
 *
 * Two-colour brioche charts (the only kind we render — single-colour
 * brioche doesn't need a chart) alternate between two yarns called the
 * "light" and "dark" colour. The chart cells reference brioche-
 * specific symbols (brk, brp, brkyobrk) that don't directly encode
 * colour — the symbol's colour is determined by which side of the
 * brioche row it sits on.
 *
 * Convention: rows are paired. Within a paired set, the first row
 * carries one colour and the second carries the other. By default
 * the bottom row gets the dark colour; flip via `lightFirst` in
 * metadata if needed (not currently surfaced; safe default).
 *
 * The palette uses a balanced natural pairing: charcoal + undyed so
 * the brioche depth reads on screen and in print.
 */

import type { KnittingChartData } from '../types'

export interface ResolvedBriochePalette {
  /** Colour for the "dark" half of the row pair. */
  dark: string
  /** Colour for the "light" half of the row pair. */
  light: string
}

const DEFAULT_BRIOCHE: ResolvedBriochePalette = {
  dark: '#3a3a40',
  light: '#ece2c9',
}

/**
 * Resolve the dark + light colours from the chart's palette. Looks
 * for palette entries keyed 'dark' / 'light'; otherwise falls back
 * to the first two RGB values; otherwise the natural default.
 */
export function resolveBriochePalette(
  data: KnittingChartData,
): ResolvedBriochePalette {
  const entries = data.palette ?? []
  const byKey = new Map<string, string>()
  for (const e of entries) byKey.set(e.symbol, e.rgb)

  const dark = byKey.get('dark') ?? entries[0]?.rgb ?? DEFAULT_BRIOCHE.dark
  const light = byKey.get('light') ?? entries[1]?.rgb ?? DEFAULT_BRIOCHE.light

  return { dark, light }
}

/** For a given row (0-indexed from bottom), return the dark / light
 *  colour the renderer should treat as foreground. Rows pair as
 *  (dark, light, dark, light, ...). */
export function brioichePairColour(
  rowFromBottom: number,
  palette: ResolvedBriochePalette,
): string {
  return rowFromBottom % 2 === 0 ? palette.dark : palette.light
}
