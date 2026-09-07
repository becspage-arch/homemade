/**
 * THE DESIGN → PROGRAM step.
 *
 * A crochet pattern's source of truth is its stitch PROGRAM: the thing the loom
 * compiles into geometry, into the written rounds, and into the symbol chart, so
 * the three can never drift (STITCH_ENGINE.md §8e). Asking a model to write that
 * program cell by cell is both expensive (a 35 × 30 grid is a thousand array
 * entries) and fragile, so it is asked for a DESIGN instead: a compact recipe of
 * the choices that are genuinely design decisions — how wide, how many rows,
 * which stitch bands, which colours where — and this module expands that recipe
 * into the program deterministically.
 *
 * The expansion is the safety property. Every program that comes out of here is
 * built from the shapes the engine is measured on: grid rows of locked stitches,
 * a magic-ring disc, a ball off the audited profile list, or one of the Studio's
 * amigurumi presets. A model cannot describe a construction the loom would
 * refuse, because it never gets to describe a construction at all.
 *
 * The recipe still leaves the design open where design lives: the palette and
 * which colour goes where, the band sequence and its rhythm, the proportions
 * inside each envelope, the creature and its colours. That is what makes two
 * coasters from this module different objects rather than one object twice.
 */

import 'server-only'
import {
  YARN_WEIGHT_RADIUS_MM,
  type CrochetProgram,
  type GridRow,
  type Staging,
  type YarnWeight,
} from '@/lib/loom/crochet/engine/program'
import type { StitchId } from '@/lib/loom/crochet/engine/dictionary'
import type { CompositionProgram } from '@/lib/loom/crochet/engine/composition'
import {
  AMIGURUMI_BASES,
  AMIGURUMI_SIZES,
  EYE_SIZES,
  sphereRounds,
  buildAmigurumiProgram,
  isAuditedProfile,
  type AmigurumiBase,
  type AmigurumiChoices,
  type AmigurumiSize,
} from '@/lib/loom/crochet/engine/amigurumiPresets'
import { BULK_CROCHET_MAX_CELLS, envelopeFor, type CrochetTreatment } from './crochet-forms'

// ── The recipe the planner model returns ────────────────────────────────────

/** The stitches a texture band may be worked in. All locked, all audit-clean on
 *  a flat panel (STITCH_ENGINE.md §8e-3: post stitches read open on flat work
 *  and live on the worn `grid-postrib` form instead). */
export const BAND_STITCHES = ['sc', 'hdc', 'dc', 'scblo', 'scflo'] as const
export type BandStitch = (typeof BAND_STITCHES)[number]

/** One horizontal band of a flat piece. */
export interface DesignBand {
  /** How many rows the band is. */
  rows: number
  /** The stitch worked across it. */
  stitch: BandStitch
  /** A key into the design palette. Absent = the base colour. */
  colourKey?: string
}

/** The compact design a model returns for one brief. */
export interface CrochetDesign {
  treatment: CrochetTreatment
  /** Stitches across (grid treatments). */
  cols?: number
  /** Rows up, when the piece is one stitch throughout (plain / postrib / tapestry). */
  rows?: number
  /** The band sequence, bottom row first (stripe / texture treatments). */
  bands?: DesignBand[]
  /** Rounds worked (disc). */
  rounds?: number
  /** The ball's widest round and how many rounds it holds there (sphere). */
  ballEquator?: number
  ballPlateau?: number
  /** key -> six-digit hex. The yarns the finished piece uses. */
  palette?: Record<string, string>
  /** Which palette key is the main yarn. */
  baseColourKey?: string
  /** The creature (amigurumi treatment only). */
  amigurumi?: {
    base: AmigurumiBase
    size: AmigurumiSize
    mainHex: string
    contrastHex: string
    eyeMm: number
    nose: boolean
    paws: boolean
  }
  /** What the tapestry picture shows, for the illustrator (tapestry only). */
  picture?: string
  /** How many yarns the tapestry picture uses (tapestry only). */
  pictureColours?: number
}

