/**
 * THE DOLL BASE (audit round 6, "Doll base at fine gauge"; bar: the fairy doll).
 *
 * A slim STANDING doll in 4 ply cotton on a 2.5 mm hook, built the way the
 * fine-cotton doll designers build theirs:
 *
 *   1. LEGS, worked UP from the sole: a flat magic-ring sole, two rounds of foot
 *      wall, one decrease round for the ankle, then the leg straight up. The
 *      first leg is fastened off; the second is not.
 *   2. The BODY is worked straight on from the second leg: the JOINING ROUND
 *      chains across to the first leg, works round it, back across the other
 *      side of the chain and round the second leg (2 x leg + 2 x chain
 *      stitches). Then the hips, the waist, the chest, a flat shoulder line
 *      and a narrow neck, left open. Skin and dress are COLOUR CHANGES in this
 *      one piece: dress colour from the joining round up to the chest, skin
 *      from the chest to the neck.
 *   3. A round HEAD from a magic ring at the crown, stuffed and closed, sewn on
 *      the neck.
 *   4. Slim ARMS worked from the HAND: a small round hand, a wrist decrease,
 *      the arm straight up, closed and sewn on at the shoulder.
 *
 * The legs and body are OPEN pieces (`tube.ts`: a leg's sole is a magic ring
 * worked flat; the body starts from the joining round, modelled as a ring of
 * exactly the stitches the joining round is worked into, and stays open at the
 * neck). Head and arms are the locked closed-ball builder. Every piece is
 * built, relaxed and AUDITED like any other composition part.
 *
 * WHAT IS APPROXIMATED, said plainly: the joining round's ring is a circle
 * of 2L + 2c stitches sitting over the two leg tops (seated into it), where
 * the real one is a figure of eight through the legs' last rounds. Seen from
 * the front at listing height they read the same (a round bottom over two
 * legs); seen from underneath the crotch is not modelled. The skirt (later
 * round) covers it.
 *
 * HOOKS for the later rounds (hair, clothes, wings) are in `DOLL_HOOKS`: the
 * named rounds and directions those pieces will be worked into or sewn on, so
 * they arrive as small additive pieces without re-cutting this base.
 *
 * New file: the composition layer only gained small optional fields
 * (`tube`, `flip`, `colourChanges`, `words`, `joinWords`, ring props).
 */

import type { AmigurumiPart, CompositionProgram, CompositionProp } from './composition'
import { writeInstructions, type CrochetProgram } from './program'
import { sphereRounds } from './sphereProfile'
import type { EmbroideryFeature, EmbroideryStitch, FaceStyle, SurfaceSpot } from './faceEmbroidery'

type Size = 'S' | 'M' | 'L'

/** What the doll builder needs from the maker's choices (a structural subset of
 *  `AmigurumiChoices`, so this module does not import the preset library). */
export interface DollChoices {
  size: Size
  /** The main yarn: her SKIN (legs, arms, head, shoulders). */
  mainHex: string
  /** The second yarn: her DRESS colour (the body from the hips to the chest). */
  contrastHex: string
  eyeMm: number
  face?: FaceStyle
}

/** One size of doll, in stitch counts. */
interface DollSize {
  label: string
  /** Leg, from the sole. */
  leg: number[]
  /** Chains bridging the legs in the joining round (each side). */
  bridge: number
  /** Body, from the joining round (rounds[0]) to the neck. */
  body: number[]
  /** First body round worked in skin (the colour change at the chest). */
  skinFrom: number
  head: number[]
  /** Arm, from the hand. */
  arm: number[]
  /** Leg centres either side of the middle (mm). */
  legApart: number
  /** Head sunk onto the neck (mm). */
  headOverlap: number
  /** A keyring charm: a jump ring and split ring through the crown. */
  keyring: boolean
}

/** The leg: a flat sole of `sole` stitches (6, 12, … climbing in sixes, the
 *  last step to `sole` itself), `wall` rounds of foot, a decrease to `width`,
 *  then straight to `rounds` rounds in all. */
function legRounds(sole: number, width: number, wall: number, rounds: number): number[] {
  const up: number[] = []
  for (let n = 6; n < sole; n += 6) up.push(n)
  up.push(sole)
  const out = [...up, ...Array.from({ length: wall }, () => sole)]
  while (out.length < rounds) out.push(width)
  return out
}

