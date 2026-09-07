import 'server-only'
import os from 'node:os'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import {
  prisma,
  Visibility,
  ensureHouseDesigner,
  checkCrochetPatternCompleteness,
  abbreviationsIn,
  CROCHET_TOY_SHELVES,
  type CrochetCompletenessResult,
} from '@homemade/db'
import { generatePatternImage } from '@/lib/studio/generation/pattern-engine'
import {
  writeInstructions,
  programToChart,
  programYarnRadiusMm,
  type CrochetProgram,
  type YarnWeight,
} from '@/lib/loom/crochet/engine/program'
import { compileRelaxAudit, geometryHash, settledSizeMm } from '@/lib/loom/crochet/engine/programScene'
import {
  compileComposition,
  compositionYarnRadiusMm,
  type CompiledComposition,
  type CompositionProgram,
} from '@/lib/loom/crochet/engine/composition'
import {
  compositionBuildOrder,
  compositionNotions,
  compositionPieces,
  compositionRowsStructured,
} from '@/lib/loom/crochet/engine/compositionPattern'
import type { BuiltContinuous } from '@/lib/loom/crochet/engine/yarnPath'
import { photoToTapestryGrid, TapestrySubjectTooSmallError } from '@/lib/studio/crochet/photo-to-tapestry'
import { nameYarnColours } from '@/lib/studio/crochet/yarn-shades'
import { PALETTES } from '@homemade/db/design-direction'
import {
  buildTapestryProgram,
  declareSettledSize,
  finishedSizeText as sizeSentence,
} from '@/lib/studio/crochet/tapestry-program'
import { CROCHET_SHELF_BY_SLUG } from '../categories'
import { BULK_CROCHET_MAX_CELLS, envelopeFor } from './crochet-forms'
import {
  designToProgram,
  hookForWeight,
  LOOM_WEIGHT_TO_YARN_SLUG,
  type CrochetDesign,
} from './crochet-design'
import { findCrochetDuplicate, loadCrochetCatalogue, programFingerprint } from './crochet-dedupe'
import type { CrochetBrief } from './crochet-planner'
import type { SessionVerdict } from './crochet-session'

/**
 * THE CROCHET BULK ADAPTER — brief in, a live, makeable, self-heroing pattern
 * out, entirely on the server.
 *
 * It runs on the same rails as the needlework adapter next door (one slow
 * Fargate render per idea, unpersisted until the gate says keep, published
 * PUBLIC to the house catalogue), with the two things crochet needs that
 * needlework does not:
 *
 *   1. A crochet pattern is not an image. It is a STITCH PROGRAM, and the row
 *      has to carry every field a maker needs: the yarn, the hook, the gauge,
 *      the finished size in centimetres, every round with its stitch count, the
 *      chart, the notions, the abbreviations. So there is a completeness gate
 *      between the vision gate and the write, and a row that fails it is never
 *      published — not held for review, not published with a flag. Binary.
 *   2. The hero has to be the render of THAT program
 *      ([[feedback_hero_must_be_exact_pattern]]), so the pattern's declared size
 *      is measured off the relaxed geometry rather than claimed, and the words
 *      and the chart are derived from the same program the render came from.
 *
 * Nothing is written until the render exists and has passed the gate: the loom
 * renders with `persist: false`, so a candidate the gate kills leaves nothing
 * in R2 and no row in the catalogue.
 */

export function fargateRenderWired(): boolean {
  return process.env.LOOM_RENDER === 'fargate'
}

/** The loom's render entry points, imported dynamically — Blender, the AWS CLI
 *  and Fal are build-time-style tooling and must never enter the request bundle. */
interface LoomPatternModule {
  renderProgram: (
    program: CrochetProgram,
    options: { name?: string; yr?: number; hero?: boolean; outDir?: string },
  ) => Promise<RenderResult>
  renderComposition: (
    program: CompositionProgram,
    options: { name?: string; yr?: number; hero?: boolean; outDir?: string },
  ) => Promise<RenderResult>
}

interface RenderResult {
  problems: string[]
  basePng: string | null
  heroPng: string | null
  geometryHash: string
  yr: number
  fidelityScore: number | null
}

/** The shape `persistPatternRender` needs, built from what we already compiled
 *  rather than by re-reading and re-compiling the row we just wrote. */
interface PersistModule {
  persistPatternRender: (
    plan: {
      patternId: string
      slug: string | null
      name: string
      kind: 'flat' | 'composition' | 'none'
      program: CrochetProgram | CompositionProgram | null
      built?: BuiltContinuous | null
      compiled?: CompiledComposition | null
      yr: number | null
      geometryHash: string | null
      storedHash: string | null
      problems: string[]
      action: 'RENDER' | 'SKIPPED_UNCHANGED' | 'AUDIT_FAILED' | 'NO_PROGRAM'
    },
    art: {
      heroPath: string
      fidelityScore: number | null
      yr: number
      rowsStructured?: unknown
      chartData?: unknown
    },
  ) => Promise<string>
}

// ── Authoring ───────────────────────────────────────────────────────────────

/**
 * How many times a design may be rewritten after the loom refuses it. The
 * refusal comes back in the loom's own words; the SESSION rewrites the design
 * and re-runs `expand`. Two revisions, then the candidate is culled — the same
 * budget the old model loop had, spent by a session instead.
 */
export const MAX_DESIGN_REVISIONS = 2

/**
 * THE RULE, as an error.
 *
 * A crochet design used to be bought from the Anthropic API a token at a time.
 * Under Rebecca's standing rule that work belongs to a Claude session on her Max
 * plan, so the old entry point is a refusal: it names the rule and points at the
 * stage that replaced it, rather than disappearing and leaving a caller to fail
 * somewhere less obvious.
 */
export function authorCrochetProgram(): never {
  throw new Error(
    'authorCrochetProgram: crochet designs are authored by a Claude session on the Max plan (docs/autopilot-prompts/crochet.md), never by a per-token Anthropic API call. Write designs.json and run `scripts/crochet-autopilot.ts expand`.',
  )
}

