/**
 * THE GATE CALIBRATION LOOP — replay real renders through the CURRENT rubric.
 *
 *   pnpm --filter @homemade/web exec tsx --conditions=react-server \
 *     scripts/xs-gate-replay.ts <runId> [runId…] [--out rows.json] [--only slug] [--dry-run]
 *
 * Needs ANTHROPIC_API_KEY in the environment — the same key the gate itself runs
 * on. `--dry-run` collects and downloads everything and prints the table without
 * calling the gate, which checks the corpus and the fixture without spending.
 *
 * (`--conditions=react-server` is what lets a plain script import the
 * `server-only` gate module; without it Node loads the throwing build.)
 *
 * WHY. The gate is a paragraph of English judged by a model, and until now the
 * only way to change it was to argue about the wording and then watch a whole
 * batch to find out. Every rubric edit was a guess with a two-hour feedback
 * loop and no memory of what the last wording got right.
 *
 * Now that a run keeps its rejected renders (`BulkRun.rejectSamples`) there is a
 * corpus: the pictures the gate killed, the pictures it kept, and — in
 * `fixtures/xs-gate-expected.json` — what a person says each of them should be.
 * This script re-runs the live rubric over all of it and prints the table, so a
 * change to the wording is scored against real renders in a couple of minutes
 * instead of argued about.
 *
 * The gate call is unchanged: one image, the same prompt the runner sends. This
 * costs exactly what a batch's worth of judging costs.
 *
 * Exit code is 1 when the replay misses a fixture case, so it can gate a commit.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

// Dependency-free env loader (apps/web does not depend on dotenv, and importing
// it breaks the production type-check).
function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    // env already provided by the shell
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? '.env.credentials')

import { prisma } from '@homemade/db'
import { r2PublicUrl } from '@/lib/r2'
import { visionGate, gateConfigured, type GateResult } from '@/lib/studio/generation/vision-gate'

type Expected = 'keep' | 'repair' | 'kill'

interface Item {
  slug: string
  /** Where the render came from: a kept reject, or a published gem's thumbnail. */
  origin: 'reject' | 'gem'
  runId: string | null
  url: string
  subject: string
  colours: number
  attempt: number | null
  /** What the gate said at the time. */
  originalVerdict: string
  originalReasons: string[]
}

interface Row extends Item {
  replay: GateResult
  expected: Expected | null
  match: boolean | null
}

const FIXTURE = join(__dirname, 'fixtures', 'xs-gate-expected.json')

function loadFixture(): Record<string, Expected> {
  const raw = JSON.parse(readFileSync(FIXTURE, 'utf8')) as Record<string, string>
  const out: Record<string, Expected> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith('_')) continue
    if (v === 'keep' || v === 'kill' || v === 'repair') out[k] = v
    else throw new Error(`fixture ${k}: "${v}" is not keep|kill|repair`)
  }
  return out
}

/** Turn a slug back into readable words — the last-resort subject for an old
 *  sample written before the subject was carried on the row. */
function subjectFromSlug(slug: string): string {
  return slug
    .replace(/-[a-z0-9]{4}$/i, '')
    .split('-')
    .slice(1)
    .join(' ')
}

/** The reject samples of one run, as replayable items. */
async function rejectItems(runId: string): Promise<Item[]> {
  const run = await prisma.bulkRun.findUnique({ where: { id: runId }, select: { rejectSamples: true } })
  const samples = (Array.isArray(run?.rejectSamples) ? run!.rejectSamples : []) as Record<string, unknown>[]
  return samples
    .filter((s) => typeof s.url === 'string')
    .map((s) => ({
      slug: String(s.slug ?? '?'),
      origin: 'reject' as const,
      runId,
      url: String(s.url),
      subject: typeof s.subject === 'string' && s.subject ? s.subject : subjectFromSlug(String(s.slug ?? '')),
      colours: Number(s.colours ?? 0),
      attempt: Number(s.attempt ?? 0) || null,
      originalVerdict: String(s.verdict ?? '?'),
      originalReasons: Array.isArray(s.reasons) ? s.reasons.map(String) : [],
    }))
}

/** One published pattern as a replayable item — the gem side of the comparison. */
async function patternItem(slug: string, runId: string | null): Promise<Item | null> {
  const p = await prisma.pattern.findUnique({
    where: { slug },
    select: { slug: true, colourCount: true, generationMeta: true, thumbnailMediaId: true },
  })
  if (!p?.thumbnailMediaId) return null
  const media = await prisma.media.findUnique({ where: { id: p.thumbnailMediaId }, select: { r2Key: true } })
  if (!media?.r2Key) return null
  const meta = (p.generationMeta ?? {}) as {
    brief?: { subject?: string }
    gate?: { verdict?: string; reasons?: string[] }
    attempt?: number
  }
  return {
    slug,
    origin: 'gem',
    runId,
    url: r2PublicUrl(media.r2Key),
    subject: meta.brief?.subject ?? subjectFromSlug(slug),
    colours: p.colourCount ?? 0,
    attempt: meta.attempt ?? null,
    originalVerdict: meta.gate?.verdict ?? 'keep',
    originalReasons: meta.gate?.reasons ?? [],
  }
}

async function fetchPng(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return sharp(Buffer.from(await res.arrayBuffer())).png().toBuffer()
}