/** An arm from the hand: 6 in the ring, up to the hand, `handRounds` of hand,
 *  a decrease to the arm, straight, and one closing round to 6. */
function armRounds(hand: number, width: number, handRounds: number, rounds: number): number[] {
  const out = [6, hand, ...Array.from({ length: handRounds }, () => hand)]
  while (out.length < rounds - 1) out.push(width)
  out.push(6)
  return out
}

/**
 * The sizes. Fine-gauge counts: at 4 ply on a 2.5 mm hook one dc is ~3.5 mm
 * wide and a round ~3.3 mm tall, so the M head (66 sts round) is ~74 mm across
 * and the doll ~23 cm tall, the bar fairy's build (about 26 stitches across her face). The S size is a KEYRING
 * charm (~9 cm) with a split ring through the crown.
 */
export const DOLL_SIZES: Record<Size, DollSize> = {
  S: {
    label: 'keyring charm',
    leg: legRounds(12, 10, 2, 10),
    bridge: 2,
    // joining round 2·10 + 2·2 = 24
    body: [24, 26, 27, 27, 27, 26, 24, 22, 18, 12, 12],
    skinFrom: 8,
    head: sphereRounds(36, 1),
    arm: armRounds(9, 7, 2, 8),
    legApart: 7.4,
    headOverlap: 4,
    keyring: true,
  },
  M: {
    label: 'doll',
    leg: legRounds(18, 16, 2, 33),
    bridge: 3,
    // joining round 2·16 + 2·3 = 38; an egg-shaped torso, the shoulders
    // sloping in over several rounds rather than one flat step.
    body: [38, 40, 42, 44, 45, 45, 45, 44, 42, 40, 38, 36, 34, 34, 32, 28, 24, 20, 16, 12, 12, 12],
    skinFrom: 13,
    head: sphereRounds(66, 1),
    arm: armRounds(11, 9, 3, 22),
    legApart: 11.5,
    headOverlap: 8,
    keyring: false,
  },
  L: {
    label: 'large doll',
    leg: legRounds(21, 18, 2, 37),
    bridge: 3,
    // joining round 2·18 + 2·3 = 42
    body: [42, 44, 46, 48, 50, 50, 50, 50, 48, 46, 44, 42, 40, 38, 38, 36, 32, 28, 24, 20, 16, 12, 12, 12],
    skinFrom: 14,
    head: sphereRounds(72, 1),
    arm: armRounds(12, 10, 3, 25),
    legApart: 12.8,
    headOverlap: 9,
    keyring: false,
  },
}

/** The doll's piece profiles, as audited (the doll test compiles every size
 *  through the real audit). Keys are `rounds.join(',')` like `AUDITED_PROFILES`. */
export const DOLL_AUDITED_PROFILE_KEYS: Set<string> = new Set(
  (['S', 'M', 'L'] as const).flatMap((k) => {
    const s = DOLL_SIZES[k]
    return [s.leg, s.body, s.head, s.arm].map((r) => r.join(','))
  }),
)

/**
 * Named places the LATER doll rounds attach to, per size, in pattern terms —
 * so hair, clothes and wings arrive as additive pieces:
 *  - `hairline`: the head round the hair cap's last round meets, and `crown`
 *    (round 1 of the head = the magic ring) where curls / buns are rooted.
 *  - `waist`: the body round a skirt is worked into (front loops) or sewn
 *    round; `chest`: the round the dress colour stops at.
 *  - `wings`: the body round on her BACK, between the shoulder blades, and the
 *    direction (body frame: +y front, +z up) a wing pair is sewn on at.
 *  - `shoulder`: the body round the arms are sewn to.
 */
export function dollHooks(size: Size): {
  head: { crown: number; hairline: number; rounds: number }
  body: { waist: number; chest: number; shoulder: number; rounds: number }
  wings: { on: 'body'; round: number; dir: { x: number; y: number; z: number } }
} {
  const s = DOLL_SIZES[size]
  const widest = Math.max(...s.body)
  const lastHip = s.body.lastIndexOf(widest) + 1
  const shoulder = s.body.findIndex((c, i) => i > 0 && c < s.body[i - 1]! && i >= s.skinFrom - 1) // first shoulder decrease
  return {
    head: { crown: 1, hairline: Math.round(s.head.length * 0.62), rounds: s.head.length },
    body: { waist: lastHip + 1, chest: s.skinFrom, shoulder: shoulder > 0 ? shoulder : s.body.length - 3, rounds: s.body.length },
    wings: { on: 'body', round: s.skinFrom - 1, dir: { x: 0, y: -1, z: 0.35 } },
  }
}

