/**
 * A LABELLED CONTACT SHEET OF WHAT THE GATE KILLED.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/xs-rejects-sheet.ts <runId> [out.png]
 *
 * A bulk run records up to twenty rejected renders on `BulkRun.rejectSamples`
 * (uploaded to `bulk-rejects/<runId>/` in R2 as each terminal cull and each pale
 * skip happens). The admin page shows them as a strip of thumbnails; this builds
 * the close look — every reject at a readable size with its slug, lane, colour
 * count, verdict and the gate's own words underneath.
 *
 * It exists because a cull used to leave one 80-character sentence behind, which
 * is not enough to tell a correct kill from an over-tight guard, and not enough
 * to calibrate the pale floor against anything but the work that already
 * shipped. Run it after a bad batch and look at the pictures.
 */
import { readFileSync, writeFileSync } from 'node:fs'
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

interface RejectSample {
  slug: string
  attempt: number
  url: string
  verdict: string
  reasons: string[]
  lane: string
  shelf: string
  colours: number
}

const CELL = 340
const LABEL = 74
const COLS = 4
const PAD = 10

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Two lines of reasons, hard-wrapped — the gate's own words, not a summary. */
function wrap(text: string, perLine: number, lines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const out: string[] = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > perLine) {
      out.push(line.trim())
      line = w
      if (out.length === lines) break
    } else {
      line = `${line} ${w}`
    }
  }
  if (out.length < lines && line.trim()) out.push(line.trim())
  return out.slice(0, lines)
}

async function main(): Promise<void> {
  const runId = process.argv[2]
  if (!runId) {
    console.error('usage: tsx scripts/xs-rejects-sheet.ts <runId> [out.png]')
    process.exit(1)
  }
  const out = process.argv[3] ?? `xs-rejects-${runId}.png`

  const run = await prisma.bulkRun.findUnique({
    where: { id: runId },
    select: { id: true, craft: true, startedAt: true, summary: true, rejectSamples: true },
  })
  if (!run) throw new Error(`no BulkRun ${runId}`)
  const samples = (Array.isArray(run.rejectSamples) ? run.rejectSamples : []) as unknown as RejectSample[]
  if (!samples.length) {
    console.log(`run ${runId} kept no reject samples (an older run, or nothing was culled)`)
    return
  }

  const rows = Math.ceil(samples.length / COLS)
  const width = COLS * (CELL + PAD) + PAD
  const height = rows * (CELL + LABEL + PAD) + PAD + 34
  const composites: sharp.OverlayOptions[] = []

  const head = `<svg width="${width}" height="34"><text x="${PAD}" y="22" font-size="15" font-family="sans-serif" fill="#3a2f2a">${esc(
    `Rejected renders — run ${run.id} (${new Date(run.startedAt).toISOString().slice(0, 16).replace('T', ' ')}) · ${samples.length} kept`,
  )}</text></svg>`
  composites.push({ input: Buffer.from(head), left: 0, top: 0 })

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]!
    const x = PAD + (i % COLS) * (CELL + PAD)
    const y = 34 + PAD + Math.floor(i / COLS) * (CELL + LABEL + PAD)
    try {
      const res = await fetch(s.url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const img = await sharp(buf).flatten({ background: '#FCFAF6' }).resize(CELL, CELL, { fit: 'inside' }).png().toBuffer()
      composites.push({ input: img, left: x, top: y })
    } catch (err) {
      console.warn(`could not fetch ${s.url}: ${err instanceof Error ? err.message : String(err)}`)
    }
    const reasonLines = wrap(s.reasons.join(' · ') || '—', 58, 2)
      .map((line, n) => `<text x="0" y="${44 + n * 13}" font-size="11" font-family="sans-serif" fill="#6b5d55">${esc(line)}</text>`)
      .join('')
    const label = `<svg width="${CELL}" height="${LABEL}">
      <text x="0" y="13" font-size="12" font-family="sans-serif" fill="#3a2f2a">${esc(`${s.slug} · a${s.attempt}`)}</text>
      <text x="0" y="27" font-size="11" font-family="sans-serif" fill="#6b5d55">${esc(`${s.lane} · ${s.shelf} · ${s.colours} colours · ${s.verdict}`)}</text>
      ${reasonLines}
    </svg>`
    composites.push({ input: Buffer.from(label), left: x, top: y + CELL + 2 })
  }

  const png = await sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite(composites)
    .png()
    .toBuffer()
  writeFileSync(out, png)
  console.log(`${out} — ${samples.length} rejects from ${run.summary ?? run.id}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
