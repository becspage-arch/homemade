/**
 * THE HIGHLAND COW — a seated amigurumi calf in chenille (crochet-bar job
 * "hair", 2026-10-10; judged beside bar-highland-cow.png).
 *
 * What a maker builds, and so what is built here (every piece a genuine
 * spiral from a magic ring through the locked round builders, relaxed and
 * audited like every other composition part; nothing drawn):
 *
 *  - a BIG round head on a smaller soft body (the toy-pose proportion: head
 *    equator 60 on a body of 54), sunk onto a short neck;
 *  - a WIDE cream MUZZLE, a flat oval across the lower half of the face, its
 *    magic ring facing out so the two nostril stitches are sewn across it;
 *  - two cream HORNS: pointed cones worked tip first (a four-stitch ring IS
 *    the point, growing a stitch a round), closed flat and sewn high on the
 *    sides of the crown, pointing up and out;
 *  - two round EARS sewn out to the sides of the head below the horns;
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
 * Yarn: a plush chenille at WORSTED weight (yr 2.1 mm) on a 4 mm hook — the
 * same yarn as the bar's — at the toy-pose stitch counts, so the stitches are
 * small against the toy and the finished calf is about 20 cm tall.
 *
 * Kept in its own module so the bear and bunny bases and their size tables
 * (the toy-pose lane) are untouched; `buildCowProgram` is the whole base.
 */

import type { AmigurumiPart, CompositionProgram, CompositionProp } from './composition'
import { buildFaceEmbroidery, type EmbroideryFeature } from './faceEmbroidery'
import type { HairPatch } from './hairPatch'
import { ballRounds, cordRounds, sphereRounds, tubeRounds, type AmigurumiSize } from './amigurumiPresets'
import type { YarnFibre, YarnWeight } from './program'
import type { HeroStage } from '../../render/blenderScene'

export interface CowChoices {
  size: AmigurumiSize
  /** The body yarn: a deep warm brown. */
  mainHex: string
  /** Horns and muzzle: cream. */
  contrastHex: string
  /** Safety eye diameter (mm). */
  eyeMm: number
  /** The listing stage (render-only). */
  stage?: HeroStage
  name?: string
}

export const COW_DEFAULTS: CowChoices = {
  size: 'M',
  mainHex: '#7a4a35',
  contrastHex: '#ead9bf',
  eyeMm: 12,
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
  neck: number[]
  head: number[]
  muzzle: number[]
  horn: number[]
  ear: number[]
  frontLeg: number[]
  backLeg: number[]
  tail: number[]
  /** Head sink onto the neck, muzzle trim, back-leg lift (mm). */
  headSink: number
  muzzleScale: number
  earScale: number
  legLift: number
  frontLegLift: number
}

/**
 * A HORN worked tip first: the four-stitch ring is the point, one more stitch
 * each round to a dozen (the cone-ear rule from §8f-11: one a round is a
 * point, two a round is a bump), two straight rounds for the thick base,
 * closed flat in one round. Sewn by the flat end, tip out.
 */
export const COW_HORN_ROUNDS: number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12, 6]

const PROFILES: Record<AmigurumiSize, CowProfile> = {
  S: {
    body: sphereRounds(42, 1), neck: ballRounds(18, 2), head: sphereRounds(48, 1),
    muzzle: ballRounds(30, 2), horn: COW_HORN_ROUNDS.slice(0, 8).concat([6]), ear: ballRounds(18, 2),
    frontLeg: tubeRounds(18, 6), backLeg: ballRounds(18, 4), tail: cordRounds(4),
    headSink: 9, muzzleScale: 1.0, earScale: 0.85, legLift: -4, frontLegLift: 0,
  },
  M: {
    body: sphereRounds(54, 1), neck: ballRounds(18, 2), head: sphereRounds(60, 1),
    muzzle: ballRounds(36, 2), horn: COW_HORN_ROUNDS, ear: ballRounds(18, 2),
    frontLeg: tubeRounds(18, 9), backLeg: ballRounds(24, 4), tail: cordRounds(5),
    headSink: 12, muzzleScale: 0.95, earScale: 1.0, legLift: -5, frontLegLift: 5.1,
  },
  L: {
    body: sphereRounds(60, 1), neck: ballRounds(24, 2), head: sphereRounds(66, 1),
    muzzle: ballRounds(42, 2), horn: [...COW_HORN_ROUNDS.slice(0, 9), 12, 6], ear: ballRounds(24, 2),
    frontLeg: tubeRounds(18, 11), backLeg: ballRounds(30, 4), tail: cordRounds(6),
    headSink: 14, muzzleScale: 0.95, earScale: 1.0, legLift: -4.5, frontLegLift: 0,
  },
}

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
const COW_STAGE_ZOOM = 1.22
const COW_YARN: YarnWeight = 'worsted'
const COW_HOOK_MM = 4
const COW_FIBRE: YarnFibre = 'chenille'
/** The face features were cut on a 36-stitch worsted head; the calf's head
 *  is 60 round, so every stitched feature spans this many more stitches to
 *  stay the same size on the face. */
