/**
 * Amigurumi COMPOSITION proofs — build 2 Part B. Real finished 3D objects
 * assembled from the locked round/sphere builders: each part is a genuinely
 * stitched, audit-gated crocheted ball; the composition layer stacks them into
 * one staged object (as a real amigurumi is several pieces sewn together).
 *
 * Run through scripts/loom-pattern.ts (the same pipeline as the flat proofs):
 *   cd apps/web && npx tsx scripts/loom-pattern.ts amigurumi-ball [yr] [--no-hero]
 *   cd apps/web && npx tsx scripts/loom-pattern.ts amigurumi-creature [yr] [--no-hero]
 */

import type { CompositionProgram } from '../src/lib/loom/crochet/engine/composition'
import { sphereRounds } from '../src/lib/loom/crochet/engine/sphereProfile'
import {
  buildAmigurumiProgram,
  type AmigurumiBase,
  type AmigurumiSize,
} from '../src/lib/loom/crochet/engine/amigurumiPresets'

/**
 * §8f-3 — the corrected sc CELL makes every crocheted piece bigger for the same
 * round counts: the stitch gauge went 1.8 → 2.7 yarn radii across and the
 * meridian pitch 1.55 → 2.4 up the fabric, so a bear worked from exactly the
 * same pattern now settles at 1.53× the size it did (measured: 57×74 mm →
 * 88×113 mm, with the height-to-width ratio unmoved at 1.3).
 *
 * Every placement number in this file is in absolute MILLIMETRES against that
 * geometry — how deep a limb seats, how far a head overlaps its neck, how big a
 * safety eye is — and round 2 tuned them as PROPORTIONS of the piece: the ear
 * 31% outside the head's projected silhouette, the safety eye ~10% of the head
 * width, the arm held just clear of the table. Scaling them all by the one
 * factor is what preserves those proportions; re-tuning thirteen numbers by
 * hand would not.
 */
const CELL_SCALE = 1.53
/** An absolute millimetre placement value, scaled with the corrected cell. */
const mm = (v: number): number => v * CELL_SCALE


// The canonical audit-clean ball (equator 30) — the proof-ball profile.
// §8f-10: on the SPHERE profile, not the old climb-in-sixes-and-hold one.
// `sphereRounds` places the increases where a sphere's circumference actually
// grows, so the cap arrives at the equator tangentially instead of turning a
// corner into it: crease 36.4° → 10.7°, settled h/w 0.66 → 0.96.
const BODY = sphereRounds(30, 1)
// A smaller ball for a head (equator 24) — audit-clean.
const HEAD = sphereRounds(24, 1)
// An ELONGATED, tapered ear: a tube (equator 12) held for several rounds then
// decreased to a rounded tip — aspect ~1.5, clearly longer than it is wide, so it
// reads as an ear standing proud rather than a ball half-buried on the head.
// (Audit-clean; slimmer equator-10 profiles fail the interlock gate.)
const EAR = [6, 12, 12, 12, 12, 12, 10, 8, 6]

// ── The smaller genuine win first: ONE stuffed ball, staged as a finished 3D
//    object on a clean ground (the staging path proven before the multi-part
//    stack). ────────────────────────────────────────────────────────────────
const amigurumiBall: CompositionProgram = {
  name: 'amigurumi-ball',
  yarnWeight: 'worsted',
  tiltDeg: 20,
  parts: [{ name: 'ball', stitch: 'sc', rounds: BODY, colourHex: '#c25a3c', place: { on: 'ground' } }],
  gaugeText: 'sc worked in the round, stuffed firm',
  finishedSizeMm: { width: 58, height: 38 }, // §8f-6: re-measured off the settled geometry after the within-round front/back layer (59 x 38 at §8f-4). §8f-4: MEASURED off the settled geometry at the corrected cell. The claim was never checked against it — the same piece settled 41 x 26 mm before, so the shape (h/w 0.65) is unchanged; a +6 cap is intrinsically a flat disc and the roundness of a real ball comes from stuffing, which this model does not have (§9)
  hookMm: 4,
  notes: 'A simple stuffed crochet ball — the amigurumi primitive, worked as a continuous spiral from a magic ring.',
}