export interface AuthoredProgram {
  kind: 'piece' | 'amigurumi'
  program: CrochetProgram | CompositionProgram
  /** Which expansion attempt produced it (1 on a design that built first time). */
  attempts: number
  /** The design the session wrote, for provenance. */
  design: CrochetDesign | null
}

/** What the loom refused, in its own words, so the session can fix the design. */
export interface BuildRefusal {
  problems: string[]
}

export type BuiltCrochetProgram = { ok: true; authored: AuthoredProgram } | { ok: false; problems: string[] }

/**
 * Build one session-written design into a stitch program the loom will make.
 *
 * The expansion is deterministic (`crochet-design.ts`), so a design can only
 * describe choices inside a shape the engine is measured on, and then the real
 * gate runs: compile the geometry and audit the interlocks. Problems come back
 * rather than throwing, because they are the note the session revises against.
 */
export function buildCrochetProgram(
  brief: CrochetBrief,
  design: CrochetDesign,
  attempt = 1,
): BuiltCrochetProgram {
  // The treatment is the brief's decision, not the design's — a design that
  // disagrees with its brief is built as the brief says.
  const wanted: CrochetDesign = { ...design, treatment: brief.treatment }
  const built = designToProgram(wanted, { shelf: brief.shelf, name: brief.name })
  if (built.kind === 'none') return { ok: false, problems: built.problems }

  const audit =
    built.kind === 'amigurumi'
      ? compileComposition(built.program).problems
      : compileRelaxAudit(built.program).problems
  if (audit.length) return { ok: false, problems: audit }

  return { ok: true, authored: { kind: built.kind, program: built.program, attempts: attempt, design: wanted } }
}

/**
 * The pictorial lane, driven by the session's `picture` sentence rather than by
 * a design recipe. Public because the CLI's expand stage builds it directly.
 */
export async function buildTapestryCandidate(brief: CrochetBrief, picture?: string): Promise<AuthoredProgram> {
  return authorTapestryProgram(brief, picture)
}

/**
 * How much of the frame, once a plain border is trimmed off, the illustration's
 * own subject must fill. Below this the picture reads as a small motif adrift
 * in a border rather than a picture worked edge to edge — the exact fault the
 * first published showpiece was killed for: "a third of the panel is empty
 * white above the scene, so the composition does not fill the piece"
 * (`apps/web/scripts/crochet-first-batch-verdicts.json`,
 * `crochet-cottage-lane-panel`). Rebecca's rule for this lane is that the
 * illustration must fill the frame, so this is checked, not hoped for.
 */
const TAPESTRY_MIN_SUBJECT_COVERAGE = 0.7

/**
 * How many illustrations the pictorial lane will roll looking for a
 * frame-filling composition before giving up on the idea. Kept small: every
 * roll is a real Fal spend, and `CROCHET_DAILY_ILLUSTRATION_CAP` counts the
 * idea once regardless of how many rolls it took.
 */
const TAPESTRY_ILLUSTRATION_ATTEMPTS = 3

/**
 * The pictorial lane. A tapestry picture is not written cell by cell by a
 * model: an illustration is generated on the approved image engine, then the
 * SHARED photo-to-tapestry converter (the one a maker's own picture goes
 * through) turns it into a colour per stitch. That keeps the customer path and
 * the catalogue path the same converter, and it is the only way a picture at
 * this resolution reads as a picture.
 *
 * The colour count is deliberately NOT capped down to the Studio's eight. The
 * dense many-colour end of the range is a first-class target
 * ([[feedback_pattern_complexity_range]]) and the engine resolves colour per
 * stitch with no ceiling.
 */
