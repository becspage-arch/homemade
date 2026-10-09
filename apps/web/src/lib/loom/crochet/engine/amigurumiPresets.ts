/**
 * The amigurumi designer's shape library.
 *
 * A guided form, not free text: the maker picks a creature, a size, the yarn
 * colours and whether it has safety eyes, and this turns those choices into a
 * `CompositionProgram` the loom builds for real. Every piece is one of the
 * proven round profiles below, worked by the locked sphere builder.
 *
 * WHY A FIXED PROFILE LIST. Whether a piece passes the loom's interlock audit
 * depends only on its stitch, its round counts and the yarn radius. It does not
 * depend on colour, on where the piece is sewn, or on the props. So the profiles
 * here are the ones measured to pass the audit clean, and
 * `amigurumi-presets.test.ts` compiles every preset at every size and fails the
 * build if any of them stops passing. A maker's choices cannot move a preset off
 * an audited profile, which is why the save path can trust them.
 *
 * The bear's placement numbers, scales, camera and props come straight from the
 * signed-off bear proof (`apps/web/scripts/loom-composition-proofs.ts`) so the
 * Studio's bear stages exactly like the one already rendered.
 *
 * New file under engine/: the composition layer itself is owned elsewhere and is
 * only imported here, never edited.
 */

import type { AmigurumiPart, CompositionProgram, CompositionProp } from './composition'
import {
  PROFILE_SIZE_MM_GENERATED,
  PRESET_SETTLED_SIZE_MM_GENERATED,
} from './amigurumiSizes.generated'
import { sphereRounds } from './sphereProfile'

export { sphereRounds }

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

/**
 * A POINTED CONE worked tip first (round 11): a FOUR-stitch magic ring IS the
 * point, growing ONE stitch a round to eight, then closed flat in one round —
 * the flat closed end is the side sewn to the head. A small ring and one a
 * round, not two, is what makes it a point rather than a bump: it settles
 * 16.6 wide by 32.1 long, where the first cut, 6-8-10-12-6, settled 23.6 x
 * 23.6 and rendered as a round nub (and 6-7-8-9-10-6 still read blunt). Worn
 * with `poleIn: false`, so the tip the camera sees is the magic ring, which
 * the sphere builder draws to a pinprick, not the fasten-off end, which
 * renders as a visible closing hole. Audits clean standing alone (worsted).
 */
export const CONE_ROUNDS: number[] = [4, 5, 6, 7, 8, 4]

/**
 * Every round profile the designer can produce, each one measured to pass the
 * loom's audit at worsted weight. The save path checks a submitted design's
 * pieces against this list; the test keeps the list true.
 */
export const AUDITED_PROFILES: number[][] = [
  // The closed round parts — heads, bodies, balls and eggs — on the sphere
  // profile (§8f-10).
  sphereRounds(12, 1), sphereRounds(12, 4),
  sphereRounds(18, 1), sphereRounds(18, 5),
  sphereRounds(24, 1), sphereRounds(24, 5),
  sphereRounds(30, 1), sphereRounds(36, 1),
  // The small pieces that measured no better as spheres: neck, muzzle, ear.
  ballRounds(12, 1), ballRounds(12, 2), ballRounds(12, 3),
  ballRounds(18, 2),
  tubeRounds(12, 3), tubeRounds(12, 4), tubeRounds(12, 6),
  // The bear's shortened M arm (round 10): the limb tube two rounds shorter.
  tubeRounds(12, 2),
  // The pointed CONES a cat's ear and a bird's beak are: the tube's climb to
  // twelve, then straight into the taper, so what stands out of the head is a
  // triangle rather than the round pad a bear's ear is. Audited clean at fine
  // 1.5, worsted 2.4 and bulky 3.2 (§8f-11).
  tubeRounds(12, 0), tubeRounds(12, 1),
  // The tip-first beak cone (round 11).
  CONE_ROUNDS,
  // The tails. Audited clean at the same three weights.
  cordRounds(5), cordRounds(9),
]

const PROFILE_KEYS = new Set(AUDITED_PROFILES.map((r) => r.join(',')))

/** Is this piece one of the profiles the audit has been run against? */
export function isAuditedProfile(rounds: number[]): boolean {
  return PROFILE_KEYS.has(rounds.join(','))
}

/** Every base the designer builds, as a const tuple so a zod schema can be
 *  derived from it instead of hand-copying the list (it was copied twice). */
export const AMIGURUMI_BASE_IDS = ['ball', 'egg', 'bear', 'bunny', 'cat', 'dog', 'bird', 'chick'] as const
export type AmigurumiBase = (typeof AMIGURUMI_BASE_IDS)[number]
export type AmigurumiSize = 'S' | 'M' | 'L'

export interface AmigurumiChoices {
  base: AmigurumiBase
  size: AmigurumiSize
  /** The main yarn. */
  mainHex: string
  /** The second yarn: muzzle, inner ears, paw pads. */
  contrastHex: string
  /** Safety eye diameter in mm. 0 leaves the face bare for embroidery. */
  eyeMm: number
  /** Add a moulded nose on the muzzle. */
  nose: boolean
  /** Add contrast paw pads on the ends of the limbs. */
  paws: boolean
  name?: string
}

/**
 * What one base IS, and which of the maker's toggles it can honour.
 *
 * A creature does not have every feature: a bird has a crocheted beak where a
 * bear has a moulded nose, and it has no limbs for paw pads to go on. Carrying
 * that per base — rather than as `base === 'bear' || base === 'bunny'` tests
 * scattered through the designer and the program builder — is what lets a new
 * base arrive without every caller needing to know about it.
 */
export interface AmigurumiBaseSpec {
  id: AmigurumiBase
  label: string
  blurb: string
  /** It has a muzzle a moulded safety nose can be fitted to. A beak is a
   *  crocheted piece, not a notion, so a bird's `nose` is false. */
  nose: boolean
  /** It has limbs for contrast paw pads. */
  paws: boolean
  /** What the second yarn actually makes on this base, in the maker's words. */
  contrastFor: string
}

