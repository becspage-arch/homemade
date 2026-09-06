/**
 * maker-photos-judge — the judging CLI for member finished-project photos.
 *
 * Only used when the maker-photo gate is in 'routine' mode (the admin switch, or
 * MAKER_PHOTO_GATE_MODE=routine). In the default 'api' mode the check runs on
 * upload and this queue stays empty, which is the point: a member gets an answer
 * while they are still standing there.
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
 * THE BAR IS THE THREE RULES the API gate judges against, and nothing else — they
 * are printed by `sheets` and live in `apps/web/src/lib/maker-photo-rules.ts`. A
 * dim, wonky, cluttered snap of a real finished piece PASSES: that is what a real
 * maker sends, and rejecting it for being unstyled is rejecting the point.
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

import { prisma, UserPhotoStatus } from '@homemade/db'
import { MAKER_PHOTO_RULES, MAKER_PHOTO_NOT_A_REJECT } from '@/lib/maker-photo-rules'

const CELL = 560
const BAND = 44
const COLS = 3
const PER_SHEET = COLS * COLS

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : null
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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

async function pending(): Promise<
  { id: string; caption: string | null; createdAt: Date; patternType: string; r2Key: string | null }[]
> {
  const rows = await prisma.userPatternPhoto.findMany({
    where: { status: UserPhotoStatus.PENDING },
    orderBy: { createdAt: 'asc' },
    take: 200,
    select: {
      id: true,
      caption: true,
      createdAt: true,
      patternType: true,
      media: { select: { r2Key: true } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    caption: r.caption,
    createdAt: r.createdAt,
    patternType: String(r.patternType),
    r2Key: r.media?.r2Key ?? null,
  }))
}

async function cmdSheets(): Promise<void> {
  const outDir = arg('--out') ?? `./maker-photos-${new Date().toISOString().slice(0, 10)}`
  const base = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')
  if (!base) throw new Error('R2_PUBLIC_BASE_URL not set')
  const rows = await pending()
  console.log('The bar — a photo passes all three or it does not go up:')
  for (const [i, rule] of MAKER_PHOTO_RULES.entries()) console.log(`  ${i + 1}. ${rule}`)
  console.log(`\nNot a reject: ${MAKER_PHOTO_NOT_A_REJECT}`)
  if (!rows.length) {
    console.log('\nNothing waiting.')
    return
  }
  mkdirSync(outDir, { recursive: true })

  const tiles: { tile: Buffer; id: string }[] = []
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
    const label = `${p.id} | ${p.patternType}${p.caption ? ` | “${p.caption.slice(0, 60)}”` : ''}`
    tiles.push({ tile: await labelledTile(png, label), id: p.id })
  }

  for (let i = 0; i < tiles.length; i += PER_SHEET) {
    const slice = tiles.slice(i, i + PER_SHEET)
    const n = Math.floor(i / PER_SHEET) + 1
    const file = `${outDir}/sheet-${String(n).padStart(2, '0')}.png`
    writeFileSync(file, await sheet(slice.map((t) => t.tile), `pending maker photos ${i + 1}–${i + slice.length} of ${tiles.length}`))
    console.log(`sheet ${file}`)
    for (const t of slice) console.log(`  ${t.id}`)
  }
  console.log(`\n${tiles.length} photo${tiles.length === 1 ? '' : 's'} waiting, in ${outDir}`)
}

async function cmdApprove(): Promise<void> {
  const ids = process.argv.slice(3).filter((a) => !a.startsWith('--'))
  if (!ids.length) throw new Error('usage: maker-photos-judge.ts approve <photoId…>')
  const now = new Date()
  const res = await prisma.userPatternPhoto.updateMany({
    where: { id: { in: ids }, status: UserPhotoStatus.PENDING },
    data: { status: UserPhotoStatus.APPROVED, reviewedAt: now, reviewNotes: null },
  })
  console.log(`approved ${res.count} of ${ids.length} (anything already judged is left alone)`)
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
  let done = 0
  const now = new Date()
  for (const r of recs) {
    const res = await prisma.userPatternPhoto.updateMany({
      where: { id: r.photoId, status: UserPhotoStatus.PENDING },
      data: { status: UserPhotoStatus.REJECTED, reviewedAt: now, reviewNotes: r.reason.slice(0, 400) },
    })
    done += res.count
  }
  console.log(`rejected ${done} of ${recs.length} (anything already judged is left alone)`)
}

async function main(): Promise<void> {
  const cmd = process.argv[2]
  if (cmd === 'sheets') await cmdSheets()
  else if (cmd === 'approve') await cmdApprove()
  else if (cmd === 'reject') await cmdReject()
  else throw new Error('usage: maker-photos-judge.ts <sheets | approve | reject> [args]')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
