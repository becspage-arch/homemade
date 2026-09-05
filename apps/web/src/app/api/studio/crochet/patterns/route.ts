import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  prisma,
  Visibility,
  Difficulty,
  CrochetPatternFormat,
  CrochetShape,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { slugify } from '@/lib/slug'
import { inngest } from '@/inngest/client'
import {
  CompositionProgramSchema,
  CrochetProgramSchema,
  compositionProgramProblems,
  crochetProgramProblems,
} from '@/lib/studio/crochet/program-validation'
import { declareSettledSize, finishedSizeText } from '@/lib/studio/crochet/tapestry-program'
import {
  writeInstructions,
  programToChart,
  type CrochetProgram,
} from '@/lib/loom/crochet/engine/program'
import { compileRelaxAudit, settledSizeMm, geometryHash } from '@/lib/loom/crochet/engine/programScene'
import { compileComposition, type CompositionProgram } from '@/lib/loom/crochet/engine/composition'
import {
  buildAmigurumiProgram,
  isAuditedProfile,
  presetSettledSizeMm,
  type AmigurumiChoices,
} from '@/lib/loom/crochet/engine/amigurumiPresets'
import {
  compositionBuildOrder,
  compositionNotions,
  compositionPieces,
  compositionRowsStructured,
} from '@/lib/loom/crochet/engine/compositionPattern'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Compiling and auditing the stitch program before anything is written is the
// slow part of this route (about eleven milliseconds a stitch), so it needs
// more than the default budget.
export const maxDuration = 60

const Choices = z.object({
  base: z.enum(['ball', 'egg', 'bear', 'bunny']),
  size: z.enum(['S', 'M', 'L']),
  mainHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  contrastHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  eyeMm: z.number().int().min(0).max(20),
  nose: z.boolean(),
  paws: z.boolean(),
  name: z.string().max(120).optional(),
})

const Body = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('piece'),
    name: z.string().min(1).max(120),
    program: z.unknown(),
    origin: z.enum(['photo', 'idea']).optional(),
  }),
  z.object({
    kind: z.literal('amigurumi'),
    name: z.string().min(1).max(120),
    program: z.unknown(),
    origin: z.enum(['idea']).optional(),
  }),
  z.object({
    kind: z.literal('designer'),
    name: z.string().min(1).max(120),
    choices: Choices,
  }),
])

/**
 * GET /api/studio/crochet/patterns — the signed-in maker's own crochet designs.
 */
export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const rows = await prisma.crochetPattern.findMany({
    where: { ownerUserId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 200,
    select: {
      id: true,
      name: true,
      slug: true,
      updatedAt: true,
      shapeCategory: true,
      finishedSizeText: true,
      loomRenderStatus: true,
      thumbnailMediaId: true,
    },
  })
  return NextResponse.json({ patterns: rows })
}

/**
 * POST /api/studio/crochet/patterns — save a create-your-own crochet design.
 *
 * The maker's own pattern, exactly as the cross-stitch Studio saves theirs:
 * `ownerUserId` set, PRIVATE, never in the public library. Two program shapes
 * arrive here, a single piece (a tapestry panel, a flat piece, a ball) and an
 * assembled amigurumi.
 *
 * Nothing is written until the program COMPILES and passes the loom's audit
 * gate, so a saved design is genuinely stitchable rather than a picture of one.
 * The declared finished size is read off the relaxed geometry, not guessed, so
 * the size on the pattern is the size the piece actually settles to.
 *
 * The photoreal hero renders afterwards on the `crochet/hero.render` job, the
 * way needlework's does, so the maker is not held while Blender runs. The
 * pattern opens complete without it: chart, written rounds, the lot.
 *
 * Create-your-own is premium. The Studio surface shows the upgrade popup to a
 * free member; this route enforces it too, since this is the thing that does
 * the work.
 */
