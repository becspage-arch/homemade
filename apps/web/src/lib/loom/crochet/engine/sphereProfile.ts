/**
 * THE SPHERE ROUND PROFILE — how many stitches each round of a ball wants.
 *
 * ONE source of arithmetic for the two places that ask the question:
 *
 *  - `buildSphere` (shaping.ts), when it derives its own counts — the `ball`
 *    swatch's "eq-36 derived" profile.
 *  - `amigurumiPresets.ts`, when it writes a PATTERN for a closed round part
 *    (a bear's head, a body, the amigurumi ball). Those go down the pattern
 *    branch of `buildSphere`, so the counts must be written out; the pattern
 *    text the customer reads (`program.ts`) is generated from the same array,
 *    which is why it follows automatically.
 *
 * WHY IT MATTERS (§8f-9, §8f-10). `ballRounds` climbed in sixes straight to the
 * equator and then held. A +6 round grows its radius by 6·pitch/2π = 0.955 of a
 * stitch pitch, which is very slightly MORE meridian than a round of fabric has
 * to give — so a +6 cap has no slack left to dome with, and the first plateau
 * round after it is a hard corner. Measured: 36–38° of crease, and the settled
 * head reads as a rounded tin can. The `ball` swatch, on these derived counts,
 * measures 9.6° on the same relaxer.
 *
 * THE MATHS. A sphere of `equator` stitches round its middle has radius
 * R = equator·sw / 2π (sw = the stitch pitch). Walk down the meridian one round
 * pitch at a time from the top pole; the latitude at meridian distance m wants
 * 2π·R·sin(m/R) / sw stitches. Round that to an integer and move at most ±6 a
 * round toward it — the craft standard, and what the pole can physically fit.
 * The result climbs in sixes while the sphere is still growing fast, then eases
 * off (+5, +4, +2, +1, 0) as the latitude flattens toward the equator. That
 * easing IS the dome: every round arrives tangent to the one below it, so there
 * is no corner for the crease to live at.
 *
 * WRITABILITY. Each round is an integer count and each step is an integer
 * number of increases or decreases spread evenly through the round — exactly
 * how a designer writes it ("[sc 6, inc] × 4, sc 3"). The one liberty taken
 * over the raw derivation is that `sphereRounds` MIRRORS the ascent for the
 * descent: the raw walk lands its sample points asymmetrically about the
 * equator and finishes on a partial round (9 or 11 stitches for eq-24/36),
 * which is a hole to sew shut rather than a pole to close. A real sphere
 * pattern is a palindrome, and so is this.
 */

import { STITCHES, rowPitchYr, type StitchId } from './dictionary'

/** The magic ring's own meridian radius, in yarn radii — `buildSphere`'s `rr`
 *  for a derived ball (it draws the ring tight so the pole closes). */
export const SPHERE_RING_YR = 0.85

/** Meridian advance per round as a multiple of the row pitch — `buildSphere`'s
 *  `drift`. Round work travels very slightly further per round than a flat row. */
export const SPHERE_DRIFT_SCALE = 1.05

/**
 * The raw walk down the meridian, in whatever units the caller's gauge is in.
 * `buildSphere` calls this with its own mm figures (so a per-swatch gauge
 * override still works); the preset helpers below call it in yarn radii, where
 * the yarn radius cancels and only the count comes out.
 */
export function sphereCountsFromGauge(
  equator: number,
  /** Stitch pitch (one stitch's width along the round). */
  sw: number,
  /** Meridian advance per round. */
  drift: number,
  /** Meridian distance already spent on the magic ring. */
  rr: number,
): number[] {
  const R = (equator * sw) / (2 * Math.PI)
  const mMax = Math.PI * R - rr
  const counts: number[] = []
  let prev = 0
  for (let m = rr + drift; m <= mMax - drift * 0.35; m += drift) {
    const target = Math.max(4, Math.round((2 * Math.PI * Math.max(R * Math.sin(m / R), 1e-3)) / sw))
    // 6 in the ring, then AT MOST ±6 a round toward what the latitude wants.
    prev = prev === 0 ? Math.min(6, target) : prev + Math.max(-6, Math.min(6, target - prev))
    counts.push(prev)
  }
  return counts
}

/**
 * The ascent of that walk: the rounds from the magic ring down to (and
 * including) the first round that reaches the widest count, plus how many
 * rounds the raw walk spends AT that count.
 */
export function sphereAscent(
  equator: number,
  stitch: StitchId = 'sc',
): { up: number[]; plateau: number } {
  const sw = STITCHES[stitch].gaugeYr
  const raw = sphereCountsFromGauge(equator, sw, rowPitchYr(stitch) * SPHERE_DRIFT_SCALE, SPHERE_RING_YR)
  const widest = Math.max(...raw)
  const top = raw.indexOf(widest)
  return { up: raw.slice(0, top + 1), plateau: raw.filter((c) => c === widest).length }
}

/**
 * A SPHERE: the derived ascent, its equator rounds, then the ascent mirrored.
 *
 * `extraPlateau` adds straight rounds at the equator, which stretches the ball
 * into a capsule without putting a corner back — the profile arrives at the
 * equator tangentially (its last steps are +1, then 0), so a straight round
 * after it continues the surface rather than turning it. That is how the egg
 * and the slightly-long bear body are made.
 */
export function sphereRounds(equator: number, extraPlateau = 0, stitch: StitchId = 'sc'): number[] {
  const { up, plateau } = sphereAscent(equator, stitch)
  const widest = up[up.length - 1]!
  const middle = Array.from({ length: Math.max(0, plateau - 1) + extraPlateau }, () => widest)
  return [...up, ...middle, ...up.slice(0, -1).reverse()]
}

/** The widest round of `sphereRounds(equator)` — the count actually reached,
 *  which is `equator` itself for every equator ≥ 12. */
export function sphereEquator(equator: number, stitch: StitchId = 'sc'): number {
  const { up } = sphereAscent(equator, stitch)
  return up[up.length - 1]!
}
