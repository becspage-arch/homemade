/** Build labelled contact sheets from cached thumbnails.
 *  Usage: tsx scripts/xs-sheet.ts <label> <mode> [arg]
 *    mode=sub  arg=<subSlug>     -> all patterns in that sub-category, paginated
 *    mode=slugs arg=<file.json>  -> slugs listed in a JSON array file
 *  Reads scratchpad/xs-manifest.json. Writes scratchpad/sheets/<label>-NN.png */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const SCRATCH = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-jolly-visvesvaraya-564eb8/a77e9b9e-ee18-4618-899c-bbd75803d8b3/scratchpad'
const OUT = resolve(SCRATCH, 'sheets')
const COLS = 6
const ROWS = 5
const PER = COLS * ROWS
const CW = 250
const IMGH = 188
const LABELH = 30
const CH = IMGH + LABELH

interface Rec { slug: string; name: string; colourCount: number; w: number; h: number; sub: string | null; file: string | null }

function esc(s: string): string { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

async function buildPage(recs: Rec[], label: string, page: number, total: number): Promise<void> {
  const W = COLS * CW
  const H = ROWS * CH
  const composites: sharp.OverlayOptions[] = []
  const labels: string[] = []
  for (let i = 0; i < recs.length; i++) {
    const r = recs[i]!
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = col * CW
    const y = row * CH
    if (r.file && existsSync(r.file)) {
      const img = await sharp(r.file).resize(CW - 8, IMGH - 8, { fit: 'contain', background: { r: 250, g: 248, b: 244 } }).png().toBuffer()
      const meta = await sharp(img).metadata()
      composites.push({ input: img, left: x + 4 + Math.round(((CW - 8) - (meta.width ?? CW - 8)) / 2), top: y + 4 })
    }
    const t1 = esc(r.slug.length > 30 ? r.slug.slice(0, 29) + '…' : r.slug)
    const t2 = `${r.colourCount}col ${r.w}x${r.h}`
    labels.push(
      `<rect x="${x}" y="${y + IMGH}" width="${CW}" height="${LABELH}" fill="#1a1a1a"/>` +
      `<text x="${x + 5}" y="${y + IMGH + 13}" font-family="Arial" font-size="11" fill="#fff">${t1}</text>` +
      `<text x="${x + 5}" y="${y + IMGH + 26}" font-family="Arial" font-size="10" fill="#9fd">${t2}</text>`,
    )
  }
  const overlaySvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${labels.join('')}</svg>`
  const base = sharp({ create: { width: W, height: H, channels: 3, background: { r: 250, g: 248, b: 244 } } })
  const out = await base.composite([...composites, { input: Buffer.from(overlaySvg), left: 0, top: 0 }]).png().toBuffer()
  const path = resolve(OUT, `${label}-${String(page).padStart(2, '0')}of${total}.png`)
  writeFileSync(path, out)
  console.log(`  ${path}  (${recs.length} tiles)`)
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  const [label, mode, arg] = process.argv.slice(2)
  const manifest: Rec[] = JSON.parse(readFileSync(resolve(SCRATCH, 'xs-manifest.json'), 'utf8'))
  let recs: Rec[]
  if (mode === 'sub') {
    recs = manifest.filter((r) => r.sub === arg)
  } else if (mode === 'slugs') {
    const slugs: string[] = JSON.parse(readFileSync(resolve(arg!), 'utf8'))
    const bySlug = new Map(manifest.map((r) => [r.slug, r]))
    recs = slugs.map((s) => bySlug.get(s)).filter(Boolean) as Rec[]
  } else { throw new Error('mode must be sub|slugs') }
  const pages = Math.ceil(recs.length / PER)
  console.log(`${label}: ${recs.length} patterns -> ${pages} page(s)`)
  for (let p = 0; p < pages; p++) {
    await buildPage(recs.slice(p * PER, (p + 1) * PER), label, p + 1, pages)
  }
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