async function authorTapestryProgram(brief: CrochetBrief, picture?: string): Promise<AuthoredProgram> {
  // The session may say what the panel shows; the brief's own concept is the
  // fallback, exactly as it was when a model wrote the brief.
  const subject = picture?.trim() || brief.subject
  const envelope = envelopeFor(brief.shelf, 'grid-tapestry')
  const [colLo, colHi] = envelope?.cols ?? [24, 40]
  const [rowLo, rowHi] = envelope?.rows ?? [24, 40]
  // A showpiece takes the whole envelope; a smaller brief takes the low end.
  const big = brief.brief.size === 'showpiece' || brief.brief.difficulty === 'showpiece'
  let width = big ? colHi : Math.round((colLo + colHi) / 2)
  let height = big ? rowHi : Math.round((rowLo + rowHi) / 2)
  while (width * height > BULK_CROCHET_MAX_CELLS) {
    width -= 1
    height -= 1
  }
  const colours = big ? 24 : 10
  // Ask Flux for a native aspect close to the grid's own, so 'cover' fit later
  // trims as little of the subject as possible rather than squeezing a square
  // source into a rectangular grid or the reverse.
  const imageSize: 'square_hd' | 'portrait_4_3' | 'landscape_4_3' =
    width === height ? 'square_hd' : width > height ? 'landscape_4_3' : 'portrait_4_3'

  // The FLAT illustrator, never the painterly showpiece one, whatever the size
  // of the piece. A tapestry stitch is a single flat block of colour, so a
  // picture only survives the conversion if it was drawn in flat shapes to
  // begin with: the first showpiece attempt used the Pro painterly tier and
  // came back as tonal camouflage with no cottage in it, because the quantiser
  // spent its whole palette on gradation. This is not a colour CAP (the count
  // stays high — the dense many-colour end is a first-class target); it is a
  // change of SOURCE.
  //
  // FILL THE FRAME. The first published showpiece centred its cottage on a
  // wide plain ground and was killed for it (see `TAPESTRY_MIN_SUBJECT_COVERAGE`
  // above) — a small subject on a plain ground is also exactly the shape
  // `photoToTapestryGrid`'s `cropToSubject` step trims, so the prompt now asks
  // for the fill directly and the converter checks it actually happened rather
  // than trusting the prompt alone.
  const prompt =
    `${subject}. Drawn edge to edge as one bold flat picture: the subject fills the ` +
    'entire canvas from edge to edge, with no border, no vignette, and no empty ' +
    'background, sky or ground left over around it. Solid blocks of colour with ' +
    'clear hard-edged shapes and strong separation between them, like a screen ' +
    `print or a paper cut-out, in around ${colours} flat colours with no shading, ` +
    'gradients or texture. No text, no lettering.'

  let grid: Awaited<ReturnType<typeof photoToTapestryGrid>> | null = null
  let lastCoverage = 0
  for (let attempt = 1; attempt <= TAPESTRY_ILLUSTRATION_ATTEMPTS; attempt++) {
    const illustration = await generatePatternImage(prompt, { imageSize })
    try {
      grid = await photoToTapestryGrid(illustration.buffer, {
        width,
        height,
        colours,
        maxColours: colours,
        backgroundRemoval: true,
        // Hard smoothing: a lone stitch of a colour is miserable to work and
        // reads as noise in the finished fabric, and a picture at this
        // resolution needs its regions to hold together.
        smoothing: 'high',
        cropToSubject: true,
        minSubjectCoverage: TAPESTRY_MIN_SUBJECT_COVERAGE,
      })
      break
    } catch (err) {
      if (!(err instanceof TapestrySubjectTooSmallError)) throw err
      lastCoverage = err.coverage
      console.warn(
        `${brief.slug}: tapestry illustration attempt ${attempt}/${TAPESTRY_ILLUSTRATION_ATTEMPTS} ` +
          `only filled ${Math.round(err.coverage * 100)}% of the frame, re-rolling`,
      )
    }
  }
  if (!grid) {
    throw new Error(
      `tapestry illustration never filled the frame in ${TAPESTRY_ILLUSTRATION_ATTEMPTS} attempts ` +
        `(best ${Math.round(lastCoverage * 100)}% of the frame after trimming the background, ` +
        `need ${Math.round(TAPESTRY_MIN_SUBJECT_COVERAGE * 100)}%)`,
    )
  }
  const program = buildTapestryProgram(grid, {
    name: brief.name,
    yarnWeight: (envelope?.yarnWeight ?? 'worsted') as YarnWeight,
    hookMm: hookForWeight((envelope?.yarnWeight ?? 'worsted') as YarnWeight),
    notes:
      'Worked flat in double crochet (UK), changing colour stitch by stitch and carrying the unused yarns inside the stitches.',
  })
  // PUT THE PICTURE THE RIGHT WAY UP.
  //
  // Two conventions collide here. `buildTapestryProgram` flips the picture so
  // program row 0 is the row a maker WORKS FIRST, which on a finished piece is
  // its bottom edge. The renderer places program row 0 at the TOP of the image
  // (the stripe-dishcloth convention the signed-off cottage proof relies on:
  // "program row j maps straight to motif y=j"). Together those two flips put
  // the sky along the bottom, which is exactly what the first showpiece render
  // showed. Undoing the converter's flip here makes the HERO read upright,
  // which is the thing that has to be true, because the hero is the pattern.
  //
  // The underlying disagreement is the renderer's, not this lane's, and it is
  // flagged for the loom: on a rendered piece the first-worked row appears at
  // the top, which is upside down from how the fabric actually grows.
  if (program.grid) program.grid = [...program.grid].reverse()
  program.staging = envelope?.staging ?? 'flatlay'
  return {
    kind: 'piece',
    program,
    attempts: 1,
    design: { treatment: 'grid-tapestry', cols: width, rows: height, picture: subject, pictureColours: grid.palette.length },
  }
}

// ── Measuring, wording, charting ────────────────────────────────────────────

/**
 * The stitch and row pitch a piece settles to, per millimetre of yarn radius.
 * Read off the signed-off proofs (STITCH_ENGINE.md §8f): the 18 × 20 coaster
 * settles to a true 10 × 10 cm at worsted (yr 2.1), which is 2.7 yr across a
 * stitch and 2.4 yr up a row. Used only where there is no flat fabric to
 * measure — a composition's gauge line.
 */
const SC_STITCH_PITCH_YR = 2.7
const SC_ROW_PITCH_YR = 2.4

/** A composition's settled bounding box, from the parts already placed. */
export function compositionSizeMm(compiled: CompiledComposition): { width: number; height: number; depth: number } {
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, minz = Infinity, maxz = -Infinity
  for (const p of compiled.placed) {
    minx = Math.min(minx, p.bounds.minx)
    maxx = Math.max(maxx, p.bounds.maxx)
    miny = Math.min(miny, p.bounds.miny)
    maxy = Math.max(maxy, p.bounds.maxy)
    minz = Math.min(minz, p.bounds.minz)
    maxz = Math.max(maxz, p.bounds.maxz)
  }
  return { width: maxx - minx, depth: maxy - miny, height: maxz - minz }
}

/** "About 10 by 10 cm." — the sentence the pattern page shows. */
export function finishedSizeSentence(mm: { width: number; height: number }): string {
  return `About ${sizeSentence(mm).replace(' x ', ' by ')}.`
}

const CM = (mm: number): string => (mm / 10).toFixed(1)

/** Loom stitch id -> the Stitch master-table slug the pattern links to. */
const STITCH_SLUG: Record<string, string> = {
  ch: 'crochet-chain',
  slst: 'crochet-slip-stitch',
  sc: 'crochet-double-uk',
  hdc: 'crochet-half-treble',
  dc: 'crochet-treble',
  tr: 'crochet-double-treble',
  dtr: 'crochet-triple-treble',
  scblo: 'crochet-blo-dc',
  scflo: 'crochet-flo-dc',
  // The loom's front/back post trebles have no master row of their own yet, so
  // they link to the treble they are worked as; the chart caption already says
  // where the post goes.
  fpdc: 'crochet-treble',
  bpdc: 'crochet-treble',
}

/** The stitch ids a program actually works. */
function stitchIdsIn(program: CrochetProgram | CompositionProgram): string[] {
  const ids = new Set<string>(['ch'])
  if ('parts' in program) {
    // Every amigurumi piece is a continuous spiral of double crochet (UK) off a
    // magic ring: no chain, no slip stitch, nothing else.
    return ['sc']
  }
  const p = program
  if (p.form === 'grid') for (const row of p.grid ?? []) for (const s of row.stitches) ids.add(s)
  else if (p.stitch) ids.add(p.stitch)
  if (p.form === 'disc' || p.form === 'sphere') ids.delete('ch')
  return [...ids]
}

