/**
 * THE HIGHLAND COW — a seated amigurumi calf in chenille (crochet-bar job
 * "hair", 2026-10-10; judged beside bar-highland-cow.png).
 *
 * What a maker builds, and so what is built here (every piece a genuine
 * spiral from a magic ring through the locked round builders, relaxed and
 * audited like every other composition part; nothing drawn):
 *
 *  - a BIG round head on a smaller soft body (the toy-pose proportion: head
 *    equator 60 on a body of 66), sunk deep into the shoulders with no neck;
 *  - a WIDE cream MUZZLE, a flat oval across the lower half of the face, its
 *    magic ring facing out so the two nostril stitches are sewn across it;
 *  - two cream HORNS: pointed cones worked tip first (a four-stitch ring IS
 *    the point, growing a stitch a round), closed flat and sewn high on the
 *    sides of the crown, pointing up and out;
 *  - two round CUPPED EARS (open half-balls pressed into oval cups, round 27)
 *    sewn by their backs to the sides of the head below the horns, hollows
 *    turned forward;
 *  - SAFETY EYES on the muzzle's top edge, wide apart, and two safety-stitched
 *    NOSTRILS (faceEmbroidery `safety-stitched`);
 *  - the CURLY FRINGE: a loop-stitch circle (hairPatch.ts) sewn between the
 *    horns, its loops stacked — longest at the centre — so the tuft mounds
 *    up and spills down to a row above the eyes;
 *  - SEATED: two chunky back legs worked sole first and sewn under the front
 *    of the body so the rounded feet point at the lens, two chunky front
 *    legs sewn at the shoulder corners and hanging straight down to rest on
 *    the table outside the feet; a short cord tail on the flank.
 *
 * Yarn (round 23): a plush chenille at BULKY weight (yr 3.0 mm) on a 6 mm hook,
 * the blanket-weight chenille Highland cow patterns are written for, at
 * counts a third lower than the worsted toy-pose ones so the calf stays about
 * 22 cm tall. The orchestrator's look at r20: "ours is fine and velvety; the
 * bar's is fat chenille with visible rounded stitches" — the bar's head is
 * ~13 fat stitches across the front, the worsted calf's was ~30.
 *
 * Kept in its own module so the bear and bunny bases and their size tables
 * (the toy-pose lane) are untouched; `buildCowProgram` is the whole base.
 */

import type { AmigurumiPart, CompositionProgram, CompositionProp } from './composition'
import type { EmbroideryFeature } from './faceEmbroidery'
import type { HairPatch } from './hairPatch'
import { ballRounds, cordRounds, tubeRounds } from './roundProfiles'
import { ovalRounds, sphereRounds } from './sphereProfile'
import type { AmigurumiSize } from './amigurumiPresets'
import { writeInstructions, type YarnFibre, type YarnWeight } from './program'
import { earPart, type EarPieceOptions } from './earPiece'
import { bentTubeWords, planBend, taperRounds } from './bentTube'
import { taperedLimbRounds } from './limbProfiles'
import { clampGauge, gBall, gCone, gCord, gDisc, gEar, gLoop, gSphere, gSphereRounds, gTube, gaugeYarn, gaugeYarnRadiusMm, nudged } from './gauge'
import type { HeroStage } from '../../render/blenderScene'

export interface CowChoices {
  size: AmigurumiSize
  /** The body yarn: a deep warm brown. */
  mainHex: string
  /** Horns and muzzle: cream. */
  contrastHex: string
  /** Safety eye diameter (mm); 0 = the size's own. */
  eyeMm: number
  /** The listing stage (render-only). */
  stage?: HeroStage
  /** The fine-gauge knob (gauge.ts; AmigurumiChoices.gauge): g x the rounds
   *  and stitches in a yarn g x finer. Absent / 1 = today's calf exactly. */
  gauge?: number
  /** CUPPED EARS (cupped-ear pass, 2026-10-17; `earPiece.ts`): open bowls
   *  with a rolled rim, pinched at the base, the hollow facing out, in place
   *  of the pressed half-ball ears. Opt-in: absent / false = the round 31
   *  ears, and every geometry hash is unchanged. */
  cuppedEars?: boolean
  /** SEATED BACK LEGS (cow back-legs pass, 2026-10-17): the back legs sewn
   *  by their inner side against the body's flanks, low down and just behind
   *  the front legs, the rounded feet facing front (the bar's seated calf).
   *  The default legs float ~12 mm off the body and pass 15-24 mm into the
   *  front legs (squashMetrics, cow M). Opt-in: absent / false = today's legs,
   *  and every geometry hash is unchanged. */
  seatBackLegs?: boolean
  /** THE MUZZLE'S SIZE at a fine gauge (cow-fable-1024d; gauge > 1.15 only,
   *  absent = the size's own muzzle, every hash unchanged). `equator` scales
   *  the capsule's widest round (1 = the size table's; its height on the
   *  face), `across` adds straight rounds along its axis, which lies ACROSS
   *  the face, so the oval grows wider without growing taller (gauge-1
   *  counts, g x at the gauge). The bar's muzzle is a wide flat oval about
   *  two thirds of the head wide and half of it tall; the table's is a 0.42
   *  knob. The nostrils move out with it. */
  muzzleSize?: { equator?: number; across?: number }
  /** THE OVAL MUZZLE (cow-build-1025; gauge > 1.15 only, absent = the
   *  capsule `muzzleSize` builds, every hash unchanged). An oval ball
   *  (`ovalRounds`, a prolate spheroid worked from a magic ring) in place of
   *  the capsule: its counts taper all the way to the middle round, so seen
   *  from the front it is an ellipse — a round top and round ends — where
   *  the capsule's straight rounds read as a flat top edge with squarish
   *  corners. `equator` scales the widest round like `muzzleSize.equator`
   *  (the oval's height on the face, the size table's count x this, g x at
   *  the gauge); `aspect` is its length end to end over that diameter (its
   *  width on the face over its height; the bar's ~1.3). Overrides
   *  `muzzleSize` when both are given. */
  muzzleOval?: { equator?: number; aspect?: number }
  /** COILED CURLS (cow-build-1025; gauge > 1.15 only, absent = the open
   *  rings, every hash unchanged): the fringe's loops worked as tight
   *  coils (`LoopShape.coil`, loopStitch.ts `emitCoil`) — each loop twisted
   *  until it springs back into its own little corkscrew — with the patch's
   *  build-time check that no two coils touch or link (hairPatch.ts
   *  `coilProblems`). */
  coiledCurls?: boolean
  /** CURVED HORNS (bent-tube pass, 2026-10-26; bentTube.ts). Rebecca, 26 Oct:
   *  ours are "straight and like a unicorn horn vs having a cheeky curve
   *  upwards". Each horn a short plump taper worked tip first and CURVED AS IT
   *  IS WORKED — htr on the outside of the curve, dc on the inside (UK) — left
   *  open, stuffed lightly and sewn by the open end, the tip curling up.
   *  `true` = the defaults (`COW_CURVED_HORN`); fields override them. Opt-in:
   *  absent / false = the straight cones, every hash unchanged. */
  curvedHorns?: boolean | Partial<CurvedHornOptions>
  /** TAPERED FRONT LEGS (bent-tube pass; limbProfiles.ts): slim legs worked
   *  from a round foot, narrowing up the leg to a slimmer top (the bar's
   *  "slim, close, tapering to rounded feet"; ours read thick). `true` = the
   *  defaults (`COW_TAPERED_LEG`). Opt-in: absent / false = today's legs. */
  taperedLegs?: boolean | Partial<TaperedLegOptions>
  name?: string
}

/** The curved horn's shape (gauge-1 stitch counts; g x at a fine gauge). */
export interface CurvedHornOptions {
  /** Stitches in the ring: 5 is a point, 6 a blunt nub (bentTube `taperRounds`). */
  tip: number
  /** The base's width (stitches). */
  widest: number
  /** Rounds tip to base. */
  length: number
  /** > 1 widens faster near the tip (plump and short); 1 is a straight cone. */
  plump: number
  /** The requested curve (degrees) and where along the horn it is worked
   *  (fractions of its rounds from the tip). */
  angleDeg: number
  from: number
  to: number
}

/** Starting numbers, chosen against the bar's short plump horns (§8r). */
export const COW_CURVED_HORN: CurvedHornOptions = { tip: 5, widest: 11, length: 8, plump: 1.6, angleDeg: 70, from: 0.15, to: 0.85 }

/** The tapered front leg (gauge-1 stitch counts and rounds; g x at a gauge). */
export interface TaperedLegOptions {
  foot: number
  top: number
  /** Rounds foot to top, close included (default: the size's own leg, so
   *  the calf still stands on it: 12 / 15 / 18 rounds at S / M / L). */
  length?: number
}

/** Starting numbers: today's leg is 12 round (and 12 / 15 / 18 rounds long
 *  at S / M / L, gauge 1). */
export const COW_TAPERED_LEG: TaperedLegOptions = { foot: 11, top: 7 }

export const COW_DEFAULTS: CowChoices = {
  size: 'M',
  // A red-brown (hue ~16°): the bar's chenille is a redder brown than the
  // hair job's #7a4a35, which the warm windowsill light pushed to orange.
  // Round 12: the set's warm light and the chenille grade push a brown ~+7° hue
  // and +0.2 saturation (measured: #74412f rendered h 22° s 0.92 where the bar
  // is h 15° s 0.73), so the yarn is dyed redder and softer than it will read.
  // Round 17 (Rebecca's look at r15): a shade lighter and warmer still — the
  // bar's plush reads lighter than #6b3f33 did on the windowsill.
  // Round 19: measured on the r18 windowsill render beside the bar at the same
  // body spot — ours h 21° s 0.99 against the bar's h 13° s 0.85 (v equal), so
  // the chenille grade still pushes the dye orange and saturated. A duller,
  // slightly bluer red-brown dye renders as the bar's.
  // Round 21: the orchestrator's eye on r20 — "a touch maroon; the bar's is
  // warm milk-chocolate". Hue up from 4° to 12° and a shade lighter.
  // Round 23: a shade deeper and less orange (#86564a read bright in the window light).
  // Round 27 (the orchestrator's look at r26: "a shade darker and redder than
  // the bar's warm milk chocolate"): a step lighter and ~5° warmer (hue 15°).
  mainHex: '#885a4a',
  contrastHex: '#ead9bf',
  // 0 = the size's own eye (PROFILES.eyeMm). Round 24: the renders had been
  // taking this 12 over the profile's 18-20, which is why the eyes read small.
  eyeMm: 0,
}