/** The result of expanding a design: a program, or the reasons it will not build. */
export type BuiltDesign =
  | { kind: 'piece'; program: CrochetProgram; problems: [] }
  | { kind: 'amigurumi'; program: CompositionProgram; problems: [] }
  | { kind: 'none'; program: null; problems: string[] }

const HEX = /^#[0-9a-fA-F]{6}$/

function clampInt(n: unknown, lo: number, hi: number, fallback: number): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : NaN
  if (!Number.isFinite(v)) return fallback
  return Math.max(lo, Math.min(hi, v))
}

/** Validate a design's palette, returning it plus the problems it carries. */
function readPalette(design: CrochetDesign): { palette: Record<string, string>; base: string; problems: string[] } {
  const problems: string[] = []
  const palette: Record<string, string> = {}
  for (const [key, hex] of Object.entries(design.palette ?? {})) {
    if (!/^[a-z0-9-]{1,24}$/i.test(key)) {
      problems.push(`The colour name "${key}" is not a usable key (letters, numbers and hyphens only).`)
      continue
    }
    if (typeof hex !== 'string' || !HEX.test(hex)) {
      problems.push(`The colour "${key}" is not a six-digit hex like #c25a3c.`)
      continue
    }
    palette[key] = hex.toLowerCase()
  }
  const keys = Object.keys(palette)
  if (keys.length === 0) problems.push('The design lists no yarn colours.')
  const base = design.baseColourKey && palette[design.baseColourKey] ? design.baseColourKey : (keys[0] ?? '')
  return { palette, base, problems }
}

/** Every band's colour key has to be a yarn the design actually lists. */
function checkBandColours(bands: DesignBand[], palette: Record<string, string>, problems: string[]): void {
  for (const band of bands) {
    if (band.colourKey && !palette[band.colourKey]) {
      problems.push(`The band colour "${band.colourKey}" is not in the yarn list.`)
    }
  }
}

const fill = (n: number, id: StitchId): StitchId[] => Array.from({ length: n }, () => id)

/**
 * Expand one design into a stitch program, inside the shelf's envelope.
 *
 * Returns problems rather than throwing, so the author loop can hand them
 * straight back to the model as the note on what to fix.
 */