// ── The composition: a body ball + a smaller head ball + two PROTRUDING ears —
//    one staged amigurumi bunny. The ears attach by `dir`: each is rotated so its
//    long axis points up-and-out and only its base pole seats into the head, so it
//    genuinely stands proud (a real sewn-on ear), not a swirl sunk on the crown. ─
const amigurumiCreature: CompositionProgram = {
  name: 'amigurumi-creature',
  yarnWeight: 'worsted',
  tiltDeg: 18,
  parts: [
    { name: 'body', stitch: 'sc', rounds: BODY, colourHex: '#c2843c', place: { on: 'ground' } },
    // The head nestles into the top of the body.
    { name: 'head', stitch: 'sc', rounds: HEAD, colourHex: '#c2843c', place: { on: 'body', overlap: mm(10) } },
    // Two ears STAND PROUD from the upper sides of the head, angled up and out.
    { name: 'ear-l', stitch: 'sc', rounds: EAR, colourHex: '#8a5a34', place: { on: 'head', dir: { x: -0.5, y: 0.14, z: 1 }, seat: mm(6) } },
    { name: 'ear-r', stitch: 'sc', rounds: EAR, colourHex: '#8a5a34', place: { on: 'head', dir: { x: 0.5, y: 0.14, z: 1 }, seat: mm(6) } },
  ],
  gaugeText: 'sc worked in the round, each piece stuffed and joined',
  finishedSizeMm: { width: 65, height: 85 }, // §8f-6: re-measured off the settled geometry after the within-round front/back layer (67 x 85 at §8f-4)
  hookMm: 4,
  notes: 'A simple amigurumi bunny: a stuffed body ball, a smaller head, and two ears standing proud — each crocheted as a spiral from a magic ring and sewn on.',
}


// ── THE BEAR: a sitting amigurumi bear a customer recognises ────────────────
//
// Thirteen crocheted pieces, every one built by the LOCKED sphere/round builder
// and audit-gated on its own, assembled the way a real amigurumi is sewn
// together — plus the notions a real pattern lists next to the yarn (safety
// eyes, a plastic nose), rendered as the moulded plastic they are.
//
// ROUND 2 moved four things, all in the ASSEMBLY and the NOTIONS (no round
// builder, no relaxer and no render script was touched):
//
//   1. A NECK. Round 1 seated the head 9 mm into the body and the two balls
//      merged into one loaf. A bear's head sits ON the body, clearly wider than
//      the join, over a visible crease. Two constructions are carried as
//      variants rather than guessed at: `neck: 'tube'` inserts a short narrow
//      crocheted neck piece (eq-12, 15 mm wide against a 34 mm head) between
//      body and head; `neck: 'perch'` sits the head straight on the body's
//      crown with a 2 mm overlap, where two near-tangent balls pinch to a waist
//      of their own. Both leave a real gap in the silhouette; they differ in
//      how much of it is crocheted neck and how much is crease.
//   2. The EARS STAND PROUD. Round 1 sank 5 of their 11.5 mm into the head and
//      put them on the top-BACK, so they read as two bumps on the crown. They
//      now sit high on the SIDES of the crown, tipped forward, seated only
//      3.5 mm — about two thirds of each ear stands off the head.
//   3. The FACE IS TURNED TO THE CAMERA. The camera yaws 26° round the object
//      for the three-quarter body; every FACE feature's attach direction is
//      rotated back by the same 26° (`faceDir`) so the muzzle, both eyes and
//      both ears present to the lens while the body keeps its three-quarter
//      angle. That is a head turn, which is what a real toy photograph does.
//      The limbs are NOT rotated — they belong to the body.
//   4. The NOTIONS ARE THE SIZE REAL ONES ARE. Round 1's eyes were 8 mm across
//      on a 34 mm head — 23% of the head width — and rendered as grey glass
//      marbles, because a large smooth sphere mirrors the whole white sweep
//      back at the lens. Real safety eyes are ~10% of the head width; at that
//      size the environment reflection collapses into the single highlight a
//      safety eye actually shows. The nose shrank the same way and went satin.
//
// The profiles below are the audit-clean ones (probed, not guessed — several
// plateau lengths fail the interlock gate). Each is a real magic-ring spiral
// with the craft's own +6/-6 shaping; a bear-shaped part is a CHOICE OF ROUND
// COUNTS, not a new geometry path. Sizes are the settled measurements (yr 2.1,
// worsted), so the layout numbers below are millimetres you can check.
//
//   BEAR_BODY  41 wide x 30 tall   a broad, squat sitting body
//   BEAR_HEAD  34 wide x 35 tall   a genuinely round head (the long count
//                                  plateau is what makes it a ball rather than
//                                  the flat disc a short plateau settles into)
//   BEAR_NECK  17 x 11             the narrow join the head sits on
//   BEAR_MUZZLE 17 x 11            a rounded pad that stands off the face
//   BEAR_EAR   19 x 14             a round ear, ring pole hidden in the head
//                                  (`poleIn`) so no swirl faces the camera
//   BEAR_LIMB  19 x 28             the tapered tube used for all four limbs
// §8f-10: the bear's two big closed parts are spheres (see BODY above). The
// muzzle, neck and ear stay on the old profile — measured, a 4–5-round piece
// does not dome on any counts, and a spherical ear is the wrong shape anyway.
const BEAR_BODY = sphereRounds(30, 1)
const BEAR_HEAD = sphereRounds(24, 1)
const BEAR_NECK = [6, 12, 12, 6]
const BEAR_MUZZLE = [6, 12, 12, 6]
const BEAR_EAR = [6, 12, 12, 12, 6]
const BEAR_LIMB = [6, 12, 12, 12, 12, 12, 10, 8, 6]

