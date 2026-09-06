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

/** A ball: climbs in sixes to the equator, holds, comes back down in sixes. */
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
 * Every round profile the designer can produce, each one measured to pass the
 * loom's audit at worsted weight. The save path checks a submitted design's
 * pieces against this list; the test keeps the list true.
 */
export const AUDITED_PROFILES: number[][] = [
  ballRounds(12, 1), ballRounds(12, 2), ballRounds(12, 3), ballRounds(12, 4),
  ballRounds(12, 6),
  ballRounds(18, 2), ballRounds(18, 3), ballRounds(18, 8),
  ballRounds(24, 4), ballRounds(24, 7), ballRounds(24, 9),
  ballRounds(30, 5), ballRounds(30, 6),
  ballRounds(36, 5), ballRounds(36, 7),
  tubeRounds(12, 3), tubeRounds(12, 4), tubeRounds(12, 6),
]

const PROFILE_KEYS = new Set(AUDITED_PROFILES.map((r) => r.join(',')))

/** Is this piece one of the profiles the audit has been run against? */
export function isAuditedProfile(rounds: number[]): boolean {
  return PROFILE_KEYS.has(rounds.join(','))
}

export type AmigurumiBase = 'ball' | 'egg' | 'bear' | 'bunny'
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

export const AMIGURUMI_BASES: Array<{ id: AmigurumiBase; label: string; blurb: string }> = [
  { id: 'ball', label: 'Ball', blurb: 'One stuffed ball. The amigurumi starting point.' },
  { id: 'egg', label: 'Egg', blurb: 'A taller, rounded body on its own.' },
  { id: 'bear', label: 'Bear', blurb: 'Body, head, muzzle, round ears, four limbs.' },
  { id: 'bunny', label: 'Bunny', blurb: 'The same body with long ears standing up.' },
]

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
  /** Standalone single-piece profiles. */
  ball: number[]
  egg: number[]
}

const SIZES: Record<AmigurumiSize, SizeProfile> = {
  S: {
    body: ballRounds(24, 4),
    head: ballRounds(18, 3),
    neck: ballRounds(12, 1),
    muzzle: ballRounds(12, 1),
    bearEar: ballRounds(12, 2),
    bunnyEar: tubeRounds(12, 4),
    limb: tubeRounds(12, 3),
    ball: ballRounds(12, 4),
    egg: ballRounds(12, 6),
  },
  M: {
    // The signed-off bear proof's own profiles.
    body: ballRounds(30, 5),
    head: ballRounds(24, 7),
    neck: ballRounds(12, 1),
    muzzle: ballRounds(12, 1),
    bearEar: ballRounds(12, 2),
    bunnyEar: tubeRounds(12, 6),
    limb: tubeRounds(12, 4),
    ball: ballRounds(24, 7),
    egg: ballRounds(18, 8),
  },
  L: {
    body: ballRounds(36, 5),
    head: ballRounds(30, 6),
    neck: ballRounds(18, 2),
    muzzle: ballRounds(18, 2),
    bearEar: ballRounds(12, 3),
    bunnyEar: tubeRounds(12, 6),
    limb: tubeRounds(12, 6),
    ball: ballRounds(36, 7),
    egg: ballRounds(24, 9),
  },
}

/**
 * How far the hanging arm and forward leg need lifting off their `seat`
 * placement to keep every paw pad and foot on or above the table.
 *
 * `offset.z` in `PartPlacement` is a straight world-mm nudge applied AFTER the
 * whole rigid placement (composition.ts), so it moves a limb — and whatever
 * is seated on it, like a paw pad — by exactly this many mm. The M values
 * (0.5 / -0.4) are the signed-off bear's own tuned numbers (round 2, §8e-2)
 * and are UNCHANGED here. They do not carry to S or L: those sizes change the
 * body, head and limb ROUND COUNTS (`SIZES`) but the paw pad is the same
 * absolute size at every size (fixed `scale: 0.62` on the same `s.muzzle`
 * profile for S/M), so on the shorter S arm and the longer L arm it reaches
 * proportionally further past the limb's own tip — measured (not guessed) off
 * each size's settled, offset-free chain: an S arm's paw pad and an L leg's
 * foot both sink well below the table at the M lift, so each size carries its
 * own measured lift. `amigurumi-presets.test.ts` asserts every preset settles
 * with minz within 0.5 mm of the table, which is what would catch this again
 * if a future round-count or placement change moves it.
 */