// ── Pattern words ───────────────────────────────────────────────────────────

/** "Round 7: …" lines for a piece, with the colour change written in where it
 *  happens (the UK way: the last stitch of the round before is finished with
 *  the new colour). */
function withColourChange(lines: string[], fromRound: number, colourLabel: string): string[] {
  const out: string[] = []
  for (const line of lines) {
    const m = /^Round (\d+):/.exec(line)
    if (m && Number(m[1]) === fromRound) {
      out.push(
        `Change to ${colourLabel}: work the last stitch of round ${fromRound - 1} up to its final yarn over, ` +
          `then pull ${colourLabel} through to finish it. Carry on in ${colourLabel}; cut the old yarn, leaving a tail to weave in inside.`,
      )
    }
    out.push(line)
  }
  return out
}

function legWords(s: DollSize): string[] {
  const p: CrochetProgram = { name: 'Leg', form: 'tube', stitch: 'sc', rounds: s.leg, tube: { anchor: 'ring', join: 'spiral', cap: 'flat' } }
  const lines = writeInstructions(p).filter((l) => !/^Fasten off/.test(l))
  const sole = s.leg.findIndex((c, i) => i > 0 && c === s.leg[i - 1]) // first foot-wall round
  return [
    `Start with the sole: rounds 1 to ${sole} lie flat (the sole she stands on), rounds ${sole + 1} to ${sole + 2} are the sides of the foot, and the decrease after them shapes the ankle.`,
    ...lines,
    'Fasten off the first leg and weave in the end. Stuff it firmly, keeping the sole flat.',
    'Stuff the second leg firmly but do not fasten off: go straight on to the body with the yarn still attached.',
  ]
}

function bodyWords(s: DollSize, skinLabel: string, dressLabel: string): string[] {
  const L = s.leg[s.leg.length - 1]!
  const c = s.bridge
  const p: CrochetProgram = { name: 'Body', form: 'tube', stitch: 'sc', rounds: s.body, tube: { anchor: 'chain', join: 'spiral' } }
  const raw = writeInstructions(p)
  // The tube words open with a foundation chain and "Round 1: dc in each ch";
  // the doll's first round is the JOINING round instead (same count: the
  // stitches it is worked into are exactly the two legs' last rounds plus the
  // bridging chains, on both sides).
  const rest = raw.filter((l) => !/^Foundation:/.test(l) && !/^Round 1:/.test(l) && !/^Fasten off/.test(l) && !/^Work in a continuous/.test(l))
  const joining =
    `Round 1 (joining round): ch ${c}, then dc into the first stitch of the first leg (place the marker here: it is the new start of the round), ` +
    `dc in the next ${L - 1} sts of the first leg, dc in each of the ${c} ch, dc in each of the ${L} sts of the second leg, ` +
    `and dc in the other side of each of the ${c} ch. (${2 * L + 2 * c} sts)`
  return [
    'Work every stitch of the body straight on from the second leg, in a continuous spiral without joining; mark the first stitch of each round.',
    `Change to ${dressLabel} as you finish the last stitch of the second leg, and line the two legs up side by side with both feet pointing forward.`,
    joining,
    ...withColourChange(rest, s.skinFrom, skinLabel),
    `Stuff the body firmly through the neck as you go, pushing a little into the top of each leg so the hips are round.`,
    'Fasten off, leaving a long tail for sewing the head on. Close the small gap at the crotch with the tails.',
  ]
}

function headWords(s: DollSize): string[] {
  const p: CrochetProgram = { name: 'Head', form: 'sphere', stitch: 'sc', rounds: s.head }
  return ['Start at the crown. Embroider the face (see Assembly) before the last few rounds, while the head is still open.', ...writeInstructions(p)]
}

