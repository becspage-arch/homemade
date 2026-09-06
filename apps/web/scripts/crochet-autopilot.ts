/**
 * THE CROCHET AUTOPILOT, as stages a Claude session drives.
 *
 * Crochet used to fill itself with three Anthropic API calls per pattern: one to
 * plan the briefs, one to author the design recipe, one to judge the finished
 * hero. Rebecca's standing rule is that all model work — planning, authoring,
 * judging — runs on her Claude Max plan inside a cloud session or routine, and
 * never as per-token API spend. So those three calls are gone, and this CLI is
 * what is left: every DETERMINISTIC stage, with a file-shaped join where a model
 * used to sit.
 *
 *   context   what to fill and what to avoid  →  the session writes briefs.json
 *                                                 and designs.json
 *   expand    designs → programs, loom audit, size, duplicate guard
 *   render    Fargate base render → Fal finish → fidelity gate → contact sheets
 *                                                 →  the session writes verdicts.json
 *   publish   verdicts → completeness gate → published rows
 *   estimate  what the deterministic half costs, per pattern and to fill
 *
 * Every stage is idempotent and re-runnable, and a manifest in the run directory
 * ties them together: `expand` writes what it built, `render` adds what it
 * rendered and what it spent, `publish` adds what it wrote. Re-running a stage
 * picks up where it stopped rather than paying twice.
 *
 * USAGE
 *   cd apps/web
 *   npx tsx --conditions=react-server scripts/crochet-autopilot.ts <stage> [flags]
 *
 *   context  --run <dir> [--count 8] [--out plan-context.json]
 *   expand   --run <dir> --briefs briefs.json --designs designs.json [--out candidates]
 *   render   --run <dir> [--max-spend 2.50] [--only <slug>]
 *   publish  --run <dir> --verdicts verdicts.json [--visibility private|public]
 *   estimate [--count 8]
 *
 * `--conditions=react-server` is load-bearing: the bulk modules carry Next's
 * `server-only` marker, which throws outside a server component unless that
 * export condition resolves it to the empty module.
 *
 * Needs `.env.credentials` for the database, AWS and Fal. It never needs an
 * Anthropic key, and nothing here will make an Anthropic call — the modules that
 * used to throw if it were missing now throw if it is REACHED FOR.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join, basename } from 'node:path'

import { loadCredentials } from './loom-hybrid-fal'
// Type-only: erased at compile, so the server-only modules still arrive through
// the dynamic imports below rather than at load time.
import type {
  ManifestCandidate,
  RunManifest,
} from '../src/lib/studio/generation/bulk/crochet-session'

loadCredentials()

// ── Arguments ───────────────────────────────────────────────────────────────

type Stage = 'context' | 'expand' | 'render' | 'publish' | 'estimate'

const STAGES: Stage[] = ['context', 'expand', 'render', 'publish', 'estimate']

interface Args {
  stage: Stage
  run: string
  count: number
  briefs?: string
  designs?: string
  verdicts?: string
  out?: string
  only?: string
  maxSpend?: number
  visibility: 'PRIVATE' | 'PUBLIC'
  force: boolean
}

function parseArgs(argv: string[]): Args {
  const stage = argv[0] as Stage
  if (!STAGES.includes(stage)) {
    throw new Error(`unknown stage "${argv[0] ?? ''}" — one of: ${STAGES.join(', ')}`)
  }
  const flag = (name: string): string | undefined => {
    const i = argv.indexOf(`--${name}`)
    return i >= 0 ? argv[i + 1] : undefined
  }
  const vis = (flag('visibility') ?? 'public').toUpperCase()
  if (vis !== 'PRIVATE' && vis !== 'PUBLIC') throw new Error('--visibility is private or public')
  const maxSpendRaw = flag('max-spend')
  return {
    stage,
    run: resolve(flag('run') ?? join(process.cwd(), '..', '..', '.loom-scratch', 'crochet', 'routine')),
    count: Number(flag('count')) || 8,
    briefs: flag('briefs'),
    designs: flag('designs'),
    verdicts: flag('verdicts'),
    out: flag('out'),
    only: flag('only'),
    maxSpend: maxSpendRaw === undefined ? undefined : Number(maxSpendRaw),
    visibility: vis,
    force: argv.includes('--force'),
  }
}

// ── The run directory ───────────────────────────────────────────────────────

const MANIFEST = 'manifest.json'

function manifestPath(runDir: string): string {
  return join(runDir, MANIFEST)
}

function candidatesDir(runDir: string, out?: string): string {
  return out ? resolve(out) : join(runDir, 'candidates')
}

function heroesDir(runDir: string): string {
  return join(runDir, 'heroes')
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

// ── The stages ──────────────────────────────────────────────────────────────

/**
 * CONTEXT — everything the planner prompt used to send to a model, written to a
 * file so a session can plan the batch itself.
 *
 * Nothing here decides anything: it reads the live catalogue, works out which
 * buildable shelf is furthest from its target, and states the avoid list, the
 * design axes and the spend position. The judgement is the session's.
 */
