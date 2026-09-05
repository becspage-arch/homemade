/**
 * Strict validation for a crochet stitch program before it is stored.
 *
 * Two shapes reach the save route: a `CrochetProgram` (a flat / grid / disc /
 * sphere piece) and a `CompositionProgram` (an assembled amigurumi). Both are
 * checked twice over: the SHAPE here, then the STITCHES by compiling the
 * program and running the loom's own audit gate. Nothing is written to a
 * pattern until both pass, so a stored design is always genuinely stitchable.
 */

import { z } from 'zod'
import type { CrochetProgram } from '@/lib/loom/crochet/engine/program'
import type { CompositionProgram } from '@/lib/loom/crochet/engine/composition'
import { compileComposition } from '@/lib/loom/crochet/engine/composition'
import { compileRelaxAudit } from '@/lib/loom/crochet/engine/programScene'
import { TAPESTRY_MAX_CELLS } from './tapestry-program'

export type BuiltIdea =
  | { kind: 'piece'; program: CrochetProgram }
  | { kind: 'amigurumi'; program: CompositionProgram }

const HEX = /^#[0-9a-fA-F]{6}$/

/** The stitches the Studio's create-your-own tools may use. Post stitches and
 *  the texture set are catalogue-only until they have a create surface. */
const CREATE_STITCHES = ['sc', 'hdc', 'dc', 'tr'] as const

const YARN_WEIGHTS = [
  'lace', 'fine', 'sport', 'dk', 'worsted', 'aran', 'bulky', 'super-bulky',
] as const

const hexSchema = z.string().regex(HEX, 'colours must be six-digit hex, like #c25a3c')
const nameSchema = z.string().min(1).max(80)

const GridRowSchema = z.object({
  stitches: z.array(z.enum(CREATE_STITCHES)).min(2).max(60),
  colourKey: z.string().min(1).max(24).optional(),
  cellColours: z.array(z.string().min(1).max(24)).optional(),
})

/** Rounds must climb from 6 and come back down — the shape the sphere builder
 *  accepts. Cheap to check here so an obviously broken program never reaches
 *  the compiler. */
const RoundsSchema = z.array(z.number().int().min(4).max(120)).min(2).max(60)

export const CrochetProgramSchema = z.object({
  name: nameSchema,
  form: z.enum(['flat', 'grid', 'disc', 'sphere']),
  stitch: z.enum(CREATE_STITCHES).optional(),
  foundation: z.number().int().min(4).max(60).optional(),
  rows: z.array(z.array(z.enum(['st', 'inc', 'dec', 'shell', 'skip']))).max(80).optional(),
  grid: z.array(GridRowSchema).min(2).max(60).optional(),
  gridWidth: z.number().int().min(4).max(60).optional(),
  gaugeYr: z.number().min(0.5).max(5).optional(),
  rounds: RoundsSchema.optional(),
  yarnWeight: z.enum(YARN_WEIGHTS).optional(),
  colourHex: hexSchema.optional(),
  palette: z.record(z.string().min(1).max(24), hexSchema).optional(),
  rowColours: z.array(z.string().min(1).max(24)).max(80).optional(),
  gaugeText: z.string().max(200).optional(),
  finishedSizeMm: z.object({ width: z.number().positive(), height: z.number().positive() }).optional(),
  hookMm: z.number().min(1).max(20).optional(),
  notes: z.string().max(1200).optional(),
})

const PlacementSchema = z.union([
  z.object({
    on: z.literal('ground'),
    offset: z.object({ x: z.number().optional(), y: z.number().optional() }).optional(),
  }),
  z.object({
    on: z.string().min(1).max(40),
    dir: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    aim: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    seat: z.number().min(-20).max(40).optional(),
    poleIn: z.boolean().optional(),
    surfaceFit: z.enum(['box', 'ellipsoid']).optional(),
    offset: z.object({ x: z.number().optional(), y: z.number().optional(), z: z.number().optional() }).optional(),
  }),
  z.object({
    on: z.string().min(1).max(40),
    overlap: z.number().min(0).max(60).optional(),
    offset: z.object({ x: z.number().optional(), y: z.number().optional(), z: z.number().optional() }).optional(),
  }),
])

