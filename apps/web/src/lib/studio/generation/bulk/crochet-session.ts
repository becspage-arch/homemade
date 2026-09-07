/**
 * THE SESSION CONTRACT for the crochet autopilot.
 *
 * The crochet catalogue used to fill itself by making three Anthropic API calls
 * per pattern: one to plan the briefs, one to author the design recipe, one to
 * judge the finished hero. Rebecca's standing rule is that model work runs on
 * her Claude Max plan inside a cloud session or routine and never as per-token
 * API spend, so those three calls are gone and a SESSION does that work instead.
 *
 * A session cannot be imported, so the handover is FILES: the session reads a
 * plan context, writes briefs and design recipes, looks at contact sheets, and
 * writes verdicts. This module is the contract those files are held to. Every
 * schema here exists so that a mistake in a hand-written file comes back as a
 * sentence naming the field, rather than as an exception ten steps later with a
 * half-published row behind it.
 *
 * Pure on purpose — no `server-only`, no Prisma, no filesystem. The CLI does the
 * I/O; this decides what is valid.
 */

import { z } from 'zod'
import { subjectKey } from './subject-key'
import { BAND_STITCHES } from './crochet-design'
import type { CrochetDesign } from './crochet-design'
import type { CrochetTreatment } from './crochet-forms'
import type { CrochetBrief } from './crochet-planner'

/** Every treatment a brief may name. Mirrors `CrochetTreatment`. */
export const CROCHET_TREATMENTS = [
  'grid-plain',
  'grid-stripe',
  'grid-texture',
  'grid-postrib',
  'grid-tapestry',
  'disc',
  'sphere',
  'amigurumi',
] as const

/**
 * How many times a design may be expanded before the candidate is culled. The
 * loom audit hands its own words back as the note on what to fix, and the
 * session rewrites the design; two revisions, then it is dropped — the same
 * budget the model loop had (`MAX_DESIGN_REVISIONS`).
 */
export const MAX_DESIGN_ATTEMPTS = 3

const HEX = /^#[0-9a-fA-F]{6}$/
const COLOUR_KEY = /^[a-z0-9-]{1,24}$/i
const SLUG = /^[a-z0-9][a-z0-9-]{2,79}$/

// ── The brief the session writes ────────────────────────────────────────────

/**
 * What a session hands over per pattern. Deliberately smaller than
 * `CrochetBrief`: the subject key is derived (never typed, so it cannot drift
 * from the duplicate guard's idea of it) and the provenance fields are stamped
 * by `toCrochetBrief`.
 */
export const SessionBriefSchema = z
  .object({
    slug: z.string().regex(SLUG, 'a slug is lower-case letters, numbers and hyphens, 3 to 80 characters'),
    name: z.string().min(3).max(80),
    subject: z.string().min(12, 'the concept has to say what the finished thing is, in a sentence'),
    shelf: z.string().min(2),
    treatment: z.enum(CROCHET_TREATMENTS),
    look: z.string().min(2),
    territory: z.string().min(2),
    palette: z.string().min(2),
    size: z.enum(['small', 'medium', 'large', 'showpiece']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'showpiece']),
    /**
     * The idea backlog entry this brief came from, when it came from one.
     * Absent means the session invented it because the shelf's queue was dry —
     * which is allowed, and worth being able to count afterwards.
     */
    backlogId: z.string().regex(/^[a-z0-9-]+$/, 'a backlog id looks like "coaster-07"').optional(),
  })
  .strict()

export type SessionBrief = z.infer<typeof SessionBriefSchema>

export const SessionBriefsSchema = z.array(SessionBriefSchema).min(1)

/**
 * Fill in everything a `CrochetBrief` carries that the session does not type:
 * the derived subject key, the shelf's display name, and the provenance saying
 * a session wrote this rather than a planner model.
 */
export function toCrochetBrief(brief: SessionBrief, shelfName: string): CrochetBrief {
  return {
    slug: brief.slug,
    name: brief.name,
    subject: brief.subject,
    subjectKey: subjectKey(brief.subject),
    shelf: brief.shelf,
    shelfName,
    treatment: brief.treatment as CrochetTreatment,
    brief: {
      craft: 'crochet',
      territory: brief.territory,
      look: brief.look,
      itemType: brief.shelf,
      palette: brief.palette,
      size: brief.size,
      difficulty: brief.difficulty,
      concept: brief.subject,
    },
    source: 'session',
    plannerMode: 'session',
    dressed: true,
  }
}