async function stageContext(args: Args): Promise<void> {
  const { crochetPlanContext } = await import('../src/lib/studio/generation/bulk/run')
  const { crochetPlanContextPayload } = await import('../src/lib/studio/generation/bulk/crochet-planner')
  const { crochetSpendWindow, overCrochetCap, approxCrochetSpend, CROCHET_DAILY_RENDER_CAP, CROCHET_DAILY_ILLUSTRATION_CAP } =
    await import('../src/lib/studio/generation/bulk/spend-guard')
  const { isAutopilotEnabled } = await import('../src/lib/studio/generation/bulk/autopilot-state')
  const { emptyManifest, parseManifest } = await import('../src/lib/studio/generation/bulk/crochet-session')
  const { estimateCrochetCost } = await import('../src/lib/studio/generation/bulk/crochet-cost')

  mkdirSync(args.run, { recursive: true })

  // Anything already in flight in this run counts as taken: re-running `context`
  // mid-batch must not offer the session a backlog entry it has already
  // commissioned, or the duplicate guard eats a Fargate task to say so.
  const priorManifest = existsSync(manifestPath(args.run)) ? parseManifest(readJson(manifestPath(args.run))) : null
  const inFlightSubjectKeys =
    priorManifest && priorManifest.ok
      ? priorManifest.value.candidates.filter((c) => c.stage !== 'culled').map((c) => c.subjectKey)
      : []

  const plan = await crochetPlanContext(args.count)
  const payload = crochetPlanContextPayload({
    batchSize: args.count,
    counts: plan.counts,
    avoidSubjectKeys: plan.avoidSubjectKeys,
    inFlightSubjectKeys,
  })

  const [window, enabled] = await Promise.all([
    crochetSpendWindow(),
    isAutopilotEnabled('crochet').catch(() => false),
  ])
  const capped = overCrochetCap(window)

  const context = {
    ...payload,
    /** The pre-flight marker the routine reads. False means do not fire. */
    routineEnabled: enabled,
    spend: {
      windowSince: window.since.toISOString(),
      rendersUsed: window.generations,
      renderCap: CROCHET_DAILY_RENDER_CAP,
      illustrationsUsed: window.proGenerations,
      illustrationCap: CROCHET_DAILY_ILLUSTRATION_CAP,
      approxUsd: Number(approxCrochetSpend(window).toFixed(2)),
      /** Non-null means a render started now would be refused. */
      cappedReason: capped,
      /** What this batch is forecast to cost if every candidate renders once. */
      forecastUsd: Number(estimateCrochetCost(args.count, { passRate: 1 }).totalUsd.toFixed(2)),
    },
  }

  const outPath = args.out ? resolve(args.out) : join(args.run, 'plan-context.json')
  writeJson(outPath, context)

  // The manifest is created here so every later stage has one to write through.
  // The offered backlog ids go in now: what the batch was shown is as much part
  // of the audit trail as what it took.
  const offered = payload.backlog.offeredIds
  const manifest =
    priorManifest && priorManifest.ok
      ? {
          ...priorManifest.value,
          batchSize: args.count,
          backlogOffered: [...new Set([...priorManifest.value.backlogOffered, ...offered])],
          stages: { ...priorManifest.value.stages, context: new Date().toISOString() },
        }
      : {
          ...emptyManifest(runIdFor(args.run), args.count),
          backlogOffered: offered,
          stages: { context: new Date().toISOString() },
        }
  writeJson(manifestPath(args.run), manifest)

  console.log(`Plan context: ${outPath}`)
  console.log(`Run id: ${manifest.runId}`)
  console.log(`Routine marker: ${enabled ? 'ENABLED' : 'OFF — do not fire'}`)
  console.log(
    `Shelf quota: ${payload.shelfQuota.map((q) => `${q.slug} x${q.briefs} (${q.published}/${q.target})`).join(', ')}`,
  )
  console.log(`Avoid list: ${payload.avoidSubjectKeys.length} subject keys already in the catalogue`)
  console.log(
    `Backlog: ${payload.backlog.remaining} buildable ideas still queued; ${payload.backlog.next.length} offered as the head of the queue`,
  )
  for (const shelf of payload.backlog.byShelf) {
    console.log(
      `  ${shelf.shelf}: ${shelf.dry ? 'QUEUE DRY — invent for this shelf' : `${shelf.ideas.map((i) => i.id).join(', ')}`}`,
    )
  }
  console.log(
    `Spend: ${window.generations}/${CROCHET_DAILY_RENDER_CAP} renders in 24h${capped ? ` — CAPPED: ${capped}` : ''}`,
  )
}