export const AMIGURUMI_BASES: AmigurumiBaseSpec[] = [
  { id: 'ball', label: 'Ball', blurb: 'One stuffed ball. The amigurumi starting point.', nose: false, paws: false, contrastFor: 'Not used on a plain ball.' },
  { id: 'egg', label: 'Egg', blurb: 'A taller, rounded body on its own.', nose: false, paws: false, contrastFor: 'Not used on a plain egg.' },
  { id: 'bear', label: 'Bear', blurb: 'Body, head, muzzle, round ears, four limbs.', nose: true, paws: true, contrastFor: 'The muzzle and the paw pads.' },
  { id: 'bunny', label: 'Bunny', blurb: 'The same body with long ears standing up.', nose: true, paws: true, contrastFor: 'The muzzle and the paw pads.' },
  { id: 'cat', label: 'Cat', blurb: 'Pointed ears, a small muzzle, four legs and a long tail.', nose: true, paws: true, contrastFor: 'The muzzle and the paw pads.' },
  { id: 'dog', label: 'Dog', blurb: 'A round snout, two floppy ears, four legs and a short tail.', nose: true, paws: true, contrastFor: 'The snout and the paw pads.' },
  { id: 'bird', label: 'Bird', blurb: 'An egg body sitting on its base, a small head, a beak, two wings and two feet.', nose: false, paws: false, contrastFor: 'The beak and the feet.' },
  { id: 'chick', label: 'Chick', blurb: 'A round ball body, a big round head, a little beak, two small wings and two feet.', nose: false, paws: false, contrastFor: 'The beak and the feet.' },
]

/** The spec for one base (falls back to the bear's, which is the full set). */
export function amigurumiBaseSpec(base: AmigurumiBase): AmigurumiBaseSpec {
  return AMIGURUMI_BASES.find((b) => b.id === base) ?? AMIGURUMI_BASES[2]!
}

export const AMIGURUMI_SIZES: Array<{ id: AmigurumiSize; label: string }> = [
  { id: 'S', label: 'Small' },
  { id: 'M', label: 'Medium' },
  { id: 'L', label: 'Large' },
]

/** The diameters safety eyes are actually sold in, plus none. A real one is
 *  roughly a tenth of the head's width; anything much larger renders as a glass
 *  marble rather than an eye, so the smallest is the default. */
export const EYE_SIZES = [0, 6, 9, 12] as const

interface SizeProfile {
  body: number[]
  head: number[]
  neck: number[]
  muzzle: number[]
  bearEar: number[]
  bunnyEar: number[]
  limb: number[]
  /** The BEAR's arm: the limb tube with its straight run cut (round 10 —
   *  Rebecca's critique that the arms read as feet and too long). The bunny,
   *  cat and dog keep `limb` for their upper limbs. */
  bearArm: number[]
  /** The bear's head (round 11): as wide as the body, the classic teddy
   *  proportion. The bunny, cat and dog keep `head`. */
  bearHead: number[]
  /** Standalone single-piece profiles. */
  ball: number[]
  egg: number[]
  // ── The three animal bases added in §8f-11 ──────────────────────────────
  /** A cat's ear: the tube's climb to twelve straight into its taper, so what
   *  stands off the head is a pointed triangle. */
  catEar: number[]
  /** A dog's ear: the long tapered tube the bunny's ear is, hung DOWNWARD. */
  dogEar: number[]
  /** A dog's snout — one plateau round rounder than the bear's flat muzzle. */
  snout: number[]
  /** A cat's tail: a long thin cord. */
  catTail: number[]
  /** A dog's tail: the same cord, short. */
  dogTail: number[]
  /** A bird's body — an egg standing on its base — and its small head. */
  birdBody: number[]
  birdHead: number[]
  /** A bird's beak (the same cone as a cat's ear, small), its folded wing and
   *  its flat foot. */
  beak: number[]
  wing: number[]
  foot: number[]
  /** The chick (round 10): a BALL body — the sphere profile, not the bird's
   *  egg — and a head one equator step smaller, which is a chick's big-headed
   *  proportion. The beak, wings and feet reuse the bird's pieces. */
  chickBody: number[]
  chickHead: number[]
  /** Round 11: the chick's teardrop wing (the tapered tube) and its tuft. */
  chickWing: number[]
  chickTuft: number[]
}

/**
 * §8f-10. Every CLOSED ROUND piece — body, head, ball, egg — is a `sphereRounds`
 * profile at the equator its old `ballRounds` profile had, so the sizes barely
 * move but the shape does: measured crease at the cap/wall junction drops from
 * 36–38° to 10–11° and settled h/w from 0.66–0.74 to 0.96–0.99.
 *
 * The `+1` is one extra straight round at the equator. A bare sphere settles
 * slightly oblate (h/w 0.88–0.90) because the first two rounds off the magic
 * ring are genuinely flat — a +6 round has no meridian left for height, which is
 * true of a real crocheted ball too. One equator round buys the height back
 * without putting a corner in, because the profile reaches the equator
 * TANGENTIALLY (its last steps are +1 then 0) and a straight round then
 * continues the surface instead of turning it. The eggs use the same knob with a
 * longer middle.
 *
 * The neck, muzzle and bear ear stay on `ballRounds`. Measured, a 5–6-round
 * piece does not dome on any profile (crease 21.8° on `ballRounds(12,2)`, 23.1°
 * on `sphereRounds(12)`), and the sphere version turns the ear into a ball
 * (h/w 0.75 → 1.05) which is the wrong shape for an ear. The limbs and bunny
 * ears are tubes and were never ball profiles.
 */