export interface PatternRow {
  section: string
  rowNumber: number
  rowLabel: string
  instruction: string
  stitchCount?: number
}

/**
 * The written pattern, with the COLOUR CHANGES in it.
 *
 * `writeInstructions` sees the stitches and not the yarn — colour lives beside
 * the stitch list on the program, so the plain writer cannot say when to join
 * the teal. A striped cloth whose instructions never mention a colour change is
 * not a makeable pattern, so the change lines are added here, named by the
 * shade the palette resolves to.
 */
export function crochetRowsStructured(
  program: CrochetProgram,
  shadeNames: Record<string, string>,
): PatternRow[] {
  const lines = writeInstructions(program)
  const rows: PatternRow[] = []
  const gridColours = program.form === 'grid' ? (program.grid ?? []).map((r) => r.colourKey) : []
  const perCell = program.form === 'grid' && (program.grid ?? []).some((r) => r.cellColours?.length)
  // A one-colour piece is never told to change colour, and a many-colour piece
  // is told which yarn to START with rather than being asked to join a yarn it
  // has not begun.
  const multiColour = new Set(gridColours.filter(Boolean)).size > 1
  let previous: string | undefined
  let rowIndex = 0

  for (const line of lines) {
    const isWorkedRow = /^Row \d+:/.test(line)
    if (isWorkedRow && !perCell && multiColour) {
      const colourKey = gridColours[rowIndex]
      if (colourKey && colourKey !== previous) {
        const shade = (shadeNames[colourKey] ?? colourKey).toLowerCase()
        rows.push({
          section: 'Body',
          rowNumber: rows.length + 1,
          rowLabel: previous === undefined ? 'Colour' : 'Colour change',
          instruction:
            previous === undefined
              ? `Start with the ${shade} yarn.`
              : `Change to the ${shade} yarn. Cut the yarn you were using, leaving a tail to weave in.`,
        })
        previous = colourKey
      }
      rowIndex++
    } else if (isWorkedRow) {
      rowIndex++
    }
    const count = /\((\d+)\s*sts?\)\s*$/.exec(line)
    rows.push({
      section: 'Body',
      rowNumber: rows.length + 1,
      rowLabel: line.split(':')[0] ?? `Line ${rows.length + 1}`,
      instruction: line,
      ...(count ? { stitchCount: Number(count[1]) } : {}),
    })
  }

  if (perCell) {
    rows.splice(1, 0, {
      section: 'Body',
      rowNumber: 0,
      rowLabel: 'Colour',
      instruction:
        'Work every stitch in the colour the chart shows for it, carrying the yarns you are not using along the top of the row and working over them.',
    })
    rows.forEach((r, i) => {
      r.rowNumber = i + 1
    })
  }
  return rows
}

// ── The candidate ───────────────────────────────────────────────────────────

export interface CrochetCandidate {
  kind: 'piece' | 'amigurumi'
  program: CrochetProgram | CompositionProgram
  /** The finished hero PNG — the exact image that would ship, gated as-is. */
  heroPng: Buffer
  heroPath: string
  geometryHash: string
  fidelityScore: number | null
  yr: number
  built: BuiltContinuous | null
  compiled: CompiledComposition | null
  settledMm: { width: number; height: number }
  totalStitches: number
  attempts: number
  design: CrochetDesign | null
  fingerprint: string
}

/**
 * Render one AUTHORED candidate: measure the settled geometry and declare the
 * size from it → render the exact hero on Fargate, UNPERSISTED. The buffer is
 * handed back for the session to judge; nothing has been written anywhere.
 *
 * The program arrives already built and audited (`buildCrochetProgram`), so
 * this function spends money and nothing else — which is what makes the render
 * stage's spend cap a real cap rather than an approximate one.
 */
export async function renderCrochetCandidate(
  brief: CrochetBrief,
  authored: AuthoredProgram,
  options: { outDir?: string } = {},
): Promise<CrochetCandidate> {
  if (!fargateRenderWired()) {
    throw new Error('renderCrochetCandidate: LOOM_RENDER!=fargate — the crochet hero render is not wired')
  }
  const outDir = options.outDir ?? path.join(os.tmpdir(), 'homemade-bulk-crochet-heroes')
  const mod = (await import('../../../../../scripts/loom-pattern')) as unknown as LoomPatternModule
  const settled = settleCrochetProgram(authored)

  const render =
    settled.kind === 'amigurumi'
      ? await mod.renderComposition(settled.program as CompositionProgram, { name: brief.slug, hero: true, outDir })
      : await mod.renderProgram(settled.program as CrochetProgram, { name: brief.slug, hero: true, outDir })
  if (render.problems.length) throw new Error(`render audit failed: ${render.problems[0]}`)
  const heroPath = render.heroPng ?? render.basePng
  if (!heroPath) throw new Error('no render produced')

  return {
    kind: settled.kind,
    program: settled.program,
    heroPng: readFileSync(heroPath),
    heroPath,
    geometryHash: render.geometryHash,
    fidelityScore: render.fidelityScore,
    yr: render.yr,
    built: settled.built,
    compiled: settled.compiled,
    settledMm: settled.settledMm,
    totalStitches: settled.totalStitches,
    attempts: authored.attempts,
    design: authored.design,
    fingerprint: settled.fingerprint,
  }
}

/** A program that has been compiled, audited, measured and had its size declared. */
export interface SettledCrochetProgram {
  kind: 'piece' | 'amigurumi'
  program: CrochetProgram | CompositionProgram
  settledMm: { width: number; height: number }
  totalStitches: number
  fingerprint: string
  built: BuiltContinuous | null
  compiled: CompiledComposition | null
}

/**
 * THE SIZE-CONSISTENCY STEP, split out so it runs BEFORE anything is spent.
 *
 * The pattern declares the size the geometry actually settled to, never the size
 * the brief hoped for, because the hero is this exact fabric and the claim on
 * the page has to be the same object (STITCH_ENGINE.md §8e-3). Doing it here
 * rather than inside the render means a candidate's declared size, stitch count
 * and construction fingerprint all exist before a Fargate task is launched — so
 * the duplicate guard can refuse a repeat for free.
 */