/** A run id from the directory name plus the day, stable across re-runs. */
function runIdFor(runDir: string): string {
  return `${basename(runDir)}-${new Date().toISOString().slice(0, 10)}`
}

/**
 * EXPAND — the session's designs become stitch programs, or come back refused.
 *
 * Four gates, none of which cost anything: the design schema, the deterministic
 * expansion into a program the engine is measured on, the loom audit of the
 * compiled geometry, and the duplicate guard against the live catalogue and the
 * rest of the batch. A candidate that fails carries its problems into the
 * manifest in the loom's own words, and the session revises the design and runs
 * `expand` again; after MAX_DESIGN_ATTEMPTS it is culled.
 */
async function stageExpand(args: Args): Promise<void> {
  if (!args.briefs || !args.designs) throw new Error('expand needs --briefs briefs.json --designs designs.json')

  const session = await import('../src/lib/studio/generation/bulk/crochet-session')
  const { buildCrochetProgram, settleCrochetProgram, buildTapestryCandidate } = await import(
    '../src/lib/studio/generation/bulk/crochet'
  )
  const { loadCrochetCatalogue, findCrochetDuplicate } = await import(
    '../src/lib/studio/generation/bulk/crochet-dedupe'
  )
  const { CROCHET_SHELF_BY_SLUG } = await import('../src/lib/studio/generation/categories')
  const { envelopeFor } = await import('../src/lib/studio/generation/bulk/crochet-forms')
  const { prisma } = await import('@homemade/db')

  const manifest0 = loadManifest(args.run, session)
  const briefsRaw = session.parseBriefs(readJson(resolve(args.briefs)))
  if (!briefsRaw.ok) return fail(briefsRaw.errors)
  const designsRaw = session.parseDesigns(readJson(resolve(args.designs)))
  if (!designsRaw.ok) return fail(designsRaw.errors)

  const outDir = candidatesDir(args.run, args.out)
  mkdirSync(outDir, { recursive: true })

  let manifest = manifest0
  const catalogue = await loadCrochetCatalogue()
  const batchFingerprints = new Map<string, string>()
  const batchSubjects = new Map<string, string>()

  for (const brief of briefsRaw.value) {
    const shelf = CROCHET_SHELF_BY_SLUG[brief.shelf]
    const prior = session.findCandidate(manifest, brief.slug)
    const attempt = (prior?.expandAttempts ?? 0) + 1

    const record = (patch: Partial<ManifestCandidate>): void => {
      manifest = session.upsertCandidate(manifest, {
        slug: brief.slug,
        name: brief.name,
        shelf: brief.shelf,
        treatment: brief.treatment,
        subjectKey: session.toCrochetBrief(brief, shelf?.name ?? brief.shelf).subjectKey,
        ...(brief.backlogId ? { backlogId: brief.backlogId } : {}),
        stage: 'planned',
        expandAttempts: attempt,
        problems: [],
        ...(prior?.render ? { render: prior.render } : {}),
        ...(prior?.verdict ? { verdict: prior.verdict } : {}),
        ...(prior?.published ? { published: prior.published } : {}),
        ...patch,
      } as ManifestCandidate)
    }

    // A candidate already rendered or published is not re-expanded: the stages
    // are re-runnable, which means idempotent, not repeated.
    if (prior && (prior.stage === 'rendered' || prior.stage === 'published') && !args.force) {
      console.log(`${brief.slug}: already ${prior.stage}, left alone`)
      continue
    }

    if (!shelf) {
      record({ stage: 'culled', problems: [`"${brief.shelf}" is not a canonical crochet shelf`], culledReason: 'unknown shelf' })
      console.error(`${brief.slug}: unknown shelf "${brief.shelf}"`)
      continue
    }
    if (brief.treatment !== 'grid-tapestry' && !envelopeFor(brief.shelf, brief.treatment)) {
      record({
        stage: 'culled',
        problems: [`the loom cannot build a "${brief.treatment}" piece for the ${brief.shelf} shelf`],
        culledReason: 'treatment not buildable on that shelf',
      })
      console.error(`${brief.slug}: ${brief.treatment} is not buildable for ${brief.shelf}`)
      continue
    }

    const full = session.toCrochetBrief(brief, shelf.name)
    const design = designsRaw.value[brief.slug]
    if (!design) {
      record({ stage: 'planned', problems: [`no design for ${brief.slug} in the designs file`] })
      console.error(`${brief.slug}: no design`)
      continue
    }

    try {
      const authored =
        brief.treatment === 'grid-tapestry'
          ? await buildTapestryCandidate(full, design.picture)
          : (() => {
              const built = buildCrochetProgram(full, design, attempt)
              if (!built.ok) throw new ExpandRefused(built.problems)
              return built.authored
            })()

      const settled = settleCrochetProgram(authored)

      // THE SIZE-CONSISTENCY CHECK. The declared size is measured off the
      // relaxed geometry, so it cannot be wrong — but a piece that settles to
      // nothing, or to something absurd, is a broken program rather than a
      // small pattern, and it must not reach a render.
      if (!(settled.settledMm.width > 5) || !(settled.settledMm.height > 5)) {
        throw new ExpandRefused([
          `the piece settles to ${settled.settledMm.width.toFixed(0)} x ${settled.settledMm.height.toFixed(0)} mm, which is not a finished object`,
        ])
      }

      // THE DUPLICATE GUARD, against the catalogue and against this batch.
      const hit = findCrochetDuplicate(
        { subjectKey: full.subjectKey, programFingerprint: settled.fingerprint },
        catalogue,
      )
      if (hit) throw new ExpandRefused([`this repeats ${hit.slug}: ${hit.reason}`])
      const clash = batchFingerprints.get(settled.fingerprint)
      if (clash) throw new ExpandRefused([`the same construction as ${clash} earlier in this batch`])
      const sameIdea = batchSubjects.get(full.subjectKey)
      if (sameIdea) throw new ExpandRefused([`the same idea as ${sameIdea} earlier in this batch`])
      batchFingerprints.set(settled.fingerprint, brief.slug)
      batchSubjects.set(full.subjectKey, brief.slug)

      const candidatePath = join(outDir, `${brief.slug}.json`)
      writeJson(candidatePath, {
        brief: full,
        design: authored.design,
        kind: settled.kind,
        program: settled.program,
        settledMm: settled.settledMm,
        totalStitches: settled.totalStitches,
        fingerprint: settled.fingerprint,
        attempts: attempt,
      })

      record({
        stage: 'expanded',
        problems: [],
        kind: settled.kind,
        fingerprint: settled.fingerprint,
        settledMm: settled.settledMm,
        totalStitches: settled.totalStitches,
        candidatePath,
      })
      console.log(
        `${brief.slug}: built · ${settled.kind} · ${settled.settledMm.width.toFixed(0)}x${settled.settledMm.height.toFixed(0)}mm · ${settled.totalStitches} stitches`,
      )
    } catch (err) {
      const problems =
        err instanceof ExpandRefused ? err.problems : [err instanceof Error ? err.message : String(err)]
      const spent = attempt >= session.MAX_DESIGN_ATTEMPTS
      record({
        stage: spent ? 'culled' : 'planned',
        problems,
        ...(spent ? { culledReason: problems[0] } : {}),
      })
      console.error(
        `${brief.slug}: REFUSED (attempt ${attempt}/${session.MAX_DESIGN_ATTEMPTS})\n  ${problems.join('\n  ')}`,
      )
      if (spent) console.error(`${brief.slug}: out of revisions — culled`)
    }
  }

  // The BulkRun row, created once per run so the admin page sees the batch the
  // same way it sees a cron batch.
  if (!manifest.bulkRunId) {
    const row = await prisma.bulkRun.create({
      data: {
        craft: 'crochet',
        trigger: 'routine',
        requested: manifest.candidates.length,
      },
      select: { id: true },
    })
    manifest = { ...manifest, bulkRunId: row.id }
  } else {
    await prisma.bulkRun.update({
      where: { id: manifest.bulkRunId },
      data: { requested: manifest.candidates.length },
    })
  }

  manifest = { ...manifest, stages: { ...manifest.stages, expand: new Date().toISOString() } }
  writeJson(manifestPath(args.run), manifest)

  const counters = session.manifestCounters(manifest)
  const ready = manifest.candidates.filter((c) => c.stage === 'expanded').length
  console.log(`\n${ready} ready to render, ${counters.culled} culled, of ${counters.requested}.`)
  console.log(
    `From the backlog: ${counters.fromBacklog}; invented: ${counters.invented}${
      counters.invented ? ' (only valid where the shelf queue was dry)' : ''
    }`,
  )
  console.log(`Candidates: ${outDir}`)
  if (manifest.candidates.some((c) => c.stage === 'planned' && c.problems.length)) {
    console.log('Some designs were refused. Fix them in designs.json and run expand again.')
  }
}

