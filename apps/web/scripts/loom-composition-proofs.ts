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

// The canonical audit-clean ball (equator 30) — the proof-ball profile.
const BODY = [6, 12, 18, 24, 30, 30, 30, 30, 30, 24, 18, 12, 6]
// A smaller ball for a head (equator 24) — audit-clean.
const HEAD = [6, 12, 18, 24, 24, 18, 12, 6]
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
  finishedSizeMm: { width: 70, height: 70 },
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
    { name: 'head', stitch: 'sc', rounds: HEAD, colourHex: '#c2843c', place: { on: 'body', overlap: 10 } },
    // Two ears STAND PROUD from the upper sides of the head, angled up and out.
    { name: 'ear-l', stitch: 'sc', rounds: EAR, colourHex: '#8a5a34', place: { on: 'head', dir: { x: -0.5, y: 0.14, z: 1 }, seat: 6 } },
    { name: 'ear-r', stitch: 'sc', rounds: EAR, colourHex: '#8a5a34', place: { on: 'head', dir: { x: 0.5, y: 0.14, z: 1 }, seat: 6 } },
  ],
  gaugeText: 'sc worked in the round, each piece stuffed and joined',
  finishedSizeMm: { width: 80, height: 140 },
  hookMm: 4,
  notes: 'A simple amigurumi bunny: a stuffed body ball, a smaller head, and two ears standing proud — each crocheted as a spiral from a magic ring and sewn on.',
}


// ── THE BEAR: a sitting amigurumi bear a customer recognises ────────────────
//
// Nine crocheted pieces, every one built by the LOCKED sphere/round builder and
// audit-gated on its own, assembled the way a real amigurumi is sewn together —
// plus the two notions a real pattern lists next to the yarn (safety eyes, a
// plastic nose), rendered as the moulded plastic they are.
//
// The profiles below are the audit-clean ones. Each is a real magic-ring spiral
// with the craft's own +6/-6 shaping; a bear-shaped part is a CHOICE OF ROUND
// COUNTS, not a new geometry path. Sizes are the settled measurements (yr 2.1,
// worsted), so the layout numbers below are millimetres you can check.
//
//   BEAR_BODY  41 wide x 30 tall   a broad, squat sitting body
//   BEAR_HEAD  34 wide x 35 tall   a genuinely round head (the long count
//                                  plateau is what makes it a ball rather than
//                                  the flat disc a short plateau settles into)
//   BEAR_MUZZLE 17 x 11            a rounded pad that stands ~8 mm off the face
//   BEAR_EAR   19 x 14             a small rounded ear, ring pole hidden in the
//                                  head (`poleIn`) so no swirl faces the camera
//   BEAR_LIMB  19 x 28             the tapered tube used for all four limbs
const BEAR_BODY = [6, 12, 18, 24, 30, 30, 30, 30, 30, 30, 24, 18, 12, 6]
const BEAR_HEAD = [6, 12, 18, 24, 24, 24, 24, 24, 24, 24, 24, 18, 12, 6]
const BEAR_MUZZLE = [6, 12, 12, 6]
const BEAR_EAR = [6, 12, 12, 12, 6]
const BEAR_LIMB = [6, 12, 12, 12, 12, 12, 10, 8, 6]

const TAN = '#b5814e'
const CREAM = '#e6d3ae'
const EYE = '#141110'
const NOSE = '#241d19'