const COW_GAUGE_SCALE = 60 / 36

const EYE_HEX = '#080706'

/** Turn a face direction to the camera (a head turn; limbs stay). */
function faceDir(d: Dir, yaw = COW_YAW): Dir {
  const t = (-yaw * Math.PI) / 180
  const c = Math.cos(t)
  const s = Math.sin(t)
  return { x: d.x * c - d.y * s, y: d.x * s + d.y * c, z: d.z }
}

/** Where the pieces are sewn and which way they point (M, measured by the
 *  preview dumps in the hair job log). */
const MUZZLE_DIR = { x: 0, y: 1, z: -0.4 }
const HORN_DIR = { x: 0.7, y: 0.1, z: 0.9 }
const HORN_AIM = { x: 1, y: 0.12, z: 0.5 }
const EAR_DIR = { x: 1, y: 0.18, z: 0.18 }
/** Out to the side and turned a little forward, so the ear's face shows to
 *  the lens (the bar's ears are flat leaves seen face-on, not pucks edge-on). */
const EAR_AIM = { x: 1, y: 0.55, z: 0.05 }
// (Round 8 tried the ear unstuffed and pressed flat like the lop ear: a 7-round
// ball(18,2) puck fails 14-17 interlocks at 12-15 mm — its +6 cap rounds have
// no straight run to fold on. A flat leaf ear is its own construction; the
// ear stays a stuffed puck turned to the lens for now.)
/** Front legs: sewn at the front corner of the shoulder and hung straight
 *  down, a little forward and out, so each paw rests on the table outside
 *  its foot (the pose lane's round-4 "highland-cow way"). */
const FRONT_LEG_DIR = { x: 0.8, y: 0.6, z: 0.4 }
const FRONT_LEG_AIM = { x: 0.25, y: 0.72, z: -1 }
/** Back legs: worked sole first, sewn low under the front of the body, the
 *  rounded foot pointing at the lens between the front paws. */
const BACK_LEG_DIR = { x: 0.45, y: 0.8, z: -0.5 }
const BACK_LEG_AIM = { x: 0.3, y: 1, z: 0.12 }
const TAIL_DIR = { x: 0.9, y: -0.45, z: -0.15 }
const TAIL_AIM = { x: 1, y: -0.25, z: 0.35 }
/** The fringe circle's centre on the crown, tipped well forward so its lower
 *  loops fall to about a row above the eyes (the bar). */
const HAIR_DIR = { x: 0, y: 1.4, z: 1 }

/** The curly fringe: loop stitch from the magic ring out, four rounds, the
 *  loops longest at the centre so the tuft stands as a mound 2-3 curls deep,
 *  short and round at the edge where they spill onto the forehead. */
export function cowFringe(colourHex: string, size: AmigurumiSize): HairPatch {
  // Five rounds at M (a circle ~60 mm across on the crown), loop stitch on
  // rounds 1, 3 and 5 and plain dc between: loops on every other round is
  // how a maker keeps a long-looped fringe from matting, and it is what lets
  // each ring lie open on the one below instead of standing in a crowd.
  const rounds = size === 'S' ? [6, 12, 18, 24] : size === 'L' ? [6, 12, 18, 24, 30, 36] : [6, 12, 18, 24, 30]
  const last = rounds.length - 1
  const loopRounds = rounds.map((_, k) => k).filter((k) => k % 2 === 0 || k === last)
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
    loop: { lengthYr: 5.0, halfWidthYr: 2.5, droopDeg: -68, vary: 0.45 },
    loopByRound: (k) =>
      k === 0
        ? { lengthYr: 6.2, halfWidthYr: 2.9, droopDeg: -50 } // over three fingers: the crown of the tuft
        : k === last
          ? { lengthYr: 4.6, halfWidthYr: 2.3, droopDeg: -80 } // the spill onto the forehead and over the horn roots
          : undefined,
    gravity: 0.0015,
    strandYr: 1.0,
    colourHex,
  }
}

export function cowPresetName(choices: CowChoices): string {
  const size = { S: 'Small', M: 'Medium', L: 'Large' }[choices.size]
  return choices.name?.trim() || `${size} highland cow`
}