export const COW_BASE = {
  id: 'cow',
  label: 'Highland cow',
  blurb: 'A seated chenille calf: a big head with a curly loop-stitch fringe between two cream horns, round ears, a wide cream muzzle with stitched nostrils, chunky legs forward.',
  nose: false,
  paws: false,
  contrastFor: 'The horns and the muzzle.',
} as const

interface Dir {
  x: number
  y: number
  z: number
}

interface CowProfile {
  body: number[]
  head: number[]
  muzzle: number[]
  horn: number[]
  ear: number[]
  frontLeg: number[]
  backLeg: number[]
  tail: number[]
  /** Head sink into the body's shoulders (mm): deep, there is no neck. */
  headSink: number
  /** How far the capsule muzzle's centre sits under the face (mm). */
  muzzleSeat: number
  /** The flat ear's pressed thickness (mm, relax.ts `press`). */
  earPress: number
  /** Back-foot and front-hoof drops onto the table (mm). */
  legLift: number
  frontLegLift: number
  /** Safety eye diameter (mm) for this size. */
  eyeMm: number
}

/**
 * A HORN worked tip first: the four-stitch ring is the point, one more stitch
 * each round to a dozen (the cone-ear rule from §8f-11: one a round is a
 * point, two a round is a bump), two straight rounds for the thick base,
 * closed flat in one round. Sewn by the flat end, tip out.
 */
export const COW_HORN_ROUNDS: number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12, 6]

/**
 * THE FLAT EAR (cow round 9): a leaf worked tip first — a six-stitch ring
 * growing THREE a round to eighteen (a gentle cone, so it folds without the
 * cap creasing), three straight rounds, then narrowed three a round and
 * closed — left unstuffed and pressed flat between finger and thumb
 * (`press`), so it is two layers of fabric lying on each other with a soft
 * cup. Sewn by the closed end to the side of the head, standing out sideways
 * with its face turned to the lens. Audited pressed to 14 mm at worsted
 * (9 and 11 fail: two chenille layers are a yarn's width apart, and 14 mm
 * is the measured floor); it settles 39 wide x 54 long.
 */
// Round 22 (the orchestrator's look at r20: "flat thin leaves; the bar's are
// round cupped ears"): the same audited leaf pressed to a fatter lens (press
// 20, not 14) and seated deeper so it tucks in under the horn (a ball grown
// in sixes to 24 and pressed failed the hook audit; a sphere(24) pressed
// failed its interlocks).
export const COW_EAR_ROUNDS: number[] = [6, 9, 12, 12, 9, 6]

/**
 * THE CUPPED EAR (cow round 27; the orchestrator's look at r26: "ours are flat
 * discs; the bar's are round and cupped, with a visible hollow"). A pressed
 * closed piece is a lens whichever way it is turned, so the ear is now an OPEN
 * HALF-BALL: worked from the magic ring in sixes to its widest round and left
 * open there (tube.ts, `anchor: 'ring'`, a domed cap; a straight rim round
 * floated a hook under the press and failed the audit). Never stuffed, pressed
 * gently between finger and thumb into an oval cup (`press`, the plates
 * closing to about nine tenths of its width — harder, the cup is a slab; a
 * round bigger, round 32, it read as a dark flap half the face wide),
 * and sewn by its back (the ring) to the side of the head with the hollow
 * turned forward and out, so the lens looks into the cup.
 */
export const COW_EAR_CUP_ROUNDS: Record<AmigurumiSize, number[]> = {
  S: [6, 12, 18],
  M: [6, 12, 18, 24],
  L: [6, 12, 18, 24, 30],
}

/**
 * THE CUPPED EAR PIECE (cupped-ear pass, 2026-10-17; `earPiece.ts`, opt-in via
 * `CowChoices.cuppedEars`). The bar's ears are round cups with a visible
 * hollow and a thick rolled rim, seated just under the horns and angled
 * forward: an open bowl worked from the ring (+6 a round), worked even for
 * the depth, one round folded back over the outside for the rolled rim, and
 * pinched at the base as it is sewn. Every size audits clean (earPiece.test.ts).
 * Starting numbers only; the look is tuned by eye.
 */
export const COW_CUP_EAR: Record<AmigurumiSize, EarPieceOptions> = {
  S: { kind: 'cup', width: 12, depth: 1, rimRoll: 1, pinch: 0.6 },
  // Fable 23 Oct (r1): 18 round at M (12 read as a quarter of the face width; the bar's cups are about a third).
  // r2: 15 and depth 1 (18 at depth 2 facing the lens read as two huge dark bagels).
  // cow-fable-1024 r3 (optional in the brief): 18 again, at depth 1 and aimed
  // at the key since 1023b (r2's bagels were depth 2 facing the lens); the
  // bar's ears are bigger leaf-shaped cups.
  // cow-fable-1024b r1: 21 read as dinner plates nearly half the face wide; r2: 16 (the bar's cups are a third of the face).
  // r3: 17; a thin unrolled edge was tried in the r3 render but the cow's cup keeps its
  // rolled rim (earPiece.test: rimFold 1 and a 7.5 mm hollow at M; rimRoll 0 gave 7.3).
  // cow-fable-1024c r1: 16 (r4's 17 read a size big with a thick rim).
  M: { kind: 'cup', width: 16, depth: 1, rimRoll: 1, pinch: 0.6 },
  L: { kind: 'cup', width: 15, depth: 2, rimRoll: 1, pinch: 0.6 },
}

/**
 * THE PEAR BODY (cow round 17, Rebecca's look at r15: "the body a soft upright
 * pear", the head about as wide as it). Worked from the magic ring at the
 * SHOULDERS: the sphere ascent of a smaller ball (a rounded shoulder dome),
 * then TWO increases a round down the belly (a slow widening: a +6 round is
 * intrinsically a flat disc, see sphereProfile §8f-10, so a +2 round spends
 * most of its meridian on height — the pear), three straight rounds at the
 * hips, and a quicker descent under the seat. Taller than the old ball and
 * widest low, where the legs sit, so the head no longer dwarfs it. Intrinsic
 * M: 108 wide x 118 tall (the old sphereRounds(54, 1) was 97 x 100).
 */
// Round 21 (the orchestrator's look at r20: "the head is a big ball balanced on
// a narrow neck; the bar's head sits DOWN into broad shoulders, with no neck at
// all, and the body is about as wide as the head at the shoulders"). The pear
// was widest at the hips and narrow at the top, so the head perched on it. Now
// the body is a BALL about the head's width (equator 60 against the head's 60,
// one straight round at the middle), and there is NO neck piece: the head is
// sewn straight onto the ball, sunk `headSink` mm, so the shoulders run into
// the cheeks and the front legs' tops sit beside them. (A can climbing in
// sixes to 66 was tried first and relaxed to a 136 x 54 disc: a +6 round is
// intrinsically flat, §8f-10.)
// Round 27 (the orchestrator's look at r26: "a touch wide and blocky; the bar is
// slightly slimmer"): the ball one equator step slimmer than the head (39
// against the head's 42 at M), still one straight round at the middle.
export const COW_BODY_ROUNDS: Record<AmigurumiSize, number[]> = {
  S: sphereRounds(33, 1),
  M: sphereRounds(39, 1),
  L: sphereRounds(45, 1),
}

const PROFILES: Record<AmigurumiSize, CowProfile> = {
  // Round 27 muzzle: a rounder, more domed egg (one straight round, not two or
  // three: the flat-topped capsule read as a square block) seated shallower so
  // it stands proud of the face. Ears: the open cups, pressed to ~3/4 width.
  S: {
    body: COW_BODY_ROUNDS.S, head: sphereRounds(36, 2),
    muzzle: sphereRounds(12, 1), horn: COW_HORN_ROUNDS.slice(0, 6).concat([6]), ear: COW_EAR_CUP_ROUNDS.S,
    frontLeg: tubeRounds(12, 7), backLeg: ballRounds(18, 3), tail: cordRounds(3),
    headSink: 18, muzzleSeat: 2, earPress: 30, legLift: -4.4, frontLegLift: 11.6, eyeMm: 13,
  },
  M: {
    body: COW_BODY_ROUNDS.M, head: sphereRounds(42, 2),
    muzzle: sphereRounds(18, 1), horn: COW_HORN_ROUNDS.slice(0, 8).concat([6]), ear: COW_EAR_CUP_ROUNDS.M,
    frontLeg: tubeRounds(12, 10), backLeg: ballRounds(18, 4), tail: cordRounds(4),
    headSink: 24, muzzleSeat: 2, earPress: 40, legLift: -12.1, frontLegLift: 17.2, eyeMm: 18,
  },
  L: {
    body: COW_BODY_ROUNDS.L, head: sphereRounds(48, 2),
    muzzle: sphereRounds(21, 1), horn: COW_HORN_ROUNDS.slice(0, 9).concat([6]), ear: COW_EAR_CUP_ROUNDS.L,
    frontLeg: tubeRounds(12, 13), backLeg: ballRounds(18, 5), tail: cordRounds(4),
    headSink: 26, muzzleSeat: 2, earPress: 48, legLift: -12.5, frontLegLift: 30.4, eyeMm: 20,
  },
}