class ExpandRefused extends Error {
  readonly problems: string[]
  constructor(problems: string[]) {
    super(problems.join('; '))
    this.name = 'ExpandRefused'
    this.problems = problems
  }
}

/**
 * RENDER — the exact hero, on Fargate, then the Fal finish and the fidelity
 * gate, then a contact sheet per shelf so the session can look at them.
 *
 * Three ceilings guard the spend, in order: the daily render cap and the daily
 * illustration cap already in `spend-guard.ts`, and `--max-spend`, which refuses
 * to START a render that would take this run past a stated budget. The budget
 * ceiling is checked before every render, not once at the top, because a render
 * that has not started has not been paid for.
 */
async function stageRender(args: Args): Promise<void> {
  const session = await import('../src/lib/studio/generation/bulk/crochet-session')
  const { renderCrochetCandidate, fargateRenderWired } = await import('../src/lib/studio/generation/bulk/crochet')
  const { crochetSpendWindow, overCrochetCap } = await import('../src/lib/studio/generation/bulk/spend-guard')
  const { fargateRenderUsd, FAL_CREATIVE_UPSCALE_USD, ILLUSTRATION_USD } = await import(
    '../src/lib/studio/generation/bulk/crochet-cost'
  )
  const { prisma } = await import('@homemade/db')

  if (!fargateRenderWired()) {
    throw new Error('render: LOOM_RENDER!=fargate — the exact-pattern hero render is not wired')
  }

  let manifest = loadManifest(args.run, session)
  const outDir = heroesDir(args.run)
  mkdirSync(outDir, { recursive: true })

  const todo = manifest.candidates.filter(
    (c) => c.stage === 'expanded' && (!args.only || c.slug === args.only) && (args.force || !c.render),
  )
  if (!todo.length) {
    console.log('Nothing to render. (Every expanded candidate already has a hero, or none expanded.)')
  }

  for (const entry of todo) {
    const cost =
      fargateRenderUsd() +
      FAL_CREATIVE_UPSCALE_USD +
      (entry.treatment === 'grid-tapestry' ? ILLUSTRATION_USD : 0)

    // THE BUDGET CEILING, before the spend rather than after it.
    if (args.maxSpend !== undefined && manifest.spentUsd + cost > args.maxSpend) {
      console.warn(
        `${entry.slug}: NOT rendered — it would take this run to $${(manifest.spentUsd + cost).toFixed(2)}, past the --max-spend of $${args.maxSpend.toFixed(2)}`,
      )
      break
    }

    // THE DAILY CAPS, re-read at the point of spending.
    const window = await crochetSpendWindow()
    const capped = overCrochetCap(window, { illustration: entry.treatment === 'grid-tapestry' })
    if (capped) {
      console.warn(`${entry.slug}: NOT rendered — ${capped}`)
      break
    }

    if (!entry.candidatePath || !existsSync(entry.candidatePath)) {
      console.error(`${entry.slug}: no candidate file — run expand again`)
      continue
    }

    const stored = readJson(entry.candidatePath) as {
      brief: Parameters<typeof renderCrochetCandidate>[0]
      design: unknown
      kind: 'piece' | 'amigurumi'
      program: unknown
      attempts: number
    }

    console.log(`\n── ${entry.slug} (${entry.shelf} / ${entry.treatment}) — rendering, this takes minutes ──`)
    try {
      const candidate = await renderCrochetCandidate(
        stored.brief,
        {
          kind: stored.kind,
          program: stored.program as never,
          attempts: stored.attempts,
          design: stored.design as never,
        },
        { outDir },
      )
      manifest = session.upsertCandidate(manifest, {
        ...entry,
        stage: 'rendered',
        render: {
          heroPath: candidate.heroPath,
          geometryHash: candidate.geometryHash,
          fidelityScore: candidate.fidelityScore,
          yr: candidate.yr,
          at: new Date().toISOString(),
          estimatedUsd: Number(cost.toFixed(4)),
        },
      })
      manifest = { ...manifest, spentUsd: Number((manifest.spentUsd + cost).toFixed(4)) }
      writeJson(manifestPath(args.run), manifest)
      if (manifest.bulkRunId) {
        await prisma.bulkRun.update({
          where: { id: manifest.bulkRunId },
          data: {
            generations: { increment: 1 },
            ...(entry.treatment === 'grid-tapestry' ? { proGenerations: { increment: 1 } } : {}),
          },
        })
      }
      console.log(
        `   hero ${candidate.heroPath} · hash ${candidate.geometryHash} · fidelity ${candidate.fidelityScore ?? 'n/a'} · ≈$${cost.toFixed(3)}`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      manifest = session.upsertCandidate(manifest, { ...entry, stage: 'culled', culledReason: `render failed: ${message}`.slice(0, 200) })
      writeJson(manifestPath(args.run), manifest)
      console.error(`   FAILED: ${message}`)
    }
  }

  const sheets = await buildContactSheets(args.run, manifest)
  for (const [group, path] of sheets) {
    manifest = {
      ...manifest,
      candidates: manifest.candidates.map((c) =>
        c.shelf === group && c.render ? { ...c, render: { ...c.render, contactSheet: path } } : c,
      ),
    }
    console.log(`Contact sheet · ${group}: ${path}`)
  }
  manifest = { ...manifest, stages: { ...manifest.stages, render: new Date().toISOString() } }
  writeJson(manifestPath(args.run), manifest)

  console.log(`\nRendered ${manifest.candidates.filter((c) => c.render).length} of ${manifest.candidates.length}.`)
  console.log(`This run has spent about $${manifest.spentUsd.toFixed(2)}.`)
  console.log('Look at every contact sheet, then write verdicts.json and run publish.')
}

/**
 * A contact sheet per shelf: the heroes side by side with their slugs under
 * them, so a session looks at a batch the way a person would rather than
 * opening nine files.
 */
async function buildContactSheets(
  runDir: string,
  manifest: { candidates: { slug: string; shelf: string; render?: { heroPath: string } }[] },
): Promise<[string, string][]> {
  const sharp = (await import('sharp')).default
  const byShelf = new Map<string, { slug: string; heroPath: string }[]>()
  for (const c of manifest.candidates) {
    if (!c.render || !existsSync(c.render.heroPath)) continue
    const list = byShelf.get(c.shelf) ?? []
    list.push({ slug: c.slug, heroPath: c.render.heroPath })
    byShelf.set(c.shelf, list)
  }

  const TILE = 480
  const CAPTION = 34
  const sheetsDir = join(runDir, 'contact-sheets')
  mkdirSync(sheetsDir, { recursive: true })
  const out: [string, string][] = []

  for (const [shelf, items] of byShelf) {
    const cols = Math.min(3, items.length)
    const rows = Math.ceil(items.length / cols)
    const width = cols * TILE
    const height = rows * (TILE + CAPTION)

    const composites: { input: Buffer; top: number; left: number }[] = []
    for (const [i, item] of items.entries()) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const tile = await sharp(item.heroPath)
        .resize(TILE, TILE, { fit: 'contain', background: { r: 250, g: 248, b: 244, alpha: 1 } })
        .png()
        .toBuffer()
      composites.push({ input: tile, top: row * (TILE + CAPTION), left: col * TILE })
      const label = item.slug.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      const caption = Buffer.from(
        `<svg width="${TILE}" height="${CAPTION}"><rect width="100%" height="100%" fill="#faf8f4"/><text x="8" y="23" font-family="monospace" font-size="15" fill="#3b3128">${label}</text></svg>`,
      )
      composites.push({ input: caption, top: row * (TILE + CAPTION) + TILE, left: col * TILE })
    }

    const path = join(sheetsDir, `${shelf}.png`)
    await sharp({
      create: { width, height, channels: 3, background: { r: 250, g: 248, b: 244 } },
    })
      .composite(composites)
      .png()
      .toFile(path)
    out.push([shelf, path])
  }
  return out
}