// ── The design recipe the session writes ────────────────────────────────────

const BandSchema = z
  .object({
    rows: z.number().int().min(1).max(12),
    stitch: z.enum(BAND_STITCHES),
    colourKey: z.string().regex(COLOUR_KEY).optional(),
  })
  .strict()

const AmigurumiSchema = z
  .object({
    base: z.enum(['ball', 'egg', 'bear', 'bunny', 'cat', 'dog', 'bird']),
    size: z.enum(['S', 'M', 'L']),
    mainHex: z.string().regex(HEX, 'a yarn colour is a six-digit hex like #b5814e'),
    contrastHex: z.string().regex(HEX, 'a yarn colour is a six-digit hex like #e6d3ae'),
    eyeMm: z.number().int(),
    nose: z.boolean(),
    paws: z.boolean(),
  })
  .strict()

/**
 * The compact design recipe — the same `CrochetDesign` shape `crochet.ts`
 * expects, with the constraints that used to live in the model's system prompt
 * turned into validation, so a design that cannot be built says so here rather
 * than after the expansion.
 */
export const CrochetDesignSchema = z
  .object({
    treatment: z.enum(CROCHET_TREATMENTS),
    cols: z.number().int().min(1).max(400).optional(),
    rows: z.number().int().min(1).max(400).optional(),
    bands: z.array(BandSchema).min(2).max(40).optional(),
    rounds: z.number().int().min(1).max(60).optional(),
    ballEquator: z.number().int().min(6).max(60).optional(),
    ballPlateau: z.number().int().min(1).max(20).optional(),
    palette: z.record(z.string().regex(COLOUR_KEY), z.string().regex(HEX, 'a yarn colour is a six-digit hex like #c25a3c')).optional(),
    baseColourKey: z.string().regex(COLOUR_KEY).optional(),
    amigurumi: AmigurumiSchema.optional(),
    picture: z.string().min(8).optional(),
    pictureColours: z.number().int().min(2).max(64).optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    const needsPalette = d.treatment !== 'amigurumi' && d.treatment !== 'grid-tapestry'
    const keys = Object.keys(d.palette ?? {})
    if (needsPalette && keys.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['palette'], message: 'the design lists no yarn colours' })
    }
    if (needsPalette && d.baseColourKey && !keys.includes(d.baseColourKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['baseColourKey'],
        message: `"${d.baseColourKey}" is not one of the yarn colours the design lists (${keys.join(', ')})`,
      })
    }
    for (const [i, band] of (d.bands ?? []).entries()) {
      if (band.colourKey && !keys.includes(band.colourKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bands', i, 'colourKey'],
          message: `"${band.colourKey}" is not one of the yarn colours the design lists`,
        })
      }
    }
    const require = (field: keyof CrochetDesign, why: string): void => {
      if (d[field as keyof typeof d] === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field as string], message: why })
      }
    }
    switch (d.treatment) {
      case 'grid-plain':
      case 'grid-postrib':
        require('cols', 'a flat piece worked in one stitch needs its stitches across')
        require('rows', 'a flat piece worked in one stitch needs its rows up')
        break
      case 'grid-stripe':
      case 'grid-texture':
        require('cols', 'a banded piece needs its stitches across')
        if (!d.bands || d.bands.length < 2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bands'], message: 'a banded piece needs at least two bands, bottom row first' })
        }
        if (d.treatment === 'grid-stripe' && new Set((d.bands ?? []).map((b) => b.colourKey ?? d.baseColourKey)).size < 2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bands'], message: 'a striped piece has to change colour at least once' })
        }
        if (d.treatment === 'grid-texture' && new Set((d.bands ?? []).map((b) => b.stitch)).size < 2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bands'], message: 'a textured piece has to change stitch at least once' })
        }
        break
      case 'disc':
        require('rounds', 'a disc needs the number of rounds worked')
        break
      case 'sphere':
        require('ballEquator', 'a ball needs its widest round')
        require('ballPlateau', 'a ball needs how many rounds it holds at its widest')
        break
      case 'amigurumi':
        require('amigurumi', 'the design says amigurumi but describes no creature')
        break
      case 'grid-tapestry':
        require('picture', 'a tapestry panel needs a sentence saying what the picture shows')
        break
    }
  })