const SIZES: Record<AmigurumiSize, SizeProfile> = {
  S: {
    body: sphereRounds(24, 1),
    head: sphereRounds(18, 1),
    neck: ballRounds(12, 1),
    muzzle: ballRounds(12, 1),
    bearEar: ballRounds(12, 2),
    bunnyEar: tubeRounds(12, 4),
    limb: tubeRounds(12, 3),
    bearArm: tubeRounds(12, 1),
    bearHead: sphereRounds(24, 1),
    // The small ball keeps its 12-stitch equator (a 30 mm ball) rather than
    // growing to match the crease target: at 6 rounds nothing domes.
    ball: sphereRounds(12, 1),
    egg: sphereRounds(12, 4),
    catEar: tubeRounds(12, 0),
    dogEar: tubeRounds(12, 4),
    snout: ballRounds(12, 2),
    catTail: cordRounds(5),
    dogTail: cordRounds(5),
    birdBody: sphereRounds(12, 4),
    birdHead: sphereRounds(12, 1),
    beak: tubeRounds(12, 0),
    wing: ballRounds(12, 2),
    foot: ballRounds(12, 1),
    chickBody: sphereRounds(18, 1),
    chickHead: sphereRounds(12, 1),
    chickWing: tubeRounds(12, 1),
    chickTuft: cordRounds(5),
  },
  M: {
    // The signed-off bear proof's own equators, on the sphere profile.
    body: sphereRounds(30, 1),
    head: sphereRounds(24, 1),
    neck: ballRounds(12, 1),
    muzzle: ballRounds(12, 1),
    bearEar: ballRounds(12, 2),
    bunnyEar: tubeRounds(12, 6),
    limb: tubeRounds(12, 4),
    bearArm: tubeRounds(12, 2),
    bearHead: sphereRounds(30, 1),
    ball: sphereRounds(24, 1),
    egg: sphereRounds(18, 5),
    catEar: tubeRounds(12, 0),
    dogEar: tubeRounds(12, 6),
    snout: ballRounds(12, 2),
    catTail: cordRounds(9),
    dogTail: cordRounds(5),
    birdBody: sphereRounds(18, 5),
    birdHead: sphereRounds(18, 1),
    beak: tubeRounds(12, 0),
    wing: ballRounds(12, 2),
    foot: ballRounds(12, 1),
    chickBody: sphereRounds(30, 1),
    chickHead: sphereRounds(18, 1),
    chickWing: tubeRounds(12, 1),
    chickTuft: cordRounds(5),
  },
  L: {
    body: sphereRounds(36, 1),
    head: sphereRounds(30, 1),
    neck: ballRounds(18, 2),
    muzzle: ballRounds(18, 2),
    bearEar: ballRounds(12, 3),
    bunnyEar: tubeRounds(12, 6),
    limb: tubeRounds(12, 6),
    bearArm: tubeRounds(12, 4),
    bearHead: sphereRounds(36, 1),
    ball: sphereRounds(36, 1),
    egg: sphereRounds(24, 5),
    catEar: tubeRounds(12, 0),
    dogEar: tubeRounds(12, 6),
    snout: ballRounds(18, 2),
    catTail: cordRounds(9),
    dogTail: cordRounds(5),
    birdBody: sphereRounds(24, 5),
    birdHead: sphereRounds(24, 1),
    beak: tubeRounds(12, 0),
    wing: ballRounds(12, 2),
    foot: ballRounds(12, 1),
    chickBody: sphereRounds(36, 1),
    chickHead: sphereRounds(24, 1),
    chickWing: tubeRounds(12, 1),
    chickTuft: cordRounds(5),
  },
}

/**
 * How far the forward leg needs lifting off its `seat` placement to keep every
 * foot pad on or above the table.
 *
 * `offset.z` in `PartPlacement` is a straight world-mm nudge applied AFTER the
 * whole rigid placement (composition.ts), so it moves a limb — and whatever
 * is seated on it, like a paw pad — by exactly this many mm. The M leg value
 * (-0.4) is the signed-off bear's own tuned number (round 2, §8e-2) and is
 * UNCHANGED here. It does not carry to S or L: those sizes change the body,
 * head and limb ROUND COUNTS (`SIZES`) but the paw pad is the same absolute
 * size at every size (fixed `scale: 0.62` on the same `s.muzzle` profile for
 * S/M), so on the longer L leg it reaches proportionally further past the
 * limb's own tip — measured (not guessed) off each size's settled, offset-free
 * chain. `amigurumi-presets.test.ts` asserts every preset settles with minz
 * within 0.5 mm of the table, which is what would catch this again if a future
 * round-count or placement change moves it.
 *
 * The ARM carries no lift any more. Round 2's arm lifts (S 4.2 / M 0.5 / L 8.0)
 * existed only because a straight-down arm's paw pad reached below the table;
 * the round-3 arm is held out and forward and its lowest point clears the
 * ground at every size, measured.
 */
const GROUND_LIFT: Record<AmigurumiSize, { leg: number }> = {
  S: { leg: 0.7 },
  M: { leg: -0.4 },
  L: { leg: 1.5 },
}

/**
 * The same thing for the bird's FEET, in two axes.
 *
 * An egg body is widest at its middle, so a foot seated on that surface at the
 * front-bottom settles both above the table and INSIDE the belly's own
 * silhouette — the bird stands on nothing and the feet cannot be seen. `y`
 * pushes each foot forward until it is a few millimetres proud of the breast;
 * `z` drops it until it rests ON the table. Both are measured off each size's
 * settled, offset-free chain, exactly the way `GROUND_LIFT` was, and both are
 * held honest by `amigurumi-presets.test.ts`'s minz assertion.
 */
const BIRD_FOOT_OFFSET: Record<AmigurumiSize, { y: number; z: number }> = {
  S: { y: 6.6, z: -4.7 },
  M: { y: 9.0, z: -3.2 },
  L: { y: 10.5, z: -1.4 },
}

/**
 * The per-size trims the three new animal bases need (§8f-11).
 *
 * Sizing comes from the ROUND COUNTS, and there are only so many audited
 * profiles; `scale` is the fine trim that keeps a piece in proportion to the
 * head or body it is sewn to as those counts step S -> M -> L. Every number
 * below is measured against the settled profile table, not guessed:
 *
 *   cat ear   tube 12,0 / 12,1 settles 27.1 x 28.3 / 28.5 x 32.3 mm; the S/M/L
 *             heads are 37.9 / 50.4 / 62.6 wide, and a real cat's ear is about
 *             40% of the head width at the base.
 *   dog ear   tube 12,4 / 12,6 settles 26.3 x 44.2 / 26.8 x 54.8; hung beside
 *             the head it wants to reach about two-thirds of the way down it.
 *   snout     ball 12,2 settles 26.1 x 20.7 and ball 18,2 38.0 x 24.4, against
 *             the bear's flat 25.1 x 15.4 muzzle — rounder, and standing
 *             further off the face.
 *   tail      cord 5 / cord 9 settles 16.0 x 31.3 / 16.1 x 55.5. A cat's tail
 *             is about half the body height again; a dog's is a stub.
 */
const CAT_EAR_SCALE: Record<AmigurumiSize, number> = { S: 0.72, M: 0.97, L: 1.22 }
/**
 * How deep the cat's ear is sewn in, per size — and it is NOT one number.
 *
 * The S head is a 37.9 mm eq-18 sphere against the M's 50.4, so the same 4 mm
 * seat buries proportionally far more of the ear and the composition's contact
 * pass then has to draw that much more fabric onto the head. Measured, that is
 * a real audit failure and not a cosmetic one: the S ear at scale 0.72 / seat 4
 * fails one interlock (`hook floated above its crown, dy 1.29yr`) and at 0.66 it
 * fails two. Backing the SEAT off — not the ear — keeps the ear the size the
 * head wants and takes the strain out of the join.
 */
