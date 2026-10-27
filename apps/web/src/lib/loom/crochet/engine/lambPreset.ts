/**
 * THE LAMB — an original seated amigurumi lamb, designed from the cute rules
 * alone (crochet-bar job lamb-1027; CUTE-RULES.md, PARTS-CATALOGUE.md §6).
 * No lamb pattern or photo was copied: the proportions, the face and the
 * finishes come from the rules, the pieces from the parts catalogue.
 *
 * What a maker builds, and so what is built here (every piece a genuine spiral
 * from a magic ring through the locked round builders, relaxed and audited):
 *
 *  - a cream FLEECE BODY: a ball worked inside out with loop stitch in every
 *    stitch of alternate rounds (fleece.ts, catalogue CV8), the loops standing
 *    on the outside, the seat rounds plain so it sits;
 *  - a big round HEAD worked from the crown: its first rounds are the same
 *    cream fleece (a loop-stitch topknot IN the head's own rounds, the ring at
 *    the top-back so the cap frames the face like a hood), then a colour change
 *    to the soft cocoa face for the rest;
 *  - a wide cream oval MUZZLE across the lower face, the chin, with a small
 *    embroidered nose and mouth (a "Y") in dusty rose;
 *  - SAFETY EYES on the muzzle's top corners, wide apart and low, SUNK into
 *    the face by a pull-through (cuteFinish.ts);
 *  - two OVAL EARS in the face colour (folded flat ovals worked in rows,
 *    foldedPiece 'oval', the sheep ear of catalogue EA4, pinched at the base),
 *    sewn under the edge of the cap and held out sideways; the left one
 *    droops a little;
 *  - the head sewn on TILTED a few degrees (cuteFinish.ts; rule 36's cue);
 *  - two tapered FRONT LEGS from a dark hoof (a colour change) up to the
 *    shoulder, stuffed firm at the hoof and lighter to a flat unstuffed top
 *    (cuteFinish.ts), and two seated BACK LEGS, round soles forward in the
 *    hoof colour;
 *  - a TAIL NUB: a small fleece ball sewn low at the back.
 *
 * Yarn: the cow's plush chenille at its fine gauge (gauge.ts; 1.3 by default),
 * so the lamb sits beside the listing calf at the same scale and stitch size.
 *
 * Its own module (like cowPreset.ts): no other base or size table is touched.
 */

import type { AmigurumiPart, CompositionProgram, CompositionProp } from './composition'
import type { EmbroideryFeature } from './faceEmbroidery'
import type { AmigurumiSize } from './amigurumiPresets'
import type { YarnFibre, YarnWeight } from './program'
import type { HeroStage } from '../../render/blenderScene'
import type { FleeceSpec } from './fleece'
import { fleeceHowTo, writeFleeceRounds } from './fleece'
import { ovalRounds } from './sphereProfile'
import { foldedPart, gFolded, type FoldedPieceOptions } from './foldedPiece'
import { taperedLimbRounds } from './limbProfiles'
import { clampGauge, gBall, gSphere, gSphereRounds, gaugeYarn, gaugeYarnRadiusMm } from './gauge'
import { writeInstructions } from './program'
import { FEET_FORWARD_NOTE, HEAD_TILT_DEG, HEAD_TILT_NOTE, limbStuffWords, limbStuffing, rollAbout, sunkEye } from './cuteFinish'

export interface LambChoices {
  size: AmigurumiSize
  /** The fleece (body, the head's topknot, the tail): a warm cream. */
  fleeceHex: string
  /** The face, ears and legs: a soft cocoa. */
  faceHex: string
  /** The muzzle: an ivory a step lighter than the face. */
  muzzleHex: string
  /** The hooves and soles. */
  hoofHex: string
  /** The embroidered nose and mouth. */
  noseHex: string
  /** Safety eye diameter (mm); 0 = the size's own. */
  eyeMm: number
  /** The fine-gauge knob (gauge.ts): 1.3 by default (the listing calf's). */
  gauge?: number
  /** The listing stage (render-only). */
  stage?: HeroStage
  /** THE CUTE GATE (cuteCheck.ts): hard and firm failures fail the compile. */
  cuteGate?: boolean
  /** OPT-IN: no fleece (plain rounds in the fleece colour), for comparison. */
  plainFleece?: boolean
  /** The head's tilt (deg; cuteFinish HEAD_TILT_DEG by default; 0 = upright). */
  headTiltDeg?: number
  name?: string
}

