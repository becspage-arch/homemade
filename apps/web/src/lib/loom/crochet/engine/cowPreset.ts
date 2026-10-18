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
import { sphereRounds } from './sphereProfile'
import type { AmigurumiSize } from './amigurumiPresets'
import { writeInstructions, type YarnFibre, type YarnWeight } from './program'
import { earPart, type EarPieceOptions } from './earPiece'
import { clampGauge, gBall, gCone, gCord, gDisc, gEar, gLoop, gSphereRounds, gTube, gaugeYarn, gaugeYarnRadiusMm } from './gauge'
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
  name?: string
}

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
  M: { kind: 'cup', width: 12, depth: 2, rimRoll: 1, pinch: 0.6 },
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
 * S at 1.6 1.9 mm and L at 1.4 1.85 mm; L at 1.3 sits on it.
 * A gauge or size not listed gets none (re-measure before shipping it).
 */
const GAUGE_LEG_LIFT: Record<string, number> = { 'M@1.3': 4.0, 'M@1.4': 2.7, 'S@1.3': 3.7, 'S@1.4': 1.6, 'S@1.6': 1.9, 'L@1.4': 1.85 }

function cowProfileAt(size: AmigurumiSize, g: number): CowProfile {
  const base = PROFILES[size]
  if (g === 1) return base
  const p = PROFILE_SPEC[size]
  const lift = GAUGE_LEG_LIFT[`${size}@${g}`] ?? 0
  const sph = ([eq, extra]: [number, number]): number[] => gSphereRounds(eq, extra, g)
  return {
    ...base,
    body: sph(p.body),
    head: sph(p.head),
    muzzle: sph(p.muzzle),
    horn: gCone(4, p.hornWidest, 0, 6, g),
    ear: gDisc(COW_EAR_CUP_ROUNDS[size], g),
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
const SEATED_BACK_LEG_OFFSET = { x: 26, y: -16 }
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
export function cowFringe(colourHex: string, size: AmigurumiSize, g = 1): HairPatch {
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
  const loopRounds = rounds.map((_, k) => k).filter((k) => k % 2 === 0 || (k === last && last % 2 === 0))
  return {
    name: 'fringe',
    on: 'head',
    dir: faceDir(HAIR_DIR),
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
    loop: gLoop({ lengthYr: 5.0, halfWidthYr: 2.4, droopDeg: -50, vary: 0.45 }, g),
    // Cow round 9: a plain dc every third stitch (loops in two of three) so
    // the rings are not wall to wall, and every fourth loop given a single
    // twist so a few tighter curls sit among the open rings — the bar's
    // fringe is a mix, not a tiling.
    // Round 26: loops in every OTHER stitch — the bar's curls are distinct rings
    // with the head showing between them, not a wall-to-wall cap.
    // Round 27: loops in two of three stitches again ("many small curls"), every
    // other one twisted into a tight springy curl.
    // Round 28: back to loops in every OTHER stitch (r27's two of three packed into a helmet), every third a tight curl.
    plainEvery: 2,
    // Round 29: every fourth loop a SINGLE twist (the double twists knotted r28's into a brain).
    curlEvery: 4,
    curlLoop: gLoop({ twist: 1, curl: 0.4, halfWidthYr: 1.6 }, g),
    loopByRound: (k) =>
      gLoop(
        k === 0
          ? { lengthYr: 5.6, halfWidthYr: 2.4, droopDeg: -30 } // over three fingers, standing up: the crown of the mound
          : k === last
            ? { lengthYr: 4.0, halfWidthYr: 2.0, droopDeg: -52 } // the spill forward to the brow and over the horn roots (shorter, less flat: r29's reached an eye)
            : undefined,
        g,
      ),
    gravity: 0.0015,
    // Round 17: plumper — the bar's curls are fat round chenille rings, a
    // third thicker again than the yarn pulled into a stitch.
    strandYr: 1.3,
    // Render-only (outside the geometry hash): a loop of chenille that is not
    // pulled into a stitch shows its full, uncrushed pile, and in the bar's
    // photo the fringe reads a shade lighter than the crushed fabric of the
    // head it stands on. Same yarn in the words; a lighter shade on the loops.
    // Round 21: the same red-brown as the body, just catching the light (0.24
    // read as a pale pinkish-mauve pancake beside the bar).
    // Round 30: a step lighter again (0.14) — r29's rings were the head's own dark brown; the bar's catch the light.
    colourHex: lighten(colourHex, 0.14),
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
  const aim = fd({ x: side * EAR_AIM.x, y: EAR_AIM.y, z: EAR_AIM.z })
  // poleIn: the piece's +z points back along the aim. The spin names where
  // local +x looks: +x = (+y) × (+z), with +y up and out (the base down-in).
  const w = norm({ x: -aim.x, y: -aim.y, z: -aim.z })
  const up = norm(fd({ x: side * 0.5, y: 0, z: 1 }))
  const spin = { x: up.y * w.z - up.z * w.y, y: up.z * w.x - up.x * w.z, z: up.x * w.y - up.y * w.x }
  return earPart(gEar(COW_CUP_EAR[choices.size], g), {
    name: side < 0 ? 'ear-l' : 'ear-r',
    colourHex: choices.mainHex,
    sewNote: 'by its back (the magic ring) on the sides of the head level with the brow, just below the horns, the pinch at the bottom, the open cup turned forward and out so you look into the hollow',
    place: {
      on: 'head',
      dir: fd({ x: side * EAR_DIR.x, y: EAR_DIR.y, z: EAR_DIR.z }),
      aim,
      spin,
      seat: 6, poleIn: true, surfaceFit: 'ellipsoid',
      offset: { x: side * 9 },
    },
  }, gaugeYarnRadiusMm(COW_YARN, g))
}

function norm(v: Dir): Dir {
  const l = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / l, y: v.y / l, z: v.z / l }
}

/** Lift a hex colour's value by `f` (0..1), hue and saturation kept. */
function lighten(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.min(255, Math.round(c + (255 - c) * f)))
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('')
}

export function cowPresetName(choices: CowChoices): string {
  const size = { S: 'Small', M: 'Medium', L: 'Large' }[choices.size]
  return choices.name?.trim() || `${size} highland cow`
}

/** The maker's choices → the calf as a composition the loom can build. */
export function buildCowProgram(choices: CowChoices): CompositionProgram {
  const g = clampGauge(choices.gauge)
  const s = cowProfileAt(choices.size, g)
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
  for (const side of [-1, 1] as const) {
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
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'front-leg-l' : 'front-leg-r', stitch: 'sc', rounds: s.frontLeg, colourHex: main,
      sewNote: 'by the narrow closed end at the front of the shoulders, close together, hanging straight down the front of the body so each hoof rests on the table',
      place: {
        on: 'body',
        dir: { x: side * FRONT_LEG_DIR.x, y: FRONT_LEG_DIR.y, z: FRONT_LEG_DIR.z },
        aim: { x: side * FRONT_LEG_AIM.x, y: FRONT_LEG_AIM.y, z: FRONT_LEG_AIM.z },
        seat: 2, poleIn: false, surfaceFit: 'ellipsoid',
        offset: { z: s.frontLegLift },
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
  for (const side of [-1, 1] as const) {
    props.push({
      name: side < 0 ? 'eye-l' : 'eye-r', on: 'head',
      dir: fd({ x: side * EYE_DIR.x, y: EYE_DIR.y, z: EYE_DIR.z }),
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
    embroidery: cowNostrils(s.muzzle, fd, g),
    hair: [cowFringe(main, choices.size, g)],
    ...(choices.stage && choices.stage !== 'studio' ? { stage: choices.stage, stageZoom: COW_STAGE_ZOOM } : {}),
    notes:
      'A sitting Highland calf in chenille: a stuffed can of a body, a big head worked side to side sewn straight onto its shoulders with no neck, a domed cream muzzle, two cream horns, two open cupped ears pressed into ovals, ' +
      'two long front legs, two back legs and a tail, each worked as a spiral from a magic ring and sewn on, with a loop-stitch fringe sewn between the horns.',
    ...cowGaugeFields(g),
  }
}

/** Eyes: on the head just above the muzzle's top corners. */
// Round 21: lower (at the muzzle's top edge) and closer together — the bar's.
// Round 27: a little higher, just outside the muzzle's top corners, so a gap of
// brown shows between eye and muzzle (the bar).
const EYE_DIR = { x: 0.5, y: 1, z: 0.16 }

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

function cowNostrils(muzzle: number[], fd: (d: Dir) => Dir, g = 1): EmbroideryFeature[] {
  const n = muzzle.length
  const mid = (n + 1) / 2
  // Rounds along the capsule and stitches round it, in this muzzle's own
  // gauge: the straight rounds are 18 round at M, so a stitch is 20° of it.
  // Round 22: shorter and more slanted — r20's read as two upright bars.
  // Round 23 (bulky): rounds and stitches are 1.43x bigger, so fewer of each.
  // Fine gauge: g x the rounds and stitches, so the same mm on the muzzle.
  const outer = 2.0 * g, inner = 0.9 * g // rounds either side of the middle
  const upSt = 0.65 * g, downSt = -0.65 * g // stitches above (+) / below (-) centre front
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
