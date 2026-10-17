/**
 * WHICH PIECES MAY TAKE THE PHOTOREAL FINISH.
 *
 * The photoreal hero step (scripts/loom-pattern.ts `photorealHero`) is a Fal
 * creative upscale at creativity 0.55 behind a structure-only fidelity gate.
 * On a plain swatch or a toy that is a texture pass. On a CHARTED colourwork
 * piece (a tapestry or intarsia panel, where every stitch has its own colour
 * from the chart) it is a model repainting the picture: the gate measures
 * structure, not whether each stitch is still the chart's colour, so a finish
 * can add a spot, a gill, a blade of grass or a soft shadow the chart does not
 * have and still pass. The hero must be the exact stitched chart, never drawn
 * ([[feedback_hero_must_be_exact_pattern]], [[feedback_no_faking_stitch_formation]]),
 * so a charted piece ships the deterministic Blender base render and nothing
 * else. Pure, so the render scripts and the tests share the one rule.
 */

import type { CompositionProgram } from './composition'
import type { CrochetProgram } from './program'

/** True when the program carries a per-stitch colour chart (tapestry / intarsia). */
export function isChartedColourwork(program: CrochetProgram | CompositionProgram | null | undefined): boolean {
  if (!program || !('form' in program)) return false
  return program.form === 'grid' && (program.grid ?? []).some((r) => (r.cellColours?.length ?? 0) > 0)
}

/**
 * May this piece's hero go through any AI image step after the deterministic
 * render? No for charted colourwork; yes otherwise (the existing fidelity gate
 * still decides whether the finished hero is kept).
 */
export function photorealFinishAllowed(program: CrochetProgram | CompositionProgram | null | undefined): boolean {
  return !isChartedColourwork(program)
}