export const LAMB_DEFAULTS: LambChoices = {
  size: 'M',
  // The near-white cream that renders as a soft white on the windowsill
  // (cow-fable-1025 r1: #ead9bf rendered L* 85, b* 10).
  fleeceHex: '#ead9bf',
  // A soft cocoa-latte (hex L* ~48): dark enough that the ivory muzzle reads
  // one clear step lighter (rule 14: +25-45) and the eyes still read dark
  // against it (rule 10: >= 25), light enough to stay a baby's face.
  faceHex: '#8a6a5c',
  // The cute path's ivory (cowPreset CUTE_CREAM_HEX, rules 15 and 41's hex ranges).
  muzzleHex: '#d6bfa4',
  hoofHex: '#4a3530',
  noseHex: '#a8706c',
  eyeMm: 0,
  gauge: 1.3,
}

export const LAMB_BASE = {
  id: 'lamb',
  label: 'Lamb',
  blurb: 'A seated lamb in plush chenille: a loop-stitch fleece body and topknot, a soft cocoa face with a wide ivory muzzle, oval ears held out, dark hooves and a fleece tail nub.',
} as const

interface Dir { x: number; y: number; z: number }
const dotV = (a: Dir, b: Dir): number => a.x * b.x + a.y * b.y + a.z * b.z
const unitV = (a: Dir): Dir => { const l = Math.hypot(a.x, a.y, a.z) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l } }

/** The equators and lengths each size's pieces are counted from (gauge-1
 *  counts; g x at the gauge), on the listing calf's scale. */
const PROFILE_SPEC: Record<AmigurumiSize, {
  body: [number, number]; head: [number, number]; muzzle: number; leg: { foot: number; top: number; length: number }
  backLeg: [number, number]; tail: number; ear: { width: number; length: number }; eyeMm: number
}> = {
  S: { body: [32, 1], head: [34, 0], muzzle: 17, leg: { foot: 15, top: 10, length: 9 }, backLeg: [14, 2], tail: 7, ear: { width: 6, length: 11 }, eyeMm: 14 },
  M: { body: [33, 1], head: [40, 0], muzzle: 19, leg: { foot: 18, top: 12, length: 10 }, backLeg: [16, 3], tail: 8, ear: { width: 7, length: 12 }, eyeMm: 20 },
  L: { body: [40, 1], head: [44, 0], muzzle: 23, leg: { foot: 22, top: 14, length: 12 }, backLeg: [19, 4], tail: 10, ear: { width: 8, length: 14 }, eyeMm: 20 },
}

/** Head sink into the shoulders (mm, no neck), leg drops onto the table (mm),
 *  per size (measured at gauge 1.3 off the settled toy: lamb.test.ts). */
const PLACE_SPEC: Record<AmigurumiSize, { headSink: number; frontLegLift: number; backLegLift: number; backX: number; eyeX: number }> = {
  S: { headSink: 18, frontLegLift: -19.6, backLegLift: -12.3, backX: 41, eyeX: 1.25 },
  M: { headSink: 26, frontLegLift: -16.4, backLegLift: -6.5, backX: 51, eyeX: 1.15 },
  L: { headSink: 31, frontLegLift: -17, backLegLift: -8, backX: 58, eyeX: 1.22 },
}

const LAMB_YARN: YarnWeight = 'bulky'
const LAMB_HOOK_MM = 6
const LAMB_FIBRE: YarnFibre = 'chenille'
const EYE_HEX = '#080706'
const LAMB_YAW = 8

/** The listing view (the calf's). */
const LAMB_VIEW = {
  tiltDeg: 78, yawDeg: LAMB_YAW, aimHeightFrac: 0.5, distScale: 1.05, marginFactor: 0.38,
  groundScale: 40, lightRig: 'product' as const, bgHex: '#faf8f5', exposure: 0.34,
}
const LAMB_STAGE_ZOOM = 0.9

/** Turn a face direction to the camera (a head turn; limbs stay). */
function faceDir(d: Dir, yaw = LAMB_YAW): Dir {
  const t = (-yaw * Math.PI) / 180
  const c = Math.cos(t), s = Math.sin(t)
  return { x: d.x * c - d.y * s, y: d.x * s + d.y * c, z: d.z }
}

