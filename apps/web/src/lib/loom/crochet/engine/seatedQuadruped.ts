/**
 * THE SEATED FOUR-LEGGED FIGURE BASE (seated-base-1107): one body, two front
 * legs and two seated back legs with round soles, for ANY seated quadruped (a
 * cat, a dog, a fox, a bear on all fours, a cow, a lamb, a made-up creature).
 * A preset brings its head features (ears, muzzle, eyes, tail); the base
 * brings the pose the cute rules ask of every seated animal:
 *
 *  - a soft PEAR body (wide hips, narrower shoulders) tucked under a head at
 *    least as wide as it (rule 2), no neck: the head sinks onto the shoulders;
 *  - two TAPERED FRONT LEGS worked from a domed round paw, in at the ankle, up to a
 *    slimmer top, stuffed firm at the paw and lighter to an unstuffed, flat,
 *    sewn top (cuteFinish.ts `limbStuffing`, rule 45), sewn close together
 *    under the chin (rule 30) and long enough to reach from the chest to the
 *    table (rules 52-54);
 *  - two SEATED BACK LEGS as BENT TUBES (bentTube.ts): worked from the round
 *    sole (a contrast colour where the toy has paw pads), curving through the
 *    ankle with taller stitches on the outside so the open haunch end sews
 *    flat on the flank while the sole turns to face the front (rule 46),
 *    wide at the sides for seated haunches (rule 4);
 *  - the head RESTS on the shoulders and every leg RESTS on the table
 *    (`PartPlacement.rest`), so the same numbers sit at every size and gauge.
 *
 * Every count comes from the head the preset gives (its widest round and its
 * rounds) through the quadruped-seated ranges in cuteRules.ts, aimed at each
 * range's CUTE END (`SEATED_CUTE_AIM`), not its middle: the body narrower than
 * the head, chunky legs (rule 29) that taper visibly (rule 45), close
 * together (rule 30), only as long as the short drop to the table (rule 52).
 * No number here is a cat's or a dog's.
 *
 * Real stitches throughout: every piece is a spiral from a magic ring built
 * by the locked round builders (the body and front legs `buildSphere`, the
 * back legs `buildBentTube`), relaxed and audited, with its round-by-round
 * words written from the same counts.
 */

import type { AmigurumiPart } from './composition'
import type { AmigurumiSize } from './amigurumiPresets'
import { CUTE_RULES, type CuteQuantity } from './cuteRules'
import { sphereAscent } from './sphereProfile'
import { bentTubeWords, planBend, type BentTubeSpec } from './bentTube'
import { FEET_FORWARD_NOTE, HEAD_TILT_DEG, HEAD_TILT_NOTE, limbStuffWords, limbStuffing, rollAbout } from './cuteFinish'
import { writeInstructions, type YarnFibre } from './program'

interface Dir { x: number; y: number; z: number }

/** The listing view a seated animal is judged and photographed in: nearly
 *  front-on and a touch above (the bar cow's; the cute calf's and lamb's),
 *  so both front legs and both soles show. */
export const SEATED_VIEW = {
  tiltDeg: 78, yawDeg: 8, aimHeightFrac: 0.5, distScale: 1.05, marginFactor: 0.38,
  groundScale: 40, lightRig: 'product' as const, bgHex: '#faf8f5', exposure: 0.34,
}

/** THE HEAD TILT (cuteFinish.ts, rule 36's first cue): the seated base sews
 *  the head on a few degrees towards one shoulder, rolled about the lens. */
const LENS: Dir = (() => { const t = (SEATED_VIEW.yawDeg * Math.PI) / 180; return { x: Math.sin(t), y: Math.cos(t), z: 0 } })()

/** A direction on the head (already turned to the lens), rolled with the
 *  seated base's head tilt: every feature a preset sews on the head goes
 *  through this so the face tilts with the head. */
export function seatedHeadDir(d: Dir, tiltDeg = HEAD_TILT_DEG): Dir {
  return tiltDeg ? rollAbout(d, LENS, tiltDeg) : d
}

// ─── the written pattern (shared with lambPreset.ts) ────────────────────────

/** A closed piece's plain words, minus the closing line. */
export function plainRounds(rounds: number[]): string[] {
  return writeInstructions({ name: 'piece', stitch: 'sc', form: 'sphere', rounds }).slice(0, -1)
}

/** A piece's words with colour changes at the start of the given rounds
 *  (0-based round -> yarn label), then `close`. */