export function settleCrochetProgram(authored: AuthoredProgram): SettledCrochetProgram {
  if (authored.kind === 'amigurumi') {
    const program = authored.program as CompositionProgram
    const compiled = compileComposition(program)
    if (compiled.problems.length) throw new Error(`audit failed: ${compiled.problems[0]}`)
    const size = compositionSizeMm(compiled)
    program.finishedSizeMm = { width: Math.round(size.width), height: Math.round(size.height) }
    const yr = compositionYarnRadiusMm(program)
    program.gaugeText = `${Math.round(100 / (SC_STITCH_PITCH_YR * yr))} dc x ${Math.round(100 / (SC_ROW_PITCH_YR * yr))} rounds = 10 cm in double crochet (UK terms), worked tightly in a spiral so the stuffing does not show`
    return {
      kind: 'amigurumi',
      program,
      settledMm: { width: size.width, height: size.height },
      totalStitches: program.parts.reduce((a, p) => a + p.rounds.reduce((x, y) => x + y, 0), 0),
      fingerprint: programFingerprint(program),
      built: null,
      compiled,
    }
  }

  const first = compileRelaxAudit(authored.program as CrochetProgram)
  if (first.problems.length) throw new Error(`audit failed: ${first.problems[0]}`)
  const settled = settledSizeMm(first.built)
  const program = declareSizeAndGauge(authored.program as CrochetProgram, settled)
  return {
    kind: 'piece',
    program,
    settledMm: settled,
    totalStitches: countStitches(program),
    fingerprint: programFingerprint(program),
    built: first.built,
    compiled: null,
  }
}

/** Stamp the settled size and the gauge that follows from it onto a program. */
export function declareSizeAndGauge(
  program: CrochetProgram,
  settled: { width: number; height: number },
): CrochetProgram {
  if (program.form === 'grid' && program.gridWidth && program.grid?.length) {
    // The tapestry helper already does exactly this arithmetic; reuse it so the
    // two paths cannot state gauge differently.
    if ((program.grid ?? []).some((r) => r.cellColours?.length)) return declareSettledSize(program, settled)
    const cols = program.gridWidth
    const rows = program.grid.length
    const stitchesPer10cm = Math.max(1, Math.round(100 / (settled.width / cols)))
    const rowsPer10cm = Math.max(1, Math.round(100 / (settled.height / rows)))
    return {
      ...program,
      finishedSizeMm: { width: Math.round(settled.width), height: Math.round(settled.height) },
      gaugeText: `${stitchesPer10cm} sts x ${rowsPer10cm} rows = 10 cm (UK terms) in ${program.yarnWeight ?? 'worsted'}`,
    }
  }
  // Round work. A stitch's width is the outermost round's circumference divided
  // by its count; a round's pitch is measured along the RADIUS, not across the
  // whole piece, so a disc of N rounds spans N round-pitches from centre to
  // edge and 2N across.
  const rounds = program.rounds ?? []
  const widest = rounds.length ? Math.max(...rounds) : 6
  const perStitch = (Math.PI * settled.width) / Math.max(1, widest)
  const perRound =
    program.form === 'disc'
      ? settled.width / (2 * Math.max(1, rounds.length))
      : settled.height / Math.max(1, rounds.length)
  return {
    ...program,
    finishedSizeMm: { width: Math.round(settled.width), height: Math.round(settled.height) },
    gaugeText: `${Math.max(1, Math.round(100 / perStitch))} dc x ${Math.max(1, Math.round(100 / perRound))} rounds = 10 cm (UK terms) in ${program.yarnWeight ?? 'worsted'}`,
  }
}

function countStitches(program: CrochetProgram): number {
  if (program.form === 'grid') return (program.gridWidth ?? 0) * (program.grid?.length ?? 0)
  if (program.rounds) return program.rounds.reduce((a, b) => a + b, 0)
  return (program.foundation ?? 0) * (program.rows?.length ?? 0)
}

// ── Publishing ──────────────────────────────────────────────────────────────

export interface PublishContext {
  bulkRunId?: string | null
  gate: { verdict: string; reasons: string[] }
  attempt?: number
  /**
   * PRIVATE or PUBLIC. The catalogue lane publishes PUBLIC into a category that
   * is still hidden site-wide, so a published pattern fills the shelf without
   * reaching a customer; a proof run publishes PRIVATE so the rows are visible
   * to nobody but an admin and can be cleaned up without a takedown.
   */
  visibility?: Visibility
  /**
   * Who judged the hero. `'session'` is a Claude session on the Max plan reading
   * the contact sheet and writing verdicts.json; the historical value is the
   * server-side vision gate.
   */
  judgedBy?: 'session' | 'vision-gate'
  /** The routine run that produced this pattern, for provenance. */
  routineRunId?: string | null
  /** The rubric the session ticked, box by box. */
  rubric?: SessionVerdict['rubric']
}

export interface PublishedCrochetGem {
  patternId: string
  slug: string
  publicUrl: string
  shelf: string
  geometryHash: string
  fidelityScore: number | null
}

/** A crochet pattern is never published where it cannot be gated. */
export class CrochetIncompleteError extends Error {
  readonly result: CrochetCompletenessResult
  constructor(result: CrochetCompletenessResult) {
    super(`crochet pattern is not complete: ${result.reasons.slice(0, 3).join('; ')}`)
    this.name = 'CrochetIncompleteError'
    this.result = result
  }
}

const DIFFICULTY: Record<string, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'> = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED',
  showpiece: 'ADVANCED',
}

const SHAPE_FOR_SHELF: Record<string, string> = {
  coaster: 'HOMEWARE',
  dishcloth: 'HOMEWARE',
  potholder: 'HOMEWARE',
  pincushion: 'HOMEWARE',
  'motif-granny-square': 'MOTIF',
  bookmark: 'DECOR',
  'wall-hanging': 'DECOR',
  ornament: 'DECOR',
  headband: 'WEARABLE_ACCESSORY',
  amigurumi: 'AMIGURUMI',
  doll: 'AMIGURUMI',
  'animal-toy': 'AMIGURUMI',
  'baby-toy-lovey': 'AMIGURUMI',
}