const CAT_EAR_SEAT: Record<AmigurumiSize, number> = { S: 2.5, M: 4, L: 4.5 }
const DOG_EAR_SCALE: Record<AmigurumiSize, number> = { S: 0.5, M: 0.58, L: 0.78 }
const DOG_SNOUT_SCALE: Record<AmigurumiSize, number> = { S: 0.62, M: 0.82, L: 0.72 }
const CAT_TAIL_SCALE: Record<AmigurumiSize, number> = { S: 0.62, M: 0.6, L: 0.85 }
const DOG_TAIL_SCALE: Record<AmigurumiSize, number> = { S: 0.6, M: 0.8, L: 1.0 }

/** The bird's own trims — head against body, and the three small pieces. */
const BIRD_HEAD_SCALE: Record<AmigurumiSize, number> = { S: 0.82, M: 0.82, L: 0.82 }
const BIRD_HEAD_OVERLAP: Record<AmigurumiSize, number> = { S: 2.5, M: 3.5, L: 4.5 }
const BIRD_BEAK_SCALE: Record<AmigurumiSize, number> = { S: 0.3, M: 0.4, L: 0.5 }
const BIRD_WING_SCALE: Record<AmigurumiSize, number> = { S: 0.58, M: 0.8, L: 1.0 }
const BIRD_FOOT_SCALE: Record<AmigurumiSize, number> = { S: 0.32, M: 0.45, L: 0.6 }

/**
 * ROUND 3 — the arm pose, from the signed-off bear proof
 * (`apps/web/scripts/loom-composition-proofs.ts`). Round 2 hung both arms
 * straight down the body's sides, which on a body the arm is nearly as long as
 * settled the cream paw pads BELOW the cream foot pads: the figure read as four
 * feet with the arms coming out from under the legs.
 *
 * `ARM_DIR_*` is the attach direction on the body ellipsoid — 45° elevation,
 * 18° toward the front, i.e. the shoulder slope. `ARM_AIM_*` is where the arm
 * then points: tan 67° out of vertical in the side plane, tan 42° forward, so
 * the elbow swings clear of the body and the paw lands at mid-body.
 */
const ARM_DIR_Z = 1.0
const ARM_DIR_Y = 0.325
const ARM_AIM_Y = 0.3822
const ARM_AIM_Z = -0.4245

/**
 * ROUND 10 — the BEAR's shorter arm, and the pose it now wants (Rebecca's
 * critique of the round-3 bear: the arms read as feet, too long).
 *
 * Round 3 logged the cause and the cure: the arm+paw chain was 0.71 of the
 * body height where a real bear's arm is nearer half, so the only pose that
 * kept the paw off the feet held the arm out at 68° off vertical. The bear's
 * arm is now `bearArm` — the limb tube with two straight rounds cut at M (one
 * at S, two at L) — and on that shorter arm the round-3 pose lifts the paw to
 * 0.63 of the body height, nearly up at the shoulder. So the arm comes back
 * DOWN toward the body, 50° off vertical (round 3: 68°), and the paw lands at
 * mid-body.
 * Measured on bear-M (body 60.3 mm tall): paw pad centre z 29.8 = 0.494 of the
 * body height, 13.3 mm (0.221) above the foot pads, paw centre 6 mm outside
 * the body's half-width, minz 0.00. The bunny, cat and dog keep the round-3
 * pose and their full-length limb; their geometry is unchanged.
 */
// (Round 10 hung it at aim y 0.42, z -0.9; round 11 below replaces that.)

/**
 * ROUND 11 — Rebecca's verdict on round 10: the arms stuck out from the sides
 * as stubs. A sewn-on amigurumi arm hangs FORWARD and down and rests against
 * the front of the body, paws meeting the tummy above the legs (the reference
 * panda in `crochet-refs/cotton/cotton-17.png`). So the bear's arm is now
 * sewn on the side of the shoulder, a little forward (`BEAR_ARM_DIR`), and
 * aimed forward-down (`BEAR_ARM_AIM`), one size chunkier (scale 0.9) so it
 * reads as an arm rather than blending into the body. Measured on bear-M: the
 * arm runs from the shoulder at x ±32 to a paw at x ±14..30, y 28..39 against
 * the body's front at y 31, i.e. lying on the tummy; paw pad centre 0.5 of
 * the body height, above the thighs. Mirrored per side. Four probe rounds.
 */
const BEAR_ARM_DIR = { x: 1, y: 0.3, z: 0.75 }
const BEAR_ARM_AIM = { x: 0.1, y: 1, z: -0.6 }

/** The camera every figure is staged at, and therefore the angle the face is
 *  turned back through so it meets the lens. Both from the signed-off bear. */
const FIGURE_YAW = 26

const FIGURE_VIEW = {
  tiltDeg: 74,
  yawDeg: FIGURE_YAW,
  aimHeightFrac: 0.5,
  distScale: 1.05,
  marginFactor: 0.38,
  groundScale: 40,
  lightRig: 'product' as const,
  bgHex: '#faf8f5',
  exposure: 0.34,
}

const EYE_HEX = '#080706'
const NOSE_HEX = '#171310'

interface Dir {
  x: number
  y: number
  z: number
}

/**
 * Turn a FACE feature's attach direction to the camera.
 *
 * The figure's own front is +y, but the camera sits `FIGURE_YAW` round from
 * there, so a muzzle or an eye aimed straight down the front presents at an
 * angle. Rotating those directions back about z is a head turn: the face meets
 * the lens while the body, limbs and shadow keep the three-quarter angle. The
 * limbs are deliberately NOT rotated; they belong to the body.
 */
function faceDir(d: Dir): Dir {
  const t = (-FIGURE_YAW * Math.PI) / 180
  const c = Math.cos(t)
  const s = Math.sin(t)
  return { x: d.x * c - d.y * s, y: d.x * s + d.y * c, z: d.z }
}

export function amigurumiPresetName(choices: AmigurumiChoices): string {
  const base = AMIGURUMI_BASES.find((b) => b.id === choices.base)?.label ?? 'Amigurumi'
  const size = AMIGURUMI_SIZES.find((s) => s.id === choices.size)?.label ?? ''
  return choices.name?.trim() || `${size} ${base.toLowerCase()}`.trim()
}