export function designToProgram(
  design: CrochetDesign,
  ctx: { shelf: string; name: string },
): BuiltDesign {
  const envelope = envelopeFor(ctx.shelf, design.treatment)
  if (!envelope) {
    return {
      kind: 'none',
      program: null,
      problems: [
        `A "${design.treatment}" piece is not something the loom can build for the ${ctx.shelf} shelf.`,
      ],
    }
  }
  const yarnWeight = envelope.yarnWeight as YarnWeight
  const staging: Staging = envelope.staging

  if (design.treatment === 'amigurumi') {
    return amigurumiFromDesign(design, ctx.name)
  }

  const { palette, base, problems } = readPalette(design)
  if (design.treatment === 'sphere') {
    // Round 8 (§8f-10): a closed ball is a SPHERE profile, increases placed
    // where the sphere grows; `ballPlateau` is the extra straight rounds held
    // at the equator on top of the profile's own. The audited list is the
    // only set of shapes the loom has been measured on.
    const equator = clampInt(design.ballEquator, 12, 36, 24)
    const plateau = clampInt(design.ballPlateau, 1, 9, 1)
    const rounds = sphereRounds(equator, plateau)
    if (!isAuditedProfile(rounds)) {
      problems.push(
        `A ball with a widest round of ${equator} and ${plateau} extra rounds at the equator is not one of the shapes the loom has been measured on (audited: 12/1, 12/4, 18/1, 18/5, 24/1, 24/5, 30/1, 36/1).`,
      )
    }
    if (problems.length) return { kind: 'none', program: null, problems }
    return {
      kind: 'piece',
      problems: [],
      program: {
        name: ctx.name,
        form: 'sphere',
        stitch: 'sc',
        rounds,
        yarnWeight,
        colourHex: palette[base]!,
        palette,
        hookMm: hookForWeight(yarnWeight),
        staging,
      },
    }
  }

  if (design.treatment === 'disc') {
    const [lo, hi] = envelope.rounds ?? [7, 10]
    const n = clampInt(design.rounds, lo, hi, lo)
    const rounds = Array.from({ length: n }, (_, i) => 6 * (i + 1))
    if (problems.length) return { kind: 'none', program: null, problems }
    return {
      kind: 'piece',
      problems: [],
      program: {
        name: ctx.name,
        form: 'disc',
        stitch: 'sc',
        rounds,
        yarnWeight,
        colourHex: palette[base]!,
        palette,
        hookMm: hookForWeight(yarnWeight),
        staging,
      },
    }
  }

  // ── the grid family ───────────────────────────────────────────────────────
  const [colLo, colHi] = envelope.cols ?? [10, 40]
  const [rowLo, rowHi] = envelope.rows ?? [10, 40]
  const cols = clampInt(design.cols, colLo, colHi, colLo)
  const grid: GridRow[] = []
  let gaugeYr: number | undefined

  if (design.treatment === 'grid-postrib') {
    const rows = clampInt(design.rows, rowLo, rowHi, rowLo)
    // Row 1 is plain treble, to make posts for the rib rows to wrap.
    grid.push({ stitches: fill(cols, 'dc'), colourKey: base })
    for (let j = 1; j < rows; j++) {
      grid.push({
        stitches: Array.from({ length: cols }, (_, c) => (c % 2 === 0 ? 'fpdc' : 'bpdc')) as StitchId[],
        colourKey: base,
      })
    }
    // The locked post-rib column pack (STITCH_ENGINE.md §8f round 2) — without
    // it the ribs stand apart and the band reads as a ladder.
    gaugeYr = 2.3
  } else if (design.treatment === 'grid-plain') {
    const rows = clampInt(design.rows, rowLo, rowHi, rowLo)
    for (let j = 0; j < rows; j++) grid.push({ stitches: fill(cols, 'sc'), colourKey: base })
  } else if (design.treatment === 'grid-stripe' || design.treatment === 'grid-texture') {
    const bands = Array.isArray(design.bands) ? design.bands : []
    if (bands.length < 2) {
      problems.push('A banded piece needs at least two bands.')
    }
    checkBandColours(bands, palette, problems)
    for (const band of bands) {
      const rows = clampInt(band.rows, 1, 12, 2)
      const stitch = (BAND_STITCHES as readonly string[]).includes(band.stitch) ? band.stitch : 'sc'
      const colourKey = band.colourKey && palette[band.colourKey] ? band.colourKey : base
      for (let j = 0; j < rows; j++) grid.push({ stitches: fill(cols, stitch as StitchId), colourKey })
    }
    if (grid.length < rowLo || grid.length > rowHi) {
      problems.push(
        `The bands add up to ${grid.length} rows; this piece wants between ${rowLo} and ${rowHi}.`,
      )
    }
    if (design.treatment === 'grid-stripe' && new Set(grid.map((r) => r.colourKey)).size < 2) {
      problems.push('A striped piece has to change colour at least once.')
    }
    if (design.treatment === 'grid-texture' && new Set(grid.map((r) => r.stitches[0])).size < 2) {
      problems.push('A textured piece has to change stitch at least once.')
    }
  } else if (design.treatment === 'grid-tapestry') {
    // A tapestry picture is not written cell by cell here: it comes from an
    // illustration, converted by the shared photo-to-tapestry path. The caller
    // builds it; this function only sizes the envelope.
    return {
      kind: 'none',
      program: null,
      problems: ['A tapestry picture is built from its illustration, not from a band recipe.'],
    }
  }

  const cells = cols * grid.length
  if (cells > BULK_CROCHET_MAX_CELLS) {
    problems.push(
      `That comes to ${cells} stitches. Keep it to ${BULK_CROCHET_MAX_CELLS} or fewer so it compiles inside one step.`,
    )
  }
  if (problems.length) return { kind: 'none', program: null, problems }

  return {
    kind: 'piece',
    problems: [],
    program: {
      name: ctx.name,
      form: 'grid',
      gridWidth: cols,
      grid,
      ...(gaugeYr ? { gaugeYr } : {}),
      yarnWeight,
      colourHex: palette[base]!,
      palette,
      hookMm: hookForWeight(yarnWeight),
      staging,
    },
  }
}