/** The equators and lengths each size's pieces are counted from (the table
 *  above is these at gauge 1; `cowProfileAt` rebuilds it at gauge g). */
const PROFILE_SPEC: Record<AmigurumiSize, {
  body: [number, number]; head: [number, number]; muzzle: [number, number]; hornWidest: number
  frontLeg: [number, number]; backLeg: [number, number]; tail: number
}> = {
  S: { body: [33, 1], head: [36, 2], muzzle: [12, 1], hornWidest: 9, frontLeg: [12, 7], backLeg: [18, 3], tail: 3 },
  M: { body: [39, 1], head: [42, 2], muzzle: [18, 1], hornWidest: 11, frontLeg: [12, 10], backLeg: [18, 4], tail: 4 },
  L: { body: [45, 1], head: [48, 2], muzzle: [21, 1], hornWidest: 12, frontLeg: [12, 13], backLeg: [18, 5], tail: 4 },
}

/**
 * One size's calf at gauge g (gauge.ts): every piece g x the rounds and
 * stitches. The mm placements (sinks, seats, lifts, the ears' press) are
 * kept, because the calf is the same size in mm; only the counts move.
 */
/**
 * The legs' drop onto the table at a gauge, MEASURED like the size table's
 * lifts: at a finer gauge the stuffed body settles a few mm squatter (cow M
 * 115 mm tall at gauge 1.4 against 120 at gauge 1), so the four legs sewn to
 * it sit that much lower. Measured off the settled M calf (17 Oct): every
 * leg's lowest point at gauge 1.3 is 4.0 mm under the table and at 1.4
 * 2.7 mm; at 1.6 it is on it. Added to both leg lifts. Measured the same
 * way off the whole-toy audit (gauge.test.ts SIZES=S,L, 18 Oct): S at 1.3
 * sat 3.7 mm under the table, S at 1.4 1.6 mm (its head nudged, gauge.ts),
 * S at 1.6 1.9 mm, L at 1.4 1.85 mm and L at 1.6 0.87 mm (its ear nudged,
 * gauge.ts); L at 1.3 sits on it.
 * A gauge or size not listed gets none (re-measure before shipping it).
 */
const GAUGE_LEG_LIFT: Record<string, number> = { 'M@1.3': 4.0, 'M@1.4': 2.7, 'S@1.3': 3.7, 'S@1.4': 1.6, 'S@1.6': 1.9, 'L@1.4': 1.85, 'L@1.6': 0.9 }

function cowProfileAt(size: AmigurumiSize, g: number, muzzleSize?: CowChoices['muzzleSize'], muzzleOval?: CowChoices['muzzleOval']): CowProfile {
  const base = PROFILES[size]
  if (g === 1) return base
  const p = PROFILE_SPEC[size]
  const lift = GAUGE_LEG_LIFT[`${size}@${g}`] ?? 0
  const sph = ([eq, extra]: [number, number]): number[] => gSphereRounds(eq, extra, g)
  // The fine-gauge muzzle knob (CowChoices.muzzleSize): the capsule's equator
  // scaled and straight rounds added across the face. g > 1.15 only.
  const mz: [number, number] = g > 1.15 && muzzleSize
    ? [Math.round(p.muzzle[0] * (muzzleSize.equator ?? 1)), p.muzzle[1] + (muzzleSize.across ?? 0)]
    : p.muzzle
  // The oval muzzle (CowChoices.muzzleOval): the widest round g x the
  // table's (scaled), the counts an oval ball's. g > 1.15 only.
  const oval = g > 1.15 && muzzleOval
    ? ovalRounds(gSphere(Math.round(p.muzzle[0] * (muzzleOval.equator ?? 1)), g), muzzleOval.aspect ?? 1.3)
    : undefined
  return {
    ...base,
    body: sph(p.body),
    head: sph(p.head),
    muzzle: oval ?? sph(mz),
    horn: gCone(4, p.hornWidest, 0, 6, g),
    ear: nudged(gDisc(COW_EAR_CUP_ROUNDS[size], g)),
    frontLeg: gTube(p.frontLeg[0], p.frontLeg[1], g),
    backLeg: gBall(p.backLeg[0], p.backLeg[1], g),
    tail: gCord(p.tail, g),
    legLift: base.legLift + lift,
    frontLegLift: base.frontLegLift + lift,
  }
}

/** Every round profile the cow is built from, for the registry's audited
 *  list (`AUDITED_PROFILES`): the save path accepts only pieces on it. */
export const COW_AUDITED_PROFILES: number[][] = (() => {
  const seen = new Set<string>()
  const out: number[][] = []
  for (const s of Object.values(PROFILES)) {
    for (const r of [s.body, s.head, s.muzzle, s.horn, s.ear, s.frontLeg, s.backLeg, s.tail]) {
      const key = r.join(',')
      if (seen.has(key)) continue
      seen.add(key)
      out.push(r)
    }
  }
  return out
})()

/** The calf is photographed nearly front-on, a touch above eye level (the
 *  bar), like the toy-pose bases. */
const COW_YAW = 8
const COW_VIEW = {
  tiltDeg: 78,
  yawDeg: COW_YAW,
  aimHeightFrac: 0.5,
  distScale: 1.05,
  marginFactor: 0.38,
  groundScale: 40,
  lightRig: 'product' as const,
  bgHex: '#faf8f5',
  exposure: 0.34,
}
/** The listing sets frame a 10 cm bear at ~85% of the frame; the calf's horns
 *  want the bar's ~75%. */
// Round 18: the pear body made the calf taller; 0.95 cropped the horn tips.
// Round 27: pulled back a touch so the stage's dried bunch (tied at the frame's
// left edge, its heads reaching toward the toy) stops short of the left foot.
const COW_STAGE_ZOOM = 0.9
const COW_YARN: YarnWeight = 'bulky'
const COW_HOOK_MM = 6
const COW_FIBRE: YarnFibre = 'chenille'
const EYE_HEX = '#080706'

/** Turn a face direction to the camera (a head turn; limbs stay). */
function faceDir(d: Dir, yaw = COW_YAW): Dir {
  const t = (-yaw * Math.PI) / 180
  const c = Math.cos(t)
  const s = Math.sin(t)
  return { x: d.x * c - d.y * s, y: d.x * s + d.y * c, z: d.z }
}

/** Where the pieces are sewn and which way they point (M, measured by the
 *  preview dumps in the hair and cow job logs). */
/** The head is worked SIDE TO SIDE (magic ring under one ear) and stacked
 *  on the neck with its axis across, so its two extra straight rounds make
 *  it wider than it is tall — the bar's head. */
const HEAD_AXIS = { x: 1, y: 0, z: 0 }
/** The capsule muzzle lies ACROSS the lower face (its axis side to side),
 *  sewn on by its side, so the lens sees a wide oval. */
// Round 27: lower on the face (the bar's muzzle sits low, brown showing above it).
const MUZZLE_DIR = { x: 0, y: 1, z: -0.5 }
const MUZZLE_AIM = { x: 1, y: 0, z: 0 }
// Round 19: out of the SIDES of the crown (the bar), less straight up.
const HORN_DIR = { x: 0.78, y: 0.1, z: 0.72 }
const HORN_AIM = { x: 1, y: 0.12, z: 0.42 }
/** The flat ears: sewn by the closed end on the sides of the head, level
 *  with the brow, standing out sideways and a touch down, the pressed face
 *  turned to the lens. */
// Round 28: up at brow level beside the horns (r27's sat at eye level).
const EAR_DIR = { x: 1, y: 0.05, z: 0.5 }
// Round 27 (the cup): `aim` is the cup's axis from its back (the ring, seated
// in the head) out through the open rim — forward and out, a little down, so
// the hollow faces the lens (round 28: mostly toward the camera — at 45° out
// the lens saw the cup's back and the ear read as a flat tab); `spin` (the
// pressed face up) lays the oval's long axis across.
const EAR_AIM = { x: 0.6, y: 0.8, z: -0.05 }
/** The CUPPED ear's aim (`cuppedEars` only; the default ears keep EAR_AIM).
 *  Fable 23 Oct (cow-fable-1023 r1): at EAR_AIM's 37° out the v2 lens saw
 *  the near cup along its axis as a flat coil and the far one edge-on; the
 *  bar's cups face the camera with the hollow open to it, so the bowl now
 *  opens mostly forward, a little out and a touch down. */
// r2: a little more out again (0.45): straight at the lens the hollow was a black disc; the bar's cups are seen ~45°.
// cow-fable-1023b r1 (Rebecca: brown inside like the bar): a touch more
// toward the window key (x 0.55) so the self-coloured hollow is lit, not black.
// r2: and tilted UP toward the key's 30 deg elevation (z 0.15): r1's forward bowls were both in shadow.
// cow-fable-1024b r1 (the orchestrator's audit: ours "hidden behind the head";
// the bar's cups stand out SIDEWAYS just below the horns, facing forward so
// the brown hollow shows): the bowl opens more out (x 0.7) and a touch less up.
// r3: and back toward the lens (x 0.5): at 0.7 the straight-on camera saw each cup edge-on as a rolled coil.
// r4: between (x 0.6): r3's straight-on cups read as flat discs with no hollow.
const CUP_EAR_AIM = { x: 0.6, y: 0.78, z: 0.15 }
// r2: lower still (z 0.1: r1's sat up at the horn tips) and 11 mm out.
/** The cupped ear's place on the head (`cuppedEars` only): a touch lower than
 *  EAR_DIR, at eye-to-brow level under the horns (r2; the bar's). */
