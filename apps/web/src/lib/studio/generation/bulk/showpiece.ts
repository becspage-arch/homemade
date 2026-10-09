/**
 * THE SHOWPIECE GUARD — the deterministic bar for the heirloom tier.
 *
 * The quick-win tier's risk is that a 48-cell chart does not read as anything.
 * The heirloom tier's risk is the opposite one: that a chart is heirloom-SIZED
 * without being heirloom-COLOURED. The tier's whole promise is 400–600 cells
 * carrying 200–300 distinct flosses, and the converter cannot manufacture that
 * from a subject whose gamut has not got it — a flat two-tone poster blown up to
 * 500 cells comes back at ninety stands and is a dense-lane chart wearing a
 * showpiece's size.
 *
 * So it is measured, not assumed. Every number here is read off the finished
 * PatternData after the confetti pass, which is the chart the customer gets.
 * A short chart is not a defect to be fixed by asking the converter for more —
 * it has already been asked, and climbed as far as the picture allowed. The fix
 * is a different picture, so the repair action is a plain re-roll.
 */
import { computePatternMetrics, type PatternData } from '@homemade/db'

/** The tier's cell band, as `CROSS_STITCH_SIZE_LANES` states it, with a cell of
 *  slack each way for the aspect-ratio rounding in the brief builder. */
export const SHOWPIECE_MIN_CELLS = 396
export const SHOWPIECE_MAX_CELLS = 604

/** The tier's floss band. The floor is the headline claim and the reason the
 *  tier exists; the ceiling is what the printed key and the symbol legend stay
 *  comfortable at. */
export const SHOWPIECE_MIN_COLOURS = 200
export const SHOWPIECE_MAX_COLOURS = 300

/**
 * Confetti ceiling. A 500-cell chart carrying 250 stands will always be busier
 * than a 20-colour sampler, and that is the tier — but there is a difference
 * between fine shading and unstitchable noise, and single stitches marooned in
 * a field of another colour are the second one. Well above what the tier
 * measures in practice, so it only catches a genuine blow-out.
 */
export const SHOWPIECE_MAX_CONFETTI = 0.1

export interface ShowpieceVerdict {
  ok: boolean
  reasons: string[]
}

/** Measure a finished heirloom chart against the tier's own claims. */
export function showpieceVerdict(data: PatternData): ShowpieceVerdict {
  const m = computePatternMetrics(data)
  const reasons: string[] = []

  const longest = Math.max(m.widthCells, m.heightCells)
  if (longest < SHOWPIECE_MIN_CELLS || longest > SHOWPIECE_MAX_CELLS) {
    reasons.push(
      `${m.widthCells}×${m.heightCells} is outside the ${SHOWPIECE_MIN_CELLS}–${SHOWPIECE_MAX_CELLS} cell tier`,
    )
  }
  if (m.colourCount < SHOWPIECE_MIN_COLOURS) {
    reasons.push(
      `${m.colourCount} flosses is under the ${SHOWPIECE_MIN_COLOURS} the heirloom tier promises — the subject has not got the range in it`,
    )
  }
  if (m.colourCount > SHOWPIECE_MAX_COLOURS) {
    reasons.push(`${m.colourCount} flosses is over the ${SHOWPIECE_MAX_COLOURS} the printed key stays readable at`)
  }
  if (m.confettiShare > SHOWPIECE_MAX_CONFETTI) {
    reasons.push(
      `${(m.confettiShare * 100).toFixed(0)}% of stitches are marooned singles (max ${(SHOWPIECE_MAX_CONFETTI * 100).toFixed(0)}%)`,
    )
  }

  return { ok: reasons.length === 0, reasons }
}