const GROUND_LIFT: Record<AmigurumiSize, { arm: number; leg: number }> = {
  S: { arm: 4.2, leg: 0.7 },
  M: { arm: 0.5, leg: -0.4 },
  L: { arm: 8.0, leg: 1.5 },
}

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

  const main = choices.mainHex
  const contrast = choices.contrastHex
  // Where each limb points once it is sewn on: an arm hangs down the side and a
  // little forward, a leg lies forward along the table so the figure sits.
  const armAim = (side: -1 | 1): Dir => ({ x: side * 0.32, y: 0.5, z: -0.75 })
  const legAim = (side: -1 | 1): Dir => ({ x: side * 0.26, y: 1, z: -0.05 })

  const parts: AmigurumiPart[] = [
    { name: 'body', stitch: 'sc', rounds: s.body, colourHex: main, place: { on: 'ground' } },
    // A short narrow neck piece, so the silhouette steps body, neck, head
    // rather than the two balls merging into one loaf.
    {
      name: 'neck', stitch: 'sc', rounds: s.neck, colourHex: main, scale: 0.85,
      place: { on: 'body', overlap: 6, offset: { y: 1.5 } },
    },
    {
      name: 'head', stitch: 'sc', rounds: s.head, colourHex: main,
      place: { on: 'neck', overlap: 2, offset: { y: 1 } },
    },
    {
      name: 'muzzle', stitch: 'sc', rounds: s.muzzle, colourHex: contrast, scale: 0.85,
      place: { on: 'head', dir: faceDir({ x: 0, y: 1, z: -0.22 }), seat: 3, poleIn: true, surfaceFit: 'ellipsoid' },
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
          dir: faceDir({ x: side * 0.95, y: 0.18, z: 0.95 }),
          aim: faceDir({ x: side * 0.8, y: 0.35, z: 1 }),
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
      name: side < 0 ? 'arm-l' : 'arm-r', stitch: 'sc', rounds: s.limb, colourHex: main, scale: 0.78,
      place: {
        on: 'body', dir: { x: side, y: 0.28, z: 0.7 },
        aim: armAim(side), seat: 6, poleIn: true, surfaceFit: 'ellipsoid',
        // A paw pad on the end of a hanging arm otherwise reaches just below the
        // table, and the renderer floats the whole piece up to clear it, which
        // takes the legs off the ground. Hold the arm the lift (per size,
        // GROUND_LIFT) that keeps every part on or above the table.
        offset: { z: lift.arm },
      },
    })
  }
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'leg-l' : 'leg-r', stitch: 'sc', rounds: s.limb, colourHex: main, scale: 0.9,
      place: {
        on: 'body', dir: { x: side * 0.52, y: 0.8, z: -0.55 },
        aim: legAim(side), seat: 8, poleIn: true, surfaceFit: 'ellipsoid',
        offset: { z: lift.leg },
      },
    })
  }

  if (choices.paws) {
    const pad = (name: string, on: string, dir: Dir): AmigurumiPart => ({
      name, stitch: 'sc', rounds: s.muzzle, colourHex: contrast, scale: 0.62,
      place: { on, dir, seat: 3, poleIn: true, surfaceFit: 'ellipsoid' },
    })
    parts.push(
      pad('paw-al', 'arm-l', armAim(-1)),
      pad('paw-ar', 'arm-r', armAim(1)),
      pad('paw-ll', 'leg-l', legAim(-1)),
      pad('paw-lr', 'leg-r', legAim(1)),
    )
  }

  return {
    name,
    yarnWeight: 'worsted',
    hookMm: 4,
    ...FIGURE_VIEW,
    parts,
    props: faceProps(choices, 'head'),
    notes:
      choices.base === 'bear'
        ? 'A sitting bear: a stuffed body, a short neck and a round head, a muzzle, two ears, two arms and two legs, each worked as a spiral from a magic ring and sewn on.'
        : 'A sitting bunny: a stuffed body, a short neck and a round head, a muzzle, two long ears, two arms and two legs, each worked as a spiral from a magic ring and sewn on.',
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
function faceProps(choices: AmigurumiChoices, on: string): CompositionProp[] | undefined {
  const props: CompositionProp[] = []
  if (choices.eyeMm > 0) {
    const r = choices.eyeMm / 2
    for (const side of [-1, 1] as const) {
      props.push({
        name: side < 0 ? 'eye-l' : 'eye-r',
        on,
        dir: faceDir({ x: side * 0.62, y: 1, z: 0.42 }),
        radiusMm: r,
        seat: -(r + 0.2),
        colourHex: EYE_HEX,
        gloss: 0.85,
      })
    }
  }
  if (choices.nose && (choices.base === 'bear' || choices.base === 'bunny')) {
    props.push({
      name: 'nose',
      on: 'muzzle',
      dir: faceDir({ x: 0, y: 1, z: 0.42 }),
      radiusMm: 1.9,
      seat: -1.8,
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
