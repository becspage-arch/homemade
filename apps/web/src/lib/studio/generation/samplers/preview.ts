/**
 * Turn a bare art layer into a chart, with no words on it.
 *
 * Used when a piece of art has to be looked at on its own: the motif sheets
 * before a variant is chosen, and the word-art preview, which needs the same
 * render the Studio will give. Not a second assembly path — it calls the same
 * palette builder and the same assembler the real samplers do.
 */

import type { PatternData } from '@homemade/db'
import { artColours, type Art } from './art'
import { assembleChart, buildPalette } from './chart'

export function artChart(art: Art, width: number, height: number): PatternData {
  const palette = buildPalette(artColours(art), [])
  return assembleChart(art, [], palette, { width, height })
}
