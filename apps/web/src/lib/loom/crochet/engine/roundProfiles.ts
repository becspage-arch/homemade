/**
 * The plain ROUND PROFILES every amigurumi piece is counted in — a ball, a
 * tapered tube, a thin cord — as stitch counts per round. Split out of
 * amigurumiPresets.ts (Highland cow, 2026-10-10) so a base in its own module
 * (cowPreset.ts) can count its pieces without importing the preset registry
 * that imports it back. Every function is byte-for-byte the one that lived
 * in amigurumiPresets.ts, which re-exports them, so no caller changes.
 */

/**
 * A ball: climbs in sixes to the equator, holds, comes back down in sixes.
 *
 * §8f-10: this is the OLD profile and it is not a sphere — a +6 round spends its
 * whole meridian allowance on radius, so the cap is a flat disc and the first
 * plateau round after it is a hard corner (36–38° of crease measured, a rounded
 * tin can). Closed round parts now use `sphereRounds`. `ballRounds` stays for the
 * pieces measured NOT to gain from a sphere profile — the 4–5-round neck, muzzle
 * and bear ear, whose one increase round cannot dome whatever the counts say —
 * and for the audited profiles already in the wild.
 */
export function ballRounds(equator: number, plateau: number): number[] {
  const up: number[] = []
  for (let n = 6; n <= equator; n += 6) up.push(n)
  return [...up, ...Array.from({ length: plateau }, () => equator), ...up.slice(0, -1).reverse()]
}

/** A tapered tube: climbs in sixes, holds, then narrows in twos to a rounded tip. */
export function tubeRounds(equator: number, straight: number): number[] {
  const up: number[] = []
  for (let n = 6; n <= equator; n += 6) up.push(n)
  const down: number[] = []
  for (let n = equator - 2; n >= 6; n -= 2) down.push(n)
  return [...up, ...Array.from({ length: straight }, () => equator), ...down]
}

/**
 * A thin CORD: the magic ring's six stitches worked straight up for `rounds`
 * rounds. A cat's tail, and a dog's stub.
 *
 * It has no shaping at all, which is why it is its own helper rather than a
 * degenerate `tubeRounds`: six stitches is already as narrow as a spiral gets,
 * so there is nothing to increase toward and nothing to decrease back to — a
 * real tail is worked exactly like this and the end is closed by drawing the
 * last six stitches together. Measured 16.0 x 31.3 mm at five rounds and
 * 16.1 x 55.5 at nine (worsted), i.e. a tail that is genuinely long and thin
 * rather than a limb shrunk by `scale`, which shortens as it slims.
 */
export function cordRounds(rounds: number): number[] {
  return Array.from({ length: rounds }, () => 6)
}

