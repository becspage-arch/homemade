import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { inngest } from '@/inngest/client'
import {
  CompositionProgramSchema,
  CrochetProgramSchema,
  compositionProgramProblems,
  crochetProgramProblems,
} from '@/lib/studio/crochet/program-validation'
import { declareSettledSize, finishedSizeText } from '@/lib/studio/crochet/tapestry-program'
import { writeInstructions, programToChart, type CrochetProgram } from '@/lib/loom/crochet/engine/program'
import { compileRelaxAudit, settledSizeMm, geometryHash } from '@/lib/loom/crochet/engine/programScene'
import { compileComposition, type CompositionProgram } from '@/lib/loom/crochet/engine/composition'
import {
  compositionBuildOrder,
  compositionPieces,
  compositionRowsStructured,
} from '@/lib/loom/crochet/engine/compositionPattern'
import { isAuditedProfile } from '@/lib/loom/crochet/engine/amigurumiPresets'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

interface Ctx {
  params: Promise<{ id: string }>
}

const Patch = z.object({
  name: z.string().min(1).max(120).optional(),
  program: z.unknown().optional(),
  kind: z.enum(['piece', 'amigurumi']).optional(),
})

/**
 * PATCH /api/studio/crochet/patterns/[id] — autosave for a maker's own design.
 *
 * A name change is stored as it comes. A changed stitch program goes through the
 * same gate the save route runs: it compiles, it passes the audit, and both
 * derived faces are rewritten from it, so the words and the chart can never
 * drift from the stitches. The finished-piece photo is queued again, because a
 * changed pattern means the old photo is no longer this pattern.
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id } = await ctx.params
  const row = await prisma.crochetPattern.findUnique({
    where: { id },
    select: { id: true, ownerUserId: true, loomProgram: true },
  })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (row.ownerUserId !== user.id) return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  if (!hasPremium(user)) {
    return NextResponse.json(
      { error: 'Homemade Premium is required to change your own pattern.' },
      { status: 402 },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Patch.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (parsed.data.name) data.name = parsed.data.name

  let requeueRender = false
  if (parsed.data.program !== undefined) {
    const unchanged = JSON.stringify(parsed.data.program) === JSON.stringify(row.loomProgram)
    if (!unchanged) {
      const rebuilt =
        parsed.data.kind === 'amigurumi'
          ? rebuildComposition(parsed.data.program, parsed.data.name)
          : rebuildPiece(parsed.data.program, parsed.data.name)
      if ('problems' in rebuilt) {
        return NextResponse.json(
          { error: 'That change could not be built.', problems: rebuilt.problems },
          { status: 422 },
        )
      }
      Object.assign(data, rebuilt.data)
      requeueRender = true
    }
  }

  if (Object.keys(data).length === 0) return NextResponse.json({ ok: true })

  await prisma.crochetPattern.update({ where: { id }, data })

  if (requeueRender) {
    try {
      await inngest.send({ name: 'crochet/hero.render', data: { crochetPatternId: id } })
    } catch (err) {
      console.error('[studio/crochet/patterns] could not enqueue hero render:', err)
    }
  }
  return NextResponse.json({ ok: true })
}

function rebuildPiece(programRaw: unknown, name?: string): { data: Record<string, unknown> } | { problems: string[] } {
  const parsed = CrochetProgramSchema.safeParse(programRaw)
  if (!parsed.success) return { problems: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }
  let program = parsed.data as CrochetProgram
  if (name) program = { ...program, name }
  const shape = crochetProgramProblems(program)
  if (shape.length) return { problems: shape }

  // One compile: the settled size measured off the relaxed geometry becomes the
  // declaration, so the size gate is satisfied by construction.
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
  return {
    data: {
      loomProgram: program as unknown as object,
      rowsStructured: lines.map((line, i) => ({
        section: 'Body',
        rowNumber: i,
        rowLabel: line.split(':')[0] ?? `Line ${i + 1}`,
        instruction: line,
      })),
      chartData: programToChart(program) as unknown as object,
      gaugeText: program.gaugeText,
      finishedSizeText: finishedSizeText(settled),
      loomGeometryHash: geometryHash(audited.built),
      loomYarnRadiusMm: audited.yr,
      loomRenderStatus: 'PENDING',
      loomHeroMediaId: null,
      heroMediaId: null,
    },
  }
}

function rebuildComposition(programRaw: unknown, name?: string): { data: Record<string, unknown> } | { problems: string[] } {
  const parsed = CompositionProgramSchema.safeParse(programRaw)
  if (!parsed.success) return { problems: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }
  let program = parsed.data as CompositionProgram
  if (name) program = { ...program, name }
  const shape = compositionProgramProblems(program)
  if (shape.length) return { problems: shape }

  // Every piece already measured against the audit keeps its guarantee without
  // paying for the compile again; anything else is compiled and audited here.
  const knownGood = program.parts.every((p) => isAuditedProfile(p.rounds))
  let hash: string | null = null
  let yr: number | null = null
  let settled = program.finishedSizeMm ?? { width: 0, height: 0 }
  if (!knownGood) {
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
    settled = { width: Math.round(maxx - minx), height: Math.round(maxz - minz) }
    hash = compiled.geometryHash
    yr = compiled.yr
  }

  const pieces = compositionPieces(program)
  return {
    data: {
      loomProgram: { ...program, finishedSizeMm: settled } as unknown as object,
      rowsStructured: compositionRowsStructured(program) as unknown as object,
      pieceCount: pieces.reduce((a, p) => a + p.makeQuantity, 0),
      buildOrder: compositionBuildOrder(program) as unknown as object,
      finishedSizeText: settled.width ? finishedSizeText(settled) : null,
      loomGeometryHash: hash,
      loomYarnRadiusMm: yr,
      loomRenderStatus: 'PENDING',
      loomHeroMediaId: null,
      heroMediaId: null,
    },
  }
}