// cow-fable-1024b r1: lower on the side of the head (z 0.25) and a touch
// forward, with the cup held further out from the head (CUP_EAR_OUT_MM).
// r4: a touch higher (z 0.18): r3's far ear sat half behind the cheek.
// cow-fable-1024d r2: higher again (z 0.25): on the bigger muzzle the cups ran
// from the brow down to the muzzle's top; the bar's stop at eye level.
const CUP_EAR_DIR = { x: 1, y: 0.1, z: 0.25 }
const CUP_EAR_OUT_MM = 11
const EAR_SPIN = { x: 0, y: 0, z: 1 }
/** Front legs (cow round 9, the bar): two long chunky tubes sewn at the
 *  FRONT of the shoulders, close together, hanging straight down the front
 *  of the body to the table, a touch forward so the hooves land in front. */
// Round 17: further apart (the bar's two front legs stand a leg's width
// apart down the front of the pear) and sewn a little higher on the shoulder.
// Round 19: joined further forward on the shoulder and a shallower seat, so the
// tubes stand proud of the chest with a shadow line behind them (r18: fused).
// Round 20: wider apart still — r19's hooves met as one block at the table.
// Round 21: sewn at the shoulder CORNERS of the can (high and out to the
// sides, so their tops are the broad shoulders under the cheeks) and hanging
// nearly straight down — two chunky parallel tubes from shoulder to table.
// Round 22: r21's legs lay flush against the chest in the same tone and the
// chest read as one slab. Joined further FORWARD on the shoulder with a
// shallow seat and leaning forward, so the tubes stand proud of the chest
// with a shadow line behind them and the hooves land in front of the body.
const FRONT_LEG_DIR = { x: 0.74, y: 0.95, z: 0.5 }
const FRONT_LEG_AIM = { x: 0.1, y: 0.5, z: -1 }
/** Back legs: worked sole first, sewn low on the SIDES of the body, lying
 *  forward along the table OUTSIDE the front legs, the rounded foot to the
 *  lens — so all four legs show, the bar's seated calf. */
// Round 18: further out and forward, so the round feet show beside the
// front legs instead of hiding behind them (the bar's four legs).
// Round 21: splayed out WIDE and forward at each side — the bar's two big
// round back feet sit outside the front legs with their toes level with the hooves.
const BACK_LEG_DIR = { x: 1.0, y: 0.45, z: -0.5 }
const BACK_LEG_AIM = { x: 0.14, y: 1, z: 0.05 }
/** The seated back legs (`CowChoices.seatBackLegs`): the same piece, dir and
 *  aim, moved 46 mm back and 2 mm out from the default's offset so each one
 *  sits against the body's flank behind the front legs. Measured with
 *  squashMetrics on the settled M calf at gauge 1, 1.3 and 1.4: sewn into
 *  the body 7-9 mm (the front legs' joins are 18-21 mm) with a contact patch
 *  of ~1000-1300 mm², and 3-6 mm clear of the front legs. */
// Fable 23 Oct (r2): 4 mm forward and 2 mm out (the bar's back feet sit
// nearly level with the front hooves, sole showing); still within the
// cow-legs grid (forward costs front-leg clearance, out costs join depth).
// After r4: 2 mm forward only — at y -12 the M 1.4 calf's left back leg
// passed 2.3 mm into the front leg (cowBackLegs.test's limit 2.14).
const SEATED_BACK_LEG_OFFSET = { x: 28, y: -14 }
/** The seated back legs' extra drop at a gauge (mm, measured like
 *  `GAUGE_LEG_LIFT`): at M 1.3 the shared leg lift leaves the back feet
 *  1.55 mm above the table (the default legs too), so the seated ones are
 *  set down onto it. A gauge or size not listed gets none. */
const SEATED_BACK_LEG_GAUGE_DROP: Record<string, number> = { 'M@1.3': -1.55 }
const TAIL_DIR = { x: 0.9, y: -0.45, z: -0.15 }
const TAIL_AIM = { x: 1, y: -0.25, z: 0.35 }
/** The fringe circle's centre on the crown, tipped well forward so its lower
 *  loops fall to about a row above the eyes (the bar). */
// Round 14: nearer the top of the crown — at y 0.95 the seven-round circle's
// front edge still reached the eyes.
// Round 24: lower again on the brow (the bulky fringe's five rounds are a smaller circle).
// Round 27 (the orchestrator's look at r26: "a flat tight mat lying on the head
// like a cap; the bar's is a tall tousled mound standing up off the crown"):
// high on the crown again, the curls standing up, so a band of forehead shows.
// Round 28: a touch forward again so the mound spills to the brow.
const HAIR_DIR = { x: 0, y: 0.78, z: 1 }

/** The curly fringe: loop stitch from the magic ring out, four rounds, the
 *  loops longest at the centre so the tuft stands as a mound 2-3 curls deep,
 *  short and round at the edge where they spill onto the forehead. */
