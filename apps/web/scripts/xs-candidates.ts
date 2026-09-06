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
 *
 * `keep` and `reject` are idempotent and reversible: nothing is deleted, every
 * decision is written on the row (`candidateStatus`, `judgedAt`, `judgedBy`,
 * `judgeReasons`) and a rejected candidate keeps its thumbnail — it is the
 * reject sample now, and the calibration record for the locked bar.
 *
 * `--as NAME` labels the decision (default: the CLAUDE_SESSION_ID, else
 * 'claude-session'), so `judgedBy` says which session did it.
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
  CANDIDATE_SWEEP_DAYS,
  MAX_CANDIDATE_REROLLS,
  type PendingCandidate,
} from '@/lib/studio/generation/bulk/candidates'

const CELL = 560
const BAND = 44
const COLS = 3
const PER_SHEET = COLS * COLS

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : null
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
  const slugs = process.argv.slice(3).filter((a) => !a.startsWith('--'))
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
  const slugs = process.argv.slice(3).filter((a) => !a.startsWith('--'))
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

const USAGE = `usage: xs-candidates.ts <list | sheets | keep | reject | reroll | pool-check> [args] [--as NAME]`

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
    default:
      throw new Error(USAGE)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