function armWords(s: DollSize): string[] {
  const p: CrochetProgram = { name: 'Arm', form: 'sphere', stitch: 'sc', rounds: s.arm }
  const lines = writeInstructions(p)
  const handRounds = s.arm.findIndex((c, i) => i > 1 && c < s.arm[1]!)
  return [`Start with the hand: rounds 1 to ${handRounds} are the hand.`, ...lines].map((l) =>
    /^Stuff firmly/.test(l)
        ? 'Stuff the hand lightly and the arm only a little, so it hangs softly. Close the top, fasten off and leave a tail for sewing.'
        : l,
  )
}

// ── The face (doll proportions on the fine-gauge head) ──────────────────────

const EYE_BLACK = '#0b0908'
const LID_BROWN = '#3a2a22'
const BROW = '#8a6a55'
const WHITE = '#f4f1ea'
const BLUSH = '#efbdb8'
const MOUTH = '#b9706b'

/** The pattern round at an elevation above the equator of a ball worked from
 *  the crown (same rule as faceEmbroidery.roundAtElevation). */
const roundAt = (rounds: number[], elevDeg: number): number => (rounds.length * (90 - elevDeg)) / 180 + 0.5
const half = (v: number): number => Math.round(v * 2) / 2
const countAt = (rounds: number[], r: number): number => rounds[Math.max(1, Math.min(rounds.length, Math.floor(r))) - 1]!
const stAt = (rounds: number[], r: number, azDeg: number): number => (countAt(rounds, r) * azDeg) / 360

/** Where the face sits on a doll head: a doll's eyes are big, set a little
 *  BELOW the equator and wide (the bar fairy's sit just under the middle of
 *  the face, the width of an eye apart and more). Degrees. */
const DOLL_FACE = { eyeElev: -7, eyeAz: 30, blushElev: -22, blushAz: 42, mouthElev: -28, browElev: 11 }

/** The face's size in the head's own stitches and rounds, scaled from the M
 *  head (66 sts, 34 rounds) so the keyring charm's face is the same SHAPE on
 *  fewer stitches, not a bigger face. */
function faceScale(head: number[]): { kSt: number; kR: number } {
  return { kSt: Math.max(...head) / 66, kR: head.length / 34 }
}

/**
 * The doll's embroidered face, as `EmbroideryFeature`s the composition lays on
 * the settled head (`faceEmbroidery.placeEmbroidery`). Sizes are in the head's
 * own stitches and rounds, chosen for a 4 ply doll head: the bar's eyes are
 * about 3 stitches wide and 2½ rounds tall.
 *
 *  - stitched: a black satin almond for each eye (columns, top to bottom), a
 *    dark-brown backstitch upper lid that runs out past the outer corner into
 *    two short lashes, a white catch-light, a short soft-brown brow above.
 *  - sleepy: a dark-brown backstitch lid curve with four lashes down and out.
 *  Both: soft pink blush on the cheeks and a tiny rose-pink mouth.
 */
