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

export const EYE_SIZES = [0, 6, 9, 12] as const

interface SizeProfile {
  body: number[]
  head: number[]
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
    muzzle: ballRounds(18, 2),
    bearEar: ballRounds(12, 3),
    bunnyEar: tubeRounds(12, 6),
    limb: tubeRounds(12, 6),
    ball: ballRounds(36, 7),
    egg: ballRounds(24, 9),
  },
}

/** The product-shot camera the bear proof settled on. */
const FIGURE_VIEW = {
  tiltDeg: 74,
  yawDeg: 26,
  aimHeightFrac: 0.5,
  distScale: 1.05,
  marginFactor: 0.3,
  groundScale: 40,
  lightRig: 'product' as const,
  bgHex: '#f7f5f2',
  exposure: 0.34,
}

const EYE_HEX = '#141110'
const NOSE_HEX = '#241d19'

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
  const armAim = { out: 0.8, forward: 0.62, up: -0.42 }
  const parts: AmigurumiPart[] = [
    { name: 'body', stitch: 'sc', rounds: s.body, colourHex: main, place: { on: 'ground' } },
    {
      name: 'head', stitch: 'sc', rounds: s.head, colourHex: main,
      place: { on: 'body', overlap: 9, offset: { y: 2 } },
    },
    {
      name: 'muzzle', stitch: 'sc', rounds: s.muzzle, colourHex: contrast, scale: 0.95,
      place: { on: 'head', dir: { x: 0, y: 1, z: -0.2 }, seat: 3, poleIn: true, surfaceFit: 'ellipsoid' },
    },
  ]

  if (choices.base === 'bear') {
    for (const side of [-1, 1] as const) {
      parts.push({
        name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.bearEar, colourHex: main, scale: 0.82,
        place: {
          on: 'head', dir: { x: side * 0.72, y: -0.42, z: 1 }, seat: 5,
          poleIn: true, surfaceFit: 'ellipsoid',
        },
      })
    }
  } else {
    // A bunny's ears are long tapered tubes standing up and slightly back.
    for (const side of [-1, 1] as const) {
      parts.push({
        name: side < 0 ? 'ear-l' : 'ear-r', stitch: 'sc', rounds: s.bunnyEar, colourHex: main, scale: 0.8,
        place: {
          on: 'head', dir: { x: side * 0.34, y: -0.2, z: 1 }, seat: 6,
          poleIn: true, surfaceFit: 'ellipsoid',
        },
      })
    }
  }

  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'arm-l' : 'arm-r', stitch: 'sc', rounds: s.limb, colourHex: main, scale: 0.78,
      place: {
        on: 'body', dir: { x: side, y: 0.3, z: 0.62 },
        aim: { x: side * armAim.out, y: armAim.forward, z: armAim.up },
        seat: 8, poleIn: true, surfaceFit: 'ellipsoid',
      },
    })
  }
  for (const side of [-1, 1] as const) {
    parts.push({
      name: side < 0 ? 'leg-l' : 'leg-r', stitch: 'sc', rounds: s.limb, colourHex: main, scale: 0.9,
      place: {
        on: 'body', dir: { x: side * 0.52, y: 0.8, z: -0.55 },
        aim: { x: side * 0.26, y: 1, z: -0.05 },
        seat: 8, poleIn: true, surfaceFit: 'ellipsoid', offset: { z: -0.4 },
      },
    })
  }

  if (choices.paws) {
    const pad = (name: string, on: string, dir: { x: number; y: number; z: number }): AmigurumiPart => ({
      name, stitch: 'sc', rounds: s.muzzle, colourHex: contrast, scale: 0.62,
      place: { on, dir, seat: 3, poleIn: true, surfaceFit: 'ellipsoid' },
    })
    parts.push(
      pad('paw-al', 'arm-l', { x: -armAim.out, y: armAim.forward, z: armAim.up }),
      pad('paw-ar', 'arm-r', { x: armAim.out, y: armAim.forward, z: armAim.up }),
      pad('paw-ll', 'leg-l', { x: -0.26, y: 1, z: -0.05 }),
      pad('paw-lr', 'leg-r', { x: 0.26, y: 1, z: -0.05 }),
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
        ? 'A sitting bear: a stuffed body and a round head, a muzzle, two small ears, two arms and two legs, each worked as a spiral from a magic ring and sewn on.'
        : 'A sitting bunny: a stuffed body and a round head, a muzzle, two long ears, two arms and two legs, each worked as a spiral from a magic ring and sewn on.',
  }
}