export function cowFringe(colourHex: string, size: AmigurumiSize, g = 1, coiled = false): HairPatch {
  // Five rounds at M (a circle ~60 mm across on the crown), loop stitch on
  // rounds 1, 3 and 5 and plain dc between: loops on every other round is
  // how a maker keeps a long-looped fringe from matting, and it is what lets
  // each ring lie open on the one below instead of standing in a crowd.
  // Cow round 10: a bigger circle — the bar's fringe covers the top of the
  // head from ear to ear between the horns, not a patch on the crown.
  // Round 11: six rounds at M (seven fell over the eyes as a mop), loops on
  // the even rounds only; the last round plain is the neat edge it is sewn by.
  // Round 13: seven rounds again (six was a compact cap) but seated high on
  // the crown with short edge loops, so it spreads horn to horn without
  // spilling over the eyes the way round 10's low patch did.
  // Round 23 (bulky yarn): a round is 1.43x deeper, so five rounds at M span
  // what seven did at worsted; the loop sizes below are in yarn radii and were
  // divided by the same, so the curls stay the bar's size against the head.
  // Round 31: a round more at every size (M six rounds, loops on 1/3/5, the
  // sixth plain as the sewing edge) so the standing mound spreads horn to horn.
  // Fine gauge (gauge.ts): g x the rounds, loops on every other round as
  // before, each loop the same size in mm (g x its length in the finer yarn).
  const rounds = gDisc(size === 'S' ? [6, 12, 18, 24, 30] : size === 'L' ? [6, 12, 18, 24, 30, 36, 42] : [6, 12, 18, 24, 30, 36], g)
  const last = rounds.length - 1
  // Fine gauge (Fable 23 Oct, r2): a loop round every round(2g) rounds, so
  // 1.3's eight rounds carry three loop rounds like gauge 1's six (four fat
  // loop rounds mounded over the eyes in r1).
  // cow-fable-1024c r2: at a fine gauge loops on every OTHER round again (four
  // loop rounds at 1.3), a loop in only every fourth stitch, so ~22 fat rings
  // are spread over the disc instead of packed into three concentric rings.
  // cow-fable-1024e r4 tried loops on every THIRD round (0, 3, 6, the rows a
  // ring's width apart) with a loop in every third stitch (24 rings): the
  // rings crowded along each row instead and read as a cauliflower of bumps
  // with fewer holes than r3's, so the final code keeps r3's rows.
  // cow-fable-1024f r2: at a fine gauge the loop rounds are the ODD ones (1,
  // 3, 5, 7 of eight), so the patch's EDGE round carries the spill loops and
  // the plain sewing edge no longer shows as a bald helmet rim across the
  // brow (r1, seen from the bar's camera above eye level); the plain crown
  // round sits under the mound.
  const step = g > 1.15 ? 2 : Math.max(2, Math.round(2 * g))
  const loopRounds = rounds.map((_, k) => k).filter((k) => (g > 1.15 ? k % 2 === 1 : k % step === 0 || (k === last && last % step === 0)))
  return {
    name: 'fringe',
    on: 'head',
    // Fine gauge (Fable 23 Oct, r3): the circle's centre higher on the crown
    // (y 0.66) — at 1.3 the fat-looped mound of r1/r2 hung over the far eye.
    // cow-fable-1024b r1 (the audit: the fringe sat low over the eyes, the calf
    // looked down and grumpy): higher on the crown again (y 0.45) so a band of
    // face shows between the curls and the eyes, like the bar's.
    // cow-fable-1024f r1 (the audit of 1024e r3: the fringe a mat down to the
    // eyes, overhanging them like a frown; the bar's sits on TOP between the
    // horns with an eye's height of plain brow below its lowest curls): the
    // circle's centre higher still (y 0.38), the standing heap kept.
    dir: faceDir(g > 1.15 ? { ...HAIR_DIR, y: 0.34 } : HAIR_DIR),
    stitch: 'loopst',
    rounds,
    firstLoopRound: 0,
    loopRounds,
    // BIG open round loops — the bar's curls are rings about a tenth of the
    // head's width across (~11 mm on this calf): each loop is worked over two
    // fingers, about as wide as it is long. The loops LEAN OUTWARD from the
    // circle's centre (droop < 0: a loop pulled down the work away from the
    // ring), 70° off the head, in a fan of directions (vary 0.35 turns the
    // plane ±63°), so each ring lies tilted with its face to the viewer and
    // the rings tile over each other out to the edge — round 6's loops stood
    // straight out and read end-on as a small flat whorl.
    // Round 8: more variation (vary 0.45: lengths ±45%, planes ±80°) so no
    // two rings match — round 7's tiled like onion rings — and the loose
    // loops drawn at a full yarn radius: a chenille loop off the hook is as
    // fat as the yarn, not the 0.62 the stitches are pulled down to.
    // Round 22 (the orchestrator's look at r20: "a flat pancake of loose thin
    // loops; the bar's is a tall plump mound of tight fat curls"): shorter,
    // narrower loops standing further off the head (droop -50), every other
    // one given a full twist so it springs into a tight curl, the strand fatter.
    // Round 24: BIG open rings lying over the head (r23's small tight curls
    // stood as a dense cauliflower hat).
    // Round 27: smaller springy curls of MIXED sizes (vary 0.55) standing up off
    // the crown (droop -35) in a tall tousled mound — r26's big rings lay flat.
    // Round 28: r27's stood as a solid helmet of packed curls — a little smaller, leaning out more.
    // Round 29: BIGGER open rings (the bar's are ~17 mm across on this head; r28's 10 mm curls packed into a dome).
    // cow-fable-1023b r1 (Rebecca: the curls "too even"): at a fine gauge
    // more variety (vary 0.6: lengths +-60%, planes wider) and a touch
    // smaller, so the rings differ and gaps open between them.
    // cow-fable-1024 r1 (Rebecca: yes to looser curls): at a fine gauge the
    // rings stand up more (droop -35: 1023b r4's -50 tiled them flat into a
    // beret) and vary more (0.6), with a loop in every OTHER stitch only
    // (loopEvery 2: plainEvery 4 was loops in three of four, packed edge to
    // edge) so the head shows between the rings like the bar's.
    // r2: OPEN rings — wider (halfWidth 3.0: the hole shows, r1's fat 13 mm
    // loops were sausages pressed together) and a loop in every THIRD stitch.
    // r3: between r1 (a neat beret of fat sausages) and r2 (a wiry tangle of
    // thin 18 mm noodles): rings a size smaller (4.6 x 2.7), less chaos
    // (vary 0.5), the strand plumper again in the scene (hm_loop_mult 1.25).
    // r4: rounder rings (4.4 x 2.9) so more face the viewer as rings, not leaning loops.
    // cow-fable-1024b r1 (the audit: "pale beige noodle worms"; the bar's are
    // smaller, tighter rings with a visible hole): rings a size smaller (3.6 x
    // 2.2) on a thinner strand (hm_loop_mult 1.0 in the scene) so the hole stays.
    // r2: halfway back (4.0 x 2.6; r1's 3.6 x 2.2 coils packed into brain-textured popcorn with no holes).
    // cow-fable-1024c r1 (the orchestrator's audit of 1024b r4: "a flat brown
    // cap of noodles laid over the brow"; the bar's is a tousled heap of
    // distinct loose rings standing up off the head, each with a hole): the
    // rings ROUNDER (halfWidth 3.0, so the hole shows face-on) and standing
    // up off the head (droop -25: -40 leaned them over each other into a mat).
    // r2: bigger, rounder, calmer rings (4.6 x 3.4, vary 0.45): r1's 24 thin loops tangled into a brain with no holes.
    // r3: the bar's ring size (outer ~17 mm on a ~100 mm head: 3.6 x 2.5 at
    // 1.3 is a 13 x 16 mm centreline, a 7 mm hole on a 1.15 x strand); r2's
    // 4.6 x 3.4 were 18 x 21 mm and, with the loopEvery bug, 96 of them.
    // r4: a touch rounder and tipped out more (droop -28) so the front rings
    // show their face to the lens; r3's stood as arches with the patch showing between.
    // cow-fable-1024d r1 (the audit of 1024c r4: "worm-like tubes packed in a
    // heap"; the bar's are round open spiral rings a sixth of the head wide,
    // nearly every one showing its hole): bigger and ROUNDER (4.0 x 3.5: the
    // 15 x 18 mm centreline toward 20 x 20), calmer (vary 0.45), tipped a
    // touch more to the lens (droop -30). r2: -34, and a loop in every FOURTH
    // stitch (r1's 32 big rings packed into a cauliflower of sausages). r3:
    // leaning out more (droop -38) on a strand two thirds as thick, so the
    // heap spreads low horn to horn and the rings open (r2's 22 fat rings
    // still piled into a tall cauliflower). r4: r3's thin rings tangled into a
    // nest of noodles, so the strand back up (1.15 x g), the rings a touch
    // smaller (3.7 x 3.2: the OUTER diameter the bar's sixth of the head on
    // the fatter strand), calmer (vary 0.4), the lean between r2 and r3 (-30).
    // cow-fable-1024e r2: with every ring facing the lens (r1) the heap read
    // as a flat tiled cap of small coins, so the rings a size bigger again
    // (4.1 x 3.6: ~20 mm, the bar's sixth of the head seen face-on), the
    // facing jittered wider (±30 deg) so they overlap at angles, and less
    // gravity so the heap stands.
    // r3: more size variety (vary 0.5: the bar's rings differ, big spirals
    // among small) and the facing between r1's (flat cap) and r2's (a mushy
    // heap of overlapping rings): ±22 deg, aimed a touch higher (z 0.4).
    // cow-fable-1024g r1 (the audit of 1024f r4: the fringe a flat beret of
    // loops lying on the crown; the bar's a tall tousled HEAP of rings
    // standing up off the crown between the horns, no two alike): more
    // variety again (vary 0.6: lengths ±60%, so the rings sit at different
    // heights), the facing aimed higher (below) and less gravity, so they stand.
    // r2: vary back to 0.5 (r1's ±60% rings threaded through their
    // neighbours into a chain-link tangle), the size spread kept per round.
    // r3 tried the inner rings rounder (3.8 x 3.5) against the chain-link
    // look: measured (Gauss linking number per ring pair) only 3 of the 29
    // rings' pairs are truly linked at either size — the chain is the smooth
    // bare tubes crossing over each other in the render, so r4 keeps r2's
    // rings and roughens them in the scene (hm_loop_calm 0.4, twist 0.35).
    loop: gLoop(g > 1.15 ? { lengthYr: 4.1, halfWidthYr: 3.6, droopDeg: -30, vary: 0.5 } : { lengthYr: 5.0, halfWidthYr: 2.4, droopDeg: -50, vary: 0.45 }, g),
    // Cow round 9: a plain dc every third stitch (loops in two of three) so
    // the rings are not wall to wall, and every fourth loop given a single
    // twist so a few tighter curls sit among the open rings — the bar's
    // fringe is a mix, not a tiling.
    // Round 26: loops in every OTHER stitch — the bar's curls are distinct rings
    // with the head showing between them, not a wall-to-wall cap.
    // Round 27: loops in two of three stitches again ("many small curls"), every
    // other one twisted into a tight springy curl.
    // Round 28: back to loops in every OTHER stitch (r27's two of three packed into a helmet), every third a tight curl.
    // Fine gauge (Fable 23 Oct, r1; gauge.md 'For Fable' 3): at g x the
    // stitches a round the loops in every other stitch were a nest of thin
    // noodles (gauge r1 at 1.4), so loops in every THIRD stitch instead.
    // cow-fable-1023b r2: at a fine gauge loops in every FOURTH stitch (r1's
    // every third still packed wall to wall; the bar's head shows between its rings).
    plainEvery: g > 1.15 ? undefined : 2,
    // r4: a loop in every THIRD stitch again (32 rings; r3's 22 left the sewn circle showing between them).
    // cow-fable-1024f r2: a loop in every SIXTH stitch (r1's 22 bare rings
    // packed into a brain of sausages with no holes; the bar's ~18 stand
    // apart). r4: every FIFTH (22 rings): once the render let the rings keep
    // their circles (hm_loop_calm) r3's 20 left the plain patch showing as a
    // lighter cap between them.
    loopEvery: g > 1.15 ? 5 : undefined,
    // cow-fable-1024g r1: the EDGE round (the sewn rim, round 8 of eight at
    // 1.3) a loop in every THIRD stitch (16 rings on 48 stitches), so the rim
    // is covered with rings and no plain brim shows under the heap (1024f r4:
    // a smooth lighter brim above the brow between nine edge loops).
    ...(g > 1.15 ? { loopEveryByRound: (k: number) => (k === last ? 3 : undefined) } : {}),
    // Round 29: every fourth loop a SINGLE twist (the double twists knotted r28's into a brain).
    // cow-fable-1024 r3: at a fine gauge only every SIXTH loop twisted (r2's every fourth knotted the open rings into a tangle).
    // cow-fable-1024c r2: no twisted curls at a fine gauge (the bar's are open rings; a twist knots them).
    curlEvery: g > 1.15 ? 0 : 4,
    curlLoop: gLoop({ twist: 1, curl: 0.4, halfWidthYr: 1.6 }, g),
    // cow-fable-1024g r1: at a fine gauge the loop rounds are the ODD ones, so
    // the crown override on round 0 never fired; round 1 (the 12-stitch
    // round, the top of the heap) takes it, a size taller again (5.0 x 3.8).
    loopByRound: (k) =>
      gLoop(
        (g > 1.15 ? k === 1 : k === 0)
          ? (g > 1.15 ? { lengthYr: 5.0, halfWidthYr: 3.8, droopDeg: -22 } : { lengthYr: 5.6, halfWidthYr: 2.4, droopDeg: -30 }) // over three fingers, standing up: the crown of the mound (1024c r1: standing, rounder; 1024d r1: a size bigger and rounder)
          : k === last
            ? (g > 1.15 ? { lengthYr: 4.3, halfWidthYr: 3.4, droopDeg: -45 } : { lengthYr: 4.0, halfWidthYr: 2.0, droopDeg: -52 }) // (r3: shorter at a finer gauge; 1024d r1: rounder) the spill forward to the brow and over the horn roots (shorter, less flat: r29's reached an eye)
            : undefined,
        g,
      ),
    // cow-fable-1024c r1: at a fine gauge half the gravity, so the big
    // chenille rings hold themselves up off the head (the bar's stand).
    // cow-fable-1024e r2: less again (0.0005), so the faced rings stand off the head.
    // cow-fable-1024g r1: less again (0.0003), so the rings stand up off the crown as a heap.
    gravity: g > 1.15 ? 0.0003 : 0.0015,
    // Round 17: plumper — the bar's curls are fat round chenille rings, a
    // third thicker again than the yarn pulled into a stitch.
    // Fine gauge (Fable 23 Oct, r1): the loop strand keeps its gauge-1 mm
    // (1.3 x g of the finer yarn's radius) — the bar's curls are fat chenille
    // rings however fine the fabric; render-only (the words name one yarn).
    // cow-fable-1024d r1: a touch fatter at a fine gauge (1.45 x g; the bar's
    // strand is as thick as the body yarn, 1024c r4's read thinner). r2: 1.35
    // (1.45 read fatter than the body yarn). r3: 0.95 x g — measured on the
    // r2 and bar face crops, our ring strand was 1.9 head stitches wide, the
    // bar's 1.3; it rendered under one stitch (thin noodles), so r4: 1.15 x g
    // (the rendered width is not linear in this). The scene's ply radius for the loops (1.48 mm at 1.3) is
    // still 2 x the fabric strand's, so the render's loop gate (hm_loop_ratio
    // 1.4) keeps drawing them at hm_loop_mult; it was under the pile cut-off
    // before too (the fine-gauge fringe has carried the fabric's pile since
    // 1023 r1), so nothing changes category.
    strandYr: (g > 1.15 ? 1.15 : 1.3) * g,
    // cow-fable-1024e r1: at a fine gauge every ring's PLANE faces the lens
    // (the face direction, a touch up; hairPatch `faceDir`, ±15 deg of
    // tilt): 1024d r4's rings leaned at random and most were seen side-on as
    // arches and worms; the bar's are round open spirals showing their hole.
    // cow-fable-1024g r1 (1024f r4's faced rings lay over the crown as a tiled
    // cap facing the lens): aimed much higher (z 0.7) with a wider jitter
    // (±30 deg), so the top rings stand and are seen on edge against the
    // window — the bar's lumpy silhouette above the head.
    // r2: between (z 0.55, ±24 deg: r1's z 0.7 / ±30 leaned the rings back over
    // each other into a chain-link tangle), and the EDGE round unfaced
    // (`faceRounds` = the inner loop rounds): its rings lean out over the sewn
    // rim by their droop (-45, a size bigger: 4.3 x 3.4) and cover it, where
    // faced they stood up off the rim and left it bare as a brim (r1).
    ...(g > 1.15 ? { faceDir: faceDir({ x: 0, y: 1, z: 0.55 }), faceJitterDeg: 24, faceRounds: loopRounds.filter((k) => k !== last) } : {}),
    // Render-only (outside the geometry hash): a loop of chenille that is not
    // pulled into a stitch shows its full, uncrushed pile, and in the bar's
    // photo the fringe reads a shade lighter than the crushed fabric of the
    // head it stands on. Same yarn in the words; a lighter shade on the loops.
    // Round 21: the same red-brown as the body, just catching the light (0.24
    // read as a pale pinkish-mauve pancake beside the bar).
    // Round 30: a step lighter again (0.14) — r29's rings were the head's own dark brown; the bar's catch the light.
    // cow-fable-1023b r1 (Rebecca: the curls "too red"): at a fine gauge the
    // lit loop lets more of its saturation go (desat 1.4: the bar's fringe
    // tops are s 0.55 against the body's 0.7; r4's rings read coral at 0.65).
    // r4: and the hue turned 10 deg toward orange (the bar's fringe is caramel
    // at h 19; the lifted dye at h 8-10 read dusty rose however it was desaturated).
    // cow-fable-1024 r2: lifted a touch more and paler (0.2, desat 1.0): r1's
    // rings measured s 0.61 v 0.52 against the bar's caramel at s 0.44 v 0.60.
    // r4: a shade lighter again (0.24): r3's rings measured v 0.57 s 0.54 against the bar's v 0.60 s 0.44.
    // cow-fable-1024b r1 (the audit: "pale beige"; the bar's curls are the body
    // chocolate lifted a little): back toward the body (0.12, desat 0.6, hue +4).
    // r2: a touch lighter again (0.18, desat 0.8, hue +6): r1's #704b3a was too near the body to read as a fringe.
    // cow-fable-1024c r1 (the audit: the bar's fringe is the body chocolate
    // or barely lighter; measured on the bar the lit fringe is v 0.37 over a
    // v 0.28 brow, ours was v 0.58 over 0.28): back to the body (0.08, desat 0.6, hue +4).
    colourHex: g > 1.15 ? warmHue(lighten(colourHex, 0.08, 0.6), 4) : lighten(colourHex, 0.14),
    // cow-build-1025 (`CowChoices.coiledCurls`, fine gauge only): every loop a
    // COILED CURL (loopStitch.ts `emitCoil`) — the bar's fringe is tight
    // chenille coils each curled on itself, side by side with their own
    // shadow, where the open rings crossed each other and read as chain links.
    ...(g > 1.15 && coiled ? cowCoils(rounds) : {}),
  }
}

