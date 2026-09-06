/**
 * maker-photos-judge — the judging CLI for maker photos.
 *
 * Only used when the maker-photo gate is in 'routine' mode (the admin switch on
 * /admin/system/bulk-generation, or MAKER_PHOTO_GATE_MODE=routine). In the
 * default 'api' mode the gate runs on upload and the pending queue stays empty,
 * which is the point: a member gets an answer while they are still standing
 * there.
 *
 * Run from apps/web:
 *
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/maker-photos-judge.ts sheets [--out DIR]
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/maker-photos-judge.ts approve <photoId…>
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/maker-photos-judge.ts reject <rejects.json> [--apply]
 *
 * `rejects.json` is an array of { photoId, reason }. The reason is shown to the
 * member, so write it as a sentence to a person.
 *
 * THE BAR IS THE SAME THREE RULES THE API GATE JUDGES AGAINST, and nothing
 * else. They are printed by `sheets` and live in
 * `apps/web/src/lib/maker-photo-rules.ts`, which is also where the gate's
 * system prompt is built from — one bar, whoever is looking.
 *
 * Two queues, both worked from here:
 *  - PENDING_MODERATION — nothing has judged the photo yet.
 *  - REJECTED with an appeal — the member pressed "Ask us to look again".
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

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

import { prisma, PatternType, UGCPhotoStatus } from '@homemade/db'
import {
  MAKER_PHOTO_NOT_A_REJECT,
  MAKER_PHOTO_RULES,
  PATTERN_TYPE_LABEL,
} from '@/lib/maker-photo-rules'

const CELL = 560
const BAND = 44
const COLS = 3
const PER_SHEET = COLS * COLS

const USAGE = `usage (run from apps/web):
  maker-photos-judge.ts sheets [--out DIR]              contact sheets for everything waiting
  maker-photos-judge.ts approve <photoId…>              approve, first look or appeal
  maker-photos-judge.ts reject <rejects.json> [--apply] reject with a reason per photo`

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : null
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** The bar, printed before anything is judged. Same words as the API gate. */
function printBar(): void {
  console.log('The bar — a photo passes all three or it does not go up:')
  for (const [i, rule] of MAKER_PHOTO_RULES.entries()) console.log(`  ${i + 1}. ${rule}`)
  console.log(`\nNot a reject: ${MAKER_PHOTO_NOT_A_REJECT}\n`)
}

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

// ────────────────────────────────────────────────────────────────────────────
// The queues
// ────────────────────────────────────────────────────────────────────────────

interface Row {
  id: string
  caption: string | null
  createdAt: Date
  tutorialId: string | null
  patternId: string | null
  patternType: PatternType | null
  r2Key: string | null
  rejectionReason: string | null
  appealNote: string | null
}

const SELECT = {
  id: true,
  caption: true,
  createdAt: true,
  tutorialId: true,
  patternId: true,
  patternType: true,
  rejectionReason: true,
  appealNote: true,
  media: { select: { r2Key: true } },
} as const

type Raw = {
  id: string
  caption: string | null
  createdAt: Date
  tutorialId: string | null
  patternId: string | null
  patternType: PatternType | null
  rejectionReason: string | null
  appealNote: string | null
  media: { r2Key: string | null } | null
}

function toRow(r: Raw): Row {
  return {
    id: r.id,
    caption: r.caption,
    createdAt: r.createdAt,
    tutorialId: r.tutorialId,
    patternId: r.patternId,
    patternType: r.patternType,
    r2Key: r.media?.r2Key ?? null,
    rejectionReason: r.rejectionReason,
    appealNote: r.appealNote,
  }
}

/** Nothing has judged these yet. */
async function pendingRows(): Promise<Row[]> {
  const rows = await prisma.uGCPhoto.findMany({
    where: { status: UGCPhotoStatus.PENDING_MODERATION, removedAt: null },
    orderBy: { createdAt: 'asc' },
    take: 200,
    select: SELECT,
  })
  return rows.map(toRow)
}

/** "Ask us to look again" — the only queue a person ever works in 'api' mode. */
async function appealRows(): Promise<Row[]> {
  const rows = await prisma.uGCPhoto.findMany({
    where: { appealRequestedAt: { not: null }, removedAt: null },
    orderBy: { appealRequestedAt: 'asc' },
    take: 200,
    select: SELECT,
  })
  return rows.map(toRow)
}

