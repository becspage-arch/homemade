/**
 * THE CUTE FINISHES (lamb-1027): the making steps that are "standard for any
 * cutesy toy" (Bec, 27 Oct), as general defaults a preset opts into. Each is
 * a real making step with its own words, never a drawn effect, and each has
 * a cute rule that measures it on the built toy (cuteRules.ts 44-46, and the
 * head tilt under rule 36):
 *
 *  - SUNK EYES (rule 44, eyes-set-in): the safety eye is pushed in until its
 *    washer sits on the stuffing, then a length of yarn is taken from behind
 *    the eye through to the back of the head and pulled tight, drawing the eye
 *    and the fabric round it into the face (`CompositionProp.sink`: the eye
 *    moves in and the host's fabric round it dimples with it, re-audited);
 *  - LIMB STUFFING TAPER (rule 45, limbs-slim-at-join): an arm or leg is
 *    stuffed firmly at the foot and more and more lightly towards the top,
 *    the last rounds left unstuffed and flattened to sew on
 *    (`AmigurumiPart.stuffByRound`: the stuffing pressure per round in the
 *    relax, so the limb really settles slimmer at the join);
 *  - FEET FORWARD (rule 46, feet-forward): a seated back leg is sewn with its
 *    magic-ring end, the round sole, facing the front, worked in a contrast
 *    colour for its first rounds where it suits;
 *  - HEAD TILT (rule 36's first cue): the head is sewn on a few degrees off
 *    upright, the face and everything on it turned with it.
 *
 * Opt-in: a preset that does not call these builds exactly as before.
 */

import type { V3 } from '../yarnLoop'

// ─── sunk eyes ──────────────────────────────────────────────────────────────

/** Where a sunk safety eye is seated and how far the pull draws it in, for
 *  an eye of radius `r` mm: the dome's centre a third of a radius under the
 *  fabric (the shank through, the washer on the stuffing), then the pull
 *  takes it and the fabric round it in by `depth` radii (default 0.35). */
export function sunkEye(r: number, depth = 0.35): { seat: number; sink: number } {
  return { seat: r * 0.35, sink: r * depth }
}

/** The finishing words for sunk eyes (said once, in the face section). */
export const SINK_EYES_WORDS =
  'Sink the eyes (they were fitted, washers pushed right down, before the head was stuffed): thread a long length of the face yarn on a needle, ' +
  'take it in just beside one eye, out at the back of the head, back in a stitch away and out just beside the other eye, then back to the start; ' +
  'pull the yarn tight through to the back of the head to sink the eyes into the face, so the fabric round each eye dips in and the eyes sit in the face, not on it. Knot the ends together at the back and bury them.'

// ─── limb stuffing taper ────────────────────────────────────────────────────

/**
 * The stuffing of a limb worked from the foot (round 0) to the top: firm over
 * the foot (the first `firm` fraction of the rounds), then lighter round by
 * round down to `light` at the top, the last `empty` rounds unstuffed.
 * One factor per round (relax.ts `stuffByRound`).
 */
export function limbStuffing(rounds: number[], opts: { firm?: number; light?: number; empty?: number } = {}): number[] {
  const n = rounds.length
  const firm = Math.max(1, Math.round(n * (opts.firm ?? 0.4)))
  const empty = Math.min(n - firm, Math.max(0, opts.empty ?? 2))
  const light = opts.light ?? 0.3
  const ramp = n - empty - firm
  return rounds.map((_, k) => {
    if (k < firm) return 1
    if (k >= n - empty) return 0
    const t = ramp <= 1 ? 1 : (k - firm + 1) / ramp
    return Math.round((1 - (1 - light) * t) * 100) / 100
  })
}

/** The stuffing words for a tapered limb (replaces a piece's closing line). */
export function limbStuffWords(empty = 2): string {
  return (
    `Stuff firmly at the foot, then lightly towards the top, and leave the last ${empty === 1 ? 'round' : `${empty} rounds`} unstuffed. ` +
    'Flatten the top and sew it closed through both layers (it sews on flat and neat, and the leg is slim where it joins the body).'
  )
}

// ─── feet forward ───────────────────────────────────────────────────────────

/** The sewing note for a seated back leg with its sole forward. */
export const FEET_FORWARD_NOTE =
  'by the inner side, low on the side of the body, with the magic-ring end (the round sole) turned to face the front, so the sole shows from the front and the leg does not bulge out at the side'

// ─── head tilt ──────────────────────────────────────────────────────────────

/** The default head tilt for a seated animal (deg): enough to read (rule
 *  36's cue is 2 deg), small enough to read as a listening look. */
export const HEAD_TILT_DEG = 5

/** Rotate a direction about an axis (the lens direction, so the head rolls
 *  towards one shoulder). Positive = the toy's right side down (Rodrigues). */
export function rollAbout(d: V3, axis: V3, deg: number): V3 {
  const l = Math.hypot(axis.x, axis.y, axis.z) || 1
  const k = { x: axis.x / l, y: axis.y / l, z: axis.z / l }
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a), s = Math.sin(a)
  const kd = k.x * d.x + k.y * d.y + k.z * d.z
  const cr = { x: k.y * d.z - k.z * d.y, y: k.z * d.x - k.x * d.z, z: k.x * d.y - k.y * d.x }
  return {
    x: d.x * c + cr.x * s + k.x * kd * (1 - c),
    y: d.y * c + cr.y * s + k.y * kd * (1 - c),
    z: d.z * c + cr.z * s + k.z * kd * (1 - c),
  }
}

/** The sewing words for a tilted head (a phrase that ends a sewing note). */
export const HEAD_TILT_NOTE = 'pin it on first tipped a few degrees towards one shoulder (a small tilt, not a lean), which makes the face look as if it is listening'