const TAN = '#b5814e'
const CREAM = '#e6d3ae'
const EYE = '#080706'
const NOSE = '#171310'

/** The camera yaw (deg) every bear composition is staged at — and therefore the
 *  angle the face is turned back through so it meets the lens. */
const BEAR_YAW = 26

type Dir = { x: number; y: number; z: number }

/** Turn a FACE feature's attach direction to the camera. The bear's own front
 *  is +y (`facing` flips it), but the camera sits `BEAR_YAW` round from there,
 *  so a muzzle/eye/ear aimed straight down the bear's front presents at an
 *  angle. Rotating those directions back about z is a HEAD TURN: the face meets
 *  the lens while the body, limbs and shadow keep the three-quarter angle. */
function faceDir(f: 1 | -1, d: Dir): Dir {
  const t = (-f * BEAR_YAW * Math.PI) / 180
  const c = Math.cos(t)
  const s = Math.sin(t)
  return { x: d.x * c - d.y * s, y: d.x * s + d.y * c, z: d.z }
}

/**
 * ROUND 3 — THE ARMS. Round 2 left the arms as its own logged residual ("they
 * read faintly... a held-out-from-the-body arm angle is the open direction"),
 * and on the served hero it was worse than faint: both cream paw pads landed
 * BELOW the cream foot pads, so the picture read as four feet with the arms
 * coming out from under the legs.
 *
 * Measured on the settled geometry (body 43.40 mm tall, 57.2 wide), round 2:
 *   shoulder join       z 31.98 = 0.737 of the body height  (already fine)
 *   arm aim             23° out, 34° forward = 38° off vertical
 *   paw pad centre      z  6.14 = 0.141 of the body height
 *   foot pad centre     z 12.33 = 0.284
 *   paw ABOVE foot     −6.19 mm = −0.143 of the body height   ← the fault
 *   arm-to-leg gap      0.17 mm; paw-to-leg gap 0.36 mm       ← and this
 *
 * So the attach HEIGHT was never the problem. The arm+paw chain measures
 * 30.7 mm from the shoulder join, against a 43.4 mm body — 0.71 of the body
 * height, where a real amigurumi bear's arm is nearer half — and at 38° off
 * vertical that length drops the paw 24 mm, straight past the feet. The fix is
 * the ANGLE: hold the arm out and forward so the elbow swings clear of the body
 * and the paw lands at mid-body.
 *
 * Two poses were probed (the two-attempt cap), both at the same shoulder:
 *   out 67° / fwd 42°  paw z 21.38 = 0.493 of the body (mid-body), 9.05 mm =
 *                      0.209 above the foot pads, elbow 10.7 mm past the body
 *                      silhouette, gaps arm-head 8.41, arm-leg 2.41, minz 0.00
 *   out 74° / fwd 44°  paw z 25.20 = 0.581, 12.87 mm = 0.297 above the foot
 *                      pads — nearer the ≥0.35 target, but the arms are then
 *                      within 16° of horizontal and the paws no longer read as
 *                      "around mid-body"
 * The 67° pose ships. Note for the record: ≥0.35 of the body height above the
 * feet is NOT reachable with this arm on this body at any angle under ~77° off
 * vertical, because the chain is 0.71 of the body height long — closing that
 * gap properly means a shorter arm (a `scale`/round-count change), not a
 * placement change.
 */