/**
 * What the photo is supposed to show. Rule 2 is "plausibly the right thing", so
 * the judge has to be told what the thing is. Titles only — no `server-only`
 * imports, so this stays runnable as a plain script.
 */
async function describeTarget(row: Row): Promise<string> {
  if (row.tutorialId) {
    const t = await prisma.tutorial.findUnique({
      where: { id: row.tutorialId },
      select: { title: true },
    })
    return t ? t.title : 'unknown tutorial'
  }
  if (!row.patternId || !row.patternType) return 'no target'
  const kind = PATTERN_TYPE_LABEL[row.patternType]
  const id = row.patternId
  const p =
    row.patternType === PatternType.CROSS_STITCH
      ? await prisma.pattern.findUnique({ where: { id }, select: { name: true } })
      : row.patternType === PatternType.NEEDLEWORK
        ? await prisma.needleworkPattern.findUnique({ where: { id }, select: { name: true } })
        : row.patternType === PatternType.CROCHET_CHART
          ? await prisma.crochetPattern.findUnique({ where: { id }, select: { name: true } })
          : row.patternType === PatternType.KNITTING_CHART
            ? await prisma.knittingPattern.findUnique({ where: { id }, select: { name: true } })
            : await prisma.sewingPattern.findUnique({ where: { id }, select: { name: true } })
  return `${p?.name ?? 'unknown'} (${kind})`
}

// ────────────────────────────────────────────────────────────────────────────
// sheets
// ────────────────────────────────────────────────────────────────────────────

async function buildSheets(rows: Row[], outDir: string, base: string, group: string): Promise<number> {
  if (!rows.length) return 0
  mkdirSync(outDir, { recursive: true })
  const tiles: { tile: Buffer; id: string; label: string }[] = []
  for (const p of rows) {
    if (!p.r2Key) {
      console.log(`  ${p.id}: no media key — skipped`)
      continue
    }
    const res = await fetch(`${base}/${p.r2Key}`)
    if (!res.ok) {
      console.log(`  ${p.id}: fetch ${res.status}`)
      continue
    }
    const bytes = Buffer.from(await res.arrayBuffer())
    const png = await sharp(bytes).png().toBuffer()
    writeFileSync(`${outDir}/${p.id}.png`, png)
    const title = await describeTarget(p)
    const label = `${p.id} | ${title}${p.caption ? ` | “${p.caption.slice(0, 50)}”` : ''}`
    tiles.push({ tile: await labelledTile(png, label), id: p.id, label })
  }

  for (let i = 0; i < tiles.length; i += PER_SHEET) {
    const slice = tiles.slice(i, i + PER_SHEET)
    const n = Math.floor(i / PER_SHEET) + 1
    const file = `${outDir}/${group}-sheet-${String(n).padStart(2, '0')}.png`
    writeFileSync(
      file,
      await sheet(
        slice.map((t) => t.tile),
        `${group} ${i + 1}–${i + slice.length} of ${tiles.length}`,
      ),
    )
    console.log(`sheet ${file}`)
    for (const t of slice) console.log(`  ${t.label}`)
  }
  return tiles.length
}

async function cmdSheets(): Promise<void> {
  const outDir = arg('--out') ?? `./maker-photos-${new Date().toISOString().slice(0, 10)}`
  const base = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')
  if (!base) throw new Error('R2_PUBLIC_BASE_URL not set')

  printBar()

  const waiting = await pendingRows()
  const appeals = await appealRows()
  if (!waiting.length && !appeals.length) {
    console.log('Nothing waiting and no appeals.')
    return
  }

  let total = 0
  if (waiting.length) {
    console.log(`\nWaiting for a first look — ${waiting.length}:`)
    total += await buildSheets(waiting, outDir, base, 'pending')
  }
  if (appeals.length) {
    console.log(`\nAsked us to look again — ${appeals.length}:`)
    for (const a of appeals) {
      console.log(
        `  ${a.id}: was rejected for “${a.rejectionReason ?? 'no reason recorded'}”${a.appealNote ? ` · they say: “${a.appealNote.slice(0, 120)}”` : ''}`,
      )
    }
    total += await buildSheets(appeals, outDir, base, 'appeal')
  }
  console.log(`\n${total} photo${total === 1 ? '' : 's'} to judge, in ${outDir}`)
}

// ────────────────────────────────────────────────────────────────────────────
// approve / reject
// ────────────────────────────────────────────────────────────────────────────