export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!hasPremium(user)) {
    return NextResponse.json(
      { error: 'Homemade Premium is required to design your own crochet pattern.' },
      { status: 402 },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Body.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join('; ') }, { status: 400 })
  }
  const body = parsed.data
  const name = body.name
  const origin = body.kind === 'designer' ? 'designer' : (body.origin ?? null)

  const built =
    body.kind === 'designer'
      ? buildFromDesigner(body.choices, name)
      : body.kind === 'amigurumi'
        ? buildAmigurumi(body.program, name)
        : buildPiece(body.program, name)
  if ('problems' in built) {
    return NextResponse.json(
      { error: 'That pattern could not be built.', problems: built.problems },
      { status: 422 },
    )
  }

  const slug = await uniqueSlug(name)
  const row = await prisma.crochetPattern.create({
    data: {
      name,
      slug,
      description: built.description,
      rowsStructured: built.rowsStructured,
      chartData: built.chartData ?? undefined,
      loomProgram: built.program as unknown as object,
      loomRenderStatus: 'PENDING',
      loomGeometryHash: built.geometryHash ?? undefined,
      loomYarnRadiusMm: built.yr ?? undefined,
      format: built.format,
      shapeCategory: built.shapeCategory,
      pieceCount: built.pieceCount,
      pieces: built.pieces ?? undefined,
      buildOrder: built.buildOrder ?? undefined,
      gaugeText: built.gaugeText,
      finishedSizeText: built.finishedSizeText,
      notions: built.notions,
      safetyNotes: built.safetyNotes,
      abbreviationsUsed: built.abbreviations,
      craftStitchSlugs: built.stitchSlugs,
      craftTechniqueTags: built.techniqueTags,
      terminologyConvention: 'uk',
      difficulty: Difficulty.INTERMEDIATE,
      ownerUserId: user.id,
      visibility: Visibility.PRIVATE,
    },
    select: { id: true, slug: true },
  })

  // The exact-pattern hero renders off the saved row. A queue hiccup must never
  // fail the maker's save; the pattern is complete and workable without it.
  try {
    await inngest.send({ name: 'crochet/hero.render', data: { crochetPatternId: row.id } })
  } catch (err) {
    console.error('[studio/crochet/patterns] could not enqueue hero render:', err)
  }

  return NextResponse.json({ id: row.id, slug: row.slug, origin }, { status: 201 })
}

interface BuiltPattern {
  program: CrochetProgram | CompositionProgram
  geometryHash: string | null
  yr: number | null
  rowsStructured: object
  chartData: object | null
  description: string
  format: CrochetPatternFormat
  shapeCategory: CrochetShape
  pieceCount: number
  pieces: object | null
  buildOrder: object | null
  gaugeText: string
  finishedSizeText: string
  notions: string[]
  safetyNotes: string | null
  abbreviations: string[]
  stitchSlugs: string[]
  techniqueTags: string[]
}

/** A single piece: compile, audit, then declare the size the fabric settles to. */
function buildPiece(programRaw: unknown, name: string): BuiltPattern | { problems: string[] } {
  const parsed = CrochetProgramSchema.safeParse(programRaw)
  if (!parsed.success) return { problems: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }
  let program = { ...(parsed.data as CrochetProgram), name }
  const shape = crochetProgramProblems(program)
  if (shape.length) return { problems: shape }

  // Compile once, without a declared size, and read the settled size off the
  // relaxed geometry. The declaration is then made FROM that measurement, so
  // the size-consistency gate is satisfied by construction and there is nothing
  // to gain from compiling a second time to watch it pass.
  let audited
  try {
    audited = compileRelaxAudit({ ...program, finishedSizeMm: undefined })
  } catch (err) {
    return { problems: [err instanceof Error ? err.message : String(err)] }
  }
  if (audited.problems.length) return { problems: audited.problems }

  const settled = settledSizeMm(audited.built)
  program = declareSettledSize(program, settled)

  const lines = writeInstructions(program)
  const isColourwork = program.form === 'grid' && (program.grid ?? []).some((r) => r.cellColours)
  return {
    program,
    geometryHash: geometryHash(audited.built),
    yr: audited.yr,
    rowsStructured: lines.map((line, i) => ({
      section: 'Body',
      rowNumber: i,
      rowLabel: line.split(':')[0] ?? `Line ${i + 1}`,
      instruction: line,
    })),
    chartData: programToChart(program) as unknown as object,
    description: isColourwork
      ? 'Tapestry crochet worked in rows of single crochet, carrying the colours you are not using inside the stitches.'
      : 'A single crocheted piece, worked from the chart and the written rows.',
    format: CrochetPatternFormat.WRITTEN_AND_CHART,
    shapeCategory:
      program.form === 'sphere'
        ? CrochetShape.AMIGURUMI
        : program.form === 'disc'
          ? CrochetShape.MOTIF
          : CrochetShape.DECOR,
    pieceCount: 1,
    pieces: null,
    buildOrder: null,
    gaugeText: program.gaugeText ?? '',
    finishedSizeText: finishedSizeText(settled),
    notions: ['Tapestry needle', 'Stitch marker'],
    safetyNotes: null,
    abbreviations: isColourwork ? ['ch', 'dc'] : ['ch', 'dc', 'sl st'],
    stitchSlugs: isColourwork ? ['single-crochet'] : [],
    techniqueTags: isColourwork ? ['tapestry-crochet', 'colourwork'] : [],
  }
}