/** The maker's choices → a composition the loom can build. */
export function buildAmigurumiProgram(choices: AmigurumiChoices): CompositionProgram {
  const s = SIZES[choices.size]
  const name = amigurumiPresetName(choices)

  if (choices.base === 'ball' || choices.base === 'egg') {
    const rounds = choices.base === 'ball' ? s.ball : s.egg
    return {
      name,
      yarnWeight: 'worsted',
      tiltDeg: 20,
      hookMm: 4,
      parts: [{ name: 'body', stitch: 'sc', rounds, colourHex: choices.mainHex, place: { on: 'ground' } }],
      props: faceProps(choices, 'body'),
      notes:
        choices.base === 'ball'
          ? 'A stuffed crochet ball, worked as one continuous spiral from a magic ring.'
          : 'A stuffed crochet egg, worked as one continuous spiral from a magic ring.',
    }
  }

  if (choices.base === 'bird') return birdProgram(choices, s, name)
  if (choices.base === 'chick') return chickProgram(choices, s, name)

  const main = choices.mainHex
  const contrast = choices.contrastHex
  // Where each limb is sewn and which way it then points. The arm numbers are
  // the signed-off bear's ROUND-3 pose (see ARM_DIR_Z / ARM_AIM_Z above); the
  // leg is unchanged — it lies forward along the table so the figure sits.
  const bear = choices.base === 'bear'
  const armDir = (side: -1 | 1): Dir =>
    bear
      ? { x: side * BEAR_ARM_DIR.x, y: BEAR_ARM_DIR.y, z: BEAR_ARM_DIR.z }
      : { x: side * 1, y: ARM_DIR_Y, z: ARM_DIR_Z }
  const armAim = (side: -1 | 1): Dir =>
    bear
      ? { x: side * BEAR_ARM_AIM.x, y: BEAR_ARM_AIM.y, z: BEAR_ARM_AIM.z }
      : { x: side * 1, y: ARM_AIM_Y, z: ARM_AIM_Z }
  const legAim = (side: -1 | 1): Dir => ({ x: side * 0.26, y: 1, z: -0.05 })
  // A bear and a bunny sit up and have ARMS; a cat and a dog are on four legs,
  // and the written pattern has to say so. The piece is the same tapered tube
  // in the same place either way — only the name the maker reads changes, and
  // `compositionPattern.ts` builds the piece list and the assembly wording
  // straight off these names.
  const onAllFours = choices.base === 'cat' || choices.base === 'dog'
  const upperName = (side: -1 | 1): string =>
    onAllFours ? (side < 0 ? 'front-leg-l' : 'front-leg-r') : side < 0 ? 'arm-l' : 'arm-r'
  const lowerName = (side: -1 | 1): string =>
    onAllFours ? (side < 0 ? 'back-leg-l' : 'back-leg-r') : side < 0 ? 'leg-l' : 'leg-r'

  const parts: AmigurumiPart[] = [
    { name: 'body', stitch: 'sc', rounds: s.body, colourHex: main, place: { on: 'ground' } },
    // A short narrow neck piece, so the silhouette steps body, neck, head
    // rather than the two balls merging into one loaf.
    {
      name: 'neck', stitch: 'sc', rounds: s.neck, colourHex: main, scale: 0.85,
      place: { on: 'body', overlap: 6, offset: { y: 1.5 } },
    },
    {
      // Round 11: the bear's head is as wide as its body (`bearHead`) — the
      // classic teddy proportion; round 10's smaller head read as a doll.
      // Sunk 5 mm onto the neck (not 2) so no pinched neck shows under it.
      name: 'head', stitch: 'sc', rounds: bear ? s.bearHead : s.head, colourHex: main,
      place: { on: 'neck', overlap: bear ? 5 : 2, offset: { y: 1 } },
    },
    // A dog's SNOUT is one plateau round rounder than the bear's flat muzzle
    // pad and stands further off the face; a cat's is the bear's, smaller.
    // Named `muzzle` in every case so the written pattern and the assembly
    // wording stay the same piece.
    {
      name: 'muzzle', stitch: 'sc',
      rounds: choices.base === 'dog' ? s.snout : s.muzzle,
      colourHex: contrast,
      // Round 11: the bear's muzzle grows with its bigger head, and shows its
      // magic ring (drawn to a pinprick, under the nose) instead of the
      // fasten-off end, which rendered as a hole round the nose.
      scale: choices.base === 'dog' ? DOG_SNOUT_SCALE[choices.size] : choices.base === 'cat' ? 0.78 : bear ? 1.15 : 0.85,
      place: {
        on: 'head', dir: faceDir({ x: 0, y: 1, z: choices.base === 'cat' ? -0.3 : bear ? -0.32 : -0.22 }),
        seat: choices.base === 'dog' ? 4 : 3, poleIn: !bear, surfaceFit: 'ellipsoid',
      },
    },
  ]

  if (choices.base === 'bear') {
    // Round ears, high on the SIDES of the crown, leaning forward, seated only
    // 3.5 mm so most of each ear stands off the head.
    for (const side of [-1, 1] as const) {
      parts.push({
        name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.bearEar, colourHex: main, scale: 0.92,
        place: {
          on: 'head',
          // Round 11: further up onto the crown (0.72 out, not 0.95), where a
          // teddy's ears sit; round 10's sat on the sides of the head.
          dir: faceDir({ x: side * 0.72, y: 0.12, z: 1 }),
          aim: faceDir({ x: side * 0.8, y: 0.35, z: 1 }),
          seat: 3.5, poleIn: true, surfaceFit: 'ellipsoid',
        },
      })
    }
  } else if (choices.base === 'cat') {
    // A cat's ears are POINTED and they sit on TOP of the head, not on its
    // sides: the cone flares to twelve stitches as it leaves the join and then
    // runs straight into its taper, so the silhouette is a triangle. Set at
    // 0.6 out from the crown's axis rather than the bear's 0.95, which is the
    // difference between "on top" and "on the sides".
    for (const side of [-1, 1] as const) {
      parts.push({
        name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.catEar, colourHex: main,
        scale: CAT_EAR_SCALE[choices.size],
        place: {
          on: 'head',
          dir: faceDir({ x: side * 0.68, y: 0.12, z: 1 }),
          aim: faceDir({ x: side * 0.5, y: 0.02, z: 1 }),
          seat: CAT_EAR_SEAT[choices.size], poleIn: true, surfaceFit: 'ellipsoid',
        },
      })
    }
  } else if (choices.base === 'dog') {
    // Floppy ears: the same long tapered tube a bunny's ear is, joined high on
    // the SIDES of the head and aimed DOWN, so each one hangs beside the face
    // instead of standing out of the crown. That one flipped aim is the whole
    // difference between a lop-eared dog and a rabbit.
    for (const side of [-1, 1] as const) {
      parts.push({
        name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.dogEar, colourHex: main,
        scale: DOG_EAR_SCALE[choices.size],
        place: {
          on: 'head',
          dir: faceDir({ x: side * 1, y: 0.12, z: 0.5 }),
          aim: faceDir({ x: side * 0.4, y: 0.05, z: -1 }),
          seat: 3.5, poleIn: true, surfaceFit: 'ellipsoid',
        },
      })
    }
  } else {
    // A bunny's ears are long tapered tubes standing up out of the crown, set
    // closer in than a bear's and leaning back a touch.
    for (const side of [-1, 1] as const) {
      parts.push({
        name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.bunnyEar, colourHex: main, scale: 0.8,
        place: {
          on: 'head',
          dir: faceDir({ x: side * 0.42, y: 0.05, z: 1 }),
          aim: faceDir({ x: side * 0.34, y: -0.1, z: 1 }),
          seat: 4, poleIn: true, surfaceFit: 'ellipsoid',
        },
      })
    }
  }

  const lift = GROUND_LIFT[choices.size]
  for (const side of [-1, 1] as const) {
    parts.push({
      name: upperName(side), stitch: 'sc',
      rounds: choices.base === 'bear' ? s.bearArm : s.limb,
      colourHex: main, scale: bear ? 0.9 : 0.78,
      place: {
        on: 'body', dir: armDir(side),
        aim: armAim(side), seat: 6, poleIn: true, surfaceFit: 'ellipsoid',
      },
    })
  }
  for (const side of [-1, 1] as const) {
    parts.push({
      name: lowerName(side), stitch: 'sc', rounds: s.limb, colourHex: main, scale: 0.9,
      place: {
        on: 'body', dir: { x: side * 0.52, y: 0.8, z: -0.55 },
        aim: legAim(side), seat: 8, poleIn: true, surfaceFit: 'ellipsoid',
        offset: { z: lift.leg },
      },
    })
  }

  // The TAIL, and WHERE it has to go to be seen (round 2).
  //
  // The scene's camera sits on the +x, +y side of the figure — `tiltDeg` and
  // `yawDeg` put it at (sin yaw, -cos yaw) in Blender, and the render script
  // negates y, so +y is the side facing the lens. Round 1 sewed the tail
  // straight out of the BACK (y -0.9) and it was invisible in every render:
  // the body hid all of it. It is now joined on the near FLANK, behind the
  // hips, and swept up and out — which is both where a sitting cat's tail
  // actually lies and the one placement that breaks the body's silhouette
  // from this camera. Measured on cat-M: the tip lands 10 mm outside the
  // body's widest point and level with its shoulder.
  if (choices.base === 'cat' || choices.base === 'dog') {
    const cat = choices.base === 'cat'
    parts.push({
      name: 'tail', stitch: 'sc',
      rounds: cat ? s.catTail : s.dogTail,
      colourHex: main,
      scale: (cat ? CAT_TAIL_SCALE : DOG_TAIL_SCALE)[choices.size],
      place: {
        on: 'body',
        dir: cat ? { x: 1, y: -0.55, z: -0.45 } : { x: 0.95, y: -0.7, z: 0.05 },
        aim: cat ? { x: 0.58, y: -0.3, z: 0.9 } : { x: 0.6, y: -0.3, z: 0.85 },
        seat: 6, poleIn: true, surfaceFit: 'ellipsoid',
      },
    })
  }

  if (choices.paws && amigurumiBaseSpec(choices.base).paws) {
    const pad = (name: string, on: string, dir: Dir): AmigurumiPart => ({
      name, stitch: 'sc', rounds: s.muzzle, colourHex: contrast, scale: 0.62,
      // The bear's pads show their magic ring (a pinprick) rather than the
      // fasten-off hole (round 11); the other bases are unchanged.
      place: { on, dir, seat: 3, poleIn: !bear, surfaceFit: 'ellipsoid' },
    })
    parts.push(
      pad('paw-al', upperName(-1), armAim(-1)),
      pad('paw-ar', upperName(1), armAim(1)),
      pad('paw-ll', lowerName(-1), legAim(-1)),
      pad('paw-lr', lowerName(1), legAim(1)),
    )
  }

  return {
    name,
    yarnWeight: 'worsted',
    hookMm: 4,
    ...FIGURE_VIEW,
    parts,
    props: faceProps(choices, 'head'),
    notes: FIGURE_NOTES[choices.base] ?? FIGURE_NOTES.bear!,
  }
}