export type ValidatedCrochetDesign = z.infer<typeof CrochetDesignSchema>

/** Designs arrive keyed by the brief's slug, so one file covers a whole batch. */
export const CrochetDesignsSchema = z.record(z.string(), CrochetDesignSchema)

// ── The verdict the session writes ──────────────────────────────────────────

/**
 * The crochet rubric, box for box, from `vision-gate.ts` — A to F plus the
 * near-duplicate check the general rubric carries. It is spelled out rather
 * than reduced to a single yes/no because the whole point of the gate is that
 * every box has to be a YES, and a judge that only records the conclusion can
 * quietly stop checking.
 */
export const RubricSchema = z
  .object({
    /** A — the finished object reads as the item in the brief. */
    isTheThingAsked: z.boolean(),
    /** B — continuous stitches, even rows, no melted or missing patch. */
    fabricRealAndWhole: z.boolean(),
    /** C — the yarn colours are the pattern's, clean and separated. */
    coloursAreThePatterns: z.boolean(),
    /** D — staged whole on a clean pale ground at product-photo scale. */
    stagedAsAFinishedObject: z.boolean(),
    /** E — nothing in the frame but the pattern and its own notions. */
    nothingElseInFrame: z.boolean(),
    /** F — on a figure, the limbs are where a real toy's are. Null when it is not a figure. */
    limbsPlacedLikeARealToy: z.boolean().nullable(),
    /** 7 — not a near-duplicate of anything already kept. */
    notANearDuplicate: z.boolean(),
  })
  .strict()

export const SessionVerdictSchema = z
  .object({
    verdict: z.enum(['PASS', 'KILL']),
    reasons: z.array(z.string().min(3)).max(6),
    rubric: RubricSchema,
  })
  .strict()
  .superRefine((v, ctx) => {
    const boxes = Object.entries(v.rubric).filter(([, value]) => value !== null)
    const failed = boxes.filter(([, value]) => value === false).map(([box]) => box)
    if (v.verdict === 'PASS' && failed.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['verdict'],
        message: `a PASS needs every rubric box true; these are false: ${failed.join(', ')}`,
      })
    }
    if (v.verdict === 'KILL' && v.reasons.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['reasons'], message: 'a KILL has to say why' })
    }
    if (v.verdict === 'KILL' && failed.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rubric'],
        message: 'a KILL has to fail a rubric box — say which one the hero misses',
      })
    }
  })

export type SessionVerdict = z.infer<typeof SessionVerdictSchema>

/** Verdicts arrive keyed by slug, one entry per candidate that was rendered. */
export const SessionVerdictsSchema = z.record(z.string(), SessionVerdictSchema)

// ── The run manifest ────────────────────────────────────────────────────────

export const CandidateStages = ['planned', 'expanded', 'rendered', 'published', 'culled'] as const
export type CandidateStage = (typeof CandidateStages)[number]

export const ManifestCandidateSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    shelf: z.string(),
    treatment: z.enum(CROCHET_TREATMENTS),
    subjectKey: z.string(),
    /** The backlog entry this candidate consumed, when it came from one. */
    backlogId: z.string().optional(),
    stage: z.enum(CandidateStages),
    /** How many times a design for this brief has been expanded. */
    expandAttempts: z.number().int().min(0),
    /** What the last expansion or audit refused, in the loom's own words. */
    problems: z.array(z.string()),
    kind: z.enum(['piece', 'amigurumi']).optional(),
    fingerprint: z.string().optional(),
    settledMm: z.object({ width: z.number(), height: z.number() }).optional(),
    totalStitches: z.number().int().optional(),
    candidatePath: z.string().optional(),
    render: z
      .object({
        heroPath: z.string(),
        geometryHash: z.string(),
        fidelityScore: z.number().nullable(),
        yr: z.number(),
        contactSheet: z.string().optional(),
        at: z.string(),
        estimatedUsd: z.number(),
      })
      .optional(),
    verdict: SessionVerdictSchema.optional(),
    published: z
      .object({ patternId: z.string(), publicUrl: z.string(), visibility: z.enum(['PRIVATE', 'PUBLIC']), at: z.string() })
      .optional(),
    /** Why the candidate stopped, when it did. */
    culledReason: z.string().optional(),
  })
  .strict()