/** Arm attach direction on the body ellipsoid: 45° elevation, 18° toward the
 *  front — the shoulder slope, join at 0.75 of the body height. */
const ARM_DIR_Z = 1.0
const ARM_DIR_Y = 0.325
/** Arm aim: tan 67° out of vertical in the side plane, tan 42° forward. */
const ARM_AIM_Y = 0.3822
const ARM_AIM_Z = -0.4245

/** The shared bear. The knobs are the round-2 questions: how the head meets the
 *  body, how big the ears are, and how big/glossy the safety eyes are. */
function bear(opts: {
  name: string
  /** Which way the bear faces. +1 = toward the camera (the front of the scene). */
  facing: 1 | -1
  /** How the head meets the body — a crocheted neck piece, or perched on the
   *  crown so the two balls pinch to a waist between them. */
  neck: 'tube' | 'perch'
  /** Ear size as a scale on BEAR_EAR (1 = 19 x 14 mm on a 34 mm head). */
  earScale: number
  /** Safety eye radius (mm). ~10% of the head WIDTH is the real-notion size. */
  eyeRadiusMm: number
  /** 0 = matte moulded plastic, 1 = wet-look. */
  eyeGloss: number
  /** Cream paw pads on the ends of all four limbs. */
  paws: boolean
  notes: string
}): CompositionProgram {
  const f = opts.facing
  // ROUND 3 — WHERE the arm is sewn (see ARM_DIR_Z above) and WHICH WAY it then
  // points (ARM_AIM_*). The paw pad on the end of each arm is placed along the
  // same aim vector, so it travels with the arm.
  const armDir = (side: -1 | 1): Dir => ({ x: side * 1, y: f * ARM_DIR_Y, z: ARM_DIR_Z })
  const armAim = (side: -1 | 1): Dir => ({ x: side * 1, y: f * ARM_AIM_Y, z: ARM_AIM_Z })
  const legAim = (side: -1 | 1): Dir => ({ x: side * 0.26, y: f * 1, z: -0.05 })
  // The ear leans forward-and-up out of its join, so both ears clear the crown
  // and land in the silhouette from the three-quarter front.
  const earAim = (side: -1 | 1): Dir => faceDir(f, { x: side * 0.8, y: f * 0.35, z: 1 })

  const parts: CompositionProgram['parts'] = [
    { name: 'body', stitch: 'sc', rounds: BEAR_BODY, colourHex: TAN, place: { on: 'ground' } },
  ]
  if (opts.neck === 'tube') {
    // A narrow crocheted neck sunk into the body's crown; the head then sits on
    // IT, so the silhouette steps body -> neck -> head instead of merging.
    parts.push({
      name: 'neck', stitch: 'sc', rounds: BEAR_NECK, colourHex: TAN, scale: 0.85,
      place: { on: 'body', overlap: mm(6), offset: { y: mm(f * 1.5) } },
    })
    parts.push({
      name: 'head', stitch: 'sc', rounds: BEAR_HEAD, colourHex: TAN,
      place: { on: 'neck', overlap: mm(2), offset: { y: mm(f * 1) } },
    })
  } else {
    // No neck piece: the head is perched on the body's crown with a shallow
    // overlap, and the two balls pinch to a waist where their surfaces cross.
    parts.push({
      name: 'head', stitch: 'sc', rounds: BEAR_HEAD, colourHex: TAN,
      place: { on: 'body', overlap: mm(2), offset: { y: mm(f * 2.5) } },
    })
  }
  parts.push(
    // The muzzle: a cream pad on the FRONT of the face, tipped slightly down.
    {
      name: 'muzzle', stitch: 'sc', rounds: BEAR_MUZZLE, colourHex: CREAM, scale: 0.85,
      place: { on: 'head', dir: faceDir(f, { x: 0, y: f * 1, z: -0.22 }), seat: mm(3), poleIn: true, surfaceFit: 'ellipsoid' },
    },
    // Ears: high on the SIDES of the crown, leaning forward, seated only 3.5 mm
    // so most of each ear stands off the head. Ring pole buried in the join.
    {
      name: 'ear-l', stitch: 'sc', rounds: BEAR_EAR, colourHex: TAN, scale: opts.earScale,
      place: {
        on: 'head', dir: faceDir(f, { x: -0.95, y: f * 0.18, z: 0.95 }), aim: earAim(-1),
        seat: mm(3.5), poleIn: true, surfaceFit: 'ellipsoid',
      },
    },
    {
      name: 'ear-r', stitch: 'sc', rounds: BEAR_EAR, colourHex: TAN, scale: opts.earScale,
      place: {
        on: 'head', dir: faceDir(f, { x: 0.95, y: f * 0.18, z: 0.95 }), aim: earAim(1),
        seat: mm(3.5), poleIn: true, surfaceFit: 'ellipsoid',
      },
    },
    // Arms: sewn at the shoulder, held OUT and forward so the elbow swings
    // clear of the body and the paw lands at mid-body — the limbs stay on the
    // BODY's axis, not the turned face's. Round 2's z nudges are gone: they
    // existed only to stop a straight-down arm's paw pad reaching below the
    // table, and this arm's lowest point is 12 mm clear of it (minz 0.00).
    {
      name: 'arm-l', stitch: 'sc', rounds: BEAR_LIMB, colourHex: TAN, scale: 0.78,
      place: {
        on: 'body', dir: armDir(-1),
        aim: armAim(-1), seat: mm(6), poleIn: true, surfaceFit: 'ellipsoid',
      },
    },
    {
      name: 'arm-r', stitch: 'sc', rounds: BEAR_LIMB, colourHex: TAN, scale: 0.78,
      place: {
        on: 'body', dir: armDir(1),
        aim: armAim(1), seat: mm(6), poleIn: true, surfaceFit: 'ellipsoid',
      },
    },
    // Legs: sewn low at the front, lying FORWARD along the table so it sits.
    {
      name: 'leg-l', stitch: 'sc', rounds: BEAR_LIMB, colourHex: TAN, scale: 0.9,
      place: {
        on: 'body', dir: { x: -0.52, y: f * 0.8, z: -0.55 },
        aim: legAim(-1), seat: mm(8), poleIn: true, surfaceFit: 'ellipsoid',
        offset: { z: mm(-0.4) },
      },
    },
    {
      name: 'leg-r', stitch: 'sc', rounds: BEAR_LIMB, colourHex: TAN, scale: 0.9,
      place: {
        on: 'body', dir: { x: 0.52, y: f * 0.8, z: -0.55 },
        aim: legAim(1), seat: mm(8), poleIn: true, surfaceFit: 'ellipsoid',
        offset: { z: mm(-0.4) },
      },
    },
  )
  if (opts.paws) {
    // Cream paw pads: a small ball on the end of each limb, in the limb's own
    // direction — the contrast paws a teddy bear pattern works in a second
    // colour. Rendering the bear WITHOUT them (round 1's `-plain`) read worse:
    // the limbs merged into the body, so they earn their place.
    const paw = (name: string, on: string, dir: Dir): CompositionProgram['parts'][number] => ({
      name, stitch: 'sc', rounds: BEAR_MUZZLE, colourHex: CREAM, scale: 0.62,
      place: { on, dir, seat: mm(3), poleIn: true, surfaceFit: 'ellipsoid' },
    })
    parts.push(
      paw('paw-al', 'arm-l', armAim(-1)),
      paw('paw-ar', 'arm-r', armAim(1)),
      paw('paw-ll', 'leg-l', legAim(-1)),
      paw('paw-lr', 'leg-r', legAim(1)),
    )
  }
  return {
    name: opts.name,
    yarnWeight: 'worsted',
    // A toy is photographed from just above its own eye level, three-quarters on,
    // with room round the whole thing.
    tiltDeg: 74,
    yawDeg: f * BEAR_YAW,
    aimHeightFrac: 0.5,
    distScale: 1.05,
    marginFactor: 0.38,
    groundScale: 40,
    lightRig: 'product',
    // A toy is shot on a white sweep. The ground reads a shade grey at this low
    // camera (it is lit at a grazing angle), so the base ground is lifted and
    // the exposure eased up; the Fal hero finishes it to white.
    bgHex: '#faf8f5',
    exposure: 0.34,
    parts,
    // The notions a real amigurumi pattern lists next to the yarn. NOT stitches
    // and not drawn as stitches — moulded plastic, rendered as moulded plastic.
    props: [
      // `seat` is measured against the strand CENTRE-LINE hull and the rendered
      // yarn stands ~1.8 mm proud of that, so a notion seated by its own radius
      // disappears into the fabric. Seating a safety eye by MINUS its own radius
      // puts its equator at the wool surface and the whole dome proud of it —
      // which is exactly where a real safety eye's dome sits once the shank is
      // pushed through the fabric.
      {
        name: 'eye-l', on: 'head', dir: faceDir(f, { x: -0.62, y: f * 1, z: 0.42 }),
        radiusMm: mm(opts.eyeRadiusMm), seat: -mm(opts.eyeRadiusMm + 0.2), colourHex: EYE, gloss: opts.eyeGloss,
      },
      {
        name: 'eye-r', on: 'head', dir: faceDir(f, { x: 0.62, y: f * 1, z: 0.42 }),
        radiusMm: mm(opts.eyeRadiusMm), seat: -mm(opts.eyeRadiusMm + 0.2), colourHex: EYE, gloss: opts.eyeGloss,
      },
      // The nose: small, near-black, satin rather than wet-look, sitting on the
      // TOP-front of the muzzle. An ellipsoid cannot be the rounded triangle a
      // sewn nose makes, so this is the round black bead a pattern's notions
      // list offers instead.
      {
        name: 'nose', on: 'muzzle', dir: faceDir(f, { x: 0, y: f * 1, z: 0.42 }),
        radiusMm: mm(1.9), seat: -mm(1.8), flatten: 0.65, widen: 1.4, colourHex: NOSE, gloss: 0.4,
      },
    ],
    gaugeText: 'sc worked in the round, each piece stuffed firm and sewn on',
    finishedSizeMm: { width: 90, height: 101 }, // §8e-2 round 3: re-MEASURED off the settled geometry after the arms came off the shoulders. The base bear settles 89.5 (x) x 81.8 (y) x 101.1 (z); only the WIDTH moves (82 -> 90) and it now comes from the ACROSS-THE-ARMS extent (61.3 -> 89.5) rather than the front-to-back one (81.8, unmoved), because the arms are held out from the body instead of hanging against it. Height unchanged — nothing else in the assembly moved. §8f-6: re-measured off the settled geometry after the within-round front/back layer — the crossing region now runs a yarn behind the surface, so each piece draws in a touch (83 x 103 at §8f-5); height-to-width 1.24 -> 1.23, every proportion round 2 tuned intact. §8f-5: re-MEASURED off the settled geometry after the round-work look pass (84 x 107 at §8f-4, 57 x 74 before the corrected cell). The stitch now lies IN the surface instead of standing off it, so every part is a few percent less puffy; height-to-width is unmoved at 1.24 and every proportion round 2 tuned survives.
    hookMm: 4,
    notes: opts.notes,
  }
}