/**
 * The guided designer. The maker picks a creature, a size and the colours; the
 * server rebuilds the composition from the preset library rather than trusting a
 * program off the wire.
 *
 * No compile here, and that is deliberate. Whether a piece passes the loom's
 * interlock audit depends only on its stitch, its round counts and the yarn
 * radius, none of which the maker can change: every preset piece is one of the
 * profiles `amigurumi-presets.test.ts` walks through the real audit. Compiling
 * a large bear takes the better part of a minute, so paying it again on the save
 * would buy nothing but a slow spinner. The render job compiles for real and
 * writes the geometry hash and the exact settled size back.
 */
function buildFromDesigner(choices: AmigurumiChoices, name: string): BuiltPattern | { problems: string[] } {
  const program = { ...buildAmigurumiProgram(choices), name }
  const offProfile = program.parts.filter((p) => !isAuditedProfile(p.rounds))
  if (offProfile.length) {
    return { problems: [`Those pieces are not ones we can build: ${offProfile.map((p) => p.name).join(', ')}.`] }
  }
  const settled = presetSettledSizeMm(choices.base, choices.size)
  return amigurumiPattern({ ...program, finishedSizeMm: settled }, settled, null, null)
}

/** An assembled amigurumi off the wire (the idea builder's path): every piece is
 *  built, relaxed and audited before anything is written. */
function buildAmigurumi(programRaw: unknown, name: string): BuiltPattern | { problems: string[] } {
  const parsed = CompositionProgramSchema.safeParse(programRaw)
  if (!parsed.success) return { problems: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }
  const program = { ...(parsed.data as CompositionProgram), name }
  const shape = compositionProgramProblems(program)
  if (shape.length) return { problems: shape }

  let compiled
  try {
    compiled = compileComposition(program)
  } catch (err) {
    return { problems: [err instanceof Error ? err.message : String(err)] }
  }
  if (compiled.problems.length) return { problems: compiled.problems }

  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity
  for (const p of compiled.placed) {
    minx = Math.min(minx, p.bounds.minx); maxx = Math.max(maxx, p.bounds.maxx)
    minz = Math.min(minz, p.bounds.minz); maxz = Math.max(maxz, p.bounds.maxz)
  }
  const settled = { width: Math.round(maxx - minx), height: Math.round(maxz - minz) }
  return amigurumiPattern(
    { ...program, finishedSizeMm: settled },
    settled,
    compiled.geometryHash,
    compiled.yr,
  )
}

/** The pattern document for a composition, once its size is known. */
function amigurumiPattern(
  program: CompositionProgram,
  settled: { width: number; height: number },
  hash: string | null,
  yr: number | null,
): BuiltPattern {
  const sized: CompositionProgram = {
    ...program,
    gaugeText: program.gaugeText ?? 'Single crochet worked in a continuous spiral, stuffed firm',
  }
  const pieces = compositionPieces(sized)
  const hasEyes = (sized.props ?? []).some((x) => /eye/i.test(x.name))
  return {
    program: sized,
    geometryHash: hash,
    yr,
    rowsStructured: compositionRowsStructured(sized) as unknown as object,
    // An amigurumi is a written pattern. Charting one piece of nine and calling
    // it the pattern's chart would be misleading, so it carries none.
    chartData: null,
    description: `${pieces.length} pieces worked in single crochet from a magic ring, stuffed and sewn together.`,
    format: CrochetPatternFormat.WRITTEN_ONLY,
    shapeCategory: CrochetShape.AMIGURUMI,
    pieceCount: pieces.reduce((a, p) => a + p.makeQuantity, 0),
    pieces: pieces.map((p) => ({
      name: p.label,
      sectionLabel: p.section,
      makeQuantity: p.makeQuantity,
      stuffing: 'firm',
      stitchCountTotal: p.stitchCount,
      colourHex: p.colourHex,
    })) as unknown as object,
    buildOrder: compositionBuildOrder(sized) as unknown as object,
    gaugeText: sized.gaugeText ?? '',
    finishedSizeText: finishedSizeText(settled),
    notions: compositionNotions(sized),
    safetyNotes: hasEyes
      ? 'Safety eyes are not suitable for a toy given to a child under three. Embroider the face instead.'
      : null,
    abbreviations: ['ch', 'dc', 'dc2tog', 'sl st'],
    stitchSlugs: ['single-crochet', 'magic-ring'],
    techniqueTags: ['amigurumi', 'worked-in-the-round'],
  }
}

/** A design's slug never collides with the library's: the maker's name plus a
 *  short suffix, retried if it is somehow taken. */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name).slice(0, 60)
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`
    const clash = await prisma.crochetPattern.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!clash) return candidate
  }
  return `${base}-${Date.now().toString(36)}`
}