export type ManifestCandidate = z.infer<typeof ManifestCandidateSchema>

export const RunManifestSchema = z
  .object({
    version: z.literal(1),
    /** The routine run this batch belongs to — stamped onto every row's provenance. */
    runId: z.string().min(3),
    /** The BulkRun row, created by `expand` so the admin page sees the batch. */
    bulkRunId: z.string().nullable(),
    batchSize: z.number().int().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    /** Which stages have run, and when. */
    stages: z.record(z.string(), z.string()),
    /** The backlog ids the context stage handed this batch, for the audit trail. */
    backlogOffered: z.array(z.string()).default([]),
    candidates: z.array(ManifestCandidateSchema),
    /** Approximate deterministic spend this run has committed, in USD. */
    spentUsd: z.number().min(0),
  })
  .strict()

export type RunManifest = z.infer<typeof RunManifestSchema>

export function emptyManifest(runId: string, batchSize: number): RunManifest {
  const now = new Date().toISOString()
  return {
    version: 1,
    runId,
    bulkRunId: null,
    batchSize,
    createdAt: now,
    updatedAt: now,
    stages: {},
    backlogOffered: [],
    candidates: [],
    spentUsd: 0,
  }
}

/** Which backlog entries this batch actually consumed, in the order it did. */
export function backlogConsumed(manifest: RunManifest): string[] {
  return manifest.candidates
    .filter((c) => c.backlogId && c.stage !== 'culled')
    .map((c) => c.backlogId as string)
}

/**
 * Put a candidate into the manifest, replacing any earlier record of the same
 * slug. Every stage is re-runnable, so a stage always writes through this
 * rather than appending — running `expand` twice must leave one entry, not two.
 */
export function upsertCandidate(manifest: RunManifest, candidate: ManifestCandidate): RunManifest {
  const rest = manifest.candidates.filter((c) => c.slug !== candidate.slug)
  return { ...manifest, candidates: [...rest, candidate], updatedAt: new Date().toISOString() }
}

export function findCandidate(manifest: RunManifest, slug: string): ManifestCandidate | undefined {
  return manifest.candidates.find((c) => c.slug === slug)
}

/** The counters a BulkRun row wants, read straight off the manifest. */
export function manifestCounters(manifest: RunManifest): {
  requested: number
  published: number
  culled: number
  renders: number
  fromBacklog: number
  invented: number
} {
  return {
    requested: manifest.candidates.length,
    published: manifest.candidates.filter((c) => c.stage === 'published').length,
    culled: manifest.candidates.filter((c) => c.stage === 'culled').length,
    renders: manifest.candidates.filter((c) => c.render).length,
    fromBacklog: manifest.candidates.filter((c) => c.backlogId).length,
    invented: manifest.candidates.filter((c) => !c.backlogId).length,
  }
}

// ── Reading a session's file ────────────────────────────────────────────────

export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: string[] }

/** Turn a zod failure into the sentences a session can act on. */
export function formatIssues(error: z.ZodError, label: string): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : '(root)'
    return `${label} ${path}: ${issue.message}`
  })
}

export function parseWith<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, raw: unknown, label: string): ParseResult<T> {
  const result = schema.safeParse(raw)
  if (result.success) return { ok: true, value: result.data }
  return { ok: false, errors: formatIssues(result.error, label) }
}

export function parseBriefs(raw: unknown): ParseResult<SessionBrief[]> {
  return parseWith(SessionBriefsSchema, raw, 'brief')
}

export function parseDesigns(raw: unknown): ParseResult<Record<string, ValidatedCrochetDesign>> {
  return parseWith(CrochetDesignsSchema, raw, 'design')
}

export function parseVerdicts(raw: unknown): ParseResult<Record<string, SessionVerdict>> {
  return parseWith(SessionVerdictsSchema, raw, 'verdict')
}

export function parseManifest(raw: unknown): ParseResult<RunManifest> {
  return parseWith(RunManifestSchema, raw, 'manifest')
}