/** Roughly how long the piece takes. A steady crocheter works about 400
 *  stitches an hour; a beginner fewer, an experienced one more, so this is the
 *  honest middle rounded up to whole hours. */
export function estimateHours(totalStitches: number): number {
  return Math.max(1, Math.ceil(totalStitches / 400))
}

/**
 * Publish a gate-passed crochet gem: house designer, a shelf from the canonical
 * list, a COMPLETE row, then the loom's own persist step to attach the exact
 * hero and write back the derived faces.
 *
 * SHELF DISCIPLINE, as cross-stitch has it: the shelf must be one of the
 * canonical crochet item types, and the publisher refuses anything else, so a
 * fragmented sibling shelf can never appear.
 *
 * COMPLETENESS: the assembled row goes through
 * `checkCrochetPatternCompleteness` BEFORE anything is written. A row that
 * fails throws — it is not published with a flag, and it is not held for
 * review.
 */
export async function publishCrochetGem(
  brief: CrochetBrief,
  candidate: CrochetCandidate,
  ctx: PublishContext,
): Promise<PublishedCrochetGem> {
  const shelf = CROCHET_SHELF_BY_SLUG[brief.shelf]
  if (!shelf) {
    throw new Error(
      `publishCrochetGem: "${brief.shelf}" is not a canonical crochet shelf — refusing to publish`,
    )
  }

  const designer = await ensureHouseDesigner()
  const cat = await prisma.category.findUnique({ where: { slug: 'crochet' }, select: { id: true } })
  if (!cat) throw new Error('no crochet category')
  const sub = await prisma.subCategory.upsert({
    where: { categoryId_slug: { categoryId: cat.id, slug: shelf.slug } },
    create: { categoryId: cat.id, slug: shelf.slug, name: shelf.name, order: 50 },
    update: {},
    select: { id: true },
  })

  const row = await buildPatternRow(brief, candidate, { designerId: designer.id, subCategoryId: sub.id })

  // THE COMPLETENESS GATE. Binary: a row that fails is never written.
  const completeness = checkCrochetPatternCompleteness({ ...row, subCategorySlug: shelf.slug })
  if (completeness.blocked) throw new CrochetIncompleteError(completeness)

  const generationMeta = {
    bulkRunId: ctx.bulkRunId ?? null,
    brief: {
      shelf: brief.shelf,
      treatment: brief.treatment,
      look: brief.brief.look,
      territory: brief.brief.territory,
      palette: brief.brief.palette,
      size: brief.brief.size,
      difficulty: brief.brief.difficulty,
      concept: brief.subject,
      source: brief.source,
      plannerMode: brief.plannerMode,
      dressed: brief.dressed,
    },
    design: candidate.design,
    gate: ctx.gate,
    judgedBy: ctx.judgedBy ?? 'session',
    routineRunId: ctx.routineRunId ?? null,
    rubric: ctx.rubric ?? null,
    programFingerprint: candidate.fingerprint,
    geometryHash: candidate.geometryHash,
    fidelityScore: candidate.fidelityScore,
    settledSizeMm: candidate.settledMm,
    attempts: candidate.attempts,
    designAttempt: ctx.attempt ?? 1,
    publishedBy: 'crochet-autopilot-session',
    at: new Date().toISOString(),
  }

  const common = {
    ...row,
    difficulty: row.difficulty as never,
    format: row.format as never,
    shapeCategory: row.shapeCategory as never,
    bodyShape: row.bodyShape as never,
    rowsStructured: row.rowsStructured as unknown as object,
    chartData: (row.chartData ?? undefined) as object | undefined,
    pieces: (row.pieces ?? undefined) as object | undefined,
    buildOrder: (row.buildOrder ?? undefined) as unknown as object | undefined,
    loomProgram: candidate.program as unknown as object,
    generationMeta: generationMeta as unknown as object,
    subjectKey: brief.subjectKey,
    programFingerprint: candidate.fingerprint,
    bulkRunId: ctx.bulkRunId ?? null,
    premium: false,
    ownerUserId: null,
    visibility: ctx.visibility ?? Visibility.PUBLIC,
    publishedAt: new Date(),
  }

  const pattern = await prisma.crochetPattern.upsert({
    where: { slug: brief.slug },
    create: { slug: brief.slug, ...common },
    update: common,
    select: { id: true },
  })

  // The loom's own persist step attaches the exact hero: uploads it, creates
  // its Media, and writes back every loom* field. The rows and chart we already
  // derived are handed to it so it does not re-derive a poorer version.
  const persist = (await import('../../../../../scripts/render-pattern-on-publish')) as unknown as PersistModule
  const publicUrl = await persist.persistPatternRender(
    {
      patternId: pattern.id,
      slug: brief.slug,
      name: brief.name,
      kind: candidate.kind === 'amigurumi' ? 'composition' : 'flat',
      program: candidate.program,
      built: candidate.built,
      compiled: candidate.compiled,
      yr: candidate.yr,
      geometryHash: candidate.geometryHash,
      storedHash: null,
      problems: [],
      action: 'RENDER',
    },
    {
      heroPath: candidate.heroPath,
      fidelityScore: candidate.fidelityScore,
      yr: candidate.yr,
      rowsStructured: row.rowsStructured,
      chartData: row.chartData ?? undefined,
    },
  )

  // Search: one document, upserted now, so a bulk row is findable without
  // waiting for the next full reindex.
  const { syncCrochetPatternById } = await import('@/lib/search-sync')
  await syncCrochetPatternById(pattern.id)

  return {
    patternId: pattern.id,
    slug: brief.slug,
    publicUrl,
    shelf: shelf.slug,
    geometryHash: candidate.geometryHash,
    fidelityScore: candidate.fidelityScore,
  }
}

/** What one judged candidate came to. */
export type JudgedOutcome =
  | { outcome: 'published'; gem: PublishedCrochetGem }
  | { outcome: 'killed'; reasons: string[] }
  | { outcome: 'duplicate'; of: string; reason: string }
  | { outcome: 'incomplete'; reasons: string[] }

