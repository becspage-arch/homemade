/**
 * Written stitch-along, derived from the legend. The order follows how a piece
 * is actually worked: lay the shaded fills first, add stems and outlines over
 * them, then the raised wheels, and finish with the knots that sit on top.
 *
 * Voice: plain and instructional, like a recipe method — no flourish, no
 * disclaimers ([[feedback_mindset_voice]] / the Homemade voice rules).
 */

import type { LegendRow, PatternStep } from './types'

/** Group legend rows into worked phases by stitch family. */
function phaseOf(row: LegendRow): number {
  const s = row.stitchSlug
  if (s.includes('long-and-short') || s.includes('satin')) return 0
  if (s.includes('stem') || s.includes('back') || s.includes('straight')) return 1
  if (s.includes('woven-wheel') || s.includes('ribbed')) return 2
  return 3 // knots, seed, detail
}

const PHASE_LEAD: Record<number, string> = {
  0: 'Fill the shaded areas first.',
  1: 'Work the stems and outlines over the fills.',
  2: 'Add the raised wheels.',
  3: 'Finish with the knots and scattered details.',
}

export function buildSteps(legend: LegendRow[]): PatternStep[] {
  const steps: PatternStep[] = []
  let order = 1

  steps.push({
    order: order++,
    text: 'Transfer the design to your cloth and mount it in the hoop, keeping the fabric drum-tight.',
    symbols: [],
  })

  const byPhase = new Map<number, LegendRow[]>()
  for (const row of legend) {
    const p = phaseOf(row)
    const arr = byPhase.get(p) ?? []
    arr.push(row)
    byPhase.set(p, arr)
  }

  for (const phase of [0, 1, 2, 3]) {
    const rows = byPhase.get(phase)
    if (!rows || rows.length === 0) continue
    let first = true
    for (const row of rows) {
      const lead = first ? `${PHASE_LEAD[phase]} ` : ''
      first = false
      steps.push({
        order: order++,
        text:
          `${lead}Work ${row.area} (${row.symbol}) in ${row.stitchName.toLowerCase()} ` +
          `using DMC ${row.code} ${row.name.toLowerCase()}, ${row.strands} strands.`,
        symbols: [row.symbol],
      })
    }
  }

  steps.push({
    order: order++,
    text: 'Press from the back over a soft towel, lace or frame the finished piece, and trim any tails.',
    symbols: [],
  })

  return steps
}
