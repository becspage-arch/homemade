/**
 * Cable layout engine.
 *
 * Cables break the standard 1-cell-per-stitch grid: a 4-stitch cable
 * occupies 4 stitch-columns worth of width but renders as a single
 * crossing shape, not four individual stitch symbols.
 *
 * The engine:
 *   1. Reads `grid.cables` for crossing records.
 *   2. Marks the cells each crossing occupies as "consumed" so the
 *      base grid layout skips them.
 *   3. Emits one CableCrossingPlacement per record carrying the
 *      crossing shape + span.
 *
 * The svg-composer renders the base grid first, then overlays the
 * cable crossings on top so they sit cleanly above any underlying
 * pattern detail.
 */

import type { CableCrossing, KnittingChartData } from '../types'

export interface CableCrossingPlacement {
  /** Inclusive grid x-start. */
  startX: number
  /** Inclusive grid x-end. */
  endX: number
  /** Grid y-coordinate. */
  y: number
  /** Which way the front pair leans. */
  crossDirection: 'LEFT' | 'RIGHT'
  /** Cable name (C4F, C6B, T2L, etc). */
  type: string
}

export interface CableLayoutResult {
  crossings: CableCrossingPlacement[]
  /** Set of "x,y" keys that the cable layout consumes — grid-layout
   *  should skip these so the cable shape sits cleanly above the
   *  surrounding ground. */
  consumedCells: Set<string>
  warnings: string[]
}

export function buildCableLayout(data: KnittingChartData): CableLayoutResult {
  const crossings: CableCrossingPlacement[] = []
  const consumedCells = new Set<string>()
  const warnings: string[] = []
  const cables = data.grid.cables ?? []

  for (const c of cables) {
    const validated = validateCrossing(c, data.grid.width, data.grid.height)
    if (validated.warning) warnings.push(validated.warning)
    if (!validated.crossing) continue

    crossings.push({
      startX: validated.crossing.startX,
      endX: validated.crossing.endX,
      y: validated.crossing.y,
      crossDirection: validated.crossing.crossDirection,
      type: validated.crossing.type,
    })

    for (let x = validated.crossing.startX; x <= validated.crossing.endX; x++) {
      consumedCells.add(`${x},${validated.crossing.y}`)
    }
  }

  return { crossings, consumedCells, warnings }
}

function validateCrossing(
  c: CableCrossing,
  width: number,
  height: number,
): { crossing: CableCrossing | null; warning: string | null } {
  if (c.startX > c.endX) {
    return {
      crossing: null,
      warning: `Cable ${c.type} at row ${c.y}: startX > endX, skipped.`,
    }
  }
  if (c.startX < 0 || c.endX >= width || c.y < 0 || c.y >= height) {
    // Clip to grid bounds; a warning is still useful for the verifier.
    const clipped: CableCrossing = {
      ...c,
      startX: Math.max(0, c.startX),
      endX: Math.min(width - 1, c.endX),
      y: Math.max(0, Math.min(height - 1, c.y)),
    }
    if (clipped.startX > clipped.endX) {
      return {
        crossing: null,
        warning: `Cable ${c.type} at row ${c.y}: fully outside grid bounds, skipped.`,
      }
    }
    return {
      crossing: clipped,
      warning: `Cable ${c.type} at row ${c.y}: partially outside grid bounds, clipped to [${clipped.startX},${clipped.endX}].`,
    }
  }
  return { crossing: c, warning: null }
}
