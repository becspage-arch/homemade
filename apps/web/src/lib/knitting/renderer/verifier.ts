/**
 * Verifier — sanity checks on a rendered chart. Used by the at-scale
 * runner script (and tests) to decide whether to publish a rendered
 * chart or log it for review.
 */

import type { ChartLayout } from './chart-types/shared'
import type { KnittingChartData, VerifyResult } from './types'

export interface VerifyArgs {
  data: KnittingChartData
  layout: ChartLayout
  svgLength?: number
}

export function verifyChart(args: VerifyArgs): VerifyResult {
  const warnings: string[] = []

  // Every input cell should correspond to a placed cell, OR be
  // consumed by a cable crossing. The layout already drops cable-
  // consumed cells, so a strict comparison would mis-flag those —
  // we instead check the input cell coordinates fall within the grid.
  for (const c of args.data.grid.cells) {
    if (c.x < 0 || c.x >= args.data.grid.width) {
      warnings.push(`Cell at (${c.x}, ${c.y}) is outside grid width ${args.data.grid.width}.`)
    }
    if (c.y < 0 || c.y >= args.data.grid.height) {
      warnings.push(`Cell at (${c.x}, ${c.y}) is outside grid height ${args.data.grid.height}.`)
    }
  }

  // Each cable crossing should fit within the grid bounds.
  for (const c of args.layout.cables) {
    if (c.startX < 0 || c.endX >= args.data.grid.width) {
      warnings.push(
        `Cable ${c.type} at row ${c.y} spans [${c.startX},${c.endX}] outside grid width ${args.data.grid.width}.`,
      )
    }
  }

  // Degenerate output — empty grid, zero width, zero placements.
  if (args.data.grid.width === 0 || args.data.grid.height === 0) {
    warnings.push('Chart has zero width or height — degenerate render.')
  }

  if (args.svgLength !== undefined && args.svgLength < 200) {
    warnings.push('SVG output is suspiciously short; likely empty.')
  }

  // Carry layout warnings through.
  for (const w of args.layout.warnings) {
    warnings.push(w)
  }

  return { ok: warnings.length === 0, warnings }
}
