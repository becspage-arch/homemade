/**
 * Run ONE crochet bulk batch from a worker box, in process.
 *
 * The autopilot's real home is the Inngest job on ECS; this is the same batch,
 * run by hand, for the two occasions that need it: proving a change before the
 * cron is trusted with it, and the FIRST batch of a category, which has to be
 * looked at before any volume is built on it
 * ([[feedback_render_before_volume]]).
 *
 *   # the autopilot batch, exactly as the cron runs it
 *   cd apps/web && npx tsx --conditions=react-server scripts/bulk-crochet-batch.ts [count]
 *
 *   # the first batch: render the seed set, publish nothing
 *   npx tsx --conditions=react-server scripts/bulk-crochet-batch.ts --seed --render
 *
 *   # then, once the renders have been looked at, publish the keepers
 *   npx tsx --conditions=react-server scripts/bulk-crochet-batch.ts --seed --publish verdicts.json
 *
 * Needs LOOM_RENDER=fargate plus the AWS + FAL credentials in
 * `.env.credentials`, because every pattern heroes itself.
 *
 * `--conditions=react-server` is load-bearing: the bulk modules carry Next's
 * `server-only` marker, which throws outside a server component unless that
 * export condition resolves it to the empty module. It is the same code the
 * ECS job runs either way.
 *
 * ── WHY THE SEED MODE EXISTS, AND WHAT IT DOES NOT DO ──────────────────────
 * A crochet pattern only reaches the catalogue past a keep-or-kill judgement of
 * its finished render. In the autopilot that judgement is the server-side vision
 * gate. Seed mode does NOT skip it: it splits it in two, so a person (or a
 * worker session with eyes) can make the same judgement on the same artifact
 * before a category's first patterns exist.
 *
 *   `--render`  renders every seed pattern and writes a manifest. It publishes
 *               nothing and writes nothing to R2.
 *   `--publish` takes a verdict file recording keep or kill and the reasons for
 *               each slug, and publishes ONLY the keeps.
 *
 * There is no path through this script that publishes an unjudged pattern: with
 * no verdict file nothing is published, and a slug with no verdict is skipped.
 * Everything after the verdict is the ordinary publisher, so the duplicate
 * guard and the completeness gate still run and can still refuse a row.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { loadCredentials } from './loom-hybrid-fal'

loadCredentials()

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet/first-batch')

interface Verdict {
  verdict: 'keep' | 'kill'
  reasons: string[]
}

interface ManifestEntry {
  slug: string
  name: string
  shelf: string
  treatment: string
  kind: 'piece' | 'amigurumi'
  heroPath: string
  geometryHash: string
  fidelityScore: number | null
  yr: number
  settledMm: { width: number; height: number }
  totalStitches: number
  fingerprint: string
  program: unknown
  design: unknown
  colours: number
}

async function runAutopilotBatch(count: number): Promise<void> {
  const { runBatch } = await import('../src/lib/studio/generation/bulk/run')
  const summary = await runBatch('crochet', count)
  console.log(JSON.stringify(summary, null, 2))
  console.log(`\n${summary.line}`)
}

/** Render every seed pattern and write the manifest. Publishes nothing. */
async function renderSeed(): Promise<void> {
  const { CROCHET_FIRST_BATCH } = await import('./crochet-first-batch')
  const { designToProgram } = await import('../src/lib/studio/generation/bulk/crochet-design')
  const { compileRelaxAudit, settledSizeMm } = await import('../src/lib/loom/crochet/engine/programScene')
  const { compileComposition } = await import('../src/lib/loom/crochet/engine/composition')
  const { renderProgram, renderComposition } = await import('./loom-pattern')
  const crochet = await import('../src/lib/studio/generation/bulk/crochet')
  const { programFingerprint } = await import('../src/lib/studio/generation/bulk/crochet-dedupe')

  mkdirSync(OUT, { recursive: true })
  const manifest: ManifestEntry[] = []

  for (const entry of CROCHET_FIRST_BATCH) {
    const { brief, design } = entry
    console.log(`\n── ${brief.slug} (${brief.shelf} / ${brief.treatment}) ──`)
    try {
      if (brief.treatment === 'grid-tapestry') {
        // The pictorial lane goes through the adapter itself, because its grid
        // comes from an illustration rather than from a design recipe.
        const candidate = await crochet.generateCrochetCandidate(
          brief,
          crochet.paletteHexesFor(brief.brief.palette),
        )
        manifest.push({
          slug: brief.slug,
          name: brief.name,
          shelf: brief.shelf,
          treatment: brief.treatment,
          kind: candidate.kind,
          heroPath: candidate.heroPath,
          geometryHash: candidate.geometryHash,
          fidelityScore: candidate.fidelityScore,
          yr: candidate.yr,
          settledMm: candidate.settledMm,
          totalStitches: candidate.totalStitches,
          fingerprint: candidate.fingerprint,
          program: candidate.program,
          design: candidate.design,
          colours: Object.keys((candidate.program as { palette?: object }).palette ?? {}).length,
        })
        console.log(`   hero ${candidate.heroPath} · hash ${candidate.geometryHash} · fidelity ${candidate.fidelityScore}`)
        continue
      }

      if (!design) throw new Error('no design on the seed entry')
      const built = designToProgram(design, { shelf: brief.shelf, name: brief.name })
      if (built.kind === 'none') throw new Error(built.problems.join('; '))

      if (built.kind === 'amigurumi') {
        const program = built.program
        const compiled = compileComposition(program)
        if (compiled.problems.length) throw new Error(compiled.problems.join('; '))
        const size = crochet.compositionSizeMm(compiled)
        program.finishedSizeMm = { width: Math.round(size.width), height: Math.round(size.height) }
        const render = await renderComposition(program, { name: brief.slug, hero: true, outDir: OUT })
        if (render.problems.length) throw new Error(render.problems.join('; '))
        const heroPath = render.heroPng ?? render.basePng
        if (!heroPath) throw new Error('no render produced')
        manifest.push({
          slug: brief.slug,
          name: brief.name,
          shelf: brief.shelf,
          treatment: brief.treatment,
          kind: 'amigurumi',
          heroPath,
          geometryHash: render.geometryHash,
          fidelityScore: render.fidelityScore,
          yr: render.yr,
          settledMm: { width: size.width, height: size.height },
          totalStitches: program.parts.reduce((a, p) => a + p.rounds.reduce((x, y) => x + y, 0), 0),
          fingerprint: programFingerprint(program),
          program,
          design,
          colours: new Set(program.parts.map((p) => p.colourHex)).size,
        })
        console.log(`   hero ${heroPath} · hash ${render.geometryHash} · fidelity ${render.fidelityScore}`)
        continue
      }

      const first = compileRelaxAudit(built.program)
      if (first.problems.length) throw new Error(first.problems.join('; '))
      const settled = settledSizeMm(first.built)
      const program = crochet.declareSizeAndGauge(built.program, settled)
      const render = await renderProgram(program, { name: brief.slug, hero: true, outDir: OUT })
      if (render.problems.length) throw new Error(render.problems.join('; '))
      const heroPath = render.heroPng ?? render.basePng
      if (!heroPath) throw new Error('no render produced')
      manifest.push({
        slug: brief.slug,
        name: brief.name,
        shelf: brief.shelf,
        treatment: brief.treatment,
        kind: 'piece',
        heroPath,
        geometryHash: render.geometryHash,
        fidelityScore: render.fidelityScore,
        yr: render.yr,
        settledMm: settled,
        totalStitches:
          program.form === 'grid'
            ? (program.gridWidth ?? 0) * (program.grid?.length ?? 0)
            : (program.rounds ?? []).reduce((a, b) => a + b, 0),
        fingerprint: programFingerprint(program),
        program,
        design,
        colours: Object.keys(program.palette ?? {}).length,
      })
      console.log(
        `   hero ${heroPath} · hash ${render.geometryHash} · fidelity ${render.fidelityScore} · settled ${settled.width.toFixed(0)}x${settled.height.toFixed(0)}mm`,
      )
    } catch (err) {
      console.error(`   FAILED: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const manifestPath = resolve(OUT, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\nRendered ${manifest.length} of ${CROCHET_FIRST_BATCH.length}. Manifest: ${manifestPath}`)
  console.log('Look at every hero, then write a verdict file and re-run with --publish.')
}

/** Publish the seed patterns a verdict file marks keep. */
async function publishSeed(verdictPath: string): Promise<void> {
  const { CROCHET_FIRST_BATCH } = await import('./crochet-first-batch')
  const crochet = await import('../src/lib/studio/generation/bulk/crochet')
  const { summaryLine } = await import('../src/lib/studio/generation/bulk/run-status')
  const { prisma } = await import('@homemade/db')

  const manifestPath = resolve(OUT, 'manifest.json')
  if (!existsSync(manifestPath)) throw new Error(`no manifest at ${manifestPath} — run --render first`)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ManifestEntry[]
  const verdicts = JSON.parse(readFileSync(resolve(verdictPath), 'utf8')) as Record<string, Verdict>

  // The provenance columns are what the duplicate guard and `generationMeta`
  // are written into, and a client that has them talking to a database that
  // does not fails with an opaque "column (not available) does not exist". Say
  // what is actually wrong instead.
  const columns = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'CrochetPattern'
      AND column_name IN ('generationMeta', 'subjectKey', 'programFingerprint', 'bulkRunId')
  `
  if (columns.length < 4) {
    throw new Error(
      'the crochet provenance columns are not on this database yet: apply the migration ' +
        '20261012000000_crochet_bulk_autopilot_provenance (the deploy applies it on merge) and run this again',
    )
  }

  const catalogue = await crochet.loadCrochetCatalogue()
  const counters = { published: 0, culled: 0, duplicates: 0, errors: 0, skipped: 0 }
  const gems: string[] = []
  const killReasons: string[] = []
  for (const item of manifest) {
    const entry = CROCHET_FIRST_BATCH.find((e) => e.brief.slug === item.slug)
    const verdict = verdicts[item.slug]
    if (!entry) {
      counters.skipped++
      console.log(`${item.slug}: no seed entry, skipped`)
      continue
    }
    if (!verdict) {
      counters.skipped++
      console.log(`${item.slug}: NO VERDICT, skipped (nothing is published unjudged)`)
      continue
    }
    if (verdict.verdict !== 'keep') {
      counters.culled++
      killReasons.push(...verdict.reasons.slice(0, 2))
      console.log(`${item.slug}: killed — ${verdict.reasons.join('; ')}`)
      continue
    }

    const hit = crochet.findCrochetDuplicate(
      { subjectKey: entry.brief.subjectKey, programFingerprint: item.fingerprint },
      catalogue,
    )
    if (hit) {
      counters.duplicates++
      killReasons.push(`duplicate of ${hit.slug}`)
      console.log(`${item.slug}: refused, duplicate of ${hit.slug} (${hit.reason})`)
      continue
    }

    try {
      const published = await crochet.publishCrochetGem(
        entry.brief,
        {
          kind: item.kind,
          program: item.program as never,
          heroPng: readFileSync(item.heroPath),
          heroPath: item.heroPath,
          geometryHash: item.geometryHash,
          fidelityScore: item.fidelityScore,
          yr: item.yr,
          built: null,
          compiled: null,
          settledMm: item.settledMm,
          totalStitches: item.totalStitches,
          attempts: 1,
          design: item.design as never,
          fingerprint: item.fingerprint,
        },
        { bulkRunId: null, gate: { verdict: 'keep', reasons: verdict.reasons }, attempt: 1 },
      )
      counters.published++
      gems.push(item.slug)
      console.log(
        `${item.slug}: PUBLISHED · shelf ${published.shelf} · hash ${published.geometryHash} · fidelity ${published.fidelityScore} · ${published.publicUrl}`,
      )
    } catch (err) {
      // The completeness gate refusing a row is a CULL, not an error: the
      // pipeline worked, the pattern was not good enough to ship.
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('not complete')) {
        counters.culled++
        killReasons.push(message.slice(0, 80))
      } else {
        counters.errors++
      }
      console.error(`${item.slug}: publish refused — ${message}`)
    }
  }

  // Record the batch the way every other batch is recorded, so the first six
  // appear under Recent runs on the admin page rather than arriving from
  // nowhere.
  const summary = summaryLine({
    craft: 'crochet',
    requested: manifest.length,
    ...counters,
    repaired: 0,
    generations: manifest.length,
    modelBriefs: manifest.length,
    plannerMode: 'seed',
  })
  await prisma.bulkRun.create({
    data: {
      craft: 'crochet',
      trigger: 'manual',
      requested: manifest.length,
      published: counters.published,
      culled: counters.culled,
      duplicates: counters.duplicates,
      skipped: counters.skipped,
      errors: counters.errors,
      generations: manifest.length,
      gemSlugs: gems,
      killReasons,
      finishedAt: new Date(),
      summary,
    },
  })
  console.log(`\n${summary}`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes('--seed')) {
    if (args.includes('--render')) return renderSeed()
    const i = args.indexOf('--publish')
    if (i >= 0 && args[i + 1]) return publishSeed(args[i + 1]!)
    console.error('usage: --seed --render  |  --seed --publish <verdicts.json>')
    process.exit(2)
  }
  const count = Number(args[0]) || 6
  return runAutopilotBatch(count)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