export function dollFace(style: FaceStyle, head: number[], forward = { x: 0, y: 1, z: 0 }, right = { x: 1, y: 0, z: 0 }): EmbroideryFeature[] {
  if (style === 'safety') return []
  const feat = (name: string, hex: string, threadMm: number, label: string, stitches: EmbroideryStitch[], fibre?: EmbroideryFeature['fibre']): EmbroideryFeature => ({
    name, on: 'head', zeroDir: forward, rightDir: right, colourHex: hex, threadMm, threadLabel: label, stitches, ...(fibre ? { fibre } : {}),
  })
  const out: EmbroideryFeature[] = []
  const { kSt, kR } = faceScale(head)
  const eyeR = half(roundAt(head, DOLL_FACE.eyeElev))
  const eyeC = half(stAt(head, eyeR, DOLL_FACE.eyeAz))
  for (const side of [-1, 1] as const) {
    const cs = side * eyeC
    const S = (round: number, st: number): SurfaceSpot => ({ round, st: cs + side * st })
    if (style === 'stitched' || style === 'safety-stitched') {
      if (style === 'stitched') {
        // The eye: an almond ~3 sts wide and 2 rounds tall at M (scaled with
        // the head), fuller toward the outer corner, satin columns 0.14 st apart worked inner to outer.
        const w = 1.8 * kSt
        const hTop = 1.1 * kR
        const hBot = 0.9 * kR
        const fill: EmbroideryStitch[] = []
        const n = Math.round((2 * w) / 0.13)
        for (let i = 0; i <= n; i++) {
          const u = -1 + (2 * i) / n // inner → outer
          const k = Math.sqrt(Math.max(0, 1 - u * u)) * (1 + 0.12 * u)
          if (k < 0.08) continue
          fill.push({ from: S(eyeR - hTop * k, u * w), to: S(eyeR + hBot * k, u * w) })
        }
        // Rendered in the plump unplied strand (`chenille` look) so the satin
        // reads as one deep black almond: the plied fine-cotton look turned
        // a black satin fill grey (faces job, r5/r6).
        out.push(feat(side < 0 ? 'eye-l' : 'eye-r', EYE_BLACK, 0.55, 'Black embroidery thread', fill, 'chenille'))
        // Catch-light: two tiny white stitches high on the inner side.
        const hl = S(eyeR - 0.5 * kR, -0.6 * kSt)
        out.push(feat(side < 0 ? 'eye-light-l' : 'eye-light-r', WHITE, 0.42, 'White embroidery thread', [
          { from: hl, to: { round: hl.round + 0.32, st: hl.st }, taut: true },
          { from: { round: hl.round, st: hl.st + side * 0.18 }, to: { round: hl.round + 0.3, st: hl.st + side * 0.18 }, taut: true },
        ]))
      }
      // The upper lid: backstitch along the top edge of the eye, running a
      // little past the outer corner, then two short lashes up and out.
      const lid: SurfaceSpot[] = []
      for (let i = 0; i <= 6; i++) {
        const u = -1.05 + (2.3 * i) / 6
        const k = Math.sqrt(Math.max(0, 1 - Math.min(1, u * u))) * (1 + 0.12 * Math.min(u, 1))
        lid.push(S(eyeR - 1.1 * kR * k - 0.22, u * 1.8 * kSt))
      }
      const lidSt: EmbroideryStitch[] = []
      for (let i = 0; i < lid.length - 1; i++) lidSt.push({ from: lid[i]!, to: lid[i + 1]! })
      const tip = lid[lid.length - 1]!
      const prev = lid[lid.length - 2]!
      lidSt.push({ from: tip, to: { round: tip.round - 0.35 * kR, st: tip.st + side * 0.6 * kSt }, taut: true })
      lidSt.push({ from: prev, to: { round: prev.round - 0.5 * kR, st: prev.st + side * 0.35 * kSt }, taut: true })
      out.push(feat(side < 0 ? 'lid-l' : 'lid-r', LID_BROWN, 0.42, 'Dark brown embroidery thread', lidSt))
      // A short soft brow, a little above and arched.
      const br = half(roundAt(head, DOLL_FACE.browElev))
      out.push(feat(side < 0 ? 'brow-l' : 'brow-r', BROW, 0.36, 'Light brown embroidery thread', [
        { from: S(br + 0.3 * kR, -0.9 * kSt), to: S(br, 0.1 * kSt) },
        { from: S(br, 0.1 * kSt), to: S(br + 0.25 * kR, 0.9 * kSt) },
      ]))
    } else if (style === 'sleepy') {
      // A closed eye: a smile-shaped backstitch curve, 3 sts wide, with four
      // lashes down and out along its outer half.
      const pts: SurfaceSpot[] = []
      for (let i = 0; i <= 6; i++) {
        const t = -1 + (2 * i) / 6
        pts.push(S(eyeR + 0.7 * kR * (1 - t * t), t * 1.6 * kSt))
      }
      const st: EmbroideryStitch[] = []
      for (let i = 0; i < 6; i++) st.push({ from: pts[i]!, to: pts[i + 1]! })
      for (const [i, len, o] of [[3, 0.7, 0.08], [4, 0.75, 0.22], [5, 0.72, 0.38], [6, 0.62, 0.55]] as const) {
        const p = pts[i]!
        st.push({ from: p, to: { round: p.round + len * kR, st: p.st + side * o * kSt }, taut: true })
      }
      out.push(feat(side < 0 ? 'eye-l' : 'eye-r', LID_BROWN, 0.45, 'Dark brown embroidery thread', st))
    }
  }
  if (style !== 'safety-stitched') {
    // Blush: a soft round patch on each cheek, below and outside the eye.
    const br = half(roundAt(head, DOLL_FACE.blushElev))
    const bs = half(stAt(head, br, DOLL_FACE.blushAz))
    for (const side of [-1, 1] as const) {
      const rows: EmbroideryStitch[] = []
      const hh = 0.8 * kR
      const hw = 1.0 * kSt
      const n = Math.round((2 * hh) / 0.1)
      for (let i = 0; i <= n; i++) {
        const r = br - hh + (2 * hh * i) / n
        const u = (r - br) / hh
        const w = hw * Math.sqrt(Math.max(0, 1 - u * u))
        if (w < 0.05) continue
        const a = { round: r, st: side * (bs - w) }
        const b = { round: r, st: side * (bs + w) }
        rows.push({ from: a, to: b })
      }
      out.push(feat(side < 0 ? 'blush-l' : 'blush-r', BLUSH, 0.4, 'Pink yarn (a soft fluffy DK)', rows, 'chenille'))
    }
  }
  // A tiny mouth: one short stitch, a shade lower in the middle (two stitches
  // meeting at centre front), in rose pink.
  const mr = half(roundAt(head, DOLL_FACE.mouthElev))
  out.push(feat('mouth', MOUTH, 0.42, 'Rose pink embroidery thread', [
    { from: { round: mr, st: -0.6 * kSt }, to: { round: mr + 0.25, st: 0 }, taut: true },
    { from: { round: mr + 0.25, st: 0 }, to: { round: mr, st: 0.6 * kSt }, taut: true },
  ]))
  return out
}