/** The shared bear, with the two knobs the variants move. */
function bear(opts: {
  name: string
  /** Which way the bear faces. +1 = toward the camera (the front of the scene). */
  facing: 1 | -1
  /** Arm aim (down-forward), as {out, forward, up}. */
  armAim: { out: number; forward: number; up: number }
  /** Ear splay: how far out to the side the ears sit. */
  earOut: number
  /** Cream paw pads on the ends of all four limbs. */
  paws: boolean
  notes: string
}): CompositionProgram {
  const f = opts.facing
  const a = opts.armAim
  const parts: CompositionProgram['parts'] = [
    { name: 'body', stitch: 'sc', rounds: BEAR_BODY, colourHex: TAN, place: { on: 'ground' } },
    // The head nestles into the top of the body, sat a touch forward.
    { name: 'head', stitch: 'sc', rounds: BEAR_HEAD, colourHex: TAN, place: { on: 'body', overlap: 9, offset: { y: f * 2 } } },
    // The muzzle: a cream pad on the FRONT of the face, tipped slightly down.
    {
      name: 'muzzle', stitch: 'sc', rounds: BEAR_MUZZLE, colourHex: CREAM, scale: 0.95,
      place: { on: 'head', dir: { x: 0, y: f * 1, z: -0.2 }, seat: 3, poleIn: true, surfaceFit: 'ellipsoid' },
    },
    // Ears: small and round, on the TOP-BACK of the head, ring pole buried.
    {
      name: 'ear-l', stitch: 'sc', rounds: BEAR_EAR, colourHex: TAN, scale: 0.82,
      place: { on: 'head', dir: { x: -opts.earOut, y: f * -0.42, z: 1 }, seat: 5, poleIn: true, surfaceFit: 'ellipsoid' },
    },
    {
      name: 'ear-r', stitch: 'sc', rounds: BEAR_EAR, colourHex: TAN, scale: 0.82,
      place: { on: 'head', dir: { x: opts.earOut, y: f * -0.42, z: 1 }, seat: 5, poleIn: true, surfaceFit: 'ellipsoid' },
    },
    // Arms: sewn high at the shoulder, hanging down-and-forward.
    {
      name: 'arm-l', stitch: 'sc', rounds: BEAR_LIMB, colourHex: TAN, scale: 0.78,
      place: {
        on: 'body', dir: { x: -1, y: f * 0.3, z: 0.62 },
        aim: { x: -a.out, y: f * a.forward, z: a.up }, seat: 8, poleIn: true, surfaceFit: 'ellipsoid',
      },
    },
    {
      name: 'arm-r', stitch: 'sc', rounds: BEAR_LIMB, colourHex: TAN, scale: 0.78,
      place: {
        on: 'body', dir: { x: 1, y: f * 0.3, z: 0.62 },
        aim: { x: a.out, y: f * a.forward, z: a.up }, seat: 8, poleIn: true, surfaceFit: 'ellipsoid',
      },
    },
    // Legs: sewn low at the front, lying FORWARD along the table so it sits.
    {
      name: 'leg-l', stitch: 'sc', rounds: BEAR_LIMB, colourHex: TAN, scale: 0.9,
      place: {
        on: 'body', dir: { x: -0.52, y: f * 0.8, z: -0.55 },
        aim: { x: -0.26, y: f * 1, z: -0.05 }, seat: 8, poleIn: true, surfaceFit: 'ellipsoid',
        offset: { z: -0.4 },
      },
    },
    {
      name: 'leg-r', stitch: 'sc', rounds: BEAR_LIMB, colourHex: TAN, scale: 0.9,
      place: {
        on: 'body', dir: { x: 0.52, y: f * 0.8, z: -0.55 },
        aim: { x: 0.26, y: f * 1, z: -0.05 }, seat: 8, poleIn: true, surfaceFit: 'ellipsoid',
        offset: { z: -0.4 },
      },
    },
  ]
  if (opts.paws) {
    // Cream paw pads: a small ball on the end of each limb, in the limb's own
    // direction — the contrast paws a teddy bear pattern works in a second colour.
    const paw = (name: string, on: string, dir: { x: number; y: number; z: number }): CompositionProgram['parts'][number] => ({
      name, stitch: 'sc', rounds: BEAR_MUZZLE, colourHex: CREAM, scale: 0.62,
      place: { on, dir, seat: 3, poleIn: true, surfaceFit: 'ellipsoid' },
    })
    parts.push(
      paw('paw-al', 'arm-l', { x: -a.out, y: f * a.forward, z: a.up }),
      paw('paw-ar', 'arm-r', { x: a.out, y: f * a.forward, z: a.up }),
      paw('paw-ll', 'leg-l', { x: -0.26, y: f * 1, z: -0.05 }),
      paw('paw-lr', 'leg-r', { x: 0.26, y: f * 1, z: -0.05 }),
    )
  }
  return {
    name: opts.name,
    yarnWeight: 'worsted',
    // A toy is photographed from just above its own eye level, three-quarters on.
    tiltDeg: 74,
    yawDeg: f * 26,
    aimHeightFrac: 0.5,
    distScale: 1.05,
    marginFactor: 0.3,
    groundScale: 40,
    lightRig: 'product',
    // A toy is shot on a white sweep. The ground reads a shade grey at this low
    // camera (it is lit at a grazing angle), so the base ground is lifted and
    // the exposure eased up; the Fal hero finishes it to white.
    bgHex: '#f7f5f2',
    exposure: 0.34,
    parts,
    // The notions a real amigurumi pattern lists next to the yarn. NOT stitches
    // and not drawn as stitches — moulded plastic, rendered as moulded plastic.
    props: [
      // `seat` is measured against the strand CENTRE-LINE hull, and the rendered
      // yarn stands ~1.8 mm proud of that — so a notion seated by its own radius
      // disappears into the fabric. A slightly NEGATIVE seat is what leaves the
      // dome standing out of the wool the way a safety eye actually does.
      { name: 'eye-l', on: 'head', dir: { x: -0.62, y: f * 1, z: 0.55 }, radiusMm: 4, seat: -0.5, colourHex: EYE, gloss: 0.95 },
      { name: 'eye-r', on: 'head', dir: { x: 0.62, y: f * 1, z: 0.55 }, radiusMm: 4, seat: -0.5, colourHex: EYE, gloss: 0.95 },
      { name: 'nose', on: 'muzzle', dir: { x: 0, y: f * 1, z: 0.06 }, radiusMm: 3.3, seat: -0.6, flatten: 0.7, widen: 1.3, colourHex: NOSE, gloss: 0.55 },
    ],
    gaugeText: 'sc worked in the round, each piece stuffed firm and sewn on',
    finishedSizeMm: { width: 59, height: 60 },
    hookMm: 4,
    notes: opts.notes,
  }
}