/** The coiled fringe's numbers (cow-build-1025; in the fine yarn's radii).
 *  Each coil 1.75 turns of a 2.3 yr centre-line radius rising 3 yr a turn:
 *  drawn with the body's own strand (strandYr 0.62, so the render treats it
 *  as the fabric yarn — the same chenille pile, not a bare loop tube) it is
 *  ~16 mm across with a ~5 mm hole (the bar's curls), and no two coils come
 *  nearer than two drawn strands (2.4 yr centre to centre: each keeps a gap
 *  and its own shadow). The coils want rows further apart than the open
 *  rings did (measured on the patch alone: on rounds 2/4/6/8 with a loop in
 *  every fifth stitch two pairs of coils sat root to root and linked), so
 *  loops on every THIRD round (2, 5 and the edge round 8 at 1.3) with a loop
 *  in every FOURTH stitch inside and every third on the edge: 26 coils
 *  (3 + 7 + 16), none linked, none nearer than 5.7 mm. */
export function cowCoils(rounds: number[]): Partial<HairPatch> {
  const last = rounds.length - 1
  const loopRounds = rounds.map((_, k) => k).filter((k) => k % 3 === 1 || k === last)
  return {
    loopRounds,
    loopEvery: 4,
    faceRounds: loopRounds.filter((k) => k !== last),
    coil: { radiusYr: 2.3, turns: 1.75, pitchYr: 3.0, pairYr: 0.7 },
    strandYr: 0.62,
    coilClearYr: 2.4,
  }
}

/** The cupped ear's rounds in the maker's words: an open half-ball from the
 *  ring, never stuffed, pressed into an oval cup (`COW_EAR_CUP_ROUNDS`). */
function cowEarWords(rounds: number[]): string[] {
  const lines = writeInstructions({ name: 'ear', stitch: 'sc', form: 'sphere', rounds }).slice(0, -1)
  return [
    ...lines,
    'Work in a continuous spiral without joining; mark the first stitch of each round.',
    'Do not stuff and do not close the ear: fasten off leaving a long tail, so it stays an open half-ball. Press it gently between finger and thumb into an oval cup, the hollow facing you.',
  ]
}

/** One cupped ear (`COW_CUP_EAR`): sewn by its back (the ring) where the
 *  round 31 ear is, the open bowl turned forward and out along the same aim
 *  so the lens looks into the hollow, and turned about that axis so the
 *  pinched base (the piece's local -y) points down and in toward the head. */
function cowCupEar(choices: CowChoices, side: -1 | 1, fd: (d: Dir) => Dir, g = 1): AmigurumiPart {
  const aim = fd({ x: side * CUP_EAR_AIM.x, y: CUP_EAR_AIM.y, z: CUP_EAR_AIM.z })
  // poleIn: the piece's +z points back along the aim. The spin names where
  // local +x looks: +x = (+y) × (+z), with +y up and out (the base down-in).
  const w = norm({ x: -aim.x, y: -aim.y, z: -aim.z })
  const up = norm(fd({ x: side * 0.5, y: 0, z: 1 }))
  const spin = { x: up.y * w.z - up.z * w.y, y: up.z * w.x - up.x * w.z, z: up.x * w.y - up.y * w.x }
  // Fable 23 Oct (r3/r4): the bowl's floor was lined in the cream (a lined
  // ear). cow-fable-1023b r1, Rebecca's call: the bar's inner ear is the
  // SAME brown, lit, so the cup is self-coloured and aimed at the key
  // (CUP_EAR_AIM) instead.
  const cup = COW_CUP_EAR[choices.size]
  return earPart(gEar(cup, g), {
    name: side < 0 ? 'ear-l' : 'ear-r',
    colourHex: choices.mainHex,
    sewNote: 'by its back (the magic ring) on the sides of the head level with the brow, just below the horns, the pinch at the bottom, the open cup turned forward and out so you look into the hollow',
    place: {
      on: 'head',
      dir: fd({ x: side * CUP_EAR_DIR.x, y: CUP_EAR_DIR.y, z: CUP_EAR_DIR.z }),
      aim,
      spin,
      seat: 6, poleIn: true, surfaceFit: 'ellipsoid',
      offset: { x: side * CUP_EAR_OUT_MM },
    },
  }, gaugeYarnRadiusMm(COW_YARN, g))
}

function norm(v: Dir): Dir {
  const l = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / l, y: v.y / l, z: v.z / l }
}

/** Turn a hex colour's hue by `deg` (HSV), saturation and value kept. Render-only (a colour). */
function warmHue(hex: string, deg: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return hex
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h = (((h * 60 + deg) % 360) + 360) % 360
  const sat = d / max
  const c = max * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = max - c
  const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return '#' + [r1, g1, b1].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')
}

/** Lift a hex colour's value by `f` (0..1), hue and saturation kept. */
// Fable 23 Oct (cow-fable-1023 r2): it used to mix toward white, which on a
// deep chocolate dye stripped the fringe to a dusty pink (r1); now the value
// is lifted with the hue AND saturation kept, as the doc always said.
// Render-only (a colour, outside the geometry hash).
function lighten(hex: string, f: number, desat = 0.5): string {
  const n = parseInt(hex.slice(1), 16)
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const max = Math.max(...rgb)
  if (max === 0) return hex
  const v = max / 255
  const k = (v + (1 - v) * f) / v
  // r4: a little of the saturation goes with it (x (1 - f * desat), desat
  // 0.5 by default): a lit chenille loop reads paler, not redder — r2/r3's
  // fringe read coral beside the body. A caller may ask for more.
  const lit = rgb.map((c) => Math.min(255, c * k))
  const top = Math.max(...lit)
  return '#' + lit.map((c) => Math.min(255, Math.round(c + (top - c) * f * desat)).toString(16).padStart(2, '0')).join('')
}