/**
 * The creature. Every piece of it comes from the Studio's amigurumi presets, so
 * every round profile is one `amigurumi-presets.test.ts` has already put through
 * the loom's audit. The design's freedom is the base, the size, the two yarn
 * colours and the notions — which is where an amigurumi's character actually
 * comes from.
 */
function amigurumiFromDesign(design: CrochetDesign, name: string): BuiltDesign {
  const problems: string[] = []
  const a = design.amigurumi
  if (!a) return { kind: 'none', program: null, problems: ['The design says amigurumi but describes no creature.'] }
  if (!AMIGURUMI_BASES.some((b) => b.id === a.base)) {
    problems.push(`"${a.base}" is not one of the shapes the loom builds (${AMIGURUMI_BASES.map((b) => b.id).join(', ')}).`)
  }
  if (!AMIGURUMI_SIZES.some((s) => s.id === a.size)) {
    problems.push(`"${a.size}" is not one of the sizes (S, M, L).`)
  }
  if (!HEX.test(a.mainHex ?? '')) problems.push('The main yarn colour is not a six-digit hex.')
  if (!HEX.test(a.contrastHex ?? '')) problems.push('The contrast yarn colour is not a six-digit hex.')
  const eyeMm = (EYE_SIZES as readonly number[]).includes(a.eyeMm) ? a.eyeMm : 0
  if (problems.length) return { kind: 'none', program: null, problems }

  const choices: AmigurumiChoices = {
    base: a.base,
    size: a.size,
    mainHex: a.mainHex.toLowerCase(),
    contrastHex: a.contrastHex.toLowerCase(),
    eyeMm,
    nose: Boolean(a.nose),
    paws: Boolean(a.paws),
    name,
  }
  const program = buildAmigurumiProgram(choices)
  // Belt and braces: the presets are audited, but a preset edit that moved a
  // profile off the list must never reach a customer as a pattern.
  const offList = program.parts.filter((p) => !isAuditedProfile(p.rounds)).map((p) => p.name)
  if (offList.length) {
    return {
      kind: 'none',
      program: null,
      problems: [`These pieces are not on the audited shape list: ${offList.join(', ')}.`],
    }
  }
  return { kind: 'amigurumi', program, problems: [] }
}

/** The hook a yarn weight is worked on, in mm — the middle of the band's range. */
export function hookForWeight(weight: YarnWeight): number {
  switch (weight) {
    case 'lace':
      return 2
    case 'fine':
      return 3
    case 'sport':
      return 3.5
    case 'dk':
      return 4
    case 'worsted':
      return 5
    case 'aran':
      return 5.5
    case 'bulky':
      return 6.5
    default:
      return 9
  }
}

/**
 * The loom's yarn weights against the catalogue's `YarnWeight` rows.
 *
 * The loom speaks the American ladder (it needs a yarn RADIUS, and 'worsted' is
 * the radius its stitches were measured at); the catalogue speaks the British
 * one, which has no separate worsted band. Worsted therefore files under aran,
 * which is what a UK maker would reach for.
 */
export const LOOM_WEIGHT_TO_YARN_SLUG: Record<YarnWeight, string> = {
  lace: 'lace',
  fine: 'fingering',
  sport: 'sport',
  dk: 'dk',
  worsted: 'aran',
  aran: 'aran',
  bulky: 'chunky',
  'super-bulky': 'super-chunky',
}

/** The yarn radius a program renders at — used for the render + the row. */
export function yarnRadiusFor(weight: YarnWeight): number {
  return YARN_WEIGHT_RADIUS_MM[weight]
}
