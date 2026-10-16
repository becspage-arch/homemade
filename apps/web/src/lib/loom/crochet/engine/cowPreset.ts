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
import type { EmbroideryFeature } from './faceEmbroidery'
import type { HairPatch } from './hairPatch'
import { ballRounds, cordRounds, tubeRounds } from './roundProfiles'
import { sphereRounds } from './sphereProfile'
import type { AmigurumiSize } from './amigurumiPresets'
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
  // A red-brown (hue ~16°): the bar's chenille is a redder brown than the
  // hair job's #7a4a35, which the warm windowsill light pushed to orange.
  // Round 12: the set's warm light and the chenille grade push a brown ~+7° hue
  // and +0.2 saturation (measured: #74412f rendered h 22° s 0.92 where the bar
  // is h 15° s 0.73), so the yarn is dyed redder and softer than it will read.
  mainHex: '#6b3f33',
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
  /** Head sink onto the neck (mm). */
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
export const COW_EAR_ROUNDS: number[] = [6, 9, 12, 15, 18, 18, 18, 15, 12, 9, 6]

const PROFILES: Record<AmigurumiSize, CowProfile> = {
  S: {
    body: sphereRounds(42, 1), neck: ballRounds(18, 2), head: sphereRounds(48, 2),
    muzzle: sphereRounds(18, 5), horn: COW_HORN_ROUNDS.slice(0, 8).concat([6]), ear: [6, 9, 12, 15, 15, 15, 12, 9, 6],
    frontLeg: tubeRounds(12, 10), backLeg: ballRounds(18, 4), tail: cordRounds(4),
    headSink: 9, muzzleSeat: 4, earPress: 14, legLift: -9, frontLegLift: 9, eyeMm: 12,
  },
  M: {
    body: sphereRounds(54, 1), neck: ballRounds(18, 2), head: sphereRounds(60, 2),
    muzzle: sphereRounds(24, 5), horn: COW_HORN_ROUNDS, ear: COW_EAR_ROUNDS,
    frontLeg: tubeRounds(18, 9), backLeg: ballRounds(24, 4), tail: cordRounds(5),
    headSink: 12, muzzleSeat: 5, earPress: 14, legLift: -8.5, frontLegLift: 4.0, eyeMm: 18,
  },
  L: {
    body: sphereRounds(60, 1), neck: ballRounds(24, 2), head: sphereRounds(66, 2),
    muzzle: sphereRounds(24, 7), horn: [...COW_HORN_ROUNDS.slice(0, 9), 12, 6], ear: [6, 9, 12, 15, 18, 21, 21, 21, 18, 15, 12, 9, 6],
    frontLeg: tubeRounds(18, 11), backLeg: ballRounds(30, 4), tail: cordRounds(6),
    headSink: 14, muzzleSeat: 5, earPress: 16, legLift: -8.5, frontLegLift: 1.8, eyeMm: 18,
  },
}

/** Every round profile the cow is built from, for the registry's audited
 *  list (`AUDITED_PROFILES`): the save path accepts only pieces on it. */