function pad(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s.padEnd(n)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const outIdx = args.indexOf('--out')
  const out = outIdx >= 0 ? args[outIdx + 1] : null
  const onlyIdx = args.indexOf('--only')
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null
  const dryRun = args.includes('--dry-run')
  const runIds = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out' && args[i - 1] !== '--only')
  if (!runIds.length) {
    console.error('usage: tsx --conditions=react-server scripts/xs-gate-replay.ts <runId…> [--out sheet.png] [--only slug]')
    process.exit(1)
  }
  if (!dryRun && !gateConfigured()) {
    throw new Error('ANTHROPIC_API_KEY not set — nothing to replay against (use --dry-run to check the corpus without judging)')
  }

  const fixture = loadFixture()
  const items: Item[] = []
  const seen = new Set<string>()

  for (const runId of runIds) {
    const run = await prisma.bulkRun.findUnique({ where: { id: runId }, select: { id: true, gemSlugs: true } })
    if (!run) {
      console.warn(`run ${runId} not found — skipping`)
      continue
    }
    for (const it of await rejectItems(runId)) {
      const key = `${it.slug}-a${it.attempt}`
      if (seen.has(key)) continue
      seen.add(key)
      items.push(it)
    }
    for (const slug of run.gemSlugs) {
      if (seen.has(slug)) continue
      const it = await patternItem(slug, runId)
      if (it) {
        seen.add(slug)
        items.push(it)
      }
    }
  }

  // Anything the fixture names that the runs did not supply — the unpublished
  // false keeps live here, and they are the most important rows in the table.
  for (const slug of Object.keys(fixture)) {
    if ([...seen].some((k) => k === slug || k.startsWith(`${slug}-a`))) continue
    const it = await patternItem(slug, null)
    if (it) {
      seen.add(slug)
      items.push(it)
    } else {
      console.warn(`fixture slug ${slug}: no pattern/thumbnail found — not replayed`)
    }
  }

  const todo = only ? items.filter((i) => i.slug.includes(only)) : items
  // An idea that eventually shipped has BOTH a gem row and the rejected attempts
  // that came before it. The fixture's verdict belongs to the idea's finished
  // render, so those earlier attempts are replayed and shown but never scored —
  // a pale first roll of a gem is not a fixture case.
  const shipped = new Set(items.filter((i) => i.origin === 'gem').map((i) => i.slug))
  console.log(`replaying ${todo.length} renders through the current rubric…\n`)

  const rows: Row[] = []
  for (const it of todo) {
    let replay: GateResult
    try {
      const png = await fetchPng(it.url)
      if (dryRun) {
        const want = it.origin === 'reject' && shipped.has(it.slug) ? null : (fixture[it.slug] ?? null)
        rows.push({ ...it, replay: { verdict: 'keep', reasons: ['dry run — not judged'] }, expected: want, match: null })
        process.stdout.write('.')
        continue
      }
      // The near-duplicate box needs the batch context the runner had: every
      // OTHER subject this run kept.
      const kept = todo.filter((o) => o.runId === it.runId && o.origin === 'gem' && o.slug !== it.slug).map((o) => o.subject)
      replay = await visionGate(png, { subject: it.subject, craft: 'cross-stitch', colours: it.colours || undefined, keptSubjects: kept })
    } catch (err) {
      replay = { verdict: 'kill', reasons: [`replay failed: ${err instanceof Error ? err.message.slice(0, 60) : 'error'}`] }
    }
    const expected = it.origin === 'reject' && shipped.has(it.slug) ? null : (fixture[it.slug] ?? null)
    rows.push({ ...it, replay, expected, match: expected ? replay.verdict === expected : null })
    process.stdout.write('.')
  }
  console.log('\n')

  console.log(
    `${pad('slug', 46)} ${pad('origin', 7)} ${pad('was', 7)} ${pad('now', 7)} ${pad('want', 6)} result`,
  )
  console.log('-'.repeat(120))
  for (const r of rows) {
    const mark = r.match === null ? '—' : r.match ? 'ok' : 'MISS'
    console.log(
      `${pad(r.slug, 46)} ${pad(r.origin, 7)} ${pad(r.originalVerdict, 7)} ${pad(r.replay.verdict, 7)} ${pad(r.expected ?? '', 6)} ${mark}`,
    )
    if (r.match === false || !r.expected) {
      console.log(`${' '.repeat(48)}was: ${r.originalReasons.join(' | ') || '—'}`)
      console.log(`${' '.repeat(48)}now: ${r.replay.reasons.join(' | ') || '—'}`)
    }
  }

  const scored = rows.filter((r) => r.expected)
  if (dryRun) {
    console.log(`\ndry run — ${rows.length} renders collected, ${scored.length} of them fixture cases. Nothing judged.`)
    if (out) writeFileSync(out, JSON.stringify(rows, null, 1))
    return
  }
  const misses = scored.filter((r) => !r.match)
  console.log(`\n${scored.length - misses.length}/${scored.length} fixture cases match the current rubric.`)
  if (misses.length) {
    console.log('misses:')
    for (const m of misses) console.log(`  ${m.slug}: wanted ${m.expected}, got ${m.replay.verdict} — ${m.replay.reasons.join(' | ')}`)
  }

  if (out) {
    writeFileSync(out, JSON.stringify(rows, null, 1))
    console.log(`\nfull rows written to ${out}`)
  }
  if (misses.length) process.exitCode = 1
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
