/**
 * xs-samplers-build — chart every sampler design and render it as the picture
 * that would ship, so the set can be looked at before any of it goes live.
 *
 * Nothing here touches the database. It builds the charts, writes each render
 * to `scratchpad/samplers/renders`, lays them out on contact sheets by kind,
 * and prints the size, colour count and stitch count of each so the spread of
 * the set is visible as a table as well as a picture.
 *
 * Run from apps/web:
 *
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-build.ts
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-build.ts --only sampler-birth-rose-wreath,sampler-name-modern-type
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-build.ts --stress
 *
 * `--stress` re-letters every design with a very long name and a very short one
 * as well, which is the check that matters most: a sampler that only works for
 * "Amelia Rose" is not a sampler, it is a picture of one.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
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

import { computePatternMetrics } from '@homemade/db'
import { SAMPLER_DESIGNS } from '@/lib/studio/generation/samplers/designs'
import { buildSampler } from '@/lib/studio/generation/samplers/build'
import { buildSamplerBlocks } from '@/lib/studio/generation/samplers/build'
import { measureSamplerBlocks, personaliseSampler } from '@/lib/studio/generation/samplers/chart'
import { SAMPLER_KINDS, type SamplerKind } from '@/lib/studio/generation/samplers/kinds'
import { renderBeautyThumbnail } from '@/lib/studio/generation/bulk/beauty-thumbnail'
import { POST_SAT } from '@/lib/studio/generation/bulk/cross-stitch-style'

const OUT = resolve(process.cwd(), 'scratchpad', 'samplers')
const RENDERS = join(OUT, 'renders')

function arg(name: string, fallback = ''): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? (process.argv[i + 1] ?? fallback) : fallback
}

/** The awkward cases every design has to survive. */
const STRESS: Record<SamplerKind, Array<Record<string, string>>> = {
  birth: [
    { name: 'Bartholomew Fitzgerald', date: '2026-11-30', weight: '4.12 kg', length: '54 cm' },
    { name: 'Bo', date: '2026-01-01' },
  ],
  wedding: [
    { nameOne: 'Constantina', nameTwo: 'Bartholomew', date: '2026-09-14', place: 'The Old Barn, Shropshire' },
    { nameOne: 'Jo', nameTwo: 'Al', date: '2026-02-02' },
  ],
  'new-home': [
    { home: '112 Northumberland Terrace', date: '2026-08-19', names: 'The Fitzgerald-Marsh family' },
    { home: 'The Nook' },
  ],
  'name-and-date': [
    { name: 'Alexandrina Victoria', date: '2026-05-24', line: 'Stitched by her grandmother' },
    { name: 'Eve', date: '2026-07-04' },
  ],
  anniversary: [
    { nameOne: 'Wilhelmina', nameTwo: 'Christopher', date: '1975-12-24', years: 'Fifty years together' },
    { nameOne: 'Di', nameTwo: 'Ken', date: '2001-03-08' },
  ],
}