export const COW_AUDITED_PROFILES: number[][] = (() => {
  const seen = new Set<string>()
  const out: number[][] = []
  for (const s of Object.values(PROFILES)) {
    for (const r of [s.body, s.neck, s.head, s.muzzle, s.horn, s.ear, s.frontLeg, s.backLeg, s.tail]) {
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
const COW_STAGE_ZOOM = 0.95
const COW_YARN: YarnWeight = 'worsted'
const COW_HOOK_MM = 4
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
const MUZZLE_DIR = { x: 0, y: 1, z: -0.34 }
const MUZZLE_AIM = { x: 1, y: 0, z: 0 }
const HORN_DIR = { x: 0.68, y: 0.1, z: 0.9 }
const HORN_AIM = { x: 1, y: 0.12, z: 0.5 }
/** The flat ears: sewn by the closed end on the sides of the head, level
 *  with the brow, standing out sideways and a touch down, the pressed face
 *  turned to the lens. */
const EAR_DIR = { x: 1, y: 0.1, z: 0.15 }
const EAR_AIM = { x: 1, y: 0.22, z: -0.28 }
const EAR_SPIN = { x: 0, y: 1, z: 0.25 }
/** Front legs (cow round 9, the bar): two long chunky tubes sewn at the
 *  FRONT of the shoulders, close together, hanging straight down the front
 *  of the body to the table, a touch forward so the hooves land in front. */
const FRONT_LEG_DIR = { x: 0.38, y: 0.82, z: 0.5 }
const FRONT_LEG_AIM = { x: 0.1, y: 0.46, z: -1 }
/** Back legs: worked sole first, sewn low on the SIDES of the body, lying
 *  forward along the table OUTSIDE the front legs, the rounded foot to the
 *  lens — so all four legs show, the bar's seated calf. */
const BACK_LEG_DIR = { x: 0.9, y: 0.6, z: -0.5 }
const BACK_LEG_AIM = { x: 0.12, y: 1, z: 0.08 }
const TAIL_DIR = { x: 0.9, y: -0.45, z: -0.15 }
const TAIL_AIM = { x: 1, y: -0.25, z: 0.35 }
/** The fringe circle's centre on the crown, tipped well forward so its lower
 *  loops fall to about a row above the eyes (the bar). */
// Round 14: nearer the top of the crown — at y 0.95 the seven-round circle's
// front edge still reached the eyes.
const HAIR_DIR = { x: 0, y: 0.82, z: 1 }

/** The curly fringe: loop stitch from the magic ring out, four rounds, the
 *  loops longest at the centre so the tuft stands as a mound 2-3 curls deep,
 *  short and round at the edge where they spill onto the forehead. */
export function cowFringe(colourHex: string, size: AmigurumiSize): HairPatch {
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
  const rounds = size === 'S' ? [6, 12, 18, 24, 30, 36] : size === 'L' ? [6, 12, 18, 24, 30, 36, 42, 48] : [6, 12, 18, 24, 30, 36, 42]
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
    loop: { lengthYr: 5.0, halfWidthYr: 2.5, droopDeg: -68, vary: 0.45 },
    // Cow round 9: a plain dc every third stitch (loops in two of three) so
    // the rings are not wall to wall, and every fourth loop given a single
    // twist so a few tighter curls sit among the open rings — the bar's
    // fringe is a mix, not a tiling.
    plainEvery: 3,
    curlEvery: 4,
    curlLoop: { twist: 1, curl: 0.35, halfWidthYr: 2.0 },
    loopByRound: (k) =>
      k === 0
        ? { lengthYr: 6.2, halfWidthYr: 2.9, droopDeg: -50 } // over three fingers: the crown of the tuft
        : k === last
          ? { lengthYr: 4.0, halfWidthYr: 2.2, droopDeg: -86 } // the spill onto the forehead and over the horn roots (short and lying flat: round 10's fell over the eyes)
          : undefined,
    gravity: 0.0015,
    strandYr: 1.0,
    // Render-only (outside the geometry hash): a loop of chenille that is not
    // pulled into a stitch shows its full, uncrushed pile, and in the bar's
    // photo the fringe reads a shade lighter than the crushed fabric of the
    // head it stands on. Same yarn in the words; a lighter shade on the loops.
    colourHex: lighten(colourHex, 0.16),
  }
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
  const s = PROFILES[choices.size]
  const main = choices.mainHex
  const cream = choices.contrastHex
  const fd = (d: Dir): Dir => faceDir(d)

  const parts: AmigurumiPart[] = [
    { name: 'body', stitch: 'sc', rounds: s.body, colourHex: main, place: { on: 'ground' } },
    { name: 'neck', stitch: 'sc', rounds: s.neck, colourHex: main, scale: 0.85, place: { on: 'body', overlap: 6, offset: { y: 1.5 } } },
    {
      name: 'head', stitch: 'sc', rounds: s.head, colourHex: main,
      sewNote: 'with the magic ring under one ear and the closed end under the other, so the head sits wider than it is tall',
      place: { on: 'neck', overlap: s.headSink, offset: { y: 1 }, axis: fd(HEAD_AXIS) },
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
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.ear, colourHex: main,
      press: s.earPress,
      sewNote: 'by the closed end on the sides of the head level with the brow, just below the horns, standing out sideways with the flat face turned forward',
      place: {
        on: 'head',
        dir: fd({ x: side * EAR_DIR.x, y: EAR_DIR.y, z: EAR_DIR.z }),
        aim: fd({ x: side * EAR_AIM.x, y: EAR_AIM.y, z: EAR_AIM.z }),
        spin: fd({ x: side * EAR_SPIN.x, y: EAR_SPIN.y, z: EAR_SPIN.z }),
        seat: 5, poleIn: false, surfaceFit: 'ellipsoid',
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
        seat: 6, poleIn: false, surfaceFit: 'ellipsoid',
        offset: { z: s.frontLegLift },
      },
    })
  }
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'back-leg-l' : 'back-leg-r', stitch: 'sc', rounds: s.backLeg, colourHex: main,
      sewNote: 'by the closed end low on each side of the body, lying forward along the table outside the front legs with the rounded magic-ring end facing front',
      place: {
        on: 'body',
        dir: { x: side * BACK_LEG_DIR.x, y: BACK_LEG_DIR.y, z: BACK_LEG_DIR.z },
        aim: { x: side * BACK_LEG_AIM.x, y: BACK_LEG_AIM.y, z: BACK_LEG_AIM.z },
        seat: 6, poleIn: false, surfaceFit: 'ellipsoid',
        offset: { z: s.legLift },
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
      radiusMm: r, seat: -(r + 0.2), colourHex: EYE_HEX, gloss: 0.85,
    })
  }

  return {
    name: cowPresetName(choices),
    yarnWeight: COW_YARN,
    hookMm: COW_HOOK_MM,
    yarnFibre: COW_FIBRE,
    fibreTune: COW_FIBRE_TUNE,
    ...COW_VIEW,
    parts,
    props,
    embroidery: cowNostrils(s.muzzle, fd),
    hair: [cowFringe(main, choices.size)],
    ...(choices.stage && choices.stage !== 'studio' ? { stage: choices.stage, stageZoom: COW_STAGE_ZOOM } : {}),
    notes:
      'A sitting Highland calf in chenille: a stuffed body, a short neck and a big head worked side to side, a wide cream capsule muzzle, two cream horns, two flat pressed ears, ' +
      'two long front legs, two back legs and a tail, each worked as a spiral from a magic ring and sewn on, with a loop-stitch fringe sewn between the horns.',
  }
}