/**
 * THE FLEECE LOOP (yarn radii at gauge 1; g x at a gauge, like a fringe's):
 * a loose loop worked over one finger (Bec, 27 Oct: "looser, not tight"),
 * nearly as wide as it is long, its axis curling over a little and lying
 * down the fabric, so each reads as a soft open curl, not a spike.
 */
/** A loop in every stitch of each fleece round, a dense carpet of curls,
 *  but every second stitch on the first (its small cupped round has no room:
 *  every stitch there floats the hooks, 1-16 audit failures). */
const FLEECE_EVERY = [2, 1]
export const LAMB_FLEECE_LOOP = { lengthYr: 2.0, halfWidthYr: 1.6, curl: 0.3, droopDeg: 55, vary: 0.35 }
/** The topknot's loop: a little shorter (the head's small rounds cup hard,
 *  and the longer body loop floats the hooks there). */
export const LAMB_CAP_LOOP = { lengthYr: 1.6, halfWidthYr: 1.4, curl: 0.3, droopDeg: 70, vary: 0.3 }

/** The fleece rounds of a body or tail ball: alternate rounds from the third
 *  to four from the end (the seat stays plain so the lamb sits). */
function bodyFleece(rounds: number[], g: number, from = 2, tail = 4, every: number | number[] = FLEECE_EVERY): FleeceSpec {
  const n = rounds.length
  const r: number[] = []
  for (let k = from; k < n - tail; k += 2) r.push(k)
  return { rounds: r, every, loop: scaleLoop(LAMB_FLEECE_LOOP, g) }
}

function scaleLoop<T extends { lengthYr?: number; halfWidthYr?: number }>(l: T, g: number): T {
  return { ...l, ...(l.lengthYr != null ? { lengthYr: l.lengthYr * g } : {}), ...(l.halfWidthYr != null ? { halfWidthYr: l.halfWidthYr * g } : {}) }
}

/** The head's topknot: loop stitch on alternate rounds from round 2 to
 *  `capRounds`, then the colour change to the face (CAP_FRACTION of the
 *  head's rounds from the crown). */
const CAP_FRACTION = 0.5
export function lambHeadCap(rounds: number[], g: number): { fleece: FleeceSpec; faceFrom: number } {
  const cap = Math.max(3, Math.round(rounds.length * CAP_FRACTION))
  const r: number[] = []
  for (let k = 2; k < cap; k += 2) r.push(k)
  return {
    fleece: { rounds: r, every: FLEECE_EVERY, loop: scaleLoop(LAMB_CAP_LOOP, g) },
    // 0-based round where the face yarn starts (the round after the last cap round).
    faceFrom: cap,
  }
}

/** The head's axis: the magic ring up and back (the crown), so the fleece
 *  cap of the first rounds sits over the crown and back of the head and its
 *  front edge crosses the brow. */
const HEAD_AXIS: Dir = { x: 0, y: -0.5, z: 1 }
/** The muzzle across the lower face, low enough to be the chin (rule 13). */
const MUZZLE_DIR: Dir = { x: 0, y: 1, z: -0.72 }
const MUZZLE_AIM: Dir = { x: 1, y: 0, z: 0 }
/** Eyes wide apart on the muzzle's top corners (rules 5, 8, 9). */
const EYE_DIR: Dir = { x: 1, y: 1, z: -0.03 }
/** Ears: under the edge of the cap at the sides, held out level, a little
 *  forward; the left one droops lower (`EAR_DROOP`). */
const EAR_DIR: Dir = { x: 1, y: 0.0, z: 0.8 }
const EAR_AIM: Dir = { x: 1, y: 0.25, z: -0.1 }
const EAR_FACE: Dir = { x: 0.2, y: 1, z: 0.2 }
const EAR_DROOP: Dir = { x: 1, y: 0.3, z: -0.5 }
/** Front legs at the shoulder corners, hanging down the chest. */
const FRONT_LEG_DIR: Dir = { x: 0.82, y: 0.95, z: 0.5 }
const FRONT_LEG_AIM: Dir = { x: 0.1, y: 0.5, z: -1 }
/** Back legs low on the flanks, feet forward (the calf's seated legs). */
const BACK_LEG_DIR: Dir = { x: 1.0, y: 0.45, z: -0.5 }
const BACK_LEG_AIM: Dir = { x: 0.14, y: 1, z: -0.3 }
const BACK_LEG_OFFSET = { y: -14 }
const TAIL_DIR: Dir = { x: 0, y: -1, z: -0.1 }