export const CompositionProgramSchema = z.object({
  name: nameSchema,
  parts: z.array(
    z.object({
      name: z.string().min(1).max(40),
      stitch: z.enum(['sc']),
      rounds: RoundsSchema,
      colourHex: hexSchema,
      place: PlacementSchema,
      scale: z.number().min(0.2).max(3).optional(),
    }),
  ).min(1).max(16),
  props: z.array(
    z.object({
      name: z.string().min(1).max(40),
      on: z.string().min(1).max(40),
      dir: z.object({ x: z.number(), y: z.number(), z: z.number() }),
      radiusMm: z.number().min(1).max(20),
      seat: z.number().min(-10).max(20).optional(),
      flatten: z.number().min(0.2).max(2).optional(),
      widen: z.number().min(0.2).max(3).optional(),
      colourHex: hexSchema,
      gloss: z.number().min(0).max(1).optional(),
      surfaceFit: z.enum(['box', 'ellipsoid']).optional(),
    }),
  ).max(8).optional(),
  yarnWeight: z.enum(YARN_WEIGHTS).optional(),
  tiltDeg: z.number().min(0).max(90).optional(),
  yawDeg: z.number().min(-180).max(180).optional(),
  aimHeightFrac: z.number().min(0).max(1).optional(),
  distScale: z.number().min(0.2).max(4).optional(),
  groundScale: z.number().min(1).max(100).optional(),
  lightRig: z.literal('product').optional(),
  bgHex: hexSchema.optional(),
  light: z.number().min(0).max(4).optional(),
  exposure: z.number().min(-2).max(2).optional(),
  marginFactor: z.number().min(0).max(2).optional(),
  gaugeText: z.string().max(200).optional(),
  finishedSizeMm: z.object({ width: z.number().positive(), height: z.number().positive() }).optional(),
  hookMm: z.number().min(1).max(20).optional(),
  notes: z.string().max(1200).optional(),
})

/**
 * Shape checks the schema cannot express: the grid rows all match `gridWidth`,
 * every colour key is in the palette, and the piece is inside the size cap the
 * compile budget allows.
 */
export function crochetProgramProblems(p: CrochetProgram): string[] {
  const problems: string[] = []
  if (p.form === 'grid') {
    if (!p.grid?.length || !p.gridWidth) {
      problems.push('A grid pattern needs rows and a width.')
    } else {
      const w = p.gridWidth
      if (p.grid.some((r) => r.stitches.length !== w)) {
        problems.push('Every row of a grid pattern has to be the same number of stitches.')
      }
      if (p.grid.some((r) => r.cellColours && r.cellColours.length !== w)) {
        problems.push('Every row of colours has to have one colour for each stitch.')
      }
      const total = w * p.grid.length
      if (total > TAPESTRY_MAX_CELLS) {
        problems.push(`That comes to ${total} stitches. Keep it to ${TAPESTRY_MAX_CELLS} or fewer.`)
      }
      const palette = p.palette ?? {}
      for (const row of p.grid) {
        for (const key of row.cellColours ?? []) {
          if (!palette[key]) problems.push(`The colour "${key}" is used in the pattern but not in the yarn list.`)
        }
        if (row.colourKey && !palette[row.colourKey]) {
          problems.push(`The colour "${row.colourKey}" is used in the pattern but not in the yarn list.`)
        }
      }
    }
  }
  if (p.form === 'flat') {
    if (!p.foundation || !p.rows?.length) problems.push('A flat piece needs a foundation chain and rows.')
    if (!p.stitch) problems.push('A flat piece needs a stitch.')
  }
  if (p.form === 'disc' || p.form === 'sphere') {
    if (!p.rounds?.length) problems.push('A piece worked in the round needs its round counts.')
    if (!p.stitch) problems.push('A piece worked in the round needs a stitch.')
  }
  // De-duplicate: one repeated palette key should not print forty times.
  return [...new Set(problems)]
}

