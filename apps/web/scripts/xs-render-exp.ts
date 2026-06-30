/** Render-look experiment: try fabric brightness + saturation + post-contrast on a
 *  cached flux image, tile variants for comparison. Not committed to pipeline. */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
function loadEnvFile(path: string): void {
  try { for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) { const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line); if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '') } } catch { /* */ }
}
loadEnvFile('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')
import sharp from 'sharp'
import { photoToPatternData } from '@/lib/studio/photo-to-pattern'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'

const PILOT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/jolly-visvesvaraya-564eb8/.loom-scratch/needlework/ai-pilot'
const S = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-jolly-visvesvaraya-564eb8/a77e9b9e-ee18-4618-899c-bbd75803d8b3/scratchpad'

interface Variant { label: string; fabric: string; sat: number; postSat: number; postBri: number }
const VARIANTS: Variant[] = [
  { label: 'now sat1.3 cream', fabric: '#F5EBD8', sat: 1.3, postSat: 1.0, postBri: 1.0 },
  { label: 'sat1.5 cream', fabric: '#F5EBD8', sat: 1.5, postSat: 1.0, postBri: 1.0 },
  { label: 'sat1.5 brightaida', fabric: '#FBF6EC', sat: 1.5, postSat: 1.0, postBri: 1.0 },
  { label: 'sat1.6 white +post', fabric: '#FDFBF7', sat: 1.6, postSat: 1.15, postBri: 1.04 },
]

// Bright ivory aida; modest in-render sat since the SOURCE is pre-saturated.
const FABRIC = '#FCFAF6'

async function renderVariant(slug: string, w: number, h: number, colours: number, srcSat: number, renderSat: number): Promise<Buffer> {
  let img = readFileSync(resolve(PILOT, `${slug}.flux.png`))
  if (srcSat !== 1) img = await sharp(img).modulate({ saturation: srcSat }).png().toBuffer()
  const { data } = await photoToPatternData(img, { width: w, height: h, colours, fabricCount: 14, brand: 'DMC', confettiMin: 'medium', backgroundRemoval: false })
  data.fabric.colourRgb = FABRIC
  const bb = stitchedBoundingBox(data)
  const mg = 2
  const region = bb ? { x: Math.max(0, bb.minX - mg), y: Math.max(0, bb.minY - mg), width: Math.min(data.grid.width, bb.maxX + 1 + mg) - Math.max(0, bb.minX - mg), height: Math.min(data.grid.height, bb.maxY + 1 + mg) - Math.max(0, bb.minY - mg) } : undefined
  const rw = region?.width ?? data.grid.width
  const cellPx = rw <= 70 ? 26 : rw <= 130 ? 16 : 10
  const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cellPx * 0.8), region, saturation: renderSat })
  return sharp(Buffer.from(svg)).resize(440, 440, { fit: 'inside' }).png().toBuffer()
}

async function main(): Promise<void> {
  // compare: source-saturation off vs on, on the pastel bouquet
  const variants: { label: string; srcSat: number; renderSat: number }[] = [
    { label: 'srcSat1.0 rndSat1.3', srcSat: 1.0, renderSat: 1.3 },
    { label: 'srcSat1.4 rndSat1.3', srcSat: 1.4, renderSat: 1.3 },
    { label: 'srcSat1.7 rndSat1.35', srcSat: 1.7, renderSat: 1.35 },
  ]
  const CW = 450, CH = 480
  const comps: sharp.OverlayOptions[] = []
  const labels: string[] = []
  let i = 0
  for (const v of variants) {
    const png = await renderVariant('ns-bouquet', 150, 150, 30, v.srcSat, v.renderSat)
    const x = (i % 3) * CW, y = Math.floor(i / 3) * CH
    comps.push({ input: png, left: x + 4, top: y + 4 })
    labels.push(`<rect x="${x}" y="${y + CH - 28}" width="${CW}" height="28" fill="#111"/><text x="${x + 6}" y="${y + CH - 9}" font-family="Arial" font-size="14" fill="#fff">${v.label}</text>`)
    i++
  }
  const ref = await sharp(resolve(S, 'caterpillar/bloom-and-grow.jpg')).resize(CW - 8, CH - 32, { fit: 'contain', background: { r: 255, g: 255, b: 255 } }).png().toBuffer()
  comps.push({ input: ref, left: 4, top: CH + 4 })
  labels.push(`<rect x="0" y="${2 * CH - 28}" width="${CW}" height="28" fill="#111"/><text x="6" y="${2 * CH - 9}" font-family="Arial" font-size="14" fill="#fff">CATERPILLAR bloom-and-grow</text>`)
  const W = 3 * CW, H = 2 * CH
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${labels.join('')}</svg>`
  const out = await sharp({ create: { width: W, height: H, channels: 3, background: { r: 255, g: 255, b: 255 } } }).composite([...comps, { input: Buffer.from(svg), left: 0, top: 0 }]).png().toBuffer()
  writeFileSync(resolve(S, 'src-sat-test.png'), out)
  console.log('wrote src-sat-test.png')
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