export function withColours(rounds: number[], changes: Record<number, string>, close: string): string[] {
  const lines = plainRounds(rounds)
  const out: string[] = []
  lines.forEach((l, k) => {
    if (changes[k]) out.push(k === 0 ? `Start with the ${changes[k]} yarn.` : `Change to the ${changes[k]} yarn.`)
    out.push(l)
  })
  out.push(close)
  return out
}

/**
 * THE YARN'S LOOK (render-only: no geometry or hash moves). The seated base
 * renders in the bar's plush chenille with the cow's pile, not the program
 * default's crisp plied cotton, which read as twisted rope on a worsted toy
 * (seated-base-1107 r1). The pattern's yarn weight and counts are the
 * preset's own; this is how the toy looks in the photo.
 */
export const SEATED_YARN: { yarnFibre: YarnFibre; fibreTune: Record<string, number | boolean> } = {
  yarnFibre: 'chenille',
  fibreTune: {
    pile_density: 1.8, pile_children: 6, pile_len_mm: 2.6, pile_radius_mm: 0.06, pile_lean: 0.9, pile_tip_lift: 0.4,
    pile_max_radius_mm: 3.2, crush_amt: 0.22, sat_mult: 0.9, pile_dark_only: true,
    // A thinner pile on the pale yarn too (the handmade preset's 0.4): cream
    // paws and soles without it read as crisp popcorn beside the soft main
    // colour (r2).
    hm_pale_pile: 0.4,
  },
}

// ─── the rules the base is sized from ───────────────────────────────────────

/** A point in a quadruped-seated range (cuteRules.ts), by quantity: `at` 0
 *  is the range's least, 1 its most. */
function qAt(q: CuteQuantity, at: number): number {
  const r = CUTE_RULES.find((x) => x.quantity === q)?.ranges['quadruped-seated']
  if (!r) throw new Error(`seated base: no quadruped-seated range for ${q}`)
  return r.min + (r.max - r.min) * at
}

/**
 * WHERE IN EACH RANGE the base aims (0 the range's least, 1 its most). Not
 * the middle: a seated toy reads cute at the CUTE END of its family's ranges
 * (seated-base-1107 r2, judged beside the bar cow): a head clearly wider than
 * the body under it, chunky legs that taper visibly from a round paw to a
 * slim sewn top, legs only as long as the short drop from chin to table, and
 * wide seated haunches. A preset can move any of them through `fit.cute`.
 */
export interface SeatedCuteAim {
  headToBody: number; legToHead: number; joinToPaw: number; legLength: number; legGap: number; haunch: number
}
export const SEATED_CUTE_AIM: SeatedCuteAim = {
  headToBody: 0.7, legToHead: 0.55, joinToPaw: 0.3, legLength: 0.35, legGap: 0, haunch: 0.5,
}

/** The targets the counts are derived from (all ratios; W the head width). */
export function seatedTargets(aim: SeatedCuteAim = SEATED_CUTE_AIM): {
  headToBody: number; legToHead: number; joinToPaw: number; legLength: number; legGap: number; haunch: number
} {
  return {
    headToBody: qAt('headToTorsoWidth', aim.headToBody),
    legToHead: qAt('limbThickness', aim.legToHead),
    joinToPaw: qAt('limbJoinRatio', aim.joinToPaw),
    legLength: qAt('limbLength', aim.legLength),
    legGap: qAt('limbGap', aim.legGap),
    haunch: qAt('haunchToHead', aim.haunch),
  }
}

// ─── the pieces' counts ─────────────────────────────────────────────────────

/**
 * A PEAR (or bean) body worked from the seat up: the magic ring climbs as a
 * ball's cap to the hips, holds a round, narrows a stitch at a time (evenly
 * spread) to the shoulders, then closes as the shoulders' own dome. `rounds`
 * is the whole piece, ring to close.
 */
export function pearRounds(hips: number, shoulders: number, rounds: number): number[] {
  const { up } = sphereAscent(hips)
  const top = Math.min(shoulders, up[up.length - 1]!)
  const down = sphereAscent(top).up.slice(0, -1).reverse()
  const w = up[up.length - 1]!
  const mid = Math.max(1, rounds - up.length - down.length)
  const out = [...up]
  // One round held at the hips, then the taper to the shoulders over the rest.
  const taper = Math.max(1, mid - 1)
  if (mid > 1) out.push(w)
  for (let i = 1; i <= taper; i++) out.push(Math.round(w + ((top - w) * i) / taper))
  return [...out, ...down]
}