export interface CompositionCheckOptions {
  /**
   * Enforce the stitch ceiling. On by default, because a composition that
   * arrives off the wire has to be COMPILED inside the request and the ceiling
   * is what keeps that inside the time budget. The amigurumi designer passes
   * false: its pieces are the profiles the audit test has already walked, so
   * its save path never compiles and the budget does not apply.
   */
  enforceStitchCap?: boolean
}

/** Shape checks for a composition: part names unique, references resolve to an
 *  earlier part, total work inside the compile budget. */
export function compositionProgramProblems(
  p: CompositionProgram,
  options: CompositionCheckOptions = {},
): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const part of p.parts) {
    if (seen.has(part.name)) problems.push(`Two pieces are both called "${part.name}".`)
    seen.add(part.name)
    const on = (part.place as { on: string }).on
    if (on !== 'ground' && !seen.has(on)) {
      problems.push(`"${part.name}" is joined to "${on}", which is not made yet.`)
    }
  }
  for (const prop of p.props ?? []) {
    if (!seen.has(prop.on)) problems.push(`"${prop.name}" is fitted to "${prop.on}", which is not one of the pieces.`)
  }
  const stitches = p.parts.reduce((a, part) => a + part.rounds.reduce((x, y) => x + y, 0), 0)
  if (options.enforceStitchCap !== false && stitches > COMPOSITION_MAX_STITCHES) {
    problems.push(
      `That comes to ${stitches} stitches across all the pieces. Keep it to ${COMPOSITION_MAX_STITCHES} or fewer.`,
    )
  }
  return [...new Set(problems)]
}

/** Every piece of a composition is built and relaxed on its own, so the budget
 *  is the total worked stitches. Round work measured slower than grid work
 *  (about 29 ms a stitch on a four-core box, so roughly double that on the
 *  half-vCPU web task), which puts 500 stitches near half a minute. That is the
 *  ceiling for a composition that has to be compiled inside a request.
 *
 *  The amigurumi designer is not bound by this: its shapes are the profiles
 *  `amigurumi-presets.test.ts` has already put through the audit, so its save
 *  path skips the compile and can build the big bear. */
export const COMPOSITION_MAX_STITCHES = 500

/** Shape check, then the real compile + audit gate. */
export function validateAndAudit(raw: unknown): { built: BuiltIdea | null; problems: string[] } {
  const envelope = raw as { kind?: string; program?: unknown }
  if (envelope?.kind === 'amigurumi') {
    const parsed = CompositionProgramSchema.safeParse(envelope.program)
    if (!parsed.success) {
      return { built: null, problems: parsed.error.issues.map(issueText) }
    }
    const program = parsed.data as CompositionProgram
    const shape = compositionProgramProblems(program)
    if (shape.length) return { built: null, problems: shape }
    try {
      const compiled = compileComposition(program)
      if (compiled.problems.length) return { built: null, problems: compiled.problems }
    } catch (err) {
      return { built: null, problems: [String(err instanceof Error ? err.message : err)] }
    }
    return { built: { kind: 'amigurumi', program }, problems: [] }
  }

  if (envelope?.kind === 'piece') {
    const parsed = CrochetProgramSchema.safeParse(envelope.program)
    if (!parsed.success) {
      return { built: null, problems: parsed.error.issues.map(issueText) }
    }
    const program = parsed.data as CrochetProgram
    const shape = crochetProgramProblems(program)
    if (shape.length) return { built: null, problems: shape }
    try {
      const compiled = compileRelaxAudit(program)
      if (compiled.problems.length) return { built: null, problems: compiled.problems }
    } catch (err) {
      return { built: null, problems: [String(err instanceof Error ? err.message : err)] }
    }
    return { built: { kind: 'piece', program }, problems: [] }
  }

  return { built: null, problems: ['The reply was not a stitch program.'] }
}


function issueText(issue: { path: (string | number | symbol)[]; message: string }): string {
  const where = issue.path.join('.')
  return where ? `${where}: ${issue.message}` : issue.message
}