export function cowPresetName(choices: CowChoices): string {
  const size = { S: 'Small', M: 'Medium', L: 'Large' }[choices.size]
  return choices.name?.trim() || `${size} highland cow`
}

/** The maker's choices → the calf as a composition the loom can build. */
export function buildCowProgram(choices: CowChoices): CompositionProgram {
  const g = clampGauge(choices.gauge)
  const s = cowProfileAt(choices.size, g, choices.muzzleSize, choices.muzzleOval)
  // How much the muzzle knob stretched the capsule (1 / 1 without it): the
  // nostrils sit the same FRACTION of the muzzle out from its middle (the
  // bar's are near its sides), so their round and stitch offsets scale.
  const plainMuzzle = cowProfileAt(choices.size, g).muzzle
  const nostrilScale = {
    rounds: s.muzzle.length / plainMuzzle.length,
    stitches: Math.max(...s.muzzle) / Math.max(...plainMuzzle),
  }
  const main = choices.mainHex
  const cream = choices.contrastHex
  const fd = (d: Dir): Dir => faceDir(d)

  const parts: AmigurumiPart[] = [
    { name: 'body', stitch: 'sc', rounds: s.body, colourHex: main, place: { on: 'ground' } },
    {
      name: 'head', stitch: 'sc', rounds: s.head, colourHex: main,
      sewNote: 'straight onto the top of the body with no neck, sunk well down so the shoulders run into the cheeks; the magic ring under one ear and the closed end under the other, so the head sits wider than it is tall',
      place: { on: 'body', overlap: s.headSink, offset: { y: 2 }, axis: fd(HEAD_AXIS) },
    },
    {
      // The wide cream muzzle: a capsule worked end to end, stuffed, and sewn
      // LYING ACROSS the lower half of the face so the lens sees a wide oval
      // (the nostrils are stitched across its front).
      name: 'muzzle', stitch: 'sc', rounds: s.muzzle, colourHex: cream,
      place: { on: 'head', dir: fd(MUZZLE_DIR), aim: fd(MUZZLE_AIM), seat: s.muzzleSeat, centred: true, surfaceFit: 'ellipsoid' },
      sewNote: 'lying across the lower half of the face with its ends toward the ears, its top edge just below the eyes',
    },
  ]
  const curved = cowCurvedHorn(choices, g)
  for (const side of [-1, 1] as const) {
    if (curved) {
      parts.push({
        name: side < 0 ? 'horn-l' : 'horn-r', stitch: 'sc', rounds: curved.rounds, colourHex: cream,
        bentTube: { plan: curved.plan },
        words: bentTubeWords(curved),
        sewNote: 'by the open end, high on each side of the crown either side of the fringe, pointing out to the side with the htr (the outside of the curve) underneath, so the tip curls up',
        // The generic line says "stuffing firmly"; a curved horn is stuffed
        // lightly (packed hard, it straightens) — its own assembly line.
        joinWords: 'Sew the horns to the head by the open end, high on each side of the crown either side of the fringe, pointing out to the side with the htr (the outside of the curve) underneath, so the tip curls up; top up the light stuffing as you close the seam, never packed hard.',
        place: {
          on: 'head',
          dir: fd({ x: side * HORN_DIR.x, y: HORN_DIR.y, z: HORN_DIR.z }),
          aim: fd({ x: side * CURVED_HORN_AIM.x, y: CURVED_HORN_AIM.y, z: CURVED_HORN_AIM.z }),
          // The curl's inside (local +x) up, a touch forward: the tip curls up.
          spin: fd(CURVED_HORN_CURL),
          seat: 3, poleIn: false, surfaceFit: 'ellipsoid',
        },
      })
      continue
    }
    parts.push({
      name: side < 0 ? 'horn-l' : 'horn-r', stitch: 'sc', rounds: s.horn, colourHex: cream,
      sewNote: 'by the flat closed end, high on each side of the crown either side of the fringe, tips pointing up and out',
      place: {
        on: 'head',
        dir: fd({ x: side * HORN_DIR.x, y: HORN_DIR.y, z: HORN_DIR.z }),
        aim: fd({ x: side * HORN_AIM.x, y: HORN_AIM.y, z: HORN_AIM.z }),
        seat: 3, poleIn: false, surfaceFit: 'ellipsoid',
      },
    })
  }
  if (choices.cuppedEars) {
    for (const side of [-1, 1] as const) parts.push(cowCupEar(choices, side, fd, g))
  } else for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.ear, colourHex: main,
      tube: { anchor: 'ring', join: 'spiral', cap: 'dome' },
      press: s.earPress,
      words: cowEarWords(s.ear),
      sewNote: 'by its back (the magic ring) on the sides of the head level with the brow, just below the horns, the open cup turned forward and out so you look into the hollow',
      place: {
        on: 'head',
        dir: fd({ x: side * EAR_DIR.x, y: EAR_DIR.y, z: EAR_DIR.z }),
        aim: fd({ x: side * EAR_AIM.x, y: EAR_AIM.y, z: EAR_AIM.z }),
        spin: fd({ x: side * EAR_SPIN.x, y: EAR_SPIN.y, z: EAR_SPIN.z }),
        seat: 6, poleIn: true, surfaceFit: 'ellipsoid',
        // Round 29: out beside the head, not flat against its side.
        offset: { x: side * 9 },
      },
    })
  }
  const frontLeg = cowTaperedLeg(choices, g) ?? s.frontLeg
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'front-leg-l' : 'front-leg-r', stitch: 'sc', rounds: frontLeg, colourHex: main,
      sewNote: frontLeg === s.frontLeg
        ? 'by the narrow closed end at the front of the shoulders, close together, hanging straight down the front of the body so each hoof rests on the table'
        : 'by the slim closed top at the front of the shoulders, close together, hanging straight down the front of the body so each round foot rests on the table',
      place: {
        on: 'body',
        dir: { x: side * FRONT_LEG_DIR.x, y: FRONT_LEG_DIR.y, z: FRONT_LEG_DIR.z },
        aim: { x: side * FRONT_LEG_AIM.x, y: FRONT_LEG_AIM.y, z: FRONT_LEG_AIM.z },
        seat: 2, poleIn: false, surfaceFit: 'ellipsoid',
        offset: { z: s.frontLegLift + (frontLeg === s.frontLeg ? 0 : TAPERED_LEG_LIFT[`${choices.size}@${g}`] ?? 0) },
      },
    })
  }
  const seated = choices.seatBackLegs === true
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'back-leg-l' : 'back-leg-r', stitch: 'sc', rounds: s.backLeg, colourHex: main,
      sewNote: seated
        ? 'by the inner side, low on each side of the body just behind the front legs, resting on the table with the rounded magic-ring end facing front'
        : 'by the closed end low on each side of the body, lying forward along the table outside the front legs with the rounded magic-ring end facing front',
      place: {
        on: 'body',
        dir: { x: side * BACK_LEG_DIR.x, y: BACK_LEG_DIR.y, z: BACK_LEG_DIR.z },
        aim: { x: side * BACK_LEG_AIM.x, y: BACK_LEG_AIM.y, z: BACK_LEG_AIM.z },
        seat: 6, poleIn: false, surfaceFit: 'ellipsoid',
        offset: seated
          ? { x: side * SEATED_BACK_LEG_OFFSET.x, y: SEATED_BACK_LEG_OFFSET.y, z: s.legLift + (SEATED_BACK_LEG_GAUGE_DROP[`${choices.size}@${g}`] ?? 0) }
          : { x: side * 24, y: 30, z: s.legLift },
      },
    })
  }
  parts.push({
    name: 'tail', stitch: 'sc', rounds: s.tail, colourHex: main, sewNote: 'low on one flank, pointing out and a little up',
    place: { on: 'body', dir: TAIL_DIR, aim: TAIL_AIM, seat: 5, poleIn: true, surfaceFit: 'ellipsoid' },
  })

  // Safety eyes just above the muzzle's top corners, wide apart, a little
  // gap between eye and muzzle (the bar).
  const props: CompositionProp[] = []
  const r = (choices.eyeMm || s.eyeMm) / 2
  // cow-fable-1024c r1 (the audit of 1024b r4: ours "small and set far
  // apart/high, a blank look"; measured, the bar's eyes are 0.44 of the face
  // apart with their lower edge on the muzzle's top, ours 0.53 apart with a
  // gap): at a fine gauge closer together and lower. Gauge 1 keeps EYE_DIR.
  const eyeDir = g > 1.15 ? FINE_EYE_DIR : EYE_DIR
  for (const side of [-1, 1] as const) {
    props.push({
      name: side < 0 ? 'eye-l' : 'eye-r', on: 'head',
      dir: fd({ x: side * eyeDir.x, y: eyeDir.y, z: eyeDir.z }),
      // Round 24: seated proud so the whole glossy dome shows out of the pile.
      radiusMm: r, seat: -(r + 1.5), colourHex: EYE_HEX, gloss: 0.85,
    })
  }

  return {
    name: cowPresetName(choices),
    yarnWeight: COW_YARN,
    hookMm: COW_HOOK_MM,
    yarnFibre: COW_FIBRE,
    // The pile cut-off is a strand radius (the fabric strand gets pile, the
    // fat fringe loops do not); both strands are g x finer at gauge g.
    fibreTune: g === 1 ? COW_FIBRE_TUNE : { ...COW_FIBRE_TUNE, pile_max_radius_mm: (COW_FIBRE_TUNE.pile_max_radius_mm as number) / g },
    ...COW_VIEW,
    parts,
    props,
    embroidery: cowNostrils(s.muzzle, fd, g, nostrilScale),
    hair: [cowFringe(main, choices.size, g, choices.coiledCurls === true)],
    ...(choices.stage && choices.stage !== 'studio' ? { stage: choices.stage, stageZoom: COW_STAGE_ZOOM } : {}),
    notes:
      'A sitting Highland calf in chenille: a stuffed can of a body, a big head worked side to side sewn straight onto its shoulders with no neck, a domed cream muzzle, two cream horns, two open cupped ears pressed into ovals, ' +
      'two long front legs, two back legs and a tail, each worked as a spiral from a magic ring and sewn on, with a loop-stitch fringe sewn between the horns.',
    ...cowGaugeFields(g),
  }
}

