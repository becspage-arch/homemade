/**
 * xs-run-review — the daily judging pack for the cross-stitch autopilot.
 *
 * Lists every cross-stitch BulkRun started since a timestamp, downloads the
 * thumbnails of the gems each run published, and builds one labelled contact
 * sheet per run (3 per row, 560 px cells) so a reviewer can LOOK at every new
 * gem at readable size. Prints a plain summary per run and the sheet paths.
 *
 *   cd apps/web && HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-run-review.ts 2026-09-06T00:00:00Z [outDir]
 *
 * Read-only. Pair with scripts/xs-rejects-sheet.ts <runId> for the culls and
 * scripts/xs-cull.ts <cull.json> --apply to retire a gem that fails the bar.
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
    /* env from shell */
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? '.env.credentials')

import { prisma } from '@homemade/db'

const CELL = 560
const BAND = 44
const COLS = 3

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

async function main(): Promise<void> {
  const since = process.argv[2]
  if (!since) throw new Error('usage: xs-run-review.ts <sinceISO> [outDir]')
  const outDir = process.argv[3] ?? `./xs-run-review-${since.slice(0, 10)}`
  mkdirSync(outDir, { recursive: true })
  const base = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')
  if (!base) throw new Error('R2_PUBLIC_BASE_URL not set')

  const runs = await prisma.bulkRun.findMany({
    where: { craft: 'cross-stitch', startedAt: { gte: new Date(since) } },
    orderBy: { startedAt: 'asc' },
  })
  if (!runs.length) {
    console.log(`No cross-stitch runs since ${since}.`)
    await prisma.$disconnect()
    return
  }

  let totalGems = 0
  for (const run of runs) {
    const r = run as typeof run & { summary?: string | null; finishedAt?: Date | null; duplicates?: number; parked?: number }
    const gems = await prisma.pattern.findMany({
      where: { slug: { in: run.gemSlugs } },
      select: {
        slug: true,
        colourCount: true,
        widthCells: true,
        heightCells: true,
        visibility: true,
        subCategory: { select: { slug: true } },
        thumbnail: { select: { r2Key: true } },
      },
    })
    const state = r.finishedAt ? 'finished' : 'in flight'
    console.log(
      `\n${run.startedAt.toISOString()} ${run.trigger} ${state} · published ${run.published} · culled ${run.culled} · parked ${r.parked ?? 0} · duplicates ${r.duplicates ?? 0} · errors ${run.errors}`,
    )
    if (r.summary) console.log(`  ${r.summary}`)
    const tiles: Buffer[] = []
    for (const g of gems) {
      if (!g.thumbnail?.r2Key) continue
      const res = await fetch(`${base}/${g.thumbnail.r2Key}`)
      if (!res.ok) {
        console.log(`  ${g.slug}: thumbnail fetch ${res.status}`)
        continue
      }
      const png = Buffer.from(await res.arrayBuffer())
      const label = `${g.slug} | ${g.subCategory?.slug ?? '?'} | ${g.colourCount} col | ${g.widthCells}x${g.heightCells}${g.visibility !== 'PUBLIC' ? ' | ' + g.visibility : ''}`
      console.log(`  gem  ${label}`)
      tiles.push(await labelledTile(png, label))
      writeFileSync(`${outDir}/${g.slug}.png`, png)
      totalGems++
    }
    if (tiles.length) {
      const file = `${outDir}/run-${run.startedAt.toISOString().slice(0, 16).replace(/[:T]/g, '-')}-${run.id.slice(-6)}.png`
      writeFileSync(file, await sheet(tiles, `${run.startedAt.toISOString()} ${run.trigger} · ${tiles.length} gems`))
      console.log(`  sheet ${file}`)
    }
    if (run.killReasons.length) console.log(`  kills: ${run.killReasons.slice(0, 12).join(' · ')}`)
  }
  console.log(`\n${runs.length} runs, ${totalGems} gems downloaded to ${outDir}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
