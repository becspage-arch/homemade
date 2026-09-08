/**
 * xs-candidates — the judging CLI for the cross-stitch candidate parking bay.
 *
 * The autopilot's 'candidates' gate mode makes no paid-model call at all: it
 * generates, checks the two deterministic guards, and parks each idea as an
 * UNLISTED `Pattern` with `candidateStatus 'PENDING'`. This script is how a
 * Claude Code session on Rebecca's Max plan looks at those candidates and
 * decides. Nothing reaches the public catalogue that has not been through here.
 *
 * Run from apps/web:
 *
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts list
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts sheets [--out DIR]
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts keep <slug…>
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts reject <cull.json> [--apply]
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts reroll <slug…>
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts pool-check
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts pool-add --as <name> --file <subjects.json>
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts pool-list [--theme <id>]
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts report --as <name> [--kind judging|weekly] --text "<report>"
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts report --as <name> [--kind judging|weekly] --file <path>
 *
 * `pool-add` is how a routine session grows the subject pool without a git
 * push: `subjects.json` is an array of
 * `{ "theme": "<CrossStitchTheme.id>", "subject": "…", "lanes"?, "laneOverrides"?, "setOf"? }`
 * — the same fields a hand-written `subject-pool.ts` entry carries, minus the
 * theme's own scaffolding. Each subject is validated (a real, non-hold theme;
 * no collision with a subject the pool already has for that theme; no brand,
 * real person or lettering) and, if it passes, written to
 * `BulkAutopilotState.poolExtras` (craft 'cross-stitch') rather than to the
 * file — the row the planner already merges into the pool at plan time and
 * `pool-check` already counts. `pool-list` shows what is on record.
 * `keep` and `reject` are idempotent and reversible: nothing is deleted, every
 * decision is written on the row (`candidateStatus`, `judgedAt`, `judgedBy`,
 * `judgeReasons`) and a rejected candidate keeps its thumbnail — it is the
 * reject sample now, and the calibration record for the locked bar.
 *
 * `report` is how a routine session leaves its hand-off when it cannot push a
 * branch or message another session: the text is prepended to
 * `BulkAutopilotState.judgingReports` (craft 'cross-stitch'), trimmed to the
 * last 20, and shown on the admin bulk-generation page's cross-stitch card.
 * `--kind` defaults to 'judging'; the weekly routine passes 'weekly'.
 *
 * `--as NAME` labels the decision (default: the CLAUDE_SESSION_ID, else
 * 'claude-session'), so `judgedBy` says which session did it. It takes the
 * next argument as its value everywhere on this CLI — that value is never
 * also read as a slug or a positional argument.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

// Dependency-free env loader — apps/web does not depend on dotenv, and importing
// it breaks the production type-check.
function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    /* env from the shell */
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? '.env.credentials')

import { prisma } from '@homemade/db'
import {
  pendingCandidates,
  candidateStats,
  keepCandidates,
  rejectCandidates,
  rerollCandidates,
  poolCheck,
  addJudgingReport,
  addPoolExtras,
  listPoolExtras,
  CANDIDATE_SWEEP_DAYS,
  MAX_CANDIDATE_REROLLS,
  MAX_JUDGING_REPORTS,
  type PendingCandidate,
  type JudgingReportEntry,
  type PoolAddInput,
} from '@/lib/studio/generation/bulk/candidates'
import type { LaneName } from '@/lib/studio/generation/bulk/subject-pool'

const CELL = 560
const BAND = 44
const COLS = 3
const PER_SHEET = COLS * COLS

/** Flags that take the next argv slot as their value, everywhere on this CLI. */
const VALUE_FLAGS = new Set(['--as', '--out', '--kind', '--text', '--file', '--theme'])

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : null
}

/**
 * Positional arguments (slugs, mostly) from `startIndex` on, with every
 * `--flag` AND the value it consumes removed.
 *
 * Filtering only `a.startsWith('--')` — the earlier shape — dropped the flag
 * but not its value, so `keep foo --as worker` treated `worker` as a second
 * slug and reported it "not found". `--as` reads its value here the same way
 * `arg()` reads it, so the two can never disagree about which token is the
 * flag's value and which is a slug.
 */
function positionalArgs(startIndex: number): string[] {
  const out: string[] = []
  for (let i = startIndex; i < process.argv.length; i++) {
    const a = process.argv[i]!
    if (a.startsWith('--')) {
      if (VALUE_FLAGS.has(a)) i++
      continue
    }
    out.push(a)
  }
  return out
}

function judgedBy(): string {
  return arg('--as') ?? process.env.CLAUDE_SESSION_ID ?? 'claude-session'
}