// The primary candidate: a crocheted neck piece between body and head.
const amigurumiBear = bear({
  name: 'amigurumi-bear',
  facing: 1,
  neck: 'tube',
  earScale: 0.92,
  eyeRadiusMm: 1.7,
  eyeGloss: 0.85,
  paws: true,
  notes:
    'A sitting amigurumi bear: a stuffed body, a short neck and a round head, a ' +
    'cream muzzle, two ears, two arms and two legs with cream paw pads — worked ' +
    'as continuous spirals from a magic ring, stuffed and sewn together. Safety ' +
    'eyes and a plastic nose finish the face.',
})

// Variant: the same bear with NO neck piece — the head perched straight on the
// body's crown, where the two balls pinch to a waist of their own.
const amigurumiBearPerch = bear({
  name: 'amigurumi-bear-perch',
  facing: 1,
  neck: 'perch',
  earScale: 0.92,
  eyeRadiusMm: 1.7,
  eyeGloss: 0.85,
  paws: true,
  notes: 'The same bear with the head perched on the body rather than joined by a neck piece.',
})

// Variant: the neck bear with bigger ears and slightly bigger, less wet-look
// eyes — the size/material end of the notions question.
const amigurumiBearBigEar = bear({
  name: 'amigurumi-bear-bigear',
  facing: 1,
  neck: 'tube',
  earScale: 1.12,
  eyeRadiusMm: 2.2,
  eyeGloss: 0.6,
  paws: true,
  notes: 'The same bear with larger ears and slightly larger, less glossy safety eyes.',
})