/** The seated base's counts for a head (its rounds, at the gauge it is worked
 *  at): every number derived from the head and the rule targets. */
export interface SeatedCounts {
  body: number[]
  frontLeg: number[]
  backLeg: BentTubeSpec
  /** The front legs' join direction across the chest (x, with y 1). */
  frontLegX: number
  /** Rounds at the paw / sole worked in the sole colour. */
  pawRounds: number
  soleRounds: number
}

export interface SeatedFit {
  /** The body's hips over the head's widest round (default 1 / rule 2's middle). */
  hips: number
  /** The least hips over the front legs' span (legs and gap), so a small
   *  toy's legs do not hang wider than its haunches. */
  hipsToLegs: number
  /** The shoulders over the hips. */
  shoulders: number
  /** The body's rounds over the front leg's. */
  bodyLength: number
  /** The front leg's length over rule 52's middle (1 = the rule's). */
  legLength: number
  /** The front leg's width over rule 29's middle. */
  legWidth: number
  /** The back leg's sole over the front paw, its haunch over the sole. */
  sole: number
  haunch: number
  /** The back leg's rounds over the front leg's, and its bend (deg). */
  backLength: number
  bendDeg: number
  /** How far the head sinks onto the shoulders (fraction of its height). */
  headSink: number
  /** Where the front legs are sewn: the height on the chest (the direction's
   *  z, with y 1 the front). How far round the chest that puts them is worked
   *  out from the head, paw and shoulder counts and rule 30's gap, so the gap
   *  holds at every size. */
  frontLegZ: number
  /** How much rounder the paw end is than the leg above it (the ankle steps
   *  in to this fraction of the paw, rule 31). */
  ankle: number
  /** Where in each quadruped-seated range the counts aim (`SEATED_CUTE_AIM`). */
  cute: SeatedCuteAim
  /** Which way the front legs hang. */
  frontLegAim: Dir
  /** Where the back legs are sewn and which way their open end points. */
  backLegDir: Dir
  backLegAim: Dir
  /** Which way the back leg's curl turns (the sole's side). */
  backLegSpin: Dir
  /** The front leg's stuffing taper (cuteFinish `limbStuffing`): firm over
   *  this fraction from the paw, easing to `light`, the last `empty` rounds
   *  unstuffed and flattened. */
  stuff: { firm: number; light: number; empty: number }
}

export const SEATED_FIT: SeatedFit = {
  hips: 0.95,
  hipsToLegs: 0.8,
  shoulders: 0.75,
  bodyLength: 1.1,
  legLength: 0.9,
  legWidth: 0.95,
  sole: 1.0,
  haunch: 1.2,
  backLength: 0.85,
  bendDeg: 90,
  headSink: 0.5,
  frontLegZ: 0.05,
  ankle: 0.85,
  cute: SEATED_CUTE_AIM,
  frontLegAim: { x: 0, y: 0.4, z: -1 },
  backLegDir: { x: 1, y: -0.6, z: -0.45 },
  backLegAim: { x: 0.8, y: 0.6, z: 0 },
  backLegSpin: { x: 0, y: 1, z: 0 },
  stuff: { firm: 0.4, light: 0.3, empty: 2 },
}

/** The spread's measured fit (see `seatedCounts`). */
const SPREAD_FIT = 1.064

/** A stuffed piece's settled width across, in yarn radii, for its widest
 *  round of `n` stitches: about 0.98 a stitch (amigurumiPresets
 *  `profileSizeMm`) plus the yarn's own thickness each side, which is what
 *  makes a slim leg fatter than its count (a 7-stitch leg settles 8.9 yarn
 *  radii across, measured). */
const widthYr = (n: number): number => 0.98 * n + 2