/** The lamb's oval ear (gauge-1 counts; g x at a gauge). The petal with a
 *  pinch fails the fold audit at gauge 1.3 (yarn stretched 51%); the oval
 *  passes. */
function earOptions(size: AmigurumiSize): FoldedPieceOptions {
  const e = PROFILE_SPEC[size].ear
  return { shape: 'oval', width: e.width, length: e.length, pinch: 1, cup: 0.5, curl: 0.2 }
}

export function lambPresetName(choices: LambChoices): string {
  const size = { S: 'Small', M: 'Medium', L: 'Large' }[choices.size]
  return choices.name?.trim() || `${size} lamb`
}

/** A closed piece's plain words, minus the closing line. */
function plainRounds(rounds: number[]): string[] {
  return writeInstructions({ name: 'piece', stitch: 'sc', form: 'sphere', rounds }).slice(0, -1)
}

/** A piece's words with colour changes at the start of the given rounds
 *  (0-based round -> yarn label). */
function withColours(rounds: number[], changes: Record<number, string>, close: string): string[] {
  const lines = plainRounds(rounds)
  const out: string[] = []
  lines.forEach((l, k) => {
    if (changes[k]) out.push(k === 0 ? `Start with the ${changes[k]} yarn.` : `Change to the ${changes[k]} yarn.`)
    out.push(l)
  })
  out.push(close)
  return out
}