// Variant: no cream paw pads. Round 1 answered this — without the contrast the
// limbs merge into the body — so it is kept only as the recorded control.
const amigurumiBearPlain = bear({
  name: 'amigurumi-bear-plain',
  facing: 1,
  neck: 'tube',
  earScale: 0.92,
  eyeRadiusMm: 1.7,
  eyeGloss: 0.85,
  paws: false,
  notes: 'The same bear worked in one colour but for the muzzle — the control that showed the paw pads earn their place.',
})

// Variant: the mirror of the primary, kept as the staging control — it proves
// which way the camera is looking at the composed world (front = +y).
const amigurumiBearMirror = bear({
  name: 'amigurumi-bear-mirror',
  facing: -1,
  neck: 'tube',
  earScale: 0.92,
  eyeRadiusMm: 1.7,
  eyeGloss: 0.85,
  paws: true,
  notes: 'The bear built facing the other way — the staging control for the camera axis.',
})

// ── THE THREE ANIMAL BASES (§8f-11) ─────────────────────────────────────────
//
// Unlike the bear above, these are NOT a second copy of the assembly: they are
// the Studio's own preset, compiled by `buildAmigurumiProgram`, so what gets
// rendered and looked at beside a real photo is exactly what a maker who picks
// "Cat / Medium" is handed. §8f-9 logged the opposite as a residual — the bear
// proof and the `bear-M` preset are the same geometry at different scales, and
// only the proof was ever rendered. These close that gap for the new bases.
function presetProof(
  base: AmigurumiBase,
  size: AmigurumiSize,
  mainHex: string,
  contrastHex: string,
  eyeMm: number,
): CompositionProgram {
  return buildAmigurumiProgram({ base, size, mainHex, contrastHex, eyeMm, nose: true, paws: true, name: `amigurumi-${base}` })
}

/** A grey tabby cat with cream paws — the shade a cat pattern is usually
 *  photographed in, and the one that shows the ear cones against the ground. */
const amigurumiCat = presetProof('cat', 'M', '#8d8b86', '#e6d3ae', 9)
/** A biscuit-coloured dog with cream snout and paws. */
const amigurumiDog = presetProof('dog', 'M', '#c0965f', '#efe3cd', 9)
/** A yellow chick with an orange beak and feet. */
const amigurumiBird = presetProof('bird', 'M', '#e9c95c', '#d9822b', 9)

export const COMPOSITION_PROOFS: Record<string, CompositionProgram> = {
  'amigurumi-cat': amigurumiCat,
  'amigurumi-dog': amigurumiDog,
  'amigurumi-bird': amigurumiBird,
  'amigurumi-ball': amigurumiBall,
  'amigurumi-creature': amigurumiCreature,
  'amigurumi-bear': amigurumiBear,
  'amigurumi-bear-perch': amigurumiBearPerch,
  'amigurumi-bear-bigear': amigurumiBearBigEar,
  'amigurumi-bear-plain': amigurumiBearPlain,
  'amigurumi-bear-mirror': amigurumiBearMirror,
}