/** The one-line description of each four-legged base, for the pattern's notes. */
const FIGURE_NOTES: Partial<Record<AmigurumiBase, string>> = {
  bear: 'A sitting bear: a stuffed body, a short neck and a round head, a muzzle, two ears, two arms and two legs, each worked as a spiral from a magic ring and sewn on.',
  bunny: 'A sitting bunny: a stuffed body, a short neck and a round head, a muzzle, two long ears, two arms and two legs, each worked as a spiral from a magic ring and sewn on.',
  cat: 'A sitting cat: a stuffed body, a short neck and a round head, a small muzzle, two pointed ears, two front legs, two back legs and a long tail, each worked as a spiral from a magic ring and sewn on.',
  dog: 'A sitting dog: a stuffed body, a short neck and a round head, a rounded snout, two floppy ears, two front legs, two back legs and a short tail, each worked as a spiral from a magic ring and sewn on.',
}

/**
 * THE BIRD (§8f-11) — the one base that is not built on the bear's skeleton.
 *
 * A bird has no neck, no muzzle and no limbs, so it does not go down the
 * four-legged path at all. It is an EGG standing on its own base with a small
 * ball head sitting straight on top of it, a crocheted cone for a beak, two
 * folded wings down its flanks and two flat feet at the front — which is how a
 * simple crocheted chick or robin is actually made.
 *
 * Two things it does NOT get, and both are deliberate: no moulded nose (a beak
 * is a crocheted piece, not a notion, so `AmigurumiBaseSpec.nose` is false and
 * the designer hides the toggle), and no paw pads (nothing to put them on).
 * The second yarn goes on the beak and the feet instead.
 */