/** Safety eyes and a nose, seated the way the bear proof seats them. */
function faceProps(choices: AmigurumiChoices, on: string): CompositionProp[] | undefined {
  const props: CompositionProp[] = []
  if (choices.eyeMm > 0) {
    const r = choices.eyeMm / 2
    for (const side of [-1, 1] as const) {
      props.push({
        name: side < 0 ? 'eye-l' : 'eye-r',
        on,
        dir: { x: side * 0.62, y: 1, z: 0.55 },
        radiusMm: r,
        // A slightly negative seat leaves the dome standing out of the wool the
        // way a real safety eye does (the strand centre-line sits below the
        // rendered yarn surface).
        seat: -0.5,
        colourHex: EYE_HEX,
        gloss: 0.95,
      })
    }
  }
  if (choices.nose && (choices.base === 'bear' || choices.base === 'bunny')) {
    props.push({
      name: 'nose',
      on: 'muzzle',
      dir: { x: 0, y: 1, z: 0.06 },
      radiusMm: 3.3,
      seat: -0.6,
      flatten: 0.7,
      widen: 1.3,
      colourHex: NOSE_HEX,
      gloss: 0.55,
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
// The numbers below are SETTLED sizes, read off the relaxed geometry by
// `amigurumi-presets.test.ts`, not estimates. They let the Studio show a real
// finished size and draw a schematic at true proportions without paying for the
// compile, and they let the save path record the size straight away. The render
// job measures it again for real and writes it back.

/** One piece's settled width x height in mm at worsted weight, by round profile. */
export const PROFILE_SIZE_MM: Record<string, { width: number; height: number }> = {
  [ballRounds(12, 1).join(',')]: { width: 17, height: 11 },
  [ballRounds(12, 2).join(',')]: { width: 19, height: 14 },
  [ballRounds(12, 3).join(',')]: { width: 19, height: 18 },
  [ballRounds(12, 4).join(',')]: { width: 19, height: 21 },
  [ballRounds(12, 6).join(',')]: { width: 19, height: 28 },
  [ballRounds(18, 2).join(',')]: { width: 26, height: 16 },
  [ballRounds(18, 3).join(',')]: { width: 26, height: 19 },
  [ballRounds(18, 8).join(',')]: { width: 26, height: 36 },
  [ballRounds(24, 4).join(',')]: { width: 34, height: 25 },
  [ballRounds(24, 7).join(',')]: { width: 34, height: 35 },
  [ballRounds(24, 9).join(',')]: { width: 34, height: 41 },
  [ballRounds(30, 5).join(',')]: { width: 41, height: 30 },
  [ballRounds(30, 6).join(',')]: { width: 41, height: 33 },
  [ballRounds(36, 5).join(',')]: { width: 48, height: 31 },
  [ballRounds(36, 7).join(',')]: { width: 48, height: 38 },
  [tubeRounds(12, 3).join(',')]: { width: 19, height: 25 },
  [tubeRounds(12, 4).join(',')]: { width: 19, height: 28 },
  [tubeRounds(12, 6).join(',')]: { width: 19, height: 35 },
}

/** A piece's settled size, falling back to the stitch-count estimate for a
 *  profile that is not in the measured table. */
export function profileSizeMm(rounds: number[]): { width: number; height: number } {
  const measured = PROFILE_SIZE_MM[rounds.join(',')]
  if (measured) return measured
  const widest = Math.max(...rounds)
  // ~3.8 mm a stitch around, ~3.3 mm a round up: the pitches the settled
  // measurements above work out to.
  return { width: (widest * 3.8) / Math.PI, height: rounds.length * 3.3 }
}

/** The whole finished piece's settled size, by preset and size. */
export const PRESET_SETTLED_SIZE_MM: Record<string, { width: number; height: number }> = {
  'ball-S': { width: 19, height: 21 },
  'ball-M': { width: 34, height: 35 },
  'ball-L': { width: 48, height: 38 },
  'egg-S': { width: 19, height: 28 },
  'egg-M': { width: 26, height: 36 },
  'egg-L': { width: 34, height: 41 },
  'bear-S': { width: 50, height: 43 },
  'bear-M': { width: 59, height: 60 },
  'bear-L': { width: 76, height: 64 },
  'bunny-S': { width: 50, height: 52 },
  'bunny-M': { width: 59, height: 76 },
  'bunny-L': { width: 76, height: 77 },
}

export function presetSettledSizeMm(base: AmigurumiBase, size: AmigurumiSize): { width: number; height: number } {
  return PRESET_SETTLED_SIZE_MM[`${base}-${size}`] ?? { width: 60, height: 60 }
}