/**
 * PUBLISH — the session's verdicts become rows, or do not.
 *
 * A candidate with no verdict is skipped: nothing is published unjudged, and an
 * absent verdict is not a quiet PASS. A PASS still has to get past the mechanical
 * refusals that hold whatever the judge said — the duplicate guard and the
 * completeness gate — because a judge can be right about the picture and wrong
 * about the row.
 */
async function stagePublish(args: Args): Promise<void> {
  if (!args.verdicts) throw new Error('publish needs --verdicts verdicts.json')

  const session = await import('../src/lib/studio/generation/bulk/crochet-session')
  const { publishJudgedCrochetCandidate } = await import('../src/lib/studio/generation/bulk/crochet')
  const { summaryLine } = await import('../src/lib/studio/generation/bulk/run-status')
  const { prisma, Visibility } = await import('@homemade/db')

  let manifest = loadManifest(args.run, session)
  const parsed = session.parseVerdicts(readJson(resolve(args.verdicts)))
  if (!parsed.ok) return fail(parsed.errors)
  const verdicts = parsed.value

  const counters = { published: 0, culled: 0, duplicates: 0, errors: 0, skipped: 0 }
  const gems: string[] = []
  const killReasons: string[] = []

  for (const entry of manifest.candidates) {
    if (entry.published && !args.force) {
      console.log(`${entry.slug}: already published, left alone`)
      continue
    }
    if (!entry.render || !entry.candidatePath) {
      counters.skipped++
      console.log(`${entry.slug}: never rendered, skipped`)
      continue
    }
    const verdict = verdicts[entry.slug]
    if (!verdict) {
      counters.skipped++
      console.log(`${entry.slug}: NO VERDICT, skipped (nothing is published unjudged)`)
      continue
    }

    const stored = readJson(entry.candidatePath) as {
      brief: Parameters<typeof publishJudgedCrochetCandidate>[0]
      design: unknown
      kind: 'piece' | 'amigurumi'
      program: unknown
      settledMm: { width: number; height: number }
      totalStitches: number
      fingerprint: string
      attempts: number
    }

    try {
      const result = await publishJudgedCrochetCandidate(
        stored.brief,
        {
          kind: stored.kind,
          program: stored.program as never,
          heroPng: readFileSync(entry.render.heroPath),
          heroPath: entry.render.heroPath,
          geometryHash: entry.render.geometryHash,
          fidelityScore: entry.render.fidelityScore,
          yr: entry.render.yr,
          built: null,
          compiled: null,
          settledMm: stored.settledMm,
          totalStitches: stored.totalStitches,
          attempts: stored.attempts,
          design: stored.design as never,
          fingerprint: stored.fingerprint,
        },
        verdict,
        {
          bulkRunId: manifest.bulkRunId,
          attempt: stored.attempts,
          visibility: args.visibility === 'PRIVATE' ? Visibility.PRIVATE : Visibility.PUBLIC,
          judgedBy: 'session',
          routineRunId: manifest.runId,
        },
      )

      if (result.outcome === 'published') {
        counters.published++
        gems.push(entry.slug)
        manifest = session.upsertCandidate(manifest, {
          ...entry,
          stage: 'published',
          verdict,
          published: {
            patternId: result.gem.patternId,
            publicUrl: result.gem.publicUrl,
            visibility: args.visibility,
            at: new Date().toISOString(),
          },
        })
        console.log(`${entry.slug}: PUBLISHED ${args.visibility} · ${result.gem.publicUrl}`)
      } else if (result.outcome === 'duplicate') {
        counters.duplicates++
        killReasons.push(`duplicate of ${result.of}`)
        manifest = session.upsertCandidate(manifest, { ...entry, stage: 'culled', verdict, culledReason: `duplicate of ${result.of}: ${result.reason}` })
        console.log(`${entry.slug}: refused, duplicate of ${result.of} (${result.reason})`)
      } else {
        counters.culled++
        killReasons.push(...result.reasons.slice(0, 2))
        manifest = session.upsertCandidate(manifest, {
          ...entry,
          stage: 'culled',
          verdict,
          culledReason: result.reasons[0] ?? result.outcome,
        })
        console.log(`${entry.slug}: ${result.outcome} — ${result.reasons.join('; ')}`)
      }
    } catch (err) {
      counters.errors++
      console.error(`${entry.slug}: publish failed — ${err instanceof Error ? err.message : String(err)}`)
    }
    writeJson(manifestPath(args.run), manifest)
  }

  manifest = { ...manifest, stages: { ...manifest.stages, publish: new Date().toISOString() } }
  writeJson(manifestPath(args.run), manifest)

  const summary = summaryLine({
    craft: 'crochet',
    requested: manifest.candidates.length,
    ...counters,
    repaired: 0,
    generations: manifest.candidates.filter((c) => c.render).length,
    // No `modelBriefs`: nothing here was written by a planner model, and the
    // summary line's "n of m briefs model-authored" clause would be a lie.
    plannerMode: 'session',
  })
  if (manifest.bulkRunId) {
    await prisma.bulkRun.update({
      where: { id: manifest.bulkRunId },
      data: {
        published: counters.published,
        culled: counters.culled,
        duplicates: counters.duplicates,
        skipped: counters.skipped,
        errors: counters.errors,
        gemSlugs: gems,
        killReasons,
        finishedAt: new Date(),
        summary,
      },
    })
  }
  const consumed = session.backlogConsumed(manifest)
  console.log(`\n${summary}`)
  console.log(`Backlog entries consumed: ${consumed.length ? consumed.join(', ') : 'none — every brief was invented'}`)
  console.log(`Approximate deterministic spend for this run: $${manifest.spentUsd.toFixed(2)}`)
}