function birdProgram(choices: AmigurumiChoices, s: SizeProfile, name: string): CompositionProgram {
  const main = choices.mainHex
  const contrast = choices.contrastHex
  const parts: AmigurumiPart[] = [
    { name: 'body', stitch: 'sc', rounds: s.birdBody, colourHex: main, place: { on: 'ground' } },
    // The head sits STRAIGHT on the egg's crown — no neck piece. Nudged
    // forward so the face is over the breast rather than over the tail.
    {
      name: 'head', stitch: 'sc', rounds: s.birdHead, colourHex: main, scale: BIRD_HEAD_SCALE[choices.size],
      place: { on: 'body', overlap: BIRD_HEAD_OVERLAP[choices.size], offset: { y: 1.5 } },
    },
    // The beak: the cat's ear cone, small, in the second yarn, pointing
    // forward and a shade down off the front of the head.
    {
      // Round 11: the tip-first cone, magic ring outward, so the point has no
      // closing hole (it rendered as a blunt nub with a hole on bird and chick).
      name: 'beak', stitch: 'sc', rounds: CONE_ROUNDS, colourHex: contrast, scale: BIRD_BEAK_SCALE[choices.size],
      place: { on: 'head', dir: faceDir({ x: 0, y: 1, z: -0.05 }), seat: 2.5, poleIn: false, surfaceFit: 'ellipsoid' },
    },
  ]
  // Two wings, joined high on the body's sides and aimed DOWN and a little
  // back, so each lies folded along its flank instead of sticking out.
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'wing-l' : 'wing-r', stitch: 'sc', rounds: s.wing, colourHex: main,
      scale: BIRD_WING_SCALE[choices.size],
      place: {
        on: 'body',
        dir: { x: side * 1, y: 0.16, z: 0.6 },
        aim: { x: side * 0.72, y: 0.06, z: -0.62 },
        seat: 4.5, poleIn: true, surfaceFit: 'ellipsoid',
      },
    })
  }
  // Two flat feet at the very front of the base, lying forward along the
  // table. `BIRD_FOOT_LIFT` is the measured nudge that keeps them ON it.
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'foot-l' : 'foot-r', stitch: 'sc', rounds: s.foot, colourHex: contrast,
      scale: BIRD_FOOT_SCALE[choices.size],
      place: {
        on: 'body',
        dir: { x: side * 0.25, y: 0.5, z: -1.5 },
        aim: { x: side * 0.2, y: 1, z: -0.02 },
        seat: 6, poleIn: true, surfaceFit: 'ellipsoid',
        offset: BIRD_FOOT_OFFSET[choices.size],
      },
    })
  }
  return {
    name,
    yarnWeight: 'worsted',
    hookMm: 4,
    ...FIGURE_VIEW,
    parts,
    props: faceProps(choices, 'head'),
    notes:
      'A little sitting bird: a stuffed egg body on its own base, a small round head, ' +
      'a pointed beak, two folded wings and two flat feet, each worked as a spiral ' +
      'from a magic ring and sewn on.',
  }
}

/**
 * The chick's per-size trims (round 10), measured off each size's settled
 * chain the way the bird's were. A chick is the bird's construction on a BALL
 * body: no neck, the head sitting straight on the crown, a small cone beak in
 * the second yarn, two small wings and two flat feet. `CHICK_FOOT_OFFSET`
 * plays the same part `BIRD_FOOT_OFFSET` does — forward until the foot is
 * proud of the breast, down until it rests on the table — and
 * `amigurumi-presets.test.ts`'s minz assertion keeps it honest.
 */
const CHICK_HEAD_OVERLAP: Record<AmigurumiSize, number> = { S: 6, M: 9, L: 10 }
const CHICK_BEAK_SCALE: Record<AmigurumiSize, number> = { S: 0.36, M: 0.5, L: 0.6 }
const CHICK_WING_SCALE: Record<AmigurumiSize, number> = { S: 0.55, M: 0.8, L: 0.95 }
const CHICK_TUFT_SCALE: Record<AmigurumiSize, number> = { S: 0.4, M: 0.52, L: 0.62 }
const CHICK_FOOT_SCALE: Record<AmigurumiSize, number> = { S: 0.32, M: 0.48, L: 0.56 }
const CHICK_FOOT_OFFSET: Record<AmigurumiSize, { y: number; z: number }> = {
  S: { y: 8, z: -2.8 },
  M: { y: 13, z: -2.4 },
  L: { y: 15, z: -2.8 },
}

/**
 * THE CHICK (round 10). Not a bird on an egg: a round ball body — the sphere
 * profile — with a big round head straight on top of it, which is the
 * proportion that says "chick" rather than "robin". The face is the bird's
 * (safety eyes on the head, a crocheted cone beak a shade below them), the
 * wings are small pads low on the flanks, and the feet sit at the front of the
 * base on the table. Like the bird it has no moulded nose and no paw pads; the
 * second yarn makes the beak and the feet.
 */