/** The maker's choices → the calf as a composition the loom can build. */
export function buildCowProgram(choices: CowChoices): CompositionProgram {
  const s = PROFILES[choices.size]
  const main = choices.mainHex
  const cream = choices.contrastHex
  const fd = (d: Dir): Dir => faceDir(d)

  const parts: AmigurumiPart[] = [
    { name: 'body', stitch: 'sc', rounds: s.body, colourHex: main, place: { on: 'ground' } },
    { name: 'neck', stitch: 'sc', rounds: s.neck, colourHex: main, scale: 0.85, place: { on: 'body', overlap: 6, offset: { y: 1.5 } } },
    { name: 'head', stitch: 'sc', rounds: s.head, colourHex: main, place: { on: 'neck', overlap: s.headSink, offset: { y: 1 } } },
    {
      // The wide cream muzzle: a flat oval low on the face, magic ring out
      // (the nostrils are stitched across it; the closing end is in the join).
      name: 'muzzle', stitch: 'sc', rounds: s.muzzle, colourHex: cream, scale: s.muzzleScale,
      place: { on: 'head', dir: fd(MUZZLE_DIR), seat: 9, poleIn: false, surfaceFit: 'ellipsoid' },
      sewNote: 'centred on the lower half of the face with its magic ring facing out, its top edge level with the eyes',
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
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.ear, colourHex: main, scale: s.earScale,
      sewNote: 'on the sides of the head just below the horns, standing out to the sides and turned a little forward',
      place: {
        on: 'head',
        dir: fd({ x: side * EAR_DIR.x, y: EAR_DIR.y, z: EAR_DIR.z }),
        aim: fd({ x: side * EAR_AIM.x, y: EAR_AIM.y, z: EAR_AIM.z }),
        spin: fd({ x: side * 0.3, y: 1, z: 0 }),
        seat: 4, poleIn: true, surfaceFit: 'ellipsoid',
      },
    })
  }
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'front-leg-l' : 'front-leg-r', stitch: 'sc', rounds: s.frontLeg, colourHex: main,
      sewNote: 'by the narrow closed end at the front corners of the shoulders, hanging straight down so each hoof rests on the table just outside the back feet',
      place: {
        on: 'body',
        dir: { x: side * FRONT_LEG_DIR.x, y: FRONT_LEG_DIR.y, z: FRONT_LEG_DIR.z },
        aim: { x: side * FRONT_LEG_AIM.x, y: FRONT_LEG_AIM.y, z: FRONT_LEG_AIM.z },
        seat: 4, poleIn: false, surfaceFit: 'ellipsoid',
        offset: { z: s.frontLegLift },
      },
    })
  }
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'back-leg-l' : 'back-leg-r', stitch: 'sc', rounds: s.backLeg, colourHex: main,
      sewNote: 'by the closed end low on the front of the body, lying forward along the table with the rounded magic-ring end facing front',
      place: {
        on: 'body',
        dir: { x: side * BACK_LEG_DIR.x, y: BACK_LEG_DIR.y, z: BACK_LEG_DIR.z },
        aim: { x: side * BACK_LEG_AIM.x, y: BACK_LEG_AIM.y, z: BACK_LEG_AIM.z },
        seat: 5, poleIn: false, surfaceFit: 'ellipsoid',
        offset: { z: s.legLift },
      },
    })
  }
  parts.push({
    name: 'tail', stitch: 'sc', rounds: s.tail, colourHex: main, sewNote: 'low on one flank, pointing out and a little up',
    place: { on: 'body', dir: TAIL_DIR, aim: TAIL_AIM, seat: 5, poleIn: true, surfaceFit: 'ellipsoid' },
  })

  // Safety eyes on the muzzle's top edge, wide apart (the bar).
  const props: CompositionProp[] = []
  const r = choices.eyeMm / 2
  for (const side of [-1, 1] as const) {
    props.push({
      name: side < 0 ? 'eye-l' : 'eye-r', on: 'head',
      dir: fd({ x: side * 0.7, y: 1, z: 0.15 }),
      radiusMm: r, seat: -(r + 0.2), colourHex: EYE_HEX, gloss: 0.85,
    })
  }

  // Two nostril stitches across the muzzle (the calf face from the faces lane).
  const embroidery: EmbroideryFeature[] = buildFaceEmbroidery('safety-stitched', {
    head: { name: 'head', rounds: s.head },
    muzzle: { name: 'muzzle', rounds: s.muzzle, frontIsRing: true },
    forward: fd({ x: 0, y: 1, z: 0 }),
    right: fd({ x: 1, y: 0, z: 0 }),
    eyeElevDeg: 0, eyeAzDeg: 33, blushElevDeg: -16, blushAzDeg: 42,
    gaugeScale: COW_GAUGE_SCALE,
    pinkNose: false,
  })

  return {
    name: cowPresetName(choices),
    yarnWeight: COW_YARN,
    hookMm: COW_HOOK_MM,
    yarnFibre: COW_FIBRE,
    ...COW_VIEW,
    parts,
    props,
    embroidery,
    hair: [cowFringe(main, choices.size)],
    ...(choices.stage && choices.stage !== 'studio' ? { stage: choices.stage, stageZoom: COW_STAGE_ZOOM } : {}),
    notes:
      'A sitting Highland calf in chenille: a stuffed body, a short neck and a big round head, a wide cream muzzle, two cream horns, two round ears, ' +
      'two front legs, two back legs and a tail, each worked as a spiral from a magic ring and sewn on, with a loop-stitch fringe sewn between the horns.',
  }
}