function ageOf(when: Date): string {
  const h = Math.floor((Date.now() - when.getTime()) / 3_600_000)
  if (h < 1) return '<1h'
  if (h < 48) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ─────────────────────────── contact sheets ───────────────────────────

async function labelledTile(png: Buffer, label: string): Promise<Buffer> {
  const img = await sharp(png).resize(CELL, CELL, { fit: 'inside', background: '#ffffff' }).toBuffer()
  const meta = await sharp(img).metadata()
  const w = meta.width ?? CELL
  const h = meta.height ?? CELL
  const band = Buffer.from(
    `<svg width="${CELL}" height="${BAND}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="28" font-family="DejaVu Sans, sans-serif" font-size="15" fill="#fff">${esc(label)}</text></svg>`,
  )
  return sharp({ create: { width: CELL, height: CELL + BAND, channels: 3, background: '#ffffff' } })
    .composite([
      { input: img, left: Math.floor((CELL - w) / 2), top: Math.floor((CELL - h) / 2) },
      { input: band, left: 0, top: CELL },
    ])
    .png()
    .toBuffer()
}

async function sheet(tiles: Buffer[], title: string): Promise<Buffer> {
  const rows = Math.max(1, Math.ceil(tiles.length / COLS))
  const width = COLS * (CELL + 10) + 10
  const height = 50 + rows * (CELL + BAND + 10)
  const header = Buffer.from(
    `<svg width="${width}" height="50"><text x="10" y="32" font-family="DejaVu Sans, sans-serif" font-size="20" fill="#111">${esc(title)}</text></svg>`,
  )
  const comps = tiles.map((t, i) => ({
    input: t,
    left: 10 + (i % COLS) * (CELL + 10),
    top: 50 + Math.floor(i / COLS) * (CELL + BAND + 10),
  }))
  return sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite([{ input: header, left: 0, top: 0 }, ...comps])
    .png()
    .toBuffer()
}

function labelFor(c: PendingCandidate): string {
  return `${c.slug} | ${c.shelf} | ${c.colourCount} col | ${c.widthCells}x${c.heightCells} | ${c.lane}`
}

// ─────────────────────────── the commands ───────────────────────────

async function cmdList(): Promise<void> {
  const [rows, stats] = await Promise.all([pendingCandidates(), candidateStats()])
  if (!rows.length) {
    console.log('Nothing waiting. The parking bay is empty.')
    return
  }
  const byRun = new Map<string, PendingCandidate[]>()
  for (const r of rows) {
    const key = r.bulkRunId ?? 'no run'
    byRun.set(key, [...(byRun.get(key) ?? []), r])
  }
  for (const [runId, group] of byRun) {
    const oldest = group[group.length - 1]!
    const newest = group[0]!
    console.log(`\nrun ${runId} · ${group.length} pending · ${ageOf(newest.createdAt)}–${ageOf(oldest.createdAt)} old`)
    const byShelf = new Map<string, PendingCandidate[]>()
    for (const c of group) byShelf.set(c.shelf, [...(byShelf.get(c.shelf) ?? []), c])
    for (const [shelf, list] of [...byShelf].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`  ${shelf} (${list.length})`)
      for (const c of list) {
        const reroll = c.rerollCount > 0 ? ` · re-roll ${c.rerollCount}/${MAX_CANDIDATE_REROLLS}` : ''
        console.log(`    ${c.slug} · ${c.lane} · ${c.colourCount} col · ${c.widthCells}x${c.heightCells} · ${ageOf(c.createdAt)}${reroll}`)
      }
    }
  }
  console.log(
    `\n${rows.length} pending in total · oldest ${stats.oldest ? ageOf(stats.oldest) : '—'} · last judged ${stats.lastJudgedAt ? ageOf(stats.lastJudgedAt) : 'never'}`,
  )
  console.log(`Anything still un-judged after ${CANDIDATE_SWEEP_DAYS} days is swept to rejected with the reason "unjudged".`)
}