function chickProgram(choices: AmigurumiChoices, s: SizeProfile, name: string): CompositionProgram {
  const main = choices.mainHex
  const contrast = choices.contrastHex
  const parts: AmigurumiPart[] = [
    { name: 'body', stitch: 'sc', rounds: s.chickBody, colourHex: main, place: { on: 'ground' } },
    // Round 11: the head is clearly SMALLER than the body (0.6 of its width)
    // and sunk well into it, so body and head read as one teardrop rather
    // than two balls stacked like a snowman.
    {
      name: 'head', stitch: 'sc', rounds: s.chickHead, colourHex: main,
      place: { on: 'body', overlap: CHICK_HEAD_OVERLAP[choices.size], offset: { y: 1 } },
    },
    // The tip-first cone, magic ring outward: a small point with no hole.
    {
      name: 'beak', stitch: 'sc', rounds: CONE_ROUNDS, colourHex: contrast, scale: CHICK_BEAK_SCALE[choices.size],
      place: { on: 'head', dir: faceDir({ x: 0, y: 1, z: 0 }), seat: 2.5, poleIn: false, surfaceFit: 'ellipsoid' },
    },
    // A little tuft standing up out of the crown and leaning forward: a short
    // cord, magic ring at its tip.
    {
      name: 'tuft', stitch: 'sc', rounds: s.chickTuft, colourHex: main, scale: CHICK_TUFT_SCALE[choices.size],
      place: {
        on: 'head', dir: faceDir({ x: 0, y: 0.15, z: 1 }), aim: faceDir({ x: 0, y: 1.3, z: 0.7 }),
        seat: 2, poleIn: false, surfaceFit: 'ellipsoid',
      },
    },
  ]
  // TEARDROP wings (round 11): the tapered tube, joined by its round end high
  // on the flank and running down and back along the side to its point.
  // Turned with the face (`faceDir`) so the pair sits square to the beak.
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'wing-l' : 'wing-r', stitch: 'sc', rounds: s.chickWing, colourHex: main,
      scale: CHICK_WING_SCALE[choices.size],
      place: {
        on: 'body',
        dir: faceDir({ x: side * 1, y: 0.05, z: 0.55 }),
        aim: faceDir({ x: side * 0.45, y: -0.25, z: -0.9 }),
        seat: 4, poleIn: true, surfaceFit: 'ellipsoid',
      },
    })
  }
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'foot-l' : 'foot-r', stitch: 'sc', rounds: s.foot, colourHex: contrast,
      scale: CHICK_FOOT_SCALE[choices.size],
      // Turned with the face (`faceDir`) so the pair sits under the beak, each
      // toed OUT a little (round 11), magic ring outward so no hole shows.
      place: {
        on: 'body',
        dir: faceDir({ x: side * 0.3, y: 0.7, z: -1.2 }),
        aim: faceDir({ x: side * 0.55, y: 1, z: -0.02 }),
        seat: 5, poleIn: false, surfaceFit: 'ellipsoid',
        offset: faceDir({ x: 0, y: CHICK_FOOT_OFFSET[choices.size].y, z: CHICK_FOOT_OFFSET[choices.size].z }),
      },
    })
  }
  return {
    name,
    yarnWeight: 'worsted',
    hookMm: 4,
    ...FIGURE_VIEW,
    parts,
    props: faceProps(choices, 'head'),
    notes:
      'A little chick: a stuffed round body, a smaller round head with a tuft, a pointed beak, ' +
      'two teardrop wings and two flat feet, each worked as a spiral from a magic ring and sewn on.',
  }
}

/**
 * Safety eyes and a nose, seated the way the signed-off bear seats them.
 *
 * `seat` is measured against the strand centre-line hull and the rendered yarn
 * stands about 1.8 mm proud of that, so a notion seated by its own radius
 * disappears into the fabric. Seating a safety eye by MINUS its own radius puts
 * its equator at the wool surface and the whole dome proud of it, which is where
 * a real safety eye's dome sits once the shank is through the fabric.
 */
/**
 * Where the safety eyes sit on the face, per base. Round 11 (Rebecca's bar:
 * "eyes set low and wide"): the bear's and the chick's come down and out from
 * the 0.62 / 0.42 every base used. Props are notions, outside the geometry
 * hash, so this moves no hash.
 */
const EYE_SET: Record<AmigurumiBase, { x: number; z: number }> = {
  ball: { x: 0.62, z: 0.42 }, egg: { x: 0.62, z: 0.42 }, bunny: { x: 0.62, z: 0.42 },
  cat: { x: 0.62, z: 0.42 }, dog: { x: 0.62, z: 0.42 }, bird: { x: 0.62, z: 0.42 },
  bear: { x: 0.72, z: 0.16 },
  chick: { x: 0.66, z: 0.2 },
}

function faceProps(choices: AmigurumiChoices, on: string): CompositionProp[] | undefined {
  const props: CompositionProp[] = []
  if (choices.eyeMm > 0) {
    const r = choices.eyeMm / 2
    for (const side of [-1, 1] as const) {
      props.push({
        name: side < 0 ? 'eye-l' : 'eye-r',
        on,
        dir: faceDir({ x: side * EYE_SET[choices.base].x, y: 1, z: EYE_SET[choices.base].z }),
        radiusMm: r,
        seat: -(r + 0.2),
        colourHex: EYE_HEX,
        gloss: 0.85,
      })
    }
  }
  if (choices.nose && amigurumiBaseSpec(choices.base).nose) {
    props.push({
      name: 'nose',
      on: 'muzzle',
      dir: faceDir({ x: 0, y: 1, z: 0.42 }),
      // The bear's nose is a teddy's broad oval (round 11); the rest unchanged.
      radiusMm: choices.base === 'bear' ? 2.6 : 1.9,
      seat: choices.base === 'bear' ? -2.4 : -1.8,
      flatten: 0.65,
      widen: 1.4,
      colourHex: NOSE_HEX,
      gloss: 0.4,
    })
  }
  return props.length ? props : undefined
}

/** Every combination the designer can produce — what the audit test walks. */
export function allPresetChoices(): AmigurumiChoices[] {
  const out: AmigurumiChoices[] = []
  for (const base of AMIGURUMI_BASES) {
    for (const size of AMIGURUMI_SIZES) {
      out.push({
        base: base.id,
        size: size.id,
        mainHex: '#b5814e',
        contrastHex: '#e6d3ae',
        eyeMm: 9,
        nose: true,
        paws: true,
      })
    }
  }
  return out
}

// ── Measured sizes ─────────────────────────────────────────────────────────
// The tables below are GENERATED (scripts/loom-preset-sizes.ts) from a real
// compile + relax + audit of every profile and every preset — settled sizes,
// not estimates and not hand-typed. They let the Studio show a real finished
// size and draw a schematic at true proportions without paying for the
// compile on every request, and they let the save path record the size
// straight away. `amigurumi-presets.test.ts` re-measures on every run and
// fails the build if a fresh compile drifts more than 10% from what is
// checked in, so a re-cut round builder can never leave these stale. The
// render job measures it again for real and writes it back.

export const PROFILE_SIZE_MM = PROFILE_SIZE_MM_GENERATED

/** A piece's settled size, falling back to the stitch-count estimate for a
 *  profile that is not in the measured table (e.g. a shape the generator has
 *  not been run against yet). */
export function profileSizeMm(rounds: number[]): { width: number; height: number } {
  const measured = PROFILE_SIZE_MM[rounds.join(',')]
  if (measured) return measured
  const widest = Math.max(...rounds)
  // ~3.8 mm a stitch around, ~3.3 mm a round up: the pitches the settled
  // measurements above work out to.
  return { width: (widest * 3.8) / Math.PI, height: rounds.length * 3.3 }
}

/** The whole finished piece's settled size, by preset and size. */
export const PRESET_SETTLED_SIZE_MM = PRESET_SETTLED_SIZE_MM_GENERATED

export function presetSettledSizeMm(base: AmigurumiBase, size: AmigurumiSize): { width: number; height: number } {
  return PRESET_SETTLED_SIZE_MM[`${base}-${size}`] ?? { width: 60, height: 60 }
}