/**
 * Split the ids into the ones this session may decide and the ones it must
 * leave alone. A first look and an appeal are written differently: a first look
 * records the routine's verdict on the row, an appeal overrides one that is
 * already there and only clears the queue flag.
 */
async function partition(ids: string[]): Promise<{
  firstLook: string[]
  appeal: string[]
  skipped: string[]
}> {
  const rows = await prisma.uGCPhoto.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true, removedAt: true, appealRequestedAt: true },
  })
  const found = new Map(rows.map((r) => [r.id, r]))
  const firstLook: string[] = []
  const appeal: string[] = []
  const skipped: string[] = []
  for (const id of ids) {
    const r = found.get(id)
    if (!r || r.removedAt) skipped.push(id)
    else if (r.appealRequestedAt) appeal.push(id)
    else if (r.status === UGCPhotoStatus.PENDING_MODERATION) firstLook.push(id)
    else skipped.push(id)
  }
  return { firstLook, appeal, skipped }
}

async function cmdApprove(): Promise<void> {
  const ids = process.argv.slice(3).filter((a) => !a.startsWith('--'))
  if (!ids.length) throw new Error('usage: maker-photos-judge.ts approve <photoId…>')
  const { firstLook, appeal, skipped } = await partition(ids)
  const now = new Date()

  let done = 0
  if (firstLook.length) {
    const res = await prisma.uGCPhoto.updateMany({
      where: { id: { in: firstLook } },
      data: {
        status: UGCPhotoStatus.APPROVED,
        rejectionReason: null,
        moderatedAt: now,
        gateVerdict: { decision: 'approve', reasons: [], by: 'routine' },
      },
    })
    done += res.count
  }
  if (appeal.length) {
    // Mirrors decidePhotoAppeal: the appeal decision overrides the verdict but
    // does not rewrite what the gate originally said.
    const res = await prisma.uGCPhoto.updateMany({
      where: { id: { in: appeal } },
      data: {
        status: UGCPhotoStatus.APPROVED,
        rejectionReason: null,
        appealRequestedAt: null,
        moderatedAt: now,
      },
    })
    done += res.count
  }
  console.log(
    `approved ${done} of ${ids.length} (${firstLook.length} first look, ${appeal.length} appeal)`,
  )
  if (skipped.length) console.log(`left alone (removed or already judged): ${skipped.join(', ')}`)
}

async function cmdReject(): Promise<void> {
  const file = process.argv[3]
  const apply = process.argv.includes('--apply')
  if (!file || file.startsWith('--')) throw new Error('usage: maker-photos-judge.ts reject <rejects.json> [--apply]')
  const recs: { photoId: string; reason: string }[] = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(recs) || recs.some((r) => !r?.photoId || !r?.reason)) {
    throw new Error('rejects.json must be an array of { photoId, reason }')
  }
  if (!apply) {
    console.log(`DRY RUN · ${recs.length} photo${recs.length === 1 ? '' : 's'} would be rejected:`)
    for (const r of recs) console.log(`  ${r.photoId} — ${r.reason}`)
    console.log('Re-run with --apply to write it.')
    return
  }

  const { firstLook, appeal, skipped } = await partition(recs.map((r) => r.photoId))
  const decidable = new Set([...firstLook, ...appeal])
  const isAppeal = new Set(appeal)
  const now = new Date()
  let done = 0
  for (const r of recs) {
    if (!decidable.has(r.photoId)) continue
    const reason = r.reason.slice(0, 400)
    const res = await prisma.uGCPhoto.updateMany({
      where: { id: r.photoId },
      data: isAppeal.has(r.photoId)
        ? {
            status: UGCPhotoStatus.REJECTED,
            rejectionReason: reason,
            appealRequestedAt: null,
            moderatedAt: now,
          }
        : {
            status: UGCPhotoStatus.REJECTED,
            rejectionReason: reason,
            moderatedAt: now,
            gateVerdict: { decision: 'reject', reasons: [reason], by: 'routine' },
          },
    })
    done += res.count
  }
  console.log(`rejected ${done} of ${recs.length}`)
  if (skipped.length) console.log(`left alone (removed or already judged): ${skipped.join(', ')}`)
}

async function main(): Promise<void> {
  const cmd = process.argv[2]
  if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') {
    console.log(USAGE)
    console.log()
    printBar()
    return
  }
  try {
    if (cmd === 'sheets') await cmdSheets()
    else if (cmd === 'approve') await cmdApprove()
    else if (cmd === 'reject') await cmdReject()
    else throw new Error(USAGE)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