/**
 * ESTIMATE — what the deterministic half costs, so the autopilot gets a budget
 * before it is switched on.
 *
 * Every rate is a named constant in `bulk/crochet-cost.ts` with a note on where
 * it came from, and every assumption is printed with the answer, because a cost
 * model whose inputs are invisible cannot be corrected.
 */
async function stageEstimate(args: Args): Promise<void> {
  const cost = await import('../src/lib/studio/generation/bulk/crochet-cost')
  const { PATTERN_CATEGORIES } = await import('../src/lib/studio/generation/categories')
  const target = PATTERN_CATEGORIES.crochet?.patternTarget ?? 1200

  const money = (n: number): string => `$${n.toFixed(2)}`
  const show = (label: string, e: ReturnType<typeof cost.estimateCrochetCost>): void => {
    console.log(`\n── ${label} ──`)
    console.log(`  published patterns   ${e.patterns.toLocaleString()}`)
    console.log(`  candidates rendered  ${Math.ceil(e.candidates).toLocaleString()} (at the assumed pass rate)`)
    console.log(`  render attempts      ${Math.ceil(e.renders).toLocaleString()}`)
    console.log(`  Fargate task-hours   ${e.taskHours.toFixed(1)}`)
    for (const line of e.lines) {
      const sub = line.unitUsd * line.units
      console.log(
        `  ${line.label.padEnd(38)} ${Math.ceil(line.units).toLocaleString().padStart(7)} x ${money(line.unitUsd).padStart(8)} = ${money(sub).padStart(10)}`,
      )
      console.log(`      ${line.source}`)
    }
    console.log(`  TOTAL                ${money(e.totalUsd)}`)
    console.log(`  per published pattern ${money(e.perPatternUsd)}`)
  }

  console.log('CROCHET AUTOPILOT — the deterministic cost of filling the catalogue.')
  console.log('Model work (planning, authoring, judging) happens in a Claude session on the Max plan')
  console.log('and costs nothing per token, so it does not appear below.')

  show('One pattern', cost.estimateCrochetCost(1))
  show(`A batch of ${args.count}`, cost.estimateCrochetCost(args.count))
  show(`The full crochet target (${target.toLocaleString()})`, cost.estimateCrochetCost(target))

  console.log('\n── The assumptions, all of them ──')
  console.log(`  render wall clock          ${cost.RENDER_WALL_CLOCK_MINUTES} min per Fargate task`)
  console.log(`  render attempts/candidate  ${cost.RENDER_ATTEMPTS_PER_CANDIDATE} (one repair render allowed, assumed rate)`)
  console.log(`  pass rate                  ${(cost.ASSUMED_PASS_RATE * 100).toFixed(0)}% of judged candidates kept — NOT YET MEASURED`)
  console.log(`  tapestry share             ${(cost.TAPESTRY_SHARE * 100).toFixed(0)}% of candidates also buy an illustration`)
  console.log(`  Fal creative upscale       ${money(cost.FAL_CREATIVE_UPSCALE_USD)} per hero — least certain rate, correct from an invoice`)
  console.log('\nCorrect any of these in apps/web/src/lib/studio/generation/bulk/crochet-cost.ts.')
  console.log(`The daily render cap is the backstop: at the current cap a full day cannot exceed about ${money(
    cost.estimateCrochetCost(1, { passRate: 1 }).totalUsd * 40,
  )}.`)
}

// ── Plumbing ────────────────────────────────────────────────────────────────

function loadManifest(
  runDir: string,
  session: typeof import('../src/lib/studio/generation/bulk/crochet-session'),
): RunManifest {
  const path = manifestPath(runDir)
  if (!existsSync(path)) {
    throw new Error(`no manifest at ${path} — run the context stage first`)
  }
  const parsed = session.parseManifest(readJson(path))
  if (!parsed.ok) {
    throw new Error(`the manifest is not valid:\n  ${parsed.errors.join('\n  ')}`)
  }
  return parsed.value
}

function fail(errors: string[]): void {
  console.error('Refused. Fix these and run the stage again:')
  for (const e of errors) console.error(`  · ${e}`)
  process.exitCode = 2
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  switch (args.stage) {
    case 'context':
      return stageContext(args)
    case 'expand':
      return stageExpand(args)
    case 'render':
      return stageRender(args)
    case 'publish':
      return stagePublish(args)
    case 'estimate':
      return stageEstimate(args)
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error(err instanceof Error ? (err.stack ?? err.message) : String(err))
    process.exit(1)
  })