async function cmdSheets(): Promise<void> {
  const outDir = arg('--out') ?? `./xs-candidates-${new Date().toISOString().slice(0, 10)}`
  const base = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')
  if (!base) throw new Error('R2_PUBLIC_BASE_URL not set')
  const rows = await pendingCandidates()
  if (!rows.length) {
    console.log('Nothing waiting. The parking bay is empty.')
    return
  }
  mkdirSync(outDir, { recursive: true })

  // The full-size thumbnails go down by slug too, so a candidate that is hard to
  // call at 560 px can be opened at the size it would actually ship.
  const tiles: { tile: Buffer; slug: string }[] = []
  for (const c of rows) {
    if (!c.thumbnailKey) {
      console.log(`  ${c.slug}: no thumbnail persisted — skipped`)
      continue
    }
    const res = await fetch(`${base}/${c.thumbnailKey}`)
    if (!res.ok) {
      console.log(`  ${c.slug}: thumbnail fetch ${res.status}`)
      continue
    }
    const png = Buffer.from(await res.arrayBuffer())
    writeFileSync(`${outDir}/${c.slug}.png`, png)
    tiles.push({ tile: await labelledTile(png, labelFor(c)), slug: c.slug })
  }

  const sheets: string[] = []
  for (let i = 0; i < tiles.length; i += PER_SHEET) {
    const slice = tiles.slice(i, i + PER_SHEET)
    const n = Math.floor(i / PER_SHEET) + 1
    const file = `${outDir}/sheet-${String(n).padStart(2, '0')}.png`
    writeFileSync(file, await sheet(slice.map((t) => t.tile), `pending candidates ${i + 1}–${i + slice.length} of ${tiles.length}`))
    sheets.push(file)
    console.log(`sheet ${file}`)
    for (const t of slice) console.log(`  ${t.slug}`)
  }
  console.log(`\n${tiles.length} candidates across ${sheets.length} sheet${sheets.length === 1 ? '' : 's'} in ${outDir}`)
  console.log('Full-size thumbnails are saved beside the sheets, one per slug.')
}

async function cmdKeep(): Promise<void> {
  const slugs = positionalArgs(3)
  if (!slugs.length) throw new Error('usage: xs-candidates.ts keep <slug…>')
  const out = await keepCandidates(slugs, judgedBy())
  console.log(
    `kept ${out.changed} · already kept ${out.alreadyDone.length} · not found ${out.notFound.length}${out.notFound.length ? ` (${out.notFound.join(', ')})` : ''}`,
  )
  if (out.changed) console.log('Each kept candidate is now PUBLIC and synced to search.')
}

async function cmdReject(): Promise<void> {
  const file = process.argv[3]
  const apply = process.argv.includes('--apply')
  if (!file || file.startsWith('--')) throw new Error('usage: xs-candidates.ts reject <cull.json> [--apply]')
  const recs: { slug: string; reason: string }[] = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(recs) || recs.some((r) => !r?.slug || !r?.reason)) {
    throw new Error('cull.json must be an array of { slug, reason }')
  }
  if (!apply) {
    console.log(`DRY RUN · ${recs.length} candidate${recs.length === 1 ? '' : 's'} would be rejected:`)
    for (const r of recs) console.log(`  ${r.slug} — ${r.reason}`)
    console.log('Re-run with --apply to write it.')
    return
  }
  const out = await rejectCandidates(recs, judgedBy())
  console.log(
    `rejected ${out.changed} · already rejected ${out.alreadyDone.length} · not found ${out.notFound.length}${out.notFound.length ? ` (${out.notFound.join(', ')})` : ''}`,
  )
  console.log('Rejected candidates are PRIVATE with their reasons on the row; the thumbnails are kept as the reject samples.')
}

async function cmdReroll(): Promise<void> {
  const slugs = positionalArgs(3)
  if (!slugs.length) throw new Error('usage: xs-candidates.ts reroll <slug…>')
  const out = await rerollCandidates(slugs, judgedBy())
  console.log(
    `marked for re-roll ${out.changed} · already marked ${out.alreadyDone.length} · at the cap ${out.capped.length}${out.capped.length ? ` (${out.capped.join(', ')})` : ''} · not found ${out.notFound.length}`,
  )
  if (out.capped.length) {
    console.log(`An idea gets ${MAX_CANDIDATE_REROLLS} re-rolls; reject the ones at the cap instead.`)
  }
  if (out.changed) console.log('The next dispatcher firing re-plans these briefs as some of its ideas.')
}

async function cmdPoolCheck(): Promise<void> {
  const rows = await poolCheck()
  const thin = rows.filter((r) => r.thin)
  console.log('shelf · published/target · still owed · pool subjects (unused)')
  for (const r of rows) {
    if (r.deficit === 0 && !r.thin) continue
    const flag = r.thin ? '  ← THIN' : ''
    console.log(`  ${r.slug} · ${r.count}/${r.target} · owes ${r.deficit} · pool ${r.poolSubjects} (${r.unused} unused)${flag}`)
  }
  if (!thin.length) {
    console.log('\nNo shelf will run out of pool before it reaches its target.')
    return
  }
  console.log(
    `\n${thin.length} shelf${thin.length === 1 ? '' : 'ves'} will run out of subjects before target: ${thin.map((r) => r.slug).join(', ')}.`,
  )
  console.log('Write 6 to 10 new subjects for each into that shelf’s theme in')
  console.log('apps/web/src/lib/studio/generation/bulk/subject-pool.ts, to the standard of the ones already there:')
  console.log('ONE dominant subject that fills the frame, a hook in its pose or setting, colour named concretely,')
  console.log('nothing small hung off the side, no lettering.')
}