/** The maker's choices → the lamb as a composition the loom can build. */
export function buildLambProgram(choices: LambChoices): CompositionProgram {
  const g = clampGauge(choices.gauge ?? 1.3)
  const P = PROFILE_SPEC[choices.size]
  const L = PLACE_SPEC[choices.size]
  const fd = (d: Dir): Dir => faceDir(d)
  // THE HEAD TILT (cuteFinish): the head and everything sewn on it roll
  // about the lens direction, the toy's right side a little down.
  const tilt = choices.headTiltDeg ?? HEAD_TILT_DEG
  const front = fd({ x: 0, y: 1, z: 0 })
  const hd = (d: Dir): Dir => (tilt ? rollAbout(fd(d), front, tilt) : fd(d))
  const yrMm = gaugeYarnRadiusMm(LAMB_YARN, g)
  const loopMm = (LAMB_FLEECE_LOOP.lengthYr * g) * yrMm

  // ── the body: a fleece ball ──
  const body = gSphereRounds(P.body[0], P.body[1], g)
  // L's bigger body: the dense carpet floats hooks on several rounds (3-8 audit failures), so every second stitch throughout.
  const bodyFl = bodyFleece(body, g, 2, 4, choices.size === 'L' ? 2 : FLEECE_EVERY)
  const close = 'Stuff firmly, then fasten off, thread the tail through the final round and draw the opening closed.'
  const fleeceWords = (rounds: number[], f: FleeceSpec, colourAt?: (k: number) => string | undefined): string[] => [
    fleeceHowTo(f, loopMm),
    ...writeFleeceRounds(rounds, f, { closeWords: close, ...(colourAt ? { colourAt } : {}) }),
  ]

  // ── the head: the topknot in its first rounds, then the face ──
  const head = gSphereRounds(P.head[0], P.head[1], g)
  const cap = lambHeadCap(head, g)
  const plain = choices.plainFleece === true

  const muzzle = ovalRounds(gSphere(P.muzzle, g), 1.95)
  const parts: AmigurumiPart[] = [
    {
      name: 'body', stitch: 'sc', rounds: body, colourHex: choices.fleeceHex,
      ...(plain ? {} : { fleece: bodyFl, words: fleeceWords(body, bodyFl) }),
      place: { on: 'ground' },
    },
    {
      name: 'head', stitch: 'sc', rounds: head, colourHex: choices.faceHex,
      colourChanges: [{ fromRound: 1, hex: choices.fleeceHex, label: 'fleece' }, { fromRound: cap.faceFrom + 1, hex: choices.faceHex, label: 'face' }],
      ...(plain ? {} : { fleece: cap.fleece }),
      words: plain
        ? withColours(head, { 0: 'fleece', [cap.faceFrom]: 'face' }, close)
        : fleeceWords(head, cap.fleece, (k) => (k === 0 ? 'fleece' : k === cap.faceFrom ? 'face' : undefined)),
      offTable: true,
      sewNote: `straight onto the top of the body with no neck, sunk well down so the fleece of the shoulders runs up under the cheeks; the magic ring (the crown of the topknot) up and a little back${tilt ? `; ${HEAD_TILT_NOTE}` : ''}`,
      place: { on: 'body', overlap: L.headSink, offset: { y: 4 }, axis: hd(HEAD_AXIS) },
    },
    {
      name: 'muzzle', stitch: 'sc', rounds: muzzle, colourHex: choices.muzzleHex,
      place: { on: 'head', dir: hd(MUZZLE_DIR), aim: hd(MUZZLE_AIM), seat: 2, centred: true, surfaceFit: 'points' },
      sewNote: 'lying across the lower half of the face with its ends toward the ears, its lower edge the chin, stuffing it lightly as you close the seam',
    },
  ]

  // ── ears: folded ovals, the left one drooping ──
  const ear = gFolded(earOptions(choices.size), g)
  for (const side of [-1, 1] as const) {
    const AIM = side < 0 ? EAR_DROOP : EAR_AIM
    parts.push(foldedPart(ear, {
      name: side < 0 ? 'ear-l' : 'ear-r',
      colourHex: choices.faceHex,
      sewNote: side < 0
        ? 'by the pinched base on the side of the head just under the edge of the topknot; sew the left ear angled down and forward so it droops'
        : 'by the pinched base on the side of the head just under the edge of the topknot, held out level and a little forward, the fold facing forward',
      place: {
        on: 'head',
        dir: hd({ x: side * EAR_DIR.x, y: EAR_DIR.y, z: EAR_DIR.z }),
        aim: hd({ x: side * AIM.x, y: AIM.y, z: AIM.z }),
        spin: hd({ x: side * EAR_FACE.x, y: EAR_FACE.y, z: EAR_FACE.z }),
        seat: 3, poleIn: false, surfaceFit: 'points',
      },
    }, yrMm))
  }

  // ── legs: tapered front legs from the hoof, seated back legs ──
  const leg = taperedLimbRounds({ foot: Math.round(P.leg.foot * g), top: Math.round(P.leg.top * g), length: Math.round(P.leg.length * g) })
  const hoofRounds = 4
  const LIMB_EMPTY = 2
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'front-leg-l' : 'front-leg-r', stitch: 'sc', rounds: leg, colourHex: choices.faceHex,
      colourChanges: [{ fromRound: 1, hex: choices.hoofHex, label: 'hoof' }, { fromRound: hoofRounds + 1, hex: choices.faceHex, label: 'face' }],
      words: withColours(leg, { 0: 'hoof', [hoofRounds]: 'face' }, limbStuffWords(LIMB_EMPTY)),
      stuffByRound: limbStuffing(leg, { empty: LIMB_EMPTY }),
      sewNote: 'by the slim closed top at the front of the shoulders, close together, through the fleece, hanging straight down the chest so each hoof rests on the table',
      place: {
        on: 'body',
        dir: { x: side * FRONT_LEG_DIR.x, y: FRONT_LEG_DIR.y, z: FRONT_LEG_DIR.z },
        aim: { x: side * FRONT_LEG_AIM.x, y: FRONT_LEG_AIM.y, z: FRONT_LEG_AIM.z },
        seat: 2, poleIn: false, surfaceFit: 'points',
        offset: { z: L.frontLegLift },
      },
    })
  }
  const back = gBall(P.backLeg[0], P.backLeg[1], g)
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'back-leg-l' : 'back-leg-r', stitch: 'sc', rounds: back, colourHex: choices.faceHex,
      colourChanges: [{ fromRound: 1, hex: choices.hoofHex, label: 'hoof' }, { fromRound: 3, hex: choices.faceHex, label: 'face' }],
      words: withColours(back, { 0: 'hoof', 2: 'face' }, close),
      sewNote: `${FEET_FORWARD_NOTE}, just behind the front legs and resting on the table; the dark sole is the first two rounds`,
      place: {
        on: 'body',
        dir: { x: side * BACK_LEG_DIR.x, y: BACK_LEG_DIR.y, z: BACK_LEG_DIR.z },
        aim: { x: side * BACK_LEG_AIM.x, y: BACK_LEG_AIM.y, z: BACK_LEG_AIM.z },
        seat: 6, poleIn: false, surfaceFit: 'points',
        offset: { x: side * L.backX, y: BACK_LEG_OFFSET.y, z: L.backLegLift },
      },
    })
  }

  // ── the tail nub: a small fleece ball ──
  const tail = gSphereRounds(P.tail, 0, g)
  const tailFl = bodyFleece(tail, g, 2, 2)
  parts.push({
    name: 'tail', stitch: 'sc', rounds: tail, colourHex: choices.fleeceHex,
    ...(plain ? {} : { fleece: tailFl, words: fleeceWords(tail, tailFl) }),
    sewNote: 'low on the back of the body, a fleecy nub',
    place: { on: 'body', dir: TAIL_DIR, seat: 6, poleIn: true, surfaceFit: 'points' },
  })

  // ── the face ──
  const props: CompositionProp[] = []
  const r = (choices.eyeMm || P.eyeMm) / 2
  for (const side of [-1, 1] as const) {
    props.push({
      name: side < 0 ? 'eye-l' : 'eye-r', on: 'head',
      dir: hd({ x: side * EYE_DIR.x * L.eyeX, y: EYE_DIR.y, z: EYE_DIR.z }),
      radiusMm: r, ...sunkEye(r, 0.42), colourHex: EYE_HEX, gloss: 0.85, surfaceFit: 'points',
    })
  }

  // ── the words that are not rounds ──
  // The eyes go in before the head is stuffed: where, read off the same
  // directions the build seats them by (the round from the crown ring, the
  // stitches between them along that round).
  {
    const hp = parts.find((q) => q.name === 'head')!
    const ax = unitV(hd(HEAD_AXIS))
    const eyes = props.map((e) => unitV(e.dir))
    const theta = Math.acos(Math.max(-1, Math.min(1, dotV(eyes[0]!, ax))))
    const k = Math.min(head.length, Math.max(1, Math.round((theta / Math.PI) * head.length)))
    const flat = eyes.map((e) => unitV({ x: e.x - dotV(e, ax) * ax.x, y: e.y - dotV(e, ax) * ax.y, z: e.z - dotV(e, ax) * ax.z }))
    const apart = Math.round((Math.acos(Math.max(-1, Math.min(1, dotV(flat[0]!, flat[1]!)))) / (2 * Math.PI)) * head[k - 1]!)
    const at = hp.words!.length - 1
    hp.words!.splice(at, 0,
      `Before you stuff the head: fit the ${Math.round(r * 2)} mm safety eyes between rounds ${k} and ${k + 1} (in the face colour, just above where the top edge of the muzzle will sit), ${apart} stitches apart with the head's colour-change point at the back, and push the washers right down.`)
  }
  const join: Record<string, string> = {
    head: `Sew the head straight onto the top of the body with no neck, sunk well down so the fleece of the shoulders runs up under the cheeks, the magic ring (the crown of the topknot) up and a little back${tilt ? `; ${HEAD_TILT_NOTE}` : ''}.`,
    muzzle: 'Sew the muzzle across the lower half of the face with its ends toward the ears, its lower edge the chin, and the eyes sitting on its top corners.',
    'ear-l': 'Sew the ears on by the pinched base, at the sides of the head just under the edge of the topknot: the right ear held out level and a little forward with the hollow facing forward, the left ear angled a little down and forward so it droops.',
    'front-leg-l': 'Sew the front legs on by their flat tops at the front of the shoulders, close together, working through the fleece, so they hang straight down the chest and each hoof rests on the table.',
    'back-leg-l': `Sew the back legs on ${FEET_FORWARD_NOTE}, just behind the front legs and resting on the table; the dark sole is the first two rounds.`,
    tail: 'Sew the tail low on the back of the body, a fleecy nub.',
  }
  for (const q of parts) if (join[q.name]) q.joinWords = join[q.name]
  const muzzlePart = parts.find((q) => q.name === 'muzzle')!
  muzzlePart.words = [...plainRounds(muzzle), 'Stuff lightly (it should lie soft across the face, not stand out like a ball), then fasten off, thread the tail through the final round and draw the opening closed. Leave a long tail for sewing.']
  const nose = lambNose(muzzle, hd, g, choices.noseHex)

  const y = gaugeYarn({ yarnWeight: LAMB_YARN, hookMm: LAMB_HOOK_MM }, g)
  return {
    name: lambPresetName(choices),
    yarnWeight: y.yarnWeight,
    yarnRadiusMm: y.yarnRadiusMm,
    hookMm: y.hookMm,
    ...(y.gaugeText ? { gaugeText: y.gaugeText } : {}),
    yarnFibre: LAMB_FIBRE,
    fibreTune: { ...LAMB_FIBRE_TUNE, pile_max_radius_mm: (LAMB_FIBRE_TUNE.pile_max_radius_mm as number) / g },
    ...LAMB_VIEW,
    parts,
    props,
    embroidery: nose,
    faceWords: [nose[0]!.words!, 'Fasten off the nose yarn inside the muzzle and trim the ends so none show.'],
    ...(choices.stage && choices.stage !== 'studio' ? { stage: choices.stage, stageZoom: LAMB_STAGE_ZOOM } : {}),
    notes:
      'A sitting lamb in chenille: a loop-stitch fleece body worked inside out, a big head worked from a fleece topknot down to a cocoa face, a wide ivory muzzle, two folded oval ears, ' +
      'two front legs from dark hooves, two seated back legs and a fleece tail nub, each worked as a spiral from a magic ring and sewn on.',
    cute: { family: 'quadruped-seated', ...(choices.cuteGate === true ? { gate: true } : {}) },
  }
}