const amigurumiBear = bear({
  name: 'amigurumi-bear',
  facing: 1,
  armAim: { out: 0.8, forward: 0.62, up: -0.42 },
  earOut: 0.72,
  paws: true,
  notes:
    'A sitting amigurumi bear: a stuffed body and a round head, a cream muzzle, two ' +
    'small ears, two arms and two legs — nine pieces, each worked as a continuous ' +
    'spiral from a magic ring, stuffed and sewn on. Safety eyes and a plastic nose ' +
    'finish the face.',
})

// Variant: no cream paw pads, arms held wider and lower, ears set closer in.
const amigurumiBearPlain = bear({
  name: 'amigurumi-bear-plain',
  facing: 1,
  armAim: { out: 1, forward: 0.42, up: -0.62 },
  earOut: 0.5,
  paws: false,
  notes: 'The same bear worked in one colour but for the muzzle, with the arms hanging lower.',
})

// Variant: the mirror of the primary, kept as the staging control — it proves
// which way the camera is looking at the composed world (front = +y).
const amigurumiBearMirror = bear({
  name: 'amigurumi-bear-mirror',
  facing: -1,
  armAim: { out: 0.8, forward: 0.62, up: -0.42 },
  earOut: 0.72,
  paws: true,
  notes: 'The bear built facing the other way — the staging control for the camera axis.',
})

export const COMPOSITION_PROOFS: Record<string, CompositionProgram> = {
  'amigurumi-ball': amigurumiBall,
  'amigurumi-creature': amigurumiCreature,
  'amigurumi-bear': amigurumiBear,
  'amigurumi-bear-plain': amigurumiBearPlain,
  'amigurumi-bear-mirror': amigurumiBearMirror,
}