/**
 * Everything a candidate goes through AFTER the session has judged its hero:
 * the duplicate guard, then the publisher with its completeness gate.
 *
 * The judgement itself is not here and cannot be — it is a session reading a
 * contact sheet. What IS here is every mechanical refusal that has to hold
 * whatever the judge said: a PASS on a pattern the catalogue already has is
 * still a duplicate, and a PASS on a row missing its gauge is still incomplete.
 */
export async function publishJudgedCrochetCandidate(
  brief: CrochetBrief,
  candidate: CrochetCandidate,
  verdict: SessionVerdict,
  ctx: Omit<PublishContext, 'gate' | 'rubric'>,
): Promise<JudgedOutcome> {
  if (verdict.verdict !== 'PASS') {
    return { outcome: 'killed', reasons: verdict.reasons }
  }

  // The session judged one hero against the batch in front of it. It cannot see
  // that this repeats something published in July, by idea or by construction.
  const catalogue = await loadCrochetCatalogue()
  const hit = findCrochetDuplicate(
    { subjectKey: brief.subjectKey, programFingerprint: candidate.fingerprint },
    catalogue,
  )
  if (hit) return { outcome: 'duplicate', of: hit.slug, reason: hit.reason }

  try {
    const gem = await publishCrochetGem(brief, candidate, {
      ...ctx,
      gate: { verdict: 'keep', reasons: verdict.reasons },
      rubric: verdict.rubric,
    })
    return { outcome: 'published', gem }
  } catch (err) {
    // A row that fails the completeness gate is CULLED, not published with a
    // flag and not held for review.
    if (err instanceof CrochetIncompleteError) {
      return { outcome: 'incomplete', reasons: err.result.reasons.slice(0, 3) }
    }
    throw err
  }
}

/**
 * Every field the locked pattern template needs, as one typed object — the
 * exact shape that is written to the row AND the exact shape the completeness
 * gate is run against, so the two can never check different things.
 */
export interface CrochetPatternRowData {
  name: string
  description: string
  designerId: string
  subCategoryId: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedHours: number
  primaryYarnWeightId: string | null
  primaryHookId: string | null
  gaugeText: string
  finishedSizeText: string
  terminologyConvention: string
  format: 'WRITTEN_ONLY' | 'WRITTEN_AND_CHART'
  shapeCategory: string
  bodyShape: string
  rowsStructured: PatternRow[]
  chartData: object | null
  pieces: object | null
  buildOrder: string[] | null
  pieceCount: number
  notions: string[]
  safetyNotes: string | null
  abbreviationsUsed: string[]
  specialStitchesUsed: string[]
  craftStitchSlugs: string[]
  craftTechniqueTags: string[]
  yardageBySize: object
}

/**
 * Assemble every field the locked pattern template needs, from the program.
 * Split out so the completeness gate can be run against the exact row that
 * would be written, not an approximation of it.
 */
export async function buildPatternRow(
  brief: CrochetBrief,
  candidate: CrochetCandidate,
  ids: { designerId: string; subCategoryId: string },
): Promise<CrochetPatternRowData> {
  const isComposition = candidate.kind === 'amigurumi'
  const program = candidate.program
  const weight = (('yarnWeight' in program ? program.yarnWeight : undefined) ?? 'worsted') as YarnWeight
  const yarnSlug = LOOM_WEIGHT_TO_YARN_SLUG[weight]
  const hookMm = ('hookMm' in program ? program.hookMm : undefined) ?? hookForWeight(weight)

  const [yarn, hook] = await Promise.all([
    prisma.yarnWeight.findFirst({ where: { slug: yarnSlug }, select: { id: true, canonicalName: true } }),
    prisma.crochetHook.findFirst({ where: { mmSize: hookMm }, select: { id: true } }),
  ])

  const { shadeNames, palette } = shadeNamesFor(program)

  let rowsStructured: PatternRow[]
  let chartData: object | null = null
  let pieces: object | null = null
  let buildOrder: string[] | null = null
  let pieceCount = 1
  let notions: string[]
  let safetyNotes: string | null = null

  if (isComposition) {
    const comp = program as CompositionProgram
    const structured = compositionRowsStructured(comp) as PatternRow[]
    rowsStructured = structured
    const parts = compositionPieces(comp)
    pieces = parts.map((p) => ({
      name: p.label,
      sectionLabel: p.section,
      makeQuantity: p.makeQuantity,
      stuffing: 'firm',
      stitchCountTotal: p.stitchCount,
      rounds: p.rounds,
    }))
    buildOrder = compositionBuildOrder(comp)
    pieceCount = parts.length
    notions = compositionNotions(comp)
    const eyes = (comp.props ?? []).some((p) => /eye/i.test(p.name))
    safetyNotes = eyes
      ? 'Safety eyes are a choking hazard. For a child under three, embroider the eyes and nose in yarn instead and make sure every seam is closed.'
      : 'Sew every seam closed and check them before giving the finished toy to a small child.'
  } else {
    const piece = program as CrochetProgram
    rowsStructured = crochetRowsStructured(piece, shadeNames)
    chartData = programToChart(piece)
    notions = ['Tapestry needle for weaving in the ends', 'Stitch markers']
    if (piece.form === 'sphere') notions.push('Toy stuffing')
    if (Object.keys(palette).length > 1) notions.push('A yarn bobbin for each colour')
    if (CROCHET_TOY_SHELVES.has(brief.shelf)) {
      safetyNotes = 'Sew every seam closed and check them before giving the finished toy to a small child.'
    }
  }

  const stitchIds = stitchIdsIn(program)
  const craftStitchSlugs = [
    ...new Set(stitchIds.map((id) => STITCH_SLUG[id]).filter((slug): slug is string => Boolean(slug))),
  ]
  if (isComposition || ('form' in program && (program.form === 'disc' || program.form === 'sphere'))) {
    craftStitchSlugs.push('crochet-magic-ring')
  }
  const abbreviationsUsed = [
    ...new Set(rowsStructured.flatMap((r) => abbreviationsIn(r.instruction))),
  ]
  // The stitches that need an explainer block at the top of the pattern page.
  const specialStitchesUsed: string[] = []
  if (stitchIds.includes('fpdc')) specialStitchesUsed.push('FPtr')
  if (stitchIds.includes('bpdc')) specialStitchesUsed.push('BPtr')
  if (stitchIds.includes('scblo')) specialStitchesUsed.push('dc-blo')
  if (stitchIds.includes('scflo')) specialStitchesUsed.push('dc-flo')

  const size = candidate.settledMm
  const gaugeText = ('gaugeText' in program ? program.gaugeText : undefined) ?? ''

  return {
    name: brief.name,
    description: describe(brief, candidate, palette, shadeNames),
    designerId: ids.designerId,
    subCategoryId: ids.subCategoryId,
    difficulty: DIFFICULTY[brief.brief.difficulty] ?? ('INTERMEDIATE' as const),
    estimatedHours: estimateHours(candidate.totalStitches),
    primaryYarnWeightId: yarn?.id ?? null,
    primaryHookId: hook?.id ?? null,
    gaugeText,
    finishedSizeText: finishedSizeSentence(size),
    terminologyConvention: 'uk',
    format: isComposition ? ('WRITTEN_ONLY' as const) : ('WRITTEN_AND_CHART' as const),
    shapeCategory: SHAPE_FOR_SHELF[brief.shelf] ?? 'DECOR',
    bodyShape: isComposition
      ? 'COMPOSITE'
      : 'form' in program && program.form === 'sphere'
        ? 'SPHERE'
        : 'NONE',
    rowsStructured,
    chartData,
    pieces,
    buildOrder,
    pieceCount,
    notions,
    safetyNotes,
    abbreviationsUsed,
    specialStitchesUsed,
    craftStitchSlugs,
    craftTechniqueTags: [],
    yardageBySize: { default: estimateYardage(candidate.totalStitches, candidate.yr) },
  }
}