async function main(): Promise<void> {
  mkdirSync(RENDERS, { recursive: true })
  const only = arg('only')
  const stress = process.argv.includes('--stress')
  const why = process.argv.includes('--why')
  const designs = SAMPLER_DESIGNS.filter((d) => !only || only.split(',').includes(d.slug))

  if (why) {
    for (const design of designs) {
      const { blocks } = await buildSamplerBlocks(design)
      const rows = measureSamplerBlocks(blocks, design.kind, SAMPLER_KINDS[design.kind].sample)
      console.log(`\n${design.slug}  ${design.width}x${design.height}`)
      for (const r of rows) {
        const fits = r.wanted.width <= r.region.w && r.wanted.height <= r.region.h
        const can = r.floor.width <= r.region.w && r.floor.height <= r.region.h
        console.log(
          `   slot ${String(r.region.w).padStart(3)}x${String(r.region.h).padStart(3)} @${r.region.x},${r.region.y}` +
            `  wants ${String(r.wanted.width).padStart(3)}x${String(r.wanted.height).padStart(3)}` +
            `  floor ${String(r.floor.width).padStart(3)}x${String(r.floor.height).padStart(3)}` +
            `  ${fits ? 'fits' : can ? 'SHRINKS' : 'TOO SMALL'}   ${r.text.join(' / ')}`,
        )
      }
    }
    return
  }

  const byKind = new Map<SamplerKind, Array<{ label: string; png: Buffer }>>()
  const rows: string[] = []
  let failures = 0

  for (const design of designs) {
    try {
      const built = await buildSampler(design)
      const m = computePatternMetrics(built.data)
      const png = await renderBeautyThumbnail(built.data, POST_SAT)
      writeFileSync(join(RENDERS, `${design.slug}.png`), png)
      const list = byKind.get(design.kind) ?? []
      list.push({ label: `${design.slug} · ${m.widthCells}x${m.heightCells} · ${m.colourCount}c · ${m.totalStitches} st`, png })
      byKind.set(design.kind, list)
      rows.push(
        [
          design.slug.padEnd(40),
          design.look.padEnd(26),
          `${m.widthCells}x${m.heightCells}`.padEnd(9),
          `${m.colourCount}c`.padEnd(5),
          `${m.totalStitches} st`,
        ].join(' '),
      )

      if (stress) {
        for (const [i, values] of (STRESS[design.kind] ?? []).entries()) {
          const merged = { ...SAMPLER_KINDS[design.kind].sample, ...blankRest(design.kind, values) }
          const relettered = await personaliseSampler(built.data, built.meta, merged)
          const spng = await renderBeautyThumbnail(relettered, POST_SAT)
          writeFileSync(join(RENDERS, `${design.slug}--stress${i + 1}.png`), spng)
          const list2 = byKind.get(design.kind) ?? []
          list2.push({ label: `${design.slug} · stress ${i + 1}`, png: spng })
        }
      }
    } catch (err) {
      failures++
      console.error(`FAIL ${design.slug}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log('')
  for (const r of rows) console.log(r)
  console.log(`\n${rows.length} charted, ${failures} failed.`)

  for (const [kind, tiles] of byKind) {
    const path = join(OUT, `sheet-${kind}.png`)
    await sheet(tiles, path)
    console.log(`  ${path}`)
  }
  const all = [...byKind.values()].flat()
  await sheet(all, join(OUT, 'sheet-all.png'))
  console.log(`  ${join(OUT, 'sheet-all.png')}`)
  if (failures > 0) process.exitCode = 1
}

/**
 * A stress case replaces the sample wording rather than sitting on top of it,
 * so leaving the weight out of the case actually leaves the weight line off.
 */
function blankRest(kind: SamplerKind, values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const f of SAMPLER_KINDS[kind].fields) out[f.key] = values[f.key] ?? ''
  return out
}

const COLS = 4
const CW = 400
const IMGH = 350
const LABELH = 26

async function sheet(tiles: Array<{ label: string; png: Buffer }>, path: string): Promise<void> {
  if (tiles.length === 0) return
  const rows = Math.ceil(tiles.length / COLS)
  const W = COLS * CW
  const H = rows * (IMGH + LABELH)
  const composites: sharp.OverlayOptions[] = []
  const labels: string[] = []
  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i]!
    const x = (i % COLS) * CW
    const y = Math.floor(i / COLS) * (IMGH + LABELH)
    const img = await sharp(t.png)
      .resize(CW - 12, IMGH - 12, { fit: 'contain', background: { r: 250, g: 248, b: 244 } })
      .png()
      .toBuffer()
    const meta = await sharp(img).metadata()
    composites.push({ input: img, left: x + 6 + Math.round((CW - 12 - (meta.width ?? 0)) / 2), top: y + 6 })
    labels.push(
      `<rect x="${x}" y="${y + IMGH}" width="${CW}" height="${LABELH}" fill="#1a1a1a"/>` +
        `<text x="${x + 6}" y="${y + IMGH + 17}" font-family="DejaVu Sans" font-size="12" fill="#ffffff">${esc(t.label)}</text>`,
    )
  }
  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${labels.join('')}</svg>`
  const out = await sharp({ create: { width: W, height: H, channels: 3, background: { r: 250, g: 248, b: 244 } } })
    .composite([...composites, { input: Buffer.from(overlay), left: 0, top: 0 }])
    .png()
    .toBuffer()
  writeFileSync(path, out)
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