/** Eyes: on the head just above the muzzle's top corners. */
const EYE_DIR = { x: 0.6, y: 1, z: 0.18 }

/** Brown-only pile: a short dense fringe of real hair curves on the dark
 *  chenille (the bar's lit pile tips), none on the cream (grey whiskers). */
const COW_FIBRE_TUNE: Record<string, number | boolean> = {
  // 1.5/mm² x 6 children: ~1.3 M hairs on the calf's ~120 000 mm² of brown.
  // 5/mm² x 10 (the yarn lane's bear number scaled up) was ~7 M and the
  // 8 GB render task was OOM-killed at scene sync (cow r9, S3 cow-1a).
  pile_density: 3, pile_children: 6, pile_len_mm: 1.2, pile_radius_mm: 0.03, pile_dark_only: true,
}

/** The NOSTRILS: two bold diagonal straight stitches in dark brown yarn
 *  across the front of the muzzle, each from upper-outer to lower-inner so
 *  they lean toward each other in a wide open "v" (the bar). The muzzle is
 *  a capsule lying across the face, so a spot on it is a ROUND along the
 *  capsule (counted from the magic-ring end, which is under the toy's RIGHT
 *  ear... the ring pole points along +x) and a stitch offset round that
 *  round, counted up from centre front. */
function cowNostrils(muzzle: number[], fd: (d: Dir) => Dir): EmbroideryFeature[] {
  const n = muzzle.length
  const mid = (n + 1) / 2
  // Rounds along the capsule and stitches round it, in this muzzle's own
  // gauge: the straight rounds are 24 round, so a stitch is 15° of it.
  const outer = 2.6, inner = 1.5 // rounds either side of the middle
  const upSt = 1.4, downSt = -1.0 // stitches above (+) / below (-) centre front
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