export function seatedCounts(head: number[], fit: SeatedFit = SEATED_FIT): SeatedCounts {
  const t = seatedTargets(fit.cute)
  const headEq = Math.max(...head)
  // The front leg: rule 29's width round the paw, rule 45's at the top, and
  // rule 52's length of the head's height (the head's rounds; plus the top
  // round that hides under the chin). A paw of seven is the slimmest that
  // still tapers (7 to 5); a paw under eight tapers to five.
  const paw = Math.max(7, Math.round(headEq * t.legToHead * fit.legWidth))
  const top = Math.max(paw < 8 ? 5 : 6, Math.round(paw * t.joinToPaw))
  const legRounds = Math.max(6, Math.round(t.legLength * head.length * fit.legLength) + 1)
  const frontLeg = limbRounds(paw, top, legRounds, fit.ankle)
  // The gap between the front legs (rule 30's range at `cute.legGap`).
  const gap = t.legGap
  // The body: rule 2's width under the head, and never narrower than the
  // two front legs and their gap (on a small toy a leg is a big share of the
  // head, and legs wider than the hips leave no room for the haunches).
  const legSpan = 2 * widthYr(paw) + gap * widthYr(headEq)
  const hips = Math.max(Math.round((headEq / t.headToBody) * fit.hips), Math.round(((legSpan - 2) / 0.98) * fit.hipsToLegs))
  const shoulders = Math.max(6, Math.round(hips * fit.shoulders))
  // As tall as the legs plus the head's sink, so the chin sits on the legs'
  // tops; never so short that the pear has no room to narrow.
  const minBody = sphereAscent(hips).up.length + sphereAscent(shoulders).up.length + Math.ceil((hips - shoulders) / 2)
  const bodyRounds = Math.max(minBody, Math.round(legRounds * fit.bodyLength))
  const body = pearRounds(hips, shoulders, bodyRounds)
  // The back leg: a round sole about the paw's size, opening to the haunch,
  // the bend worked over the rounds after the sole.
  const sole = Math.max(7, Math.round(paw * fit.sole))
  const haunch = Math.round(sole * fit.haunch)
  const n = Math.max(6, Math.round(legRounds * fit.backLength))
  const solePart = ringUp(sole)
  const back: number[] = [...solePart]
  const rest = Math.max(2, n - back.length)
  for (let i = 1; i <= rest; i++) back.push(Math.round(sole + ((haunch - sole) * i) / rest))
  const backLeg = planBend(back, { angleDeg: fit.bendDeg, from: (solePart.length) / Math.max(1, back.length - 1), to: 0.95 }).spec
  // The front legs' spread: each leg's centre half the gap plus half a paw
  // out from the middle, on the shoulders' circle (in yarn radii). SPREAD_FIT
  // is measured: the legs hang from below the shoulders, where the pear is
  // wider, and lean a little forward.
  const sin = Math.min(0.97, (SPREAD_FIT * (gap * widthYr(headEq) + widthYr(paw))) / widthYr(shoulders))
  const frontLegX = sin / Math.sqrt(1 - sin * sin)
  return { body, frontLeg, backLeg, frontLegX, pawRounds: ringUp(paw).length, soleRounds: solePart.length }
}

/** The base's piece profiles for a head (body, front leg, back leg), for
 *  the audited-profile list. */
export function seatedAuditedProfiles(head: number[], fit: SeatedFit = SEATED_FIT): number[][] {
  const c = seatedCounts(head, fit)
  return [c.body, c.frontLeg, c.backLeg.rounds]
}

/** The rounds from a magic ring up to `n` stitches: a ball's cap
 *  (`sphereAscent`), and for a small round whose cap the walk leaves at six,
 *  straight on to `n` (a 7- or 8-stitch paw on a small toy). */
function ringUp(n: number): number[] {
  const up = sphereAscent(n).up
  return up[up.length - 1]! < n ? [...up, n] : up
}

/**
 * A front leg with a ROUND PAW: the ring domes up to the paw (`ringUp`, with
 * a middle round added when the walk would jump straight from the ring to a
 * wide paw, so the end is a dome, not a flat disc), holds a round, steps in
 * at the ankle (`ankle` of the paw, so the paw reads fatter than the leg,
 * rule 31), then narrows a stitch at a time to the slim top (rule 45), which
 * is flattened and sewn, not closed.
 */
function limbRounds(paw: number, top: number, length: number, ankle: number): number[] {
  let up = ringUp(paw)
  if (up.length === 2 && paw >= 9) up = [6, Math.round((6 + paw) / 2), paw]
  const out = [...up, paw]
  const t = Math.min(top, paw)
  const neck = Math.max(t, Math.round(paw * ankle))
  const taper = Math.max(1, length - out.length)
  for (let i = 0; i < taper; i++) out.push(Math.round(neck + ((t - neck) * i) / Math.max(1, taper - 1)))
  return out
}

// ─── the base's pieces ──────────────────────────────────────────────────────