/** The curved horn (`CowChoices.curvedHorns`): its rounds and stitches at
 *  gauge g, or undefined when the straight cone is asked for. */
function cowCurvedHorn(choices: CowChoices, g: number): ReturnType<typeof planBend>['spec'] | undefined {
  if (!choices.curvedHorns) return undefined
  const o = { ...COW_CURVED_HORN, ...(choices.curvedHorns === true ? {} : choices.curvedHorns) }
  // The point stays a 5-stitch ring at any gauge (gCone's rule); the base and
  // the length are g x, so the horn is the same size in mm.
  const rounds = taperRounds(o.tip, Math.max(o.tip + 1, Math.round(o.widest * g)), Math.max(4, Math.round(o.length * g)), o.plump)
  return planBend(rounds, { angleDeg: o.angleDeg, from: o.from, to: o.to }).spec
}

/**
 * THE TAPERED LEGS' LIFT (mm, added to the front legs' `frontLegLift` when
 * `taperedLegs` is on), measured like GAUGE_LEG_LIFT off the whole-toy compile
 * (the leg-lift probe, then cowBentHorn.test.ts MATRIX=1, 26 Oct): the
 * slimmer leg settles differently from today's tube, so without it the round
 * feet sat 3.53 / 3.17 / 3.30 mm UNDER the table at S / M / L gauge 1, 0.84 /
 * 0.88 mm under at S / M 1.3, and 3.60 mm ABOVE it at L 1.3 (where the body
 * and back legs carry the calf). Keyed `${size}@${gauge}`; a size or gauge not listed gets
 * none (re-measure before adding it to designerAudit TAPERED_LEGS_AUDITED).
 */
const TAPERED_LEG_LIFT: Record<string, number> = { 'S@1': 3.53, 'M@1': 3.17, 'L@1': 3.3, 'S@1.3': 0.84, 'M@1.3': 0.88, 'L@1.3': -3.6 }

/** The tapered front leg (`CowChoices.taperedLegs`) at gauge g. */
function cowTaperedLeg(choices: CowChoices, g: number): number[] | undefined {
  if (!choices.taperedLegs) return undefined
  const o = { ...COW_TAPERED_LEG, ...(choices.taperedLegs === true ? {} : choices.taperedLegs) }
  const length = o.length ?? PROFILES[choices.size].frontLeg.length
  return taperedLimbRounds({ foot: Math.round(o.foot * g), top: Math.round(o.top * g), length: Math.round(length * g) })
}

/** The curved horn leaves the head more sideways than the straight cone (the
 *  curl lifts the tip), and curls up and a touch forward. */
const CURVED_HORN_AIM = { x: 1, y: 0.1, z: 0.35 }
const CURVED_HORN_CURL = { x: 0, y: 0.25, z: 1 }

/** Eyes: on the head just above the muzzle's top corners. */
// Round 21: lower (at the muzzle's top edge) and closer together — the bar's.
// Round 27: a little higher, just outside the muzzle's top corners, so a gap of
// brown shows between eye and muzzle (the bar).
const EYE_DIR = { x: 0.5, y: 1, z: 0.16 }
/** The fine-gauge calf's eyes (gauge > 1.15 only): closer together and lower,
 *  their lower edge about on the muzzle's top (the bar; cow-fable-1024c r1). */
// cow-fable-1024d r1: a touch higher (z 0.12) on the bigger muzzle, so the
// lower edge sits on its top edge rather than biting into it.
// cow-fable-1024e r1 (the audit of 1024d r4: the eyes sat ON the muzzle's
// top edge and the calf looked heavy): higher again (z 0.24) so about half an
// eye of brown face shows between the eye and the muzzle's top curve, the
// eyes just above its upper corners — the bar's bright look.
// cow-fable-1024f r1 (the audit of 1024e r3: the eyes read half-lidded and
// turned in; the bar's are 0.44 of the face apart, ours measured 0.40): a
// touch wider apart (x 0.45) and a hair lower (z 0.22: the brown gap above
// the muzzle measured ~12 mm against the bar's ~9).
const FINE_EYE_DIR = { x: 0.45, y: 1, z: 0.22 }

/** Brown-only pile: a short dense fringe of real hair curves on the dark
 *  chenille (the bar's lit pile tips), none on the cream (grey whiskers). */
const COW_FIBRE_TUNE: Record<string, number | boolean> = {
  // 1.5/mm² x 6 children: ~1.3 M hairs on the calf's ~120 000 mm² of brown.
  // 5/mm² x 10 (the yarn lane's bear number scaled up) was ~7 M and the
  // 8 GB render task was OOM-killed at scene sync (cow r9, S3 cow-1a).
  // Round 17: the 1.2 mm pile at 3/mm² was invisible at listing size (r12-r15).
  // Fewer, LONGER, fatter hairs with lit tips — ~1.7 M on the strand's
  // ~870 000 mm² — so the brown gets the bar's soft halo and lit pile tips,
  // and a touch more crushed-pile value drift so the fabric is not one flat tone.
  pile_density: 1.8, pile_children: 6, pile_len_mm: 2.6, pile_radius_mm: 0.06, pile_lean: 0.9, pile_tip_lift: 0.4,
  // Round 18: no pile on the fringe's plump loose loops (radius 2.8 mm; the fabric strand is 1.3).
  // Round 23: bulky fabric strand ~2.6 mm, fringe loops ~3.9 mm.
  pile_max_radius_mm: 3.2,
  crush_amt: 0.22, sat_mult: 0.9, pile_dark_only: true,
}

/** The NOSTRILS: two bold diagonal straight stitches in dark brown yarn
 *  across the front of the muzzle, each from upper-outer to lower-inner so
 *  they lean toward each other in a wide open "v" (the bar). The muzzle is
 *  a capsule lying across the face, so a spot on it is a ROUND along the
 *  capsule (counted from the magic-ring end, which is under the toy's RIGHT
 *  ear... the ring pole points along +x) and a stitch offset round that
 *  round, counted up from centre front. */
/** The program's yarn fields at gauge g (empty at 1: the calf as it was). */
function cowGaugeFields(g: number): Partial<CompositionProgram> {
  if (g === 1) return {}
  const y = gaugeYarn({ yarnWeight: COW_YARN, hookMm: COW_HOOK_MM }, g)
  return { yarnWeight: y.yarnWeight, yarnRadiusMm: y.yarnRadiusMm, hookMm: y.hookMm, ...(y.gaugeText ? { gaugeText: y.gaugeText } : {}) }
}

function cowNostrils(muzzle: number[], fd: (d: Dir) => Dir, g = 1, scale = { rounds: 1, stitches: 1 }): EmbroideryFeature[] {
  const n = muzzle.length
  const mid = (n + 1) / 2
  // Rounds along the capsule and stitches round it, in this muzzle's own
  // gauge: the straight rounds are 18 round at M, so a stitch is 20° of it.
  // Round 22: shorter and more slanted — r20's read as two upright bars.
  // Round 23 (bulky): rounds and stitches are 1.43x bigger, so fewer of each.
  // Fine gauge: g x the rounds and stitches, so the same mm on the muzzle.
  // cow-fable-1024d: on a muzzle stretched by `CowChoices.muzzleSize` the
  // offsets scale with it (`scale`, 1 / 1 for the size table's muzzle).
  const outer = 2.0 * g * scale.rounds, inner = 0.9 * g * scale.rounds // rounds either side of the middle
  const upSt = 0.65 * g * scale.stitches, downSt = -0.65 * g * scale.stitches // stitches above (+) / below (-) centre front
  const stitches = ([-1, 1] as const).map((side) => ({
    // Round index grows AWAY from the magic ring (+x, the toy's right), so the
    // toy's right nostril (side +1) sits on the lower round numbers.
    from: { round: mid - side * outer, st: upSt },
    to: { round: mid - side * inner, st: downSt },
    taut: true,
  }))
  const r = (v: number): string => (Math.round(v * 2) / 2).toString().replace('.5', '½')
  const st = (v: number): string => `${r(Math.abs(v))} ${Math.round(Math.abs(v) * 2) === 2 ? 'stitch' : 'stitches'}`
  return [{
    name: 'nose', on: 'muzzle',
    zeroDir: fd({ x: 0, y: 1, z: 0 }), rightDir: { x: 0, y: 0, z: 1 },
    colourHex: NOSTRIL_HEX, threadMm: 1.3, threadLabel: 'Dark brown DK yarn (or six strands of embroidery thread)',
    stitches,
    words:
      'Nostrils (dark brown DK yarn): the muzzle\'s rounds run across the face, so count rounds sideways from its middle round and stitches up or down from the centre line. ' +
      `Work one bold straight stitch each side: bring the needle up ${r(outer)} rounds out from the middle and ${st(upSt)} above the centre line, ` +
      `and take it down ${r(inner)} round${Math.round(inner * 2) === 2 ? '' : 's'} out and ${st(downSt)} below it, so the two stitches slant toward each other in a wide open "v". Pull snug, not tight.`,
  }]
}
// A dark brown yarn, not black: black reads as wire on the cream muzzle.
const NOSTRIL_HEX = '#5a3522'