const sts = (v: number): string => {
  const a = Math.abs(v)
  const w = Math.floor(a + 1e-6)
  const h = a - w > 0.25 && a - w < 0.75
  const t = h ? (w === 0 ? '½' : `${w}½`) : `${Math.round(a)}`
  return `${t} ${t === '1' ? 'stitch' : 'stitches'}`
}
const roundWords = (r: number): string => {
  const hr = half(r)
  return Number.isInteger(hr) ? `in round ${hr}` : `between rounds ${Math.floor(hr)} and ${Math.ceil(hr)}`
}

/** The face, in words, from the same spots `dollFace` lays the strands on. */
export function dollFaceWords(style: FaceStyle, head: number[]): string[] {
  if (style === 'safety') return []
  const { kSt, kR } = faceScale(head)
  const rnds = (v: number): string => {
    const t = sts(v).replace(/ stitch(es)?$/, '')
    return `${t} ${t === '1' ? 'round' : 'rounds'}`
  }
  const eyeR = half(roundAt(head, DOLL_FACE.eyeElev))
  const eyeC = half(stAt(head, eyeR, DOLL_FACE.eyeAz))
  const lines: string[] = [
    'Embroider the face before the head is closed. Rounds are counted from the magic ring at the crown; ' +
      'centre front is the middle of the face. Pull every stitch just snug so it lies on the fabric without puckering it.',
  ]
  if (style === 'stitched') {
    lines.push(
      `Eyes (black embroidery thread): centre each eye ${roundWords(eyeR)}, ${sts(eyeC)} either side of centre front. ` +
        `Satin stitch an almond ${sts(3.6 * kSt)} wide and ${rnds(2 * kR)} tall (straight stitches side by side, top to bottom), a touch fuller at the outer corner. ` +
        'With white thread, work two tiny stitches side by side high on the inner side of each eye for the catch-light.',
      `Lids and lashes (dark brown embroidery thread): backstitch along the top edge of each eye, half a round above the black, ` +
        `running a little past the outer corner; from the last two holes work two short lashes outward and a little up, about ${sts(0.6 * kSt)} long.`,
      `Brows (light brown embroidery thread): ${roundWords(half(roundAt(head, DOLL_FACE.browElev)))}, above each eye, two straight stitches in a gentle arch, about ${sts(1.8 * kSt)} wide.`,
    )
  } else if (style === 'sleepy') {
    lines.push(
      `Sleeping eyes (dark brown embroidery thread): ${roundWords(eyeR)}, ${sts(eyeC)} either side of centre front, ` +
        `work 6 small backstitches in a smile-shaped curve ${sts(3.2 * kSt)} wide that dips about ${rnds(0.7 * kR)} at its middle. ` +
        `Add 4 lashes along the outer half, one from each backstitch hole, down and fanning outward, about ${rnds(0.7 * kR)} long. Mirror the other eye.`,
    )
  }
  if (style !== 'safety-stitched') {
    const br = half(roundAt(head, DOLL_FACE.blushElev))
    lines.push(
      `Blush (soft pink wool): ${roundWords(br)}, ${sts(half(stAt(head, br, DOLL_FACE.blushAz)))} either side of centre front, ` +
        `satin stitch a soft round patch about ${sts(2 * kSt)} wide and ${rnds(1.6 * kR)} high, the stitches lying along the round.`,
    )
  }
  const mr = half(roundAt(head, DOLL_FACE.mouthElev))
  lines.push(`Mouth (rose pink embroidery thread): ${roundWords(mr)} at centre front, two tiny straight stitches meeting just below the middle, about ${sts(1.2 * kSt)} wide in all.`)
  lines.push('Fasten off each colour inside the head and trim the ends so none show.')
  return lines
}