function readPoolAddInputs(file: string): PoolAddInput[] {
  const raw: unknown = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(raw)) throw new Error('subjects.json must be an array of { theme, subject, lanes?, laneOverrides?, setOf? }')
  return raw.map((r, i) => {
    if (!r || typeof r !== 'object') throw new Error(`entry ${i} is not an object`)
    const o = r as Record<string, unknown>
    if (typeof o.theme !== 'string' || !o.theme.trim()) throw new Error(`entry ${i} is missing a string "theme"`)
    if (typeof o.subject !== 'string' || !o.subject.trim()) throw new Error(`entry ${i} is missing a string "subject"`)
    const input: PoolAddInput = { theme: o.theme, subject: o.subject }
    if (Array.isArray(o.lanes)) input.lanes = o.lanes as LaneName[]
    if (o.laneOverrides && typeof o.laneOverrides === 'object') input.laneOverrides = o.laneOverrides as Record<string, LaneName[]>
    if (typeof o.setOf === 'number') input.setOf = o.setOf
    return input
  })
}

async function cmdPoolAdd(): Promise<void> {
  const file = arg('--file')
  if (!file) throw new Error('usage: xs-candidates.ts pool-add --as <name> --file <subjects.json>')
  const inputs = readPoolAddInputs(file)
  if (!inputs.length) throw new Error(`${file} has no entries`)
  const out = await addPoolExtras(inputs, judgedBy())
  console.log(`added ${out.added.length} · rejected ${out.rejected.length}`)
  for (const a of out.added) console.log(`  + ${a.theme} · ${a.subject}`)
  for (const r of out.rejected) console.log(`  ✕ ${r.subject} — ${r.reason}`)
  if (out.added.length) {
    console.log('\nWritten to BulkAutopilotState.poolExtras (craft cross-stitch) — no branch, no push.')
    console.log('The planner merges these into the pool at plan time; run pool-check to see the shelf move.')
  }
}

async function cmdPoolList(): Promise<void> {
  const theme = arg('--theme') ?? undefined
  const rows = await listPoolExtras(theme)
  if (!rows.length) {
    console.log(theme ? `No pool-add subjects recorded for theme "${theme}".` : 'No pool-add subjects recorded yet.')
    return
  }
  const byTheme = new Map<string, typeof rows>()
  for (const r of rows) byTheme.set(r.theme, [...(byTheme.get(r.theme) ?? []), r])
  for (const [t, list] of byTheme) {
    console.log(`${t} (${list.length})`)
    for (const r of list) {
      const lanes = r.lanes?.length ? ` · lanes ${r.lanes.join('/')}` : ''
      console.log(`  ${r.subject} · added ${r.addedAt} by ${r.addedBy}${lanes}`)
    }
  }
  console.log(`\n${rows.length} pool-add subject${rows.length === 1 ? '' : 's'} on record.`)
}

async function cmdReport(): Promise<void> {
  const usage =
    'usage: xs-candidates.ts report --as <name> [--kind judging|weekly] (--text "<report>" | --file <path>)'
  const kindArg = arg('--kind') ?? 'judging'
  if (kindArg !== 'judging' && kindArg !== 'weekly') throw new Error(usage)
  const kind = kindArg as JudgingReportEntry['kind']
  const textArg = arg('--text')
  const fileArg = arg('--file')
  if (!textArg && !fileArg) throw new Error(usage)
  const text = (textArg ?? readFileSync(fileArg!, 'utf8')).trim()
  if (!text) throw new Error('report text is empty')
  const by = judgedBy()
  const entries = await addJudgingReport('cross-stitch', { by, kind, text })
  console.log(`report recorded for cross-stitch (${kind}) by ${by} — ${entries.length} of ${MAX_JUDGING_REPORTS} kept on the row`)
  console.log("Shown on the admin bulk-generation page's cross-stitch card.")
  console.log('---')
  console.log(text)
}

const USAGE = `usage: xs-candidates.ts <list | sheets | keep | reject | reroll | pool-check | pool-add | pool-list | report> [args] [--as NAME]`

async function main(): Promise<void> {
  const cmd = process.argv[2]
  switch (cmd) {
    case 'list':
      await cmdList()
      break
    case 'sheets':
      await cmdSheets()
      break
    case 'keep':
      await cmdKeep()
      break
    case 'reject':
      await cmdReject()
      break
    case 'reroll':
      await cmdReroll()
      break
    case 'pool-check':
      await cmdPoolCheck()
      break
    case 'pool-add':
      await cmdPoolAdd()
      break
    case 'pool-list':
      await cmdPoolList()
      break
    case 'report':
      await cmdReport()
      break
    default:
      throw new Error(USAGE)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