export interface SeatedQuadrupedOptions {
  size: AmigurumiSize
  /** The head's rounds (worked from the crown, at the toy's gauge). */
  head: number[]
  /** The yarn radius the pieces are worked in (mm, at the gauge). */
  yarnRadiusMm: number
  mainHex: string
  /** The paws' and soles' colour (absent = all in the main yarn). */
  soleHex?: string
  /** The yarn label the maker reads for the sole colour. */
  soleLabel?: string
  fit?: Partial<SeatedFit>
}

export interface SeatedQuadrupedBase {
  /** body, head, front-leg-l/r, back-leg-l/r, in build order: the preset adds
   *  its head features (on 'head') and a tail (on 'body') after them. */
  parts: AmigurumiPart[]
  counts: SeatedCounts
}

const CLOSE = 'Stuff firmly, then fasten off, thread the tail through the final round and draw the opening closed.'

export function seatedQuadrupedBase(o: SeatedQuadrupedOptions): SeatedQuadrupedBase {
  const fit = { ...SEATED_FIT, ...o.fit }
  const c = seatedCounts(o.head, fit)
  const sole = o.soleHex
  const soleLabel = o.soleLabel ?? 'contrast'
  const parts: AmigurumiPart[] = [
    {
      name: 'body', stitch: 'sc', rounds: c.body, colourHex: o.mainHex,
      words: [...plainRounds(c.body), CLOSE],
      place: { on: 'ground' },
    },
    {
      name: 'head', stitch: 'sc', rounds: o.head, colourHex: o.mainHex,
      sewNote: `straight onto the top of the body with no neck, sunk down onto the shoulders so the body tucks under the chin; ${HEAD_TILT_NOTE}`,
      // A closed piece settles ~1.84 yarn radii a round tall (amigurumiPresets
      // `profileSizeMm`): the head sinks that fraction of its own height.
      place: { on: 'body', overlap: fit.headSink * o.head.length * 1.84 * o.yarnRadiusMm, offset: { y: 2 }, axis: seatedHeadDir({ x: 0, y: 0, z: 1 }) },
    },
  ]
  const legEmpty = fit.stuff.empty
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'front-leg-l' : 'front-leg-r', stitch: 'sc', rounds: c.frontLeg, colourHex: o.mainHex,
      ...(sole ? {
        colourChanges: [{ fromRound: 1, hex: sole, label: soleLabel }, { fromRound: c.pawRounds + 1, hex: o.mainHex, label: 'main' }],
        words: withColours(c.frontLeg, { 0: soleLabel, [c.pawRounds]: 'main' }, limbStuffWords(legEmpty)),
      } : { words: [...plainRounds(c.frontLeg), limbStuffWords(legEmpty)] }),
      stuffByRound: limbStuffing(c.frontLeg, fit.stuff),
      sewNote: 'by the slim flat top at the front of the chest just under the chin, close together, hanging straight down so each paw rests on the table',
      place: {
        on: 'body',
        dir: { x: side * c.frontLegX, y: 1, z: fit.frontLegZ },
        aim: { x: side * fit.frontLegAim.x, y: fit.frontLegAim.y, z: fit.frontLegAim.z },
        seat: 2, poleIn: false, surfaceFit: 'points', rest: 0,
      },
    })
  }
  const backWords = bentTubeWords(c.backLeg, { name: 'back leg' })
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'back-leg-l' : 'back-leg-r', stitch: 'sc', rounds: c.backLeg.rounds, colourHex: o.mainHex,
      bentTube: { plan: c.backLeg.plan },
      ...(sole ? { colourChanges: [{ fromRound: 1, hex: sole, label: soleLabel }, { fromRound: c.soleRounds + 1, hex: o.mainHex, label: 'main' }] } : {}),
      words: sole
        ? [`Start with the ${soleLabel} yarn (the round sole).`, ...backWords.slice(0, c.soleRounds), 'Change to the main yarn.', ...backWords.slice(c.soleRounds)]
        : backWords,
      sewNote: `${FEET_FORWARD_NOTE}; sew the open end flat on the flank, the curve turning the sole to the front, so the leg rests on the table beside the front paws`,
      place: {
        on: 'body',
        dir: { x: side * fit.backLegDir.x, y: fit.backLegDir.y, z: fit.backLegDir.z },
        aim: { x: side * fit.backLegAim.x, y: fit.backLegAim.y, z: fit.backLegAim.z },
        spin: { x: side * fit.backLegSpin.x, y: fit.backLegSpin.y, z: fit.backLegSpin.z },
        seat: 2, poleIn: false, surfaceFit: 'points', rest: 0,
      },
    })
  }
  return { parts, counts: c }
}
