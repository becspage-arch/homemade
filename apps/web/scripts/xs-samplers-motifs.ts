/**
 * xs-samplers-motifs — draw the illustrated motifs the samplers are built from,
 * and put them on a sheet to be looked at.
 *
 * Every motif is generated a few times, converted with the catalogue's own
 * converter and bare-fabric rule, and rendered as the chart that would actually
 * ship. Nothing is chosen automatically: the sheet exists so a session can look
 * at the pieces full size and write the chosen variant into the design.
 *
 * Art is cached under `scratchpad/sampler-motifs`, so a second run of this or of
 * the build script spends nothing. Run from apps/web:
 *
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-samplers-motifs.ts [--variants 4] [--only id,id]
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

import { MOTIFS, motifArt, motifIsCached, type MotifId } from '@/lib/studio/generation/samplers/motifs'
import { artChart } from '@/lib/studio/generation/samplers/preview'
import { renderBeautyThumbnail } from '@/lib/studio/generation/bulk/beauty-thumbnail'
import { POST_SAT } from '@/lib/studio/generation/bulk/cross-stitch-style'

const OUT = resolve(process.cwd(), 'scratchpad', 'samplers', 'motifs')

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? (process.argv[i + 1] ?? fallback) : fallback
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  const variants = Number(arg('variants', '4'))
  const only = arg('only', '')
  const ids = (Object.keys(MOTIFS) as MotifId[]).filter((id) => !only || only.split(',').includes(id))

  const tiles: Array<{ label: string; png: Buffer }> = []
  let generated = 0

  for (const id of ids) {
    const spec = MOTIFS[id]
    for (let v = 1; v <= variants; v++) {
      if (!motifIsCached(spec, v)) generated++
      let art
      try {
        art = await motifArt(spec, v)
      } catch (err) {
        console.error(`  ${id} v${v}: ${err instanceof Error ? err.message : String(err)}`)
        continue
      }
      const chart = artChart(art.art, art.width, art.height)
      const png = await renderBeautyThumbnail(chart, POST_SAT)
      writeFileSync(join(OUT, `${id}-v${v}.png`), png)
      tiles.push({ label: `${id} v${v} · ${chart.palette.length}c ${chart.grid.width}x${chart.grid.height}`, png })
      console.log(`  ${id} v${v}: ${chart.palette.length} colours, ${chart.grid.width}x${chart.grid.height}`)
    }
  }

  await sheet(tiles, join(OUT, 'motif-sheet.png'))
  console.log(`\n${tiles.length} motif renders. Newly generated this run: ${generated}.`)
  console.log(`Sheet: ${join(OUT, 'motif-sheet.png')}`)
}

const COLS = 4
const CW = 340
const IMGH = 300
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
      .resize(CW - 10, IMGH - 10, { fit: 'contain', background: { r: 250, g: 248, b: 244 } })
      .png()
      .toBuffer()
    const meta = await sharp(img).metadata()
    composites.push({ input: img, left: x + 5 + Math.round((CW - 10 - (meta.width ?? 0)) / 2), top: y + 5 })
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