// ── The program ─────────────────────────────────────────────────────────────

/** The camera a standing doll is photographed from: front-on with a slight
 *  turn, the lens a little above her waist (tilt 82 = just above eye level of
 *  a figure this tall), framed tall. */
const DOLL_VIEW = {
  tiltDeg: 70,
  yawDeg: 14,
  aimHeightFrac: 0.5,
  distScale: 1.0,
  marginFactor: 0.3,
  groundScale: 40,
  lightRig: 'product' as const,
  bgHex: '#faf8f5',
  exposure: 0.34,
}

const SKIN_LABEL = 'the skin colour'
const DRESS_LABEL = 'the dress colour'

export function dollProgram(choices: DollChoices, name: string): CompositionProgram {
  const s = DOLL_SIZES[choices.size]
  const skin = choices.mainHex
  const dress = choices.contrastHex
  const style = choices.face ?? 'stitched'
  const legs: AmigurumiPart[] = ([-1, 1] as const).map((side) => ({
    name: side < 0 ? 'leg-l' : 'leg-r',
    stitch: 'sc',
    rounds: s.leg,
    colourHex: skin,
    tube: { anchor: 'ring', join: 'spiral', cap: 'flat' },
    flip: true,
    place: { on: 'ground', offset: { x: side * s.legApart } },
    words: legWords(s),
    joinWords: '',
  }))
  const legTop = s.leg.length
  const parts: AmigurumiPart[] = [
    ...legs,
    {
      name: 'body',
      stitch: 'sc',
      rounds: s.body,
      colourHex: dress,
      colourChanges: [{ fromRound: s.skinFrom, hex: skin, label: SKIN_LABEL }],
      tube: { anchor: 'chain', join: 'spiral' },
      flip: true,
      // Stacked on the first leg and centred between the two: the joining
      // round sits over both leg tops, seated a round and a half down them.
      place: { on: 'leg-l', overlap: 0, offset: { x: s.legApart, z: -3.3 * 1.3 * (legTop > 12 ? 1.6 : 1.1) } },
      words: bodyWords(s, SKIN_LABEL, DRESS_LABEL),
      joinWords:
        `The legs are joined in the body's first round, so there is nothing to sew there. Shape the hips with your hands so both feet stand flat and level.`,
    },
    {
      name: 'head',
      stitch: 'sc',
      rounds: s.head,
      colourHex: skin,
      place: { on: 'body', overlap: s.headOverlap, offset: { y: 0.5 } },
      words: headWords(s),
      joinWords: 'Sew the head onto the neck, the closing point of the head centred on the neck opening, adding a little stuffing to the neck before the last stitches so it stays upright.',
    },
  ]
  // Arms: sewn at the side of the shoulder, hanging down along the body with
  // the hands a little forward and clear of the hips.
  const top = s.body.length
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'arm-l' : 'arm-r',
      stitch: 'sc',
      rounds: s.arm,
      colourHex: skin,
      place: {
        on: 'body',
        dir: { x: side * 1, y: 0.05, z: 0.62 },
        aim: { x: side * 0.16, y: 0.12, z: -1 },
        seat: 3,
        surfaceFit: 'ellipsoid',
      },
      words: armWords(s),
      joinWords: `Sew the arms to the sides of the body over rounds ${top - 6} and ${top - 5} (the top of the shoulder line), so they hang straight down at her sides.`,
    })
  }
  const props: CompositionProp[] = []
  if (s.keyring) {
    // A 6 mm jump ring through two stitches at the crown, and a 25 mm split
    // ring through the jump ring, standing up behind the head.
    props.push(
      { name: 'jump-ring', on: 'head', dir: { x: 0, y: 0, z: 1 }, radiusMm: 3, seat: 1.2, colourHex: '#c9c4bc', gloss: 0.9, metal: true, ring: { wireMm: 0.45, ringNormal: { x: 1, y: 0, z: 0 } } },
      { name: 'split-ring', on: 'head', dir: { x: 0, y: 0, z: 1 }, radiusMm: 12.5, seat: -(3 - 1.2 + 12.5 - 0.9), colourHex: '#c9c4bc', gloss: 0.9, metal: true, ring: { wireMm: 0.75, ringNormal: { x: 0, y: 1, z: 0 } } },
    )
  }
  if (choices.eyeMm > 0 && (style === 'safety' || style === 'safety-stitched')) {
    const r = choices.eyeMm / 2
    for (const side of [-1, 1] as const) {
      const az = (DOLL_FACE.eyeAz * Math.PI) / 180
      const el = (DOLL_FACE.eyeElev * Math.PI) / 180
      props.push({
        name: side < 0 ? 'eye-l' : 'eye-r', on: 'head',
        dir: { x: side * Math.sin(az) * Math.cos(el), y: Math.cos(az) * Math.cos(el), z: Math.sin(el) },
        radiusMm: r, seat: -(r + 0.2), colourHex: '#080706', gloss: 0.85,
      })
    }
  }
  const program: CompositionProgram = {
    name,
    yarnWeight: 'fine',
    yarnFibre: 'fine-cotton',
    hookMm: 2.5,
    gaugeText: '4 ply cotton on a 2.5 mm hook, worked tightly: about 28 dc and 30 rounds to 10 cm',
    ...DOLL_VIEW,
    // A standing doll is tall and narrow; frame her, not a 160 mm field.
    // The script frames off the FOOTPRINT; a standing figure needs the field
    // set from her HEIGHT (plus the keyring above the charm's head).
    minFieldMm: Math.round((DOLL_SETTLED_SIZE_MM[`doll-${choices.size}`]?.height ?? 200) * 1.25 + (s.keyring ? 30 : 0)),
    parts,
    props: props.length ? props : undefined,
    notes:
      choices.size === 'S'
        ? 'A little standing doll keyring charm in 4 ply cotton: legs worked up from the soles and joined into the body, a round head, slim arms, an embroidered face and a split ring through the crown.'
        : 'A slim standing doll in 4 ply cotton: legs worked up from the soles and joined into the body, a round head on a narrow neck, slim arms with small hands, and an embroidered face. Her dress colour is worked into the body.',
  }
  const face = dollFace(style, s.head)
  if (face.length) {
    program.embroidery = face
    program.faceWords = dollFaceWords(style, s.head)
  }
  return program
}

/** Every combination the doll test walks (and the generated size table holds). */
export function dollPresetChoices(): Array<DollChoices & { base: 'doll' }> {
  return (['S', 'M', 'L'] as const).map((size) => ({
    base: 'doll' as const, size, mainHex: '#e9cfb4', contrastHex: '#b9cb9b', eyeMm: 0, face: 'stitched' as const,
  }))
}

/** The doll's measured sizes and geometry hashes (written from `doll.test.ts`'s
 *  own compile; the test fails if a fresh compile drifts from them). */
export const DOLL_SETTLED_SIZE_MM: Record<string, { width: number; height: number }> = {
  'doll-S': { width: 46.2, height: 99.7 },
  'doll-M': { width: 84, height: 232.4 },
  'doll-L': { width: 91.5, height: 258.8 },
}
export const DOLL_GEOMETRY_HASH: Record<string, string> = {
  'doll-S': '810ba413',
  'doll-M': 'a7c409aa',
  'doll-L': 'f14e7042',
}