/** The pile: the fabric strand only, as the calf's (render-only). */
const LAMB_FIBRE_TUNE: Record<string, number | boolean> = {
  pile_density: 1.8, pile_children: 6, pile_len_mm: 2.6, pile_radius_mm: 0.06, pile_lean: 0.9, pile_tip_lift: 0.4,
  pile_max_radius_mm: 3.2, crush_amt: 0.22, sat_mult: 0.9, pile_dark_only: true,
}

/**
 * THE NOSE AND MOUTH: a little "Y" in dusty rose on the muzzle's front — two
 * short slanting stitches meeting at the centre (the nose) and one straight
 * stitch down from it (the mouth). The muzzle is an oval lying across the
 * face, so a spot on it is a ROUND along it (from the magic-ring end, under
 * the toy's right ear) and a stitch offset up (+) or down (-) from the
 * centre front, as the calf's nostrils are counted.
 */
function lambNose(muzzle: number[], fd: (d: Dir) => Dir, g: number, hex: string): EmbroideryFeature[] {
  const mid = (muzzle.length + 1) / 2
  const arm = 1.0 * g, up = 1.2 * g, meet = 0.2 * g, down = -1.3 * g
  const stitches = [
    { from: { round: mid - arm, st: up }, to: { round: mid, st: meet }, taut: true },
    { from: { round: mid + arm, st: up }, to: { round: mid, st: meet }, taut: true },
    { from: { round: mid, st: meet }, to: { round: mid, st: down }, taut: true },
  ]
  const h = (v: number): string => { const x = Math.max(0.5, Math.round(v * 2) / 2); return x === 0.5 ? '½' : x.toString().replace('.5', '½') }
  return [{
    name: 'nose', on: 'muzzle',
    zeroDir: fd({ x: 0, y: 1, z: 0 }), rightDir: fd({ x: 0, y: 0, z: 1 }),
    colourHex: hex, threadMm: 1.1, threadLabel: 'Dusty rose DK yarn (or six strands of embroidery thread)',
    stitches,
    words:
      'Nose and mouth (dusty rose DK yarn): the muzzle\'s rounds run across the face, so count rounds sideways from its middle round and stitches up or down from the centre line. ' +
      `Bring the needle up ${h(arm)} round${h(arm) === '1' ? '' : 's'} left of the middle and ${h(up)} stitches above the centre line and take it down on the middle round ${h(meet)} stitch above it; ` +
      `make the same stitch from ${h(arm)} round${h(arm) === '1' ? '' : 's'} right of the middle, so the two meet in a small "v" (the nose); ` +
      `then bring the needle up at that point and take it down on the middle round ${h(Math.abs(down))} stitches below the centre line (the mouth). Pull snug, not tight.`,
  }]
}

/** Every round profile the lamb is built from at gauge g (for a future
 *  registry entry's audited list). */
export function lambProfiles(size: AmigurumiSize, g = 1.3): number[][] {
  const p = buildLambProgram({ ...LAMB_DEFAULTS, size, gauge: g })
  return p.parts.map((x) => x.rounds)
}