/** Rough metres of yarn: a stitch eats about four yarn diameters of length. */
export function estimateYardage(totalStitches: number, yr: number): number {
  return Math.max(10, Math.round((totalStitches * yr * 2 * 4) / 1000))
}

/** The yarn shade names a palette resolves to, in use order. */
function shadeNamesFor(program: CrochetProgram | CompositionProgram): {
  shadeNames: Record<string, string>
  palette: Record<string, string>
} {
  const palette: Record<string, string> =
    'palette' in program && program.palette
      ? { ...program.palette }
      : 'parts' in program
        ? Object.fromEntries(
            [...new Set(program.parts.map((p) => p.colourHex))].map((hex, i) => [`yarn-${i + 1}`, hex]),
          )
        : { main: ('colourHex' in program ? program.colourHex : undefined) ?? '#c98a5e' }
  const keys = Object.keys(palette)
  // `nameYarnColours` is pure and shared with the Studio's tapestry key, so a
  // machine-named palette reads exactly like a maker's own. Where the DESIGNER
  // named the colour ("rust", "duck-egg") that name wins instead: it is the
  // word the pattern is titled after, and a description saying "brick" under a
  // title saying rust reads as two different patterns.
  const fallback = nameYarnColours(keys.map((k) => palette[k]!))
  const named = keys.map((key, i) => (isMeaningfulColourKey(key) ? prettyColourKey(key) : fallback[i]!))
  return {
    shadeNames: Object.fromEntries(keys.map((k, i) => [k, named[i]!])),
    palette,
  }
}

/** A colour key a person chose, rather than one a converter generated. */
function isMeaningfulColourKey(key: string): boolean {
  return /^[a-z][a-z-]{2,}$/i.test(key) && !/^yarn-\d+$/i.test(key) && !/^c\d+$/i.test(key)
}

/** "duck-egg" -> "duck egg". */
function prettyColourKey(key: string): string {
  return key.replace(/-+/g, ' ')
}

/**
 * The pattern's description: what the thing is, what it is worked in, how big
 * it comes out. Plain sentences, no long dashes, nothing the voice gate bans.
 */
function describe(
  brief: CrochetBrief,
  candidate: CrochetCandidate,
  palette: Record<string, string>,
  shadeNames: Record<string, string>,
): string {
  const shades = Object.keys(palette).map((k) => shadeNames[k]!.toLowerCase())
  // A tapestry showpiece can carry two dozen yarns, and listing all of them in
  // the description reads as a spreadsheet. Past six, name the first few and
  // leave the rest to the yarn list on the page.
  const colourLine =
    shades.length === 1
      ? `Worked in one shade, ${shades[0]}.`
      : shades.length <= 6
        ? `Worked in ${shades.length} shades: ${shades.slice(0, -1).join(', ')} and ${shades[shades.length - 1]}.`
        : `Worked in ${shades.length} shades, led by ${shades.slice(0, 3).join(', ')}.`
  const sizeLine =
    candidate.kind === 'amigurumi'
      ? `The finished toy stands about ${CM(candidate.settledMm.height)} cm tall.`
      : `It comes out about ${CM(candidate.settledMm.width)} by ${CM(candidate.settledMm.height)} cm.`
  // An amigurumi has no chart on purpose (a chart is a single-piece shape), so
  // the closing line must not promise one.
  const roundWork =
    candidate.kind !== 'amigurumi' &&
    'form' in candidate.program &&
    (candidate.program.form === 'disc' || candidate.program.form === 'sphere')
  const closingLine =
    candidate.kind === 'amigurumi'
      ? 'Written in UK terms with a stitch count at the end of every round, each piece worked separately and sewn on.'
      : `Written in UK terms with a stitch count at the end of every ${roundWork ? 'round' : 'row'}, and the chart is drawn from the same stitch program as the photograph.`
  const concept = brief.subject.replace(/\s+/g, ' ').trim().replace(/\.$/, '')
  return `${concept.charAt(0).toUpperCase()}${concept.slice(1)}. ${colourLine} ${sizeLine} ${closingLine}`
}

/** The catalogue as fingerprints, for the publish-path duplicate guard. */
export { findCrochetDuplicate, loadCrochetCatalogue, programFingerprint }

/** The palette hexes a brief's design should be drawn from. */
export function paletteHexesFor(paletteSlug: string): string[] {
  return PALETTES.find((p) => p.slug === paletteSlug)?.hexes ?? PALETTES[0]!.hexes
}

/** The geometry hash of a compiled piece, for logging. */
export { geometryHash, programYarnRadiusMm }
